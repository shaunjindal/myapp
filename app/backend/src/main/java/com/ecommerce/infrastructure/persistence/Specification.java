package com.ecommerce.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Specification interface for building complex queries.
 * This interface follows the Specification pattern to allow
 * flexible and reusable query building for domain entities.
 * 
 * @param <T> The domain entity type
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public interface Specification<T> {
    
    /**
     * Find entities matching this specification
     * @param repository The repository to execute the query on
     * @return List of matching entities
     */
    List<T> findAll(BaseRepository<T> repository);
    
    /**
     * Find entities matching this specification with pagination
     * @param repository The repository to execute the query on
     * @param pageable Pagination information
     * @return Page of matching entities
     */
    Page<T> findAll(BaseRepository<T> repository, Pageable pageable);
    
    /**
     * Count entities matching this specification
     * @param repository The repository to execute the query on
     * @return Count of matching entities
     */
    long count(BaseRepository<T> repository);
    
    /**
     * Check if any entities match this specification
     * @param repository The repository to execute the query on
     * @return true if any entities match, false otherwise
     */
    boolean exists(BaseRepository<T> repository);
} 