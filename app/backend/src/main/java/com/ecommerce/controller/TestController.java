package com.ecommerce.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Test Controller for verifying API connectivity and CORS configuration
 * 
 * This controller provides simple endpoints for testing:
 * - Basic GET request handling
 * - CORS configuration
 * - JSON response formatting
 * - Server status information
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    /**
     * Simple health check endpoint
     * 
     * @return ResponseEntity with server status information
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "E-Commerce Backend is running successfully");
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

    /**
     * CORS test endpoint
     * 
     * @return ResponseEntity with CORS test information
     */
    @GetMapping("/cors")
    public ResponseEntity<Map<String, Object>> corsTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("corsEnabled", true);
        response.put("message", "CORS is configured correctly");
        response.put("timestamp", LocalDateTime.now());
        response.put("supportedMethods", new String[]{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"});
        
        return ResponseEntity.ok(response);
    }

    /**
     * Echo endpoint for testing POST requests
     * 
     * @param payload Request body to echo back
     * @return ResponseEntity with echoed payload
     */
    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Echo successful");
        response.put("timestamp", LocalDateTime.now());
        response.put("receivedPayload", payload != null ? payload : "No payload received");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Environment information endpoint
     * 
     * @return ResponseEntity with environment details
     */
    @GetMapping("/env")
    public ResponseEntity<Map<String, Object>> environment() {
        Map<String, Object> response = new HashMap<>();
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("springProfile", System.getProperty("spring.profiles.active", "default"));
        response.put("serverPort", "8080");
        response.put("contextPath", "/api");
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
} 