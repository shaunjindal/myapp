package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.infrastructure.persistence.entity.CategoryJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Category entities
 * Provides data access operations for categories with hierarchical support
 */
@Repository
public interface CategoryJpaRepository extends JpaRepository<CategoryJpaEntity, String> {

    // Find by slug
    Optional<CategoryJpaEntity> findBySlug(String slug);

    // Check if slug exists
    boolean existsBySlug(String slug);

    // Find by slug and active status
    Optional<CategoryJpaEntity> findBySlugAndActive(String slug, boolean active);

    // Find root categories (categories without parent)
    List<CategoryJpaEntity> findByParentIsNullOrderBySortOrderAscNameAsc();

    // Find root categories with pagination
    Page<CategoryJpaEntity> findByParentIsNull(Pageable pageable);

    // Find active root categories
    List<CategoryJpaEntity> findByParentIsNullAndActiveTrueOrderBySortOrderAscNameAsc();

    // Find children of a specific category
    List<CategoryJpaEntity> findByParent_IdOrderBySortOrderAscNameAsc(String parentId);

    // Find active children of a specific category
    List<CategoryJpaEntity> findByParent_IdAndActiveOrderBySortOrderAscNameAsc(String parentId, boolean active);

    // Find by name (case insensitive)
    List<CategoryJpaEntity> findByNameContainingIgnoreCaseOrderByNameAsc(String name);

    // Find active categories by name
    List<CategoryJpaEntity> findByNameContainingIgnoreCaseAndActiveOrderByNameAsc(String name, boolean active);

    // Find all active categories
    List<CategoryJpaEntity> findByActiveOrderBySortOrderAscNameAsc(boolean active);

    // Find all active categories with pagination
    Page<CategoryJpaEntity> findByActive(boolean active, Pageable pageable);

    // Find categories by parent and active status
    List<CategoryJpaEntity> findByParentAndActive(CategoryJpaEntity parent, boolean active, Sort sort);

    // Count active categories
    long countByActive(boolean active);

    // Count children of a category
    long countByParent_Id(String parentId);

    // Count active children of a category
    long countByParent_IdAndActive(String parentId, boolean active);

    // Custom queries for hierarchical operations
    
    /**
     * Find all descendants of a category (recursive)
     */
    @Query(value = """
        WITH RECURSIVE category_hierarchy AS (
            SELECT id, name, slug, description, parent_id, active, sort_order, 0 as level
            FROM categories 
            WHERE id = :categoryId
            
            UNION ALL
            
            SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.active, c.sort_order, ch.level + 1
            FROM categories c
            INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
        )
        SELECT * FROM category_hierarchy WHERE level > 0 ORDER BY level, sort_order, name
        """, nativeQuery = true)
    List<CategoryJpaEntity> findAllDescendants(@Param("categoryId") String categoryId);

    /**
     * Find all ancestors of a category (recursive)
     */
    @Query(value = """
        WITH RECURSIVE category_ancestors AS (
            SELECT id, name, slug, description, parent_id, active, sort_order, 0 as level
            FROM categories 
            WHERE id = :categoryId
            
            UNION ALL
            
            SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.active, c.sort_order, ca.level + 1
            FROM categories c
            INNER JOIN category_ancestors ca ON ca.parent_id = c.id
        )
        SELECT * FROM category_ancestors WHERE level > 0 ORDER BY level DESC
        """, nativeQuery = true)
    List<CategoryJpaEntity> findAllAncestors(@Param("categoryId") String categoryId);

    /**
     * Find category path from root to specified category
     */
    @Query(value = """
        WITH RECURSIVE category_path AS (
            SELECT id, name, slug, description, parent_id, active, sort_order, 0 as level
            FROM categories 
            WHERE id = :categoryId
            
            UNION ALL
            
            SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.active, c.sort_order, cp.level + 1
            FROM categories c
            INNER JOIN category_path cp ON cp.parent_id = c.id
        )
        SELECT * FROM category_path ORDER BY level DESC
        """, nativeQuery = true)
    List<CategoryJpaEntity> findCategoryPath(@Param("categoryId") String categoryId);

    /**
     * Find categories by depth level
     */
    @Query(value = """
        WITH RECURSIVE category_levels AS (
            SELECT id, name, slug, description, parent_id, active, sort_order, 0 as level
            FROM categories 
            WHERE parent_id IS NULL
            
            UNION ALL
            
            SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.active, c.sort_order, cl.level + 1
            FROM categories c
            INNER JOIN category_levels cl ON c.parent_id = cl.id
        )
        SELECT * FROM category_levels WHERE level = :level ORDER BY sort_order, name
        """, nativeQuery = true)
    List<CategoryJpaEntity> findCategoriesByLevel(@Param("level") int level);

    /**
     * Update sort order for categories
     */
    @Modifying
    @Query("UPDATE CategoryJpaEntity c SET c.sortOrder = :sortOrder WHERE c.id = :categoryId")
    int updateSortOrder(@Param("categoryId") String categoryId, @Param("sortOrder") int sortOrder);

    /**
     * Deactivate category and all its descendants
     */
    @Modifying
    @Query(value = """
        WITH RECURSIVE category_to_deactivate AS (
            SELECT id FROM categories WHERE id = :categoryId
            UNION ALL
            SELECT c.id FROM categories c
            INNER JOIN category_to_deactivate ctd ON c.parent_id = ctd.id
        )
        UPDATE categories SET active = false WHERE id IN (SELECT id FROM category_to_deactivate)
        """, nativeQuery = true)
    int deactivateCategoryAndDescendants(@Param("categoryId") String categoryId);

    /**
     * Find categories that have products
     */
    @Query("SELECT DISTINCT c FROM CategoryJpaEntity c WHERE EXISTS (SELECT 1 FROM ProductJpaEntity p WHERE p.category = c)")
    List<CategoryJpaEntity> findCategoriesWithProducts();

    /**
     * Find categories that have active products
     */
    @Query("SELECT DISTINCT c FROM CategoryJpaEntity c WHERE EXISTS (SELECT 1 FROM ProductJpaEntity p WHERE p.category = c AND p.status = 'ACTIVE')")
    List<CategoryJpaEntity> findCategoriesWithActiveProducts();

    /**
     * Count products in category and its descendants
     */
    @Query(value = """
        WITH RECURSIVE category_tree AS (
            SELECT id FROM categories WHERE id = :categoryId
            UNION ALL
            SELECT c.id FROM categories c
            INNER JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT COUNT(*) FROM products p 
        WHERE p.category_id IN (SELECT id FROM category_tree)
        """, nativeQuery = true)
    long countProductsInCategoryTree(@Param("categoryId") String categoryId);

    /**
     * Count active products in category and its descendants
     */
    @Query(value = """
        WITH RECURSIVE category_tree AS (
            SELECT id FROM categories WHERE id = :categoryId
            UNION ALL
            SELECT c.id FROM categories c
            INNER JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT COUNT(*) FROM products p 
        WHERE p.category_id IN (SELECT id FROM category_tree) AND p.status = 'ACTIVE'
        """, nativeQuery = true)
    long countActiveProductsInCategoryTree(@Param("categoryId") String categoryId);
} 