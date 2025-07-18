package com.ecommerce.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for order item response
 */
public class OrderItemDto {

    private String id;
    private String productId;
    private String productName;
    private String productDescription;
    private String productImageUrl;
    private String productBrand;
    private String productCategory;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal productWeight;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    
    // Price component fields
    private BigDecimal baseAmount;
    private BigDecimal taxRate;
    private LocalDateTime addedAt;
    private boolean isGift;
    private String giftMessage;
    private String customAttributes;
    
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

    // Constructors
    public OrderItemDto() {
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

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public String getProductBrand() {
        return productBrand;
    }

    public void setProductBrand(String productBrand) {
        this.productBrand = productBrand;
    }

    public String getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
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

    public BigDecimal getProductWeight() {
        return productWeight;
    }

    public void setProductWeight(BigDecimal productWeight) {
        this.productWeight = productWeight;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    public boolean isGift() {
        return isGift;
    }

    public void setGift(boolean gift) {
        isGift = gift;
    }

    public String getGiftMessage() {
        return giftMessage;
    }

    public void setGiftMessage(String giftMessage) {
        this.giftMessage = giftMessage;
    }

    public String getCustomAttributes() {
        return customAttributes;
    }

    public void setCustomAttributes(String customAttributes) {
        this.customAttributes = customAttributes;
    }

    // Helper methods for frontend
    public String getFormattedUnitPrice() {
        return unitPrice != null ? String.format("$%.2f", unitPrice.doubleValue()) : null;
    }

    public String getFormattedTotalPrice() {
        return totalPrice != null ? String.format("$%.2f", totalPrice.doubleValue()) : null;
    }

    public String getFormattedDiscountAmount() {
        return discountAmount != null ? String.format("$%.2f", discountAmount.doubleValue()) : null;
    }

    public BigDecimal getTotalWeight() {
        return productWeight != null ? 
            productWeight.multiply(BigDecimal.valueOf(quantity)) : BigDecimal.ZERO;
    }

    public String getFormattedTotalWeight() {
        BigDecimal totalWeight = getTotalWeight();
        return totalWeight != null ? String.format("%.2f lbs", totalWeight.doubleValue()) : null;
    }

    public BigDecimal getItemTotalWithTax() {
        BigDecimal total = totalPrice != null ? totalPrice : BigDecimal.ZERO;
        BigDecimal tax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        return total.add(tax);
    }

    public BigDecimal getItemTotalWithDiscountAndTax() {
        BigDecimal total = totalPrice != null ? totalPrice : BigDecimal.ZERO;
        BigDecimal discount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        BigDecimal tax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        return total.subtract(discount).add(tax);
    }

    public String getFormattedItemTotalWithDiscountAndTax() {
        BigDecimal total = getItemTotalWithDiscountAndTax();
        return String.format("$%.2f", total.doubleValue());
    }

    public boolean hasDiscount() {
        return discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean hasTax() {
        return taxAmount != null && taxAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public String getDisplayName() {
        StringBuilder name = new StringBuilder();
        if (productBrand != null && !productBrand.trim().isEmpty()) {
            name.append(productBrand).append(" ");
        }
        if (productName != null) {
            name.append(productName);
        }
        return name.toString().trim();
    }

    // Price component getters and setters
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

    // Product variable dimension properties getters and setters
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
} 