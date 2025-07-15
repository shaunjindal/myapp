package com.ecommerce.application.service;

import com.ecommerce.domain.product.ProductStatus;
import com.ecommerce.infrastructure.persistence.entity.CategoryJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.CategoryJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.ProductJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service layer for Product management
 * Handles business logic for product operations, inventory management, and search
 */
@Service
@Transactional
public class ProductService {

    private final ProductJpaRepository productRepository;
    private final CategoryJpaRepository categoryRepository;

    @Autowired
    public ProductService(ProductJpaRepository productRepository, CategoryJpaRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // Basic CRUD operations

    /**
     * Create a new product
     */
    public ProductJpaEntity createProduct(ProductJpaEntity product) {
        validateProduct(product);
        
        // Ensure SKU is unique
        if (productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + product.getSku() + "' already exists");
        }

        // Ensure category exists and is active
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            CategoryJpaEntity category = categoryRepository.findById(product.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            if (!category.isActive()) {
                throw new IllegalArgumentException("Cannot add product to inactive category");
            }
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    /**
     * Update an existing product
     */
    public ProductJpaEntity updateProduct(String productId, ProductJpaEntity updatedProduct) {
        ProductJpaEntity existingProduct = getProductById(productId);
        
        // Validate that SKU is unique (excluding current product)
        if (!existingProduct.getSku().equals(updatedProduct.getSku()) && 
            productRepository.existsBySku(updatedProduct.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + updatedProduct.getSku() + "' already exists");
        }

        // Update category if provided and validate category status
        if (updatedProduct.getCategory() != null && updatedProduct.getCategory().getId() != null) {
            CategoryJpaEntity newCategory = categoryRepository.findById(updatedProduct.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            
            // If product is being moved to a different category, validate the new category
            if (!existingProduct.getCategory().getId().equals(newCategory.getId()) && 
                updatedProduct.getStatus() == ProductStatus.ACTIVE && !newCategory.isActive()) {
                throw new IllegalArgumentException("Cannot move active product to inactive category: " + newCategory.getName());
            }
            
            existingProduct.setCategory(newCategory);
        }

        // Validate status change - cannot activate product if category is inactive
        if (updatedProduct.getStatus() == ProductStatus.ACTIVE && 
            !existingProduct.getCategory().isActive()) {
            throw new IllegalArgumentException("Cannot activate product in inactive category: " + existingProduct.getCategory().getName());
        }

        // Update fields
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setLongDescription(updatedProduct.getLongDescription());
        existingProduct.setSku(updatedProduct.getSku());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setOriginalPrice(updatedProduct.getOriginalPrice());
        
        // Update price component fields
        if (updatedProduct.getBaseAmount() != null && updatedProduct.getTaxRate() != null) {
            existingProduct.updatePriceComponents(updatedProduct.getBaseAmount(), updatedProduct.getTaxRate());
        } else {
            existingProduct.setBaseAmount(updatedProduct.getBaseAmount());
            existingProduct.setTaxRate(updatedProduct.getTaxRate());
            existingProduct.setTaxAmount(updatedProduct.getTaxAmount());
        }
        existingProduct.setBrand(updatedProduct.getBrand());
        existingProduct.setWeight(updatedProduct.getWeight());
        existingProduct.setDimensions(updatedProduct.getDimensions());
        existingProduct.setImages(updatedProduct.getImages());
        existingProduct.setSpecifications(updatedProduct.getSpecifications());
        existingProduct.setTags(updatedProduct.getTags());
        existingProduct.setStatus(updatedProduct.getStatus());
        existingProduct.setFeatured(updatedProduct.isFeatured());
        existingProduct.setMetaTitle(updatedProduct.getMetaTitle());
        existingProduct.setMetaDescription(updatedProduct.getMetaDescription());
        existingProduct.setMetaKeywords(updatedProduct.getMetaKeywords());

        return productRepository.save(existingProduct);
    }

    /**
     * Get product by ID
     */
    @Transactional(readOnly = true)
    public ProductJpaEntity getProductById(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));
    }

    /**
     * Get product by SKU
     */
    @Transactional(readOnly = true)
    public Optional<ProductJpaEntity> getProductBySku(String sku) {
        return productRepository.findBySku(sku);
    }

    /**
     * Get active product by SKU
     */
    @Transactional(readOnly = true)
    public Optional<ProductJpaEntity> getActiveProductBySku(String sku) {
        return productRepository.findBySkuAndStatus(sku, ProductStatus.ACTIVE);
    }

    /**
     * Get all products with pagination
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    /**
     * Get all products from active categories only
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getAllProductsFromActiveCategories(Pageable pageable) {
        return productRepository.findByCategoryActive(true, pageable);
    }

    /**
     * Get products by status
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getProductsByStatus(ProductStatus status, Pageable pageable) {
        return productRepository.findByStatus(status, pageable);
    }

    /**
     * Get products by status from active categories only
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getProductsByStatusAndActiveCategory(ProductStatus status, Pageable pageable) {
        return productRepository.findByStatusAndCategoryActive(status, pageable);
    }

    /**
     * Get active products
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getActiveProducts(Pageable pageable) {
        return productRepository.findByStatusOrderByNameAsc(ProductStatus.ACTIVE, pageable);
    }

    /**
     * Delete product by ID
     */
    public void deleteProduct(String productId) {
        ProductJpaEntity product = getProductById(productId);
        
        // Check if product has reserved stock
        if (product.getReservedQuantity() > 0) {
            throw new IllegalStateException("Cannot delete product with reserved stock. Release reservations first.");
        }

        productRepository.delete(product);
    }

    // Category operations

    /**
     * Get products by category with pagination
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getProductsByCategory(String categoryId, Pageable pageable) {
        return productRepository.findByCategory_Id(categoryId, pageable);
    }

    /**
     * Get active products by category
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getActiveProductsByCategory(String categoryId) {
        return productRepository.findByCategory_IdAndStatus(categoryId, ProductStatus.ACTIVE);
    }

    /**
     * Get active products in category tree (including subcategories)
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getProductsInCategoryTree(String categoryId) {
        return productRepository.findByCategory_IdAndStatus(categoryId, ProductStatus.ACTIVE);
    }

    // Brand operations

    /**
     * Get products by brand
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getProductsByBrand(String brand, Pageable pageable) {
        return productRepository.findByBrand(brand, pageable);
    }

    /**
     * Get active products by brand
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getActiveProductsByBrand(String brand) {
        return productRepository.findByBrandAndStatus(brand, ProductStatus.ACTIVE);
    }

    /**
     * Get distinct brands
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctBrands() {
        return productRepository.findDistinctBrands(ProductStatus.ACTIVE);
    }

    // Search and filtering

    /**
     * Search products by name
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> searchProductsByName(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndStatus(name, ProductStatus.ACTIVE, pageable);
    }

    /**
     * Search products with multiple criteria
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> searchProducts(String name, String brand, String categoryId, 
                                                 BigDecimal minPrice, BigDecimal maxPrice, 
                                                 Boolean featured, Pageable pageable) {
        return productRepository.searchProducts(name, brand, categoryId, ProductStatus.ACTIVE, 
                                                minPrice, maxPrice, featured, pageable);
    }

    /**
     * Get products in price range
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getProductsInPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByPriceBetweenAndStatus(minPrice, maxPrice, ProductStatus.ACTIVE, pageable);
    }

    /**
     * Get featured products
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getFeaturedProducts(Pageable pageable) {
        return productRepository.findByFeaturedAndStatusOrderByCreatedAtDesc(true, ProductStatus.ACTIVE, pageable);
    }

    // Inventory management

    /**
     * Update stock quantity
     */
    public ProductJpaEntity updateStockQuantity(String productId, int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
        
        ProductJpaEntity product = getProductById(productId);
        
        // Check if reducing stock would make reserved quantity invalid
        if (quantity < product.getReservedQuantity()) {
            throw new IllegalArgumentException("Cannot set stock below reserved quantity (" + product.getReservedQuantity() + ")");
        }
        
        product.setStockQuantity(quantity);
        return productRepository.save(product);
    }

    /**
     * Add stock to existing quantity
     */
    public ProductJpaEntity addStock(String productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to add must be positive");
        }
        
        ProductJpaEntity product = getProductById(productId);
        product.addStock(quantity);
        return productRepository.save(product);
    }

    /**
     * Reserve stock for an order
     */
    public ProductJpaEntity reserveStock(String productId, int quantity) {
        ProductJpaEntity product = getProductById(productId);
        product.reserveStock(quantity);
        return productRepository.save(product);
    }

    /**
     * Release reserved stock
     */
    public ProductJpaEntity releaseReservedStock(String productId, int quantity) {
        ProductJpaEntity product = getProductById(productId);
        product.releaseReservedStock(quantity);
        return productRepository.save(product);
    }

    /**
     * Fulfill order (reduce stock and reserved quantity)
     */
    public ProductJpaEntity fulfillOrder(String productId, int quantity) {
        ProductJpaEntity product = getProductById(productId);
        product.fulfillOrder(quantity);
        return productRepository.save(product);
    }

    /**
     * Update stock levels (min and max)
     */
    public ProductJpaEntity updateStockLevels(String productId, int minStockLevel, int maxStockLevel) {
        if (minStockLevel < 0 || maxStockLevel < 0) {
            throw new IllegalArgumentException("Stock levels cannot be negative");
        }
        
        if (minStockLevel > maxStockLevel) {
            throw new IllegalArgumentException("Minimum stock level cannot be greater than maximum stock level");
        }
        
        ProductJpaEntity product = getProductById(productId);
        product.setMinStockLevel(minStockLevel);
        product.setMaxStockLevel(maxStockLevel);
        return productRepository.save(product);
    }

    // Inventory alerts and reporting

    /**
     * Get products with low stock
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getLowStockProducts() {
        return productRepository.findLowStockProducts(ProductStatus.ACTIVE);
    }

    /**
     * Get out of stock products
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts(ProductStatus.ACTIVE);
    }

    /**
     * Get overstocked products
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getOverstockedProducts() {
        return productRepository.findOverstockedProducts(ProductStatus.ACTIVE);
    }

    /**
     * Get available products (in stock)
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getAvailableProducts(Pageable pageable) {
        return productRepository.findAvailableProducts(ProductStatus.ACTIVE, pageable);
    }

    /**
     * Get products that need restocking
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getProductsNeedingRestock(int threshold) {
        return productRepository.findProductsNeedingRestock(ProductStatus.ACTIVE, threshold);
    }

    /**
     * Get low stock alerts
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getLowStockAlerts() {
        return productRepository.getLowStockAlerts(ProductStatus.ACTIVE);
    }

    // Status management

    /**
     * Activate product
     */
    public ProductJpaEntity activateProduct(String productId) {
        ProductJpaEntity product = getProductById(productId);
        
        // Check if category is active before allowing product activation
        if (!product.getCategory().isActive()) {
            throw new IllegalStateException("Cannot activate product in inactive category: " + product.getCategory().getName());
        }
        
        product.setStatus(ProductStatus.ACTIVE);
        return productRepository.save(product);
    }

    /**
     * Deactivate product
     */
    public ProductJpaEntity deactivateProduct(String productId) {
        ProductJpaEntity product = getProductById(productId);
        product.setStatus(ProductStatus.INACTIVE);
        return productRepository.save(product);
    }

    /**
     * Mark product as discontinued
     */
    public ProductJpaEntity discontinueProduct(String productId) {
        ProductJpaEntity product = getProductById(productId);
        product.setStatus(ProductStatus.DISCONTINUED);
        return productRepository.save(product);
    }

    /**
     * Update featured status
     */
    public ProductJpaEntity updateFeaturedStatus(String productId, boolean featured) {
        ProductJpaEntity product = getProductById(productId);
        product.setFeatured(featured);
        return productRepository.save(product);
    }

    // Category-Product Status Synchronization Methods

    /**
     * Update product status when category is deactivated
     * Deactivates all active products in the category
     */
    public int deactivateProductsByCategory(String categoryId) {
        // Only deactivate products that are currently ACTIVE
        return productRepository.updateStatusByCategory(categoryId, ProductStatus.INACTIVE);
    }

    /**
     * Update product status when category is activated
     * Note: This should be used carefully - only activate products that were previously active
     */
    public int activateProductsByCategory(String categoryId) {
        // Only activate products that are currently INACTIVE (not DRAFT, DISCONTINUED, etc.)
        return productRepository.updateSpecificStatusByCategory(categoryId, ProductStatus.INACTIVE, ProductStatus.ACTIVE);
    }

    /**
     * Get products that should be visible to customers (considers category status)
     */
    @Transactional(readOnly = true)
    public Page<ProductJpaEntity> getVisibleProducts(Pageable pageable) {
        return productRepository.findByStatusAndCategoryActive(ProductStatus.ACTIVE, pageable);
    }

    /**
     * Get products by category that are both active and have active category
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getActiveProductsByActiveCategory(String categoryId) {
        return productRepository.findByCategory_IdAndStatusAndCategoryActive(categoryId, ProductStatus.ACTIVE);
    }

    // Analytics and reporting

    /**
     * Get top selling products
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getTopSellingProducts(Pageable pageable) {
        return productRepository.findTopSellingProducts(ProductStatus.ACTIVE, pageable);
    }

    /**
     * Get highest rated products
     */
    @Transactional(readOnly = true)
    public List<ProductJpaEntity> getHighestRatedProducts(Pageable pageable) {
        return productRepository.findHighestRatedProducts(ProductStatus.ACTIVE, pageable);
    }

    /**
     * Get total inventory value
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalInventoryValue() {
        BigDecimal total = productRepository.getTotalInventoryValue(ProductStatus.ACTIVE);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Get inventory summary by category
     */
    @Transactional(readOnly = true)
    public List<Object[]> getInventorySummaryByCategory() {
        return productRepository.getInventorySummaryByCategory(ProductStatus.ACTIVE);
    }

    /**
     * Count products by status
     */
    @Transactional(readOnly = true)
    public long countProductsByStatus(ProductStatus status) {
        return productRepository.countByStatus(status);
    }

    /**
     * Count products by brand
     */
    @Transactional(readOnly = true)
    public long countProductsByBrand(String brand) {
        return productRepository.countByBrand(brand);
    }

    // Validation methods

    /**
     * Validate product data
     */
    private void validateProduct(ProductJpaEntity product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            throw new IllegalArgumentException("Product SKU is required");
        }

        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Product price must be greater than zero");
        }

        // Validate price components if provided
        if (product.getBaseAmount() != null) {
            if (product.getBaseAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Base amount must be greater than zero");
            }
            
            if (product.getTaxRate() == null) {
                throw new IllegalArgumentException("Tax rate is required when base amount is provided");
            }
            
            if (product.getTaxRate().compareTo(BigDecimal.ZERO) < 0 || product.getTaxRate().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Tax rate must be between 0 and 100 percent");
            }
        }

        if (product.getBrand() == null || product.getBrand().trim().isEmpty()) {
            throw new IllegalArgumentException("Product brand is required");
        }

        if (product.getCategory() == null) {
            throw new IllegalArgumentException("Product category is required");
        }

        // Validate SKU format
        if (!product.getSku().matches("^[A-Z0-9-_]{3,50}$")) {
            throw new IllegalArgumentException("SKU must contain only uppercase letters, numbers, hyphens, and underscores (3-50 characters)");
        }

        // Validate stock quantities
        if (product.getStockQuantity() != null && product.getStockQuantity() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }

        if (product.getReservedQuantity() != null && product.getReservedQuantity() < 0) {
            throw new IllegalArgumentException("Reserved quantity cannot be negative");
        }

        if (product.getMinStockLevel() != null && product.getMinStockLevel() < 0) {
            throw new IllegalArgumentException("Minimum stock level cannot be negative");
        }

        if (product.getMaxStockLevel() != null && product.getMaxStockLevel() < 0) {
            throw new IllegalArgumentException("Maximum stock level cannot be negative");
        }

        if (product.getMinStockLevel() != null && product.getMaxStockLevel() != null && 
            product.getMinStockLevel() >= product.getMaxStockLevel()) {
            throw new IllegalArgumentException("Minimum stock level must be less than maximum stock level");
        }
    }

    /**
     * Generate unique SKU
     */
    public String generateSku(String productName, String brand) {
        String baseSku = (brand + "-" + productName)
                .toUpperCase()
                .replaceAll("[^A-Z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        
        if (baseSku.length() > 47) {
            baseSku = baseSku.substring(0, 47);
        }
        
        String sku = baseSku;
        int counter = 1;
        
        while (productRepository.existsBySku(sku)) {
            String suffix = String.format("%03d", counter++);
            sku = baseSku + "-" + suffix;
            if (sku.length() > 50) {
                baseSku = baseSku.substring(0, 46);
                sku = baseSku + "-" + suffix;
            }
        }
        
        return sku;
    }
} 