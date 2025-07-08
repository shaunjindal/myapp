package com.ecommerce.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Base JPA entity class providing auditing capabilities and common fields.
 * This class provides automatic auditing of creation and modification times/users,
 * UUID-based primary keys, and optimistic locking support.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseJpaEntity {
    
    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)")
    private String id;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(name = "created_by", length = 100, updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    /**
     * Default constructor that initializes the entity with a new UUID
     */
    public BaseJpaEntity() {
        this.id = UUID.randomUUID().toString();
    }
    
    /**
     * Constructor with specific ID (useful for testing or data migration)
     * @param id The entity ID
     */
    public BaseJpaEntity(String id) {
        this.id = id;
    }
    
    /**
     * Called before entity is persisted for the first time
     */
    @PrePersist
    protected void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.version == null) {
            this.version = 0L;
        }
    }
    
    /**
     * Called before entity is updated
     */
    @PreUpdate
    protected void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Check if this is a new entity (not yet persisted)
     * @return true if the entity is new, false otherwise
     */
    public boolean isNew() {
        return this.version == null || this.version == 0L;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
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
        if (!(o instanceof BaseJpaEntity)) return false;
        BaseJpaEntity that = (BaseJpaEntity) o;
        return Objects.equals(getId(), that.getId());
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(getId());
    }
    
    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "{" +
                "id=" + id +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", version=" + version +
                '}';
    }
} 