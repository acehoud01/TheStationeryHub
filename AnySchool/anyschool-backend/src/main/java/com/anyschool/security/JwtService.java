package com.anyschool.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT Service
 * 
 * Handles JWT token generation, validation, and extraction using JWT 0.12.6 API.
 * 
 * IMPORTANT: Uses JWT 0.12.6 API (NOT the old 0.11.x API!)
 * - Jwts.builder() with .subject(), .expiration(), .signWith()
 * - Jwts.parser().verifyWith().build().parseSignedClaims()
 * 
 * Phase 2: Token generation and validation
 * Phase 3: Used by authentication controllers and filters
 */
@Service
@Slf4j
public class JwtService {

    /**
     * JWT secret key from environment variable
     * 
     * CRITICAL: Must be at least 256 bits (32 characters) for HS256 algorithm
     * Set via environment variable: JWT_SECRET
     * 
     * Example: export JWT_SECRET=my-super-secret-key-must-be-at-least-32-characters-long
     */
    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Token expiration time in milliseconds
     * Default: 24 hours (86400000 ms)
     */
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    /**
     * Generate JWT token for a user
     * 
     * Creates a JWT token with:
     * - Subject: user's email
     * - Issued at: current time
     * - Expiration: 24 hours from now
     * - Signature: HS256 with secret key
     * 
     * @param email User's email address (used as subject)
     * @return JWT token string
     */
    public String generateToken(String email) {
        log.debug("Generating JWT token for email: {}", email);

        String token = Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();

        log.debug("JWT token generated successfully for: {}", email);
        return token;
    }

    /**
     * Extract email (subject) from JWT token
     * 
     * Parses the token and extracts the subject claim (email).
     * 
     * @param token JWT token string
     * @return Email address from token subject
     * @throws io.jsonwebtoken.JwtException if token is invalid
     */
    public String extractEmail(String token) {
        log.debug("Extracting email from JWT token");
        
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        
        String email = claims.getSubject();
        log.debug("Extracted email: {}", email);
        
        return email;
    }

    /**
     * Validate JWT token
     * 
     * Checks if:
     * 1. Token can be parsed (signature valid)
     * 2. Token is not expired
     * 3. Token's subject matches the provided email
     * 
     * @param token JWT token string
     * @param email Email to validate against token subject
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token, String email) {
        log.debug("Validating JWT token for email: {}", email);
        
        try {
            String extractedEmail = extractEmail(token);
            boolean isValid = extractedEmail.equals(email) && !isTokenExpired(token);
            
            if (isValid) {
                log.debug("JWT token is valid for: {}", email);
            } else {
                log.warn("JWT token validation failed for: {}", email);
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("JWT token validation error: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if token is expired
     * 
     * @param token JWT token string
     * @return true if token is expired, false otherwise
     */
    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        boolean expired = expiration.before(new Date());
        
        if (expired) {
            log.debug("JWT token is expired. Expiration: {}", expiration);
        }      
        return expired;
    }

    /**
     * Extract expiration date from token
     * 
     * @param token JWT token string
     * @return Expiration date
     */
    private Date extractExpiration(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        
        return claims.getExpiration();
    }

    /**
     * Get signing key for JWT
     * 
     * Converts the JWT secret string to a SecretKey for HS256 algorithm.
     * 
     * CRITICAL: Secret must be at least 256 bits (32 characters) for HS256
     * 
     * @return SecretKey for signing/verifying JWTs
     */
    private SecretKey getSigningKey() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT secret is not configured. Set JWT_SECRET.");
        }

        if (jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters.");
        }

        // Convert secret string to bytes using UTF-8
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        
        // Create HMAC-SHA key for HS256 algorithm
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
