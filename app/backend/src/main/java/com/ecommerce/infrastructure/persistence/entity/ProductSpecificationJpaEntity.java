package com.ecommerce.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * JPA Entity for Product Specifications
 * Represents a single specification key-value pair associated with a product
 * Part of the normalized product schema
 */
@Entity
@Table(name = "product_specifications", indexes = {
    @Index(name = "idx_product_spec_product_id", columnList = "product_id"),
    @Index(name = "idx_product_spec_key", columnList = "product_id, spec_key"),
    @Index(name = "idx_product_spec_category", columnList = "spec_category")
})
public class ProductSpecificationJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    @NotNull(message = "Product is required")
    private ProductJpaEntity product;

    @NotBlank(message = "Specification key is required")
    @Size(max = 100, message = "Specification key must not exceed 100 characters")
    @Column(name = "spec_key", nullable = false, length = 100)
    private String specKey;

    @NotBlank(message = "Specification value is required")
    @Size(max = 1000, message = "Specification value must not exceed 1000 characters")
    @Column(name = "spec_value", nullable = false, length = 1000)
    private String specValue;

    @Size(max = 50, message = "Specification category must not exceed 50 characters")
    @Column(name = "spec_category", length = 50)
    private String specCategory; // e.g., "Technical", "Physical", "Performance"

    @Size(max = 20, message = "Data type must not exceed 20 characters")
    @Column(name = "data_type", length = 20)
    private String dataType; // e.g., "text", "number", "boolean", "date"

    @Size(max = 20, message = "Unit must not exceed 20 characters")
    @Column(name = "unit", length = 20)
    private String unit; // e.g., "cm", "kg", "watts"

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_searchable", nullable = false)
    private Boolean isSearchable = false;

    @Column(name = "is_filterable", nullable = false)
    private Boolean isFilterable = false;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    // Default constructor
    public ProductSpecificationJpaEntity() {
        super();
    }

    // Constructor
    public ProductSpecificationJpaEntity(ProductJpaEntity product, String specKey, String specValue) {
        super();
        this.product = product;
        this.specKey = specKey;
        this.specValue = specValue;
    }

    // Constructor with category
    public ProductSpecificationJpaEntity(ProductJpaEntity product, String specKey, String specValue, String specCategory) {
        super();
        this.product = product;
        this.specKey = specKey;
        this.specValue = specValue;
        this.specCategory = specCategory;
    }

    // Getters and Setters
    public ProductJpaEntity getProduct() {
        return product;
    }

    public void setProduct(ProductJpaEntity product) {
        this.product = product;
    }

    public String getSpecKey() {
        return specKey;
    }

    public void setSpecKey(String specKey) {
        this.specKey = specKey;
    }

    public String getSpecValue() {
        return specValue;
    }

    public void setSpecValue(String specValue) {
        this.specValue = specValue;
    }

    public String getSpecCategory() {
        return specCategory;
    }

    public void setSpecCategory(String specCategory) {
        this.specCategory = specCategory;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
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

        ProductSpecificationJpaEntity that = (ProductSpecificationJpaEntity) o;

        if (!product.equals(that.product)) return false;
        return specKey.equals(that.specKey);
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + product.hashCode();
        result = 31 * result + specKey.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "ProductSpecificationJpaEntity{" +
                "id='" + getId() + '\'' +
                ", specKey='" + specKey + '\'' +
                ", specValue='" + specValue + '\'' +
                ", specCategory='" + specCategory + '\'' +
                ", dataType='" + dataType + '\'' +
                ", unit='" + unit + '\'' +
                ", displayOrder=" + displayOrder +
                ", isSearchable=" + isSearchable +
                ", isFilterable=" + isFilterable +
                ", isVisible=" + isVisible +
                '}';
    }
} 