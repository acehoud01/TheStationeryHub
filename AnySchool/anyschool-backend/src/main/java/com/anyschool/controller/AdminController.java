package com.anyschool.controller;

import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.model.OrderStatus;
import com.anyschool.repository.UserRepository;
import com.anyschool.repository.OrderRepository;
import com.anyschool.model.Order;
import com.anyschool.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * AdminController
 *
 * Endpoints exclusively for SUPER_ADMIN role.
 * Handles user listing, enabling/disabling and deletion.
 *
 * Base path: /api/admin
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String,Object>> ok(Object data, String key) {
        Map<String,Object> r = new HashMap<>();
        r.put("success", true);
        r.put(key, data);
        return ResponseEntity.ok(r);
    }

    private ResponseEntity<Map<String,Object>> notFound(String msg) {
        Map<String,Object> r = new HashMap<>();
        r.put("success", false);
        r.put("message", msg);
        return ResponseEntity.status(404).body(r);
    }

    private ResponseEntity<Map<String,Object>> badRequest(String msg) {
        Map<String,Object> r = new HashMap<>();
        r.put("success", false);
        r.put("message", msg);
        return ResponseEntity.badRequest().body(r);
    }

    // ─── User Management ──────────────────────────────────────────────────────

    /**
     * GET /api/admin/users
     * Returns all registered users with sanitised data (no passwords).
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String,Object>> getAllUsers() {
        log.info("Admin: listing all users");
        List<User> users = userRepository.findAll();
        List<Map<String,Object>> sanitised = users.stream().map(this::sanitise).toList();
        return ok(sanitised, "users");
    }

    /**
     * GET /api/admin/users/{id}
     * Returns a single user by ID.
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String,Object>> getUserById(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return notFound("User not found");
        return ok(sanitise(opt.get()), "user");
    }

    /**
     * PUT /api/admin/users/{id}/toggle
     * Toggles the enabled/disabled state of a user account.
     */
    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String,Object>> toggleUser(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return notFound("User not found");

        User user = opt.get();
        boolean current = user.isEnabled();
        user.setEnabled(!current);
        userRepository.save(user);
        log.info("Admin: user {} {} by admin", user.getEmail(), !current ? "enabled" : "disabled");

        Map<String,Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", "User " + (!current ? "enabled" : "disabled"));
        r.put("user", sanitise(user));
        return ResponseEntity.ok(r);
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Changes the role of a user. Body: { "role": "PARENT" }
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String,Object>> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String,String> body) {

        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return notFound("User not found");

        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) return badRequest("Role is required");

        User user = opt.get();
        try {
            user.setRole(UserRole.valueOf(newRole.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return badRequest("Invalid role: " + newRole);
        }
        userRepository.save(user);
        log.info("Admin: changed role for {} to {}", user.getEmail(), newRole);

        Map<String,Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", "Role updated to " + newRole);
        r.put("user", sanitise(user));
        return ResponseEntity.ok(r);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Permanently deletes a user account.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String,Object>> deleteUser(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return notFound("User not found");

        User user = opt.get();
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            return badRequest("Cannot delete a Super Admin account");
        }
        userRepository.deleteById(id);
        log.warn("Admin: permanently deleted user {}", user.getEmail());

        Map<String,Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", "User deleted");
        return ResponseEntity.ok(r);
    }

    // ─── Order Management ──────────────────────────────────────────────────

    /**
     * GET /api/admin/orders
     * Returns all orders in the system (for super admin dashboard).
     */
    @GetMapping("/orders")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String,Object>> getAllOrders() {
        log.info("Admin: listing all orders");
        List<Order> orders = orderRepository.findAll();
        
        List<Map<String,Object>> ordersList = orders.stream()
                .map(this::sanitiseOrder)
                .collect(Collectors.toList());
        
        Map<String,Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", ordersList.size());
        response.put("orders", ordersList);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/orders/{id}
     * Returns a single order by ID.
     */
    @GetMapping("/orders/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String,Object>> getOrderById(@PathVariable Long id) {
        log.info("Admin: fetching order {}", id);
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) return notFound("Order not found");
        
        return ok(sanitiseOrderDetailed(opt.get()), "order");
    }

    /**
     * GET /api/admin/orders/school/{schoolId}
     * Returns all orders for a specific school.
     */
    @GetMapping("/orders/school/{schoolId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String,Object>> getOrdersBySchool(@PathVariable Long schoolId) {
        log.info("Admin: fetching orders for school {}", schoolId);
        List<Order> orders = orderRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);
        
        List<Map<String,Object>> ordersList = orders.stream()
                .map(this::sanitiseOrder)
                .collect(Collectors.toList());
        
        Map<String,Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", ordersList.size());
        response.put("schoolId", schoolId);
        response.put("orders", ordersList);
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/orders/{id}/approve
     * Approve an order (Super Admin only).
     * When Super Admin approves an order >= R1000, move it to IN_PROCESS
     * so Purchasing Admin can continue with next workflow steps.
     */
    @PostMapping("/orders/{id}/approve")
    @Transactional
    public ResponseEntity<Map<String,Object>> approveOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request
    ) {
        log.info("Admin: approving order {}", id);
        
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            Map<String,Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Order not found");
            return ResponseEntity.status(404).body(response);
        }
        
        Order order = opt.get();
        
        // Super Admin approval: move from ACKNOWLEDGED to IN_PROCESS
        // (High-value orders wait here for Super Admin approval before proceeding)
        if (order.getStatus() != OrderStatus.ACKNOWLEDGED) {
            Map<String,Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Only ACKNOWLEDGED orders can be approved by Super Admin");
            return ResponseEntity.badRequest().body(response);
        }
        
        order.setStatus(OrderStatus.IN_PROCESS);
        order.setIsMarkedFinal(false); // Reset the flag since approval was given
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        
        Map<String,Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order #" + id + " approved by Super Admin and sent back to Purchasing Admin");
        response.put("order", sanitiseOrder(order));
        
        log.info("Admin: approved order {} - moved to IN_PROCESS for Purchasing Admin", id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/orders/{id}/decline
     * Decline an order (Super Admin only).
     */
    @PostMapping("/orders/{id}/decline")
    @Transactional
    public ResponseEntity<Map<String,Object>> declineOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request
    ) {
        log.info("Admin: declining order {}", id);
        
        String reason = request != null ? request.get("reason") : null;
        
        // Update order status to DECLINED
        Order updatedOrder = orderService.updateOrderStatus(id, OrderStatus.DECLINED, reason);
        
        Map<String,Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order #" + id + " declined");
        response.put("order", sanitiseOrder(updatedOrder));
        
        log.info("Admin: declined order {} with reason: {}", id, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/orders/{id}/status
     * Updates order status (Super Admin override).
     * Unlike regular order status updates, this doesn't require ownership.
     */
    @PutMapping("/orders/{id}/status")
    @Transactional
    public ResponseEntity<Map<String,Object>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        log.info("Admin: updating order {} status", id);
        
        String statusStr = request.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            return badRequest("Status is required");
        }
        
        // Validate status
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return badRequest("Invalid status. Must be one of: PENDING, APPROVED, ACKNOWLEDGED, IN_PROCESS, FINALIZING, OUT_FOR_DELIVERY, DELIVERED, CLOSED, DECLINED, CANCELLED");
        }
        
        // Update order status
        Order updatedOrder = orderService.updateOrderStatus(id, newStatus, null);
        
        Map<String,Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order status updated to " + newStatus);
        response.put("order", sanitiseOrder(updatedOrder));
        
        log.info("Admin: updated order {} status to {}", id, newStatus);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/orders/{id}
     * Permanently deletes an order.
     */
    @DeleteMapping("/orders/{id}")
    @Transactional
    public ResponseEntity<Map<String,Object>> deleteOrder(@PathVariable Long id) {
        Optional<Order> opt = orderRepository.findById(id);
        if (opt.isEmpty()) return notFound("Order not found");
        
        Order order = opt.get();
        orderRepository.deleteById(id);
        
        log.warn("Admin: permanently deleted order {} (was for {})", id, order.getStudentName());
        
        Map<String,Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", "Order deleted");
        return ResponseEntity.ok(r);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private Map<String,Object> sanitise(User u) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",          u.getId());
        m.put("fullName",    u.getFullName());
        m.put("email",       u.getEmail());
        m.put("phoneNumber", u.getPhoneNumber());
        m.put("role",        u.getRole() != null ? u.getRole().name() : null);
        m.put("enabled",     u.isEnabled());
        m.put("verified",    u.isVerified());
        m.put("createdAt",   u.getCreatedAt());
        m.put("schoolId",    u.getSchoolId());
        return m;
    }

    /**
     * Sanitise order for list view
     */
    private Map<String,Object> sanitiseOrder(Order order) {
        Map<String,Object> m = new HashMap<>();
        m.put("id", order.getId());
        m.put("orderType", order.getOrderType());
        m.put("status", order.getStatus() != null ? order.getStatus().name() : "UNKNOWN");
        m.put("totalAmount", order.getTotalAmount());
        m.put("studentGrade", order.getStudentGrade());
        m.put("studentName", order.getStudentName());
        m.put("isMarkedFinal", order.getIsMarkedFinal());
        m.put("createdAt", order.getCreatedAt());
        m.put("itemCount", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
        
        // User info
        if (order.getUser() != null) {
            Map<String,Object> userInfo = new HashMap<>();
            userInfo.put("id", order.getUser().getId());
            userInfo.put("fullName", order.getUser().getFullName());
            userInfo.put("email", order.getUser().getEmail());
            m.put("user", userInfo);
        }
        
        // School info
        if (order.getSchool() != null) {
            Map<String,Object> schoolInfo = new HashMap<>();
            schoolInfo.put("id", order.getSchool().getId());
            schoolInfo.put("name", order.getSchool().getName());
            m.put("school", schoolInfo);
        } else if (order.getRequestedSchoolName() != null) {
            Map<String,Object> schoolInfo = new HashMap<>();
            schoolInfo.put("name", order.getRequestedSchoolName());
            schoolInfo.put("requested", true);
            m.put("school", schoolInfo);
        }
        
        return m;
    }

    /**
     * Sanitise order for detailed view
     */
    private Map<String,Object> sanitiseOrderDetailed(Order order) {
        Map<String,Object> m = sanitiseOrder(order);
        
        // Add items
        List<Map<String,Object>> items = order.getOrderItems().stream()
                .map(item -> {
                    Map<String,Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.getId());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("price", item.getPrice());
                    itemMap.put("subtotal", item.getSubtotal());
                    
                    if (item.getStationery() != null) {
                        Map<String,Object> stationeryInfo = new HashMap<>();
                        stationeryInfo.put("id", item.getStationery().getId());
                        stationeryInfo.put("name", item.getStationery().getName());
                        stationeryInfo.put("category", item.getStationery().getCategory());
                        itemMap.put("stationery", stationeryInfo);
                    }
                    
                    return itemMap;
                })
                .collect(Collectors.toList());
        
        m.put("items", items);
        
        return m;
    }
}
