package com.anyoffice.service;

import com.anyoffice.model.OfficeUser;
import com.anyoffice.repository.OfficeUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OfficeUserRepository userRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    private String generateSixDigitOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }

    @Transactional
    public void generateAndSendOtp(OfficeUser user) {
        String otp = generateSixDigitOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), user.getFirstName(), otp);
        log.info("OTP sent to: {}", user.getEmail());
    }

    @Transactional
    public boolean verifyOtp(OfficeUser user, String otpCode) {
        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            log.warn("Invalid OTP for: {}", user.getEmail());
            return false;
        }
        if (user.getOtpExpiresAt() == null || LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            log.warn("Expired OTP for: {}", user.getEmail());
            return false;
        }
        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
        log.info("OTP verified for: {}", user.getEmail());
        return true;
    }

    @Transactional
    public void generateAndSendPasswordResetOtp(OfficeUser user) {
        String otp = generateSixDigitOtp();
        user.setPasswordResetToken(otp);
        user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), otp);
        log.info("Password reset OTP sent to: {}", user.getEmail());
    }

    public boolean verifyPasswordResetToken(OfficeUser user, String token) {
        if (user.getPasswordResetToken() == null || !user.getPasswordResetToken().equals(token)) {
            return false;
        }
        if (user.getPasswordResetTokenExpiresAt() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiresAt())) {
            return false;
        }
        return true;
    }
}
