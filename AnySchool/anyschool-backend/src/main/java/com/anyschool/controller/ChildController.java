package com.anyschool.controller;

import com.anyschool.dto.CreateChildRequest;
import com.anyschool.model.Child;
import com.anyschool.model.School;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.repository.ChildRepository;
import com.anyschool.repository.SchoolRepository;
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
 * Child Controller
 *
 * Endpoints:
 * - POST   /api/children       – Add a child
 * - GET    /api/children       – List parent's children
 * - GET    /api/children/{id}  – Single child
 * - PUT    /api/children/{id}  – Update child
 * - DELETE /api/children/{id}  – Delete child
 *
 * Phase 7C: Parent-Child Linking
 * Fix: accepts requestedSchoolName when school is not in the system.
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/children")
@RequiredArgsConstructor
@Slf4j
public class ChildController {

    private final ChildRepository childRepository;
    private final SchoolRepository schoolRepository;

    // =========================================================================
    // POST /api/children – Add a child
    // =========================================================================

    @PostMapping
    @Transactional
    public ResponseEntity<?> addChild(
            @RequestBody CreateChildRequest request,
            @AuthenticationPrincipal User user
    ) {
        log.info("Add child request from user: {}", user.getEmail());

        if (!isParent(user)) {
            return forbidden("Only parents can add children");
        }

        // --- Validate name & grade ---
        if (isBlank(request.getName())) {
            return badRequest("Child name is required");
        }
        if (isBlank(request.getGrade())) {
            return badRequest("Grade is required");
        }

        // --- Must provide schoolId OR requestedSchoolName ---
        boolean hasSchoolId        = request.getSchoolId() != null;
        boolean hasRequestedSchool = !isBlank(request.getRequestedSchoolName());

        if (!hasSchoolId && !hasRequestedSchool) {
            return badRequest("Please select a school or enter the school name if it is not listed");
        }
        if (hasSchoolId && hasRequestedSchool) {
            return badRequest("Provide either a school selection or a school name, not both");
        }

        // --- Build child ---
        Child child = new Child();
        child.setName(request.getName().trim());
        child.setGrade(request.getGrade().trim());
        child.setParent(user);

        if (hasSchoolId) {
            School school = schoolRepository.findById(request.getSchoolId())
                    .orElse(null);
            if (school == null) {
                return badRequest("School not found – please select a valid school or use the 'not listed' option");
            }
            child.setSchool(school);
            child.setVerificationStatus("APPROVED");
        } else {
            // Requested / unlisted school
            child.setRequestedSchoolName(request.getRequestedSchoolName().trim());
            child.setVerificationStatus("UNLINKED");
        }

        Child saved = childRepository.save(child);
        log.info("Child {} added for parent {}", saved.getName(), user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Child added successfully");
        response.put("child", convertChildToMap(saved));
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // GET /api/children – List all children for the authenticated parent
    // Also allows SCHOOL_ADMIN to see children at their school
    // And SUPER_ADMIN to see children at a specific school (with schoolId param)
    // =========================================================================

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getChildren(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long schoolId
    ) {
        log.info("Get children request from user: {} (role: {})", user.getEmail(), user.getRole());

        List<Child> children;

        if (UserRole.PARENT.equals(user.getRole())) {
            // Parents see only their own children
            children = childRepository.findByParentOrderByCreatedAtDesc(user);
        } else if (UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            // School admins see all children at their school
            if (user.getSchoolId() == null) {
                return badRequest("School admin must be linked to a school");
            }
            School school = schoolRepository.findById(user.getSchoolId()).orElse(null);
            if (school == null) {
                return badRequest("School not found");
            }
            children = childRepository.findBySchool(school);
        } else if (UserRole.SUPER_ADMIN.equals(user.getRole())) {
            // Super admins can see children at a specific school
            if (schoolId == null) {
                return badRequest("Super admin must provide schoolId parameter");
            }
            School school = schoolRepository.findById(schoolId).orElse(null);
            if (school == null) {
                return badRequest("School not found");
            }
            children = childRepository.findBySchool(school);
        } else {
            return forbidden("Access denied");
        }

        List<Map<String, Object>> childrenList = children.stream()
                .map(this::convertChildToMap)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", childrenList.size());
        response.put("children", childrenList);
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // GET /api/children/{id} – Single child
    // =========================================================================

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getChild(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        if (!isParent(user)) {
            return forbidden("Only parents can view children");
        }

        Child child = childRepository.findByIdAndParent(id, user)
                .orElse(null);
        if (child == null) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Child not found or access denied"
            ));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("child", convertChildToMap(child));
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // PUT /api/children/{id} – Update child
    // =========================================================================

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateChild(
            @PathVariable Long id,
            @RequestBody CreateChildRequest request,
            @AuthenticationPrincipal User user
    ) {
        log.info("Update child {} request from user: {}", id, user.getEmail());

        if (!isParent(user)) {
            return forbidden("Only parents can update children");
        }

        Child child = childRepository.findByIdAndParent(id, user)
                .orElse(null);
        if (child == null) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Child not found or access denied"
            ));
        }

        // Update name
        if (!isBlank(request.getName())) {
            child.setName(request.getName().trim());
        }

        // Update grade
        if (!isBlank(request.getGrade())) {
            child.setGrade(request.getGrade().trim());
        }

        // Update school – handle both cases
        boolean hasSchoolId        = request.getSchoolId() != null;
        boolean hasRequestedSchool = !isBlank(request.getRequestedSchoolName());

        if (hasSchoolId) {
            School school = schoolRepository.findById(request.getSchoolId())
                    .orElse(null);
            if (school == null) {
                return badRequest("School not found");
            }
            // If school actually changed, reset verification
            boolean schoolChanged = child.getSchool() == null
                    || !child.getSchool().getId().equals(school.getId());
            if (schoolChanged) {
                child.setSchool(school);
                child.setRequestedSchoolName(null);   // clear any previous request
                child.setVerificationStatus("APPROVED");
            }
        } else if (hasRequestedSchool) {
            child.setSchool(null);
            child.setRequestedSchoolName(request.getRequestedSchoolName().trim());
            child.setVerificationStatus("UNLINKED");
        }

        Child updated = childRepository.save(child);
        log.info("Child {} updated for parent {}", updated.getName(), user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Child updated successfully");
        response.put("child", convertChildToMap(updated));
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // DELETE /api/children/{id} – Delete child
    // =========================================================================

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteChild(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        log.info("Delete child {} request from user: {}", id, user.getEmail());

        if (!isParent(user)) {
            return forbidden("Only parents can delete children");
        }

        Child child = childRepository.findByIdAndParent(id, user)
                .orElse(null);
        if (child == null) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Child not found or access denied"
            ));
        }

        childRepository.delete(child);
        log.info("Child {} deleted for parent {}", child.getName(), user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Child removed successfully");
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private boolean isParent(User user) {
        return user != null
                && user.getRole() != null
                && "PARENT".equals(user.getRole().name());
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private ResponseEntity<?> forbidden(String msg) {
        return ResponseEntity.status(403).body(Map.of("success", false, "message", msg));
    }

    private ResponseEntity<?> badRequest(String msg) {
        return ResponseEntity.status(400).body(Map.of("success", false, "message", msg));
    }

    private Map<String, Object> convertChildToMap(Child child) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", child.getId());
        map.put("name", child.getName());
        map.put("grade", child.getGrade());
        map.put("verificationStatus", child.getVerificationStatus());
        map.put("createdAt", child.getCreatedAt());
        map.put("updatedAt", child.getUpdatedAt());

        if (child.getSchool() != null) {
            Map<String, Object> schoolMap = new HashMap<>();
            schoolMap.put("id", child.getSchool().getId());
            schoolMap.put("name", child.getSchool().getName());
            schoolMap.put("district", child.getSchool().getDistrict());
            schoolMap.put("province", child.getSchool().getProvince());
            schoolMap.put("grades", child.getSchool().getGrades());
            map.put("school", schoolMap);
            map.put("requestedSchoolName", null);
        } else {
            map.put("school", null);
            map.put("requestedSchoolName", child.getRequestedSchoolName());
        }

        return map;
    }
}