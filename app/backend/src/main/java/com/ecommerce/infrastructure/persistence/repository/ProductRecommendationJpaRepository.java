package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.recommendation.RecommendationType;
import com.ecommerce.infrastructure.persistence.entity.ProductRecommendationJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for ProductRecommendation entities
 */
@Repository
public interface ProductRecommendationJpaRepository extends JpaRepository<ProductRecommendationJpaEntity, String> {
    
    /**
     * Find recommendations for a specific product
     */
    @Query("SELECT pr FROM ProductRecommendationJpaEntity pr " +
           "JOIN FETCH pr.recommendedProduct rp " +
           "JOIN FETCH rp.category " +
           "WHERE pr.sourceProduct.id = :productId " +
           "AND pr.active = true " +
           "AND rp.status = 'ACTIVE' " +
           "AND rp.stockQuantity > 0 " +
           "ORDER BY pr.score DESC")
    List<ProductRecommendationJpaEntity> findActiveRecommendationsByProductId(@Param("productId") String productId);
    
    /**
     * Find recommendations for a specific product with pagination
     */
    @Query("SELECT pr FROM ProductRecommendationJpaEntity pr " +
           "JOIN FETCH pr.recommendedProduct rp " +
           "JOIN FETCH rp.category " +
           "WHERE pr.sourceProduct.id = :productId " +
           "AND pr.active = true " +
           "AND rp.status = 'ACTIVE' " +
           "AND rp.stockQuantity > 0 " +
           "ORDER BY pr.score DESC")
    Page<ProductRecommendationJpaEntity> findActiveRecommendationsByProductId(@Param("productId") String productId, Pageable pageable);
    
    /**
     * Find recommendations by type for a specific product
     */
    @Query("SELECT pr FROM ProductRecommendationJpaEntity pr " +
           "JOIN FETCH pr.recommendedProduct rp " +
           "JOIN FETCH rp.category " +
           "WHERE pr.sourceProduct.id = :productId " +
           "AND pr.recommendationType = :type " +
           "AND pr.active = true " +
           "AND rp.status = 'ACTIVE' " +
           "AND rp.stockQuantity > 0 " +
           "ORDER BY pr.score DESC")
    List<ProductRecommendationJpaEntity> findActiveRecommendationsByProductIdAndType(
            @Param("productId") String productId, 
            @Param("type") RecommendationType type);
    
    /**
     * Find recommendations by type for a specific product with pagination
     */
    @Query("SELECT pr FROM ProductRecommendationJpaEntity pr " +
           "JOIN FETCH pr.recommendedProduct rp " +
           "JOIN FETCH rp.category " +
           "WHERE pr.sourceProduct.id = :productId " +
           "AND pr.recommendationType = :type " +
           "AND pr.active = true " +
           "AND rp.status = 'ACTIVE' " +
           "AND rp.stockQuantity > 0 " +
           "ORDER BY pr.score DESC")
    Page<ProductRecommendationJpaEntity> findActiveRecommendationsByProductIdAndType(
            @Param("productId") String productId, 
            @Param("type") RecommendationType type, 
            Pageable pageable);
    
    /**
     * Find all recommendations for a product (including inactive)
     */
    List<ProductRecommendationJpaEntity> findBySourceProductIdOrderByScoreDesc(String productId);
    
    /**
     * Find recommendations by source product and recommendation type
     */
    List<ProductRecommendationJpaEntity> findBySourceProductIdAndRecommendationTypeOrderByScoreDesc(
            String productId, RecommendationType recommendationType);
    
    /**
     * Check if a recommendation exists between two products
     */
    boolean existsBySourceProductIdAndRecommendedProductIdAndRecommendationType(
            String sourceProductId, String recommendedProductId, RecommendationType recommendationType);
    
    /**
     * Find recommendations where the product is recommended (reverse lookup)
     */
    List<ProductRecommendationJpaEntity> findByRecommendedProductIdAndActiveTrue(String productId);
    
    /**
     * Count active recommendations for a product
     */
    long countBySourceProductIdAndActiveTrue(String productId);
    
    /**
     * Count recommendations by type for a product
     */
    long countBySourceProductIdAndRecommendationTypeAndActiveTrue(String productId, RecommendationType type);
    
    /**
     * Find top recommended products across all source products
     */
    @Query("SELECT pr FROM ProductRecommendationJpaEntity pr " +
           "JOIN FETCH pr.recommendedProduct rp " +
           "JOIN FETCH rp.category " +
           "WHERE pr.active = true " +
           "AND rp.status = 'ACTIVE' " +
           "AND rp.stockQuantity > 0 " +
           "GROUP BY pr.recommendedProduct.id " +
           "ORDER BY AVG(pr.score) DESC")
    List<ProductRecommendationJpaEntity> findTopRecommendedProducts(Pageable pageable);
    
    /**
     * Find recommendations with score above threshold
     */
    @Query("SELECT pr FROM ProductRecommendationJpaEntity pr " +
           "JOIN FETCH pr.recommendedProduct rp " +
           "JOIN FETCH rp.category " +
           "WHERE pr.sourceProduct.id = :productId " +
           "AND pr.score >= :minScore " +
           "AND pr.active = true " +
           "AND rp.status = 'ACTIVE' " +
           "AND rp.stockQuantity > 0 " +
           "ORDER BY pr.score DESC")
    List<ProductRecommendationJpaEntity> findRecommendationsWithMinScore(
            @Param("productId") String productId, 
            @Param("minScore") Double minScore);
    
    /**
     * Delete recommendations for a product
     */
    void deleteBySourceProductId(String productId);
    
    /**
     * Delete specific recommendation
     */
    void deleteBySourceProductIdAndRecommendedProductIdAndRecommendationType(
            String sourceProductId, String recommendedProductId, RecommendationType recommendationType);
} 