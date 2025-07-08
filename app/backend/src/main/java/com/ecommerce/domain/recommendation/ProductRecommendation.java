package com.ecommerce.domain.recommendation;

import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Domain entity representing a product recommendation relationship
 */
@Entity
@Table(name = "product_recommendations")
public class ProductRecommendation {
    
    @Id
    @Column(name = "id", length = 36)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_product_id", nullable = false)
    private ProductJpaEntity sourceProduct;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_product_id", nullable = false)
    private ProductJpaEntity recommendedProduct;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_type", nullable = false)
    private RecommendationType recommendationType;
    
    @Column(name = "score", precision = 3, scale = 2, nullable = false)
    @DecimalMin(value = "0.0", message = "Score must be non-negative")
    @DecimalMax(value = "1.0", message = "Score must not exceed 1.0")
    private BigDecimal score;
    
    @Column(name = "reason")
    @Size(max = 255, message = "Reason must not exceed 255 characters")
    private String reason;
    
    @Column(name = "active", nullable = false)
    private Boolean active = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "recommendation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RecommendationMetadata> metadata;
    
    // Constructors
    public ProductRecommendation() {}
    
    public ProductRecommendation(String id, ProductJpaEntity sourceProduct, ProductJpaEntity recommendedProduct, 
                               RecommendationType recommendationType, BigDecimal score, String reason) {
        this.id = id;
        this.sourceProduct = sourceProduct;
        this.recommendedProduct = recommendedProduct;
        this.recommendationType = recommendationType;
        this.score = score;
        this.reason = reason;
        this.active = true;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public ProductJpaEntity getSourceProduct() {
        return sourceProduct;
    }
    
    public void setSourceProduct(ProductJpaEntity sourceProduct) {
        this.sourceProduct = sourceProduct;
    }
    
    public ProductJpaEntity getRecommendedProduct() {
        return recommendedProduct;
    }
    
    public void setRecommendedProduct(ProductJpaEntity recommendedProduct) {
        this.recommendedProduct = recommendedProduct;
    }
    
    public RecommendationType getRecommendationType() {
        return recommendationType;
    }
    
    public void setRecommendationType(RecommendationType recommendationType) {
        this.recommendationType = recommendationType;
    }
    
    public BigDecimal getScore() {
        return score;
    }
    
    public void setScore(BigDecimal score) {
        this.score = score;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public List<RecommendationMetadata> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(List<RecommendationMetadata> metadata) {
        this.metadata = metadata;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Business methods
    public void activate() {
        this.active = true;
    }
    
    public void deactivate() {
        this.active = false;
    }
    
    public boolean isActive() {
        return Boolean.TRUE.equals(this.active);
    }
    
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductRecommendation that = (ProductRecommendation) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "ProductRecommendation{" +
                "id='" + id + '\'' +
                ", recommendationType=" + recommendationType +
                ", score=" + score +
                ", reason='" + reason + '\'' +
                ", active=" + active +
                '}';
    }
} 