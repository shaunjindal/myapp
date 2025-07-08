package com.ecommerce.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * JPA Entity for Product Tags
 * Represents a single tag associated with a product
 * Part of the normalized product schema
 */
@Entity
@Table(name = "product_tags", indexes = {
    @Index(name = "idx_product_tag_product_id", columnList = "product_id"),
    @Index(name = "idx_product_tag_name", columnList = "tag_name"),
    @Index(name = "idx_product_tag_category", columnList = "tag_category")
})
public class ProductTagJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    @NotNull(message = "Product is required")
    private ProductJpaEntity product;

    @NotBlank(message = "Tag name is required")
    @Size(max = 50, message = "Tag name must not exceed 50 characters")
    @Column(name = "tag_name", nullable = false, length = 50)
    private String tagName;

    @Size(max = 30, message = "Tag category must not exceed 30 characters")
    @Column(name = "tag_category", length = 30)
    private String tagCategory; // e.g., "feature", "material", "color", "size", "style"

    @Size(max = 200, message = "Description must not exceed 200 characters")
    @Column(name = "description", length = 200)
    private String description;

    @Column(name = "is_searchable", nullable = false)
    private Boolean isSearchable = true;

    @Column(name = "is_filterable", nullable = false)
    private Boolean isFilterable = true;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    // Default constructor
    public ProductTagJpaEntity() {
        super();
    }

    // Constructor
    public ProductTagJpaEntity(ProductJpaEntity product, String tagName) {
        super();
        this.product = product;
        this.tagName = tagName != null ? tagName.toLowerCase().trim() : null;
    }

    // Constructor with category
    public ProductTagJpaEntity(ProductJpaEntity product, String tagName, String tagCategory) {
        super();
        this.product = product;
        this.tagName = tagName != null ? tagName.toLowerCase().trim() : null;
        this.tagCategory = tagCategory;
    }

    // Getters and Setters
    public ProductJpaEntity getProduct() {
        return product;
    }

    public void setProduct(ProductJpaEntity product) {
        this.product = product;
    }

    public String getTagName() {
        return tagName;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName != null ? tagName.toLowerCase().trim() : null;
    }

    public String getTagCategory() {
        return tagCategory;
    }

    public void setTagCategory(String tagCategory) {
        this.tagCategory = tagCategory;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsSearchable() {
        return isSearchable;
    }

    public void setIsSearchable(Boolean isSearchable) {
        this.isSearchable = isSearchable;
    }

    public Boolean getIsFilterable() {
        return isFilterable;
    }

    public void setIsFilterable(Boolean isFilterable) {
        this.isFilterable = isFilterable;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        ProductTagJpaEntity that = (ProductTagJpaEntity) o;

        if (!product.equals(that.product)) return false;
        return tagName.equals(that.tagName);
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + product.hashCode();
        result = 31 * result + tagName.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "ProductTagJpaEntity{" +
                "id='" + getId() + '\'' +
                ", tagName='" + tagName + '\'' +
                ", tagCategory='" + tagCategory + '\'' +
                ", description='" + description + '\'' +
                ", isSearchable=" + isSearchable +
                ", isFilterable=" + isFilterable +
                ", isVisible=" + isVisible +
                '}';
    }
} 