package com.ecommerce.application.dto;

import java.math.BigDecimal;

/**
 * DTO for payment order creation response
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class PaymentOrderResponse {
    
    private String orderId;
    private String entity;
    private BigDecimal amount;
    private String currency;
    private String receipt;
    private String status;
    private String createdAt;
    private String keyId;
    
    // Default constructor
    public PaymentOrderResponse() {}
    
    // Constructor with essential fields
    public PaymentOrderResponse(String orderId, BigDecimal amount, String currency, String keyId) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.keyId = keyId;
    }
    
    // Getters and setters
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getEntity() {
        return entity;
    }
    
    public void setEntity(String entity) {
        this.entity = entity;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getReceipt() {
        return receipt;
    }
    
    public void setReceipt(String receipt) {
        this.receipt = receipt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getKeyId() {
        return keyId;
    }
    
    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }
    
    @Override
    public String toString() {
        return "PaymentOrderResponse{" +
                "orderId='" + orderId + '\'' +
                ", entity='" + entity + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", receipt='" + receipt + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", keyId='" + keyId + '\'' +
                '}';
    }
} 