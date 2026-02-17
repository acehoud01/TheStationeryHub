package com.anyoffice.controller;

import com.anyoffice.dto.CreateDepartmentRequest;
import com.anyoffice.model.Department;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.model.OfficeUserRole;
import com.anyoffice.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/office/departments")
@RequiredArgsConstructor
@Slf4j
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDepartments(
            @AuthenticationPrincipal OfficeUser caller) {
        Long companyId = caller.getRole() == OfficeUserRole.SUPER_ADMIN
                ? null : caller.getCompanyId();
        List<Department> departments = companyId != null
                ? departmentService.getDepartmentsByCompany(companyId)
                : departmentService.getDepartmentsByCompany(caller.getCompanyId());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("departments", departments);
        response.put("count", departments.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDepartment(
            @RequestBody CreateDepartmentRequest request,
            @AuthenticationPrincipal OfficeUser caller) {
        if (request.getName() == null || request.getName().isBlank()) {
            return badRequest("Department name is required");
        }
        Long companyId = caller.getCompanyId();
        Department dept = departmentService.createDepartment(companyId, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Department created successfully");
        response.put("department", dept);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDepartment(
            @PathVariable Long id,
            @AuthenticationPrincipal OfficeUser caller) {
        Department dept = departmentService.getDepartment(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("department", dept);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDepartment(
            @PathVariable Long id,
            @RequestBody CreateDepartmentRequest request,
            @AuthenticationPrincipal OfficeUser caller) {
        Department dept = departmentService.updateDepartment(id, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Department updated successfully");
        response.put("department", dept);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deactivateDepartment(
            @PathVariable Long id,
            @AuthenticationPrincipal OfficeUser caller) {
        departmentService.deactivateDepartment(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Department deactivated successfully");
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
