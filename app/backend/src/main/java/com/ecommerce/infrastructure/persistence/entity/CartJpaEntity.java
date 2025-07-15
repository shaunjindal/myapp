package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.cart.CartStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity for Cart persistence
 * 
 * This entity handles both authenticated user carts and guest carts through:
 * - User association for authenticated users
 * - Session ID tracking for guest users
 * - Cart expiration and status management
 * - Cart item management
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Entity
@Table(name = "carts", indexes = {
    @Index(name = "idx_cart_user_id", columnList = "user_id"),
    @Index(name = "idx_cart_session_id", columnList = "session_id"),
    @Index(name = "idx_cart_status", columnList = "status"),
    @Index(name = "idx_cart_expires_at", columnList = "expires_at")
})
public class CartJpaEntity extends BaseJpaEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private UserJpaEntity user;
    
    @Column(name = "session_id", length = 128, nullable = true)
    private String sessionId;
    
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CartItemJpaEntity> items = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CartStatus status = CartStatus.ACTIVE;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "discount_code", length = 50)
    private String discountCode;
    
    @Column(name = "tax_amount", precision = 19, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @Column(name = "shipping_amount", precision = 19, scale = 2)
    private BigDecimal shippingAmount = BigDecimal.ZERO;
    
    @Column(name = "currency", length = 10)
    private String currency = "INR";
    
    @Column(name = "device_fingerprint", length = 255)
    private String deviceFingerprint;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;
    
    // Default constructor
    public CartJpaEntity() {
        super();
        this.expiresAt = LocalDateTime.now().plusHours(24); // Default 24 hours for guest
        this.lastActivityAt = LocalDateTime.now();
    }
    
    // Constructor for user cart
    public CartJpaEntity(UserJpaEntity user) {
        this();
        this.user = user;
        this.expiresAt = LocalDateTime.now().plusDays(30); // Extended expiry for user carts
    }
    
    // Constructor for guest cart
    public CartJpaEntity(String sessionId, String deviceFingerprint) {
        this();
        this.sessionId = sessionId;
        this.deviceFingerprint = deviceFingerprint;
        this.expiresAt = LocalDateTime.now().plusHours(24); // 24 hours for guest carts
    }
    
    // Business methods
    public void addItem(CartItemJpaEntity item) {
        items.add(item);
        item.setCart(this);
        updateLastActivity();
    }
    
    public void removeItem(CartItemJpaEntity item) {
        items.remove(item);
        item.setCart(null);
        updateLastActivity();
    }
    
    public void clearItems() {
        items.clear();
        updateLastActivity();
    }
    
    public BigDecimal getSubtotal() {
        // Calculate subtotal from base amounts (excluding tax)
        return items.stream()
                .map(item -> {
                    ProductJpaEntity product = item.getProduct();
                    BigDecimal baseAmount = product.getBaseAmount() != null ? 
                        product.getBaseAmount() : item.getUnitPrice();
                    return baseAmount.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public BigDecimal getTotalAmount() {
        return getSubtotal()
                .add(taxAmount != null ? taxAmount : BigDecimal.ZERO)
                .add(shippingAmount != null ? shippingAmount : BigDecimal.ZERO)
                .subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO);
    }
    
    public int getTotalItemCount() {
        return items.stream()
                .mapToInt(CartItemJpaEntity::getQuantity)
                .sum();
    }
    
    public int getUniqueItemCount() {
        return items.size();
    }
    
    public boolean isEmpty() {
        return items.isEmpty();
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isGuestCart() {
        return user == null && sessionId != null;
    }
    
    public boolean isUserCart() {
        return user != null;
    }
    
    public void updateLastActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }
    
    public void extendExpiry(int days) {
        this.expiresAt = LocalDateTime.now().plusDays(days);
    }
    
    public void convertToUserCart(UserJpaEntity user) {
        this.user = user;
        this.sessionId = null;
        this.expiresAt = LocalDateTime.now().plusDays(30); // Extended expiry for user carts
        updateLastActivity();
    }
    
    public void applyDiscount(String discountCode, BigDecimal discountAmount) {
        this.discountCode = discountCode;
        this.discountAmount = discountAmount;
        updateLastActivity();
    }
    
    public void removeDiscount() {
        this.discountCode = null;
        this.discountAmount = BigDecimal.ZERO;
        updateLastActivity();
    }
    
    public void updateTaxAndShipping(BigDecimal taxAmount, BigDecimal shippingAmount) {
        this.taxAmount = taxAmount;
        this.shippingAmount = shippingAmount;
        updateLastActivity();
    }
    
    public void abandon() {
        this.status = CartStatus.ABANDONED;
        updateLastActivity();
    }
    
    public void checkout() {
        this.status = CartStatus.CHECKED_OUT;
        updateLastActivity();
    }
    
    public void expire() {
        this.status = CartStatus.EXPIRED;
        updateLastActivity();
    }
    
    // Getters and Setters
    public UserJpaEntity getUser() {
        return user;
    }
    
    public void setUser(UserJpaEntity user) {
        this.user = user;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public List<CartItemJpaEntity> getItems() {
        return items;
    }
    
    public void setItems(List<CartItemJpaEntity> items) {
        this.items = items;
    }
    
    public CartStatus getStatus() {
        return status;
    }
    
    public void setStatus(CartStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    public String getDiscountCode() {
        return discountCode;
    }
    
    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
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
    
    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }
    
    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }
    
    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    @Override
    public String toString() {
        return "CartJpaEntity{" +
                "id=" + getId() +
                ", user=" + (user != null ? user.getEmail() : "guest") +
                ", sessionId='" + sessionId + '\'' +
                ", itemCount=" + getTotalItemCount() +
                ", subtotal=" + getSubtotal() +
                ", status=" + status +
                ", expiresAt=" + expiresAt +
                '}';
    }
} 