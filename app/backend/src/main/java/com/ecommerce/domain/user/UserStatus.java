package com.ecommerce.domain.user;

/**
 * Enumeration representing the status of a user account
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum UserStatus {
    /**
     * User account is active and can perform all operations
     */
    ACTIVE("Active"),
    
    /**
     * User account is inactive (user deactivated their account)
     */
    INACTIVE("Inactive"),
    
    /**
     * User account is suspended (administratively disabled)
     */
    SUSPENDED("Suspended"),
    
    /**
     * User account is pending verification (email verification, etc.)
     */
    PENDING_VERIFICATION("Pending Verification");
    
    private final String displayName;
    
    UserStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Check if the user can perform operations
     * @return true if user is active, false otherwise
     */
    public boolean isOperational() {
        return this == ACTIVE;
    }
} 