package com.ecommerce.domain.payment;

import com.ecommerce.domain.common.AuditableEntity;
import com.ecommerce.domain.order.Order;
import com.ecommerce.domain.order.PaymentMethod;
import com.ecommerce.domain.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment domain entity representing a payment transaction
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class Payment extends AuditableEntity {
    
    @NotBlank(message = "Payment ID is required")
    private String paymentId;
    
    @NotBlank(message = "Razorpay order ID is required")
    private String razorpayOrderId;
    
    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;
    
    private String razorpaySignature;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotNull(message = "Currency is required")
    private String currency;
    
    @NotNull(message = "Status is required")
    private PaymentStatus status;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    @NotNull(message = "User is required")
    private User user;
    
    @NotNull(message = "Order is required")
    private Order order;
    
    private String receipt;
    private String description;
    private String errorCode;
    private String errorDescription;
    private LocalDateTime paidAt;
    private LocalDateTime failedAt;
    private LocalDateTime refundedAt;
    private BigDecimal refundAmount;
    private String refundId;
    
    // Default constructor
    public Payment() {
        super();
        this.status = PaymentStatus.CREATED;
        this.currency = "INR";
    }
    
    // Constructor with essential fields
    public Payment(String razorpayOrderId, BigDecimal amount, String currency, User user, Order order) {
        this();
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.user = user;
        this.order = order;
        this.paymentId = generatePaymentId();
    }
    
    // Business methods
    public void markAsPaid(String razorpayPaymentId, String razorpaySignature) {
        if (this.status != PaymentStatus.CREATED) {
            throw new IllegalStateException("Can only mark created payments as paid");
        }
        
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.status = PaymentStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }
    
    public void markAsFailed(String errorCode, String errorDescription) {
        if (this.status == PaymentStatus.PAID) {
            throw new IllegalStateException("Cannot mark paid payments as failed");
        }
        
        this.status = PaymentStatus.FAILED;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.failedAt = LocalDateTime.now();
    }
    
    public void markAsRefunded(BigDecimal refundAmount, String refundId) {
        if (this.status != PaymentStatus.PAID) {
            throw new IllegalStateException("Can only refund paid payments");
        }
        
        this.status = PaymentStatus.REFUNDED;
        this.refundAmount = refundAmount;
        this.refundId = refundId;
        this.refundedAt = LocalDateTime.now();
    }
    
    public boolean isPaid() {
        return this.status == PaymentStatus.PAID;
    }
    
    public boolean isFailed() {
        return this.status == PaymentStatus.FAILED;
    }
    
    public boolean isRefunded() {
        return this.status == PaymentStatus.REFUNDED;
    }
    
    public boolean canBeRefunded() {
        return this.status == PaymentStatus.PAID && this.refundAmount == null;
    }
    
    private String generatePaymentId() {
        return "PAY-" + System.currentTimeMillis();
    }
    
    // Getters and setters
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }
    
    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }
    
    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }
    
    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }
    
    public String getRazorpaySignature() {
        return razorpaySignature;
    }
    
    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public PaymentStatus getStatus() {
        return status;
    }
    
    public void setStatus(PaymentStatus status) {
        this.status = status;
    }
    
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public String getReceipt() {
        return receipt;
    }
    
    public void setReceipt(String receipt) {
        this.receipt = receipt;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    public String getErrorDescription() {
        return errorDescription;
    }
    
    public void setErrorDescription(String errorDescription) {
        this.errorDescription = errorDescription;
    }
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public LocalDateTime getFailedAt() {
        return failedAt;
    }
    
    public void setFailedAt(LocalDateTime failedAt) {
        this.failedAt = failedAt;
    }
    
    public LocalDateTime getRefundedAt() {
        return refundedAt;
    }
    
    public void setRefundedAt(LocalDateTime refundedAt) {
        this.refundedAt = refundedAt;
    }
    
    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
    
    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
    
    public String getRefundId() {
        return refundId;
    }
    
    public void setRefundId(String refundId) {
        this.refundId = refundId;
    }
    
    @Override
    public String toString() {
        return "Payment{" +
                "paymentId='" + paymentId + '\'' +
                ", razorpayOrderId='" + razorpayOrderId + '\'' +
                ", razorpayPaymentId='" + razorpayPaymentId + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", status=" + status +
                ", paymentMethod=" + paymentMethod +
                ", receipt='" + receipt + '\'' +
                ", paidAt=" + paidAt +
                '}';
    }
} 