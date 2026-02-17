package com.anyschool.controller;

import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.model.School;
import com.anyschool.repository.SchoolRepository;
import com.anyschool.security.JwtService;
import com.anyschool.service.UserService;
import com.anyschool.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Authentication Controller
 * 
 * Handles user registration and login.
 * 
 * Endpoints:
 * - POST /api/auth/register - Create new user
 * - POST /api/auth/login - Authenticate user and return JWT token
 * 
 * Phase 3: JWT-based authentication
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final SchoolRepository schoolRepository;
    private final OtpService otpService;

    /**
     * Register new user
     * 
     * POST /api/auth/register
     * 
     * Request body:
     * {
     *   "email": "user@example.com",
     *   "password": "password123",
     *   "confirmPassword": "password123",
     *   "fullName": "John Doe",
     *   "phoneNumber": "+27 123456789",
     *   "userType": "PARENT"  // or "SCHOOL_ADMIN" or "DONOR"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "User registered successfully",
     *   "token": "eyJhbGc...",
     *   "user": {
     *     "id": 1,
     *     "email": "user@example.com",
     *     "fullName": "John Doe",
     *     "role": "PARENT"
     *   }
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        log.info("Registration request received for email: {}", request.get("email"));
        
        // Extract and validate fields
        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");
        String fullName = request.get("fullName");
        String phoneNumber = request.get("phoneNumber");
        String userTypeStr = request.get("userType");
        
        // Validate required fields
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (userTypeStr == null || userTypeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("User type is required");
        }
        
        // Validate password confirmation
        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        
        // Validate and parse user type
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(userTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user type. Must be PARENT, SCHOOL_ADMIN, or DONOR");
        }
        
        // Create user
        User user = userService.createUser(
                email.trim(),
                password,
                fullName.trim(),
                phoneNumber != null ? phoneNumber.trim() : null,
                userRole
        );
        
        // Generate and send OTP for verification
        try {
            otpService.generateAndSendOtp(user);
        } catch (Exception e) {
            log.error("Failed to send OTP for user {}: {}", email, e.getMessage());
            // User is created but OTP failed - they can resend later
        }
        
        // Build response (NO TOKEN until verified)
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful. Please check your email for verification code.");
        response.put("email", email);
        response.put("requiresVerification", true);
        
        log.info("User registered successfully, awaiting verification: {}", email);
        return ResponseEntity.ok(response);
    }

    /**
     * Login user
     * 
     * POST /api/auth/login
     * 
     * Request body:
     * {
     *   "email": "user@example.com",
     *   "password": "password123"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Login successful",
     *   "token": "eyJhbGc...",
     *   "user": {
     *     "id": 1,
     *     "email": "user@example.com",
     *     "fullName": "John Doe",
     *     "role": "PARENT",
     *     "school": {
     *       "id": 5,
     *       "name": "School Name"
     *     }
     *   }
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        
        log.info("Login request received for email: {}", email);
        
        // Validate fields
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        
        // Authenticate user
        User user = userService.authenticate(email.trim(), password);
        
        // Check if user is verified
        if (!user.isVerified()) {
            log.warn("Login attempt by unverified user: {}", email);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Account not verified. Please check your email for verification code.");
            response.put("requiresVerification", true);
            response.put("email", email);
            return ResponseEntity.status(403).body(response);
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());
        
        // Build response
        Map<String, Object> userInfo = buildUserResponse(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", userInfo);
        
        log.info("User logged in successfully: {}", email);
        return ResponseEntity.ok(response);
    }

    /**
     * Build user response with school information if applicable
     */
    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("role", user.getRole().name());
        userInfo.put("phoneNumber", user.getPhoneNumber());
        
        // If user is a SCHOOL_ADMIN and has a school, add school info
        if (user.getSchoolId() != null) {
            userInfo.put("schoolId", user.getSchoolId());
            Optional<School> school = schoolRepository.findById(user.getSchoolId());
            if (school.isPresent()) {
                Map<String, Object> schoolInfo = new HashMap<>();
                schoolInfo.put("id", school.get().getId());
                schoolInfo.put("name", school.get().getName());
                schoolInfo.put("district", school.get().getDistrict());
                schoolInfo.put("province", school.get().getProvince());
                userInfo.put("school", schoolInfo);
            }
        }
        
        return userInfo;
    }

    /**
     * Verify OTP
     * 
     * POST /api/auth/verify-otp
     * 
     * Request body:
     * {
     *   "email": "user@example.com",
     *   "otpCode": "123456"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Account verified successfully",
     *   "token": "eyJhbGc...",
     *   "user": {...}
     * }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otpCode");
        
        log.info("OTP verification request for email: {}", email);
        
        // Validate fields
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (otpCode == null || otpCode.trim().isEmpty()) {
            throw new IllegalArgumentException("OTP code is required");
        }
        
        // Find user
        User user = userService.findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Verify OTP
        boolean verified = otpService.verifyOtp(user, otpCode.trim());
        
        if (!verified) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid or expired OTP code");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Generate JWT token after successful verification
        String token = jwtService.generateToken(user.getEmail());
        
        // Build response
        Map<String, Object> userInfo = buildUserResponse(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Account verified successfully");
        response.put("token", token);
        response.put("user", userInfo);
        
        log.info("User verified and logged in: {}", email);
        return ResponseEntity.ok(response);
    }

    /**
     * Resend OTP
     * 
     * POST /api/auth/resend-otp
     * 
     * Request body:
     * {
     *   "email": "user@example.com",
     *   "method": "email"  // or "sms"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "OTP sent successfully"
     * }
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, Object>> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String method = request.get("method");
        boolean viaEmail = method == null || !"sms".equalsIgnoreCase(method.trim());
        
        log.info("OTP resend request for email: {} via {}", email, viaEmail ? "email" : "sms");
        
        // Validate fields
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        try {
            otpService.resendOtp(email.trim(), viaEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP sent successfully to your " + (viaEmail ? "email" : "phone"));
            
            log.info("OTP resent to: {}", email);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException | UnsupportedOperationException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Forgot Password - Request password reset OTP
     * 
     * POST /api/auth/forgot-password
     * 
     * Request body:
     * {
     *   "email": "user@example.com"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Password reset code sent to your email"
     * }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        log.info("Forgot password request for email: {}", email);
        
        // Validate field
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        try {
            // Find user
            User user = userService.findByEmail(email.trim())
                    .orElseThrow(() -> new IllegalArgumentException("If this email is registered, you will receive a password reset code."));
            
            // Generate and send password reset OTP
            otpService.generateAndSendPasswordResetOtp(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password reset code sent to your email. Valid for 15 minutes.");
            response.put("email", email.trim());
            
            log.info("Password reset OTP sent to: {}", email);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            // Don't reveal whether email exists - security best practice
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "If this email is registered, you will receive a password reset code.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process forgot password for {}: {}", email, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send password reset email. Please try again.");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Reset Password - Verify OTP and set new password
     * 
     * POST /api/auth/reset-password
     * 
     * Request body:
     * {
     *   "email": "user@example.com",
     *   "resetCode": "123456",
     *   "newPassword": "newPassword123",
     *   "confirmPassword": "newPassword123"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Password reset successfully. You can now login with your new password."
     * }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String resetCode = request.get("resetCode");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        
        log.info("Password reset request for email: {}", email);
        
        // Validate fields
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (resetCode == null || resetCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Reset code is required");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        
        // Verify reset token
        boolean tokenValid = otpService.verifyPasswordResetToken(email.trim(), resetCode.trim());
        
        if (!tokenValid) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid or expired reset code");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Reset password
        userService.resetPassword(email.trim(), newPassword);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password reset successfully. You can now login with your new password.");
        
        log.info("Password reset successfully for: {}", email);
        return ResponseEntity.ok(response);
    }
}