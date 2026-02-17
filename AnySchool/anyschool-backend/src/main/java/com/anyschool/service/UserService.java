package com.anyschool.service;

import com.anyschool.exception.EmailAlreadyExistsException;
import com.anyschool.exception.InvalidCredentialsException;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * User Service
 * 
 * Handles user business logic including:
 * - User creation with password hashing
 * - User authentication
 * - User retrieval
 * 
 * Phase 3: Authentication and user management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Create a new user
     * 
     * Validates email uniqueness and hashes password before saving.
     * 
     * @param email User's email
     * @param password Plain text password (will be hashed)
     * @param fullName User's full name
     * @param phoneNumber User's phone number
     * @param role User's role
     * @return Created user
     * @throws EmailAlreadyExistsException if email already exists
     */
    @Transactional
    public User createUser(String email, String password, String fullName, String phoneNumber, UserRole role) {
        log.info("Creating user with email: {}", email);
        
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            log.warn("Email already exists: {}", email);
            throw new EmailAlreadyExistsException("This email address is already registered. Please use a different email or sign in.");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // Hash password
        user.setFullName(fullName);
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        
        // Save user
        User savedUser = userRepository.save(user);
        log.info("User created successfully: {} with role: {}", email, role);
        
        return savedUser;
    }

    /**
     * Authenticate user with email and password
     * 
     * @param email User's email
     * @param password Plain text password
     * @return Authenticated user
     * @throws InvalidCredentialsException if credentials are invalid
     */
    @Transactional
    public User authenticate(String email, String password) {
        log.info("Authenticating user: {}", email);
        
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Authentication failed: User not found - {}", email);
                    return new InvalidCredentialsException("Invalid email or password");
                });
        
        // Check if account is locked
        if (user.getAccountLockedUntil() != null && 
            java.time.LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
            log.warn("Authentication failed: Account locked until {} for user - {}", 
                    user.getAccountLockedUntil(), email);
            throw new InvalidCredentialsException(
                "Account is temporarily locked due to multiple failed login attempts. " +
                "Please try again later or use 'Forgot Password' to reset your password immediately."
            );
        }
        
        // If lock period has expired, clear the lock
        if (user.getAccountLockedUntil() != null && 
            java.time.LocalDateTime.now().isAfter(user.getAccountLockedUntil())) {
            user.setAccountLockedUntil(null);
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            // Increment failed login attempts
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            
            // Lock account after 3 failed attempts for 15 minutes
            if (attempts >= 3) {
                user.setAccountLockedUntil(java.time.LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);
                log.warn("Account locked for 15 minutes after {} failed attempts - {}", attempts, email);
                throw new InvalidCredentialsException(
                    "Account locked due to multiple failed login attempts. " +
                    "Please try again in 15 minutes."
                );
            }
            
            userRepository.save(user);
            log.warn("Authentication failed: Invalid password for user - {} (attempt {}/3)", email, attempts);
            throw new InvalidCredentialsException("Invalid email or password");
        }
        
        // Successful login - reset failed attempts
        if (user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            userRepository.save(user);
        }
        
        log.info("User authenticated successfully: {}", email);
        return user;
    }

    /**
     * Find user by email
     * 
     * @param email User's email
     * @return Optional user
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find user by ID
     * 
     * @param id User's ID
     * @return Optional user
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Reset user password
     * 
     * @param email User's email
     * @param newPassword New plain text password (will be hashed)
     */
    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Hash and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Clear password reset token
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        
        // Clear account lockout if present
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        
        userRepository.save(user);
        log.info("Password reset successfully for user: {}", email);
    }
}
