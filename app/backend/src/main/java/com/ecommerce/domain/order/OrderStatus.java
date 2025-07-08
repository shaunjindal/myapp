package com.ecommerce.domain.order;

/**
 * Enumeration representing the status of an order
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum OrderStatus {
    /**
     * Order has been created/raised
     */
    ORDER_RAISED("Order Raised"),
    
    /**
     * Payment has been completed successfully
     */
    PAYMENT_DONE("Payment Done"),
    
    /**
     * Order has been delivered to the customer
     */
    DELIVERED("Delivered"),
    
    /**
     * Order has been cancelled
     */
    CANCELLED("Cancelled");
    
    private final String displayName;
    
    OrderStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Check if the order can be cancelled
     * @return true if the order can be cancelled, false otherwise
     */
    public boolean isCancellable() {
        return this == ORDER_RAISED || this == PAYMENT_DONE;
    }
    
    /**
     * Check if the order is in a final state
     * @return true if the order is in a final state, false otherwise
     */
    public boolean isFinal() {
        return this == DELIVERED || this == CANCELLED;
    }
    
    /**
     * Check if the order is active (not final)
     * @return true if the order is active, false otherwise
     */
    public boolean isActive() {
        return !isFinal();
    }
    
    /**
     * Check if the order requires customer action
     * @return true if customer action is required, false otherwise
     */
    public boolean requiresCustomerAction() {
        return this == ORDER_RAISED;
    }
    
    /**
     * Check if the order is ready for delivery
     * @return true if the order is ready for delivery, false otherwise
     */
    public boolean isReadyForDelivery() {
        return this == PAYMENT_DONE;
    }
    
    /**
     * Check if the order can be refunded
     * @return true if the order can be refunded, false otherwise
     */
    public boolean isRefundable() {
        return this == PAYMENT_DONE || this == DELIVERED;
    }
    
    /**
     * Check if the order can be shipped
     * @return true if the order can be shipped, false otherwise
     */
    public boolean isShippable() {
        return this == PAYMENT_DONE;
    }
    
    /**
     * Check if the order requires seller action
     * @return true if seller action is required, false otherwise
     */
    public boolean requiresSellerAction() {
        return this == PAYMENT_DONE; // Seller needs to deliver the order
    }
    
    /**
     * Get the next status in the order flow
     * @return the next status, or null if this is a final status
     */
    public OrderStatus getNextStatus() {
        switch (this) {
            case ORDER_RAISED:
                return PAYMENT_DONE;
            case PAYMENT_DONE:
                return DELIVERED;
            case DELIVERED:
            case CANCELLED:
            default:
                return null;
        }
    }
} 