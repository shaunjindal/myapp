package com.ecommerce.domain.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Value object representing the physical dimensions of a product
 * 
 * This is an immutable value object following DDD principles:
 * - Encapsulates dimension-related data and behavior
 * - Provides validation for dimension values
 * - Immutable to ensure data integrity
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class ProductDimensions {
    
    @NotNull(message = "Length is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Length must be greater than 0")
    private final BigDecimal length;
    
    @NotNull(message = "Width is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Width must be greater than 0")
    private final BigDecimal width;
    
    @NotNull(message = "Height is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Height must be greater than 0")
    private final BigDecimal height;
    
    @NotNull(message = "Dimension unit is required")
    private final DimensionUnit unit;
    
    // Private constructor for immutability
    private ProductDimensions(BigDecimal length, BigDecimal width, BigDecimal height, DimensionUnit unit) {
        this.length = length;
        this.width = width;
        this.height = height;
        this.unit = unit;
    }
    
    /**
     * Factory method to create ProductDimensions
     * @param length the length of the product
     * @param width the width of the product
     * @param height the height of the product
     * @param unit the unit of measurement
     * @return new ProductDimensions instance
     */
    public static ProductDimensions of(BigDecimal length, BigDecimal width, BigDecimal height, DimensionUnit unit) {
        if (length == null || width == null || height == null || unit == null) {
            throw new IllegalArgumentException("All dimension values and unit must be provided");
        }
        if (length.compareTo(BigDecimal.ZERO) <= 0 || 
            width.compareTo(BigDecimal.ZERO) <= 0 || 
            height.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("All dimensions must be greater than zero");
        }
        return new ProductDimensions(length, width, height, unit);
    }
    
    /**
     * Factory method to create ProductDimensions with double values
     * @param length the length of the product
     * @param width the width of the product
     * @param height the height of the product
     * @param unit the unit of measurement
     * @return new ProductDimensions instance
     */
    public static ProductDimensions of(double length, double width, double height, DimensionUnit unit) {
        return of(
            BigDecimal.valueOf(length),
            BigDecimal.valueOf(width),
            BigDecimal.valueOf(height),
            unit
        );
    }
    
    /**
     * Calculate the volume of the product
     * @return volume in the current unit cubed
     */
    public BigDecimal calculateVolume() {
        return length.multiply(width).multiply(height);
    }
    
    /**
     * Calculate the longest dimension (useful for shipping calculations)
     * @return the longest dimension
     */
    public BigDecimal getLongestDimension() {
        BigDecimal max = length;
        if (width.compareTo(max) > 0) {
            max = width;
        }
        if (height.compareTo(max) > 0) {
            max = height;
        }
        return max;
    }
    
    /**
     * Calculate the shortest dimension
     * @return the shortest dimension
     */
    public BigDecimal getShortestDimension() {
        BigDecimal min = length;
        if (width.compareTo(min) < 0) {
            min = width;
        }
        if (height.compareTo(min) < 0) {
            min = height;
        }
        return min;
    }
    
    /**
     * Convert dimensions to a different unit
     * @param targetUnit the target unit to convert to
     * @return new ProductDimensions in the target unit
     */
    public ProductDimensions convertTo(DimensionUnit targetUnit) {
        if (this.unit == targetUnit) {
            return this;
        }
        
        BigDecimal conversionFactor = this.unit.getConversionFactorTo(targetUnit);
        
        return new ProductDimensions(
            length.multiply(conversionFactor),
            width.multiply(conversionFactor),
            height.multiply(conversionFactor),
            targetUnit
        );
    }
    
    /**
     * Get formatted dimensions string
     * @return formatted string like "10.5 x 5.2 x 3.1 cm"
     */
    public String getFormattedDimensions() {
        return String.format("%.2f x %.2f x %.2f %s", 
            length.doubleValue(), 
            width.doubleValue(), 
            height.doubleValue(), 
            unit.getSymbol());
    }
    
    /**
     * Check if the product fits within given maximum dimensions
     * @param maxDimensions the maximum allowed dimensions
     * @return true if the product fits, false otherwise
     */
    public boolean fitsWithin(ProductDimensions maxDimensions) {
        ProductDimensions converted = this.convertTo(maxDimensions.getUnit());
        return converted.getLength().compareTo(maxDimensions.getLength()) <= 0 &&
               converted.getWidth().compareTo(maxDimensions.getWidth()) <= 0 &&
               converted.getHeight().compareTo(maxDimensions.getHeight()) <= 0;
    }
    
    // Getters
    public BigDecimal getLength() {
        return length;
    }
    
    public BigDecimal getWidth() {
        return width;
    }
    
    public BigDecimal getHeight() {
        return height;
    }
    
    public DimensionUnit getUnit() {
        return unit;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductDimensions that = (ProductDimensions) o;
        return Objects.equals(length, that.length) &&
               Objects.equals(width, that.width) &&
               Objects.equals(height, that.height) &&
               unit == that.unit;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(length, width, height, unit);
    }
    
    @Override
    public String toString() {
        return "ProductDimensions{" +
                "length=" + length +
                ", width=" + width +
                ", height=" + height +
                ", unit=" + unit +
                ", volume=" + calculateVolume() +
                '}';
    }
} 