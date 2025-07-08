package com.ecommerce.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Abstract base class for specifications providing common functionality
 * 
 * @param <T> The domain entity type
 */
public abstract class BaseSpecification<T> implements Specification<T> {
    
    @Override
    public List<T> findAll(BaseRepository<T> repository) {
        return executeQuery(repository);
    }
    
    @Override
    public Page<T> findAll(BaseRepository<T> repository, Pageable pageable) {
        return executeQuery(repository, pageable);
    }
    
    @Override
    public long count(BaseRepository<T> repository) {
        return executeCount(repository);
    }
    
    @Override
    public boolean exists(BaseRepository<T> repository) {
        return executeCount(repository) > 0;
    }
    
    /**
     * Execute the actual query logic
     * @param repository The repository to execute on
     * @return List of results
     */
    protected abstract List<T> executeQuery(BaseRepository<T> repository);
    
    /**
     * Execute the actual query logic with pagination
     * @param repository The repository to execute on
     * @param pageable Pagination information
     * @return Page of results
     */
    protected abstract Page<T> executeQuery(BaseRepository<T> repository, Pageable pageable);
    
    /**
     * Execute the count query
     * @param repository The repository to execute on
     * @return Count of results
     */
    protected abstract long executeCount(BaseRepository<T> repository);
} 