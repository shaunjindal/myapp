package com.ecommerce.application.service;

import com.ecommerce.infrastructure.persistence.entity.CategoryJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.CategoryJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for Category operations
 * Handles all business logic related to category management and hierarchical operations
 */
@Service
@Transactional
public class CategoryService {

    private final CategoryJpaRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryJpaRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Category CRUD operations

    /**
     * Create a new category
     */
    public CategoryJpaEntity createCategory(CategoryJpaEntity category) {
        // Validate category data
        validateCategory(category);
        
        // Check if slug already exists
        if (categoryRepository.existsBySlug(category.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + category.getSlug() + "' already exists");
        }

        // Set parent if provided
        if (category.getParent() != null && category.getParent().getId() != null) {
            CategoryJpaEntity parent = getCategoryById(category.getParent().getId());
            category.setParent(parent);
        }

        return categoryRepository.save(category);
    }

    /**
     * Update an existing category
     */
    public CategoryJpaEntity updateCategory(String categoryId, CategoryJpaEntity updatedCategory) {
        CategoryJpaEntity existingCategory = getCategoryById(categoryId);
        
        // Validate that slug is unique (excluding current category)
        if (!existingCategory.getSlug().equals(updatedCategory.getSlug()) && 
            categoryRepository.existsBySlug(updatedCategory.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + updatedCategory.getSlug() + "' already exists");
        }

        // Update fields
        existingCategory.setName(updatedCategory.getName());
        existingCategory.setDescription(updatedCategory.getDescription());
        existingCategory.setSlug(updatedCategory.getSlug());
        existingCategory.setImageUrl(updatedCategory.getImageUrl());
        existingCategory.setActive(updatedCategory.isActive());
        existingCategory.setSortOrder(updatedCategory.getSortOrder());
        existingCategory.setMetaTitle(updatedCategory.getMetaTitle());
        existingCategory.setMetaDescription(updatedCategory.getMetaDescription());
        existingCategory.setMetaKeywords(updatedCategory.getMetaKeywords());

        // Update parent if provided
        if (updatedCategory.getParent() != null && updatedCategory.getParent().getId() != null) {
            CategoryJpaEntity parent = getCategoryById(updatedCategory.getParent().getId());
            existingCategory.setParent(parent);
        }

        return categoryRepository.save(existingCategory);
    }

    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public CategoryJpaEntity getCategoryById(String categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));
    }

    /**
     * Get category by slug
     */
    @Transactional(readOnly = true)
    public Optional<CategoryJpaEntity> getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }

    /**
     * Get active category by slug
     */
    @Transactional(readOnly = true)
    public Optional<CategoryJpaEntity> getActiveCategoryBySlug(String slug) {
        return categoryRepository.findBySlugAndActive(slug, true);
    }

    /**
     * Get all categories with pagination
     */
    @Transactional(readOnly = true)
    public Page<CategoryJpaEntity> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    /**
     * Get all active categories
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getActiveCategories() {
        return categoryRepository.findByActiveOrderBySortOrderAscNameAsc(true);
    }

    /**
     * Get active categories with pagination
     */
    @Transactional(readOnly = true)
    public Page<CategoryJpaEntity> getActiveCategories(Pageable pageable) {
        return categoryRepository.findByActive(true, pageable);
    }

    /**
     * Get root categories (categories without parent)
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getRootCategories() {
        return categoryRepository.findByParentIsNullOrderBySortOrderAscNameAsc();
    }

    /**
     * Get active root categories
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getActiveRootCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrueOrderBySortOrderAscNameAsc();
    }

    /**
     * Delete category by ID
     */
    public void deleteCategory(String categoryId) {
        CategoryJpaEntity category = getCategoryById(categoryId);
        
        // Check if category has subcategories
        if (category.hasChildren()) {
            throw new IllegalStateException("Cannot delete category with subcategories. Remove subcategories first.");
        }

        // Check if category has products (you might want to implement this check)
        // This would require checking with ProductService or repository
        
        categoryRepository.delete(category);
    }

    // Hierarchical operations

    /**
     * Get categories by name (search)
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCaseOrderByNameAsc(name);
    }

    /**
     * Get active categories by name
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> searchActiveCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCaseAndActiveOrderByNameAsc(name, true);
    }

    /**
     * Get categories by depth level
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getCategoriesByLevel(int level) {
        return categoryRepository.findCategoriesByLevel(level);
    }

    /**
     * Get subcategories of a category
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getSubcategories(String parentCategoryId) {
        return categoryRepository.findByParent_IdOrderBySortOrderAscNameAsc(parentCategoryId);
    }

    /**
     * Get active subcategories of a category
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getActiveSubcategories(String parentCategoryId) {
        return categoryRepository.findByParent_IdAndActiveOrderBySortOrderAscNameAsc(parentCategoryId, true);
    }

    /**
     * Add a subcategory to a parent category
     */
    public CategoryJpaEntity addSubcategory(String parentCategoryId, CategoryJpaEntity subcategory) {
        CategoryJpaEntity parent = getCategoryById(parentCategoryId);
        subcategory.setParent(parent);
        return categoryRepository.save(subcategory);
    }

    /**
     * Move a category to a new parent
     */
    public CategoryJpaEntity moveCategory(String categoryId, String newParentId) {
        CategoryJpaEntity category = getCategoryById(categoryId);
        
        if (newParentId != null) {
            CategoryJpaEntity newParent = getCategoryById(newParentId);
            
            // Check for circular reference
            if (isDescendantOf(newParent, category)) {
                throw new IllegalArgumentException("Cannot move category to its own descendant");
            }
            
            category.setParent(newParent);
        } else {
            category.setParent(null);
        }
        
        return categoryRepository.save(category);
    }

    /**
     * Check if a category is descendant of another
     */
    private boolean isDescendantOf(CategoryJpaEntity potentialDescendant, CategoryJpaEntity ancestor) {
        if (potentialDescendant == null || ancestor == null) {
            return false;
        }
        
        CategoryJpaEntity current = potentialDescendant.getParent();
        while (current != null) {
            if (current.getId().equals(ancestor.getId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    /**
     * Get category path (from root to category)
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getCategoryPath(String categoryId) {
        return categoryRepository.findCategoryPath(categoryId);
    }

    /**
     * Get all descendants of a category
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getAllDescendants(String categoryId) {
        return categoryRepository.findAllDescendants(categoryId);
    }

    /**
     * Get all ancestors of a category
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getAllAncestors(String categoryId) {
        return categoryRepository.findAllAncestors(categoryId);
    }

    // Category status management

    /**
     * Get categories that have products
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getCategoriesWithProducts() {
        return categoryRepository.findCategoriesWithProducts();
    }

    /**
     * Get categories that have active products
     */
    @Transactional(readOnly = true)
    public List<CategoryJpaEntity> getCategoriesWithActiveProducts() {
        return categoryRepository.findCategoriesWithActiveProducts();
    }

    /**
     * Count active categories
     */
    @Transactional(readOnly = true)
    public long countActiveCategories() {
        return categoryRepository.countByActive(true);
    }

    /**
     * Count subcategories of a category
     */
    @Transactional(readOnly = true)
    public long countSubcategories(String categoryId) {
        return categoryRepository.countByParent_Id(categoryId);
    }

    /**
     * Activate category
     */
    public CategoryJpaEntity activateCategory(String categoryId) {
        CategoryJpaEntity category = getCategoryById(categoryId);
        category.setActive(true);
        return categoryRepository.save(category);
    }

    /**
     * Deactivate category
     */
    public CategoryJpaEntity deactivateCategory(String categoryId) {
        CategoryJpaEntity category = getCategoryById(categoryId);
        category.setActive(false);
        return categoryRepository.save(category);
    }

    /**
     * Deactivate category and all its descendants
     */
    public int deactivateCategoryAndDescendants(String categoryId) {
        return categoryRepository.deactivateCategoryAndDescendants(categoryId);
    }

    // Utility methods

    /**
     * Update sort order for a category
     */
    public void updateSortOrder(String categoryId, int sortOrder) {
        categoryRepository.updateSortOrder(categoryId, sortOrder);
    }

    /**
     * Generate slug from category name
     */
    public String generateSlug(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required for slug generation");
        }
        
        return name.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    // Analytics and reporting

    /**
     * Count products in category tree
     */
    @Transactional(readOnly = true)
    public long countProductsInCategoryTree(String categoryId) {
        return categoryRepository.countProductsInCategoryTree(categoryId);
    }

    /**
     * Count active products in category tree
     */
    @Transactional(readOnly = true)
    public long countActiveProductsInCategoryTree(String categoryId) {
        return categoryRepository.countActiveProductsInCategoryTree(categoryId);
    }

    // Validation methods

    /**
     * Validate category data
     */
    private void validateCategory(CategoryJpaEntity category) {
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        
        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            throw new IllegalArgumentException("Category slug is required");
        }
        
        // Validate slug format
        if (!category.getSlug().matches("^[a-z0-9-]+$")) {
            throw new IllegalArgumentException("Category slug must contain only lowercase letters, numbers, and hyphens");
        }
        
        if (category.getSortOrder() < 0) {
            throw new IllegalArgumentException("Sort order cannot be negative");
        }
    }
} 