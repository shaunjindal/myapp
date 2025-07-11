package com.ecommerce.application.dto;

import java.math.BigDecimal;

/**
 * DTO for refund operation response
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class RefundResponse {
    
    private boolean success;
    private String message;
    private String refundId;
    private BigDecimal refundAmount;
    private String status;
    
    // Private constructor to enforce using factory methods
    private RefundResponse(boolean success, String message, String refundId, BigDecimal refundAmount, String status) {
        this.success = success;
        this.message = message;
        this.refundId = refundId;
        this.refundAmount = refundAmount;
        this.status = status;
    }
    
    // Factory method for successful refund
    public static RefundResponse success(String refundId, BigDecimal refundAmount, String status) {
        return new RefundResponse(true, "Refund processed successfully", refundId, refundAmount, status);
    }
    
    // Factory method for failed refund
    public static RefundResponse failure(String message) {
        return new RefundResponse(false, message, null, null, null);
    }
    
    // Factory method for error response
    public static RefundResponse error(String message) {
        return new RefundResponse(false, message, null, null, null);
    }
    
    // Getters
    public boolean isSuccess() {
        return success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public String getRefundId() {
        return refundId;
    }
    
    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
    
    public String getStatus() {
        return status;
    }
    
    // Setters
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public void setRefundId(String refundId) {
        this.refundId = refundId;
    }
    
    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "RefundResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", refundId='" + refundId + '\'' +
                ", refundAmount=" + refundAmount +
                ", status='" + status + '\'' +
                '}';
    }
} 