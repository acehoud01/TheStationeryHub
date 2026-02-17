package com.anyschool.controller;

import com.anyschool.dto.CreateOrderRequest;
import com.anyschool.dto.UpdateOrderStatusRequest;
import com.anyschool.model.Order;
import com.anyschool.model.OrderStatus;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Order Controller
 * 
 * REST endpoints for managing orders.
 * 
 * Endpoints:
 * - POST /api/orders - Create new order
 * - GET /api/orders - Get user's orders
 * - GET /api/orders/{id} - Get single order
 * 
 * Phase 4: Order creation for parents
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    /**
     * Create a new order
     * 
     * POST /api/orders
     * 
     * Requires authentication.
     * 
     * Request body:
     * {
     *   "schoolId": 1,
     *   "studentGrade": "5",
     *   "studentName": "John Doe",
     *   "orderType": "PURCHASE",
     *   "items": [
     *     { "stationeryId": 1, "quantity": 2 },
     *     { "stationeryId": 3, "quantity": 1 }
     *   ]
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Order created successfully",
     *   "order": {
     *     "id": 1,
     *     "orderType": "PURCHASE",
     *     "studentGrade": "5",
     *     "studentName": "John Doe",
     *     "totalAmount": 159.99,
     *     "status": "PENDING",
     *     "itemCount": 3
     *   }
     * }
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal User user,
            @RequestBody CreateOrderRequest request
    ) {
        log.info("Create order request from user: {}", user.getEmail());

        // Create order
        Order order = orderService.createOrder(user, request);

        // Build response
        Map<String, Object> orderInfo = new HashMap<>();
        orderInfo.put("id", order.getId());
        orderInfo.put("orderType", order.getOrderType());
        orderInfo.put("studentGrade", order.getStudentGrade());
        orderInfo.put("studentName", order.getStudentName());
        orderInfo.put("totalAmount", order.getTotalAmount());
        orderInfo.put("status", order.getStatus().name());
        orderInfo.put("itemCount", order.getOrderItems().size());
        orderInfo.put("createdAt", order.getCreatedAt());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order created successfully");
        response.put("order", orderInfo);

        log.info("Order created successfully: {}", order.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all orders for the authenticated user
     * 
     * GET /api/orders
     * 
     * Requires authentication.
     * 
     * Response:
     * {
     *   "success": true,
     *   "count": 5,
     *   "orders": [...]
     * }
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getUserOrders(
            @AuthenticationPrincipal User user
    ) {
        log.info("Get orders request from user: {}", user.getEmail());

        List<Order> orders = orderService.getUserOrders(user);

        // Convert to response format
        List<Map<String, Object>> ordersList = orders.stream()
                .map(this::convertOrderToMap)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", ordersList.size());
        response.put("orders", ordersList);

        return ResponseEntity.ok(response);
    }

    /**
     * Get a single order by ID
     * 
     * GET /api/orders/{id}
     * 
     * Requires authentication.
     * 
     * Response:
     * {
     *   "success": true,
     *   "order": {...}
     * }
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        log.info("Get order {} request from user: {}", id, user.getEmail());

        Order order = orderService.getOrderById(id);

        // Verify the order belongs to the user
        if (!order.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to access order {} belonging to another user", user.getId(), id);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Access denied");
            return ResponseEntity.status(403).body(errorResponse);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", convertOrderToDetailedMap(order));

        return ResponseEntity.ok(response);
    }

    /**
     * Update order status
     * 
     * PUT /api/orders/{id}/status
     * 
     * Requires authentication.
     * User must own the order.
     * Used after payment processing to update status.
     * For school admin orders: status changes from PENDING → APPROVED after payment
     * 
     * Request body:
     * {
     *   "status": "APPROVED",
     *   "paymentReference": "PAYMENT-12345" (optional)
     * }
     * 
     * Valid statuses: PENDING, APPROVED, DECLINED, PURCHASE_IN_PROGRESS, 
     *                 PACKAGED, OUT_FOR_DELIVERY, DELIVERED, COMPLETED, CANCELLED
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Order status updated successfully",
     *   "order": {...}
     * }
     */
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        log.info("Update order {} status request from user: {}", id, user.getEmail());
        log.info("Request data - status: {}, paymentReference: {}", request.getStatus(), request.getPaymentReference());

        // Get order
        Order order = orderService.getOrderById(id);

        // Check if user owns the order
        if (!order.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to update order {} belonging to another user", user.getId(), id);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Access denied");
            return ResponseEntity.status(403).body(errorResponse);
        }

        // Validate and parse status
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            log.warn("Status is null or empty");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Status is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid order status: {}", request.getStatus());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Invalid status. Must be one of: PENDING, APPROVED, ACKNOWLEDGED, IN_PROCESS, FINALIZING, OUT_FOR_DELIVERY, DELIVERED, CLOSED, DECLINED, CANCELLED");
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (NullPointerException e) {
            log.warn("Status is null");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Status is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Update order status
        Order updatedOrder = orderService.updateOrderStatus(id, newStatus, request.getPaymentReference());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order status updated successfully");
        response.put("order", convertOrderToMap(updatedOrder));

        log.info("Order {} status updated to {}", id, newStatus);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all donations for the authenticated donor
     * 
     * GET /api/orders/donations
     * 
     * Requires authentication.
     * Only returns DONATION orders.
     * 
     * Response:
     * {
     *   "success": true,
     *   "count": 5,
     *   "donations": [...]
     * }
     */
    @GetMapping("/donations")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getDonations(
            @AuthenticationPrincipal User user
    ) {
        log.info("Get donations request from user: {}", user.getEmail());

        List<Order> donations = orderService.getDonations(user);

        // Convert to response format
        List<Map<String, Object>> donationsList = donations.stream()
                .map(this::convertOrderToMap)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", donationsList.size());
        response.put("donations", donationsList);

        return ResponseEntity.ok(response);
    }

    /**
     * Get donation statistics for the authenticated donor
     * 
     * GET /api/orders/stats
     * 
     * Requires authentication.
     * 
     * Response:
     * {
     *   "success": true,
     *   "stats": {
     *     "totalDonated": 1299.99,
     *     "schoolsHelped": 3,
     *     "totalDonations": 5,
     *     "completedDonations": 3,
     *     "processingDonations": 1,
     *     "pendingDonations": 1
     *   }
     * }
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDonationStats(
            @AuthenticationPrincipal User user
    ) {
        log.info("Get donation stats request from user: {}", user.getEmail());

        Map<String, Object> stats = orderService.getDonationStats(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", stats);

        return ResponseEntity.ok(response);
    }

    /**
     * Get all orders for a specific school
     * 
     * GET /api/orders/school/{schoolId}
     * 
     * Requires authentication and SCHOOL_ADMIN role.
     * Verifies that the school admin owns the school.
     * 
     * Response:
     * {
     *   "success": true,
     *   "count": 10,
     *   "orders": [...]
     * }
     */
    @GetMapping("/school/{schoolId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getSchoolOrders(
            @PathVariable Long schoolId,
            @AuthenticationPrincipal User user
    ) {
        log.info("Get school orders request for school {} from user: {}", schoolId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            log.warn("User {} is not a school admin", user.getEmail());
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden: Only school admins can access this"));
        }

        // Verify school admin owns the school
        if (user.getSchoolId() == null || !user.getSchoolId().equals(schoolId)) {
            log.warn("User {} does not own school {}", user.getEmail(), schoolId);
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden: You can only access your own school's orders"));
        }

        List<Order> orders = orderService.getSchoolOrders(schoolId);

        // Convert to response format
        List<Map<String, Object>> ordersList = orders.stream()
                .map(this::convertOrderToMap)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", ordersList.size());
        response.put("orders", ordersList);

        return ResponseEntity.ok(response);
    }

    /**
     * Delete an order item from an order
     * 
     * DELETE /api/orders/{orderId}/items/{itemId}
     * 
     * Requires authentication.
     * User must own the order and order must not be marked final.
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Item removed successfully",
     *   "order": {...}
     * }
     */
    @DeleteMapping("/{orderId}/items/{itemId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeOrderItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @PathVariable Long itemId
    ) {
        log.info("Remove item {} from order {} by user: {}", itemId, orderId, user.getEmail());

        // Get order
        Order order = orderService.getOrderById(orderId);

        // Check ownership
        if (!order.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to modify order {} belonging to another user", user.getId(), orderId);
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
        }

        // Check if marked final
        if (order.getIsMarkedFinal()) {
            log.warn("User {} attempted to modify finalized order {}", user.getId(), orderId);
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Cannot modify a finalized order"));
        }

        // Remove item and update order
        Order updatedOrder = orderService.removeOrderItem(orderId, itemId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Item removed successfully");
        response.put("order", convertOrderToDetailedMap(updatedOrder));

        log.info("Item {} removed from order {}", itemId, orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update order item quantity
     * 
     * PUT /api/orders/{orderId}/items/{itemId}
     * 
     * Requires authentication.
     * User must own the order and order must not be marked final.
     * 
     * Request body:
     * {
     *   "quantity": 5
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Item updated successfully",
     *   "order": {...}
     * }
     */
    @PutMapping("/{orderId}/items/{itemId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateOrderItemQuantity(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestBody Map<String, Integer> request
    ) {
        log.info("Update item {} quantity in order {} by user: {}", itemId, orderId, user.getEmail());

        Integer quantity = request.get("quantity");
        if (quantity == null || quantity <= 0) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Quantity must be greater than 0"));
        }

        // Get order
        Order order = orderService.getOrderById(orderId);

        // Check ownership
        if (!order.getUser().getId().equals(user.getId())) {
            log.warn("User {} attempted to modify order {} belonging to another user", user.getId(), orderId);
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
        }

        // Check if marked final
        if (order.getIsMarkedFinal()) {
            log.warn("User {} attempted to modify finalized order {}", user.getId(), orderId);
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Cannot modify a finalized order"));
        }

        // Update item
        Order updatedOrder = orderService.updateOrderItemQuantity(orderId, itemId, quantity);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Item updated successfully");
        response.put("order", convertOrderToDetailedMap(updatedOrder));

        log.info("Item {} quantity updated to {} in order {}", itemId, quantity, orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark order as final (school admin only)
     * 
     * PUT /api/orders/{orderId}/mark-final
     * 
     * Requires authentication and SCHOOL_ADMIN role.
     * Once marked final, parents cannot edit or remove items from the order.
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Order marked as final",
     *   "order": {...}
     * }
     */
    @PutMapping("/{orderId}/mark-final")
    @Transactional
    public ResponseEntity<Map<String, Object>> markOrderAsFinalized(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId
    ) {
        log.info("Mark order {} as final by user: {}", orderId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            log.warn("User {} attempted to mark order final but is not a school admin", user.getEmail());
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Only school admins can mark orders as final"));
        }

        // Get order and verify school ownership
        Order order = orderService.getOrderById(orderId);

        if (order.getSchool() == null || !order.getSchool().getId().equals(user.getSchoolId())) {
            log.warn("User {} attempted to modify order {} not belonging to their school", user.getId(), orderId);
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "This order does not belong to your school"));
        }

        // Mark as final
        Order updatedOrder = orderService.markOrderAsFinal(orderId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order marked as final");
        response.put("order", convertOrderToDetailedMap(updatedOrder));

        log.info("Order {} marked as final by school {}", orderId, user.getSchoolId());
        return ResponseEntity.ok(response);
    }

    /**
     * Convert Order to map for list view
     */
    private Map<String, Object> convertOrderToMap(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("orderType", order.getOrderType());
        map.put("studentGrade", order.getStudentGrade());
        map.put("studentName", order.getStudentName());
        map.put("totalAmount", order.getTotalAmount());
        map.put("status", order.getStatus().name());
        map.put("itemCount", order.getOrderItems().size());
        map.put("createdAt", order.getCreatedAt());
        
        // Add payment plan info
        map.put("academicYear", order.getAcademicYear());
        map.put("paymentType", order.getPaymentType());
        map.put("monthlyInstalment", order.getMonthlyInstalment());
        map.put("paymentPlanMonths", order.getPaymentPlanMonths());
        map.put("debitOrderDay", order.getDebitOrderDay());
        map.put("firstDebitDate", order.getFirstDebitDate());
        map.put("lastDebitDate", order.getLastDebitDate());
        
        // Add school info - handle both approved schools and requested schools
        Map<String, Object> schoolInfo = new HashMap<>();
        if (order.getSchool() != null) {
            // Approved school
            schoolInfo.put("id", order.getSchool().getId());
            schoolInfo.put("name", order.getSchool().getName());
            schoolInfo.put("province", order.getSchool().getProvince());
        } else if (order.getRequestedSchoolName() != null) {
            // Requested school (not yet approved)
            schoolInfo.put("id", null);
            schoolInfo.put("name", order.getRequestedSchoolName());
            schoolInfo.put("province", null);
            schoolInfo.put("requested", true);
        }
        map.put("school", schoolInfo);

        return map;
    }

    /**
     * Convert Order to detailed map for single view
     */
    private Map<String, Object> convertOrderToDetailedMap(Order order) {
        Map<String, Object> map = convertOrderToMap(order);

        // Add order items with null-safe stationery access
        List<Map<String, Object>> items = order.getOrderItems().stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.getId());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("price", item.getPrice());
                    itemMap.put("subtotal", item.getSubtotal());

                    // Add stationery info - NULL SAFE (Issue #5 fix)
                    if (item.getStationery() != null) {
                        Map<String, Object> stationeryInfo = new HashMap<>();
                        stationeryInfo.put("id", item.getStationery().getId());
                        stationeryInfo.put("name", item.getStationery().getName());
                        stationeryInfo.put("category", item.getStationery().getCategory());
                        stationeryInfo.put("brand", item.getStationery().getBrand());
                        itemMap.put("stationery", stationeryInfo);
                    } else {
                        // Fallback for corrupted data
                        Map<String, Object> fallbackInfo = new HashMap<>();
                        fallbackInfo.put("id", null);
                        fallbackInfo.put("name", "Unknown Item");
                        fallbackInfo.put("category", "UNKNOWN");
                        fallbackInfo.put("brand", "Unknown");
                        itemMap.put("stationery", fallbackInfo);
                    }

                    return itemMap;
                })
                .collect(Collectors.toList());

        map.put("items", items);

        return map;
    }
}