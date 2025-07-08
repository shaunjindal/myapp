package com.ecommerce.controller;

import com.ecommerce.application.dto.CreateRecommendationRequest;
import com.ecommerce.application.service.RecommendationService;
import com.ecommerce.domain.recommendation.RecommendationType;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.ProductRecommendationJpaEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for product recommendations
 */
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    @Autowired
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }
    
    /**
     * Get recommendations for a specific product
     */
    @GetMapping("/products/{productId}")
    public ResponseEntity<List<ProductJpaEntity>> getRecommendationsForProduct(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            List<ProductJpaEntity> recommendations = recommendationService.getRecommendationsForProduct(productId, limit);
            return ResponseEntity.ok(recommendations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get recommendations for a specific product by type
     */
    @GetMapping("/products/{productId}/type/{type}")
    public ResponseEntity<List<ProductJpaEntity>> getRecommendationsByType(
            @PathVariable String productId,
            @PathVariable RecommendationType type,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            List<ProductJpaEntity> recommendations = recommendationService.getRecommendationsByType(productId, type, limit);
            return ResponseEntity.ok(recommendations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get full recommendations with metadata for a specific product
     */
    @GetMapping("/products/{productId}/full")
    public ResponseEntity<List<ProductRecommendationJpaEntity>> getFullRecommendationsForProduct(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            List<ProductRecommendationJpaEntity> recommendations = 
                recommendationService.getFullRecommendationsForProduct(productId, limit);
            return ResponseEntity.ok(recommendations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Create a new recommendation
     */
    @PostMapping
    public ResponseEntity<ProductRecommendationJpaEntity> createRecommendation(
            @Valid @RequestBody CreateRecommendationRequest request) {
        try {
            ProductRecommendationJpaEntity recommendation = recommendationService.createRecommendation(
                    request.getSourceProductId(), 
                    request.getRecommendedProductId(), 
                    request.getType(), 
                    request.getScore(), 
                    request.getReason());
            return ResponseEntity.status(HttpStatus.CREATED).body(recommendation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update recommendation score
     */
    @PutMapping("/{recommendationId}/score")
    public ResponseEntity<ProductRecommendationJpaEntity> updateRecommendationScore(
            @PathVariable String recommendationId,
            @RequestParam BigDecimal score) {
        try {
            ProductRecommendationJpaEntity recommendation = 
                recommendationService.updateRecommendationScore(recommendationId, score);
            return ResponseEntity.ok(recommendation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Activate recommendation
     */
    @PatchMapping("/{recommendationId}/activate")
    public ResponseEntity<ProductRecommendationJpaEntity> activateRecommendation(@PathVariable String recommendationId) {
        try {
            ProductRecommendationJpaEntity recommendation = 
                recommendationService.activateRecommendation(recommendationId);
            return ResponseEntity.ok(recommendation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Deactivate recommendation
     */
    @PatchMapping("/{recommendationId}/deactivate")
    public ResponseEntity<ProductRecommendationJpaEntity> deactivateRecommendation(@PathVariable String recommendationId) {
        try {
            ProductRecommendationJpaEntity recommendation = 
                recommendationService.deactivateRecommendation(recommendationId);
            return ResponseEntity.ok(recommendation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete recommendation
     */
    @DeleteMapping("/{recommendationId}")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable String recommendationId) {
        try {
            recommendationService.deleteRecommendation(recommendationId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete all recommendations for a product
     */
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteRecommendationsForProduct(@PathVariable String productId) {
        recommendationService.deleteRecommendationsForProduct(productId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Generate recommendations for a specific product
     */
    @PostMapping("/products/{productId}/generate")
    public ResponseEntity<Map<String, Object>> generateRecommendationsForProduct(@PathVariable String productId) {
        try {
            recommendationService.generateRecommendationsForProduct(productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Recommendations generated successfully");
            response.put("productId", productId);
            response.put("recommendationCount", recommendationService.getRecommendationCount(productId));
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Generate recommendations for all products
     */
    @PostMapping("/generate-all")
    public ResponseEntity<Map<String, Object>> generateAllRecommendations() {
        recommendationService.generateAllRecommendations();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Recommendations generation started for all products");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recommendation statistics for a product
     */
    @GetMapping("/products/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getRecommendationStats(@PathVariable String productId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecommendations", recommendationService.getRecommendationCount(productId));
        stats.put("categoryRelated", recommendationService.getRecommendationCountByType(productId, RecommendationType.CATEGORY_RELATED));
        stats.put("brandRelated", recommendationService.getRecommendationCountByType(productId, RecommendationType.BRAND_RELATED));
        stats.put("priceSimilar", recommendationService.getRecommendationCountByType(productId, RecommendationType.PRICE_SIMILAR));
        stats.put("similar", recommendationService.getRecommendationCountByType(productId, RecommendationType.SIMILAR));
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get available recommendation types
     */
    @GetMapping("/types")
    public ResponseEntity<RecommendationType[]> getRecommendationTypes() {
        return ResponseEntity.ok(RecommendationType.values());
    }
} 