package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.infrastructure.persistence.entity.ProductImageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Product Images
 * Handles data access operations for product images
 */
@Repository
public interface ProductImageJpaRepository extends JpaRepository<ProductImageJpaEntity, String> {

    /**
     * Find all images for a specific product
     * @param productId the product ID
     * @return list of product images ordered by display order
     */
    @Query("SELECT pi FROM ProductImageJpaEntity pi WHERE pi.product.id = :productId ORDER BY pi.displayOrder ASC")
    List<ProductImageJpaEntity> findByProductIdOrderByDisplayOrder(@Param("productId") String productId);

    /**
     * Find primary image for a product
     * @param productId the product ID
     * @return optional primary image
     */
    @Query("SELECT pi FROM ProductImageJpaEntity pi WHERE pi.product.id = :productId AND pi.isPrimary = true")
    Optional<ProductImageJpaEntity> findPrimaryImageByProductId(@Param("productId") String productId);

    /**
     * Find images by product ID and image type
     * @param productId the product ID
     * @param imageType the image type (e.g., "main", "thumbnail", "gallery")
     * @return list of images of the specified type
     */
    @Query("SELECT pi FROM ProductImageJpaEntity pi WHERE pi.product.id = :productId AND pi.imageType = :imageType ORDER BY pi.displayOrder ASC")
    List<ProductImageJpaEntity> findByProductIdAndImageType(@Param("productId") String productId, @Param("imageType") String imageType);

    /**
     * Find image by URL
     * @param imageUrl the image URL
     * @return optional product image
     */
    Optional<ProductImageJpaEntity> findByImageUrl(String imageUrl);

    /**
     * Count images for a product
     * @param productId the product ID
     * @return count of images
     */
    @Query("SELECT COUNT(pi) FROM ProductImageJpaEntity pi WHERE pi.product.id = :productId")
    long countByProductId(@Param("productId") String productId);

    /**
     * Find images by file format
     * @param fileFormat the file format (e.g., "jpg", "png", "webp")
     * @return list of images with the specified format
     */
    List<ProductImageJpaEntity> findByFileFormat(String fileFormat);

    /**
     * Find images larger than specified size
     * @param fileSize the minimum file size in bytes
     * @return list of images larger than the specified size
     */
    @Query("SELECT pi FROM ProductImageJpaEntity pi WHERE pi.fileSize > :fileSize")
    List<ProductImageJpaEntity> findByFileSizeGreaterThan(@Param("fileSize") Long fileSize);

    /**
     * Delete all images for a product
     * @param productId the product ID
     */
    @Query("DELETE FROM ProductImageJpaEntity pi WHERE pi.product.id = :productId")
    void deleteByProductId(@Param("productId") String productId);

    /**
     * Update display order for images
     * @param productId the product ID
     * @param imageId the image ID
     * @param displayOrder the new display order
     */
    @Query("UPDATE ProductImageJpaEntity pi SET pi.displayOrder = :displayOrder WHERE pi.id = :imageId AND pi.product.id = :productId")
    void updateDisplayOrder(@Param("productId") String productId, @Param("imageId") String imageId, @Param("displayOrder") Integer displayOrder);

    /**
     * Set primary image for a product (unset current primary first)
     * @param productId the product ID
     * @param imageId the image ID to set as primary
     */
    @Query("UPDATE ProductImageJpaEntity pi SET pi.isPrimary = false WHERE pi.product.id = :productId")
    void unsetPrimaryForProduct(@Param("productId") String productId);

    /**
     * Check if an image exists for a product
     * @param productId the product ID
     * @param imageUrl the image URL
     * @return true if image exists for the product
     */
    @Query("SELECT COUNT(pi) > 0 FROM ProductImageJpaEntity pi WHERE pi.product.id = :productId AND pi.imageUrl = :imageUrl")
    boolean existsByProductIdAndImageUrl(@Param("productId") String productId, @Param("imageUrl") String imageUrl);
} 