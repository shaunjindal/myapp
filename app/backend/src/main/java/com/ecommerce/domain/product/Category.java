package com.ecommerce.domain.product;

import com.ecommerce.domain.common.AuditableEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Category domain entity representing a product category in a hierarchical structure
 * 
 * This entity supports:
 * - Hierarchical category structure (parent-child relationships)
 * - SEO-friendly slug generation
 * - Category status management
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class Category extends AuditableEntity {
    
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @NotBlank(message = "Slug is required")
    @Size(min = 2, max = 100, message = "Slug must be between 2 and 100 characters")
    private String slug;
    
    private String imageUrl;
    
    private Category parent;
    
    private List<Category> children;
    
    private boolean active;
    
    private int sortOrder;
    
    private String metaTitle;
    
    private String metaDescription;
    
    private String metaKeywords;
    
    // Default constructor
    public Category() {
        super();
        this.children = new ArrayList<>();
        this.active = true;
        this.sortOrder = 0;
    }
    
    // Constructor for creating a new category
    public Category(String name, String description, String slug) {
        this();
        this.name = name;
        this.description = description;
        this.slug = slug;
    }
    
    // Constructor for creating a subcategory
    public Category(String name, String description, String slug, Category parent) {
        this(name, description, slug);
        this.parent = parent;
        if (parent != null) {
            parent.addChild(this);
        }
    }
    
    // Business methods
    public boolean isRootCategory() {
        return this.parent == null;
    }
    
    public boolean hasChildren() {
        return this.children != null && !this.children.isEmpty();
    }
    
    public boolean isLeafCategory() {
        return !hasChildren();
    }
    
    public int getDepth() {
        if (isRootCategory()) {
            return 0;
        }
        return 1 + parent.getDepth();
    }
    
    public List<Category> getPath() {
        List<Category> path = new ArrayList<>();
        Category current = this;
        while (current != null) {
            path.add(0, current);
            current = current.getParent();
        }
        return path;
    }
    
    public String getFullPath() {
        return getPath().stream()
                .map(Category::getName)
                .reduce((a, b) -> a + " > " + b)
                .orElse(this.name);
    }
    
    public void addChild(Category child) {
        if (child != null && !this.children.contains(child)) {
            this.children.add(child);
            child.setParent(this);
        }
    }
    
    public void removeChild(Category child) {
        if (child != null) {
            this.children.remove(child);
            child.setParent(null);
        }
    }
    
    public List<Category> getAllDescendants() {
        List<Category> descendants = new ArrayList<>();
        for (Category child : children) {
            descendants.add(child);
            descendants.addAll(child.getAllDescendants());
        }
        return descendants;
    }
    
    public void activate() {
        this.active = true;
    }
    
    public void deactivate() {
        this.active = false;
    }
    
    public boolean isActive() {
        return this.active;
    }
    
    public boolean isActiveInHierarchy() {
        if (!this.active) {
            return false;
        }
        Category current = this.parent;
        while (current != null) {
            if (!current.isActive()) {
                return false;
            }
            current = current.getParent();
        }
        return true;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSlug() {
        return slug;
    }
    
    public void setSlug(String slug) {
        this.slug = slug;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public Category getParent() {
        return parent;
    }
    
    public void setParent(Category parent) {
        this.parent = parent;
    }
    
    public List<Category> getChildren() {
        return new ArrayList<>(children);
    }
    
    public void setChildren(List<Category> children) {
        this.children = children != null ? new ArrayList<>(children) : new ArrayList<>();
    }
    
    public boolean getActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public int getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public String getMetaTitle() {
        return metaTitle;
    }
    
    public void setMetaTitle(String metaTitle) {
        this.metaTitle = metaTitle;
    }
    
    public String getMetaDescription() {
        return metaDescription;
    }
    
    public void setMetaDescription(String metaDescription) {
        this.metaDescription = metaDescription;
    }
    
    public String getMetaKeywords() {
        return metaKeywords;
    }
    
    public void setMetaKeywords(String metaKeywords) {
        this.metaKeywords = metaKeywords;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(getId(), category.getId()) &&
               Objects.equals(slug, category.slug);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(getId(), slug);
    }
    
    @Override
    public String toString() {
        return "Category{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", slug='" + slug + '\'' +
                ", active=" + active +
                ", depth=" + getDepth() +
                '}';
    }
} 