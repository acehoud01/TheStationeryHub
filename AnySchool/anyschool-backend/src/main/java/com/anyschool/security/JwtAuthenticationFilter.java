package com.anyschool.security;

import com.anyschool.model.User;
import com.anyschool.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * 
 * Intercepts every HTTP request to validate JWT tokens.
 * 
 * Flow:
 * 1. Extract JWT token from Authorization header
 * 2. Extract email from token
 * 3. Load User entity from database
 * 4. Validate token against user's email
 * 5. Set authentication in SecurityContext with User as principal
 * 
 * CRITICAL: Sets User entity as principal (NOT just email string!)
 * This ensures controllers can access full User object via @AuthenticationPrincipal.
 * 
 * Phase 3: JWT-based authentication
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Extract Authorization header
        final String authHeader = request.getHeader("Authorization");
        
        // If no Authorization header or doesn't start with "Bearer ", skip this filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token found in request to: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2. Extract JWT token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            
            // 3. Extract email from token
            final String email = jwtService.extractEmail(jwt);
            
            log.debug("JWT token found for email: {}", email);

            // 4. If email exists and user is not already authenticated
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // 5. Load User entity from database
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
                
                // 6. Validate token
                if (jwtService.validateToken(jwt, email)) {
                    log.debug("JWT token is valid for: {}", email);
                    
                    // 7. Create authentication token with User entity as principal
                    // CRITICAL: First parameter is User entity (UserDetails), NOT email string!
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,                    // Principal: User entity (implements UserDetails)
                            null,                    // Credentials: null (already authenticated via JWT)
                            user.getAuthorities()    // Authorities: user's roles
                    );
                    
                    // Set request details
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 8. Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("Authentication set for user: {} with role: {}", email, user.getRole());
                } else {
                    log.warn("JWT token validation failed for: {}", email);
                }
            }
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage());
            // Don't throw exception - just let request proceed without authentication
            // Spring Security will handle unauthorized access
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
