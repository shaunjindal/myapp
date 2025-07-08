package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.infrastructure.persistence.entity.ProductSpecificationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Product Specifications
 * Handles data access operations for product specifications
 */
@Repository
public interface ProductSpecificationJpaRepository extends JpaRepository<ProductSpecificationJpaEntity, String> {

    /**
     * Find all specifications for a specific product
     * @param productId the product ID
     * @return list of product specifications ordered by display order
     */
    @Query("SELECT ps FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId ORDER BY ps.displayOrder ASC")
    List<ProductSpecificationJpaEntity> findByProductIdOrderByDisplayOrder(@Param("productId") String productId);

    /**
     * Find specification by product ID and key
     * @param productId the product ID
     * @param specKey the specification key
     * @return optional product specification
     */
    @Query("SELECT ps FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.specKey = :specKey")
    Optional<ProductSpecificationJpaEntity> findByProductIdAndSpecKey(@Param("productId") String productId, @Param("specKey") String specKey);

    /**
     * Find specifications by product ID and category
     * @param productId the product ID
     * @param specCategory the specification category
     * @return list of specifications in the specified category
     */
    @Query("SELECT ps FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.specCategory = :specCategory ORDER BY ps.displayOrder ASC")
    List<ProductSpecificationJpaEntity> findByProductIdAndSpecCategory(@Param("productId") String productId, @Param("specCategory") String specCategory);

    /**
     * Find all searchable specifications for a product
     * @param productId the product ID
     * @return list of searchable specifications
     */
    @Query("SELECT ps FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.isSearchable = true ORDER BY ps.displayOrder ASC")
    List<ProductSpecificationJpaEntity> findSearchableByProductId(@Param("productId") String productId);

    /**
     * Find all filterable specifications for a product
     * @param productId the product ID
     * @return list of filterable specifications
     */
    @Query("SELECT ps FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.isFilterable = true ORDER BY ps.displayOrder ASC")
    List<ProductSpecificationJpaEntity> findFilterableByProductId(@Param("productId") String productId);

    /**
     * Find visible specifications for a product
     * @param productId the product ID
     * @return list of visible specifications
     */
    @Query("SELECT ps FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.isVisible = true ORDER BY ps.displayOrder ASC")
    List<ProductSpecificationJpaEntity> findVisibleByProductId(@Param("productId") String productId);

    /**
     * Find specifications by key across all products
     * @param specKey the specification key
     * @return list of specifications with the specified key
     */
    @Query("SELECT ps FROM ProductSpecificationJpaEntity ps WHERE ps.specKey = :specKey")
    List<ProductSpecificationJpaEntity> findBySpecKey(@Param("specKey") String specKey);

    /**
     * Find distinct specification keys for a product
     * @param productId the product ID
     * @return list of distinct specification keys
     */
    @Query("SELECT DISTINCT ps.specKey FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId ORDER BY ps.specKey ASC")
    List<String> findDistinctSpecKeysByProductId(@Param("productId") String productId);

    /**
     * Find distinct specification categories for a product
     * @param productId the product ID
     * @return list of distinct specification categories
     */
    @Query("SELECT DISTINCT ps.specCategory FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.specCategory IS NOT NULL ORDER BY ps.specCategory ASC")
    List<String> findDistinctSpecCategoriesByProductId(@Param("productId") String productId);

    /**
     * Find products with a specific specification key-value pair
     * @param specKey the specification key
     * @param specValue the specification value
     * @return list of product IDs matching the specification
     */
    @Query("SELECT DISTINCT ps.product.id FROM ProductSpecificationJpaEntity ps WHERE ps.specKey = :specKey AND ps.specValue = :specValue")
    List<String> findProductIdsBySpecKeyAndValue(@Param("specKey") String specKey, @Param("specValue") String specValue);

    /**
     * Find products with a specific specification key
     * @param specKey the specification key
     * @return list of product IDs that have the specification key
     */
    @Query("SELECT DISTINCT ps.product.id FROM ProductSpecificationJpaEntity ps WHERE ps.specKey = :specKey")
    List<String> findProductIdsBySpecKey(@Param("specKey") String specKey);

    /**
     * Count specifications for a product
     * @param productId the product ID
     * @return count of specifications
     */
    @Query("SELECT COUNT(ps) FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId")
    long countByProductId(@Param("productId") String productId);

    /**
     * Delete all specifications for a product
     * @param productId the product ID
     */
    @Query("DELETE FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId")
    void deleteByProductId(@Param("productId") String productId);

    /**
     * Delete specific specification by product ID and key
     * @param productId the product ID
     * @param specKey the specification key
     */
    @Query("DELETE FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.specKey = :specKey")
    void deleteByProductIdAndSpecKey(@Param("productId") String productId, @Param("specKey") String specKey);

    /**
     * Check if a specification exists for a product
     * @param productId the product ID
     * @param specKey the specification key
     * @return true if specification exists for the product
     */
    @Query("SELECT COUNT(ps) > 0 FROM ProductSpecificationJpaEntity ps WHERE ps.product.id = :productId AND ps.specKey = :specKey")
    boolean existsByProductIdAndSpecKey(@Param("productId") String productId, @Param("specKey") String specKey);

    /**
     * Update specification value
     * @param productId the product ID
     * @param specKey the specification key
     * @param specValue the new specification value
     */
    @Query("UPDATE ProductSpecificationJpaEntity ps SET ps.specValue = :specValue WHERE ps.product.id = :productId AND ps.specKey = :specKey")
    void updateSpecValue(@Param("productId") String productId, @Param("specKey") String specKey, @Param("specValue") String specValue);
} 