package com.anyoffice.controller;

import com.anyoffice.dto.LoginRequest;
import com.anyoffice.dto.RegisterRequest;
import com.anyoffice.model.Company;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.model.OfficeUserRole;
import com.anyoffice.security.JwtService;
import com.anyoffice.service.CompanyService;
import com.anyoffice.service.OfficeUserService;
import com.anyoffice.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/office/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final OfficeUserService userService;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final CompanyService companyService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        log.info("Registration attempt for: {}", request.getEmail());

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return badRequest("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return badRequest("Password must be at least 6 characters");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return badRequest("Passwords do not match");
        }
        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            return badRequest("First name is required");
        }
        if (request.getLastName() == null || request.getLastName().isBlank()) {
            return badRequest("Last name is required");
        }

        OfficeUserRole role;
        try {
            role = OfficeUserRole.valueOf(request.getRole() != null ? request.getRole().toUpperCase() : "EMPLOYEE");
        } catch (IllegalArgumentException e) {
            role = OfficeUserRole.EMPLOYEE;
        }

        Long companyId = request.getCompanyId();

        // If registering as COMPANY_ADMIN, create company first
        if (role == OfficeUserRole.COMPANY_ADMIN && request.getCompanyName() != null) {
            Company company = companyService.createCompany(
                    request.getCompanyName(),
                    request.getCompanyIndustry(),
                    request.getCompanyAddress(),
                    request.getEmail(),
                    request.getPhoneNumber()
            );
            companyId = company.getId();
        }

        OfficeUser user = userService.createUser(
                request.getEmail(), request.getPassword(),
                request.getFirstName(), request.getLastName(),
                request.getPhoneNumber(), role,
                companyId, request.getDepartmentId()
        );

        otpService.generateAndSendOtp(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful. Please check your email for the verification code.");
        response.put("email", user.getEmail());
        response.put("requiresVerification", true);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());

        OfficeUser user = userService.authenticate(request.getEmail(), request.getPassword());

        if (!user.isEmailVerified()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Please verify your email before logging in.");
            response.put("requiresVerification", true);
            response.put("email", user.getEmail());
            return ResponseEntity.status(403).body(response);
        }

        String token = jwtService.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", buildUserResponse(user));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otpCode");

        if (email == null || otpCode == null) {
            return badRequest("Email and OTP code are required");
        }

        OfficeUser user = userService.findByEmail(email)
                .orElseThrow(() -> new com.anyoffice.exception.ResourceNotFoundException("User not found"));

        boolean verified = otpService.verifyOtp(user, otpCode);
        if (!verified) {
            return badRequest("Invalid or expired verification code");
        }

        String token = jwtService.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Email verified successfully");
        response.put("token", token);
        response.put("user", buildUserResponse(user));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, Object>> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) return badRequest("Email is required");

        OfficeUser user = userService.findByEmail(email)
                .orElseThrow(() -> new com.anyoffice.exception.ResourceNotFoundException("User not found"));

        if (user.isEmailVerified()) {
            return badRequest("Account is already verified");
        }

        otpService.generateAndSendOtp(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Verification code resent. Please check your email.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) return badRequest("Email is required");

        userService.findByEmail(email).ifPresent(user ->
                otpService.generateAndSendPasswordResetOtp(user)
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "If an account exists with this email, a password reset code has been sent.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String resetCode = request.get("resetCode");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (email == null || resetCode == null || newPassword == null) {
            return badRequest("Email, reset code, and new password are required");
        }
        if (!newPassword.equals(confirmPassword)) {
            return badRequest("Passwords do not match");
        }
        if (newPassword.length() < 6) {
            return badRequest("Password must be at least 6 characters");
        }

        OfficeUser user = userService.findByEmail(email)
                .orElseThrow(() -> new com.anyoffice.exception.ResourceNotFoundException("User not found"));

        if (!otpService.verifyPasswordResetToken(user, resetCode)) {
            return badRequest("Invalid or expired reset code");
        }

        userService.resetPassword(email, newPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password reset successfully. You can now log in with your new password.");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildUserResponse(OfficeUser user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("email", user.getEmail());
        info.put("firstName", user.getFirstName());
        info.put("lastName", user.getLastName());
        info.put("phoneNumber", user.getPhoneNumber());
        info.put("role", user.getRole().name());
        info.put("companyId", user.getCompanyId());
        info.put("departmentId", user.getDepartmentId());
        return info;
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
