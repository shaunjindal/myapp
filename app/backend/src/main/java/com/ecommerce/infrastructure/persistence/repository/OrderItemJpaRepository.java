package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.infrastructure.persistence.entity.OrderItemJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.OrderJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for OrderItem operations
 * Provides data access operations for order item management
 */
@Repository
public interface OrderItemJpaRepository extends JpaRepository<OrderItemJpaEntity, String> {

    // Basic order item queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId")
    List<OrderItemJpaEntity> findByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi LEFT JOIN FETCH oi.product WHERE oi.order.id = :orderId")
    List<OrderItemJpaEntity> findByOrderIdWithProduct(@Param("orderId") String orderId);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order = :order")
    List<OrderItemJpaEntity> findByOrder(@Param("order") OrderJpaEntity order);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi LEFT JOIN FETCH oi.product WHERE oi.order = :order")
    List<OrderItemJpaEntity> findByOrderWithProduct(@Param("order") OrderJpaEntity order);
    
    // Product-based queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.product.id = :productId")
    List<OrderItemJpaEntity> findByProductId(@Param("productId") String productId);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.product = :product")
    List<OrderItemJpaEntity> findByProduct(@Param("product") ProductJpaEntity product);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId AND oi.product.id = :productId")
    Optional<OrderItemJpaEntity> findByOrderIdAndProductId(@Param("orderId") String orderId, @Param("productId") String productId);
    
    // Customer order items
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId ORDER BY oi.order.orderDate DESC")
    List<OrderItemJpaEntity> findByCustomerId(@Param("customerId") String customerId);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId ORDER BY oi.order.orderDate DESC")
    Page<OrderItemJpaEntity> findByCustomerId(@Param("customerId") String customerId, Pageable pageable);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId AND oi.product.id = :productId ORDER BY oi.order.orderDate DESC")
    List<OrderItemJpaEntity> findByCustomerIdAndProductId(@Param("customerId") String customerId, @Param("productId") String productId);
    
    // Gift item queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId AND oi.isGift = true")
    List<OrderItemJpaEntity> findGiftItemsByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId AND oi.isGift = true ORDER BY oi.order.orderDate DESC")
    List<OrderItemJpaEntity> findGiftItemsByCustomerId(@Param("customerId") String customerId);
    
    // Discount queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId AND oi.discountAmount > 0")
    List<OrderItemJpaEntity> findDiscountedItemsByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.discountAmount > 0 ORDER BY oi.discountAmount DESC")
    List<OrderItemJpaEntity> findItemsWithDiscount();
    
    // Price range queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.unitPrice BETWEEN :minPrice AND :maxPrice")
    List<OrderItemJpaEntity> findByUnitPriceBetween(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.totalPrice BETWEEN :minTotal AND :maxTotal")
    List<OrderItemJpaEntity> findByTotalPriceBetween(@Param("minTotal") BigDecimal minTotal, @Param("maxTotal") BigDecimal maxTotal);
    
    // Quantity queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.quantity >= :minQuantity")
    List<OrderItemJpaEntity> findByQuantityGreaterThanEqual(@Param("minQuantity") int minQuantity);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId AND oi.quantity > :quantity")
    List<OrderItemJpaEntity> findByOrderIdAndQuantityGreaterThan(@Param("orderId") String orderId, @Param("quantity") int quantity);
    
    // Date-based queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.addedAt BETWEEN :startDate AND :endDate")
    List<OrderItemJpaEntity> findByAddedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.orderDate BETWEEN :startDate AND :endDate")
    List<OrderItemJpaEntity> findByOrderDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Brand and category queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE LOWER(oi.productBrand) = LOWER(:brand)")
    List<OrderItemJpaEntity> findByProductBrand(@Param("brand") String brand);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE LOWER(oi.productCategory) = LOWER(:category)")
    List<OrderItemJpaEntity> findByProductCategory(@Param("category") String category);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId AND LOWER(oi.productBrand) = LOWER(:brand)")
    List<OrderItemJpaEntity> findByCustomerIdAndProductBrand(@Param("customerId") String customerId, @Param("brand") String brand);
    
    // Statistics queries
    @Query("SELECT COUNT(oi) FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId")
    long countByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT COUNT(oi) FROM OrderItemJpaEntity oi WHERE oi.product.id = :productId")
    long countByProductId(@Param("productId") String productId);
    
    @Query("SELECT COUNT(oi) FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId")
    long countByCustomerId(@Param("customerId") String customerId);
    
    @Query("SELECT SUM(oi.quantity) FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId")
    Long sumQuantityByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT SUM(oi.quantity) FROM OrderItemJpaEntity oi WHERE oi.product.id = :productId")
    Long sumQuantityByProductId(@Param("productId") String productId);
    
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId")
    BigDecimal sumTotalPriceByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId")
    BigDecimal sumTotalPriceByCustomerId(@Param("customerId") String customerId);
    
    // Popular products queries
    @Query("SELECT oi.product.id, oi.productName, SUM(oi.quantity) as totalQuantity, COUNT(oi) as orderCount " +
           "FROM OrderItemJpaEntity oi " +
           "WHERE oi.order.orderDate BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.product.id, oi.productName " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> findMostPopularProductsByQuantity(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT oi.product.id, oi.productName, SUM(oi.totalPrice) as totalRevenue, COUNT(oi) as orderCount " +
           "FROM OrderItemJpaEntity oi " +
           "WHERE oi.order.orderDate BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.product.id, oi.productName " +
           "ORDER BY totalRevenue DESC")
    List<Object[]> findMostPopularProductsByRevenue(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Customer purchase history
    @Query("SELECT DISTINCT oi.product.id, oi.productName " +
           "FROM OrderItemJpaEntity oi " +
           "WHERE oi.order.customer.id = :customerId " +
           "ORDER BY oi.order.orderDate DESC")
    List<Object[]> findCustomerPurchaseHistory(@Param("customerId") String customerId);
    
    @Query("SELECT oi.product.id, oi.productName, COUNT(oi) as purchaseCount, SUM(oi.quantity) as totalQuantity " +
           "FROM OrderItemJpaEntity oi " +
           "WHERE oi.order.customer.id = :customerId " +
           "GROUP BY oi.product.id, oi.productName " +
           "ORDER BY purchaseCount DESC")
    List<Object[]> findCustomerFavoriteProducts(@Param("customerId") String customerId);
    
    // Search queries
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE " +
           "LOWER(oi.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(oi.productSku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(oi.productBrand) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY oi.order.orderDate DESC")
    Page<OrderItemJpaEntity> searchOrderItems(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT oi FROM OrderItemJpaEntity oi WHERE oi.order.customer.id = :customerId AND (" +
           "LOWER(oi.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(oi.productSku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(oi.productBrand) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY oi.order.orderDate DESC")
    Page<OrderItemJpaEntity> searchCustomerOrderItems(@Param("customerId") String customerId, @Param("search") String search, Pageable pageable);
    
    // Bulk operations
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderItemJpaEntity oi WHERE oi.order.id = :orderId")
    int deleteByOrderId(@Param("orderId") String orderId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderItemJpaEntity oi WHERE oi.order.id IN :orderIds")
    int deleteByOrderIds(@Param("orderIds") List<String> orderIds);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderItemJpaEntity oi WHERE oi.product.id = :productId")
    int deleteByProductId(@Param("productId") String productId);
    
    // Update operations
    @Modifying
    @Transactional
    @Query("UPDATE OrderItemJpaEntity oi SET oi.quantity = :quantity, oi.totalPrice = :totalPrice WHERE oi.id = :itemId")
    int updateQuantityAndTotalPrice(@Param("itemId") String itemId, @Param("quantity") int quantity, @Param("totalPrice") BigDecimal totalPrice);
    
    @Modifying
    @Transactional
    @Query("UPDATE OrderItemJpaEntity oi SET oi.discountAmount = :discountAmount WHERE oi.order.id = :orderId")
    int updateDiscountAmountByOrderId(@Param("orderId") String orderId, @Param("discountAmount") BigDecimal discountAmount);
} 