package com.anyschool.controller;

import com.anyschool.model.School;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.repository.SchoolRepository;
import com.anyschool.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * School Controller
 * 
 * Public endpoints for viewing schools.
 * No authentication required for basic school info.
 * Authentication required for school statistics (school admin only).
 * 
 * Endpoints:
 * - GET /api/schools - List all schools
 * - GET /api/schools/{id} - Get single school
 * - GET /api/schools/province/{province} - Get schools by province
 * - GET /api/schools/{id}/stats - Get school statistics (school admin only)
 * 
 * Phase 4: Public catalog
 * Phase 7: School admin dashboard
 * Phase 7D: Admin linkage display
 */
@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
@Slf4j
public class SchoolController {

    private final SchoolRepository schoolRepository;
    private final OrderService orderService;

    /**
     * Get all schools
     * 
     * GET /api/schools
     * 
     * Public access - no authentication required
     * Includes admin linkage status
     * 
     * Response:
     * {
     *   "success": true,
     *   "count": 5,
     *   "schools": [...]
     * }
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getAllSchools() {
        log.info("Fetching all schools");
        
        List<School> schools = schoolRepository.findAll();
        
        List<Map<String, Object>> schoolList = schools.stream()
                .map(this::buildSchoolResponse)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", schoolList.size());
        response.put("schools", schoolList);
        
        log.info("Fetched {} schools", schoolList.size());
        return ResponseEntity.ok(response);
    }

    /**
     * Get school by ID
     * 
     * GET /api/schools/{id}
     * 
     * Public access - no authentication required
     * 
     * Response:
     * {
     *   "success": true,
     *   "school": {...}
     * }
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getSchoolById(@PathVariable Long id) {
        log.info("Fetching school with id: {}", id);
        
        return schoolRepository.findById(id)
                .map(school -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("school", buildSchoolResponse(school));
                    
                    log.info("Fetched school: {}", school.getName());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    log.warn("School not found with id: {}", id);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "School not found");
                    
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Get schools by province
     * 
     * GET /api/schools/province/{province}
     * 
     * Public access - no authentication required
     */
    @GetMapping("/province/{province}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getSchoolsByProvince(@PathVariable String province) {
        log.info("Fetching schools by province: {}", province);
        
        List<School> schools = schoolRepository.findByProvince(province);
        
        List<Map<String, Object>> schoolList = schools.stream()
                .map(this::buildSchoolResponse)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", schoolList.size());
        response.put("province", province);
        response.put("schools", schoolList);
        
        log.info("Fetched {} schools in province: {}", schoolList.size(), province);
        return ResponseEntity.ok(response);
    }

    /**
     * Get school statistics
     * 
     * GET /api/schools/{id}/stats
     * 
     * Requires authentication and SCHOOL_ADMIN role.
     * Verifies that the school admin owns the school.
     * 
     * Response:
     * {
     *   "success": true,
     *   "stats": {
     *     "totalRevenue": 5999.99,
     *     "purchaseRevenue": 3500.00,
     *     "donationRevenue": 2499.99,
     *     "totalOrders": 15,
     *     "totalPurchases": 10,
     *     "totalDonations": 5,
     *     "completedOrders": 12,
     *     "pendingOrders": 3
     *   }
     * }
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getSchoolStats(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        log.info("Fetching school stats for id: {} by user: {}", id, currentUser.getEmail());
        
        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
            log.warn("User {} is not a school admin", currentUser.getEmail());
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Access denied. School admins only."));
        }
        
        // Verify school exists
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));
        
        // Verify admin owns this school
        if (!id.equals(currentUser.getSchoolId())) {
            log.warn("User {} attempted to access stats for school {} but owns school {}",
                    currentUser.getEmail(), id, currentUser.getSchoolId());
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Access denied. You can only view stats for your school."));
        }
        
        // Get stats from order service
        Map<String, Object> stats = orderService.getSchoolStats(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", stats);
        
        log.info("Retrieved stats for school: {}", school.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * Build school response with admin info
     */
    private Map<String, Object> buildSchoolResponse(School school) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", school.getId());
        map.put("name", school.getName());
        map.put("district", school.getDistrict());
        map.put("province", school.getProvince());
        map.put("grades", school.getGrades());
        map.put("phone", school.getPhone());
        map.put("createdAt", school.getCreatedAt());
        map.put("updatedAt", school.getUpdatedAt());
        
        // Admin linkage status
        User admin = school.getAdmin();
        if (admin != null) {
            Map<String, Object> adminInfo = new HashMap<>();
            adminInfo.put("id", admin.getId());
            adminInfo.put("fullName", admin.getFullName());
            adminInfo.put("email", admin.getEmail());
            map.put("admin", adminInfo);
            map.put("hasAdmin", true);
        } else {
            map.put("hasAdmin", false);
        }
        
        return map;
    }
}