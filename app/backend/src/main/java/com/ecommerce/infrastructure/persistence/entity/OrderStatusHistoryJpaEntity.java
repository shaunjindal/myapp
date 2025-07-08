package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.order.OrderStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * JPA entity for OrderStatusHistory persistence
 * Tracks all status changes for an order
 */
@Entity
@Table(
    name = "order_status_history",
    indexes = {
        @Index(name = "idx_order_status_history_order_id", columnList = "order_id"),
        @Index(name = "idx_order_status_history_status", columnList = "status"),
        @Index(name = "idx_order_status_history_timestamp", columnList = "timestamp")
    }
)
public class OrderStatusHistoryJpaEntity extends BaseJpaEntity {

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_status_history_order"))
    private OrderJpaEntity order;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 20)
    private OrderStatus previousStatus;

    @NotNull(message = "Timestamp is required")
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(name = "system_generated", nullable = false)
    private boolean systemGenerated = false;

    @Column(name = "notification_sent", nullable = false)
    private boolean notificationSent = false;

    @Column(name = "customer_visible", nullable = false)
    private boolean customerVisible = true;

    // Constructors
    public OrderStatusHistoryJpaEntity() {
        super();
    }

    public OrderStatusHistoryJpaEntity(OrderJpaEntity order, OrderStatus status, OrderStatus previousStatus, String notes) {
        this();
        this.order = order;
        this.status = status;
        this.previousStatus = previousStatus;
        this.notes = notes;
    }

    public OrderStatusHistoryJpaEntity(OrderJpaEntity order, OrderStatus status, OrderStatus previousStatus, 
                                      String notes, String changedBy, boolean systemGenerated) {
        this(order, status, previousStatus, notes);
        this.changedBy = changedBy;
        this.systemGenerated = systemGenerated;
    }

    // Helper methods
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

    public String getStatusDisplayName() {
        return status.getDisplayName();
    }

    public String getPreviousStatusDisplayName() {
        return previousStatus != null ? previousStatus.getDisplayName() : null;
    }

    // Getters and Setters
    public OrderJpaEntity getOrder() {
        return order;
    }

    public void setOrder(OrderJpaEntity order) {
        this.order = order;
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
} 