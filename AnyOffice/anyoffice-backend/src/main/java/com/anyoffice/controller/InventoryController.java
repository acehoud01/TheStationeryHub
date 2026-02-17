package com.anyoffice.controller;

import com.anyoffice.model.InventoryTracking;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/office/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getInventory(
            @AuthenticationPrincipal OfficeUser caller) {
        List<InventoryTracking> items = inventoryService.getInventoryByCompany(caller.getCompanyId());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("inventory", items);
        response.put("count", items.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<Map<String, Object>> getLowStock(
            @AuthenticationPrincipal OfficeUser caller) {
        List<InventoryTracking> items = inventoryService.getLowStockItems(caller.getCompanyId(), 10);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("items", items);
        response.put("count", items.size());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateInventory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal OfficeUser caller) {
        InventoryTracking updated = inventoryService.updateInventory(id, body);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inventory updated successfully");
        response.put("item", updated);
        return ResponseEntity.ok(response);
    }
}
