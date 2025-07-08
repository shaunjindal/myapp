package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.order.OrderStatus;
import com.ecommerce.infrastructure.persistence.entity.OrderJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Order operations
 * Provides comprehensive data access operations for order management
 */
@Repository
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, String>, JpaSpecificationExecutor<OrderJpaEntity> {

    // Basic order queries
    Optional<OrderJpaEntity> findByOrderNumber(String orderNumber);
    
    boolean existsByOrderNumber(String orderNumber);
    
    // User-specific orders
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerId(@Param("customerId") String customerId);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> findByCustomerId(@Param("customerId") String customerId, Pageable pageable);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer = :customer ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomer(@Param("customer") UserJpaEntity customer);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer = :customer ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> findByCustomer(@Param("customer") UserJpaEntity customer, Pageable pageable);
    
    // Status-based queries
    List<OrderJpaEntity> findByStatus(OrderStatus status);
    
    Page<OrderJpaEntity> findByStatus(OrderStatus status, Pageable pageable);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.status = :status ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerIdAndStatus(@Param("customerId") String customerId, @Param("status") OrderStatus status);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.status = :status ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> findByCustomerIdAndStatus(@Param("customerId") String customerId, @Param("status") OrderStatus status, Pageable pageable);
    
    // Multiple status queries
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.status IN :statuses ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByStatusIn(@Param("statuses") List<OrderStatus> statuses);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.status IN :statuses ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> findByStatusIn(@Param("statuses") List<OrderStatus> statuses, Pageable pageable);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.status IN :statuses ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerIdAndStatusIn(@Param("customerId") String customerId, @Param("statuses") List<OrderStatus> statuses);
    
    // Date range queries
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.orderDate BETWEEN :startDate AND :endDate ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByOrderDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.orderDate BETWEEN :startDate AND :endDate ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> findByOrderDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.orderDate BETWEEN :startDate AND :endDate ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerIdAndOrderDateBetween(@Param("customerId") String customerId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Recent orders
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.orderDate >= :since ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findRecentOrdersByCustomerId(@Param("customerId") String customerId, @Param("since") LocalDateTime since);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.orderDate >= :since ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> findRecentOrdersByCustomerId(@Param("customerId") String customerId, @Param("since") LocalDateTime since, Pageable pageable);
    
    // Total amount queries
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.totalAmount BETWEEN :minAmount AND :maxAmount ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByTotalAmountBetween(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.totalAmount BETWEEN :minAmount AND :maxAmount ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerIdAndTotalAmountBetween(@Param("customerId") String customerId, @Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    // Payment method queries
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.paymentMethod = :paymentMethod ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByPaymentMethod(@Param("paymentMethod") String paymentMethod);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.paymentMethod = :paymentMethod ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerIdAndPaymentMethod(@Param("customerId") String customerId, @Param("paymentMethod") String paymentMethod);
    
    // Tracking queries
    Optional<OrderJpaEntity> findByTrackingNumber(String trackingNumber);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.trackingNumber IS NOT NULL AND o.status = :status")
    List<OrderJpaEntity> findByTrackingNumberNotNullAndStatus(@Param("status") OrderStatus status);
    
    // Administrative queries
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.status = :status AND o.orderDate <= :cutoffDate")
    List<OrderJpaEntity> findOldOrdersByStatus(@Param("status") OrderStatus status, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.status IN :statuses AND o.orderDate <= :cutoffDate")
    List<OrderJpaEntity> findOldOrdersByStatusIn(@Param("statuses") List<OrderStatus> statuses, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Statistics queries
    @Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.customer.id = :customerId")
    long countByCustomerId(@Param("customerId") String customerId);
    
    @Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.status = :status")
    long countByCustomerIdAndStatus(@Param("customerId") String customerId, @Param("status") OrderStatus status);
    
    @Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);
    
    @Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    long countByOrderDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(o.totalAmount) FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.status IN :statuses")
    BigDecimal sumTotalAmountByCustomerIdAndStatusIn(@Param("customerId") String customerId, @Param("statuses") List<OrderStatus> statuses);
    
    @Query("SELECT SUM(o.totalAmount) FROM OrderJpaEntity o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.status IN :statuses")
    BigDecimal sumTotalAmountByDateRangeAndStatusIn(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("statuses") List<OrderStatus> statuses);
    
    // Complex queries
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.status = :status AND o.orderDate >= :since ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerIdAndStatusAndOrderDateAfter(@Param("customerId") String customerId, @Param("status") OrderStatus status, @Param("since") LocalDateTime since);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND o.status = :status AND o.totalAmount >= :minAmount ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findByCustomerIdAndStatusAndTotalAmountGreaterThanEqual(@Param("customerId") String customerId, @Param("status") OrderStatus status, @Param("minAmount") BigDecimal minAmount);
    
    // Search queries
    @Query("SELECT o FROM OrderJpaEntity o WHERE " +
           "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customer.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customer.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customer.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> searchOrders(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.customer.id = :customerId AND (" +
           "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.orderDate DESC")
    Page<OrderJpaEntity> searchCustomerOrders(@Param("customerId") String customerId, @Param("search") String search, Pageable pageable);
    
    // Aggregation queries
    @Query("SELECT o.status, COUNT(o) FROM OrderJpaEntity o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();
    
    @Query("SELECT o.status, COUNT(o) FROM OrderJpaEntity o WHERE o.orderDate BETWEEN :startDate AND :endDate GROUP BY o.status")
    List<Object[]> countOrdersByStatusAndDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DATE(o.orderDate), COUNT(o), SUM(o.totalAmount) FROM OrderJpaEntity o WHERE o.orderDate BETWEEN :startDate AND :endDate GROUP BY DATE(o.orderDate) ORDER BY DATE(o.orderDate)")
    List<Object[]> getDailyOrderStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
} 