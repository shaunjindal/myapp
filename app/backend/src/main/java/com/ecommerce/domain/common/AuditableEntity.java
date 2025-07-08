package com.ecommerce.domain.common;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Base entity class providing auditing capabilities and common fields
 * 
 * This class follows best practices:
 * - UUID as primary key for better scalability
 * - Audit fields for tracking creation and modification
 * - Version field for optimistic locking (future database integration)
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public abstract class AuditableEntity {
    
    protected UUID id;
    protected LocalDateTime createdAt;
    protected LocalDateTime updatedAt;
    protected String createdBy;
    protected String updatedBy;
    protected Long version;
    
    /**
     * Default constructor that initializes the entity with a new UUID and current timestamp
     */
    public AuditableEntity() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.version = 0L;
    }
    
    /**
     * Called before entity is persisted for the first time
     */
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.version == null) {
            this.version = 0L;
        }
    }
    
    /**
     * Called before entity is updated
     */
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.version != null) {
            this.version++;
        }
    }
    
    /**
     * Check if this is a new entity (not yet persisted)
     * @return true if the entity is new, false otherwise
     */
    public boolean isNew() {
        return this.id == null || this.createdAt == null;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
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
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public Long getVersion() {
        return version;
    }
    
    public void setVersion(Long version) {
        this.version = version;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuditableEntity that = (AuditableEntity) o;
        return Objects.equals(id, that.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
} 