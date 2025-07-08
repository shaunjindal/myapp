package com.ecommerce.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for adding items to cart
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class AddToCartRequest {
    
    @NotBlank(message = "Product ID is required")
    private String productId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    private String sessionId;
    private String deviceFingerprint;
    private Boolean isGift;
    private String giftMessage;
    
    // Default constructor
    public AddToCartRequest() {
    }
    
    // Constructor with essential fields
    public AddToCartRequest(String productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }
    
    // Constructor with session info
    public AddToCartRequest(String productId, Integer quantity, String sessionId, String deviceFingerprint) {
        this.productId = productId;
        this.quantity = quantity;
        this.sessionId = sessionId;
        this.deviceFingerprint = deviceFingerprint;
    }
    
    // Getters and Setters
    public String getProductId() {
        return productId;
    }
    
    public void setProductId(String productId) {
        this.productId = productId;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }
    
    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
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
    
    @Override
    public String toString() {
        return "AddToCartRequest{" +
                "productId='" + productId + '\'' +
                ", quantity=" + quantity +
                ", sessionId='" + sessionId + '\'' +
                ", isGift=" + isGift +
                '}';
    }
} 