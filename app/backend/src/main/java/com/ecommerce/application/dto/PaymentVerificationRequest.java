package com.ecommerce.application.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for payment verification request
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class PaymentVerificationRequest {
    
    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;
    
    @NotBlank(message = "Razorpay order ID is required")
    private String razorpayOrderId;
    
    @NotBlank(message = "Razorpay signature is required")
    private String razorpaySignature;
    
    // Default constructor
    public PaymentVerificationRequest() {}
    
    // Constructor with all fields
    public PaymentVerificationRequest(String razorpayPaymentId, String razorpayOrderId, String razorpaySignature) {
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpaySignature = razorpaySignature;
    }
    
    // Getters and setters
    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }
    
    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }
    
    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }
    
    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }
    
    public String getRazorpaySignature() {
        return razorpaySignature;
    }
    
    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }
    
    @Override
    public String toString() {
        return "PaymentVerificationRequest{" +
                "razorpayPaymentId='" + razorpayPaymentId + '\'' +
                ", razorpayOrderId='" + razorpayOrderId + '\'' +
                ", razorpaySignature='***REDACTED***'" +
                '}';
    }
} 