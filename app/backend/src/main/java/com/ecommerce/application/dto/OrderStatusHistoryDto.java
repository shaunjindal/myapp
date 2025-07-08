package com.ecommerce.application.dto;

import com.ecommerce.domain.order.OrderStatus;

import java.time.LocalDateTime;

/**
 * DTO for order status history response
 */
public class OrderStatusHistoryDto {

    private String id;
    private OrderStatus status;
    private OrderStatus previousStatus;
    private LocalDateTime timestamp;
    private String notes;
    private String changedBy;
    private boolean systemGenerated;
    private boolean notificationSent;
    private boolean customerVisible;

    // Constructors
    public OrderStatusHistoryDto() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(OrderStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
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

    public boolean isSystemGenerated() {
        return systemGenerated;
    }

    public void setSystemGenerated(boolean systemGenerated) {
        this.systemGenerated = systemGenerated;
    }

    public boolean isNotificationSent() {
        return notificationSent;
    }

    public void setNotificationSent(boolean notificationSent) {
        this.notificationSent = notificationSent;
    }

    public boolean isCustomerVisible() {
        return customerVisible;
    }

    public void setCustomerVisible(boolean customerVisible) {
        this.customerVisible = customerVisible;
    }

    // Helper methods for frontend
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : null;
    }

    public String getPreviousStatusDisplayName() {
        return previousStatus != null ? previousStatus.getDisplayName() : null;
    }

    public boolean isStatusUpgrade() {
        if (previousStatus == null) return true;
        return getStatusOrder(status) > getStatusOrder(previousStatus);
    }

    public boolean isStatusDowngrade() {
        if (previousStatus == null) return false;
        return getStatusOrder(status) < getStatusOrder(previousStatus);
    }

    private int getStatusOrder(OrderStatus status) {
        switch (status) {
            case ORDER_RAISED: return 1;
            case PAYMENT_DONE: return 2;
            case DELIVERED: return 3;
            case CANCELLED: return -1;
            default: return 0;
        }
    }

    public String getChangeType() {
        if (isStatusUpgrade()) {
            return "upgrade";
        } else if (isStatusDowngrade()) {
            return "downgrade";
        } else {
            return "same";
        }
    }

    public String getFormattedTimestamp() {
        return timestamp != null ? timestamp.toString() : null;
    }

    public String getChangeDescription() {
        StringBuilder description = new StringBuilder();
        
        if (previousStatus != null) {
            description.append("Status changed from ")
                      .append(getPreviousStatusDisplayName())
                      .append(" to ")
                      .append(getStatusDisplayName());
        } else {
            description.append("Status set to ").append(getStatusDisplayName());
        }
        
        if (changedBy != null && !systemGenerated) {
            description.append(" by ").append(changedBy);
        } else if (systemGenerated) {
            description.append(" (automatic)");
        }
        
        return description.toString();
    }

    public String getIconClass() {
        switch (status) {
            case ORDER_RAISED:
                return "receipt-icon";
            case PAYMENT_DONE:
                return "dollar-icon";
            case DELIVERED:
                return "package-icon";
            case CANCELLED:
                return "x-icon";
            default:
                return "info-icon";
        }
    }

    public String getStatusColor() {
        switch (status) {
            case ORDER_RAISED:
                return "yellow";
            case PAYMENT_DONE:
                return "blue";
            case DELIVERED:
                return "green";
            case CANCELLED:
                return "red";
            default:
                return "gray";
        }
    }

    public boolean isPrimaryStatus() {
        return status == OrderStatus.ORDER_RAISED || 
               status == OrderStatus.PAYMENT_DONE || 
               status == OrderStatus.DELIVERED;
    }

    public boolean isNegativeStatus() {
        return status == OrderStatus.CANCELLED;
    }

    public boolean isPositiveStatus() {
        return status == OrderStatus.DELIVERED || 
               status == OrderStatus.PAYMENT_DONE;
    }
} 