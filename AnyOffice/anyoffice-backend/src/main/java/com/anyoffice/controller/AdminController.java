package com.anyoffice.controller;

import com.anyoffice.model.Company;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.model.OfficeUserRole;
import com.anyoffice.service.CompanyService;
import com.anyoffice.service.OfficeUserService;
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
@RequestMapping("/api/office/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final CompanyService companyService;
    private final OfficeUserService userService;

    @GetMapping("/companies")
    public ResponseEntity<Map<String, Object>> getAllCompanies(
            @AuthenticationPrincipal OfficeUser caller) {
        if (caller.getRole() != OfficeUserRole.SUPER_ADMIN) {
            return forbidden();
        }
        List<Company> companies = companyService.getAllCompanies();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("companies", companies);
        response.put("count", companies.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @AuthenticationPrincipal OfficeUser caller) {
        if (caller.getRole() != OfficeUserRole.SUPER_ADMIN) {
            return forbidden();
        }
        List<OfficeUser> users = userService.getAllUsers();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("users", users.stream().map(this::buildUserSummary).collect(Collectors.toList()));
        response.put("count", users.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getPlatformAnalytics(
            @AuthenticationPrincipal OfficeUser caller) {
        if (caller.getRole() != OfficeUserRole.SUPER_ADMIN) {
            return forbidden();
        }
        List<Company> companies = companyService.getAllCompanies();
        List<OfficeUser> users = userService.getAllUsers();
        Map<String, Object> data = new HashMap<>();
        data.put("totalCompanies", companies.size());
        data.put("totalUsers", users.size());
        data.put("activeCompanies", companies.stream().filter(Company::isActive).count());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildUserSummary(OfficeUser user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("email", user.getEmail());
        info.put("firstName", user.getFirstName());
        info.put("lastName", user.getLastName());
        info.put("role", user.getRole().name());
        info.put("companyId", user.getCompanyId());
        info.put("isEnabled", user.isEnabled());
        return info;
    }

    private ResponseEntity<Map<String, Object>> forbidden() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Access denied. SUPER_ADMIN role required.");
        return ResponseEntity.status(403).body(response);
    }
}
