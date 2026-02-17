package com.anyschool.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

/**
 * User Entity
 * 
 * Represents a user in the AnySchool system.
 * Implements UserDetails for Spring Security consistency.
 * 
 * Roles:
 * - PARENT: Parents who can view and donate
 * - SCHOOL_ADMIN: School administrators who manage school needs
 * - DONOR: Donors who can contribute
 * 
 * Phase 2: Basic user entity with validation
 * Phase 3: Will be used with JWT authentication
 */
@Entity
@Table(name = "users")
public class User implements UserDetails {

    public static final String UserRole = null;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String fullName;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Column(length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    /**
     * Whether the account is active. Admins can disable users.
     */
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;

    /**
     * Number of consecutive failed login attempts
     */
    @Column(nullable = false, columnDefinition = "int default 0")
    private int failedLoginAttempts = 0;

    /**
     * Timestamp until which the account is locked (null if not locked)
     */
    @Column(nullable = true)
    private LocalDateTime accountLockedUntil;

    /**
     * Whether the account is verified via OTP
     */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean verified = false;

    /**
     * OTP code for account verification
     */
    @Column(nullable = true, length = 6)
    private String otpCode;

    /**
     * OTP expiration time
     */
    @Column(nullable = true)
    private LocalDateTime otpExpiresAt;

    /**
     * Password reset token (OTP or UUID)
     */
    @Column(nullable = true, length = 64)
    private String passwordResetToken;

    /**
     * Password reset token expiration time
     */
    @Column(nullable = true)
    private LocalDateTime passwordResetTokenExpiresAt;

    /**
     * School ID (for SCHOOL_ADMIN role)
     * Links school admin to their school
     * Nullable - only set for school admins
     */
    @Column(nullable = true)
    private Long schoolId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Set timestamps before persisting
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Update timestamp before updating
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =========================================================================
    // UserDetails Interface Implementation (for Spring Security)
    // =========================================================================

    /**
     * Returns the authorities granted to the user.
     * Maps UserRole to GrantedAuthority.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }

    /**
     * Returns the username used to authenticate the user.
     * We use email as the username.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Returns the password used to authenticate the user.
     */
    @Override
    public String getPassword() {
        return password;
    }

    /**
     * Indicates whether the user's account has expired.
     * We don't implement account expiration yet.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is locked or unlocked.
     * Account is locked if accountLockedUntil is set and not yet expired.
     */
    @Override
    public boolean isAccountNonLocked() {
        if (accountLockedUntil == null) {
            return true;
        }
        // Check if lock period has expired
        return LocalDateTime.now().isAfter(accountLockedUntil);
    }

    /**
     * Indicates whether the user's credentials (password) has expired.
     * We don't implement credential expiration yet.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled or disabled.
     * Super admins can disable user accounts.
     */
    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    // =========================================================================
    // Getters and Setters
    // =========================================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Long getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(Long schoolId) {
        this.schoolId = schoolId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getAccountLockedUntil() {
        return accountLockedUntil;
    }

    public void setAccountLockedUntil(LocalDateTime accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public LocalDateTime getOtpExpiresAt() {
        return otpExpiresAt;
    }

    public void setOtpExpiresAt(LocalDateTime otpExpiresAt) {
        this.otpExpiresAt = otpExpiresAt;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public LocalDateTime getPasswordResetTokenExpiresAt() {
        return passwordResetTokenExpiresAt;
    }

    public void setPasswordResetTokenExpiresAt(LocalDateTime passwordResetTokenExpiresAt) {
        this.passwordResetTokenExpiresAt = passwordResetTokenExpiresAt;
    }

    // =========================================================================
    // toString (excluding password for security)
    // =========================================================================

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", role=" + role +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}