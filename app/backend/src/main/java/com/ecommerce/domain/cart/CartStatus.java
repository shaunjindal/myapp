package com.ecommerce.domain.cart;

/**
 * Enumeration representing the status of a shopping cart
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum CartStatus {
    /**
     * Cart is active and can be modified
     */
    ACTIVE("Active"),
    
    /**
     * Cart has been checked out and converted to an order
     */
    CHECKED_OUT("Checked Out"),
    
    /**
     * Cart has been abandoned by the user
     */
    ABANDONED("Abandoned"),
    
    /**
     * Cart has expired and is no longer valid
     */
    EXPIRED("Expired"),
    
    /**
     * Cart is temporarily saved for later
     */
    SAVED("Saved for Later"),
    
    /**
     * Cart is being processed during checkout
     */
    PROCESSING("Processing");
    
    private final String displayName;
    
    CartStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Check if the cart can be modified
     * @return true if the cart can be modified, false otherwise
     */
    public boolean isModifiable() {
        return this == ACTIVE || this == SAVED;
    }
    
    /**
     * Check if the cart can be checked out
     * @return true if the cart can be checked out, false otherwise
     */
    public boolean canCheckout() {
        return this == ACTIVE;
    }
    
    /**
     * Check if the cart is in a final state
     * @return true if the cart is in a final state, false otherwise
     */
    public boolean isFinal() {
        return this == CHECKED_OUT || this == EXPIRED;
    }
    
    /**
     * Check if the cart is recoverable
     * @return true if the cart can be recovered, false otherwise
     */
    public boolean isRecoverable() {
        return this == ABANDONED || this == SAVED;
    }
} 