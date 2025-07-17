package com.ecommerce.application.dto;

import com.ecommerce.domain.order.OrderStatus;

import java.time.LocalDateTime;

/**
 * DTO for order tracking step information
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class OrderTrackingStepDto {
    
    private String stepKey;
    private String stepLabel;
    private String stepDescription;
    private String stepIcon;
    private OrderStatus requiredStatus;
    private boolean isCompleted;
    private boolean isActive;
    private boolean isPending;
    private boolean isCancelled;
    private LocalDateTime completedAt;
    private String completionNotes;
    private int stepOrder;
    
    // Default constructor
    public OrderTrackingStepDto() {}
    
    // Constructor with basic info
    public OrderTrackingStepDto(String stepKey, String stepLabel, String stepDescription, 
                               String stepIcon, OrderStatus requiredStatus, int stepOrder) {
        this.stepKey = stepKey;
        this.stepLabel = stepLabel;
        this.stepDescription = stepDescription;
        this.stepIcon = stepIcon;
        this.requiredStatus = requiredStatus;
        this.stepOrder = stepOrder;
    }
    
    // Getters and Setters
    public String getStepKey() {
        return stepKey;
    }
    
    public void setStepKey(String stepKey) {
        this.stepKey = stepKey;
    }
    
    public String getStepLabel() {
        return stepLabel;
    }
    
    public void setStepLabel(String stepLabel) {
        this.stepLabel = stepLabel;
    }
    
    public String getStepDescription() {
        return stepDescription;
    }
    
    public void setStepDescription(String stepDescription) {
        this.stepDescription = stepDescription;
    }
    
    public String getStepIcon() {
        return stepIcon;
    }
    
    public void setStepIcon(String stepIcon) {
        this.stepIcon = stepIcon;
    }
    
    public OrderStatus getRequiredStatus() {
        return requiredStatus;
    }
    
    public void setRequiredStatus(OrderStatus requiredStatus) {
        this.requiredStatus = requiredStatus;
    }
    
    public boolean isCompleted() {
        return isCompleted;
    }
    
    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public boolean isPending() {
        return isPending;
    }
    
    public void setPending(boolean pending) {
        isPending = pending;
    }
    
    public boolean isCancelled() {
        return isCancelled;
    }
    
    public void setCancelled(boolean cancelled) {
        isCancelled = cancelled;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public String getCompletionNotes() {
        return completionNotes;
    }
    
    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }
    
    public int getStepOrder() {
        return stepOrder;
    }
    
    public void setStepOrder(int stepOrder) {
        this.stepOrder = stepOrder;
    }
} 