package com.ecommerce.infrastructure.persistence.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity for OrderItem persistence
 * Maps OrderItem domain entity to database table
 */
@Entity
@Table(
    name = "order_items",
    indexes = {
        @Index(name = "idx_order_items_order_id", columnList = "order_id"),
        @Index(name = "idx_order_items_product_id", columnList = "product_id")
    }
)
public class OrderItemJpaEntity extends BaseJpaEntity {

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_items_order"))
    private OrderJpaEntity order;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_items_product"))
    private ProductJpaEntity product;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private int quantity;

    @NotNull(message = "Unit price is required")
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // Snapshot fields - preserved at order time
    @Column(name = "product_name", nullable = false, length = 500)
    private String productName;

    @Column(name = "product_sku", length = 100)
    private String productSku;

    @Column(name = "product_description", length = 2000)
    private String productDescription;

    @Column(name = "product_image_url", length = 500)
    private String productImageUrl;

    @Column(name = "product_brand", length = 100)
    private String productBrand;

    @Column(name = "product_category", length = 100)
    private String productCategory;

    @Column(name = "product_weight", precision = 8, scale = 2)
    private BigDecimal productWeight;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt = LocalDateTime.now();

    @Column(name = "is_gift")
    private boolean isGift = false;

    @Column(name = "gift_message", length = 500)
    private String giftMessage;

    @Column(name = "custom_attributes", length = 1000)
    private String customAttributes;

    // Constructors
    public OrderItemJpaEntity() {
        super();
    }

    public OrderItemJpaEntity(OrderJpaEntity order, ProductJpaEntity product, int quantity, BigDecimal unitPrice) {
        this();
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        
        // Take snapshots of product information
        if (product != null) {
            this.productName = product.getName();
            this.productSku = product.getSku();
            this.productDescription = product.getDescription();
            this.productImageUrl = product.getMainImageUrl();
            this.productBrand = product.getBrand();
            this.productWeight = product.getWeight();
            
            // Get category name if available
            if (product.getCategory() != null) {
                this.productCategory = product.getCategory().getName();
            }
        }
    }

    // Helper methods
    public void recalculateTotalPrice() {
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public BigDecimal getItemTotalWithTax() {
        return totalPrice.add(taxAmount != null ? taxAmount : BigDecimal.ZERO);
    }

    public BigDecimal getItemTotalWithDiscountAndTax() {
        BigDecimal total = totalPrice;
        if (discountAmount != null) {
            total = total.subtract(discountAmount);
        }
        if (taxAmount != null) {
            total = total.add(taxAmount);
        }
        return total;
    }

    public BigDecimal getTotalWeight() {
        return productWeight != null ? 
            productWeight.multiply(BigDecimal.valueOf(quantity)) : BigDecimal.ZERO;
    }

    // Getters and Setters
    public OrderJpaEntity getOrder() {
        return order;
    }

    public void setOrder(OrderJpaEntity order) {
        this.order = order;
    }

    public ProductJpaEntity getProduct() {
        return product;
    }

    public void setProduct(ProductJpaEntity product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
        recalculateTotalPrice();
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        recalculateTotalPrice();
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
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

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public String getProductBrand() {
        return productBrand;
    }

    public void setProductBrand(String productBrand) {
        this.productBrand = productBrand;
    }

    public String getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }

    public BigDecimal getProductWeight() {
        return productWeight;
    }

    public void setProductWeight(BigDecimal productWeight) {
        this.productWeight = productWeight;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    public boolean isGift() {
        return isGift;
    }

    public void setGift(boolean gift) {
        isGift = gift;
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
} 