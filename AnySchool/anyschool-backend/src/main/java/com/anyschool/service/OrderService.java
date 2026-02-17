package com.anyschool.service;

import com.anyschool.dto.CreateOrderRequest;
import com.anyschool.model.*;
import com.anyschool.repository.OrderRepository;
import com.anyschool.repository.SchoolRepository;
import com.anyschool.repository.StationeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Order Service
 * 
 * Handles business logic for orders:
 * - Create orders
 * - Retrieve user orders
 * - Validate order data
 * 
 * Phase 4: Order creation for parents
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final SchoolRepository schoolRepository;
    private final StationeryRepository stationeryRepository;

    /**
     * Create a new order
     * 
     * @param user User placing the order
     * @param request Order details
     * @return Created order
     */
    @Transactional
    public Order createOrder(User user, CreateOrderRequest request) {
        log.info("Creating order for user: {}", user.getEmail());
        log.info("Order details - SchoolId: {}, RequestedSchool: {}, Type: {}, Grade: {}, Name: {}, Items: {}", 
            request.getSchoolId(),
            request.getRequestedSchoolName(),
            request.getOrderType(), 
            request.getStudentGrade(), 
            request.getStudentName(),
            request.getItems() != null ? request.getItems().size() : 0);

        // Validate request
        validateOrderRequest(request, user);

        // Find school if schoolId provided, otherwise use null
        School school = null;
        if (request.getSchoolId() != null) {
            school = schoolRepository.findById(request.getSchoolId())
                    .orElseThrow(() -> new IllegalArgumentException("School not found with id: " + request.getSchoolId()));
        }

        // Calculate payment plan details
        LocalDateTime now = LocalDateTime.now();
        Integer orderMonth = now.getMonthValue();
        Integer paymentPlanMonths = null;
        LocalDateTime firstDebitDate = null;
        LocalDateTime lastDebitDate = null;

        // Only calculate payment plan if paymentType is PAYMENT_PLAN
        if ("PAYMENT_PLAN".equals(request.getPaymentType())) {
            // Calculate months from next month to November (inclusive)
            // Example: Order in February (month 2), payment starts March (3) to November (11) = 9 months
            int startMonth = orderMonth + 1; // Start from next month
            int endMonth = 11; // November
            
            if (startMonth > endMonth) {
                throw new IllegalArgumentException("Cannot create payment plan - order too late in the year");
            }
            
            paymentPlanMonths = endMonth - startMonth + 1;
            
            // Calculate first and last debit dates
            int debitDay = request.getDebitOrderDay() != null ? request.getDebitOrderDay() : 15;
            int currentYear = now.getYear();
            
            // Payments are always made in the current year, regardless of academic year
            int paymentYear = currentYear;
            
            // Handle last day of month (31 = last day)
            int firstDay = debitDay == 31 ? 
                LocalDateTime.of(paymentYear, startMonth, 1, 0, 0).toLocalDate().lengthOfMonth() : 
                Math.min(debitDay, LocalDateTime.of(paymentYear, startMonth, 1, 0, 0).toLocalDate().lengthOfMonth());
            int lastDay = debitDay == 31 ? 
                LocalDateTime.of(paymentYear, endMonth, 1, 0, 0).toLocalDate().lengthOfMonth() : 
                Math.min(debitDay, LocalDateTime.of(paymentYear, endMonth, 1, 0, 0).toLocalDate().lengthOfMonth());
            
            firstDebitDate = LocalDateTime.of(paymentYear, startMonth, firstDay, 0, 0);
            lastDebitDate = LocalDateTime.of(paymentYear, endMonth, lastDay, 0, 0);
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .school(school)  // May be null if school not yet approved
                .requestedSchoolName(request.getRequestedSchoolName() != null ? request.getRequestedSchoolName().trim() : null)
                .orderType(request.getOrderType())
                .childId(request.getChildId())  // Link to child profile
                .studentGrade(request.getStudentGrade() != null ? request.getStudentGrade().trim() : null)
                .studentName(request.getStudentName() != null ? request.getStudentName().trim() : null)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .academicYear(request.getAcademicYear())
                .paymentType(request.getPaymentType())
                .orderMonth(orderMonth)
                .paymentPlanMonths(paymentPlanMonths)
                .debitOrderDay(request.getDebitOrderDay())
                .firstDebitDate(firstDebitDate)
                .lastDebitDate(lastDebitDate)
                .build();

        // Add order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            // Find stationery
            Stationery stationery = stationeryRepository.findById(itemRequest.getStationeryId())
                    .orElseThrow(() -> new IllegalArgumentException("Stationery not found with id: " + itemRequest.getStationeryId()));

            // Create order item
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .stationery(stationery)
                    .quantity(itemRequest.getQuantity())
                    .price(stationery.getPrice())
                    .build();

            // Calculate subtotal
            orderItem.calculateSubtotal();
            
            // Add to order
            order.addOrderItem(orderItem);
            
            // Add to total
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }

        // Set total amount
        order.setTotalAmount(totalAmount);

        // Calculate monthly instalment if payment plan
        if ("PAYMENT_PLAN".equals(request.getPaymentType()) && paymentPlanMonths != null && paymentPlanMonths > 0) {
            BigDecimal monthlyInstalment = totalAmount.divide(
                BigDecimal.valueOf(paymentPlanMonths), 
                2, 
                RoundingMode.HALF_UP
            );
            order.setMonthlyInstalment(monthlyInstalment);
            log.info("Payment plan: {} months, R{} per month", paymentPlanMonths, monthlyInstalment);
        }

        // Save order
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order created successfully with id: {} for total: R{} (Academic Year: {}, Payment Type: {})", 
                savedOrder.getId(), totalAmount, request.getAcademicYear(), request.getPaymentType());
        
        return savedOrder;
    }

    /**
     * Validate order request
     * 
     * For SCHOOL_ADMIN users: student details are not required (ordering for school)
     * For PARENT/other users: student grade and name are required for PURCHASE orders
     */
    private void validateOrderRequest(CreateOrderRequest request, User user) {
        // Check school ID OR requested school name
        if (request.getSchoolId() == null && 
            (request.getRequestedSchoolName() == null || request.getRequestedSchoolName().trim().isEmpty())) {
            throw new IllegalArgumentException("Either school ID or requested school name is required");
        }

        // Check order type first
        if (request.getOrderType() == null || request.getOrderType().trim().isEmpty()) {
            throw new IllegalArgumentException("Order type is required");
        }

        // Check academic year
        if (request.getAcademicYear() == null || request.getAcademicYear().trim().isEmpty()) {
            throw new IllegalArgumentException("Academic year is required");
        }

        // Check payment type
        if (request.getPaymentType() == null || request.getPaymentType().trim().isEmpty()) {
            throw new IllegalArgumentException("Payment type is required");
        }

        // Validate payment type
        String paymentType = request.getPaymentType().trim().toUpperCase();
        if (!paymentType.equals("IMMEDIATE") && !paymentType.equals("PAYMENT_PLAN")) {
            throw new IllegalArgumentException("Payment type must be IMMEDIATE or PAYMENT_PLAN");
        }

        // If payment plan, debit order day is required
        if ("PAYMENT_PLAN".equals(paymentType)) {
            if (request.getDebitOrderDay() == null) {
                throw new IllegalArgumentException("Debit order day is required for payment plan");
            }
            if (request.getDebitOrderDay() < 1 || request.getDebitOrderDay() > 31) {
                throw new IllegalArgumentException("Debit order day must be between 1 and 31");
            }
        }

        String orderType = request.getOrderType().trim().toUpperCase();

        // Student info only required for PURCHASE orders by non-SCHOOL_ADMIN users
        // School admins don't need to provide student details (ordering for school, not specific students)
        if ("PURCHASE".equals(orderType) && !UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            // Check student grade
            if (request.getStudentGrade() == null || request.getStudentGrade().trim().isEmpty()) {
                throw new IllegalArgumentException("Student grade is required for purchase orders");
            }

            // Check student name
            if (request.getStudentName() == null || request.getStudentName().trim().isEmpty()) {
                throw new IllegalArgumentException("Student name is required for purchase orders");
            }
        }

        // Check items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // Validate each item
        for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
            if (item.getStationeryId() == null) {
                throw new IllegalArgumentException("Stationery ID is required for all items");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0");
            }
        }
    }

    /**
     * Get all orders for a user
     */
    public List<Order> getUserOrders(User user) {
        log.info("Fetching orders for user: {}", user.getEmail());
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get order by ID
     */
    public Order getOrderById(Long orderId) {
        log.info("Fetching order with id: {}", orderId);
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
    }

    /**
     * Update order status
     * 
     * @param orderId Order ID
     * @param newStatus New status
     * @param paymentReference Payment reference (optional)
     * @return Updated order
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus, String paymentReference) {
        log.info("Updating order {} status to {}", orderId, newStatus);

        // Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        // Update status
        order.setStatus(newStatus);

        // Auto-finalize order when completed or closed
        // Once completed/closed, order should not be editable by parents
        if ((newStatus == OrderStatus.CLOSED || newStatus == OrderStatus.DELIVERED) && !order.getIsMarkedFinal()) {
            order.setIsMarkedFinal(true);
            log.info("Order {} automatically finalized on completion", orderId);
        }

        // Save order
        Order updatedOrder = orderRepository.save(order);

        log.info("Order {} status updated to {}", orderId, newStatus);

        return updatedOrder;
    }

    /**
     * Get all donations for a user
     * 
     * @param user User (donor)
     * @return List of donations
     */
    public List<Order> getDonations(User user) {
        log.info("Fetching donations for user: {}", user.getEmail());
        return orderRepository.findByUserAndOrderTypeOrderByCreatedAtDesc(user, "DONATION");
    }

    /**
     * Get donation statistics for a user
     * 
     * @param user User (donor)
     * @return Map with statistics
     */
    public Map<String, Object> getDonationStats(User user) {
        log.info("Calculating donation stats for user: {}", user.getEmail());

        List<Order> donations = orderRepository.findByUserAndOrderTypeOrderByCreatedAtDesc(user, "DONATION");

        // Calculate total donated
        BigDecimal totalDonated = donations.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count unique schools helped (filter out null schools from requested donations)
        long schoolsHelped = donations.stream()
                .map(Order::getSchool)
                .filter(java.util.Objects::nonNull)
                .map(School::getId)
                .distinct()
                .count();

        // Count total donations
        long totalDonations = donations.size();

        // Count by status
        long completedDonations = donations.stream()
                .filter(order -> OrderStatus.CLOSED.equals(order.getStatus()) 
                    || OrderStatus.DELIVERED.equals(order.getStatus()))
                .count();

        long processingDonations = donations.stream()
            .filter(order -> order.getStatus() == OrderStatus.APPROVED
                || order.getStatus() == OrderStatus.ACKNOWLEDGED
                || order.getStatus() == OrderStatus.IN_PROCESS
                || order.getStatus() == OrderStatus.FINALIZING
                || order.getStatus() == OrderStatus.OUT_FOR_DELIVERY
                || order.getStatus() == OrderStatus.DELIVERED)
            .count();

        long pendingDonations = donations.stream()
                .filter(order -> OrderStatus.PENDING.equals(order.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDonated", totalDonated);
        stats.put("schoolsHelped", schoolsHelped);
        stats.put("totalDonations", totalDonations);
        stats.put("completedDonations", completedDonations);
        stats.put("processingDonations", processingDonations);
        stats.put("pendingDonations", pendingDonations);

        return stats;
    }

    /**
     * Get all orders for a school
     * 
     * @param schoolId School ID
     * @return List of orders
     */
    public List<Order> getSchoolOrders(Long schoolId) {
        log.info("Fetching orders for school: {}", schoolId);
        return orderRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);
    }

    /**
     * Get school statistics
     * 
     * @param schoolId School ID
     * @return Map with statistics
     */
    public Map<String, Object> getSchoolStats(Long schoolId) {
        log.info("Calculating stats for school: {}", schoolId);

        List<Order> allOrders = orderRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);
        List<Order> purchases = orderRepository.findBySchoolIdAndOrderTypeOrderByCreatedAtDesc(schoolId, "PURCHASE");
        List<Order> donations = orderRepository.findBySchoolIdAndOrderTypeOrderByCreatedAtDesc(schoolId, "DONATION");

        // Calculate total revenue (all orders)
        BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate purchase revenue
        BigDecimal purchaseRevenue = purchases.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate donation revenue
        BigDecimal donationRevenue = donations.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count total orders
        long totalOrders = allOrders.size();
        long totalPurchases = purchases.size();
        long totalDonations = donations.size();

        // Count by status
        long completedOrders = allOrders.stream()
                .filter(order -> OrderStatus.CLOSED.equals(order.getStatus())
                    || OrderStatus.DELIVERED.equals(order.getStatus()))
                .count();

        long processingOrders = allOrders.stream()
            .filter(order -> order.getStatus() == OrderStatus.APPROVED
                || order.getStatus() == OrderStatus.ACKNOWLEDGED
                || order.getStatus() == OrderStatus.IN_PROCESS
                || order.getStatus() == OrderStatus.FINALIZING
                || order.getStatus() == OrderStatus.OUT_FOR_DELIVERY
                || order.getStatus() == OrderStatus.DELIVERED)
            .count();

        long pendingOrders = allOrders.stream()
                .filter(order -> OrderStatus.PENDING.equals(order.getStatus()))
                .count();

        // Count unique donors
        long uniqueDonors = donations.stream()
                .map(order -> order.getUser().getId())
                .distinct()
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("purchaseRevenue", purchaseRevenue);
        stats.put("donationRevenue", donationRevenue);
        stats.put("totalOrders", totalOrders);
        stats.put("totalPurchases", totalPurchases);
        stats.put("totalDonations", totalDonations);
        stats.put("completedOrders", completedOrders);
        stats.put("processingOrders", processingOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("uniqueDonors", uniqueDonors);

        return stats;
    }

    /**
     * Remove an order item from an order
     * 
     * @param orderId Order ID
     * @param itemId Item ID to remove
     * @return Updated order
     */
    @Transactional
    public Order removeOrderItem(Long orderId, Long itemId) {
        log.info("Removing item {} from order {}", itemId, orderId);

        // Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        // Find and remove the item
        var itemToRemove = order.getOrderItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst();

        if (itemToRemove.isEmpty()) {
            throw new IllegalArgumentException("Item not found in order");
        }

        // Remove item and recalculate total
        order.removeOrderItem(itemToRemove.get());
        
        // Recalculate total amount
        BigDecimal newTotal = order.getOrderItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(newTotal);

        // Save and return
        return orderRepository.save(order);
    }

    /**
     * Update order item quantity
     * 
     * @param orderId Order ID
     * @param itemId Item ID to update
     * @param quantity New quantity
     * @return Updated order
     */
    @Transactional
    public Order updateOrderItemQuantity(Long orderId, Long itemId, Integer quantity) {
        log.info("Updating item {} quantity to {} in order {}", itemId, quantity, orderId);

        // Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        // Find and update the item
        var itemToUpdate = order.getOrderItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst();

        if (itemToUpdate.isEmpty()) {
            throw new IllegalArgumentException("Item not found in order");
        }

        // Update quantity and recalculate subtotal
        itemToUpdate.get().setQuantity(quantity);
        itemToUpdate.get().calculateSubtotal();
        
        // Recalculate total amount
        BigDecimal newTotal = order.getOrderItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(newTotal);

        // Save and return
        return orderRepository.save(order);
    }

    /**
     * Mark order as final (school admin only)
     * 
     * @param orderId Order ID
     * @return Updated order
     */
    @Transactional
    public Order markOrderAsFinal(Long orderId) {
        log.info("Marking order {} as final", orderId);

        // Find order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        // Mark as final
        order.setIsMarkedFinal(true);

        // Save and return
        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} marked as final", orderId);
        
        return updatedOrder;
    }
}