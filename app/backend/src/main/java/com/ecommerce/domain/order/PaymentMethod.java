package com.ecommerce.domain.order;

/**
 * Enumeration representing available payment methods
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum PaymentMethod {
    /**
     * Credit card payment
     */
    CREDIT_CARD("Credit Card"),
    
    /**
     * Debit card payment
     */
    DEBIT_CARD("Debit Card"),
    
    /**
     * PayPal payment
     */
    PAYPAL("PayPal"),
    
    /**
     * Apple Pay
     */
    APPLE_PAY("Apple Pay"),
    
    /**
     * Google Pay
     */
    GOOGLE_PAY("Google Pay"),
    
    /**
     * Bank transfer
     */
    BANK_TRANSFER("Bank Transfer"),
    
    /**
     * Cash on delivery
     */
    CASH_ON_DELIVERY("Cash on Delivery"),
    
    /**
     * Digital wallet
     */
    DIGITAL_WALLET("Digital Wallet"),
    
    /**
     * Cryptocurrency
     */
    CRYPTOCURRENCY("Cryptocurrency"),
    
    /**
     * Store credit
     */
    STORE_CREDIT("Store Credit");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Check if this payment method requires online processing
     * @return true if online processing is required, false otherwise
     */
    public boolean requiresOnlineProcessing() {
        return this == CREDIT_CARD || 
               this == DEBIT_CARD || 
               this == PAYPAL || 
               this == APPLE_PAY || 
               this == GOOGLE_PAY || 
               this == DIGITAL_WALLET || 
               this == CRYPTOCURRENCY;
    }
    
    /**
     * Check if this payment method supports refunds
     * @return true if refunds are supported, false otherwise
     */
    public boolean supportsRefunds() {
        return this != CASH_ON_DELIVERY;
    }
    
    /**
     * Check if this payment method requires immediate payment
     * @return true if immediate payment is required, false otherwise
     */
    public boolean requiresImmediatePayment() {
        return this != CASH_ON_DELIVERY && this != BANK_TRANSFER;
    }
    
    /**
     * Check if this payment method supports partial payments
     * @return true if partial payments are supported, false otherwise
     */
    public boolean supportsPartialPayments() {
        return this == STORE_CREDIT || this == DIGITAL_WALLET;
    }
    
    /**
     * Get the processing fee percentage for this payment method
     * @return the processing fee as a percentage (0.0 to 1.0)
     */
    public double getProcessingFeePercentage() {
        return switch (this) {
            case CREDIT_CARD, DEBIT_CARD -> 0.029; // 2.9%
            case PAYPAL -> 0.034; // 3.4%
            case APPLE_PAY, GOOGLE_PAY -> 0.025; // 2.5%
            case CRYPTOCURRENCY -> 0.015; // 1.5%
            case BANK_TRANSFER -> 0.005; // 0.5%
            case CASH_ON_DELIVERY, STORE_CREDIT, DIGITAL_WALLET -> 0.0; // No fee
        };
    }
} 