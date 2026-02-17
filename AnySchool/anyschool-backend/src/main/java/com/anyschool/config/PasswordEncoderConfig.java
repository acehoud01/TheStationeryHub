package com.anyschool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Password Encoder Configuration
 * 
 * Provides BCryptPasswordEncoder for password hashing.
 * BCrypt is the recommended password hashing algorithm for Spring Security.
 * 
 * Phase 2: Used by DataInitializer for demo data
 * Phase 3: Used by authentication for login
 */
@Configuration
public class PasswordEncoderConfig {

    /**
     * BCrypt password encoder bean
     * 
     * BCrypt automatically:
     * - Adds salt (random data)
     * - Uses multiple rounds of hashing (default: 10)
     * - Makes rainbow table attacks infeasible
     * 
     * @return PasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
