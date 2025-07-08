package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.product.ProductStatus;
import com.ecommerce.infrastructure.persistence.entity.CategoryJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Product entities
 * Provides comprehensive data access operations for product management and inventory tracking
 */
@Repository
public interface ProductJpaRepository extends JpaRepository<ProductJpaEntity, String> {

    // Basic finding operations
    Optional<ProductJpaEntity> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    Optional<ProductJpaEntity> findBySkuAndStatus(String sku, ProductStatus status);

    // Find by status
    List<ProductJpaEntity> findByStatus(ProductStatus status);
    
    Page<ProductJpaEntity> findByStatus(ProductStatus status, Pageable pageable);

    // Find active products
    List<ProductJpaEntity> findByStatusOrderByNameAsc(ProductStatus status);
    
    Page<ProductJpaEntity> findByStatusOrderByNameAsc(ProductStatus status, Pageable pageable);

    // Find by category
    List<ProductJpaEntity> findByCategory(CategoryJpaEntity category);
    
    Page<ProductJpaEntity> findByCategory(CategoryJpaEntity category, Pageable pageable);
    
    List<ProductJpaEntity> findByCategoryAndStatus(CategoryJpaEntity category, ProductStatus status);
    
    Page<ProductJpaEntity> findByCategoryAndStatus(CategoryJpaEntity category, ProductStatus status, Pageable pageable);

    // Find by category ID
    List<ProductJpaEntity> findByCategory_Id(String categoryId);
    
    Page<ProductJpaEntity> findByCategory_Id(String categoryId, Pageable pageable);
    
    List<ProductJpaEntity> findByCategory_IdAndStatus(String categoryId, ProductStatus status);

    // Find by brand
    List<ProductJpaEntity> findByBrand(String brand);
    
    Page<ProductJpaEntity> findByBrand(String brand, Pageable pageable);
    
    List<ProductJpaEntity> findByBrandAndStatus(String brand, ProductStatus status);

    // Find by name (case insensitive search)
    List<ProductJpaEntity> findByNameContainingIgnoreCaseAndStatus(String name, ProductStatus status);
    
    Page<ProductJpaEntity> findByNameContainingIgnoreCaseAndStatus(String name, ProductStatus status, Pageable pageable);

    // Find featured products
    List<ProductJpaEntity> findByFeaturedAndStatus(boolean featured, ProductStatus status);
    
    Page<ProductJpaEntity> findByFeaturedAndStatusOrderByCreatedAtDesc(boolean featured, ProductStatus status, Pageable pageable);

    // Price range queries
    List<ProductJpaEntity> findByPriceBetweenAndStatus(BigDecimal minPrice, BigDecimal maxPrice, ProductStatus status);
    
    Page<ProductJpaEntity> findByPriceBetweenAndStatus(BigDecimal minPrice, BigDecimal maxPrice, ProductStatus status, Pageable pageable);

    // Inventory management queries
    
    // Find products with low stock
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.stockQuantity <= p.minStockLevel AND p.status = :status")
    List<ProductJpaEntity> findLowStockProducts(@Param("status") ProductStatus status);
    
    // Find out of stock products
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.stockQuantity <= 0 AND p.status = :status")
    List<ProductJpaEntity> findOutOfStockProducts(@Param("status") ProductStatus status);
    
    // Find products with reserved stock
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.reservedQuantity > 0 AND p.status = :status")
    List<ProductJpaEntity> findProductsWithReservedStock(@Param("status") ProductStatus status);
    
    // Find overstocked products
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.stockQuantity >= p.maxStockLevel AND p.status = :status")
    List<ProductJpaEntity> findOverstockedProducts(@Param("status") ProductStatus status);
    
    // Find available products (in stock and active)
    @Query("SELECT p FROM ProductJpaEntity p WHERE (p.stockQuantity - p.reservedQuantity) > 0 AND p.status = 'ACTIVE'")
    List<ProductJpaEntity> findAvailableProducts();
    
    @Query("SELECT p FROM ProductJpaEntity p WHERE (p.stockQuantity - p.reservedQuantity) > 0 AND p.status = 'ACTIVE'")
    Page<ProductJpaEntity> findAvailableProducts(Pageable pageable);

    // Search and filtering queries
    
    /**
     * Search products by multiple criteria
     */
    @Query("""
        SELECT p FROM ProductJpaEntity p WHERE
        (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND
        (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand)) AND
        (:categoryId IS NULL OR p.category.id = :categoryId) AND
        (:status IS NULL OR p.status = :status) AND
        (:minPrice IS NULL OR p.price >= :minPrice) AND
        (:maxPrice IS NULL OR p.price <= :maxPrice) AND
        (:featured IS NULL OR p.featured = :featured)
        ORDER BY p.name ASC
        """)
    Page<ProductJpaEntity> searchProducts(
        @Param("name") String name,
        @Param("brand") String brand,
        @Param("categoryId") String categoryId,
        @Param("status") ProductStatus status,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("featured") Boolean featured,
        Pageable pageable
    );

    /**
     * Find products in multiple categories (category tree search)
     */
    @Query(value = """
        WITH RECURSIVE category_tree AS (
            SELECT id FROM categories WHERE id = :categoryId
            UNION ALL
            SELECT c.id FROM categories c
            INNER JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT p.* FROM products p 
        WHERE p.category_id IN (SELECT id FROM category_tree) 
        AND p.status = :status
        ORDER BY p.name
        """, nativeQuery = true)
    List<ProductJpaEntity> findProductsInCategoryTree(@Param("categoryId") String categoryId, @Param("status") String status);

    /**
     * Find products by tags
     */
    @Query(value = "SELECT * FROM products WHERE JSON_OVERLAPS(tags, CAST(:tags AS JSON)) AND status = :status", nativeQuery = true)
    List<ProductJpaEntity> findByTagsContaining(@Param("tags") String tags, @Param("status") String status);

    /**
     * Full text search in name, description, and specifications
     */
    @Query(value = """
        SELECT * FROM products p WHERE 
        MATCH(p.name, p.description) AGAINST(:searchTerm IN BOOLEAN MODE) OR
        JSON_SEARCH(p.specifications, 'all', :searchTerm) IS NOT NULL
        AND p.status = :status
        ORDER BY 
        MATCH(p.name) AGAINST(:searchTerm IN BOOLEAN MODE) DESC,
        MATCH(p.description) AGAINST(:searchTerm IN BOOLEAN MODE) DESC
        """, nativeQuery = true)
    List<ProductJpaEntity> fullTextSearch(@Param("searchTerm") String searchTerm, @Param("status") String status);

    // Analytics and reporting queries
    
    /**
     * Count products by status
     */
    long countByStatus(ProductStatus status);
    
    /**
     * Count products by category
     */
    long countByCategory(CategoryJpaEntity category);
    
    /**
     * Count products by brand
     */
    long countByBrand(String brand);
    
    /**
     * Get total inventory value
     */
    @Query("SELECT SUM(p.price * p.stockQuantity) FROM ProductJpaEntity p WHERE p.status = :status")
    BigDecimal getTotalInventoryValue(@Param("status") ProductStatus status);
    
    /**
     * Get distinct brands
     */
    @Query("SELECT DISTINCT p.brand FROM ProductJpaEntity p WHERE p.status = :status ORDER BY p.brand")
    List<String> findDistinctBrands(@Param("status") ProductStatus status);
    
    /**
     * Find top selling products (based on review count as proxy)
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.status = :status ORDER BY p.reviewCount DESC")
    List<ProductJpaEntity> findTopSellingProducts(@Param("status") ProductStatus status, Pageable pageable);
    
    /**
     * Find highest rated products
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.status = :status AND p.averageRating > 0 ORDER BY p.averageRating DESC, p.reviewCount DESC")
    List<ProductJpaEntity> findHighestRatedProducts(@Param("status") ProductStatus status, Pageable pageable);

    // Bulk operations
    
    /**
     * Update stock quantity
     */
    @Modifying
    @Query("UPDATE ProductJpaEntity p SET p.stockQuantity = :quantity WHERE p.id = :productId")
    int updateStockQuantity(@Param("productId") String productId, @Param("quantity") int quantity);
    
    /**
     * Update reserved quantity
     */
    @Modifying
    @Query("UPDATE ProductJpaEntity p SET p.reservedQuantity = :quantity WHERE p.id = :productId")
    int updateReservedQuantity(@Param("productId") String productId, @Param("quantity") int quantity);
    
    /**
     * Bulk update status
     */
    @Modifying
    @Query("UPDATE ProductJpaEntity p SET p.status = :newStatus WHERE p.status = :currentStatus")
    int bulkUpdateStatus(@Param("currentStatus") ProductStatus currentStatus, @Param("newStatus") ProductStatus newStatus);
    
    /**
     * Bulk update status by category
     */
    @Modifying
    @Query("UPDATE ProductJpaEntity p SET p.status = :status WHERE p.category.id = :categoryId")
    int updateStatusByCategory(@Param("categoryId") String categoryId, @Param("status") ProductStatus status);
    
    /**
     * Update products from one status to another in a specific category
     */
    @Modifying
    @Query("UPDATE ProductJpaEntity p SET p.status = :newStatus WHERE p.category.id = :categoryId AND p.status = :currentStatus")
    int updateSpecificStatusByCategory(@Param("categoryId") String categoryId, @Param("currentStatus") ProductStatus currentStatus, @Param("newStatus") ProductStatus newStatus);
    
    /**
     * Find products by status and active category
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.status = :status AND p.category.active = true")
    Page<ProductJpaEntity> findByStatusAndCategoryActive(@Param("status") ProductStatus status, Pageable pageable);
    
    /**
     * Find products by category, status, and active category
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.category.id = :categoryId AND p.status = :status AND p.category.active = true")
    List<ProductJpaEntity> findByCategory_IdAndStatusAndCategoryActive(@Param("categoryId") String categoryId, @Param("status") ProductStatus status);
    
    /**
     * Mark products as featured/unfeatured
     */
    @Modifying
    @Query("UPDATE ProductJpaEntity p SET p.featured = :featured WHERE p.id IN :productIds")
    int updateFeaturedStatus(@Param("productIds") List<String> productIds, @Param("featured") boolean featured);

    // Inventory alerts and monitoring
    
    /**
     * Find products that need restocking
     */
    @Query("""
        SELECT p FROM ProductJpaEntity p WHERE 
        p.stockQuantity <= p.minStockLevel AND 
        p.status = 'ACTIVE' AND
        (p.stockQuantity - p.reservedQuantity) <= :threshold
        ORDER BY (p.stockQuantity - p.reservedQuantity) ASC
        """)
    List<ProductJpaEntity> findProductsNeedingRestock(@Param("threshold") int threshold);
    
    /**
     * Get inventory summary by category
     */
    @Query("""
        SELECT p.category.id, p.category.name, 
               COUNT(p), SUM(p.stockQuantity), SUM(p.reservedQuantity),
               SUM(p.price * p.stockQuantity)
        FROM ProductJpaEntity p 
        WHERE p.status = :status
        GROUP BY p.category.id, p.category.name
        ORDER BY p.category.name
        """)
    List<Object[]> getInventorySummaryByCategory(@Param("status") ProductStatus status);

    /**
     * Get low stock alerts
     */
    @Query("""
        SELECT p FROM ProductJpaEntity p WHERE 
        p.stockQuantity <= p.minStockLevel AND 
        p.status = 'ACTIVE'
        ORDER BY (p.stockQuantity - p.minStockLevel) ASC
        """)
    List<ProductJpaEntity> getLowStockAlerts();

    /**
     * Find products by category active status
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.category.active = :categoryActive")
    Page<ProductJpaEntity> findByCategoryActive(@Param("categoryActive") boolean categoryActive, Pageable pageable);
    
    /**
     * Find products by status and category active status
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.status = :status AND p.category.active = :categoryActive")
    Page<ProductJpaEntity> findByStatusAndCategoryActive(@Param("status") ProductStatus status, @Param("categoryActive") boolean categoryActive, Pageable pageable);
    
    /**
     * Find active products from active categories only
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.status = 'ACTIVE' AND p.category.active = true")
    Page<ProductJpaEntity> findActiveProductsFromActiveCategories(Pageable pageable);
    
    /**
     * Find products by category ID, only if category is active
     */
    @Query("SELECT p FROM ProductJpaEntity p WHERE p.category.id = :categoryId AND p.category.active = true")
    Page<ProductJpaEntity> findByCategoryIdAndCategoryActive(@Param("categoryId") String categoryId, Pageable pageable);
} 