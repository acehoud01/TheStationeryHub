package com.anyoffice.controller;

import com.anyoffice.dto.BudgetAllocationRequest;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/office/budget")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @AuthenticationPrincipal OfficeUser caller) {
        Map<String, Object> summary = budgetService.getBudgetSummary(caller.getCompanyId());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("summary", summary);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<Map<String, Object>> getDepartmentBudget(
            @PathVariable Long departmentId,
            @AuthenticationPrincipal OfficeUser caller) {
        Map<String, Object> budget = budgetService.getDepartmentBudget(departmentId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("budget", budget);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/allocate")
    public ResponseEntity<Map<String, Object>> allocateBudget(
            @RequestBody BudgetAllocationRequest request,
            @AuthenticationPrincipal OfficeUser caller) {
        if (request.getDepartmentId() == null || request.getAllocatedAmount() == null) {
            return badRequest("Department ID and allocated amount are required");
        }
        budgetService.allocateBudget(caller.getCompanyId(), request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Budget allocated successfully");
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
