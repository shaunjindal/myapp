package com.ecommerce.domain.order;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * OrderStatusHistory value object representing a status change in an order
 * 
 * This value object tracks:
 * - Previous and new status
 * - Timestamp of the change
 * - Optional notes about the change
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class OrderStatusHistory {
    
    private OrderStatus fromStatus;
    
    @NotNull(message = "To status is required")
    private OrderStatus toStatus;
    
    @NotNull(message = "Changed at timestamp is required")
    private LocalDateTime changedAt;
    
    private String notes;
    
    private String changedBy; // User ID or system identifier
    
    // Default constructor
    public OrderStatusHistory() {
        this.changedAt = LocalDateTime.now();
    }
    
    // Constructor for status change
    public OrderStatusHistory(OrderStatus fromStatus, OrderStatus toStatus, LocalDateTime changedAt, String notes) {
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedAt = changedAt != null ? changedAt : LocalDateTime.now();
        this.notes = notes;
    }
    
    // Constructor with user information
    public OrderStatusHistory(OrderStatus fromStatus, OrderStatus toStatus, LocalDateTime changedAt, String notes, String changedBy) {
        this(fromStatus, toStatus, changedAt, notes);
        this.changedBy = changedBy;
    }
    
    // Business methods
    public boolean isInitialStatus() {
        return fromStatus == null;
    }
    
    public boolean isStatusProgression() {
        if (fromStatus == null) {
            return true; // Initial status is always considered progression
        }
        
        // Define the simplified order status progression
        return switch (fromStatus) {
            case ORDER_RAISED -> toStatus == OrderStatus.PAYMENT_DONE || toStatus == OrderStatus.CANCELLED;
            case PAYMENT_DONE -> toStatus == OrderStatus.DELIVERED || toStatus == OrderStatus.CANCELLED;
            case DELIVERED -> false; // Final state
            default -> false; // Final states (CANCELLED) typically don't progress further
        };
    }
    
    public boolean isStatusRegression() {
        return !isStatusProgression() && !isInitialStatus();
    }
    
    public boolean isCancellation() {
        return toStatus == OrderStatus.CANCELLED;
    }
    
    public boolean isCompletion() {
        return toStatus == OrderStatus.DELIVERED;
    }
    
    public boolean isPaymentCompletion() {
        return toStatus == OrderStatus.PAYMENT_DONE;
    }
    
    public boolean isPositiveChange() {
        return isStatusProgression() && !isCancellation();
    }
    
    public String getChangeDescription() {
        if (isInitialStatus()) {
            return "Order created with status: " + toStatus.getDisplayName();
        }
        
        return String.format("Status changed from %s to %s", 
                fromStatus.getDisplayName(), 
                toStatus.getDisplayName());
    }
    
    public String getFormattedTimestamp() {
        return changedAt.toString(); // Can be customized with DateTimeFormatter
    }
    
    public boolean hasNotes() {
        return notes != null && !notes.trim().isEmpty();
    }
    
    public boolean isSystemChange() {
        return changedBy == null || changedBy.equals("SYSTEM") || changedBy.equals("AUTO");
    }
    
    public boolean isUserChange() {
        return !isSystemChange();
    }
    
    // Getters and Setters
    public OrderStatus getFromStatus() {
        return fromStatus;
    }
    
    public void setFromStatus(OrderStatus fromStatus) {
        this.fromStatus = fromStatus;
    }
    
    public OrderStatus getToStatus() {
        return toStatus;
    }
    
    public void setToStatus(OrderStatus toStatus) {
        this.toStatus = toStatus;
    }
    
    public LocalDateTime getChangedAt() {
        return changedAt;
    }
    
    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getChangedBy() {
        return changedBy;
    }
    
    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderStatusHistory that = (OrderStatusHistory) o;
        return Objects.equals(fromStatus, that.fromStatus) &&
               Objects.equals(toStatus, that.toStatus) &&
               Objects.equals(changedAt, that.changedAt);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(fromStatus, toStatus, changedAt);
    }
    
    @Override
    public String toString() {
        return "OrderStatusHistory{" +
                "fromStatus=" + fromStatus +
                ", toStatus=" + toStatus +
                ", changedAt=" + changedAt +
                ", notes='" + notes + '\'' +
                ", changedBy='" + changedBy + '\'' +
                '}';
    }
} 