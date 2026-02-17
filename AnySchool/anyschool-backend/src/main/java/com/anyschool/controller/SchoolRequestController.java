package com.anyschool.controller;

import com.anyschool.model.*;
import com.anyschool.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * School Request Controller
 * 
 * Handles school onboarding requests from SCHOOL_ADMIN users.
 * Super admins can approve/reject requests.
 * 
 * Features:
 * - Submit request to create NEW school
 * - Submit request to link to EXISTING school (without admin)
 * - Get list of available schools (only those without admin)
 * - Super admin approves/rejects requests
 * 
 * Phase 7D: School Admin Onboarding
 */
@RestController
@RequestMapping("/api/school-requests")
@RequiredArgsConstructor
@Slf4j
public class SchoolRequestController {

    private final SchoolRequestRepository schoolRequestRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final CommunicationRepository communicationRepository;

    /**
     * DEBUG ENDPOINT: Check database content (public for testing)
     * Shows what's in the database for school requests
     */
    @GetMapping("/debug/status")
    public ResponseEntity<Map<String, Object>> debugStatus() {
        try {
            long totalRequests = schoolRequestRepository.count();
            long pendingRequests = schoolRequestRepository.findByStatusOrderByCreatedAtDesc(SchoolRequestStatus.PENDING).size();
            long totalUsers = userRepository.count();
            long totalSchools = schoolRepository.count();

            List<SchoolRequest> allRequests = schoolRequestRepository.findAll();
            List<Map<String, Object>> requestsList = allRequests.stream()
                    .map(req -> new HashMap<String, Object>() {{
                        put("id", req.getId());
                        put("type", req.getRequestType());
                        put("status", req.getStatus().name());
                        put("admin", req.getUser() != null ? req.getUser().getEmail() : "NULL");
                        put("schoolName", req.getSchoolName());
                        put("linkedSchoolId", req.getLinkedSchoolId());
                        put("createdAt", req.getCreatedAt().toString());
                    }})
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("totalRequests", totalRequests);
                put("pendingRequests", pendingRequests);
                put("totalUsers", totalUsers);
                put("totalSchools", totalSchools);
                put("requests", requestsList);
            }});
        } catch (Exception e) {
            log.error("Error in debug endpoint", e);
            return ResponseEntity.ok(Map.of(
                "error", e.getMessage(),
                "stackTrace", e.getStackTrace()
            ));
        }
    }

    /**
     * Get available schools (schools without admin linked)
     * For SCHOOL_ADMIN users to see which schools they can link to
     */
    @GetMapping("/available-schools")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAvailableSchools(
            @AuthenticationPrincipal User currentUser) {
        
        log.info("Fetching available schools for admin: {}", currentUser.getEmail());

        try {
            // Check if user already has a school linked
            if (currentUser.getSchoolId() != null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "You are already linked to a school"
                ));
            }

            // Get all schools without admin
            List<School> availableSchools = schoolRepository.findAll().stream()
                    .filter(s -> s.getAdmin() == null)
                    .collect(Collectors.toList());

            List<Map<String, Object>> schools = availableSchools.stream()
                    .map(s -> {
                        Map<String, Object> schoolMap = new HashMap<>();
                        schoolMap.put("id", s.getId());
                        schoolMap.put("name", s.getName());
                        schoolMap.put("district", s.getDistrict());
                        schoolMap.put("province", s.getProvince());
                        schoolMap.put("phone", s.getPhone());
                        schoolMap.put("grades", s.getGrades());
                        return schoolMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", schools.size(),
                "schools", schools
            ));

        } catch (Exception e) {
            log.error("Error fetching available schools", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch schools: " + e.getMessage()
            ));
        }
    }

    /**
     * Submit request to create a NEW school
     */
    @PostMapping("/new-school")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> submitNewSchoolRequest(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        
        log.info("New school request from admin: {}", currentUser.getEmail());

        try {
            // Check if user already has a school
            if (currentUser.getSchoolId() != null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "You are already linked to a school"
                ));
            }

            // Validate input
            String schoolName = request.get("schoolName");
            String phoneNumber = request.get("phoneNumber");
            String province = request.get("province");

            if (schoolName == null || schoolName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "School name is required"
                ));
            }

            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Phone number is required"
                ));
            }

            if (province == null || province.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Province is required"
                ));
            }

            // Create school request
            SchoolRequest schoolRequest = new SchoolRequest(
                    schoolName.trim(),
                    phoneNumber.trim(),
                    province.trim(),
                    currentUser
            );

            SchoolRequest saved = schoolRequestRepository.save(schoolRequest);

            log.info("School request submitted for new school: {}", schoolName);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "School request submitted. A super admin will review it shortly.",
                "request", buildRequestResponse(saved)
            ));

        } catch (Exception e) {
            log.error("Error submitting school request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to submit request: " + e.getMessage()
            ));
        }
    }

    /**
     * Submit request to link to EXISTING school
     */
    @PostMapping("/link-school")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> submitLinkSchoolRequest(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, Object> request) {
        
        log.info("Link school request from admin: {}", currentUser.getEmail());

        try {
            // Check if user already has a school
            if (currentUser.getSchoolId() != null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "You are already linked to a school"
                ));
            }

            // Get school ID
            Object schoolIdObj = request.get("schoolId");
            if (schoolIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "School ID is required"
                ));
            }

            Long schoolId = ((Number) schoolIdObj).longValue();

            // Verify school exists
            School school = schoolRepository.findById(schoolId)
                    .orElseThrow(() -> new IllegalArgumentException("School not found"));

            // Verify school doesn't have an admin already
            if (school.getAdmin() != null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "This school already has an admin assigned"
                ));
            }

            // Create link request
            SchoolRequest schoolRequest = new SchoolRequest(schoolId, currentUser);
            SchoolRequest saved = schoolRequestRepository.save(schoolRequest);

            log.info("Link school request submitted for school: {} by admin: {}", schoolId, currentUser.getEmail());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Link request submitted. A super admin will review it shortly.",
                "request", buildRequestResponse(saved)
            ));

        } catch (Exception e) {
            log.error("Error submitting link request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to submit request: " + e.getMessage()
            ));
        }
    }

    /**
     * Get user's school requests (for SCHOOL_ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserRequests(
            @AuthenticationPrincipal User currentUser) {
        
        try {
            List<SchoolRequest> requests = schoolRequestRepository
                    .findByUserOrderByCreatedAtDesc(currentUser);

            List<Map<String, Object>> requestsList = requests.stream()
                    .map(this::buildRequestResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", requestsList.size(),
                "requests", requestsList
            ));

        } catch (Exception e) {
            log.error("Error fetching user requests", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch requests: " + e.getMessage()
            ));
        }
    }

    /**
     * Get all pending requests (SUPER_ADMIN only)
     */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getPendingRequests() {
        
        log.info("🔍 ADMIN: Fetching pending school requests");

        try {
            List<SchoolRequest> requests = schoolRequestRepository
                    .findByStatusOrderByCreatedAtDesc(SchoolRequestStatus.PENDING);
            
            log.info("🔍 Found {} pending requests in database", requests.size());

            List<Map<String, Object>> requestsList = requests.stream()
                    .map(req -> {
                        try {
                            Map<String, Object> response = buildAdminRequestResponse(req);
                            log.debug("  ✅ Request {} - Type: {}, Admin: {}", 
                                    req.getId(), req.getRequestType(), req.getUser().getEmail());
                            return response;
                        } catch (Exception e) {
                            log.error("  ❌ Error building response for request {}: {}", req.getId(), e.getMessage());
                            throw new RuntimeException(e);
                        }
                    })
                    .collect(Collectors.toList());

            log.info("✅ Returning {} requests to admin", requestsList.size());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", requestsList.size(),
                "requests", requestsList
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching pending requests", e);
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch requests: " + e.getMessage()
            ));
        }
    }

    /**
     * Approve a school request (SUPER_ADMIN only)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> approveRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) Map<String, String> notes) {
        
        log.info("Approving school request: {}", id);

        try {
            SchoolRequest schoolRequest = schoolRequestRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Request not found"));

            if (!schoolRequest.getStatus().equals(SchoolRequestStatus.PENDING)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only pending requests can be approved"
                ));
            }

            User admin = schoolRequest.getUser();
            School school;

            if ("NEW_SCHOOL".equals(schoolRequest.getRequestType())) {
                // Create new school
                school = new School(
                        schoolRequest.getSchoolName(),
                        schoolRequest.getProvince(),
                        schoolRequest.getProvince()
                );
                school.setPhone(schoolRequest.getPhoneNumber());
                school = schoolRepository.save(school);

                log.info("New school created: {} (ID: {})", school.getName(), school.getId());
            } else {
                // Link to existing school
                school = schoolRepository.findById(schoolRequest.getLinkedSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));

                // Verify no admin yet
                if (school.getAdmin() != null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "School already has an admin assigned"
                    ));
                }
            }

            // Assign admin to school
            school.setAdmin(admin);
            schoolRepository.save(school);

            // Update user's schoolId
            admin.setSchoolId(school.getId());
            userRepository.save(admin);

            // Mark request as approved
            schoolRequest.setStatus(SchoolRequestStatus.APPROVED);
            schoolRequest.setCreatedSchoolId(school.getId());
            if (notes != null && notes.containsKey("notes")) {
                schoolRequest.setAdminNotes(notes.get("notes"));
            }
            schoolRequestRepository.save(schoolRequest);

            if (currentUser != null) {
                String approvalMessage = "Your school request has been approved. You can now access the school dashboard.";
                String adminNote = notes != null ? notes.get("notes") : null;
                if (adminNote != null && !adminNote.isBlank()) {
                    approvalMessage += "\n\nNote from Super Admin: " + adminNote.trim();
                }

                communicationRepository.save(Communication.builder()
                        .school(school)
                        .createdBy(currentUser)
                        .title("School Approved")
                        .message(approvalMessage)
                        .type("GENERAL")
                        .priority("LOW")
                        .targetAudience("ALL")
                        .published(false)
                        .build());
            } else {
                log.warn("Skipping approval notification: missing current user for request {}", id);
            }

            log.info("School request approved. Admin {} linked to school {}", 
                    admin.getEmail(), school.getName());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Request approved. Admin has been linked to the school.",
                "school", buildSchoolResponse(school),
                "request", buildAdminRequestResponse(schoolRequest)
            ));

        } catch (Exception e) {
            log.error("Error approving request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to approve request: " + e.getMessage()
            ));
        }
    }

    /**
     * Reject a school request (SUPER_ADMIN only)
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        log.info("Rejecting school request: {}", id);

        try {
            SchoolRequest schoolRequest = schoolRequestRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Request not found"));

            if (!schoolRequest.getStatus().equals(SchoolRequestStatus.PENDING)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only pending requests can be rejected"
                ));
            }

            String reason = request.getOrDefault("reason", "Request was rejected");

            schoolRequest.setStatus(SchoolRequestStatus.REJECTED);
            schoolRequest.setAdminNotes(reason);
            schoolRequestRepository.save(schoolRequest);

            log.info("School request rejected: {}", id);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Request has been rejected.",
                "request", buildAdminRequestResponse(schoolRequest)
            ));

        } catch (Exception e) {
            log.error("Error rejecting request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to reject request: " + e.getMessage()
            ));
        }
    }

    /**
     * Build response for user request
     */
    private Map<String, Object> buildRequestResponse(SchoolRequest req) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", req.getId());
        map.put("requestType", req.getRequestType());
        map.put("status", req.getStatus().name());
        map.put("createdAt", req.getCreatedAt().toString());

        if ("NEW_SCHOOL".equals(req.getRequestType())) {
            map.put("schoolName", req.getSchoolName());
            map.put("province", req.getProvince());
            map.put("phoneNumber", req.getPhoneNumber());
        } else {
            map.put("linkedSchoolId", req.getLinkedSchoolId());
        }

        if (req.getAdminNotes() != null) {
            map.put("adminNotes", req.getAdminNotes());
        }

        if (req.getCreatedSchoolId() != null) {
            map.put("createdSchoolId", req.getCreatedSchoolId());
        }

        return map;
    }

    /**
     * Build detailed response for admin review
     */
    private Map<String, Object> buildAdminRequestResponse(SchoolRequest req) {
        Map<String, Object> map = buildRequestResponse(req);
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", req.getUser().getId());
        userInfo.put("email", req.getUser().getEmail());
        userInfo.put("fullName", req.getUser().getFullName());
        userInfo.put("phoneNumber", req.getUser().getPhoneNumber());
        map.put("admin", userInfo);

        return map;
    }

    /**
     * Build school response
     */
    private Map<String, Object> buildSchoolResponse(School school) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", school.getId());
        map.put("name", school.getName());
        map.put("district", school.getDistrict());
        map.put("province", school.getProvince());
        map.put("phone", school.getPhone());
        map.put("grades", school.getGrades());
        if (school.getAdmin() != null) {
            map.put("admin", school.getAdmin().getFullName());
        }
        return map;
    }
}