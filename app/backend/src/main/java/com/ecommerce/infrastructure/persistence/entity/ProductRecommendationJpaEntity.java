package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.recommendation.RecommendationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * JPA Entity for product recommendations
 */
@Entity
@Table(name = "product_recommendations")
public class ProductRecommendationJpaEntity extends BaseJpaEntity {
    
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
    
    @OneToMany(mappedBy = "recommendation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RecommendationMetadataJpaEntity> metadata;
    
    // Constructors
    public ProductRecommendationJpaEntity() {}
    
    public ProductRecommendationJpaEntity(String id, ProductJpaEntity sourceProduct, 
                                        ProductJpaEntity recommendedProduct,
                                        RecommendationType recommendationType, 
                                        BigDecimal score, String reason) {
        super(id);
        this.sourceProduct = sourceProduct;
        this.recommendedProduct = recommendedProduct;
        this.recommendationType = recommendationType;
        this.score = score;
        this.reason = reason;
        this.active = true;
    }
    
    // Getters and Setters
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
    
    public List<RecommendationMetadataJpaEntity> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(List<RecommendationMetadataJpaEntity> metadata) {
        this.metadata = metadata;
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
    
    @Override
    public String toString() {
        return "ProductRecommendationJpaEntity{" +
                "id='" + getId() + '\'' +
                ", recommendationType=" + recommendationType +
                ", score=" + score +
                ", reason='" + reason + '\'' +
                ", active=" + active +
                '}';
    }
} 