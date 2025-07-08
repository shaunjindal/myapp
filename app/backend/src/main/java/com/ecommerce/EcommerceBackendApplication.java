package com.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main Spring Boot application class for the E-Commerce Backend
 * 
 * This application follows a modular architecture with the following key principles:
 * - Separation of concerns with layered architecture
 * - Interface-driven design for loose coupling
 * - Dependency injection for testability
 * - Async processing support for better performance
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
public class EcommerceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceBackendApplication.class, args);
    }
} 