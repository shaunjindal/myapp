package com.ecommerce.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;
/**
 * Base repository interface providing common CRUD operations for all entities.
 * This interface follows the Repository pattern and provides a consistent API
 * for data access operations across all domain entities.
 * 
 * @param <T> The domain entity type
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public interface BaseRepository<T> {
    
    /**
     * Save an entity
     * @param entity The entity to save
     * @return The saved entity
     */
    T save(T entity);
    
    /**
     * Save multiple entities
     * @param entities The entities to save
     * @return The saved entities
     */
    List<T> saveAll(Iterable<T> entities);
    
    /**
     * Find an entity by its ID
     * @param id The entity ID
     * @return Optional containing the entity if found
     */
    Optional<T> findById(String id);
    
    /**
     * Check if an entity exists by ID
     * @param id The entity ID
     * @return true if the entity exists, false otherwise
     */
    boolean existsById(String id);
    
    /**
     * Find all entities
     * @return List of all entities
     */
    List<T> findAll();
    
    /**
     * Find all entities with sorting
     * @param sort Sort specification
     * @return Sorted list of entities
     */
    List<T> findAll(Sort sort);
    
    /**
     * Find all entities with pagination
     * @param pageable Pagination information
     * @return Page of entities
     */
    Page<T> findAll(Pageable pageable);
    
    /**
     * Find entities by IDs
     * @param ids The entity IDs
     * @return List of found entities
     */
    List<T> findAllById(Iterable<String> ids);
    
    /**
     * Count all entities
     * @return Total count of entities
     */
    long count();
    
    /**
     * Delete an entity by ID
     * @param id The entity ID
     */
    void deleteById(String id);
    
    /**
     * Delete an entity
     * @param entity The entity to delete
     */
    void delete(T entity);
    
    /**
     * Delete multiple entities by IDs
     * @param ids The entity IDs
     */
    void deleteAllById(Iterable<String> ids);
    
    /**
     * Delete multiple entities
     * @param entities The entities to delete
     */
    void deleteAll(Iterable<T> entities);
    
    /**
     * Delete all entities
     */
    void deleteAll();
    
    /**
     * Flush pending changes to the database
     */
    void flush();
    
    /**
     * Save and flush an entity
     * @param entity The entity to save
     * @return The saved entity
     */
    T saveAndFlush(T entity);
    
    /**
     * Delete entities in batch
     * @param entities The entities to delete
     */
    void deleteInBatch(Iterable<T> entities);
    
    /**
     * Delete all entities in batch
     */
    void deleteAllInBatch();
} 