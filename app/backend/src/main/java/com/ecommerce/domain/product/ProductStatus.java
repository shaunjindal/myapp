package com.ecommerce.domain.product;

/**
 * Enumeration representing the status of a product in the catalog
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum ProductStatus {
    /**
     * Product is in draft state - not visible to customers
     */
    DRAFT("Draft"),
    
    /**
     * Product is active and available for purchase
     */
    ACTIVE("Active"),
    
    /**
     * Product is inactive - not available for purchase but still visible
     */
    INACTIVE("Inactive"),
    
    /**
     * Product is out of stock - visible but cannot be purchased
     */
    OUT_OF_STOCK("Out of Stock"),
    
    /**
     * Product is discontinued - no longer available
     */
    DISCONTINUED("Discontinued"),
    
    /**
     * Product is under review - pending approval
     */
    UNDER_REVIEW("Under Review");
    
    private final String displayName;
    
    ProductStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Check if products with this status are visible to customers
     * @return true if visible, false otherwise
     */
    public boolean isVisible() {
        return this == ACTIVE || this == INACTIVE || this == OUT_OF_STOCK;
    }
    
    /**
     * Check if products with this status can be purchased
     * @return true if purchasable, false otherwise
     */
    public boolean isPurchasable() {
        return this == ACTIVE;
    }
    
    /**
     * Check if products with this status are available for inventory management
     * @return true if available for inventory operations, false otherwise
     */
    public boolean isInventoryManageable() {
        return this == ACTIVE || this == INACTIVE || this == OUT_OF_STOCK;
    }
} 