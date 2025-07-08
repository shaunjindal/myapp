package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.cart.CartStatus;
import com.ecommerce.infrastructure.persistence.entity.CartJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Cart operations
 * 
 * This repository provides methods for:
 * - Finding user and guest carts
 * - Cart cleanup and maintenance
 * - Cart status management
 * - Cart merging operations
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Repository
public interface CartJpaRepository extends JpaRepository<CartJpaEntity, String>, JpaSpecificationExecutor<CartJpaEntity> {
    
    // User cart operations
    @Query("SELECT c FROM CartJpaEntity c WHERE c.user.id = :userId AND c.status = :status")
    Optional<CartJpaEntity> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") CartStatus status);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.user.id = :userId AND c.status = 'ACTIVE' ORDER BY c.updatedAt DESC")
    Optional<CartJpaEntity> findActiveCartByUserId(@Param("userId") String userId);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.user.id = :userId ORDER BY c.updatedAt DESC")
    List<CartJpaEntity> findAllByUserId(@Param("userId") String userId);
    
    // Guest cart operations
    @Query("SELECT c FROM CartJpaEntity c WHERE c.sessionId = :sessionId AND c.status = :status")
    Optional<CartJpaEntity> findBySessionIdAndStatus(@Param("sessionId") String sessionId, @Param("status") CartStatus status);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.sessionId = :sessionId AND c.status = 'ACTIVE' ORDER BY c.lastActivityAt DESC")
    Optional<CartJpaEntity> findActiveCartBySessionId(@Param("sessionId") String sessionId);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.deviceFingerprint = :deviceFingerprint AND c.status = 'ACTIVE' AND c.user IS NULL ORDER BY c.lastActivityAt DESC")
    List<CartJpaEntity> findActiveGuestCartsByDeviceFingerprint(@Param("deviceFingerprint") String deviceFingerprint);
    
    // Cart identification for guests
    @Query("SELECT c FROM CartJpaEntity c WHERE c.sessionId = :sessionId AND c.deviceFingerprint = :deviceFingerprint AND c.status = 'ACTIVE' AND c.user IS NULL")
    Optional<CartJpaEntity> findActiveGuestCart(@Param("sessionId") String sessionId, @Param("deviceFingerprint") String deviceFingerprint);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.ipAddress = :ipAddress AND c.deviceFingerprint = :deviceFingerprint AND c.status = 'ACTIVE' AND c.user IS NULL AND c.lastActivityAt > :since ORDER BY c.lastActivityAt DESC")
    List<CartJpaEntity> findRecentGuestCartsByIpAndFingerprint(@Param("ipAddress") String ipAddress, @Param("deviceFingerprint") String deviceFingerprint, @Param("since") LocalDateTime since);
    
    // Cart cleanup operations
    @Query("SELECT c FROM CartJpaEntity c WHERE c.expiresAt < :now AND c.status = 'ACTIVE'")
    List<CartJpaEntity> findExpiredActiveCarts(@Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.status = 'ABANDONED' AND c.updatedAt < :cutoffDate")
    List<CartJpaEntity> findAbandonedCarts(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.user IS NULL AND c.lastActivityAt < :cutoffDate AND c.status = 'ACTIVE'")
    List<CartJpaEntity> findInactiveGuestCarts(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.status = 'CHECKED_OUT' AND c.updatedAt < :cutoffDate")
    List<CartJpaEntity> findOldCheckedOutCarts(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Cart status updates
    @Modifying
    @Transactional
    @Query("UPDATE CartJpaEntity c SET c.status = :newStatus, c.updatedAt = :now WHERE c.id IN :cartIds")
    int updateCartStatus(@Param("cartIds") List<String> cartIds, @Param("newStatus") CartStatus newStatus, @Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE CartJpaEntity c SET c.status = 'EXPIRED', c.updatedAt = :now WHERE c.expiresAt < :now AND c.status = 'ACTIVE'")
    int markExpiredCarts(@Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE CartJpaEntity c SET c.status = 'ABANDONED', c.updatedAt = :now WHERE c.user IS NULL AND c.lastActivityAt < :cutoffDate AND c.status = 'ACTIVE'")
    int markAbandonedGuestCarts(@Param("cutoffDate") LocalDateTime cutoffDate, @Param("now") LocalDateTime now);
    
    // Cart merging operations
    @Query("SELECT c FROM CartJpaEntity c WHERE c.user IS NULL AND c.sessionId = :sessionId AND c.status = 'ACTIVE'")
    Optional<CartJpaEntity> findGuestCartForMerging(@Param("sessionId") String sessionId);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.user IS NULL AND c.deviceFingerprint = :deviceFingerprint AND c.status = 'ACTIVE' ORDER BY c.lastActivityAt DESC")
    List<CartJpaEntity> findGuestCartsForMerging(@Param("deviceFingerprint") String deviceFingerprint);
    
    // Cart statistics
    @Query("SELECT COUNT(c) FROM CartJpaEntity c WHERE c.user.id = :userId")
    long countCartsByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(c) FROM CartJpaEntity c WHERE c.user IS NULL AND c.status = 'ACTIVE'")
    long countActiveGuestCarts();
    
    @Query("SELECT COUNT(c) FROM CartJpaEntity c WHERE c.status = :status")
    long countCartsByStatus(@Param("status") CartStatus status);
    
    @Query("SELECT AVG(SIZE(c.items)) FROM CartJpaEntity c WHERE c.status = 'ACTIVE' AND c.updatedAt > :since")
    Double getAverageCartSize(@Param("since") LocalDateTime since);
    
    // Cart maintenance
    @Modifying
    @Transactional
    @Query("DELETE FROM CartJpaEntity c WHERE c.status IN ('EXPIRED', 'ABANDONED') AND c.updatedAt < :cutoffDate")
    int deleteOldCarts(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM CartJpaEntity c WHERE c.user IS NULL AND c.status = 'ACTIVE' AND c.lastActivityAt < :cutoffDate")
    int deleteInactiveGuestCarts(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Cart activity tracking
    @Modifying
    @Transactional
    @Query("UPDATE CartJpaEntity c SET c.lastActivityAt = :now WHERE c.id = :cartId")
    int updateLastActivity(@Param("cartId") String cartId, @Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.lastActivityAt > :since AND c.status = 'ACTIVE'")
    List<CartJpaEntity> findActiveCartsSince(@Param("since") LocalDateTime since);
    
    // Cart conversion
    @Modifying
    @Transactional
    @Query("UPDATE CartJpaEntity c SET c.user = :user, c.sessionId = NULL, c.expiresAt = :newExpiresAt, c.updatedAt = :now WHERE c.id = :cartId")
    int convertGuestCartToUserCart(@Param("cartId") String cartId, @Param("user") UserJpaEntity user, @Param("newExpiresAt") LocalDateTime newExpiresAt, @Param("now") LocalDateTime now);
    
    // Advanced queries for cart recovery
    @Query("SELECT c FROM CartJpaEntity c WHERE c.user.id = :userId AND c.status = 'ABANDONED' AND c.updatedAt > :since ORDER BY c.updatedAt DESC")
    List<CartJpaEntity> findRecoverableCartsByUserId(@Param("userId") String userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT c FROM CartJpaEntity c WHERE c.deviceFingerprint = :deviceFingerprint AND c.status = 'ABANDONED' AND c.updatedAt > :since ORDER BY c.updatedAt DESC")
    List<CartJpaEntity> findRecoverableGuestCarts(@Param("deviceFingerprint") String deviceFingerprint, @Param("since") LocalDateTime since);
    
    // Cart validation
    @Query("SELECT c FROM CartJpaEntity c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.product WHERE c.id = :cartId")
    Optional<CartJpaEntity> findCartWithItems(@Param("cartId") String cartId);
    
    @Query("SELECT c FROM CartJpaEntity c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.product WHERE c.user.id = :userId AND c.status = 'ACTIVE'")
    Optional<CartJpaEntity> findActiveCartWithItemsByUserId(@Param("userId") String userId);
    
    @Query("SELECT c FROM CartJpaEntity c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.product WHERE c.sessionId = :sessionId AND c.status = 'ACTIVE'")
    Optional<CartJpaEntity> findActiveCartWithItemsBySessionId(@Param("sessionId") String sessionId);
    
    // Check for existing carts
    boolean existsByUserIdAndStatus(String userId, CartStatus status);
    boolean existsBySessionIdAndStatus(String sessionId, CartStatus status);
    
    // Count items in cart
    @Query("SELECT SUM(ci.quantity) FROM CartJpaEntity c JOIN c.items ci WHERE c.id = :cartId")
    Long getTotalItemsInCart(@Param("cartId") String cartId);
    
    // Find empty carts
    @Query("SELECT c FROM CartJpaEntity c WHERE c.items IS EMPTY AND c.status = 'ACTIVE' AND c.updatedAt < :cutoffDate")
    List<CartJpaEntity> findEmptyActiveCarts(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Bulk operations
    @Modifying
    @Transactional
    @Query("DELETE FROM CartJpaEntity c WHERE c.id IN :cartIds")
    int deleteCartsByIds(@Param("cartIds") List<String> cartIds);
} 