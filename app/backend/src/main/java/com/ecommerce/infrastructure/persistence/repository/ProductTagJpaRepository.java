package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.infrastructure.persistence.entity.ProductTagJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Product Tags
 * Handles data access operations for product tags
 */
@Repository
public interface ProductTagJpaRepository extends JpaRepository<ProductTagJpaEntity, String> {

    /**
     * Find all tags for a specific product
     * @param productId the product ID
     * @return list of product tags ordered by tag name
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId ORDER BY pt.tagName ASC")
    List<ProductTagJpaEntity> findByProductIdOrderByTagName(@Param("productId") String productId);

    /**
     * Find tag by product ID and tag name
     * @param productId the product ID
     * @param tagName the tag name
     * @return optional product tag
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.tagName = :tagName")
    Optional<ProductTagJpaEntity> findByProductIdAndTagName(@Param("productId") String productId, @Param("tagName") String tagName);

    /**
     * Find tags by product ID and category
     * @param productId the product ID
     * @param tagCategory the tag category
     * @return list of tags in the specified category
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.tagCategory = :tagCategory ORDER BY pt.tagName ASC")
    List<ProductTagJpaEntity> findByProductIdAndTagCategory(@Param("productId") String productId, @Param("tagCategory") String tagCategory);

    /**
     * Find all searchable tags for a product
     * @param productId the product ID
     * @return list of searchable tags
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.isSearchable = true ORDER BY pt.tagName ASC")
    List<ProductTagJpaEntity> findSearchableByProductId(@Param("productId") String productId);

    /**
     * Find all filterable tags for a product
     * @param productId the product ID
     * @return list of filterable tags
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.isFilterable = true ORDER BY pt.tagName ASC")
    List<ProductTagJpaEntity> findFilterableByProductId(@Param("productId") String productId);

    /**
     * Find visible tags for a product
     * @param productId the product ID
     * @return list of visible tags
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.isVisible = true ORDER BY pt.tagName ASC")
    List<ProductTagJpaEntity> findVisibleByProductId(@Param("productId") String productId);

    /**
     * Find tags by tag name across all products
     * @param tagName the tag name
     * @return list of tags with the specified name
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.tagName = :tagName")
    List<ProductTagJpaEntity> findByTagName(@Param("tagName") String tagName);

    /**
     * Find tags by tag name (case-insensitive)
     * @param tagName the tag name
     * @return list of tags with the specified name (case-insensitive)
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE LOWER(pt.tagName) = LOWER(:tagName)")
    List<ProductTagJpaEntity> findByTagNameIgnoreCase(@Param("tagName") String tagName);

    /**
     * Find tags by category across all products
     * @param tagCategory the tag category
     * @return list of tags in the specified category
     */
    @Query("SELECT pt FROM ProductTagJpaEntity pt WHERE pt.tagCategory = :tagCategory ORDER BY pt.tagName ASC")
    List<ProductTagJpaEntity> findByTagCategory(@Param("tagCategory") String tagCategory);

    /**
     * Find distinct tag names for a product
     * @param productId the product ID
     * @return list of distinct tag names
     */
    @Query("SELECT DISTINCT pt.tagName FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId ORDER BY pt.tagName ASC")
    List<String> findDistinctTagNamesByProductId(@Param("productId") String productId);

    /**
     * Find distinct tag categories for a product
     * @param productId the product ID
     * @return list of distinct tag categories
     */
    @Query("SELECT DISTINCT pt.tagCategory FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.tagCategory IS NOT NULL ORDER BY pt.tagCategory ASC")
    List<String> findDistinctTagCategoriesByProductId(@Param("productId") String productId);

    /**
     * Find all distinct tag names across all products
     * @return list of all distinct tag names
     */
    @Query("SELECT DISTINCT pt.tagName FROM ProductTagJpaEntity pt ORDER BY pt.tagName ASC")
    List<String> findAllDistinctTagNames();

    /**
     * Find all distinct tag categories across all products
     * @return list of all distinct tag categories
     */
    @Query("SELECT DISTINCT pt.tagCategory FROM ProductTagJpaEntity pt WHERE pt.tagCategory IS NOT NULL ORDER BY pt.tagCategory ASC")
    List<String> findAllDistinctTagCategories();

    /**
     * Find products with a specific tag
     * @param tagName the tag name
     * @return list of product IDs that have the tag
     */
    @Query("SELECT DISTINCT pt.product.id FROM ProductTagJpaEntity pt WHERE pt.tagName = :tagName")
    List<String> findProductIdsByTagName(@Param("tagName") String tagName);

    /**
     * Find products with tags in a specific category
     * @param tagCategory the tag category
     * @return list of product IDs that have tags in the category
     */
    @Query("SELECT DISTINCT pt.product.id FROM ProductTagJpaEntity pt WHERE pt.tagCategory = :tagCategory")
    List<String> findProductIdsByTagCategory(@Param("tagCategory") String tagCategory);

    /**
     * Count tags for a product
     * @param productId the product ID
     * @return count of tags
     */
    @Query("SELECT COUNT(pt) FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId")
    long countByProductId(@Param("productId") String productId);

    /**
     * Delete all tags for a product
     * @param productId the product ID
     */
    @Query("DELETE FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId")
    void deleteByProductId(@Param("productId") String productId);

    /**
     * Delete specific tag by product ID and tag name
     * @param productId the product ID
     * @param tagName the tag name
     */
    @Query("DELETE FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.tagName = :tagName")
    void deleteByProductIdAndTagName(@Param("productId") String productId, @Param("tagName") String tagName);

    /**
     * Check if a tag exists for a product
     * @param productId the product ID
     * @param tagName the tag name
     * @return true if tag exists for the product
     */
    @Query("SELECT COUNT(pt) > 0 FROM ProductTagJpaEntity pt WHERE pt.product.id = :productId AND pt.tagName = :tagName")
    boolean existsByProductIdAndTagName(@Param("productId") String productId, @Param("tagName") String tagName);

    /**
     * Find most popular tags (by product count)
     * @param limit the maximum number of tags to return
     * @return list of tag names ordered by popularity
     */
    @Query("SELECT pt.tagName, COUNT(pt) as tagCount FROM ProductTagJpaEntity pt GROUP BY pt.tagName ORDER BY tagCount DESC")
    List<Object[]> findMostPopularTags(@Param("limit") int limit);
} 