package com.ecommerce.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Cart Item information
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class CartItemDto {
    
    private String id;
    private String productId;
    private String productName;
    private String productImageUrl;
    private String productSku;
    private String productBrand; // Add brand field
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal originalPrice;
    private BigDecimal discountAmount;
    private BigDecimal savingsAmount;
    
    // Price component fields from product
    private BigDecimal baseAmount;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private Boolean isGift;
    private String giftMessage;
    private Boolean isAvailable;
    private Boolean isPriceChanged;
    private String unavailabilityReason;
    
    // Variable dimension fields
    private BigDecimal customLength;
    private BigDecimal calculatedUnitPrice;
    private String dimensionDetails;
    
    // Product variable dimension properties
    private Boolean isVariableDimension;
    private BigDecimal fixedHeight;
    private String dimensionUnit;
    private BigDecimal variableDimensionRate;
    private BigDecimal maxLength;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime addedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public CartItemDto() {
    }
    
    // Constructor with essential fields
    public CartItemDto(String id, String productId, String productName, Integer quantity, 
                       BigDecimal unitPrice, BigDecimal totalPrice) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
    }
    
    // Business methods
    public boolean hasDiscount() {
        return discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean hasSavings() {
        return savingsAmount != null && savingsAmount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public BigDecimal getFinalPrice() {
        return totalPrice != null ? totalPrice : BigDecimal.ZERO;
    }
    
    public BigDecimal getEffectiveUnitPrice() {
        // For variable dimension products, use calculated unit price if available
        if (calculatedUnitPrice != null) {
            return calculatedUnitPrice;
        }
        
        // Otherwise, calculate from total price and quantity
        if (quantity != null && quantity > 0 && totalPrice != null) {
            return totalPrice.divide(BigDecimal.valueOf(quantity), 2, BigDecimal.ROUND_HALF_UP);
        }
        return unitPrice != null ? unitPrice : BigDecimal.ZERO;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getProductImageUrl() {
        return productImageUrl;
    }
    
    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }
    
    public String getProductSku() {
        return productSku;
    }
    
    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }
    
    public String getProductBrand() {
        return productBrand;
    }
    
    public void setProductBrand(String productBrand) {
        this.productBrand = productBrand;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }
    
    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }
    
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    public BigDecimal getSavingsAmount() {
        return savingsAmount;
    }
    
    public void setSavingsAmount(BigDecimal savingsAmount) {
        this.savingsAmount = savingsAmount;
    }
    
    public BigDecimal getBaseAmount() {
        return baseAmount;
    }
    
    public void setBaseAmount(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
    }
    
    public BigDecimal getTaxRate() {
        return taxRate;
    }
    
    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }
    
    public BigDecimal getTaxAmount() {
        return taxAmount;
    }
    
    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public Boolean getIsGift() {
        return isGift;
    }
    
    public void setIsGift(Boolean isGift) {
        this.isGift = isGift;
    }
    
    public String getGiftMessage() {
        return giftMessage;
    }
    
    public void setGiftMessage(String giftMessage) {
        this.giftMessage = giftMessage;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public Boolean getIsPriceChanged() {
        return isPriceChanged;
    }
    
    public void setIsPriceChanged(Boolean isPriceChanged) {
        this.isPriceChanged = isPriceChanged;
    }
    
    public String getUnavailabilityReason() {
        return unavailabilityReason;
    }
    
    public void setUnavailabilityReason(String unavailabilityReason) {
        this.unavailabilityReason = unavailabilityReason;
    }
    
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Variable dimension getters and setters
    public BigDecimal getCustomLength() {
        return customLength;
    }
    
    public void setCustomLength(BigDecimal customLength) {
        this.customLength = customLength;
    }
    
    public BigDecimal getCalculatedUnitPrice() {
        return calculatedUnitPrice;
    }
    
    public void setCalculatedUnitPrice(BigDecimal calculatedUnitPrice) {
        this.calculatedUnitPrice = calculatedUnitPrice;
    }
    
    public String getDimensionDetails() {
        return dimensionDetails;
    }
    
    public void setDimensionDetails(String dimensionDetails) {
        this.dimensionDetails = dimensionDetails;
    }
    
    // Product variable dimension property getters and setters
    public Boolean getIsVariableDimension() {
        return isVariableDimension;
    }
    
    public void setIsVariableDimension(Boolean isVariableDimension) {
        this.isVariableDimension = isVariableDimension;
    }
    
    public BigDecimal getFixedHeight() {
        return fixedHeight;
    }
    
    public void setFixedHeight(BigDecimal fixedHeight) {
        this.fixedHeight = fixedHeight;
    }
    
    public String getDimensionUnit() {
        return dimensionUnit;
    }
    
    public void setDimensionUnit(String dimensionUnit) {
        this.dimensionUnit = dimensionUnit;
    }
    
    public BigDecimal getVariableDimensionRate() {
        return variableDimensionRate;
    }
    
    public void setVariableDimensionRate(BigDecimal variableDimensionRate) {
        this.variableDimensionRate = variableDimensionRate;
    }
    
    public BigDecimal getMaxLength() {
        return maxLength;
    }
    
    public void setMaxLength(BigDecimal maxLength) {
        this.maxLength = maxLength;
    }
    
    // Helper methods for variable dimensions
    public boolean hasCustomDimensions() {
        return customLength != null && calculatedUnitPrice != null;
    }
    
    @Override
    public String toString() {
        return "CartItemDto{" +
                "id='" + id + '\'' +
                ", productName='" + productName + '\'' +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + totalPrice +
                ", isAvailable=" + isAvailable +
                '}';
    }
} 