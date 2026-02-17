package com.anyoffice.controller;

import com.anyoffice.dto.CreateOrderRequest;
import com.anyoffice.dto.UpdateOrderStatusRequest;
import com.anyoffice.model.OfficeOrder;
import com.anyoffice.model.OfficeOrderItem;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.service.OfficeOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/office/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OfficeOrderService orderService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal OfficeUser caller) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return badRequest("Order must contain at least one item");
        }
        OfficeOrder order = orderService.createOrder(caller, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order created successfully");
        response.put("order", buildOrderResponse(order));
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(
            @AuthenticationPrincipal OfficeUser caller) {
        List<OfficeOrder> orders = orderService.getOrdersForUser(caller);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("orders", orders.stream().map(this::buildOrderResponse).collect(Collectors.toList()));
        response.put("count", orders.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal OfficeUser caller) {
        OfficeOrder order = orderService.getOrderById(id, caller);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", buildOrderResponse(order));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal OfficeUser caller) {
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            return badRequest("Status is required");
        }
        OfficeOrder order = orderService.updateOrderStatus(id, request.getStatus(), request.getRejectionReason(), caller);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order status updated");
        response.put("order", buildOrderResponse(order));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal OfficeUser caller) {
        orderService.cancelOrder(id, caller);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order cancelled successfully");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildOrderResponse(OfficeOrder order) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("orderNumber", order.getOrderNumber());
        map.put("userId", order.getUserId());
        map.put("companyId", order.getCompanyId());
        map.put("departmentId", order.getDepartmentId());
        map.put("status", order.getStatus().name());
        map.put("orderDate", order.getOrderDate());
        map.put("totalAmount", order.getTotalAmount());
        map.put("taxAmount", order.getTaxAmount());
        map.put("grandTotal", order.getGrandTotal());
        map.put("shippingAddress", order.getShippingAddress());
        map.put("priority", order.getPriority());
        map.put("paymentMethod", order.getPaymentMethod());
        map.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null);
        map.put("rejectionReason", order.getRejectionReason());
        map.put("approvedAt", order.getApprovedAt());
        map.put("createdAt", order.getCreatedAt());
        if (order.getOrderItems() != null) {
            map.put("items", order.getOrderItems().stream().map(this::buildItemResponse).collect(Collectors.toList()));
        }
        return map;
    }

    private Map<String, Object> buildItemResponse(OfficeOrderItem item) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", item.getId());
        map.put("stationeryId", item.getStationeryId());
        map.put("quantity", item.getQuantity());
        map.put("unitPrice", item.getUnitPrice());
        map.put("subtotal", item.getSubtotal());
        map.put("notes", item.getNotes());
        return map;
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
