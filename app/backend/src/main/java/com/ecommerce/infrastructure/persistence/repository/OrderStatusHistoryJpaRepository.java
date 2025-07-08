package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.order.OrderStatus;
import com.ecommerce.infrastructure.persistence.entity.OrderJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.OrderStatusHistoryJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for OrderStatusHistory operations
 * Provides data access operations for order status history tracking
 */
@Repository
public interface OrderStatusHistoryJpaRepository extends JpaRepository<OrderStatusHistoryJpaEntity, String> {

    // Basic status history queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> findByOrderId(@Param("orderId") String orderId, Pageable pageable);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order = :order ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByOrder(@Param("order") OrderJpaEntity order);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order = :order ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> findByOrder(@Param("order") OrderJpaEntity order, Pageable pageable);
    
    // Latest status queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId ORDER BY osh.timestamp DESC LIMIT 1")
    Optional<OrderStatusHistoryJpaEntity> findLatestByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order = :order ORDER BY osh.timestamp DESC LIMIT 1")
    Optional<OrderStatusHistoryJpaEntity> findLatestByOrder(@Param("order") OrderJpaEntity order);
    
    // Status-based queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.status = :status ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByStatus(@Param("status") OrderStatus status);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.status = :status ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> findByStatus(@Param("status") OrderStatus status, Pageable pageable);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId AND osh.status = :status ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByOrderIdAndStatus(@Param("orderId") String orderId, @Param("status") OrderStatus status);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.previousStatus = :previousStatus ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByPreviousStatus(@Param("previousStatus") OrderStatus previousStatus);
    
    // Multiple status queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.status IN :statuses ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByStatusIn(@Param("statuses") List<OrderStatus> statuses);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId AND osh.status IN :statuses ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByOrderIdAndStatusIn(@Param("orderId") String orderId, @Param("statuses") List<OrderStatus> statuses);
    
    // Customer status history
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.customer.id = :customerId ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByCustomerId(@Param("customerId") String customerId);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.customer.id = :customerId ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> findByCustomerId(@Param("customerId") String customerId, Pageable pageable);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.customer.id = :customerId AND osh.status = :status ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByCustomerIdAndStatus(@Param("customerId") String customerId, @Param("status") OrderStatus status);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.customer.id = :customerId AND osh.customerVisible = true ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findCustomerVisibleByCustomerId(@Param("customerId") String customerId);
    
    // Date range queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.timestamp BETWEEN :startDate AND :endDate ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.timestamp BETWEEN :startDate AND :endDate ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId AND osh.timestamp BETWEEN :startDate AND :endDate ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByOrderIdAndTimestampBetween(@Param("orderId") String orderId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Recent status changes
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.timestamp >= :since ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findRecentStatusChanges(@Param("since") LocalDateTime since);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId AND osh.timestamp >= :since ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findRecentStatusChangesByOrderId(@Param("orderId") String orderId, @Param("since") LocalDateTime since);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.customer.id = :customerId AND osh.timestamp >= :since ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findRecentStatusChangesByCustomerId(@Param("customerId") String customerId, @Param("since") LocalDateTime since);
    
    // User activity queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.changedBy = :changedBy ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByChangedBy(@Param("changedBy") String changedBy);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.changedBy = :changedBy ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> findByChangedBy(@Param("changedBy") String changedBy, Pageable pageable);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.systemGenerated = :systemGenerated ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findBySystemGenerated(@Param("systemGenerated") boolean systemGenerated);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.systemGenerated = false ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findManualStatusChanges();
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.systemGenerated = true ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findSystemStatusChanges();
    
    // Notification queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.notificationSent = :notificationSent ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByNotificationSent(@Param("notificationSent") boolean notificationSent);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.notificationSent = false AND osh.customerVisible = true ORDER BY osh.timestamp ASC")
    List<OrderStatusHistoryJpaEntity> findPendingNotifications();
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId AND osh.notificationSent = false AND osh.customerVisible = true ORDER BY osh.timestamp ASC")
    List<OrderStatusHistoryJpaEntity> findPendingNotificationsByOrderId(@Param("orderId") String orderId);
    
    // Visibility queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.customerVisible = :customerVisible ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findByCustomerVisible(@Param("customerVisible") boolean customerVisible);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId AND osh.customerVisible = true ORDER BY osh.timestamp DESC")
    List<OrderStatusHistoryJpaEntity> findCustomerVisibleByOrderId(@Param("orderId") String orderId);
    
    // Statistics queries
    @Query("SELECT COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId")
    long countByOrderId(@Param("orderId") String orderId);
    
    @Query("SELECT COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.status = :status")
    long countByStatus(@Param("status") OrderStatus status);
    
    @Query("SELECT COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.timestamp BETWEEN :startDate AND :endDate")
    long countByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.changedBy = :changedBy")
    long countByChangedBy(@Param("changedBy") String changedBy);
    
    @Query("SELECT COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.systemGenerated = :systemGenerated")
    long countBySystemGenerated(@Param("systemGenerated") boolean systemGenerated);
    
    // Search queries
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE " +
           "LOWER(osh.notes) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(osh.changedBy) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> searchStatusHistory(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT osh FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId AND (" +
           "LOWER(osh.notes) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(osh.changedBy) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY osh.timestamp DESC")
    Page<OrderStatusHistoryJpaEntity> searchOrderStatusHistory(@Param("orderId") String orderId, @Param("search") String search, Pageable pageable);
    
    // Aggregation queries
    @Query("SELECT osh.status, COUNT(osh) FROM OrderStatusHistoryJpaEntity osh GROUP BY osh.status ORDER BY COUNT(osh) DESC")
    List<Object[]> countStatusChanges();
    
    @Query("SELECT osh.status, COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.timestamp BETWEEN :startDate AND :endDate GROUP BY osh.status ORDER BY COUNT(osh) DESC")
    List<Object[]> countStatusChangesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT osh.changedBy, COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.systemGenerated = false GROUP BY osh.changedBy ORDER BY COUNT(osh) DESC")
    List<Object[]> countManualStatusChangesByUser();
    
    @Query("SELECT DATE(osh.timestamp), COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.timestamp BETWEEN :startDate AND :endDate GROUP BY DATE(osh.timestamp) ORDER BY DATE(osh.timestamp)")
    List<Object[]> getDailyStatusChangeStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Status transition analysis
    @Query("SELECT osh.previousStatus, osh.status, COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.previousStatus IS NOT NULL GROUP BY osh.previousStatus, osh.status ORDER BY COUNT(osh) DESC")
    List<Object[]> analyzeStatusTransitions();
    
    @Query("SELECT osh.previousStatus, osh.status, COUNT(osh) FROM OrderStatusHistoryJpaEntity osh WHERE osh.previousStatus IS NOT NULL AND osh.timestamp BETWEEN :startDate AND :endDate GROUP BY osh.previousStatus, osh.status ORDER BY COUNT(osh) DESC")
    List<Object[]> analyzeStatusTransitionsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Bulk operations
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id = :orderId")
    int deleteByOrderId(@Param("orderId") String orderId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderStatusHistoryJpaEntity osh WHERE osh.order.id IN :orderIds")
    int deleteByOrderIds(@Param("orderIds") List<String> orderIds);
    
    @Modifying
    @Transactional
    @Query("UPDATE OrderStatusHistoryJpaEntity osh SET osh.notificationSent = true WHERE osh.id IN :historyIds")
    int markNotificationsSent(@Param("historyIds") List<String> historyIds);
    
    @Modifying
    @Transactional
    @Query("UPDATE OrderStatusHistoryJpaEntity osh SET osh.notificationSent = true WHERE osh.order.id = :orderId AND osh.notificationSent = false")
    int markAllNotificationsSentByOrderId(@Param("orderId") String orderId);
} 