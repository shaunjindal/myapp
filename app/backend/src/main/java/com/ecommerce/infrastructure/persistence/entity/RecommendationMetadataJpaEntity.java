package com.ecommerce.infrastructure.persistence.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * JPA Entity for recommendation metadata
 */
@Entity
@Table(name = "recommendation_metadata")
public class RecommendationMetadataJpaEntity extends BaseJpaEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private ProductRecommendationJpaEntity recommendation;
    
    @Column(name = "metadata_key", nullable = false, length = 100)
    @NotNull(message = "Metadata key is required")
    @Size(max = 100, message = "Metadata key must not exceed 100 characters")
    private String metadataKey;
    
    @Column(name = "metadata_value", columnDefinition = "TEXT")
    private String metadataValue;
    
    // Constructors
    public RecommendationMetadataJpaEntity() {}
    
    public RecommendationMetadataJpaEntity(String id, ProductRecommendationJpaEntity recommendation,
                                         String metadataKey, String metadataValue) {
        super(id);
        this.recommendation = recommendation;
        this.metadataKey = metadataKey;
        this.metadataValue = metadataValue;
    }
    
    // Getters and Setters
    public ProductRecommendationJpaEntity getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(ProductRecommendationJpaEntity recommendation) {
        this.recommendation = recommendation;
    }
    
    public String getMetadataKey() {
        return metadataKey;
    }
    
    public void setMetadataKey(String metadataKey) {
        this.metadataKey = metadataKey;
    }
    
    public String getMetadataValue() {
        return metadataValue;
    }
    
    public void setMetadataValue(String metadataValue) {
        this.metadataValue = metadataValue;
    }
    
    @Override
    public String toString() {
        return "RecommendationMetadataJpaEntity{" +
                "id='" + getId() + '\'' +
                ", metadataKey='" + metadataKey + '\'' +
                ", metadataValue='" + metadataValue + '\'' +
                '}';
    }
} 