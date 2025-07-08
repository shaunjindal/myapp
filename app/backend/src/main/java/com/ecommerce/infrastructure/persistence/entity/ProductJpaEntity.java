package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.product.ProductStatus;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.*;

/**
 * JPA Entity for Product
 * Maps the Product domain entity to the database
 */
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_sku", columnList = "sku", unique = true),
    @Index(name = "idx_product_category", columnList = "category_id"),
    @Index(name = "idx_product_status", columnList = "status"),
    @Index(name = "idx_product_brand", columnList = "brand"),
    @Index(name = "idx_product_featured", columnList = "featured"),
    @Index(name = "idx_product_price", columnList = "price"),
    @Index(name = "idx_product_stock", columnList = "stock_quantity")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductJpaEntity extends BaseJpaEntity {

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 255, message = "Product name must be between 2 and 255 characters")
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description", length = 500)
    private String description;

    @Size(max = 2000, message = "Long description must not exceed 2000 characters")
    @Column(name = "long_description", length = 2000)
    private String longDescription;

    @NotBlank(message = "SKU is required")
    @Pattern(regexp = "^[A-Z0-9-_]{3,50}$", message = "SKU must contain only uppercase letters, numbers, hyphens, and underscores")
    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 10 integer digits and 2 fractional digits")
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Original price must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Original price must have at most 10 integer digits and 2 fractional digits")
    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private CategoryJpaEntity category;

    @NotBlank(message = "Brand is required")
    @Size(max = 100, message = "Brand must not exceed 100 characters")
    @Column(name = "brand", nullable = false, length = 100)
    private String brand;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Min(value = 0, message = "Reserved quantity cannot be negative")
    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Min(value = 0, message = "Minimum stock level cannot be negative")
    @Column(name = "min_stock_level")
    private Integer minStockLevel = 0;

    @Min(value = 0, message = "Maximum stock level cannot be negative")
    @Column(name = "max_stock_level")
    private Integer maxStockLevel = 1000;

    @DecimalMin(value = "0.0", message = "Weight must be greater than or equal to 0")
    @Column(name = "weight", precision = 8, scale = 3)
    private BigDecimal weight;

    // Product dimensions stored as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dimensions", columnDefinition = "JSON")
    private Map<String, Object> dimensions = new HashMap<>();

    // Product images stored as JSON array
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "images", columnDefinition = "JSON")
    private List<String> images = new ArrayList<>();

    // Product specifications stored as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specifications", columnDefinition = "JSON")
    private Map<String, Object> specifications = new HashMap<>();

    // Product tags stored as JSON array
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "JSON")
    private Set<String> tags = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProductStatus status = ProductStatus.DRAFT;

    @Column(name = "featured", nullable = false)
    private boolean featured = false;

    @DecimalMin(value = "0.0", message = "Rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Rating must be between 0 and 5")
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Min(value = 0, message = "Review count cannot be negative")
    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    // SEO fields
    @Column(name = "meta_title", length = 150)
    private String metaTitle;

    @Column(name = "meta_description", length = 300)
    private String metaDescription;

    @Column(name = "meta_keywords", length = 500)
    private String metaKeywords;

    // Default constructor
    public ProductJpaEntity() {
        super();
        // ID will be set when name is provided
    }
    
    private String generateProductId(String name) {
        // Generate a simple product ID based on name
        if (name == null || name.trim().isEmpty()) {
            return "prod-" + System.currentTimeMillis(); // fallback
        }
        return "prod-" + name.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    // Constructor for creating a new product
    public ProductJpaEntity(String name, String description, String sku, BigDecimal price, CategoryJpaEntity category, String brand) {
        super();
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.price = price;
        this.category = category;
        this.brand = brand;
        this.setId(generateProductId(name));
    }

    // Business methods
    public boolean isAvailable() {
        return ProductStatus.ACTIVE.equals(this.status) && getAvailableQuantity() > 0;
    }

    public boolean isInStock() {
        return getAvailableQuantity() > 0;
    }

    public int getAvailableQuantity() {
        return Math.max(0, stockQuantity - reservedQuantity);
    }

    public boolean canReserve(int quantity) {
        return quantity > 0 && getAvailableQuantity() >= quantity;
    }

    public void reserveStock(int quantity) {
        if (!canReserve(quantity)) {
            throw new IllegalArgumentException("Cannot reserve " + quantity + " items. Available: " + getAvailableQuantity());
        }
        this.reservedQuantity += quantity;
    }

    public void releaseReservedStock(int quantity) {
        if (quantity <= 0 || quantity > this.reservedQuantity) {
            throw new IllegalArgumentException("Invalid quantity to release: " + quantity);
        }
        this.reservedQuantity -= quantity;
    }

    public void fulfillOrder(int quantity) {
        if (quantity <= 0 || quantity > this.reservedQuantity) {
            throw new IllegalArgumentException("Invalid quantity to fulfill: " + quantity);
        }
        this.stockQuantity -= quantity;
        this.reservedQuantity -= quantity;
    }

    public void addStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to add must be positive");
        }
        this.stockQuantity += quantity;
    }

    public boolean isOnSale() {
        return originalPrice != null && 
               originalPrice.compareTo(BigDecimal.ZERO) > 0 && 
               price.compareTo(originalPrice) < 0;
    }

    public BigDecimal getDiscountPercentage() {
        if (!isOnSale()) {
            return BigDecimal.ZERO;
        }
        BigDecimal discount = originalPrice.subtract(price);
        return discount.divide(originalPrice, 2, BigDecimal.ROUND_HALF_UP)
                      .multiply(BigDecimal.valueOf(100));
    }

    public boolean isLowStock() {
        return stockQuantity <= minStockLevel;
    }

    public boolean isOverStock() {
        return stockQuantity >= maxStockLevel;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        // Update ID when name changes
        if (name != null && !name.trim().isEmpty()) {
            this.setId(generateProductId(name));
        }
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLongDescription() {
        return longDescription;
    }

    public void setLongDescription(String longDescription) {
        this.longDescription = longDescription;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public CategoryJpaEntity getCategory() {
        return category;
    }

    public void setCategory(CategoryJpaEntity category) {
        this.category = category;
    }

    @JsonProperty("categoryName")
    public String getCategoryName() {
        return category != null ? category.getName() : null;
    }

    @JsonProperty("categoryId") 
    public String getCategoryId() {
        return category != null ? category.getId() : null;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(Integer reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public Integer getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Integer minStockLevel) {
        this.minStockLevel = minStockLevel;
    }

    public Integer getMaxStockLevel() {
        return maxStockLevel;
    }

    public void setMaxStockLevel(Integer maxStockLevel) {
        this.maxStockLevel = maxStockLevel;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public Map<String, Object> getDimensions() {
        return dimensions;
    }

    public void setDimensions(Map<String, Object> dimensions) {
        this.dimensions = dimensions;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public Map<String, Object> getSpecifications() {
        return specifications;
    }

    public void setSpecifications(Map<String, Object> specifications) {
        this.specifications = specifications;
    }

    public Set<String> getTags() {
        return tags;
    }

    public void setTags(Set<String> tags) {
        this.tags = tags;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public String getMetaTitle() {
        return metaTitle;
    }

    public void setMetaTitle(String metaTitle) {
        this.metaTitle = metaTitle;
    }

    public String getMetaDescription() {
        return metaDescription;
    }

    public void setMetaDescription(String metaDescription) {
        this.metaDescription = metaDescription;
    }

    public String getMetaKeywords() {
        return metaKeywords;
    }

    public void setMetaKeywords(String metaKeywords) {
        this.metaKeywords = metaKeywords;
    }

    /**
     * Get the main image URL (first image from the images list)
     * @return The main image URL, or null if no images are available
     */
    public String getMainImageUrl() {
        return images != null && !images.isEmpty() ? images.get(0) : null;
    }
} 