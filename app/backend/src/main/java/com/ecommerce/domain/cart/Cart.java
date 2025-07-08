package com.ecommerce.domain.cart;

import com.ecommerce.domain.common.AuditableEntity;
import com.ecommerce.domain.product.Product;
import com.ecommerce.domain.user.User;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Cart domain entity representing a shopping cart
 * 
 * This entity follows DDD principles:
 * - Rich domain model with business logic
 * - Encapsulation of cart-related data and behavior
 * - Complex business rules for cart operations
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class Cart extends AuditableEntity {
    
    @NotNull(message = "User is required")
    private User user;
    
    private List<CartItem> items;
    
    private CartStatus status;
    
    private LocalDateTime expiresAt;
    
    private String sessionId; // For guest carts
    
    private BigDecimal discountAmount;
    
    private String discountCode;
    
    // Default constructor
    public Cart() {
        super();
        this.items = new ArrayList<>();
        this.status = CartStatus.ACTIVE;
        this.discountAmount = BigDecimal.ZERO;
        this.expiresAt = LocalDateTime.now().plusDays(30); // Default 30 days expiry
    }
    
    // Constructor for user cart
    public Cart(User user) {
        this();
        this.user = user;
    }
    
    // Constructor for guest cart
    public Cart(String sessionId) {
        this();
        this.sessionId = sessionId;
        this.expiresAt = LocalDateTime.now().plusHours(24); // Guest carts expire in 24 hours
    }
    
    // Business methods
    public void addItem(Product product, int quantity) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (!product.isAvailable()) {
            throw new IllegalArgumentException("Product is not available");
        }
        if (!product.canReserve(quantity)) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
        }
        
        Optional<CartItem> existingItem = findItemByProduct(product);
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (!product.canReserve(newQuantity - item.getQuantity())) {
                throw new IllegalArgumentException("Cannot add more items. Insufficient stock");
            }
            item.updateQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem(product, quantity, product.getPrice());
            this.items.add(newItem);
        }
        
        updateTimestamp();
    }
    
    public void updateItemQuantity(Product product, int quantity) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }
        
        CartItem item = findItemByProduct(product)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in cart"));
        
        if (quantity == 0) {
            removeItem(product);
            return;
        }
        
        if (!product.canReserve(quantity)) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        
        item.updateQuantity(quantity);
        updateTimestamp();
    }
    
    public void removeItem(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
        
        boolean removed = this.items.removeIf(item -> item.getProduct().equals(product));
        if (!removed) {
            throw new IllegalArgumentException("Product not found in cart");
        }
        
        updateTimestamp();
    }
    
    public void clear() {
        this.items.clear();
        this.discountAmount = BigDecimal.ZERO;
        this.discountCode = null;
        updateTimestamp();
    }
    
    public boolean isEmpty() {
        return this.items.isEmpty();
    }
    
    public int getTotalItemCount() {
        return this.items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }
    
    public int getUniqueItemCount() {
        return this.items.size();
    }
    
    public BigDecimal getSubtotal() {
        return this.items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public BigDecimal getTotalAmount() {
        return getSubtotal().subtract(discountAmount);
    }
    
    public BigDecimal getTotalWeight() {
        return this.items.stream()
                .map(item -> {
                    BigDecimal weight = item.getProduct().getWeight();
                    return weight != null ? weight.multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public boolean hasDiscountApplied() {
        return discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public void applyDiscount(String discountCode, BigDecimal discountAmount) {
        if (discountAmount == null || discountAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Discount amount must be non-negative");
        }
        if (discountAmount.compareTo(getSubtotal()) > 0) {
            throw new IllegalArgumentException("Discount amount cannot exceed subtotal");
        }
        
        this.discountCode = discountCode;
        this.discountAmount = discountAmount;
        updateTimestamp();
    }
    
    public void removeDiscount() {
        this.discountCode = null;
        this.discountAmount = BigDecimal.ZERO;
        updateTimestamp();
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
    
    public void extendExpiry(int days) {
        this.expiresAt = LocalDateTime.now().plusDays(days);
    }
    
    public void abandon() {
        this.status = CartStatus.ABANDONED;
        updateTimestamp();
    }
    
    public void checkout() {
        if (isEmpty()) {
            throw new IllegalStateException("Cannot checkout empty cart");
        }
        this.status = CartStatus.CHECKED_OUT;
        updateTimestamp();
    }
    
    public boolean canCheckout() {
        if (isEmpty() || isExpired() || status != CartStatus.ACTIVE) {
            return false;
        }
        
        return this.items.stream()
                .allMatch(item -> item.getProduct().isAvailable() && 
                                 item.getProduct().canReserve(item.getQuantity()));
    }
    
    public List<Product> getUnavailableProducts() {
        return this.items.stream()
                .filter(item -> !item.getProduct().isAvailable())
                .map(CartItem::getProduct)
                .toList();
    }
    
    public List<CartItem> getItemsWithInsufficientStock() {
        return this.items.stream()
                .filter(item -> !item.getProduct().canReserve(item.getQuantity()))
                .toList();
    }
    
    public boolean isGuestCart() {
        return this.sessionId != null && this.user == null;
    }
    
    public boolean isUserCart() {
        return this.user != null;
    }
    
    public void assignToUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        this.user = user;
        this.sessionId = null;
        this.expiresAt = LocalDateTime.now().plusDays(30); // Extend expiry for user carts
        updateTimestamp();
    }
    
    private Optional<CartItem> findItemByProduct(Product product) {
        return this.items.stream()
                .filter(item -> item.getProduct().equals(product))
                .findFirst();
    }
    
    private void updateTimestamp() {
        this.setUpdatedAt(LocalDateTime.now());
    }
    
    // Getters and Setters
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public List<CartItem> getItems() {
        return new ArrayList<>(items);
    }
    
    public void setItems(List<CartItem> items) {
        this.items = items != null ? new ArrayList<>(items) : new ArrayList<>();
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
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
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
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cart cart = (Cart) o;
        return Objects.equals(getId(), cart.getId());
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(getId());
    }
    
    @Override
    public String toString() {
        return "Cart{" +
                "id=" + getId() +
                ", user=" + (user != null ? user.getEmail() : "guest") +
                ", itemCount=" + getTotalItemCount() +
                ", subtotal=" + getSubtotal() +
                ", status=" + status +
                ", expiresAt=" + expiresAt +
                '}';
    }
} 