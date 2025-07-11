package com.ecommerce.domain.payment;

/**
 * Enumeration representing payment statuses
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum PaymentStatus {
    /**
     * Payment has been created but not yet processed
     */
    CREATED("Created"),
    
    /**
     * Payment is being processed
     */
    PROCESSING("Processing"),
    
    /**
     * Payment has been successfully processed
     */
    PAID("Paid"),
    
    /**
     * Payment has failed
     */
    FAILED("Failed"),
    
    /**
     * Payment has been refunded
     */
    REFUNDED("Refunded"),
    
    /**
     * Payment has been partially refunded
     */
    PARTIALLY_REFUNDED("Partially Refunded"),
    
    /**
     * Payment has been cancelled
     */
    CANCELLED("Cancelled"),
    
    /**
     * Payment is pending verification
     */
    PENDING("Pending");
    
    private final String displayName;
    
    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Check if this status indicates a successful payment
     * @return true if payment is successful, false otherwise
     */
    public boolean isSuccessful() {
        return this == PAID;
    }
    
    /**
     * Check if this status indicates a failed payment
     * @return true if payment is failed, false otherwise
     */
    public boolean isFailed() {
        return this == FAILED || this == CANCELLED;
    }
    
    /**
     * Check if this status indicates a refunded payment
     * @return true if payment is refunded, false otherwise
     */
    public boolean isRefunded() {
        return this == REFUNDED || this == PARTIALLY_REFUNDED;
    }
    
    /**
     * Check if this status indicates a pending payment
     * @return true if payment is pending, false otherwise
     */
    public boolean isPending() {
        return this == CREATED || this == PROCESSING || this == PENDING;
    }
    
    /**
     * Check if this status indicates a final state (no further changes expected)
     * @return true if status is final, false otherwise
     */
    public boolean isFinal() {
        return this == PAID || this == FAILED || this == REFUNDED || this == CANCELLED;
    }
} 