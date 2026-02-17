package com.anyschool.controller;

import com.anyschool.model.School;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.repository.SchoolRepository;
import com.anyschool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * User Controller
 * 
 * Handles user profile operations and school admin onboarding.
 * 
 * Endpoints:
 * - PUT /api/users/school - Link school admin to a school
 * - GET /api/users/profile - Get current user profile
 * 
 * Phase 7: School admin onboarding
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Link school admin to a school
     * 
     * PUT /api/users/school
     * 
     * Request body:
     * {
     *   "schoolId": 1
     * }
     * 
     * Requires authentication and SCHOOL_ADMIN role.
     * Links the authenticated user to the specified school.
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "School linked successfully",
     *   "user": {
     *     "id": 5,
     *     "email": "admin@example.com",
     *     "fullName": "John Admin",
     *     "role": "SCHOOL_ADMIN",
     *     "schoolId": 1
     *   }
     * }
     */
    @PutMapping("/school")
    public ResponseEntity<?> linkSchool(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal User user
    ) {
        log.info("Link school request from user: {}", user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            log.warn("User {} is not a school admin", user.getEmail());
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "Only school admins can be linked to schools"
            ));
        }

        // Check if already linked
        if (user.getSchoolId() != null) {
            log.warn("User {} already linked to school {}", user.getEmail(), user.getSchoolId());
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", "You are already linked to a school"
            ));
        }

        // Get school ID from request
        Object schoolIdObj = request.get("schoolId");
        if (schoolIdObj == null) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", "School ID is required"
            ));
        }

        Long schoolId;
        try {
            schoolId = Long.valueOf(schoolIdObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", "Invalid school ID"
            ));
        }

        // Verify school exists
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new IllegalArgumentException("School not found with id: " + schoolId));

        // Link user to school
        user.setSchoolId(schoolId);
        User updatedUser = userRepository.save(user);

        // Build response
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", updatedUser.getId());
        userInfo.put("email", updatedUser.getEmail());
        userInfo.put("fullName", updatedUser.getFullName());
        userInfo.put("role", updatedUser.getRole().name());
        userInfo.put("schoolId", updatedUser.getSchoolId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "School linked successfully");
        response.put("user", userInfo);
        response.put("school", school);

        log.info("User {} linked to school {}", user.getEmail(), school.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * Get current user profile
     * 
     * GET /api/users/profile
     * 
     * Requires authentication.
     * Returns the authenticated user's profile information.
     * 
     * Response:
     * {
     *   "success": true,
     *   "user": {
     *     "id": 1,
     *     "email": "user@example.com",
     *     "fullName": "John Doe",
     *     "role": "PARENT",
     *     "schoolId": null
     *   }
     * }
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal User user
    ) {
        log.info("Get profile request from user: {}", user.getEmail());

        // Reload user from database to get latest data
        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", currentUser.getId());
        userInfo.put("email", currentUser.getEmail());
        userInfo.put("fullName", currentUser.getFullName());
        userInfo.put("phoneNumber", currentUser.getPhoneNumber());
        userInfo.put("role", currentUser.getRole().name());
        userInfo.put("schoolId", currentUser.getSchoolId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", userInfo);

        return ResponseEntity.ok(response);
    }

    /**
     * Update current user profile
     * 
     * PUT /api/users/profile
     * 
     * Request body:
     * {
     *   "fullName": "New Name",
     *   "phoneNumber": "+27 82 123 4567"
     * }
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user
    ) {
        log.info("Update profile request from user: {}", user.getEmail());

        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String fullName = request.get("fullName");
        String phoneNumber = request.get("phoneNumber");

        if (fullName != null) {
            if (fullName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Full name is required"
                ));
            }
            currentUser.setFullName(fullName.trim());
        }

        if (phoneNumber != null) {
            currentUser.setPhoneNumber(phoneNumber.trim());
        }

        User updatedUser = userRepository.save(currentUser);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", updatedUser.getId());
        userInfo.put("email", updatedUser.getEmail());
        userInfo.put("fullName", updatedUser.getFullName());
        userInfo.put("phoneNumber", updatedUser.getPhoneNumber());
        userInfo.put("role", updatedUser.getRole().name());
        userInfo.put("schoolId", updatedUser.getSchoolId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        response.put("user", userInfo);

        return ResponseEntity.ok(response);
    }

    /**
     * Change password for current user
     * 
     * PUT /api/users/profile/password
     * 
     * Request body:
     * {
     *   "currentPassword": "oldpassword",
     *   "newPassword": "newpassword"
     * }
     */
    @PutMapping("/profile/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user
    ) {
        log.info("Change password request from user: {}", user.getEmail());

        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || currentPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Current password is required"
            ));
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "New password must be at least 6 characters"
            ));
        }

        if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Current password is incorrect"
            ));
        }

        currentUser.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(currentUser);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Password updated successfully"
        ));
    }
}