package com.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.Optional;

/**
 * JPA configuration class for database persistence settings.
 * Enables JPA auditing, repository scanning, and transaction management.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableJpaRepositories(
    basePackages = "com.ecommerce.infrastructure.persistence.repository",
    repositoryImplementationPostfix = "Impl"
)
@EnableTransactionManagement
public class JpaConfig {
    
    /**
     * Provides the current auditor for JPA auditing.
     * Returns the username of the currently authenticated user,
     * or "system" for system operations.
     * 
     * @return AuditorAware implementation
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.of("system");
            }
            
            String username = authentication.getName();
            return Optional.of(username != null ? username : "system");
        };
    }
} 