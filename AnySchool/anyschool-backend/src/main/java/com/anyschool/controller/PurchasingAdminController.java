package com.anyschool.controller;

import com.anyschool.model.Order;
import com.anyschool.model.OrderStatus;
import com.anyschool.model.User;
import com.anyschool.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * PurchasingAdminController
 *
 * Endpoints for PURCHASING_ADMIN role.
 * Handles order viewing, processing, delivery tracking, and submitting to super admin for approval.
 *
 * Base path: /api/purchasing
 */
@RestController
@RequestMapping("/api/purchasing")
@PreAuthorize("hasRole('PURCHASING_ADMIN')")
@CrossOrigin(origins = "*")
public class PurchasingAdminController {

    private static final Logger log = LoggerFactory.getLogger(PurchasingAdminController.class);

    @Autowired
    private OrderRepository orderRepository;

    // ─── Helper Methods ──────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> ok(Object data, String key) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put(key, data);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> okWithMessage(Object data, String key, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put(key, data);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> notFound(String msg) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", msg);
        return ResponseEntity.status(404).body(response);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String msg) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", msg);
        return ResponseEntity.badRequest().body(response);
    }

    // ─── Order Management ──────────────────────────────────────────────────

    /**
     * GET /api/purchasing/orders
     * Returns all orders with payment status for purchasing admin to process.
     * Shows all orders regardless of status, with filters available.
     */
    @GetMapping("/orders")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean paymentComplete) {
        log.info("Purchasing Admin: listing all orders (status: {}, paymentComplete: {})", status, paymentComplete);
        
        List<Order> orders = orderRepository.findAll();
        
        // Apply filters if provided
        if (status != null && !status.isBlank()) {
            try {
                OrderStatus filterStatus = OrderStatus.valueOf(status.toUpperCase());
                orders = orders.stream()
                        .filter(o -> o.getStatus() == filterStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                return badRequest("Invalid status: " + status);
            }
        }
        
        if (paymentComplete != null) {
            orders = orders.stream()
                    .filter(o -> {
                        // Consider payment complete once approved or further in the workflow
                        boolean isPaid = o.getStatus() == OrderStatus.APPROVED
                                || o.getStatus() == OrderStatus.ACKNOWLEDGED
                                || o.getStatus() == OrderStatus.IN_PROCESS
                                || o.getStatus() == OrderStatus.FINALIZING
                                || o.getStatus() == OrderStatus.OUT_FOR_DELIVERY
                                || o.getStatus() == OrderStatus.DELIVERED
                                || o.getStatus() == OrderStatus.CLOSED;
                        return isPaid == paymentComplete;
                    })
                    .collect(Collectors.toList());
        }
        
        List<Map<String, Object>> ordersList = orders.stream()
                .map(this::sanitiseOrderForPurchasing)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", ordersList.size());
        response.put("orders", ordersList);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/purchasing/orders/{id}
     * Returns detailed information about a specific order.
     */
    @GetMapping("/orders/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable Long id) {
        log.info("Purchasing Admin: fetching order {}", id);
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        return ok(sanitiseOrderDetailed(opt.get()), "order");
    }

    /**
     * GET /api/purchasing/orders/stats
     * Returns statistics for the purchasing dashboard.
     */
    @GetMapping("/orders/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getOrderStats() {
        log.info("Purchasing Admin: fetching order statistics");
        List<Order> allOrders = orderRepository.findAll();
        
        long newOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.APPROVED)
                .count();
        
        long acknowledged = allOrders.stream()
            .filter(o -> o.getStatus() == OrderStatus.ACKNOWLEDGED)
            .count();
        
        long inProcess = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.IN_PROCESS)
                .count();
        
        long finalizing = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.FINALIZING)
                .count();
        
        long outForDelivery = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .count();
        
        long delivered = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .count();
        
        long closed = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CLOSED)
                .count();
        
        long cancelled = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CANCELLED)
                .count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("newOrders", newOrders);
        stats.put("acknowledged", acknowledged);
        stats.put("inProcess", inProcess);
        stats.put("finalizing", finalizing);
        stats.put("outForDelivery", outForDelivery);
        stats.put("delivered", delivered);
        stats.put("closed", closed);
        stats.put("cancelled", cancelled);
        stats.put("total", allOrders.size());
        
        return ok(stats, "stats");
    }

    /**
     * PUT /api/purchasing/orders/{id}/status
     * Updates the status of an order (legacy endpoint for backward compatibility).
     * Body: { "status": "IN_PROCESS", "notes": "Order being prepared" }
     * 
     * NOTE: New workflow uses specific endpoints like /acknowledge, /start-processing, etc.
     */
    @PutMapping("/orders/{id}/status")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            return badRequest("Status is required");
        }
        
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return badRequest("Invalid status: " + statusStr);
        }
        
        Order order = opt.get();
        OrderStatus oldStatus = order.getStatus();
        
        // Basic validation for new workflow
        if (newStatus == OrderStatus.IN_PROCESS && oldStatus != OrderStatus.ACKNOWLEDGED) {
            return badRequest("Can only start processing after acknowledgment");
        }
        if (newStatus == OrderStatus.FINALIZING && oldStatus != OrderStatus.IN_PROCESS) {
            return badRequest("Can only finalize after order is in process");
        }
        if (newStatus == OrderStatus.OUT_FOR_DELIVERY && oldStatus != OrderStatus.FINALIZING) {
            return badRequest("Can only send out for delivery after finalizing");
        }
        if (newStatus == OrderStatus.DELIVERED && oldStatus != OrderStatus.OUT_FOR_DELIVERY) {
            return badRequest("Can only mark delivered after out for delivery");
        }
        if (newStatus == OrderStatus.CLOSED && oldStatus != OrderStatus.DELIVERED) {
            return badRequest("Can only close after delivered");
        }
        
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        String notes = body.get("notes");
        log.info("Purchasing Admin: updated order {} status from {} to {} by {} (notes: {})",
                id, oldStatus, newStatus, currentUser.getEmail(), notes);
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Order status updated to " + newStatus
        );
    }

    /**
     * PUT /api/purchasing/orders/{id}/submit-for-approval
     * Marks an order as ready and submits it to super admin for final approval.
     * This is called when purchasing admin has completed processing and delivery.
     * Body: { "notes": "Order processed and ready for final approval" }
     */
    @PutMapping("/orders/{id}/submit-for-approval")
    @Transactional
    public ResponseEntity<Map<String, Object>> submitForApproval(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        // Validate that order is in PROCESSING status (payment complete, being prepared)
        if (order.getStatus() != OrderStatus.DELIVERED) {
            return badRequest("Can only submit orders that are DELIVERED");
        }
        
        // Mark order as final (ready for super admin approval)
        order.setIsMarkedFinal(true);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        String notes = body != null ? body.get("notes") : null;
        log.info("Purchasing Admin: order {} submitted for super admin approval by {} (notes: {})",
                id, currentUser.getEmail(), notes);
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Order submitted to Super Admin for final approval"
        );
    }

    /**
     * PUT /api/purchasing/orders/{id}/delivery-notes
     * Adds or updates delivery tracking notes for an order.
     * Body: { "notes": "Shipped via courier XYZ, tracking: 123456" }
     */
    @PutMapping("/orders/{id}/delivery-notes")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateDeliveryNotes(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        String notes = body.get("notes");
        if (notes == null || notes.isBlank()) {
            return badRequest("Delivery notes are required");
        }
        
        Order order = opt.get();
        
        // For now, we'll log the delivery notes
        // In a future database update, these could be stored in a separate field
        log.info("Purchasing Admin: delivery notes for order {} by {}: {}",
                id, currentUser.getEmail(), notes);
        
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Delivery notes recorded"
        );
    }

    /**
     * GET /api/purchasing/orders/new
     * Returns all new orders (status = APPROVED) that need acknowledgment.
     * Used for the alert system.
     */
    @GetMapping("/orders/new")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getNewOrders() {
        log.info("Purchasing Admin: fetching new orders for acknowledgment");
        
        List<Order> newOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.APPROVED)
                .collect(Collectors.toList());
        
        List<Map<String, Object>> ordersList = newOrders.stream()
                .map(this::sanitiseOrderForPurchasing)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", ordersList.size());
        response.put("orders", ordersList);
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/purchasing/orders/{id}/acknowledge
     * Acknowledges a new order (changes status from APPROVED to ACKNOWLEDGED).
     * This is step 1 in the new workflow.
     */
    @PostMapping("/orders/{id}/acknowledge")
    @Transactional
    public ResponseEntity<Map<String, Object>> acknowledgeOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        if (order.getStatus() != OrderStatus.APPROVED) {
            return badRequest("Can only acknowledge orders with APPROVED status");
        }
        
        // Change status to ACKNOWLEDGED
        order.setStatus(OrderStatus.ACKNOWLEDGED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("Purchasing Admin: order {} acknowledged by {}", id, currentUser.getEmail());
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Order acknowledged successfully"
        );
    }

    /**
     * POST /api/purchasing/orders/{id}/start-processing
     * Moves order from ACKNOWLEDGED to IN_PROCESS.
     * If order total >= R1000, it will be sent to super admin for approval first.
     */
    @PostMapping("/orders/{id}/start-processing")
    @Transactional
    public ResponseEntity<Map<String, Object>> startProcessing(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        if (order.getStatus() != OrderStatus.ACKNOWLEDGED) {
            return badRequest("Can only start processing orders with ACKNOWLEDGED status");
        }
        
        // Check order amount
        boolean needsSuperAdminApproval = order.getTotalAmount().compareTo(new java.math.BigDecimal("1000")) >= 0;
        
        if (needsSuperAdminApproval) {
            // Mark for super admin review but don't change status yet
            order.setIsMarkedFinal(true);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            
            log.info("Purchasing Admin: order {} sent to super admin (amount >= R1000) by {}", 
                    id, currentUser.getEmail());
            
            return okWithMessage(
                    sanitiseOrderForPurchasing(order),
                    "order",
                    "Order sent to Super Admin for approval (amount >= R1000)"
            );
        } else {
            // Proceed directly to IN_PROCESS
            order.setStatus(OrderStatus.IN_PROCESS);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            
            log.info("Purchasing Admin: order {} moved to IN_PROCESS by {}", id, currentUser.getEmail());
            
            return okWithMessage(
                    sanitiseOrderForPurchasing(order),
                    "order",
                    "Order moved to In Process"
            );
        }
    }

    /**
     * POST /api/purchasing/orders/{id}/verify-payment
     * Verifies payment and moves order from IN_PROCESS to FINALIZING.
     */
    @PostMapping("/orders/{id}/verify-payment")
    @Transactional
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        if (order.getStatus() != OrderStatus.IN_PROCESS) {
            return badRequest("Can only verify payment for orders with IN_PROCESS status");
        }
        
        // Move to FINALIZING
        order.setStatus(OrderStatus.FINALIZING);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("Purchasing Admin: payment verified for order {} by {}", id, currentUser.getEmail());
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Payment verified, order is being finalized"
        );
    }

    /**
     * POST /api/purchasing/orders/{id}/send-for-delivery
     * Moves order from FINALIZING to OUT_FOR_DELIVERY.
     */
    @PostMapping("/orders/{id}/send-for-delivery")
    @Transactional
    public ResponseEntity<Map<String, Object>> sendForDelivery(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        if (order.getStatus() != OrderStatus.FINALIZING) {
            return badRequest("Can only send for delivery orders with FINALIZING status");
        }
        
        // Move to OUT_FOR_DELIVERY
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        String notes = body != null ? body.get("notes") : null;
        log.info("Purchasing Admin: order {} sent for delivery by {} (notes: {})", 
                id, currentUser.getEmail(), notes);
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Order sent for delivery"
        );
    }

    /**
     * POST /api/purchasing/orders/{id}/mark-delivered
     * Marks order as DELIVERED.
     */
    @PostMapping("/orders/{id}/mark-delivered")
    @Transactional
    public ResponseEntity<Map<String, Object>> markDelivered(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            return badRequest("Can only mark delivered orders with OUT_FOR_DELIVERY status");
        }
        
        // Move to DELIVERED
        order.setStatus(OrderStatus.DELIVERED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("Purchasing Admin: order {} marked as delivered by {}", id, currentUser.getEmail());
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Order marked as delivered"
        );
    }

    /**
     * POST /api/purchasing/orders/{id}/close
     * Closes the order (final status = CLOSED).
     */
    @PostMapping("/orders/{id}/close")
    @Transactional
    public ResponseEntity<Map<String, Object>> closeOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        if (order.getStatus() != OrderStatus.DELIVERED) {
            return badRequest("Can only close orders with DELIVERED status");
        }
        
        // Move to CLOSED
        order.setStatus(OrderStatus.CLOSED);
        order.setIsMarkedFinal(true); // Finalize the order
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("Purchasing Admin: order {} closed by {}", id, currentUser.getEmail());
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Order closed successfully"
        );
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Sanitise order for purchasing list view
     */
    private Map<String, Object> sanitiseOrderForPurchasing(Order order) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", order.getId());
        m.put("orderType", order.getOrderType());
        m.put("status", order.getStatus() != null ? order.getStatus().name() : "UNKNOWN");
        m.put("totalAmount", order.getTotalAmount());
        m.put("studentGrade", order.getStudentGrade());
        m.put("studentName", order.getStudentName());
        m.put("isMarkedFinal", order.getIsMarkedFinal());
        m.put("createdAt", order.getCreatedAt());
        m.put("updatedAt", order.getUpdatedAt());
        m.put("itemCount", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
        
        // Payment plan tracking
        m.put("paymentType", order.getPaymentType());
        m.put("paymentPlanMonths", order.getPaymentPlanMonths());
        m.put("paymentsReceived", order.getPaymentsReceived() != null ? order.getPaymentsReceived() : 0);
        m.put("monthlyInstalment", order.getMonthlyInstalment());
        
        // Payment status indicator
        boolean paymentComplete = order.getStatus() == OrderStatus.APPROVED
            || order.getStatus() == OrderStatus.ACKNOWLEDGED
            || order.getStatus() == OrderStatus.IN_PROCESS
            || order.getStatus() == OrderStatus.FINALIZING
            || order.getStatus() == OrderStatus.OUT_FOR_DELIVERY
            || order.getStatus() == OrderStatus.DELIVERED
            || order.getStatus() == OrderStatus.CLOSED;
        m.put("paymentComplete", paymentComplete);
        
        // Approval status
        m.put("awaitingApproval", order.getStatus() == OrderStatus.PENDING);
        
        // User info
        if (order.getUser() != null) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", order.getUser().getId());
            userInfo.put("fullName", order.getUser().getFullName());
            userInfo.put("email", order.getUser().getEmail());
            userInfo.put("phoneNumber", order.getUser().getPhoneNumber());
            m.put("user", userInfo);
        }
        
        // School info
        if (order.getSchool() != null) {
            Map<String, Object> schoolInfo = new HashMap<>();
            schoolInfo.put("id", order.getSchool().getId());
            schoolInfo.put("name", order.getSchool().getName());
            schoolInfo.put("province", order.getSchool().getProvince());
            schoolInfo.put("district", order.getSchool().getDistrict());
            m.put("school", schoolInfo);
        } else if (order.getRequestedSchoolName() != null) {
            Map<String, Object> schoolInfo = new HashMap<>();
            schoolInfo.put("name", order.getRequestedSchoolName());
            schoolInfo.put("requested", true);
            m.put("school", schoolInfo);
        }
        
        return m;
    }

    /**
     * Sanitise order for detailed view with items
     */
    private Map<String, Object> sanitiseOrderDetailed(Order order) {
        Map<String, Object> m = sanitiseOrderForPurchasing(order);
        
        // Add order items
        List<Map<String, Object>> items = order.getOrderItems().stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.getId());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("price", item.getPrice());
                    itemMap.put("subtotal", item.getSubtotal());
                    
                    if (item.getStationery() != null) {
                        Map<String, Object> stationeryInfo = new HashMap<>();
                        stationeryInfo.put("id", item.getStationery().getId());
                        stationeryInfo.put("name", item.getStationery().getName());
                        stationeryInfo.put("category", item.getStationery().getCategory());
                        stationeryInfo.put("description", item.getStationery().getDescription());
                        itemMap.put("stationery", stationeryInfo);
                    }
                    
                    return itemMap;
                })
                .collect(Collectors.toList());
        
        m.put("items", items);
        
        return m;
    }

    // ─── Payment Tracking ──────────────────────────────────────────────────

    /**
     * POST /api/purchasing/orders/{id}/return
     * Return order to user due to payment failure.
     * Changes status from PENDING to RETURNED.
     */
    @PostMapping("/orders/{id}/return")
    @Transactional
    public ResponseEntity<Map<String, Object>> returnOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        if (order.getStatus() != OrderStatus.PENDING) {
            return badRequest("Can only return orders with PENDING status");
        }
        
        String reason = body != null ? body.get("reason") : "Payment not received";
        
        // Change status to RETURNED
        order.setStatus(OrderStatus.RETURNED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        log.info("Purchasing Admin: order {} returned to user by {}. Reason: {}", id, currentUser.getEmail(), reason);
        
        return okWithMessage(
                sanitiseOrderForPurchasing(order),
                "order",
                "Order returned to user: " + reason
        );
    }

    /**
     * POST /api/purchasing/orders/{id}/mark-payment
     * Mark next installment payment as received for payment plan orders.
     * Increments paymentsReceived counter.
     * When all payments received, moves order to APPROVED status.
     */
    @PostMapping("/orders/{id}/mark-payment")
    @Transactional
    public ResponseEntity<Map<String, Object>> markPaymentReceived(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return notFound("Order not found");
        }
        
        Order order = opt.get();
        
        // Verify this is a payment plan order
        if (!"PAYMENT_PLAN".equals(order.getPaymentType())) {
            return badRequest("This order is not a payment plan order");
        }
        
        // Verify order is in PENDING status
        if (order.getStatus() != OrderStatus.PENDING) {
            return badRequest("Can only mark payments for orders with PENDING status");
        }
        
        Integer paymentsReceived = order.getPaymentsReceived() != null ? order.getPaymentsReceived() : 0;
        Integer totalPayments = order.getPaymentPlanMonths();
        
        if (totalPayments == null || totalPayments == 0) {
            return badRequest("Payment plan months not configured for this order");
        }
        
        if (paymentsReceived >= totalPayments) {
            return badRequest("All payments already received for this order");
        }
        
        // Increment payments received
        paymentsReceived++;
        order.setPaymentsReceived(paymentsReceived);
        order.setUpdatedAt(LocalDateTime.now());
        
        // If all payments received, move to APPROVED status
        if (paymentsReceived.equals(totalPayments)) {
            order.setStatus(OrderStatus.APPROVED);
            log.info("Purchasing Admin: all {} payments received for order {} by {}. Moving to APPROVED", 
                    totalPayments, id, currentUser.getEmail());
        } else {
            log.info("Purchasing Admin: payment {}/{} marked as received for order {} by {}", 
                    paymentsReceived, totalPayments, id, currentUser.getEmail());
        }
        
        orderRepository.save(order);
        
        Map<String, Object> responseData = sanitiseOrderForPurchasing(order);
        responseData.put("paymentsReceived", paymentsReceived);
        responseData.put("totalPayments", totalPayments);
        responseData.put("allPaymentsReceived", paymentsReceived.equals(totalPayments));
        
        String message = paymentsReceived.equals(totalPayments) 
            ? "Final payment received. Order moved to APPROVED status."
            : String.format("Payment %d/%d marked as received", paymentsReceived, totalPayments);
        
        return okWithMessage(responseData, "order", message);
    }
}
