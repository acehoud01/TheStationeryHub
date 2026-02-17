package com.anyschool.controller;

import com.anyschool.dto.SupplierDto;
import com.anyschool.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Supplier Controller
 * 
 * Endpoints for managing suppliers/vendors
 * Admin-only access
 * 
 * Base URL: /api/suppliers
 */
@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    /**
     * GET /api/suppliers
     * Get all active suppliers
     * Admin only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<SupplierDto>> getAllSuppliers() {
        List<SupplierDto> suppliers = supplierService.getAllActiveSuppliers();
        return ResponseEntity.ok(suppliers);
    }

    /**
     * GET /api/suppliers/{id}
     * Get supplier by ID
     * Admin only
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<SupplierDto> getSupplierById(@PathVariable Long id) {
        SupplierDto supplier = supplierService.getSupplierById(id);
        return ResponseEntity.ok(supplier);
    }

    /**
     * GET /api/suppliers/type/{type}
     * Get suppliers by type (MANUFACTURER, WHOLESALER, RETAILER, DISTRIBUTOR)
     * Admin only
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<SupplierDto>> getSuppliersByType(@PathVariable String type) {
        List<SupplierDto> suppliers = supplierService.getSuppliersByType(type);
        return ResponseEntity.ok(suppliers);
    }

    /**
     * GET /api/suppliers/search?q={searchTerm}
     * Search suppliers by name
     * Admin only
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<SupplierDto>> searchSuppliers(@RequestParam String q) {
        List<SupplierDto> suppliers = supplierService.searchSuppliers(q);
        return ResponseEntity.ok(suppliers);
    }

    /**
     * POST /api/suppliers
     * Create new supplier
     * Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<SupplierDto> createSupplier(@Valid @RequestBody SupplierDto supplierDto) {
        SupplierDto created = supplierService.createSupplier(supplierDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/suppliers/{id}
     * Update existing supplier
     * Admin only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<SupplierDto> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierDto supplierDto) {
        SupplierDto updated = supplierService.updateSupplier(id, supplierDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/suppliers/{id}/deactivate
     * Deactivate supplier (soft delete)
     * Admin only
     */
    @DeleteMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deactivateSupplier(@PathVariable Long id) {
        supplierService.deactivateSupplier(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/suppliers/{id}
     * Permanently delete supplier
     * Admin only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
