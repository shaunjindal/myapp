package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.product.DimensionUnit;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * JPA Entity for Product Dimensions
 * Represents the physical dimensions of a product
 * Part of the normalized product schema
 */
@Entity
@Table(name = "product_dimensions", indexes = {
    @Index(name = "idx_product_dimension_product_id", columnList = "product_id")
})
public class ProductDimensionJpaEntity extends BaseJpaEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    @NotNull(message = "Product is required")
    private ProductJpaEntity product;

    @NotNull(message = "Length is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Length must be greater than 0")
    @Column(name = "length", nullable = false, precision = 10, scale = 3)
    private BigDecimal length;

    @NotNull(message = "Width is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Width must be greater than 0")
    @Column(name = "width", nullable = false, precision = 10, scale = 3)
    private BigDecimal width;

    @NotNull(message = "Height is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Height must be greater than 0")
    @Column(name = "height", nullable = false, precision = 10, scale = 3)
    private BigDecimal height;

    @NotNull(message = "Dimension unit is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = false, length = 20)
    private DimensionUnit unit;

    // Calculated fields for easier queries
    @Column(name = "volume", precision = 15, scale = 6)
    private BigDecimal volume;

    @Column(name = "longest_dimension", precision = 10, scale = 3)
    private BigDecimal longestDimension;

    @Column(name = "shortest_dimension", precision = 10, scale = 3)
    private BigDecimal shortestDimension;

    // Default constructor
    public ProductDimensionJpaEntity() {
        super();
    }

    // Constructor
    public ProductDimensionJpaEntity(ProductJpaEntity product, BigDecimal length, BigDecimal width, BigDecimal height, DimensionUnit unit) {
        super();
        this.product = product;
        this.length = length;
        this.width = width;
        this.height = height;
        this.unit = unit;
        calculateDerivedValues();
    }

    // Business methods
    public BigDecimal calculateVolume() {
        if (length != null && width != null && height != null) {
            return length.multiply(width).multiply(height);
        }
        return BigDecimal.ZERO;
    }

    public BigDecimal getLongestDimension() {
        if (length == null || width == null || height == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal max = length;
        if (width.compareTo(max) > 0) {
            max = width;
        }
        if (height.compareTo(max) > 0) {
            max = height;
        }
        return max;
    }

    public BigDecimal getShortestDimension() {
        if (length == null || width == null || height == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal min = length;
        if (width.compareTo(min) < 0) {
            min = width;
        }
        if (height.compareTo(min) < 0) {
            min = height;
        }
        return min;
    }

    public String getFormattedDimensions() {
        if (length == null || width == null || height == null || unit == null) {
            return "";
        }
        return String.format("%.2f x %.2f x %.2f %s", 
            length.doubleValue(), 
            width.doubleValue(), 
            height.doubleValue(), 
            unit.getSymbol());
    }

    private void calculateDerivedValues() {
        this.volume = calculateVolume();
        this.longestDimension = getLongestDimension();
        this.shortestDimension = getShortestDimension();
    }

    // Getters and Setters
    public ProductJpaEntity getProduct() {
        return product;
    }

    public void setProduct(ProductJpaEntity product) {
        this.product = product;
    }

    public BigDecimal getLength() {
        return length;
    }

    public void setLength(BigDecimal length) {
        this.length = length;
        calculateDerivedValues();
    }

    public BigDecimal getWidth() {
        return width;
    }

    public void setWidth(BigDecimal width) {
        this.width = width;
        calculateDerivedValues();
    }

    public BigDecimal getHeight() {
        return height;
    }

    public void setHeight(BigDecimal height) {
        this.height = height;
        calculateDerivedValues();
    }

    public DimensionUnit getUnit() {
        return unit;
    }

    public void setUnit(DimensionUnit unit) {
        this.unit = unit;
    }

    public BigDecimal getVolume() {
        return volume;
    }

    public void setVolume(BigDecimal volume) {
        this.volume = volume;
    }

    public void setLongestDimension(BigDecimal longestDimension) {
        this.longestDimension = longestDimension;
    }

    public void setShortestDimension(BigDecimal shortestDimension) {
        this.shortestDimension = shortestDimension;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        ProductDimensionJpaEntity that = (ProductDimensionJpaEntity) o;

        return product.equals(that.product);
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + product.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "ProductDimensionJpaEntity{" +
                "id='" + getId() + '\'' +
                ", length=" + length +
                ", width=" + width +
                ", height=" + height +
                ", unit=" + unit +
                ", volume=" + volume +
                ", longestDimension=" + longestDimension +
                ", shortestDimension=" + shortestDimension +
                '}';
    }
} 