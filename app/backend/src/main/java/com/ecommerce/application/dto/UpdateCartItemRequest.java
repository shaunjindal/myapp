package com.ecommerce.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for updating cart items
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class UpdateCartItemRequest {
    
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be non-negative (0 to remove item)")
    private Integer quantity;
    
    private Boolean isGift;
    private String giftMessage;
    
    // Default constructor
    public UpdateCartItemRequest() {
    }
    
    // Constructor with quantity
    public UpdateCartItemRequest(Integer quantity) {
        this.quantity = quantity;
    }
    
    // Constructor with all fields
    public UpdateCartItemRequest(Integer quantity, Boolean isGift, String giftMessage) {
        this.quantity = quantity;
        this.isGift = isGift;
        this.giftMessage = giftMessage;
    }
    
    // Getters and Setters
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
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
        return "UpdateCartItemRequest{" +
                "quantity=" + quantity +
                ", isGift=" + isGift +
                ", giftMessage='" + giftMessage + '\'' +
                '}';
    }
} 