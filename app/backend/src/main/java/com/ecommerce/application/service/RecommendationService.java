package com.ecommerce.application.service;

import com.ecommerce.domain.recommendation.RecommendationType;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.ProductRecommendationJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.ProductJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.ProductRecommendationJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing product recommendations
 */
@Service
@Transactional
public class RecommendationService {
    
    private final ProductRecommendationJpaRepository recommendationRepository;
    private final ProductJpaRepository productRepository;
    
    @Autowired
    public RecommendationService(ProductRecommendationJpaRepository recommendationRepository,
                               ProductJpaRepository productRepository) {
        this.recommendationRepository = recommendationRepository;
        this.productRepository = productRepository;
    }
    
    /**
     * Get recommendations for a specific product
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getRecommendationsForProduct(String productId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<ProductRecommendationJpaEntity> recommendations = 
            recommendationRepository.findActiveRecommendationsByProductId(productId, pageable);
        
        return recommendations.getContent().stream()
                .map(ProductRecommendationJpaEntity::getRecommendedProduct)
                .toList();
    }
    
    /**
     * Get recommendations for a specific product by type
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getRecommendationsByType(String productId, RecommendationType type, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<ProductRecommendationJpaEntity> recommendations = 
            recommendationRepository.findActiveRecommendationsByProductIdAndType(productId, type, pageable);
        
        return recommendations.getContent().stream()
                .map(ProductRecommendationJpaEntity::getRecommendedProduct)
                .toList();
    }
    
    /**
     * Get all recommendations for a product (including metadata)
     */
    @Transactional(readOnly = true)
    public List<ProductRecommendationJpaEntity> getFullRecommendationsForProduct(String productId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<ProductRecommendationJpaEntity> recommendations = 
            recommendationRepository.findActiveRecommendationsByProductId(productId, pageable);
        
        return recommendations.getContent();
    }
    
    /**
     * Create a new recommendation
     */
    public ProductRecommendationJpaEntity createRecommendation(String sourceProductId, 
                                                             String recommendedProductId,
                                                             RecommendationType type, 
                                                             BigDecimal score, 
                                                             String reason) {
        // Validate products exist
        ProductJpaEntity sourceProduct = productRepository.findById(sourceProductId)
                .orElseThrow(() -> new IllegalArgumentException("Source product not found: " + sourceProductId));
        
        ProductJpaEntity recommendedProduct = productRepository.findById(recommendedProductId)
                .orElseThrow(() -> new IllegalArgumentException("Recommended product not found: " + recommendedProductId));
        
        // Check if recommendation already exists
        if (recommendationRepository.existsBySourceProductIdAndRecommendedProductIdAndRecommendationType(
                sourceProductId, recommendedProductId, type)) {
            throw new IllegalArgumentException("Recommendation already exists");
        }
        
        // Create recommendation
        ProductRecommendationJpaEntity recommendation = new ProductRecommendationJpaEntity(
                UUID.randomUUID().toString(),
                sourceProduct,
                recommendedProduct,
                type,
                score,
                reason
        );
        
        return recommendationRepository.save(recommendation);
    }
    
    /**
     * Update recommendation score
     */
    public ProductRecommendationJpaEntity updateRecommendationScore(String recommendationId, BigDecimal newScore) {
        ProductRecommendationJpaEntity recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found: " + recommendationId));
        
        recommendation.setScore(newScore);
        return recommendationRepository.save(recommendation);
    }
    
    /**
     * Activate recommendation
     */
    public ProductRecommendationJpaEntity activateRecommendation(String recommendationId) {
        ProductRecommendationJpaEntity recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found: " + recommendationId));
        
        recommendation.activate();
        return recommendationRepository.save(recommendation);
    }
    
    /**
     * Deactivate recommendation
     */
    public ProductRecommendationJpaEntity deactivateRecommendation(String recommendationId) {
        ProductRecommendationJpaEntity recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found: " + recommendationId));
        
        recommendation.deactivate();
        return recommendationRepository.save(recommendation);
    }
    
    /**
     * Delete recommendation
     */
    public void deleteRecommendation(String recommendationId) {
        if (!recommendationRepository.existsById(recommendationId)) {
            throw new IllegalArgumentException("Recommendation not found: " + recommendationId);
        }
        
        recommendationRepository.deleteById(recommendationId);
    }
    
    /**
     * Delete all recommendations for a product
     */
    public void deleteRecommendationsForProduct(String productId) {
        recommendationRepository.deleteBySourceProductId(productId);
    }
    
    /**
     * Generate recommendations for a product based on business logic
     */
    public void generateRecommendationsForProduct(String productId) {
        ProductJpaEntity sourceProduct = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        
        // Clear existing recommendations
        deleteRecommendationsForProduct(productId);
        
        // Generate category-based recommendations
        generateCategoryBasedRecommendations(sourceProduct);
        
        // Generate brand-based recommendations
        generateBrandBasedRecommendations(sourceProduct);
        
        // Generate price-based recommendations
        generatePriceBasedRecommendations(sourceProduct);
    }
    
    /**
     * Generate recommendations for all products
     */
    public void generateAllRecommendations() {
        List<ProductJpaEntity> allProducts = productRepository.findAll();
        
        for (ProductJpaEntity product : allProducts) {
            try {
                generateRecommendationsForProduct(product.getId());
            } catch (Exception e) {
                // Log error but continue with other products
                System.err.println("Failed to generate recommendations for product: " + product.getId() + " - " + e.getMessage());
            }
        }
    }
    
    /**
     * Get recommendation statistics
     */
    @Transactional(readOnly = true)
    public long getRecommendationCount(String productId) {
        return recommendationRepository.countBySourceProductIdAndActiveTrue(productId);
    }
    
    /**
     * Get recommendation count by type
     */
    @Transactional(readOnly = true)
    public long getRecommendationCountByType(String productId, RecommendationType type) {
        return recommendationRepository.countBySourceProductIdAndRecommendationTypeAndActiveTrue(productId, type);
    }
    
    // Private helper methods
    
    private void generateCategoryBasedRecommendations(ProductJpaEntity sourceProduct) {
        List<ProductJpaEntity> sameCategoryProducts = productRepository
                .findByCategory_IdAndStatusAndStockQuantityGreaterThan(
                        sourceProduct.getCategory().getId(), 
                        sourceProduct.getStatus(), 
                        0);
        
        sameCategoryProducts.stream()
                .filter(p -> !p.getId().equals(sourceProduct.getId()))
                .limit(5)
                .forEach(product -> {
                    try {
                        createRecommendation(
                                sourceProduct.getId(),
                                product.getId(),
                                RecommendationType.CATEGORY_RELATED,
                                BigDecimal.valueOf(0.8),
                                "Same category: " + sourceProduct.getCategory().getName()
                        );
                    } catch (Exception e) {
                        // Skip if recommendation already exists
                    }
                });
    }
    
    private void generateBrandBasedRecommendations(ProductJpaEntity sourceProduct) {
        List<ProductJpaEntity> sameBrandProducts = productRepository
                .findByBrandAndStatusAndStockQuantityGreaterThan(
                        sourceProduct.getBrand(), 
                        sourceProduct.getStatus(), 
                        0);
        
        sameBrandProducts.stream()
                .filter(p -> !p.getId().equals(sourceProduct.getId()))
                .limit(3)
                .forEach(product -> {
                    try {
                        createRecommendation(
                                sourceProduct.getId(),
                                product.getId(),
                                RecommendationType.BRAND_RELATED,
                                BigDecimal.valueOf(0.7),
                                "Same brand: " + sourceProduct.getBrand()
                        );
                    } catch (Exception e) {
                        // Skip if recommendation already exists
                    }
                });
    }
    
    private void generatePriceBasedRecommendations(ProductJpaEntity sourceProduct) {
        BigDecimal minPrice = sourceProduct.getPrice().multiply(BigDecimal.valueOf(0.8));
        BigDecimal maxPrice = sourceProduct.getPrice().multiply(BigDecimal.valueOf(1.2));
        
        List<ProductJpaEntity> similarPriceProducts = productRepository
                .findByPriceBetweenAndStatusAndStockQuantityGreaterThan(
                        minPrice, maxPrice, sourceProduct.getStatus(), 0);
        
        similarPriceProducts.stream()
                .filter(p -> !p.getId().equals(sourceProduct.getId()))
                .limit(3)
                .forEach(product -> {
                    try {
                        createRecommendation(
                                sourceProduct.getId(),
                                product.getId(),
                                RecommendationType.PRICE_SIMILAR,
                                BigDecimal.valueOf(0.6),
                                "Similar price range"
                        );
                    } catch (Exception e) {
                        // Skip if recommendation already exists
                    }
                });
    }
} 