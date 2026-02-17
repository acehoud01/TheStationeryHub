package com.anyschool.service;

import com.anyschool.model.User;
import com.anyschool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * OTP Service
 * 
 * Handles OTP generation, validation, and verification.
 * Used to prevent fake account registration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    /**
     * Generate a 6-digit OTP code
     */
    private String generateOtpCode() {
        int otp = 100000 + random.nextInt(900000); // 6-digit number
        return String.valueOf(otp);
    }

    /**
     * Generate and send OTP to user's email
     * 
     * @param user User to send OTP to
     */
    @Transactional
    public void generateAndSendOtp(User user) {
        // Generate OTP
        String otpCode = generateOtpCode();
        
        // Set OTP with 10-minute expiration
        user.setOtpCode(otpCode);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        
        log.info("OTP generated for user: {}", user.getEmail());
        
        // Send OTP via email
        String subject = "AnySchool - Verify Your Account";
        String message = buildOtpEmailMessage(user.getFullName(), otpCode);
        
        try {
            emailService.sendEmail(user.getEmail(), subject, message);
            log.info("OTP email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }
    }

    /**
     * Generate and send OTP to user's phone via SMS (placeholder)
     * 
     * @param user User to send OTP to
     */
    @Transactional
    public void generateAndSendOtpViaSms(User user) {
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required for SMS verification");
        }
        
        // Generate OTP
        String otpCode = generateOtpCode();
        
        // Set OTP with 10-minute expiration
        user.setOtpCode(otpCode);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        
        log.info("OTP generated for user via SMS: {}", user.getPhoneNumber());
        
        
        // For now, log the OTP (REMOVE IN PRODUCTION)
        log.warn("SMS OTP for {}: {} (SMS provider not configured)", user.getPhoneNumber(), otpCode);
        
        // Throw exception until SMS provider is configured
        throw new UnsupportedOperationException(
            "SMS verification is not yet configured. Please use email verification."
        );
    }

    /**
     * Verify OTP code
     * 
     * @param user User attempting verification
     * @param otpCode OTP code provided by user
     * @return true if OTP is valid
     */
    @Transactional
    public boolean verifyOtp(User user, String otpCode) {
        // Check if OTP exists
        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            log.warn("OTP verification failed: No OTP found for user {}", user.getEmail());
            return false;
        }
        
        // Check if OTP has expired
        if (LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            log.warn("OTP verification failed: OTP expired for user {}", user.getEmail());
            return false;
        }
        
        // Check if OTP matches
        if (!user.getOtpCode().equals(otpCode)) {
            log.warn("OTP verification failed: Invalid OTP for user {}", user.getEmail());
            return false;
        }
        
        // OTP is valid - mark user as verified
        user.setVerified(true);
        user.setOtpCode(null); // Clear OTP
        user.setOtpExpiresAt(null);
        userRepository.save(user);
        
        log.info("User verified successfully: {}", user.getEmail());
        return true;
    }

    /**
     * Resend OTP to user
     * 
     * @param email User's email
     * @param viaEmail Whether to send via email (true) or SMS (false)
     */
    @Transactional
    public void resendOtp(String email, boolean viaEmail) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.isVerified()) {
            throw new IllegalStateException("Account is already verified");
        }
        
        if (viaEmail) {
            generateAndSendOtp(user);
        } else {
            generateAndSendOtpViaSms(user);
        }
    }

    /**
     * Generate and send password reset OTP
     * 
     * @param user User requesting password reset
     */
    @Transactional
    public void generateAndSendPasswordResetOtp(User user) {
        // Generate OTP
        String otpCode = generateOtpCode();
        
        // Set password reset token with 15-minute expiration
        user.setPasswordResetToken(otpCode);
        user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        
        log.info("Password reset OTP generated for user: {}", user.getEmail());
        
        // Send OTP via email
        String subject = "AnySchool - Password Reset Code";
        String message = buildPasswordResetEmailMessage(user.getFullName(), otpCode);
        
        try {
            emailService.sendEmail(user.getEmail(), subject, message);
            log.info("Password reset OTP email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email to {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send password reset email. Please try again.");
        }
    }

    /**
     * Verify password reset OTP
     * 
     * @param email User's email
     * @param resetToken Reset OTP code
     * @return true if token is valid
     */
    public boolean verifyPasswordResetToken(String email, String resetToken) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        if (user == null) {
            log.warn("Password reset verification failed: User not found - {}", email);
            return false;
        }
        
        // Check if token exists
        if (user.getPasswordResetToken() == null || user.getPasswordResetTokenExpiresAt() == null) {
            log.warn("Password reset verification failed: No token found for user {}", email);
            return false;
        }
        
        // Check if token has expired
        if (LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiresAt())) {
            log.warn("Password reset verification failed: Token expired for user {}", email);
            return false;
        }
        
        // Check if token matches
        if (!user.getPasswordResetToken().equals(resetToken)) {
            log.warn("Password reset verification failed: Invalid token for user {}", email);
            return false;
        }
        
        log.info("Password reset token verified for user: {}", email);
        return true;
    }

    /**
     * Build OTP email message
     */
    private String buildOtpEmailMessage(String fullName, String otpCode) {
        return String.format("""
            Dear %s,
            
            Thank you for registering with AnySchool!
            
            Your verification code is: %s
            
            This code will expire in 10 minutes.
            
            If you did not create an account with AnySchool, please ignore this email.
            
            Best regards,
            The AnySchool Team
            """, fullName, otpCode);
    }

    /**
     * Build password reset email message
     */
    private String buildPasswordResetEmailMessage(String fullName, String otpCode) {
        return String.format("""
            Dear %s,
            
            We received a request to reset your AnySchool password.
            
            Your password reset code is: %s
            
            This code will expire in 15 minutes.
            
            If you did not request a password reset, please ignore this email and ensure your account is secure.
            
            Best regards,
            The AnySchool Team
            """, fullName, otpCode);
    }
}