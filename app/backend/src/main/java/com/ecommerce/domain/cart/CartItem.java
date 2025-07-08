package com.ecommerce.domain.cart;

import com.ecommerce.domain.product.Product;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * CartItem value object representing an individual item in a shopping cart
 * 
 * This value object encapsulates:
 * - Product reference and quantity
 * - Price at time of adding to cart
 * - Business logic for cart item operations
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class CartItem {
    
    @NotNull(message = "Product is required")
    private Product product;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
    
    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice;
    
    private LocalDateTime addedAt;
    
    private LocalDateTime updatedAt;
    
    // Default constructor
    public CartItem() {
        this.addedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Constructor
    public CartItem(Product product, int quantity, BigDecimal unitPrice) {
        this();
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Unit price must be positive");
        }
        
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
    
    // Business methods
    public BigDecimal getTotalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    public void updateQuantity(int newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.quantity = newQuantity;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void increaseQuantity(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        this.quantity += amount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void decreaseQuantity(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount >= this.quantity) {
            throw new IllegalArgumentException("Cannot decrease quantity below 1");
        }
        this.quantity -= amount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean isPriceChanged() {
        return !this.unitPrice.equals(product.getPrice());
    }
    
    public BigDecimal getPriceDifference() {
        return product.getPrice().subtract(this.unitPrice);
    }
    
    public void updatePrice() {
        this.unitPrice = product.getPrice();
        this.updatedAt = LocalDateTime.now();
    }
    
    public BigDecimal getTotalWeight() {
        BigDecimal weight = product.getWeight();
        return weight != null ? weight.multiply(BigDecimal.valueOf(quantity)) : BigDecimal.ZERO;
    }
    
    public boolean isAvailable() {
        return product.isAvailable() && product.canReserve(quantity);
    }
    
    public boolean isInStock() {
        return product.canReserve(quantity);
    }
    
    public String getUnavailabilityReason() {
        if (!product.isAvailable()) {
            return "Product is no longer available";
        }
        if (!product.canReserve(quantity)) {
            return "Insufficient stock (available: " + product.getAvailableQuantity() + ")";
        }
        return null;
    }
    
    // Getters and Setters
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
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
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItem cartItem = (CartItem) o;
        return Objects.equals(product, cartItem.product);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(product);
    }
    
    @Override
    public String toString() {
        return "CartItem{" +
                "product=" + product.getName() +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + getTotalPrice() +
                ", addedAt=" + addedAt +
                '}';
    }
} 