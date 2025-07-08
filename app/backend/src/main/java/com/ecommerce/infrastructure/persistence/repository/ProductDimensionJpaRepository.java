package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.product.DimensionUnit;
import com.ecommerce.infrastructure.persistence.entity.ProductDimensionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Product Dimensions
 * Handles data access operations for product dimensions
 */
@Repository
public interface ProductDimensionJpaRepository extends JpaRepository<ProductDimensionJpaEntity, String> {

    /**
     * Find dimensions by product ID
     * @param productId the product ID
     * @return optional product dimensions
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.product.id = :productId")
    Optional<ProductDimensionJpaEntity> findByProductId(@Param("productId") String productId);

    /**
     * Find dimensions by unit
     * @param unit the dimension unit
     * @return list of product dimensions with the specified unit
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.unit = :unit")
    List<ProductDimensionJpaEntity> findByUnit(@Param("unit") DimensionUnit unit);

    /**
     * Find products with volume greater than specified value
     * @param volume the minimum volume
     * @return list of product dimensions with volume greater than specified
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.volume > :volume")
    List<ProductDimensionJpaEntity> findByVolumeGreaterThan(@Param("volume") BigDecimal volume);

    /**
     * Find products with volume less than specified value
     * @param volume the maximum volume
     * @return list of product dimensions with volume less than specified
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.volume < :volume")
    List<ProductDimensionJpaEntity> findByVolumeLessThan(@Param("volume") BigDecimal volume);

    /**
     * Find products with volume in range
     * @param minVolume the minimum volume
     * @param maxVolume the maximum volume
     * @return list of product dimensions with volume in the specified range
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.volume >= :minVolume AND pd.volume <= :maxVolume")
    List<ProductDimensionJpaEntity> findByVolumeBetween(@Param("minVolume") BigDecimal minVolume, @Param("maxVolume") BigDecimal maxVolume);

    /**
     * Find products with longest dimension greater than specified value
     * @param dimension the minimum longest dimension
     * @return list of product dimensions with longest dimension greater than specified
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.longestDimension > :dimension")
    List<ProductDimensionJpaEntity> findByLongestDimensionGreaterThan(@Param("dimension") BigDecimal dimension);

    /**
     * Find products with longest dimension less than specified value
     * @param dimension the maximum longest dimension
     * @return list of product dimensions with longest dimension less than specified
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.longestDimension < :dimension")
    List<ProductDimensionJpaEntity> findByLongestDimensionLessThan(@Param("dimension") BigDecimal dimension);

    /**
     * Find products with shortest dimension greater than specified value
     * @param dimension the minimum shortest dimension
     * @return list of product dimensions with shortest dimension greater than specified
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.shortestDimension > :dimension")
    List<ProductDimensionJpaEntity> findByShortestDimensionGreaterThan(@Param("dimension") BigDecimal dimension);

    /**
     * Find products with shortest dimension less than specified value
     * @param dimension the maximum shortest dimension
     * @return list of product dimensions with shortest dimension less than specified
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.shortestDimension < :dimension")
    List<ProductDimensionJpaEntity> findByShortestDimensionLessThan(@Param("dimension") BigDecimal dimension);

    /**
     * Find products with specific length
     * @param length the length value
     * @return list of product dimensions with the specified length
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.length = :length")
    List<ProductDimensionJpaEntity> findByLength(@Param("length") BigDecimal length);

    /**
     * Find products with specific width
     * @param width the width value
     * @return list of product dimensions with the specified width
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.width = :width")
    List<ProductDimensionJpaEntity> findByWidth(@Param("width") BigDecimal width);

    /**
     * Find products with specific height
     * @param height the height value
     * @return list of product dimensions with the specified height
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.height = :height")
    List<ProductDimensionJpaEntity> findByHeight(@Param("height") BigDecimal height);

    /**
     * Find products that fit within specified dimensions
     * @param maxLength the maximum length
     * @param maxWidth the maximum width
     * @param maxHeight the maximum height
     * @param unit the dimension unit
     * @return list of product dimensions that fit within the specified dimensions
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.unit = :unit AND pd.length <= :maxLength AND pd.width <= :maxWidth AND pd.height <= :maxHeight")
    List<ProductDimensionJpaEntity> findProductsThatFitWithin(@Param("maxLength") BigDecimal maxLength, @Param("maxWidth") BigDecimal maxWidth, @Param("maxHeight") BigDecimal maxHeight, @Param("unit") DimensionUnit unit);

    /**
     * Find products with dimensions in specified ranges
     * @param minLength the minimum length
     * @param maxLength the maximum length
     * @param minWidth the minimum width
     * @param maxWidth the maximum width
     * @param minHeight the minimum height
     * @param maxHeight the maximum height
     * @param unit the dimension unit
     * @return list of product dimensions within the specified ranges
     */
    @Query("SELECT pd FROM ProductDimensionJpaEntity pd WHERE pd.unit = :unit AND pd.length >= :minLength AND pd.length <= :maxLength AND pd.width >= :minWidth AND pd.width <= :maxWidth AND pd.height >= :minHeight AND pd.height <= :maxHeight")
    List<ProductDimensionJpaEntity> findByDimensionRanges(@Param("minLength") BigDecimal minLength, @Param("maxLength") BigDecimal maxLength, @Param("minWidth") BigDecimal minWidth, @Param("maxWidth") BigDecimal maxWidth, @Param("minHeight") BigDecimal minHeight, @Param("maxHeight") BigDecimal maxHeight, @Param("unit") DimensionUnit unit);

    /**
     * Find all distinct units used
     * @return list of distinct dimension units
     */
    @Query("SELECT DISTINCT pd.unit FROM ProductDimensionJpaEntity pd ORDER BY pd.unit ASC")
    List<DimensionUnit> findAllDistinctUnits();

    /**
     * Get average volume for products with dimensions
     * @return average volume
     */
    @Query("SELECT AVG(pd.volume) FROM ProductDimensionJpaEntity pd WHERE pd.volume IS NOT NULL")
    BigDecimal getAverageVolume();

    /**
     * Get maximum volume for products with dimensions
     * @return maximum volume
     */
    @Query("SELECT MAX(pd.volume) FROM ProductDimensionJpaEntity pd WHERE pd.volume IS NOT NULL")
    BigDecimal getMaxVolume();

    /**
     * Get minimum volume for products with dimensions
     * @return minimum volume
     */
    @Query("SELECT MIN(pd.volume) FROM ProductDimensionJpaEntity pd WHERE pd.volume IS NOT NULL")
    BigDecimal getMinVolume();

    /**
     * Count products with dimensions
     * @return count of products that have dimensions
     */
    @Query("SELECT COUNT(pd) FROM ProductDimensionJpaEntity pd")
    long countProductsWithDimensions();

    /**
     * Delete dimensions by product ID
     * @param productId the product ID
     */
    @Query("DELETE FROM ProductDimensionJpaEntity pd WHERE pd.product.id = :productId")
    void deleteByProductId(@Param("productId") String productId);

    /**
     * Check if dimensions exist for a product
     * @param productId the product ID
     * @return true if dimensions exist for the product
     */
    @Query("SELECT COUNT(pd) > 0 FROM ProductDimensionJpaEntity pd WHERE pd.product.id = :productId")
    boolean existsByProductId(@Param("productId") String productId);

    /**
     * Update dimensions for a product
     * @param productId the product ID
     * @param length the new length
     * @param width the new width
     * @param height the new height
     * @param unit the dimension unit
     */
    @Query("UPDATE ProductDimensionJpaEntity pd SET pd.length = :length, pd.width = :width, pd.height = :height, pd.unit = :unit WHERE pd.product.id = :productId")
    void updateDimensions(@Param("productId") String productId, @Param("length") BigDecimal length, @Param("width") BigDecimal width, @Param("height") BigDecimal height, @Param("unit") DimensionUnit unit);
} 