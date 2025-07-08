package com.ecommerce.domain.order;

import com.ecommerce.domain.product.Product;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * OrderItem value object representing an individual item in an order
 * 
 * This value object encapsulates:
 * - Product reference and quantity
 * - Price at time of order placement
 * - Business logic for order item calculations
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class OrderItem {
    
    @NotNull(message = "Product is required")
    private Product product;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
    
    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice;
    
    private String productName; // Snapshot of product name at order time
    
    private String productSku; // Snapshot of product SKU at order time
    
    private String productDescription; // Snapshot of product description at order time
    
    // Default constructor
    public OrderItem() {
    }
    
    // Constructor
    public OrderItem(Product product, int quantity, BigDecimal unitPrice) {
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
        
        // Take snapshots of product information
        this.productName = product.getName();
        this.productSku = product.getSku();
        this.productDescription = product.getDescription();
    }
    
    // Business methods
    public BigDecimal getTotalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    public BigDecimal getTotalWeight() {
        BigDecimal weight = product.getWeight();
        return weight != null ? weight.multiply(BigDecimal.valueOf(quantity)) : BigDecimal.ZERO;
    }
    
    public boolean isProductStillAvailable() {
        return product.isAvailable();
    }
    
    public boolean isInStock() {
        return product.canReserve(quantity);
    }
    
    public BigDecimal getCurrentProductPrice() {
        return product.getPrice();
    }
    
    public boolean isPriceChanged() {
        return !this.unitPrice.equals(product.getPrice());
    }
    
    public BigDecimal getPriceDifference() {
        return getCurrentProductPrice().subtract(this.unitPrice);
    }
    
    public boolean isPriceIncrease() {
        return isPriceChanged() && getPriceDifference().compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isPriceDecrease() {
        return isPriceChanged() && getPriceDifference().compareTo(BigDecimal.ZERO) < 0;
    }
    
    public BigDecimal getDiscountAmount() {
        if (product.isOnSale()) {
            BigDecimal currentPrice = product.getPrice();
            BigDecimal originalPrice = product.getOriginalPrice();
            if (originalPrice != null && originalPrice.compareTo(currentPrice) > 0) {
                return originalPrice.subtract(currentPrice).multiply(BigDecimal.valueOf(quantity));
            }
        }
        return BigDecimal.ZERO;
    }
    
    public BigDecimal getSavingsFromOrderTime() {
        // Calculate savings if current price is lower than order price
        if (isPriceDecrease()) {
            return unitPrice.subtract(getCurrentProductPrice()).multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }
    
    public String getFormattedTotalPrice() {
        return String.format("$%.2f", getTotalPrice().doubleValue());
    }
    
    public String getFormattedUnitPrice() {
        return String.format("$%.2f", unitPrice.doubleValue());
    }
    
    public boolean canBeFulfilled() {
        return product.isAvailable() && product.canReserve(quantity);
    }
    
    public String getFulfillmentStatus() {
        if (!product.isAvailable()) {
            return "Product no longer available";
        }
        if (!product.canReserve(quantity)) {
            return "Insufficient stock (available: " + product.getAvailableQuantity() + ")";
        }
        return "Ready to fulfill";
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
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getProductSku() {
        return productSku;
    }
    
    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }
    
    public String getProductDescription() {
        return productDescription;
    }
    
    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderItem orderItem = (OrderItem) o;
        return Objects.equals(product, orderItem.product) &&
               Objects.equals(unitPrice, orderItem.unitPrice);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(product, unitPrice);
    }
    
    @Override
    public String toString() {
        return "OrderItem{" +
                "productName='" + productName + '\'' +
                ", productSku='" + productSku + '\'' +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + getTotalPrice() +
                '}';
    }
} 