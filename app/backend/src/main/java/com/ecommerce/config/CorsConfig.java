package com.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS Configuration for the E-Commerce Backend
 * 
 * This configuration allows the frontend application to communicate with the backend APIs
 * by properly handling Cross-Origin Resource Sharing (CORS) requests.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Configuration
public class CorsConfig {

    /**
     * CORS configuration source that defines allowed origins, methods, and headers
     * 
     * @return CorsConfigurationSource with proper CORS settings
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend URLs
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",     // Any localhost port
            "http://127.0.0.1:*",     // Any 127.0.0.1 port
            "https://localhost:*",    // HTTPS localhost
            "exp://192.168.*:*",      // Expo tunnel
            "http://192.168.*:*",     // Local network
            "https://192.168.*:*"     // HTTPS local network
        ));
        
        // Allow all HTTP methods needed for REST API
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));
        
        // Allow all headers that the frontend might send
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With", 
            "Accept", 
            "Origin", 
            "Access-Control-Request-Method", 
            "Access-Control-Request-Headers",
            "X-CSRF-TOKEN",
            "X-Session-ID",
            "X-Device-Fingerprint",
            "X-User-ID"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Expose headers that the frontend might need
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Disposition",
            "X-Total-Count"
        ));
        
        // Set max age for preflight requests (1 hour)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
} 