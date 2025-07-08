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
    private String productSku;
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
    private LocalDateTime addedAt;
    private boolean isGift;
    private String giftMessage;
    private String customAttributes;

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

    public String getProductSku() {
        return productSku;
    }

    public void setProductSku(String productSku) {
        this.productSku = productSku;
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
} 