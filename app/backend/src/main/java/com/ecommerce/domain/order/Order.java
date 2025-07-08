package com.ecommerce.domain.order;

import com.ecommerce.domain.common.AuditableEntity;
import com.ecommerce.domain.common.Address;
import com.ecommerce.domain.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Order domain entity representing a customer order
 * 
 * This entity follows DDD principles:
 * - Rich domain model with complex business logic
 * - Encapsulation of order-related data and behavior
 * - State management for order lifecycle
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class Order extends AuditableEntity {
    
    @NotBlank(message = "Order number is required")
    @Pattern(regexp = "^ORD-[0-9]{10}$", message = "Order number must follow pattern ORD-XXXXXXXXXX")
    private String orderNumber;
    
    @NotNull(message = "Customer is required")
    private User customer;
    
    private List<OrderItem> items;
    
    private OrderStatus status;
    
    private BigDecimal subtotal;
    
    private BigDecimal discountAmount;
    
    private BigDecimal taxAmount;
    
    private BigDecimal shippingAmount;
    
    private BigDecimal totalAmount;
    
    private String discountCode;
    
    @NotNull(message = "Billing address is required")
    private Address billingAddress;
    
    @NotNull(message = "Shipping address is required")
    private Address shippingAddress;
    
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
    
    private List<OrderStatusHistory> statusHistory;
    
    // Default constructor
    public Order() {
        super();
        this.items = new ArrayList<>();
        this.statusHistory = new ArrayList<>();
        this.status = OrderStatus.ORDER_RAISED;
        this.orderDate = LocalDateTime.now();
        this.discountAmount = BigDecimal.ZERO;
        this.taxAmount = BigDecimal.ZERO;
        this.shippingAmount = BigDecimal.ZERO;
        this.totalWeight = BigDecimal.ZERO;
        this.orderNumber = generateOrderNumber();
    }
    
    // Constructor with essential fields
    public Order(User customer, Address billingAddress, Address shippingAddress, PaymentMethod paymentMethod) {
        this();
        this.customer = customer;
        this.billingAddress = billingAddress;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
    }
    
    // Business methods
    public void addItem(OrderItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Order item cannot be null");
        }
        if (this.status != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Cannot add items to order with status: " + this.status);
        }
        
        this.items.add(item);
        recalculateTotals();
    }
    
    public void removeItem(OrderItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Order item cannot be null");
        }
        if (this.status != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Cannot remove items from order with status: " + this.status);
        }
        
        this.items.remove(item);
        recalculateTotals();
    }
    
    public void confirm() {
        if (this.status != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Can only confirm orders that are raised");
        }
        if (this.items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm order with no items");
        }
        
        changeStatus(OrderStatus.PAYMENT_DONE, "Order confirmed and payment processed");
    }
    
    public void processPayment(String transactionId) {
        if (this.status != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Can only process payment for raised orders");
        }
        if (transactionId == null || transactionId.trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction ID is required");
        }
        
        this.paymentTransactionId = transactionId;
        changeStatus(OrderStatus.PAYMENT_DONE, "Payment processed successfully");
    }
    
    public void ship(String trackingNumber, String carrier) {
        if (this.status != OrderStatus.PAYMENT_DONE) {
            throw new IllegalStateException("Can only ship orders with completed payment");
        }
        if (trackingNumber == null || trackingNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Tracking number is required");
        }
        
        this.trackingNumber = trackingNumber;
        this.shippingCarrier = carrier;
        this.shippedDate = LocalDateTime.now();
        changeStatus(OrderStatus.DELIVERED, "Order shipped and delivered with tracking: " + trackingNumber);
    }
    
    public void deliver() {
        if (this.status != OrderStatus.PAYMENT_DONE) {
            throw new IllegalStateException("Can only deliver orders with completed payment");
        }
        
        this.deliveredDate = LocalDateTime.now();
        changeStatus(OrderStatus.DELIVERED, "Order delivered successfully");
    }
    
    public void cancel(String reason) {
        if (this.status == OrderStatus.DELIVERED || this.status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel order with status: " + this.status);
        }
        
        this.cancellationReason = reason;
        this.cancelledDate = LocalDateTime.now();
        changeStatus(OrderStatus.CANCELLED, "Order cancelled: " + reason);
    }
    
    public void refund(String reason) {
        if (this.status != OrderStatus.DELIVERED && this.status != OrderStatus.PAYMENT_DONE) {
            throw new IllegalStateException("Can only refund delivered orders or orders with completed payment");
        }
        
        changeStatus(OrderStatus.CANCELLED, "Order refunded: " + reason);
    }
    
    public boolean canBeCancelled() {
        return this.status == OrderStatus.ORDER_RAISED || 
               this.status == OrderStatus.PAYMENT_DONE;
    }
    
    public boolean canBeRefunded() {
        return this.status == OrderStatus.DELIVERED || this.status == OrderStatus.PAYMENT_DONE;
    }
    
    public boolean isShippable() {
        return this.status == OrderStatus.PAYMENT_DONE;
    }
    
    public boolean isDeliverable() {
        return this.status == OrderStatus.PAYMENT_DONE;
    }
    
    public int getTotalItemCount() {
        return this.items.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }
    
    public int getUniqueItemCount() {
        return this.items.size();
    }
    
    public BigDecimal getGrandTotal() {
        return subtotal.add(taxAmount).add(shippingAmount).subtract(discountAmount);
    }
    
    public void applyDiscount(String discountCode, BigDecimal discountAmount) {
        if (this.status != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Cannot apply discount to order with status: " + this.status);
        }
        if (discountAmount == null || discountAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Discount amount must be non-negative");
        }
        
        this.discountCode = discountCode;
        this.discountAmount = discountAmount;
        recalculateTotals();
    }
    
    public void setShippingAmount(BigDecimal shippingAmount) {
        if (this.status != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Cannot update shipping amount for order with status: " + this.status);
        }
        
        this.shippingAmount = shippingAmount != null ? shippingAmount : BigDecimal.ZERO;
        recalculateTotals();
    }
    
    public void setTaxAmount(BigDecimal taxAmount) {
        if (this.status != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Cannot update tax amount for order with status: " + this.status);
        }
        
        this.taxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        recalculateTotals();
    }
    
    public boolean requiresShipping() {
        return !billingAddress.equals(shippingAddress) || 
               items.stream().anyMatch(item -> item.getProduct().getWeight() != null);
    }
    
    public boolean hasBeenShipped() {
        return this.shippedDate != null;
    }
    
    public boolean hasBeenDelivered() {
        return this.deliveredDate != null;
    }
    
    public boolean isCancelled() {
        return this.status == OrderStatus.CANCELLED;
    }
    
    public boolean isRefunded() {
        return this.status == OrderStatus.CANCELLED;
    }
    
    public boolean isCompleted() {
        return this.status == OrderStatus.DELIVERED;
    }
    
    public List<OrderStatusHistory> getStatusHistory() {
        return new ArrayList<>(statusHistory);
    }
    
    public Optional<OrderStatusHistory> getLastStatusChange() {
        return statusHistory.stream()
                .max(Comparator.comparing(OrderStatusHistory::getChangedAt));
    }
    
    private void changeStatus(OrderStatus newStatus, String notes) {
        OrderStatus oldStatus = this.status;
        this.status = newStatus;
        
        OrderStatusHistory historyEntry = new OrderStatusHistory(
            oldStatus, 
            newStatus, 
            LocalDateTime.now(), 
            notes
        );
        this.statusHistory.add(historyEntry);
    }
    
    private void recalculateTotals() {
        this.subtotal = this.items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.totalWeight = this.items.stream()
                .map(OrderItem::getTotalWeight)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.totalAmount = getGrandTotal();
    }
    
    private String generateOrderNumber() {
        return "ORD-" + String.format("%010d", System.currentTimeMillis() % 10000000000L);
    }
    
    // Getters and Setters
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public User getCustomer() {
        return customer;
    }
    
    public void setCustomer(User customer) {
        this.customer = customer;
    }
    
    public List<OrderItem> getItems() {
        return new ArrayList<>(items);
    }
    
    public void setItems(List<OrderItem> items) {
        this.items = items != null ? new ArrayList<>(items) : new ArrayList<>();
        recalculateTotals();
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
    
    public BigDecimal getShippingAmount() {
        return shippingAmount;
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
    
    public Address getBillingAddress() {
        return billingAddress;
    }
    
    public void setBillingAddress(Address billingAddress) {
        this.billingAddress = billingAddress;
    }
    
    public Address getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(Address shippingAddress) {
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
    
    public void setStatusHistory(List<OrderStatusHistory> statusHistory) {
        this.statusHistory = statusHistory != null ? new ArrayList<>(statusHistory) : new ArrayList<>();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Order order = (Order) o;
        return Objects.equals(getId(), order.getId()) &&
               Objects.equals(orderNumber, order.orderNumber);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(getId(), orderNumber);
    }
    
    @Override
    public String toString() {
        return "Order{" +
                "id=" + getId() +
                ", orderNumber='" + orderNumber + '\'' +
                ", customer=" + customer.getEmail() +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                ", orderDate=" + orderDate +
                ", itemCount=" + getTotalItemCount() +
                '}';
    }
} 