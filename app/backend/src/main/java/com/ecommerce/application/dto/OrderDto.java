package com.ecommerce.application.dto;

import com.ecommerce.domain.order.OrderStatus;
import com.ecommerce.domain.order.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for order response
 */
public class OrderDto {

    private String id;
    private String orderNumber;
    private String userId;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal totalAmount;
    private String discountCode;
    private AddressDto billingAddress;
    private AddressDto shippingAddress;
    private PaymentMethod paymentMethod;
    private String paymentTransactionId;
    private LocalDateTime orderDate;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private LocalDateTime cancelledDate;
    private String cancellationReason;
    private String customerNotes;
    private String internalNotes;
    private String trackingNumber;
    private String shippingCarrier;
    private BigDecimal totalWeight;
    private List<OrderItemDto> items;
    private List<OrderStatusHistoryDto> statusHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public OrderDto() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getShippingAmount() {
        return shippingAmount;
    }

    public void setShippingAmount(BigDecimal shippingAmount) {
        this.shippingAmount = shippingAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getDiscountCode() {
        return discountCode;
    }

    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }

    public AddressDto getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(AddressDto billingAddress) {
        this.billingAddress = billingAddress;
    }

    public AddressDto getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(AddressDto shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentTransactionId() {
        return paymentTransactionId;
    }

    public void setPaymentTransactionId(String paymentTransactionId) {
        this.paymentTransactionId = paymentTransactionId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getShippedDate() {
        return shippedDate;
    }

    public void setShippedDate(LocalDateTime shippedDate) {
        this.shippedDate = shippedDate;
    }

    public LocalDateTime getDeliveredDate() {
        return deliveredDate;
    }

    public void setDeliveredDate(LocalDateTime deliveredDate) {
        this.deliveredDate = deliveredDate;
    }

    public LocalDateTime getCancelledDate() {
        return cancelledDate;
    }

    public void setCancelledDate(LocalDateTime cancelledDate) {
        this.cancelledDate = cancelledDate;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getCustomerNotes() {
        return customerNotes;
    }

    public void setCustomerNotes(String customerNotes) {
        this.customerNotes = customerNotes;
    }

    public String getInternalNotes() {
        return internalNotes;
    }

    public void setInternalNotes(String internalNotes) {
        this.internalNotes = internalNotes;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getShippingCarrier() {
        return shippingCarrier;
    }

    public void setShippingCarrier(String shippingCarrier) {
        this.shippingCarrier = shippingCarrier;
    }

    public BigDecimal getTotalWeight() {
        return totalWeight;
    }

    public void setTotalWeight(BigDecimal totalWeight) {
        this.totalWeight = totalWeight;
    }

    public List<OrderItemDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDto> items) {
        this.items = items;
    }

    public List<OrderStatusHistoryDto> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<OrderStatusHistoryDto> statusHistory) {
        this.statusHistory = statusHistory;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods for frontend
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : null;
    }

    public boolean canBeCancelled() {
        return status != null && status.isCancellable();
    }

    public boolean canBeRefunded() {
        return status != null && status.isRefundable();
    }

    public boolean isShippable() {
        return status != null && status.isShippable();
    }

    public boolean isFinal() {
        return status != null && status.isFinal();
    }

    public boolean isActive() {
        return status != null && status.isActive();
    }

    public boolean requiresCustomerAction() {
        return status != null && status.requiresCustomerAction();
    }

    public boolean requiresSellerAction() {
        return status != null && status.requiresSellerAction();
    }

    public String getFormattedTotalAmount() {
        return totalAmount != null ? String.format("$%.2f", totalAmount.doubleValue()) : null;
    }

    public String getFormattedSubtotal() {
        return subtotal != null ? String.format("$%.2f", subtotal.doubleValue()) : null;
    }

    public String getFormattedShippingAmount() {
        return shippingAmount != null ? String.format("$%.2f", shippingAmount.doubleValue()) : null;
    }

    public String getFormattedTaxAmount() {
        return taxAmount != null ? String.format("$%.2f", taxAmount.doubleValue()) : null;
    }

    public String getFormattedDiscountAmount() {
        return discountAmount != null ? String.format("$%.2f", discountAmount.doubleValue()) : null;
    }

    public int getTotalItemCount() {
        return items != null ? items.stream().mapToInt(OrderItemDto::getQuantity).sum() : 0;
    }

    public int getUniqueItemCount() {
        return items != null ? items.size() : 0;
    }
} 