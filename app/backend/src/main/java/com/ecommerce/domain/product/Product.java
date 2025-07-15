package com.ecommerce.domain.product;

import com.ecommerce.domain.common.AuditableEntity;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.*;

/**
 * Product domain entity representing an item available for purchase
 * 
 * This entity follows DDD principles:
 * - Rich domain model with business logic
 * - Encapsulation of product-related data and behavior
 * - Validation rules embedded in the domain
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class Product extends AuditableEntity {
    
    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 255, message = "Product name must be between 2 and 255 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Size(max = 2000, message = "Long description must not exceed 2000 characters")
    private String longDescription;
    
    @NotBlank(message = "SKU is required")
    @Pattern(regexp = "^[A-Z0-9-_]{3,50}$", message = "SKU must contain only uppercase letters, numbers, hyphens, and underscores")
    private String sku;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 10 integer digits and 2 fractional digits")
    private BigDecimal price;
    
    @DecimalMin(value = "0.0", message = "Original price must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Original price must have at most 10 integer digits and 2 fractional digits")
    private BigDecimal originalPrice;
    
    // Price component fields for tax calculation
    @NotNull(message = "Base amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Base amount must have at most 10 integer digits and 2 fractional digits")
    private BigDecimal baseAmount;

    @NotNull(message = "Tax rate is required")
    @DecimalMin(value = "0.0", message = "Tax rate must be greater than or equal to 0")
    @DecimalMax(value = "100.0", message = "Tax rate must not exceed 100%")
    @Digits(integer = 3, fraction = 2, message = "Tax rate must have at most 3 integer digits and 2 fractional digits")
    private BigDecimal taxRate;

    @NotNull(message = "Tax amount is required")
    @DecimalMin(value = "0.0", message = "Tax amount must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Tax amount must have at most 10 integer digits and 2 fractional digits")
    private BigDecimal taxAmount;
    
    @NotNull(message = "Category is required")
    private Category category;
    
    @NotBlank(message = "Brand is required")
    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;
    
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;
    
    @Min(value = 0, message = "Reserved quantity cannot be negative")
    private Integer reservedQuantity;
    
    @DecimalMin(value = "0.0", message = "Weight must be greater than or equal to 0")
    private BigDecimal weight;
    
    private ProductDimensions dimensions;
    
    private List<String> images;
    
    private Map<String, Object> specifications;
    
    private Set<String> tags;
    
    private ProductStatus status;
    
    private boolean featured;
    
    @DecimalMin(value = "0.0", message = "Rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Rating must be between 0 and 5")
    private BigDecimal averageRating;
    
    @Min(value = 0, message = "Review count cannot be negative")
    private Integer reviewCount;
    
    // Default constructor
    public Product() {
        super();
        this.images = new ArrayList<>();
        this.specifications = new HashMap<>();
        this.tags = new HashSet<>();
        this.status = ProductStatus.DRAFT;
        this.featured = false;
        this.stockQuantity = 0;
        this.reservedQuantity = 0;
        this.averageRating = BigDecimal.ZERO;
        this.reviewCount = 0;
    }
    
    // Constructor for creating a new product (backward compatibility - treats price as final price with 0 tax)
    public Product(String name, String description, String sku, BigDecimal price, Category category, String brand) {
        this();
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.price = price;
        this.baseAmount = price; // Assume no tax for backward compatibility
        this.taxRate = BigDecimal.ZERO;
        this.taxAmount = BigDecimal.ZERO;
        this.category = category;
        this.brand = brand;
    }

    // Constructor for creating a new product with price components
    public Product(String name, String description, String sku, BigDecimal baseAmount, BigDecimal taxRate, Category category, String brand) {
        this();
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.baseAmount = baseAmount;
        this.taxRate = taxRate;
        this.category = category;
        this.brand = brand;
        calculateTaxAmount();
        calculateFinalPrice();
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
    
    public void activate() {
        this.status = ProductStatus.ACTIVE;
    }
    
    public void deactivate() {
        this.status = ProductStatus.INACTIVE;
    }
    
    public void markAsDiscontinued() {
        this.status = ProductStatus.DISCONTINUED;
    }
    
    public void addImage(String imageUrl) {
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            this.images.add(imageUrl);
        }
    }
    
    public void removeImage(String imageUrl) {
        this.images.remove(imageUrl);
    }
    
    public void addSpecification(String key, Object value) {
        if (key != null && !key.trim().isEmpty() && value != null) {
            this.specifications.put(key, value);
        }
    }
    
    public void removeSpecification(String key) {
        this.specifications.remove(key);
    }
    
    public void addTag(String tag) {
        if (tag != null && !tag.trim().isEmpty()) {
            this.tags.add(tag.toLowerCase());
        }
    }
    
    public void removeTag(String tag) {
        if (tag != null) {
            this.tags.remove(tag.toLowerCase());
        }
    }
    
    public void updateRating(BigDecimal newRating, int totalReviews) {
        this.averageRating = newRating;
        this.reviewCount = totalReviews;
    }
    
    // Price component calculation methods
    public void calculateTaxAmount() {
        if (baseAmount != null && taxRate != null) {
            this.taxAmount = baseAmount.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
        }
    }

    public void calculateFinalPrice() {
        if (baseAmount != null && taxAmount != null) {
            this.price = baseAmount.add(taxAmount);
        }
    }

    public void updatePriceComponents(BigDecimal baseAmount, BigDecimal taxRate) {
        this.baseAmount = baseAmount;
        this.taxRate = taxRate;
        calculateTaxAmount();
        calculateFinalPrice();
    }

    public BigDecimal getFinalPrice() {
        return baseAmount != null && taxAmount != null ? baseAmount.add(taxAmount) : price;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
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
    
    public BigDecimal getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
        calculateTaxAmount();
        calculateFinalPrice();
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
        calculateTaxAmount();
        calculateFinalPrice();
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
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
    
    public BigDecimal getWeight() {
        return weight;
    }
    
    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
    
    public ProductDimensions getDimensions() {
        return dimensions;
    }
    
    public void setDimensions(ProductDimensions dimensions) {
        this.dimensions = dimensions;
    }
    
    public List<String> getImages() {
        return new ArrayList<>(images);
    }
    
    public void setImages(List<String> images) {
        this.images = images != null ? new ArrayList<>(images) : new ArrayList<>();
    }
    
    public Map<String, Object> getSpecifications() {
        return new HashMap<>(specifications);
    }
    
    public void setSpecifications(Map<String, Object> specifications) {
        this.specifications = specifications != null ? new HashMap<>(specifications) : new HashMap<>();
    }
    
    public Set<String> getTags() {
        return new HashSet<>(tags);
    }
    
    public void setTags(Set<String> tags) {
        this.tags = tags != null ? new HashSet<>(tags) : new HashSet<>();
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
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(getId(), product.getId()) &&
               Objects.equals(sku, product.sku);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(getId(), sku);
    }
    
    @Override
    public String toString() {
        return "Product{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", sku='" + sku + '\'' +
                ", price=" + price +
                ", category=" + category +
                ", brand='" + brand + '\'' +
                ", status=" + status +
                ", stockQuantity=" + stockQuantity +
                '}';
    }
} 