package com.ecommerce.domain.user;

import java.util.Set;

/**
 * Enumeration representing the roles a user can have in the system
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum UserRole {
    /**
     * Regular customer role - can browse, purchase, manage their account
     */
    CUSTOMER("Customer", Set.of(
        "product:read",
        "cart:manage",
        "order:create",
        "order:read:own",
        "profile:manage:own"
    )),
    
    /**
     * Admin role - can manage products, orders, users
     */
    ADMIN("Administrator", Set.of(
        "product:read",
        "product:write",
        "product:delete",
        "cart:manage",
        "order:read:all",
        "order:manage",
        "user:read:all",
        "user:manage",
        "profile:manage:all"
    )),
    
    /**
     * Support role - can view orders and assist customers
     */
    SUPPORT("Support", Set.of(
        "product:read",
        "order:read:all",
        "user:read:all",
        "profile:read:all"
    )),
    
    /**
     * Manager role - can manage products and view reports
     */
    MANAGER("Manager", Set.of(
        "product:read",
        "product:write",
        "order:read:all",
        "user:read:all",
        "reports:read"
    ));
    
    private final String displayName;
    private final Set<String> permissions;
    
    UserRole(String displayName, Set<String> permissions) {
        this.displayName = displayName;
        this.permissions = permissions;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public Set<String> getPermissions() {
        return permissions;
    }
    
    /**
     * Check if this role has a specific permission
     * @param permission the permission to check
     * @return true if the role has the permission, false otherwise
     */
    public boolean hasPermission(String permission) {
        return permissions.contains(permission);
    }
    
    /**
     * Get the Spring Security authority name for this role
     * @return the authority name with ROLE_ prefix
     */
    public String getAuthority() {
        return "ROLE_" + this.name();
    }
} 