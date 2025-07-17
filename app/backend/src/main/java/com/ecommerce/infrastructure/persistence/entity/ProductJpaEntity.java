package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.product.ProductStatus;
import com.ecommerce.domain.product.DimensionUnit;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * JPA Entity for Product
 * Maps the Product domain entity to the database with normalized relationships
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

    // Price component fields for tax calculation
    @NotNull(message = "Base amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Base amount must have at most 10 integer digits and 2 fractional digits")
    @Column(name = "base_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseAmount;

    @NotNull(message = "Tax rate is required")
    @DecimalMin(value = "0.0", message = "Tax rate must be greater than or equal to 0")
    @DecimalMax(value = "100.0", message = "Tax rate must not exceed 100%")
    @Digits(integer = 3, fraction = 2, message = "Tax rate must have at most 3 integer digits and 2 fractional digits")
    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;

    @NotNull(message = "Tax amount is required")
    @DecimalMin(value = "0.0", message = "Tax amount must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Tax amount must have at most 10 integer digits and 2 fractional digits")
    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount;

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

    // Normalized relationships instead of JSON columns
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private ProductDimensionJpaEntity productDimensions;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProductImageJpaEntity> productImages = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProductSpecificationJpaEntity> productSpecifications = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProductTagJpaEntity> productTags = new ArrayList<>();

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

    // Variable dimension pricing fields
    @Column(name = "is_variable_dimension", nullable = false)
    private boolean isVariableDimension = false;

    @DecimalMin(value = "0.0", inclusive = false, message = "Fixed height must be greater than 0")
    @Column(name = "fixed_height", precision = 10, scale = 3)
    private BigDecimal fixedHeight;

    @DecimalMin(value = "0.0", inclusive = false, message = "Variable dimension rate must be greater than 0")
    @Column(name = "variable_dimension_rate", precision = 12, scale = 2)
    private BigDecimal variableDimensionRate;

    @DecimalMin(value = "0.0", inclusive = false, message = "Max length must be greater than 0")
    @Column(name = "max_length", precision = 10, scale = 3)
    private BigDecimal maxLength;

    @Enumerated(EnumType.STRING)
    @Column(name = "dimension_unit", length = 20)
    private DimensionUnit dimensionUnit;

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

    // Constructor for creating a new product (backward compatibility - treats price as final price with 0 tax)
    public ProductJpaEntity(String name, String description, String sku, BigDecimal price, CategoryJpaEntity category, String brand) {
        super();
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.price = price;
        this.baseAmount = price; // Assume no tax for backward compatibility
        this.taxRate = BigDecimal.ZERO;
        this.taxAmount = BigDecimal.ZERO;
        this.category = category;
        this.brand = brand;
        this.setId(generateProductId(name));
    }

    // Constructor for creating a new product with price components
    public ProductJpaEntity(String name, String description, String sku, BigDecimal baseAmount, BigDecimal taxRate, CategoryJpaEntity category, String brand) {
        super();
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.baseAmount = baseAmount;
        this.taxRate = taxRate;
        this.category = category;
        this.brand = brand;
        this.setId(generateProductId(name));
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

    public boolean isLowStock() {
        return stockQuantity <= minStockLevel;
    }

    public boolean isOverStock() {
        return stockQuantity >= maxStockLevel;
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

    // Variable dimension business methods
    public BigDecimal calculatePriceForLength(BigDecimal customLength) {
        if (!isVariableDimension || fixedHeight == null || variableDimensionRate == null || customLength == null) {
            return price; // Return regular price if not variable dimension
        }
        
        if (customLength.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Custom length must be greater than 0");
        }
        
        if (maxLength != null && customLength.compareTo(maxLength) > 0) {
            throw new IllegalArgumentException("Custom length cannot exceed maximum length of " + maxLength + " " + dimensionUnit.getSymbol());
        }
        
        // Calculate area: fixedHeight × customLength
        BigDecimal area = fixedHeight.multiply(customLength);
        
        // Calculate final price: area × rate (rate already includes tax)
        BigDecimal finalPrice = area.multiply(variableDimensionRate);
        
        return finalPrice;
    }
    
    public boolean isValidCustomLength(BigDecimal customLength) {
        if (!isVariableDimension || customLength == null) {
            return false;
        }
        
        return customLength.compareTo(BigDecimal.ZERO) > 0 && 
               (maxLength == null || customLength.compareTo(maxLength) <= 0);
    }
    
    public String getFormattedDimensionInfo() {
        if (!isVariableDimension || fixedHeight == null || dimensionUnit == null) {
            return "";
        }
        
        return String.format("Fixed Height: %.2f %s, Max Length: %.2f %s, Rate: %.2f per sq %s", 
            fixedHeight.doubleValue(), 
            dimensionUnit.getSymbol(),
            maxLength != null ? maxLength.doubleValue() : 0.0,
            dimensionUnit.getSymbol(),
            variableDimensionRate != null ? variableDimensionRate.doubleValue() : 0.0,
            dimensionUnit.getSymbol());
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

    // Backward compatibility methods for API - convert relationships to JSON format
    @JsonProperty("dimensions")
    public Map<String, Object> getDimensions() {
        if (productDimensions == null) {
            return new HashMap<>();
        }
        Map<String, Object> dimensions = new HashMap<>();
        dimensions.put("length", productDimensions.getLength());
        dimensions.put("width", productDimensions.getWidth());
        dimensions.put("height", productDimensions.getHeight());
        dimensions.put("unit", productDimensions.getUnit() != null ? productDimensions.getUnit().name() : null);
        dimensions.put("volume", productDimensions.getVolume());
        return dimensions;
    }

    public void setDimensions(Map<String, Object> dimensions) {
        if (dimensions == null || dimensions.isEmpty()) {
            this.productDimensions = null;
            return;
        }
        
        // Convert map to ProductDimensionJpaEntity
        if (this.productDimensions == null) {
            this.productDimensions = new ProductDimensionJpaEntity();
            this.productDimensions.setProduct(this);
        }
        
        // Set dimension values from map
        // This method will be used during deserialization
        // The actual conversion logic will be handled in the service layer
    }

    @JsonProperty("images")
    public List<String> getImages() {
        if (productImages == null) {
            return new ArrayList<>();
        }
        return productImages.stream()
                .sorted(Comparator.comparing(ProductImageJpaEntity::getDisplayOrder))
                .map(ProductImageJpaEntity::getImageUrl)
                .collect(Collectors.toList());
    }

    public void setImages(List<String> images) {
        if (images == null) {
            this.productImages = new ArrayList<>();
            return;
        }
        
        // Convert list to ProductImageJpaEntity objects
        // This method will be used during deserialization
        // The actual conversion logic will be handled in the service layer
    }

    @JsonProperty("specifications")
    public Map<String, Object> getSpecifications() {
        if (productSpecifications == null) {
            return new HashMap<>();
        }
        return productSpecifications.stream()
                .filter(spec -> spec.getIsVisible())
                .collect(Collectors.toMap(
                    ProductSpecificationJpaEntity::getSpecKey,
                    ProductSpecificationJpaEntity::getSpecValue
                ));
    }

    public void setSpecifications(Map<String, Object> specifications) {
        if (specifications == null) {
            this.productSpecifications = new ArrayList<>();
            return;
        }
        
        // Convert map to ProductSpecificationJpaEntity objects
        // This method will be used during deserialization
        // The actual conversion logic will be handled in the service layer
    }

    @JsonProperty("tags")
    public Set<String> getTags() {
        if (productTags == null) {
            return new HashSet<>();
        }
        return productTags.stream()
                .filter(tag -> tag.getIsVisible())
                .map(ProductTagJpaEntity::getTagName)
                .collect(Collectors.toSet());
    }

    public void setTags(Set<String> tags) {
        if (tags == null) {
            this.productTags = new ArrayList<>();
            return;
        }
        
        // Convert set to ProductTagJpaEntity objects
        // This method will be used during deserialization
        // The actual conversion logic will be handled in the service layer
    }

    // Direct access to normalized relationships (for internal use)
    public ProductDimensionJpaEntity getProductDimensions() {
        return productDimensions;
    }

    public void setProductDimensions(ProductDimensionJpaEntity productDimensions) {
        this.productDimensions = productDimensions;
        if (productDimensions != null) {
            productDimensions.setProduct(this);
        }
    }

    public List<ProductImageJpaEntity> getProductImages() {
        return productImages;
    }

    public void setProductImages(List<ProductImageJpaEntity> productImages) {
        this.productImages = productImages;
        if (productImages != null) {
            productImages.forEach(image -> image.setProduct(this));
        }
    }

    public List<ProductSpecificationJpaEntity> getProductSpecifications() {
        return productSpecifications;
    }

    public void setProductSpecifications(List<ProductSpecificationJpaEntity> productSpecifications) {
        this.productSpecifications = productSpecifications;
        if (productSpecifications != null) {
            productSpecifications.forEach(spec -> spec.setProduct(this));
        }
    }

    public List<ProductTagJpaEntity> getProductTags() {
        return productTags;
    }

    public void setProductTags(List<ProductTagJpaEntity> productTags) {
        this.productTags = productTags;
        if (productTags != null) {
            productTags.forEach(tag -> tag.setProduct(this));
        }
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

    // Variable dimension getters and setters
    @JsonProperty("isVariableDimension")
    public boolean isVariableDimension() {
        return isVariableDimension;
    }

    @JsonProperty("isVariableDimension")
    public void setVariableDimension(boolean variableDimension) {
        this.isVariableDimension = variableDimension;
    }

    public BigDecimal getFixedHeight() {
        return fixedHeight;
    }

    public void setFixedHeight(BigDecimal fixedHeight) {
        this.fixedHeight = fixedHeight;
    }

    public BigDecimal getVariableDimensionRate() {
        return variableDimensionRate;
    }

    public void setVariableDimensionRate(BigDecimal variableDimensionRate) {
        this.variableDimensionRate = variableDimensionRate;
    }

    public BigDecimal getMaxLength() {
        return maxLength;
    }

    public void setMaxLength(BigDecimal maxLength) {
        this.maxLength = maxLength;
    }

    public DimensionUnit getDimensionUnit() {
        return dimensionUnit;
    }

    public void setDimensionUnit(DimensionUnit dimensionUnit) {
        this.dimensionUnit = dimensionUnit;
    }

    /**
     * Get the main image URL (primary image or first image from the images list)
     * @return The main image URL, or null if no images are available
     */
    @JsonProperty("mainImageUrl")
    public String getMainImageUrl() {
        if (productImages == null || productImages.isEmpty()) {
            return null;
        }
        
        // First try to find a primary image
        Optional<ProductImageJpaEntity> primaryImage = productImages.stream()
                .filter(img -> img.getIsPrimary())
                .findFirst();
        
        if (primaryImage.isPresent()) {
            return primaryImage.get().getImageUrl();
        }
        
        // If no primary image, return the first image by display order
        return productImages.stream()
                .sorted(Comparator.comparing(ProductImageJpaEntity::getDisplayOrder))
                .findFirst()
                .map(ProductImageJpaEntity::getImageUrl)
                .orElse(null);
    }
} 