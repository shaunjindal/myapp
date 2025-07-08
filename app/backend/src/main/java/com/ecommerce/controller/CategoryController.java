package com.ecommerce.controller;

import com.ecommerce.application.service.CategoryService;
import com.ecommerce.infrastructure.persistence.entity.CategoryJpaEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Category operations
 * Provides endpoints for category management and hierarchical operations
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Get all categories with pagination
     */
    @GetMapping
    public ResponseEntity<Page<CategoryJpaEntity>> getAllCategories(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(value = "active", required = false) Boolean active) {
        
        Page<CategoryJpaEntity> categories;
        if (active != null && active) {
            categories = categoryService.getActiveCategories(pageable);
        } else {
            categories = categoryService.getAllCategories(pageable);
        }
        
        return ResponseEntity.ok(categories);
    }

    /**
     * Get category by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryJpaEntity> getCategoryById(@PathVariable String id) {
        try {
            CategoryJpaEntity category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get category by slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<CategoryJpaEntity> getCategoryBySlug(@PathVariable String slug) {
        Optional<CategoryJpaEntity> category = categoryService.getCategoryBySlug(slug);
        return category.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new category
     */
    @PostMapping
    public ResponseEntity<CategoryJpaEntity> createCategory(@Valid @RequestBody CategoryJpaEntity category) {
        try {
            CategoryJpaEntity savedCategory = categoryService.createCategory(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Add subcategory to a parent category
     */
    @PostMapping("/{parentId}/subcategories")
    public ResponseEntity<CategoryJpaEntity> addSubcategory(
            @PathVariable String parentId,
            @Valid @RequestBody CategoryJpaEntity subcategory) {
        try {
            CategoryJpaEntity savedSubcategory = categoryService.addSubcategory(parentId, subcategory);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubcategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get root categories
     */
    @GetMapping("/root")
    public ResponseEntity<List<CategoryJpaEntity>> getRootCategories(
            @RequestParam(value = "active", defaultValue = "true") boolean active) {
        List<CategoryJpaEntity> rootCategories = active ? 
            categoryService.getActiveRootCategories() : 
            categoryService.getRootCategories();
        return ResponseEntity.ok(rootCategories);
    }

    /**
     * Get category path (breadcrumb)
     */
    @GetMapping("/{id}/path")
    public ResponseEntity<List<CategoryJpaEntity>> getCategoryPath(@PathVariable String id) {
        List<CategoryJpaEntity> path = categoryService.getCategoryPath(id);
        return ResponseEntity.ok(path);
    }

    /**
     * Get category descendants
     */
    @GetMapping("/{id}/descendants")
    public ResponseEntity<List<CategoryJpaEntity>> getCategoryDescendants(@PathVariable String id) {
        List<CategoryJpaEntity> descendants = categoryService.getAllDescendants(id);
        return ResponseEntity.ok(descendants);
    }

    /**
     * Get subcategories of a category
     */
    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<CategoryJpaEntity>> getSubcategories(
            @PathVariable String id,
            @RequestParam(value = "active", defaultValue = "true") boolean active) {
        List<CategoryJpaEntity> subcategories = active ? 
            categoryService.getActiveSubcategories(id) : 
            categoryService.getSubcategories(id);
        return ResponseEntity.ok(subcategories);
    }

    /**
     * Search categories by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<CategoryJpaEntity>> searchCategories(
            @RequestParam String name,
            @RequestParam(value = "active", defaultValue = "true") boolean active) {
        List<CategoryJpaEntity> categories = active ? 
            categoryService.searchActiveCategoriesByName(name) : 
            categoryService.searchCategoriesByName(name);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get categories by level
     */
    @GetMapping("/level/{level}")
    public ResponseEntity<List<CategoryJpaEntity>> getCategoriesByLevel(@PathVariable int level) {
        List<CategoryJpaEntity> categories = categoryService.getCategoriesByLevel(level);
        return ResponseEntity.ok(categories);
    }

    /**
     * Update category
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryJpaEntity> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryJpaEntity categoryDetails) {
        try {
            CategoryJpaEntity updatedCategory = categoryService.updateCategory(id, categoryDetails);
            return ResponseEntity.ok(updatedCategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Move category to new parent
     */
    @PatchMapping("/{id}/move")
    public ResponseEntity<CategoryJpaEntity> moveCategory(
            @PathVariable String id,
            @RequestParam(value = "parentId", required = false) String parentId) {
        try {
            CategoryJpaEntity movedCategory = categoryService.moveCategory(id, parentId);
            return ResponseEntity.ok(movedCategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update sort order
     */
    @PatchMapping("/{id}/sort-order")
    public ResponseEntity<Void> updateSortOrder(
            @PathVariable String id,
            @RequestParam int sortOrder) {
        try {
            categoryService.updateSortOrder(id, sortOrder);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Activate category
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activateCategory(@PathVariable String id) {
        try {
            // Get product count before activation
            long inactiveProductCount = categoryService.countProductsInCategoryTree(id) - 
                                      categoryService.countActiveProductsInCategoryTree(id);
            
            CategoryJpaEntity category = categoryService.activateCategory(id);
            
            // Get product count after activation
            long activeProductCount = categoryService.countActiveProductsInCategoryTree(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("category", category);
            response.put("productsActivated", activeProductCount - (categoryService.countProductsInCategoryTree(id) - inactiveProductCount));
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Deactivate category
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateCategory(@PathVariable String id) {
        try {
            // Get active product count before deactivation
            long activeProductCount = categoryService.countActiveProductsInCategoryTree(id);
            
            CategoryJpaEntity category = categoryService.deactivateCategory(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("category", category);
            response.put("productsDeactivated", activeProductCount);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Deactivate category and all descendants
     */
    @PatchMapping("/{id}/deactivate-tree")
    public ResponseEntity<Map<String, Object>> deactivateCategoryTree(@PathVariable String id) {
        try {
            // Get active product count before deactivation
            long activeProductCount = categoryService.countActiveProductsInCategoryTree(id);
            
            int deactivatedCount = categoryService.deactivateCategoryAndDescendants(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("deactivatedCategories", deactivatedCount);
            response.put("productsDeactivated", activeProductCount);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Get statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCategories", categoryService.countActiveCategories());
        return ResponseEntity.ok(stats);
    }

    /**
     * Get product count in category tree
     */
    @GetMapping("/{id}/product-count")
    public ResponseEntity<Map<String, Long>> getProductCount(@PathVariable String id) {
        Map<String, Long> response = new HashMap<>();
        response.put("totalProducts", categoryService.countProductsInCategoryTree(id));
        response.put("activeProducts", categoryService.countActiveProductsInCategoryTree(id));
        return ResponseEntity.ok(response);
    }

    /**
     * Generate slug from name
     */
    @GetMapping("/generate-slug")
    public ResponseEntity<Map<String, String>> generateSlug(@RequestParam String name) {
        String slug = categoryService.generateSlug(name);
        Map<String, String> response = new HashMap<>();
        response.put("slug", slug);
        return ResponseEntity.ok(response);
    }

    /**
     * Get categories for frontend filters - optimized response
     */
    @GetMapping("/for-filters")
    public ResponseEntity<List<Map<String, Object>>> getCategoriesForFilters() {
        List<CategoryJpaEntity> categories = categoryService.getCategoriesWithActiveProducts();
        
        List<Map<String, Object>> result = categories.stream()
                .filter(CategoryJpaEntity::isActive)
                .map(category -> {
                    Map<String, Object> categoryMap = new HashMap<>();
                    categoryMap.put("id", category.getId());
                    categoryMap.put("name", category.getName());
                    categoryMap.put("slug", category.getSlug());
                    categoryMap.put("productCount", categoryService.countActiveProductsInCategoryTree(category.getId()));
                    return categoryMap;
                })
                .filter(categoryMap -> (Long) categoryMap.get("productCount") > 0)
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get categories with products
     */
    @GetMapping("/with-products")
    public ResponseEntity<List<CategoryJpaEntity>> getCategoriesWithProducts(
            @RequestParam(value = "active", defaultValue = "true") boolean active) {
        List<CategoryJpaEntity> categories = active ? 
            categoryService.getCategoriesWithActiveProducts() : 
            categoryService.getCategoriesWithProducts();
        return ResponseEntity.ok(categories);
    }

    /**
     * Test endpoint to verify category-product synchronization status
     */
    @GetMapping("/{id}/sync-status")
    public ResponseEntity<Map<String, Object>> getCategorySyncStatus(@PathVariable String id) {
        try {
            CategoryJpaEntity category = categoryService.getCategoryById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("categoryId", category.getId());
            response.put("categoryName", category.getName());
            response.put("categoryActive", category.isActive());
            response.put("totalProducts", categoryService.countProductsInCategoryTree(id));
            response.put("activeProducts", categoryService.countActiveProductsInCategoryTree(id));
            
            // Check if there are any inconsistencies
            boolean hasInconsistencies = false;
            if (category.isActive()) {
                // If category is active, check if any products are inactive due to category issues
                long inactiveProducts = categoryService.countProductsInCategoryTree(id) - 
                                      categoryService.countActiveProductsInCategoryTree(id);
                response.put("inactiveProducts", inactiveProducts);
                hasInconsistencies = inactiveProducts > 0;
            } else {
                // If category is inactive, active products count should be 0
                hasInconsistencies = categoryService.countActiveProductsInCategoryTree(id) > 0;
            }
            
            response.put("synchronized", !hasInconsistencies);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 