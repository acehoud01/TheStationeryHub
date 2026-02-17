package com.anyschool.controller;

import com.anyschool.dto.BusinessAnalyticsDto;
import com.anyschool.service.BusinessAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Business Analytics Controller
 * 
 * Endpoints for generating business reports and metrics
 * Used for:
 * - Supplier negotiations (showing platform traction)
 * - Internal business intelligence
 * - Investor presentations
 * 
 * Admin only access
 * 
 * Base URL: /api/analytics
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BusinessAnalyticsController {

    @Autowired
    private BusinessAnalyticsService analyticsService;

    /**
     * GET /api/analytics/business-report
     * Generate comprehensive business analytics report
     * 
     * This report includes:
     * - Platform metrics (schools, parents, orders)
     * - Revenue and growth tracking
     * - Product performance
     * - Social impact metrics
     * 
     * Use this to show suppliers:
     * - Your platform's traction
     * - Order volumes (negotiation leverage)
     * - Growth trends
     * - Market reach
     * 
     * Admin only
     */
    @GetMapping("/business-report")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<BusinessAnalyticsDto> getBusinessReport() {
        BusinessAnalyticsDto report = analyticsService.generateBusinessReport();
        return ResponseEntity.ok(report);
    }

    /**
     * GET /api/analytics/summary
     * Quick summary of key metrics
     * Admin only
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PURCHASING_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<BusinessAnalyticsDto> getQuickSummary() {
        // For now, returns the full report
        // Could be optimized to return only key metrics
        BusinessAnalyticsDto report = analyticsService.generateBusinessReport();
        return ResponseEntity.ok(report);
    }
}
