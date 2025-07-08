package com.ecommerce.controller;

import com.ecommerce.application.dto.auth.AuthenticationResponse;
import com.ecommerce.application.dto.auth.LoginRequest;
import com.ecommerce.application.dto.auth.UserRegistrationRequest;
import com.ecommerce.application.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Authentication
 * 
 * Handles user registration, login, logout, and token management
 * with proper validation and error handling.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthenticationService authenticationService;
    
    @Autowired
    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * User login endpoint
     * 
     * @param loginRequest User credentials
     * @param request HTTP request for IP extraction
     * @return Authentication response with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            logger.info("Login request received for email: {}", loginRequest.getEmail());
            
            String clientIp = getClientIpAddress(request);
            AuthenticationResponse response = authenticationService.login(loginRequest, clientIp);
            
            logger.info("Login successful for email: {}", loginRequest.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Login failed for email: {}", loginRequest.getEmail(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
    
    /**
     * User registration endpoint
     * 
     * @param registrationRequest User registration data
     * @return Authentication response with JWT token
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest registrationRequest) {
        try {
            logger.info("Registration request received for email: {}", registrationRequest.getEmail());
            
            AuthenticationResponse response = authenticationService.register(registrationRequest);
            
            logger.info("Registration successful for email: {}", registrationRequest.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Registration failed for email: {}", registrationRequest.getEmail(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        }
    }
    
    /**
     * User logout endpoint
     * 
     * @return Success response
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        logger.info("Logout request received");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Token refresh endpoint
     * 
     * @param request Request containing current token
     * @return New authentication response with refreshed token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, Object> request) {
        try {
            String token = (String) request.get("token");
            
            if (token == null || token.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Token is required");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            AuthenticationResponse response = authenticationService.refreshToken(token);
            
            logger.info("Token refreshed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Token refresh failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
    
    /**
     * Extract client IP address from request
     * 
     * @param request HTTP request
     * @return Client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 