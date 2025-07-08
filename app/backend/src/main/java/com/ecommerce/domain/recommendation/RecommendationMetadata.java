package com.ecommerce.domain.recommendation;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Domain entity representing metadata for product recommendations
 */
@Entity
@Table(name = "recommendation_metadata")
public class RecommendationMetadata {
    
    @Id
    @Column(name = "id", length = 36)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private ProductRecommendation recommendation;
    
    @Column(name = "metadata_key", nullable = false, length = 100)
    @NotNull(message = "Metadata key is required")
    @Size(max = 100, message = "Metadata key must not exceed 100 characters")
    private String metadataKey;
    
    @Column(name = "metadata_value", columnDefinition = "TEXT")
    private String metadataValue;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public RecommendationMetadata() {}
    
    public RecommendationMetadata(String id, ProductRecommendation recommendation, 
                                String metadataKey, String metadataValue) {
        this.id = id;
        this.recommendation = recommendation;
        this.metadataKey = metadataKey;
        this.metadataValue = metadataValue;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public ProductRecommendation getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(ProductRecommendation recommendation) {
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecommendationMetadata that = (RecommendationMetadata) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "RecommendationMetadata{" +
                "id='" + id + '\'' +
                ", metadataKey='" + metadataKey + '\'' +
                ", metadataValue='" + metadataValue + '\'' +
                '}';
    }
} 