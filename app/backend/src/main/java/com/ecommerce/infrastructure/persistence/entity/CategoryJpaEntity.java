package com.ecommerce.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity for Category
 * Maps the Category domain entity to the database
 */
@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_category_slug", columnList = "slug", unique = true),
    @Index(name = "idx_category_parent", columnList = "parent_id"),
    @Index(name = "idx_category_active", columnList = "active"),
    @Index(name = "idx_category_sort_order", columnList = "sort_order")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CategoryJpaEntity extends BaseJpaEntity {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description", length = 500)
    private String description;

    @NotBlank(message = "Slug is required")
    @Size(min = 2, max = 100, message = "Slug must be between 2 and 100 characters")
    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private CategoryJpaEntity parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, name ASC")
    @JsonManagedReference
    private List<CategoryJpaEntity> children = new ArrayList<>();

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "meta_title", length = 150)
    private String metaTitle;

    @Column(name = "meta_description", length = 300)
    private String metaDescription;

    @Column(name = "meta_keywords", length = 500)
    private String metaKeywords;

    // Default constructor
    public CategoryJpaEntity() {
        super();
        // ID will be set when name is provided
    }
    
    private String generateCategoryId(String name) {
        // Generate a simple category ID based on name
        if (name == null || name.trim().isEmpty()) {
            return "cat-" + System.currentTimeMillis(); // fallback
        }
        return "cat-" + name.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    // Constructor for creating a new category
    public CategoryJpaEntity(String name, String description, String slug) {
        super();
        this.name = name;
        this.description = description;
        this.slug = slug;
        this.setId(generateCategoryId(name));
    }

    // Business methods
    public boolean isRootCategory() {
        return this.parent == null;
    }

    public boolean hasChildren() {
        return this.children != null && !this.children.isEmpty();
    }

    public int getDepth() {
        if (isRootCategory()) {
            return 0;
        }
        return 1 + parent.getDepth();
    }

    public void addChild(CategoryJpaEntity child) {
        if (child != null && !this.children.contains(child)) {
            this.children.add(child);
            child.setParent(this);
        }
    }

    public void removeChild(CategoryJpaEntity child) {
        if (child != null) {
            this.children.remove(child);
            child.setParent(null);
        }
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        // Update ID when name changes
        if (name != null && !name.trim().isEmpty()) {
            this.setId(generateCategoryId(name));
        }
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

    public CategoryJpaEntity getParent() {
        return parent;
    }

    public void setParent(CategoryJpaEntity parent) {
        this.parent = parent;
    }

    public List<CategoryJpaEntity> getChildren() {
        return children;
    }

    public void setChildren(List<CategoryJpaEntity> children) {
        this.children = children;
    }

    public boolean isActive() {
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
} 