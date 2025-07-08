package com.ecommerce.domain.common;

/**
 * Enumeration representing different types of addresses
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum AddressType {
    /**
     * Billing address - used for payment and invoicing
     */
    BILLING("Billing Address"),
    
    /**
     * Shipping address - used for product delivery
     */
    SHIPPING("Shipping Address"),
    
    /**
     * Both billing and shipping address
     */
    BOTH("Billing & Shipping Address");
    
    private final String displayName;
    
    AddressType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 