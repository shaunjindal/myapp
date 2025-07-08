package com.ecommerce.application.dto;

import com.ecommerce.domain.recommendation.RecommendationType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * DTO for creating a new product recommendation
 */
public class CreateRecommendationRequest {
    
    @NotBlank(message = "Source product ID is required")
    private String sourceProductId;
    
    @NotBlank(message = "Recommended product ID is required")
    private String recommendedProductId;
    
    @NotNull(message = "Recommendation type is required")
    private RecommendationType type;
    
    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.0", message = "Score must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", message = "Score must be between 0.0 and 1.0")
    private BigDecimal score;
    
    private String reason;
    
    // Default constructor
    public CreateRecommendationRequest() {}
    
    // Constructor with all fields
    public CreateRecommendationRequest(String sourceProductId, String recommendedProductId, 
                                     RecommendationType type, BigDecimal score, String reason) {
        this.sourceProductId = sourceProductId;
        this.recommendedProductId = recommendedProductId;
        this.type = type;
        this.score = score;
        this.reason = reason;
    }
    
    // Getters and setters
    public String getSourceProductId() {
        return sourceProductId;
    }
    
    public void setSourceProductId(String sourceProductId) {
        this.sourceProductId = sourceProductId;
    }
    
    public String getRecommendedProductId() {
        return recommendedProductId;
    }
    
    public void setRecommendedProductId(String recommendedProductId) {
        this.recommendedProductId = recommendedProductId;
    }
    
    public RecommendationType getType() {
        return type;
    }
    
    public void setType(RecommendationType type) {
        this.type = type;
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
    
    @Override
    public String toString() {
        return "CreateRecommendationRequest{" +
                "sourceProductId='" + sourceProductId + '\'' +
                ", recommendedProductId='" + recommendedProductId + '\'' +
                ", type=" + type +
                ", score=" + score +
                ", reason='" + reason + '\'' +
                '}';
    }
} 