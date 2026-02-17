package com.anyoffice.service;

import com.anyoffice.dto.CreateOrderRequest;
import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.*;
import com.anyoffice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfficeOrderService {

    private static final BigDecimal AUTO_APPROVE_THRESHOLD = new BigDecimal("5000");
    private static final BigDecimal DEPT_MANAGER_THRESHOLD = new BigDecimal("20000");
    private static final BigDecimal PROCUREMENT_THRESHOLD = new BigDecimal("50000");
    private static final BigDecimal VAT_RATE = new BigDecimal("0.15");

    private final OfficeOrderRepository orderRepository;
    private final OfficeOrderItemRepository orderItemRepository;
    private final ApprovalWorkflowRepository workflowRepository;
    private final StationeryRepository stationeryRepository;
    private final OfficeUserRepository userRepository;
    private final BudgetService budgetService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    private String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%05d", secureRandom.nextInt(100000));
        String candidate = "ORD-" + date + "-" + random;
        // Retry once on collision (very rare)
        if (orderRepository.findByOrderNumber(candidate).isPresent()) {
            random = String.format("%05d", secureRandom.nextInt(100000));
            candidate = "ORD-" + date + "-" + random;
        }
        return candidate;
    }

    @Transactional
    public OfficeOrder createOrder(OfficeUser user, CreateOrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // Build order
        OfficeOrder order = new OfficeOrder();
        order.setOrderNumber(generateOrderNumber());
        order.setUserId(user.getId());
        order.setCompanyId(user.getCompanyId());
        order.setDepartmentId(req.getDepartmentId() != null ? req.getDepartmentId() : user.getDepartmentId());
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(req.getShippingAddress());
        order.setDeliveryNotes(req.getDeliveryNotes());
        order.setPriority(req.getPriority() != null ? req.getPriority() : "MEDIUM");
        order.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "COMPANY_ACCOUNT");
        order.setPaymentStatus(PaymentStatus.PENDING);

        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        OfficeOrder savedOrder = orderRepository.save(order);

        for (CreateOrderRequest.OrderItemRequest itemReq : req.getItems()) {
            Stationery stationery = stationeryRepository.findById(itemReq.getStationeryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getStationeryId()));
            if (!Boolean.TRUE.equals(stationery.getAvailable())) {
                throw new IllegalArgumentException("Product is not available: " + stationery.getName());
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0");
            }

            BigDecimal unitPrice = stationery.getPrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OfficeOrderItem item = new OfficeOrderItem();
            item.setOrder(savedOrder);
            item.setStationeryId(stationery.getId());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setDiscount(BigDecimal.ZERO);
            item.setSubtotal(itemSubtotal);
            item.setNotes(itemReq.getNotes());
            orderItemRepository.save(item);

            subtotal = subtotal.add(itemSubtotal);
        }

        BigDecimal taxAmount = subtotal.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(taxAmount);

        savedOrder.setTotalAmount(subtotal);
        savedOrder.setTaxAmount(taxAmount);
        savedOrder.setShippingCost(BigDecimal.ZERO);
        savedOrder.setGrandTotal(grandTotal);

        // Determine approval tier using BigDecimal.compareTo()
        if (grandTotal.compareTo(AUTO_APPROVE_THRESHOLD) < 0) {
            savedOrder.setStatus(OfficeOrderStatus.APPROVED);
            savedOrder.setApprovedAt(LocalDateTime.now());
            log.info("Order {} auto-approved (amount: {})", savedOrder.getOrderNumber(), grandTotal);
        } else {
            savedOrder.setStatus(OfficeOrderStatus.PENDING_APPROVAL);
            createApprovalWorkflow(savedOrder, user, grandTotal);
        }

        OfficeOrder finalOrder = orderRepository.save(savedOrder);

        // Update budget spend for approved orders
        if (finalOrder.getStatus() == OfficeOrderStatus.APPROVED) {
            budgetService.updateSpend(user.getCompanyId(), finalOrder.getDepartmentId(), grandTotal);
        }

        log.info("Order created: {} by {} for R{}", finalOrder.getOrderNumber(), user.getEmail(), grandTotal);
        return finalOrder;
    }

    private void createApprovalWorkflow(OfficeOrder order, OfficeUser requester, BigDecimal amount) {
        OfficeUserRole requiredRole;
        if (amount.compareTo(DEPT_MANAGER_THRESHOLD) < 0) {
            requiredRole = OfficeUserRole.DEPARTMENT_MANAGER;
        } else if (amount.compareTo(PROCUREMENT_THRESHOLD) < 0) {
            requiredRole = OfficeUserRole.PROCUREMENT_OFFICER;
        } else {
            requiredRole = OfficeUserRole.COMPANY_ADMIN;
        }

        // Find appropriate approver in the same company
        List<OfficeUser> approvers = userRepository.findByCompanyIdAndRole(requester.getCompanyId(), requiredRole);
        Long approverId = approvers.isEmpty() ? null : approvers.get(0).getId();

        ApprovalWorkflow workflow = new ApprovalWorkflow();
        workflow.setOrderId(order.getId());
        workflow.setRequesterId(requester.getId());
        workflow.setApproverId(approverId);
        workflow.setLevel(1);
        workflow.setStatus("PENDING");
        workflowRepository.save(workflow);

        // Notify approver if found
        if (approverId != null) {
            OfficeUser approver = approvers.get(0);
            emailService.sendApprovalRequestEmail(
                    approver.getEmail(),
                    approver.getFirstName(),
                    requester.getFirstName() + " " + requester.getLastName(),
                    order.getOrderNumber(),
                    amount.setScale(2, RoundingMode.HALF_UP).toString()
            );
        }
    }

    @Transactional(readOnly = true)
    public List<OfficeOrder> getOrdersForUser(OfficeUser user) {
        switch (user.getRole()) {
            case SUPER_ADMIN:
                return orderRepository.findAll();
            case COMPANY_ADMIN:
            case PROCUREMENT_OFFICER:
                return orderRepository.findByCompanyIdOrderByCreatedAtDesc(user.getCompanyId());
            case DEPARTMENT_MANAGER:
                if (user.getDepartmentId() != null) {
                    return orderRepository.findByDepartmentIdOrderByCreatedAtDesc(user.getDepartmentId());
                }
                return orderRepository.findByCompanyIdOrderByCreatedAtDesc(user.getCompanyId());
            default:
                return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
    }

    @Transactional(readOnly = true)
    public OfficeOrder getOrderById(Long id, OfficeUser caller) {
        OfficeOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        // Access control
        if (caller.getRole() == OfficeUserRole.SUPER_ADMIN) return order;
        if (!order.getCompanyId().equals(caller.getCompanyId())) {
            throw new IllegalArgumentException("Access denied");
        }
        if (caller.getRole() == OfficeUserRole.EMPLOYEE && !order.getUserId().equals(caller.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        return order;
    }

    @Transactional
    public OfficeOrder updateOrderStatus(Long id, String statusStr, String rejectionReason, OfficeUser caller) {
        OfficeOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        OfficeOrderStatus newStatus = OfficeOrderStatus.valueOf(statusStr.toUpperCase());
        order.setStatus(newStatus);
        if (rejectionReason != null) {
            order.setRejectionReason(rejectionReason);
        }
        if (newStatus == OfficeOrderStatus.DELIVERED) {
            order.setActualDeliveryDate(LocalDate.now());
        }
        return orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long id, OfficeUser caller) {
        OfficeOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getStatus() != OfficeOrderStatus.PENDING_APPROVAL) {
            throw new IllegalArgumentException("Only orders pending approval can be cancelled");
        }
        if (!order.getUserId().equals(caller.getId()) &&
                caller.getRole() != OfficeUserRole.COMPANY_ADMIN &&
                caller.getRole() != OfficeUserRole.SUPER_ADMIN) {
            throw new IllegalArgumentException("Access denied");
        }
        order.setStatus(OfficeOrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Order {} cancelled by {}", order.getOrderNumber(), caller.getEmail());
    }
}
