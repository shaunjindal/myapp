package com.ecommerce.controller;

import com.ecommerce.application.service.ProductService;
import com.ecommerce.domain.product.ProductStatus;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Product operations
 * Provides endpoints for product management and inventory operations
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Get all products with pagination and filtering
     */
    @GetMapping
    public ResponseEntity<Page<ProductJpaEntity>> getAllProducts(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(value = "status", required = false) ProductStatus status,
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "name", required = false) String name) {

        Page<ProductJpaEntity> products;

        // Use search if any filter criteria provided
        if (name != null || brand != null || categoryId != null || 
            minPrice != null || maxPrice != null || featured != null) {
            products = productService.searchProducts(name, brand, categoryId, 
                                                   minPrice, maxPrice, featured, pageable);
        } else if (status != null) {
            products = productService.getProductsByStatus(status, pageable);
        } else {
            products = productService.getAllProducts(pageable);
        }

        return ResponseEntity.ok(products);
    }

    /**
     * Get active products only
     */
    @GetMapping("/active")
    public ResponseEntity<Page<ProductJpaEntity>> getActiveProducts(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<ProductJpaEntity> products = productService.getActiveProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get product by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductJpaEntity> getProductById(@PathVariable String id) {
        try {
            ProductJpaEntity product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get product by SKU
     */
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductJpaEntity> getProductBySku(@PathVariable String sku) {
        Optional<ProductJpaEntity> product = productService.getProductBySku(sku);
        return product.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get products by category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductJpaEntity>> getProductsByCategory(
            @PathVariable String categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductJpaEntity> products = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get products in category tree (including subcategories)
     */
    @GetMapping("/category/{categoryId}/tree")
    public ResponseEntity<List<ProductJpaEntity>> getProductsInCategoryTree(@PathVariable String categoryId) {
        List<ProductJpaEntity> products = productService.getProductsInCategoryTree(categoryId);
        return ResponseEntity.ok(products);
    }

    /**
     * Get products by brand
     */
    @GetMapping("/brand/{brand}")
    public ResponseEntity<Page<ProductJpaEntity>> getProductsByBrand(
            @PathVariable String brand,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductJpaEntity> products = productService.getProductsByBrand(brand, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get featured products
     */
    @GetMapping("/featured")
    public ResponseEntity<Page<ProductJpaEntity>> getFeaturedProducts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductJpaEntity> products = productService.getFeaturedProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Search products by name
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductJpaEntity>> searchProducts(
            @RequestParam String name,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductJpaEntity> products = productService.searchProductsByName(name, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get products in price range
     */
    @GetMapping("/price-range")
    public ResponseEntity<Page<ProductJpaEntity>> getProductsInPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductJpaEntity> products = productService.getProductsInPriceRange(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get available products (in stock)
     */
    @GetMapping("/available")
    public ResponseEntity<Page<ProductJpaEntity>> getAvailableProducts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductJpaEntity> products = productService.getAvailableProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get distinct brands
     */
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getDistinctBrands() {
        List<String> brands = productService.getDistinctBrands();
        return ResponseEntity.ok(brands);
    }

    /**
     * Create new product
     */
    @PostMapping
    public ResponseEntity<ProductJpaEntity> createProduct(@Valid @RequestBody ProductJpaEntity product) {
        try {
            ProductJpaEntity savedProduct = productService.createProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update product
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductJpaEntity> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductJpaEntity productDetails) {
        try {
            ProductJpaEntity updatedProduct = productService.updateProduct(id, productDetails);
            return ResponseEntity.ok(updatedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Activate product
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ProductJpaEntity> activateProduct(@PathVariable String id) {
        try {
            ProductJpaEntity product = productService.activateProduct(id);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Deactivate product
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ProductJpaEntity> deactivateProduct(@PathVariable String id) {
        try {
            ProductJpaEntity product = productService.deactivateProduct(id);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mark product as discontinued
     */
    @PatchMapping("/{id}/discontinue")
    public ResponseEntity<ProductJpaEntity> discontinueProduct(@PathVariable String id) {
        try {
            ProductJpaEntity product = productService.discontinueProduct(id);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update featured status
     */
    @PatchMapping("/{id}/featured")
    public ResponseEntity<ProductJpaEntity> updateFeaturedStatus(
            @PathVariable String id,
            @RequestParam boolean featured) {
        try {
            ProductJpaEntity product = productService.updateFeaturedStatus(id, featured);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Inventory Management Endpoints

    /**
     * Update stock quantity
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductJpaEntity> updateStockQuantity(
            @PathVariable String id,
            @RequestParam int quantity) {
        try {
            ProductJpaEntity product = productService.updateStockQuantity(id, quantity);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Add stock
     */
    @PatchMapping("/{id}/stock/add")
    public ResponseEntity<ProductJpaEntity> addStock(
            @PathVariable String id,
            @RequestParam int quantity) {
        try {
            ProductJpaEntity product = productService.addStock(id, quantity);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Reserve stock
     */
    @PatchMapping("/{id}/stock/reserve")
    public ResponseEntity<ProductJpaEntity> reserveStock(
            @PathVariable String id,
            @RequestParam int quantity) {
        try {
            ProductJpaEntity product = productService.reserveStock(id, quantity);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Release reserved stock
     */
    @PatchMapping("/{id}/stock/release")
    public ResponseEntity<ProductJpaEntity> releaseReservedStock(
            @PathVariable String id,
            @RequestParam int quantity) {
        try {
            ProductJpaEntity product = productService.releaseReservedStock(id, quantity);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Fulfill order
     */
    @PatchMapping("/{id}/stock/fulfill")
    public ResponseEntity<ProductJpaEntity> fulfillOrder(
            @PathVariable String id,
            @RequestParam int quantity) {
        try {
            ProductJpaEntity product = productService.fulfillOrder(id, quantity);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update stock levels
     */
    @PatchMapping("/{id}/stock/levels")
    public ResponseEntity<ProductJpaEntity> updateStockLevels(
            @PathVariable String id,
            @RequestParam int minStockLevel,
            @RequestParam int maxStockLevel) {
        try {
            ProductJpaEntity product = productService.updateStockLevels(id, minStockLevel, maxStockLevel);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Inventory Monitoring Endpoints

    /**
     * Get low stock products
     */
    @GetMapping("/inventory/low-stock")
    public ResponseEntity<List<ProductJpaEntity>> getLowStockProducts() {
        List<ProductJpaEntity> products = productService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get out of stock products
     */
    @GetMapping("/inventory/out-of-stock")
    public ResponseEntity<List<ProductJpaEntity>> getOutOfStockProducts() {
        List<ProductJpaEntity> products = productService.getOutOfStockProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get overstocked products
     */
    @GetMapping("/inventory/overstocked")
    public ResponseEntity<List<ProductJpaEntity>> getOverstockedProducts() {
        List<ProductJpaEntity> products = productService.getOverstockedProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get products needing restock
     */
    @GetMapping("/inventory/need-restock")
    public ResponseEntity<List<ProductJpaEntity>> getProductsNeedingRestock(
            @RequestParam(defaultValue = "5") int threshold) {
        List<ProductJpaEntity> products = productService.getProductsNeedingRestock(threshold);
        return ResponseEntity.ok(products);
    }

    /**
     * Get low stock alerts
     */
    @GetMapping("/inventory/alerts")
    public ResponseEntity<List<ProductJpaEntity>> getLowStockAlerts() {
        List<ProductJpaEntity> products = productService.getLowStockAlerts();
        return ResponseEntity.ok(products);
    }

    /**
     * Delete product
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    // Analytics Endpoints

    /**
     * Get top selling products
     */
    @GetMapping("/analytics/top-selling")
    public ResponseEntity<List<ProductJpaEntity>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<ProductJpaEntity> products = productService.getTopSellingProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get highest rated products
     */
    @GetMapping("/analytics/highest-rated")
    public ResponseEntity<List<ProductJpaEntity>> getHighestRatedProducts(
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<ProductJpaEntity> products = productService.getHighestRatedProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get inventory statistics
     */
    @GetMapping("/analytics/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalValue", productService.getTotalInventoryValue());
        stats.put("totalProducts", productService.countProductsByStatus(ProductStatus.ACTIVE));
        stats.put("lowStockCount", productService.getLowStockProducts().size());
        stats.put("outOfStockCount", productService.getOutOfStockProducts().size());
        return ResponseEntity.ok(stats);
    }

    /**
     * Get inventory summary by category
     */
    @GetMapping("/analytics/inventory/by-category")
    public ResponseEntity<List<Object[]>> getInventorySummaryByCategory() {
        List<Object[]> summary = productService.getInventorySummaryByCategory();
        return ResponseEntity.ok(summary);
    }

    /**
     * Generate SKU
     */
    @GetMapping("/generate-sku")
    public ResponseEntity<Map<String, String>> generateSku(
            @RequestParam String productName,
            @RequestParam(required = false) String brand) {
        String sku = productService.generateSku(productName, brand);
        Map<String, String> response = new HashMap<>();
        response.put("sku", sku);
        return ResponseEntity.ok(response);
    }
}