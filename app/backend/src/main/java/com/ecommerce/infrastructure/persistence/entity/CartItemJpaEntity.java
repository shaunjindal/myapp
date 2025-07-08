package com.ecommerce.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA Entity for Cart Item persistence
 * 
 * This entity represents individual items within a cart, maintaining:
 * - Product reference and quantity
 * - Price snapshot at time of adding to cart
 * - Timestamps for tracking when items were added/modified
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Entity
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_item_cart_id", columnList = "cart_id"),
    @Index(name = "idx_cart_item_product_id", columnList = "product_id"),
    @Index(name = "idx_cart_item_cart_product", columnList = "cart_id, product_id", unique = true)
})
public class CartItemJpaEntity extends BaseJpaEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private CartJpaEntity cart;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductJpaEntity product;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "price_at_time", precision = 19, scale = 2)
    private BigDecimal priceAtTime;
    
    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "is_gift", nullable = false)
    private Boolean isGift = false;
    
    @Column(name = "gift_message", length = 500)
    private String giftMessage;
    
    @Column(name = "custom_attributes", length = 1000)
    private String customAttributes;
    
    // Default constructor
    public CartItemJpaEntity() {
        super();
        this.addedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Constructor
    public CartItemJpaEntity(CartJpaEntity cart, ProductJpaEntity product, Integer quantity, BigDecimal unitPrice) {
        this();
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.priceAtTime = unitPrice;
    }
    
    // Business methods
    public BigDecimal getTotalPrice() {
        BigDecimal basePrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        return basePrice.subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO);
    }
    
    public BigDecimal getOriginalTotalPrice() {
        return priceAtTime != null ? priceAtTime.multiply(BigDecimal.valueOf(quantity)) : getTotalPrice();
    }
    
    public BigDecimal getSavingsAmount() {
        if (priceAtTime == null) {
            return BigDecimal.ZERO;
        }
        return getOriginalTotalPrice().subtract(getTotalPrice());
    }
    
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity == null || newQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.quantity = newQuantity;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updatePrice(BigDecimal newPrice) {
        if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
        this.unitPrice = newPrice;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void applyDiscount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void removeDiscount() {
        this.discountAmount = BigDecimal.ZERO;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void setAsGift(String giftMessage) {
        this.isGift = true;
        this.giftMessage = giftMessage;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void removeGift() {
        this.isGift = false;
        this.giftMessage = null;
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean hasDiscount() {
        return discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isPriceChanged() {
        return priceAtTime != null && !priceAtTime.equals(unitPrice);
    }
    
    public BigDecimal getPriceDifference() {
        if (priceAtTime == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.subtract(priceAtTime);
    }
    
    public void increaseQuantity(Integer amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        this.quantity += amount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void decreaseQuantity(Integer amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount >= this.quantity) {
            throw new IllegalArgumentException("Cannot decrease quantity below 1");
        }
        this.quantity -= amount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public BigDecimal getTotalWeight() {
        if (product == null || product.getWeight() == null) {
            return BigDecimal.ZERO;
        }
        return product.getWeight().multiply(BigDecimal.valueOf(quantity));
    }
    
    // Getters and Setters
    public CartJpaEntity getCart() {
        return cart;
    }
    
    public void setCart(CartJpaEntity cart) {
        this.cart = cart;
    }
    
    public ProductJpaEntity getProduct() {
        return product;
    }
    
    public void setProduct(ProductJpaEntity product) {
        this.product = product;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.updatedAt = LocalDateTime.now();
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public BigDecimal getPriceAtTime() {
        return priceAtTime;
    }
    
    public void setPriceAtTime(BigDecimal priceAtTime) {
        this.priceAtTime = priceAtTime;
    }
    
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    public Boolean getIsGift() {
        return isGift;
    }
    
    public void setIsGift(Boolean isGift) {
        this.isGift = isGift;
    }
    
    public String getGiftMessage() {
        return giftMessage;
    }
    
    public void setGiftMessage(String giftMessage) {
        this.giftMessage = giftMessage;
    }
    
    public String getCustomAttributes() {
        return customAttributes;
    }
    
    public void setCustomAttributes(String customAttributes) {
        this.customAttributes = customAttributes;
    }
    
    @Override
    public String toString() {
        return "CartItemJpaEntity{" +
                "id=" + getId() +
                ", product=" + (product != null ? product.getName() : "null") +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + getTotalPrice() +
                ", addedAt=" + addedAt +
                '}';
    }
} 