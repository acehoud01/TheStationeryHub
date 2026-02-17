package com.anyoffice.controller;

import com.anyoffice.model.OfficeUser;
import com.anyoffice.model.OfficeUserRole;
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
@RequestMapping("/api/office/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final OfficeUserService userService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUsers(
            @AuthenticationPrincipal OfficeUser caller) {
        List<OfficeUser> users;
        if (caller.getRole() == OfficeUserRole.SUPER_ADMIN) {
            users = userService.getAllUsers();
        } else {
            users = userService.getUsersByCompany(caller.getCompanyId());
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("users", users.stream().map(this::buildUserSummary).collect(Collectors.toList()));
        response.put("count", users.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUser(
            @PathVariable Long id,
            @AuthenticationPrincipal OfficeUser caller) {
        OfficeUser user = userService.getUserById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", buildUserSummary(user));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal OfficeUser caller) {
        OfficeUser updated = userService.updateUser(id, body);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User updated successfully");
        response.put("user", buildUserSummary(updated));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deactivateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal OfficeUser caller) {
        userService.deactivateUser(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User deactivated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal OfficeUser caller) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", buildUserSummary(caller));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateCurrentUser(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal OfficeUser caller) {
        OfficeUser updated = userService.updateUser(caller.getId(), body);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        response.put("user", buildUserSummary(updated));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OfficeUser caller) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        String confirmPassword = body.get("confirmPassword");

        if (currentPassword == null || newPassword == null) {
            return badRequest("Current and new passwords are required");
        }
        if (!newPassword.equals(confirmPassword)) {
            return badRequest("Passwords do not match");
        }
        if (newPassword.length() < 6) {
            return badRequest("Password must be at least 6 characters");
        }

        userService.changePassword(caller.getId(), currentPassword, newPassword);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildUserSummary(OfficeUser user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("email", user.getEmail());
        info.put("firstName", user.getFirstName());
        info.put("lastName", user.getLastName());
        info.put("phoneNumber", user.getPhoneNumber());
        info.put("role", user.getRole().name());
        info.put("companyId", user.getCompanyId());
        info.put("departmentId", user.getDepartmentId());
        info.put("isEnabled", user.isEnabled());
        info.put("isEmailVerified", user.isEmailVerified());
        return info;
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
