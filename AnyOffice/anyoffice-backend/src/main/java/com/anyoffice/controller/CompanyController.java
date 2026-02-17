package com.anyoffice.controller;

import com.anyoffice.model.Company;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/office/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCompanies(
            @AuthenticationPrincipal OfficeUser caller) {
        List<Company> companies = companyService.getAllCompanies();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("companies", companies);
        response.put("count", companies.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCompany(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal OfficeUser caller) {
        String name = (String) body.get("name");
        String industry = (String) body.get("industry");
        String address = (String) body.get("address");
        String contactEmail = (String) body.get("contactEmail");
        String contactPhone = (String) body.get("contactPhone");

        if (name == null || name.isBlank()) {
            return badRequest("Company name is required");
        }

        Company company = companyService.createCompany(name, industry, address, contactEmail, contactPhone);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Company created successfully");
        response.put("company", company);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal OfficeUser caller) {
        Company company = companyService.getCompany(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("company", company);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCompany(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal OfficeUser caller) {
        Company company = companyService.updateCompany(id, body);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Company updated successfully");
        response.put("company", company);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
