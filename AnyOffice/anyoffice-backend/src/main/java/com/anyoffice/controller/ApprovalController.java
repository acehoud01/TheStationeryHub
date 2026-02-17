package com.anyoffice.controller;

import com.anyoffice.dto.ApprovalRequest;
import com.anyoffice.model.ApprovalWorkflow;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/office/approvals")
@RequiredArgsConstructor
@Slf4j
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingApprovals(
            @AuthenticationPrincipal OfficeUser caller) {
        List<ApprovalWorkflow> pending = approvalService.getPendingApprovalsForUser(caller);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("approvals", pending);
        response.put("count", pending.size());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal OfficeUser caller) {
        String comments = request != null ? request.getComments() : null;
        approvalService.approveOrder(id, comments, caller);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order approved successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(
            @PathVariable Long id,
            @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal OfficeUser caller) {
        if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
            return badRequest("Rejection reason is required");
        }
        approvalService.rejectOrder(id, request.getRejectionReason(), caller);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order rejected");
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
