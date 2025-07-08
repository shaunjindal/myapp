package com.ecommerce.application.dto.auth;

import com.ecommerce.domain.user.UserRole;
import com.ecommerce.domain.user.UserStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Data Transfer Object for authentication responses.
 * Contains JWT token and user information returned after successful authentication.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class AuthenticationResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private String refreshToken;
    private UserInfo user;
    
    // Default constructor
    public AuthenticationResponse() {
    }
    
    // Constructor for successful authentication
    public AuthenticationResponse(String token, Long expiresIn, UserInfo user) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = user;
    }
    
    // Constructor with refresh token
    public AuthenticationResponse(String token, Long expiresIn, String refreshToken, UserInfo user) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.refreshToken = refreshToken;
        this.user = user;
    }
    
    // Nested class for user information
    public static class UserInfo {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private UserStatus status;
        private Set<UserRole> roles;
        private Boolean emailVerified;
        private String profileImageUrl;
        private String preferredLanguage;
        private String timezone;
        private Boolean marketingEmailsEnabled;
        private Boolean twoFactorEnabled;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastLoginAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        // Default constructor
        public UserInfo() {
        }
        
        // Constructor with essential fields
        public UserInfo(String id, String firstName, String lastName, String email, UserStatus status, Set<UserRole> roles) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.status = status;
            this.roles = roles;
        }
        
        // Business methods
        public String getFullName() {
            return firstName + " " + lastName;
        }
        
        public boolean isActive() {
            return UserStatus.ACTIVE.equals(this.status);
        }
        
        public boolean hasRole(UserRole role) {
            return this.roles != null && this.roles.contains(role);
        }
        
        // Getters and Setters
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getFirstName() {
            return firstName;
        }
        
        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }
        
        public String getLastName() {
            return lastName;
        }
        
        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getPhoneNumber() {
            return phoneNumber;
        }
        
        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
        
        public UserStatus getStatus() {
            return status;
        }
        
        public void setStatus(UserStatus status) {
            this.status = status;
        }
        
        public Set<UserRole> getRoles() {
            return roles;
        }
        
        public void setRoles(Set<UserRole> roles) {
            this.roles = roles;
        }
        
        public Boolean getEmailVerified() {
            return emailVerified;
        }
        
        public void setEmailVerified(Boolean emailVerified) {
            this.emailVerified = emailVerified;
        }
        
        public String getProfileImageUrl() {
            return profileImageUrl;
        }
        
        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
        
        public String getPreferredLanguage() {
            return preferredLanguage;
        }
        
        public void setPreferredLanguage(String preferredLanguage) {
            this.preferredLanguage = preferredLanguage;
        }
        
        public String getTimezone() {
            return timezone;
        }
        
        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }
        
        public Boolean getMarketingEmailsEnabled() {
            return marketingEmailsEnabled;
        }
        
        public void setMarketingEmailsEnabled(Boolean marketingEmailsEnabled) {
            this.marketingEmailsEnabled = marketingEmailsEnabled;
        }
        
        public Boolean getTwoFactorEnabled() {
            return twoFactorEnabled;
        }
        
        public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
            this.twoFactorEnabled = twoFactorEnabled;
        }
        
        public LocalDateTime getLastLoginAt() {
            return lastLoginAt;
        }
        
        public void setLastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
        }
        
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
    public Long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    @Override
    public String toString() {
        return "AuthenticationResponse{" +
                "tokenType='" + tokenType + '\'' +
                ", expiresIn=" + expiresIn +
                ", user=" + (user != null ? user.getEmail() : null) +
                '}';
    }
} 