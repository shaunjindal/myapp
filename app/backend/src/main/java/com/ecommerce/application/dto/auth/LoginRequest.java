package com.ecommerce.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for user login requests.
 * Contains credentials and optional login preferences.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 1, max = 100, message = "Password must be between 1 and 100 characters")
    private String password;
    
    private Boolean rememberMe = false;
    
    private String twoFactorCode;
    
    // Default constructor
    public LoginRequest() {
    }
    
    // Constructor for testing
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    // Constructor with remember me option
    public LoginRequest(String email, String password, Boolean rememberMe) {
        this.email = email;
        this.password = password;
        this.rememberMe = rememberMe;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase().trim() : null;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public Boolean getRememberMe() {
        return rememberMe;
    }
    
    public void setRememberMe(Boolean rememberMe) {
        this.rememberMe = rememberMe != null ? rememberMe : false;
    }
    
    public String getTwoFactorCode() {
        return twoFactorCode;
    }
    
    public void setTwoFactorCode(String twoFactorCode) {
        this.twoFactorCode = twoFactorCode;
    }
    
    @Override
    public String toString() {
        return "LoginRequest{" +
                "email='" + email + '\'' +
                ", rememberMe=" + rememberMe +
                ", twoFactorCode='" + (twoFactorCode != null ? "***" : null) + '\'' +
                '}';
    }
} 