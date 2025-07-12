package com.ecommerce.config;

import com.ecommerce.infrastructure.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security Configuration for the E-Commerce Backend
 * 
 * This configuration sets up:
 * - CORS support for frontend communication
 * - Stateless session management for REST APIs
 * - Public endpoints for development/testing
 * - Password encoding
 * - Authentication manager for user authentication
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configure the security filter chain
     * 
     * @param http HttpSecurity configuration
     * @return SecurityFilterChain with CORS and basic security setup
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS with our custom configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // Disable CSRF for REST APIs (stateless)
            .csrf(csrf -> csrf.disable())
            
            // Configure session management to be stateless
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configure authorization rules
            .authorizeHttpRequests(authz -> authz
                // Allow public access to API docs and health endpoints
                .requestMatchers(
                    "/api/swagger-ui/**",
                    "/api/api-docs/**",
                    "/api/actuator/health",
                    "/api/actuator/info"
                ).permitAll()
                
                // Allow public access to auth endpoints
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/refresh",
                    "/api/test/**"
                ).permitAll()
                
                // Allow public access to cart endpoints for guest users
                .requestMatchers(
                    "/api/cart/**",
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/recommendations/**",
                    "/api/payment/**"  // Temporarily public for testing
                ).permitAll()
                
                // Require authentication for all other API endpoints
                .requestMatchers("/api/**").authenticated()
                
                // Allow all other requests for development
                .anyRequest().permitAll()
            )
            
            // Configure headers for better security
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())
                .contentTypeOptions(contentTypeOptions -> {})
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true)
                )
            )
            
            // Add JWT authentication filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Password encoder bean for secure password handling
     * 
     * @return BCryptPasswordEncoder for password encoding
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * Authentication manager bean for user authentication
     * 
     * @param authenticationConfiguration Spring's authentication configuration
     * @return AuthenticationManager for authentication processing
     * @throws Exception if configuration fails
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
} 