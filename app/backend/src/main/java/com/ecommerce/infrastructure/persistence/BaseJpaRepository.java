package com.ecommerce.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.UUID;

/**
 * Base JPA repository interface that extends Spring Data JPA functionality.
 * This interface provides integration between our custom repository pattern
 * and Spring Data JPA, offering both standard CRUD operations and
 * specification-based querying capabilities.
 * 
 * @param <T> The JPA entity type
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@NoRepositoryBean
public interface BaseJpaRepository<T> extends JpaRepository<T, String>, JpaSpecificationExecutor<T> {
    
    /**
     * Refresh the state of the instance from the database
     * @param entity The entity to refresh
     */
    default void refresh(T entity) {
        // This method can be implemented in specific repository implementations
        // if refresh functionality is needed
    }
    
    /**
     * Detach the entity from the persistence context
     * @param entity The entity to detach
     */
    default void detach(T entity) {
        // This method can be implemented in specific repository implementations
        // if detach functionality is needed
    }
} 