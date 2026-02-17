package com.anyoffice.service;

import com.anyoffice.exception.EmailAlreadyExistsException;
import com.anyoffice.exception.InvalidCredentialsException;
import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.OfficeUser;
import com.anyoffice.model.OfficeUserRole;
import com.anyoffice.repository.OfficeUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfficeUserService {

    private final OfficeUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public OfficeUser createUser(String email, String password, String firstName, String lastName,
                                  String phoneNumber, OfficeUserRole role,
                                  Long companyId, Long departmentId) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("An account with this email already exists: " + email);
        }
        OfficeUser user = new OfficeUser();
        user.setEmail(email.toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setCompanyId(companyId);
        user.setDepartmentId(departmentId);
        user.setEnabled(true);
        user.setEmailVerified(false);

        OfficeUser saved = userRepository.save(user);
        log.info("User created: {} with role {}", email, role);
        return saved;
    }

    @Transactional
    public OfficeUser authenticate(String email, String password) {
        OfficeUser user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Check if account lock has expired
        if (user.getLockoutEndTime() != null && LocalDateTime.now().isAfter(user.getLockoutEndTime())) {
            user.setAccountLocked(false);
            user.setFailedLoginAttempts(0);
            user.setLockoutEndTime(null);
            userRepository.save(user);
        }

        if (user.isAccountLocked()) {
            throw new InvalidCredentialsException("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 3) {
                user.setAccountLocked(true);
                user.setLockoutEndTime(LocalDateTime.now().plusMinutes(15));
                log.warn("Account locked for: {} after {} failed attempts", email, attempts);
            }
            userRepository.save(user);
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Your account has been disabled. Please contact your administrator.");
        }

        // Reset failed attempts on success
        if (user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            user.setAccountLocked(false);
            user.setLockoutEndTime(null);
            userRepository.save(user);
        }

        return user;
    }

    @Transactional(readOnly = true)
    public Optional<OfficeUser> findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim());
    }

    @Transactional(readOnly = true)
    public OfficeUser findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<OfficeUser> getUsersByCompany(Long companyId) {
        return userRepository.findByCompanyIdAndIsEnabledTrue(companyId);
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        OfficeUser user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLockoutEndTime(null);
        userRepository.save(user);
        log.info("Password reset for: {}", email);
    }

    @Transactional(readOnly = true)
    public OfficeUser getUserById(Long id) {
        return findById(id);
    }

    @Transactional(readOnly = true)
    public List<OfficeUser> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public OfficeUser updateUser(OfficeUser user) {
        return userRepository.save(user);
    }

    @Transactional
    public OfficeUser updateUser(Long id, Map<String, Object> body) {
        OfficeUser user = findById(id);
        if (body.containsKey("firstName") && body.get("firstName") != null) {
            user.setFirstName(((String) body.get("firstName")).trim());
        }
        if (body.containsKey("lastName") && body.get("lastName") != null) {
            user.setLastName(((String) body.get("lastName")).trim());
        }
        if (body.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) body.get("phoneNumber"));
        }
        if (body.containsKey("role") && body.get("role") != null) {
            try {
                user.setRole(OfficeUserRole.valueOf(((String) body.get("role")).toUpperCase()));
            } catch (IllegalArgumentException ignored) { }
        }
        if (body.containsKey("departmentId")) {
            Object deptId = body.get("departmentId");
            user.setDepartmentId(deptId != null ? Long.valueOf(deptId.toString()) : null);
        }
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long id, String currentPassword, String newPassword) {
        OfficeUser user = findById(id);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", id);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        OfficeUser user = findById(userId);
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User deactivated: {}", userId);
    }
}
