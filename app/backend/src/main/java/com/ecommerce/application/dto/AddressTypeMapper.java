package com.ecommerce.application.dto;

import com.ecommerce.domain.common.AddressType;

/**
 * Mapper utility class for converting between frontend and backend address types.
 * Handles mapping between frontend types (home, work, other) and backend types (BILLING, SHIPPING, BOTH).
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class AddressTypeMapper {
    
    /**
     * Map frontend address type string to backend AddressType enum
     * @param frontendType The frontend type (home, work, other)
     * @return The corresponding backend AddressType
     */
    public static AddressType fromFrontendType(String frontendType) {
        if (frontendType == null || frontendType.trim().isEmpty()) {
            return AddressType.SHIPPING; // Default
        }
        
        switch (frontendType.toLowerCase()) {
            case "home":
                return AddressType.SHIPPING;
            case "work":
                return AddressType.BILLING;
            case "other":
                return AddressType.BOTH;
            case "billing":
                return AddressType.BILLING;
            case "shipping":
                return AddressType.SHIPPING;
            case "both":
                return AddressType.BOTH;
            default:
                return AddressType.SHIPPING; // Default fallback
        }
    }
    
    /**
     * Map backend AddressType enum to frontend address type string
     * @param backendType The backend AddressType
     * @return The corresponding frontend type string
     */
    public static String toFrontendType(AddressType backendType) {
        if (backendType == null) {
            return "home"; // Default
        }
        
        switch (backendType) {
            case SHIPPING:
                return "home";
            case BILLING:
                return "work";
            case BOTH:
                return "other";
            default:
                return "home"; // Default fallback
        }
    }
    
    /**
     * Get display name for frontend type
     * @param frontendType The frontend type
     * @return User-friendly display name
     */
    public static String getFrontendDisplayName(String frontendType) {
        if (frontendType == null || frontendType.trim().isEmpty()) {
            return "Home";
        }
        
        switch (frontendType.toLowerCase()) {
            case "home":
                return "Home";
            case "work":
                return "Work";
            case "other":
                return "Other";
            default:
                return "Home";
        }
    }
    
    /**
     * Get display name for backend type
     * @param backendType The backend AddressType
     * @return User-friendly display name
     */
    public static String getBackendDisplayName(AddressType backendType) {
        if (backendType == null) {
            return "Shipping";
        }
        
        return backendType.getDisplayName();
    }
    
    /**
     * Check if frontend type is valid
     * @param frontendType The frontend type to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValidFrontendType(String frontendType) {
        if (frontendType == null || frontendType.trim().isEmpty()) {
            return false;
        }
        
        String lowerType = frontendType.toLowerCase();
        return lowerType.equals("home") || lowerType.equals("work") || lowerType.equals("other") ||
               lowerType.equals("billing") || lowerType.equals("shipping") || lowerType.equals("both");
    }
    
    /**
     * Get all valid frontend types
     * @return Array of valid frontend type strings
     */
    public static String[] getValidFrontendTypes() {
        return new String[]{"home", "work", "other"};
    }
    
    /**
     * Get all valid backend types
     * @return Array of valid backend AddressType enums
     */
    public static AddressType[] getValidBackendTypes() {
        return AddressType.values();
    }
} 