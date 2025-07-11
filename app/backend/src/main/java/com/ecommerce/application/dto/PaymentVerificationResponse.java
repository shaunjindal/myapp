package com.ecommerce.application.dto;

/**
 * DTO for payment verification response
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class PaymentVerificationResponse {
    
    private boolean verified;
    private String status;
    private String message;
    private String paymentId;
    private String orderId;
    
    // Default constructor
    public PaymentVerificationResponse() {}
    
    // Constructor with all fields
    public PaymentVerificationResponse(boolean verified, String status, String message, String paymentId, String orderId) {
        this.verified = verified;
        this.status = status;
        this.message = message;
        this.paymentId = paymentId;
        this.orderId = orderId;
    }
    
    // Static factory methods for common responses
    public static PaymentVerificationResponse success(String paymentId, String orderId) {
        return new PaymentVerificationResponse(true, "SUCCESS", "Payment verification successful", paymentId, orderId);
    }
    
    public static PaymentVerificationResponse failure(String message) {
        return new PaymentVerificationResponse(false, "FAILURE", message, null, null);
    }
    
    public static PaymentVerificationResponse error(String message) {
        return new PaymentVerificationResponse(false, "ERROR", message, null, null);
    }
    
    // Getters and setters
    public boolean isVerified() {
        return verified;
    }
    
    public void setVerified(boolean verified) {
        this.verified = verified;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    @Override
    public String toString() {
        return "PaymentVerificationResponse{" +
                "verified=" + verified +
                ", status='" + status + '\'' +
                ", message='" + message + '\'' +
                ", paymentId='" + paymentId + '\'' +
                ", orderId='" + orderId + '\'' +
                '}';
    }
} 