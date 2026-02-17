package com.anyschool.security;

import com.anyschool.model.User;
import com.anyschool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom UserDetailsService
 * 
 * Loads User entity by email for Spring Security authentication.
 * 
 * CRITICAL: Returns User entity which implements UserDetails.
 * This ensures the principal in SecurityContext is the full User object,
 * not just a username string.
 * 
 * Phase 2: Basic user loading
 * Phase 3: Used by JWT filter and authentication provider
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by email (username)
     * 
     * Spring Security calls this method to load user details.
     * We use email as the username.
     * 
     * IMPORTANT: Returns User entity which implements UserDetails.
     * 
     * @param email User's email address (used as username)
     * @return UserDetails (User entity)
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
        
        log.debug("User found: {} with role: {}", user.getEmail(), user.getRole());
        return user; // User implements UserDetails
    }
}
