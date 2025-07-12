package com.ecommerce.application.dto;

import java.math.BigDecimal;

/**
 * Simple DTO for payment components
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class PaymentComponent {
    
    private String type; // TAX, SHIPPING, DISCOUNT, FEE
    private BigDecimal amount;
    private String text; // Display text/label
    private boolean isNegative; // true for discounts
    
    // Default constructor
    public PaymentComponent() {
    }
    
    // Constructor
    public PaymentComponent(String type, BigDecimal amount, String text, boolean isNegative) {
        this.type = type;
        this.amount = amount;
        this.text = text;
        this.isNegative = isNegative;
    }
    
    // Convenience constructor for positive amounts
    public PaymentComponent(String type, BigDecimal amount, String text) {
        this(type, amount, text, false);
    }
    
    // Business methods
    public boolean hasAmount() {
        return amount != null && amount.compareTo(BigDecimal.ZERO) != 0;
    }
    
    public BigDecimal getEffectiveAmount() {
        if (amount == null) return BigDecimal.ZERO;
        return isNegative ? amount.negate() : amount;
    }
    
    // Getters and Setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public boolean isNegative() {
        return isNegative;
    }
    
    public void setNegative(boolean negative) {
        isNegative = negative;
    }
    
    @Override
    public String toString() {
        return "PaymentComponent{" +
                "type='" + type + '\'' +
                ", amount=" + amount +
                ", text='" + text + '\'' +
                ", isNegative=" + isNegative +
                '}';
    }
} 