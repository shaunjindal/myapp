package com.ecommerce.application.dto;

import com.ecommerce.domain.cart.CartStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for Cart information
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class CartDto {
    
    private String id;
    private String userId;
    private String sessionId;
    private List<CartItemDto> items;
    private CartStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String discountCode;
    private int totalItems;
    private int uniqueItems;
    private boolean isGuestCart;
    private boolean hasDiscount;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivityAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public CartDto() {
    }
    
    // Constructor with essential fields
    public CartDto(String id, String userId, String sessionId, List<CartItemDto> items, 
                   CartStatus status, BigDecimal totalAmount, int totalItems) {
        this.id = id;
        this.userId = userId;
        this.sessionId = sessionId;
        this.items = items;
        this.status = status;
        this.totalAmount = totalAmount;
        this.totalItems = totalItems;
        this.uniqueItems = items != null ? items.size() : 0;
        this.isGuestCart = userId == null && sessionId != null;
    }
    
    // Business methods
    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }
    
    public boolean isActive() {
        return CartStatus.ACTIVE.equals(status);
    }
    
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean canCheckout() {
        return isActive() && !isEmpty() && !isExpired();
    }
    
    public BigDecimal getFinalTotal() {
        return totalAmount != null ? totalAmount : BigDecimal.ZERO;
    }
    
    public BigDecimal getSavingsAmount() {
        return discountAmount != null ? discountAmount : BigDecimal.ZERO;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public List<CartItemDto> getItems() {
        return items;
    }
    
    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }
    
    public CartStatus getStatus() {
        return status;
    }
    
    public void setStatus(CartStatus status) {
        this.status = status;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public BigDecimal getTaxAmount() {
        return taxAmount;
    }
    
    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public BigDecimal getShippingAmount() {
        return shippingAmount;
    }
    
    public void setShippingAmount(BigDecimal shippingAmount) {
        this.shippingAmount = shippingAmount;
    }
    
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getDiscountCode() {
        return discountCode;
    }
    
    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }
    
    public int getTotalItems() {
        return totalItems;
    }
    
    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
    
    public int getUniqueItems() {
        return uniqueItems;
    }
    
    public void setUniqueItems(int uniqueItems) {
        this.uniqueItems = uniqueItems;
    }
    
    public boolean isGuestCart() {
        return isGuestCart;
    }
    
    public void setGuestCart(boolean guestCart) {
        isGuestCart = guestCart;
    }
    
    public boolean isHasDiscount() {
        return hasDiscount;
    }
    
    public void setHasDiscount(boolean hasDiscount) {
        this.hasDiscount = hasDiscount;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }
    
    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "CartDto{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", sessionId='" + sessionId + '\'' +
                ", itemCount=" + totalItems +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                ", isGuestCart=" + isGuestCart +
                '}';
    }
} 