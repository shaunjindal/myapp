package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.infrastructure.persistence.entity.RecommendationMetadataJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for RecommendationMetadata entities
 */
@Repository
public interface RecommendationMetadataJpaRepository extends JpaRepository<RecommendationMetadataJpaEntity, String> {
    
    /**
     * Find metadata by recommendation ID
     */
    List<RecommendationMetadataJpaEntity> findByRecommendationId(String recommendationId);
    
    /**
     * Find metadata by recommendation ID and key
     */
    Optional<RecommendationMetadataJpaEntity> findByRecommendationIdAndMetadataKey(String recommendationId, String key);
    
    /**
     * Find metadata by key across all recommendations
     */
    List<RecommendationMetadataJpaEntity> findByMetadataKey(String key);
    
    /**
     * Find metadata by key and value
     */
    List<RecommendationMetadataJpaEntity> findByMetadataKeyAndMetadataValue(String key, String value);
    
    /**
     * Delete metadata by recommendation ID
     */
    void deleteByRecommendationId(String recommendationId);
    
    /**
     * Delete metadata by recommendation ID and key
     */
    void deleteByRecommendationIdAndMetadataKey(String recommendationId, String key);
} 