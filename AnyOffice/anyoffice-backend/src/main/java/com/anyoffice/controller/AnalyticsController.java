package com.anyoffice.controller;

import com.anyoffice.model.OfficeUser;
import com.anyoffice.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/office/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @AuthenticationPrincipal OfficeUser caller) {
        Map<String, Object> data = analyticsService.getDashboardData(caller.getCompanyId());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/spend")
    public ResponseEntity<Map<String, Object>> getSpendAnalytics(
            @AuthenticationPrincipal OfficeUser caller) {
        Map<String, Object> data = analyticsService.getSpendAnalytics(caller.getCompanyId());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrderAnalytics(
            @AuthenticationPrincipal OfficeUser caller) {
        Map<String, Object> data = analyticsService.getOrderAnalytics(caller.getCompanyId());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}
