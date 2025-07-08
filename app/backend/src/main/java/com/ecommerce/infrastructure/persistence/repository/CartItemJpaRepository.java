package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.infrastructure.persistence.entity.CartItemJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.CartJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
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
 * JPA Repository for Cart Item operations
 * 
 * This repository provides methods for:
 * - Finding cart items by various criteria
 * - Bulk operations on cart items
 * - Cart item validation and cleanup
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Repository
public interface CartItemJpaRepository extends JpaRepository<CartItemJpaEntity, String> {
    
    // Find cart items by cart
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId")
    List<CartItemJpaEntity> findByCartId(@Param("cartId") String cartId);
    
    @Query("SELECT ci FROM CartItemJpaEntity ci LEFT JOIN FETCH ci.product WHERE ci.cart.id = :cartId")
    List<CartItemJpaEntity> findByCartIdWithProduct(@Param("cartId") String cartId);
    
    // Find cart items by product
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.product.id = :productId")
    List<CartItemJpaEntity> findByProductId(@Param("productId") String productId);
    
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    Optional<CartItemJpaEntity> findByCartIdAndProductId(@Param("cartId") String cartId, @Param("productId") String productId);
    
    // Find cart items by specific criteria
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId AND ci.isGift = true")
    List<CartItemJpaEntity> findGiftItemsByCartId(@Param("cartId") String cartId);
    
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId AND ci.discountAmount > 0")
    List<CartItemJpaEntity> findDiscountedItemsByCartId(@Param("cartId") String cartId);
    
    // Bulk operations
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId")
    int deleteByCartId(@Param("cartId") String cartId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItemJpaEntity ci WHERE ci.cart.id IN :cartIds")
    int deleteByCartIds(@Param("cartIds") List<String> cartIds);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItemJpaEntity ci WHERE ci.product.id = :productId")
    int deleteByProductId(@Param("productId") String productId);
    
    // Update operations
    @Modifying
    @Transactional
    @Query("UPDATE CartItemJpaEntity ci SET ci.quantity = :quantity, ci.updatedAt = :now WHERE ci.id = :itemId")
    int updateQuantity(@Param("itemId") String itemId, @Param("quantity") Integer quantity, @Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE CartItemJpaEntity ci SET ci.unitPrice = :unitPrice, ci.updatedAt = :now WHERE ci.id = :itemId")
    int updateUnitPrice(@Param("itemId") String itemId, @Param("unitPrice") BigDecimal unitPrice, @Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE CartItemJpaEntity ci SET ci.discountAmount = :discountAmount, ci.updatedAt = :now WHERE ci.id = :itemId")
    int updateDiscountAmount(@Param("itemId") String itemId, @Param("discountAmount") BigDecimal discountAmount, @Param("now") LocalDateTime now);
    
    // Statistics
    @Query("SELECT COUNT(ci) FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId")
    long countByCartId(@Param("cartId") String cartId);
    
    @Query("SELECT SUM(ci.quantity) FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId")
    Long sumQuantityByCartId(@Param("cartId") String cartId);
    
    @Query("SELECT SUM(ci.quantity * ci.unitPrice) FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId")
    BigDecimal sumTotalPriceByCartId(@Param("cartId") String cartId);
    
    // Product availability checks
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.product.id = :productId AND ci.cart.status = 'ACTIVE'")
    List<CartItemJpaEntity> findActiveCartItemsByProductId(@Param("productId") String productId);
    
    @Query("SELECT SUM(ci.quantity) FROM CartItemJpaEntity ci WHERE ci.product.id = :productId AND ci.cart.status = 'ACTIVE'")
    Long sumReservedQuantityByProductId(@Param("productId") String productId);
    
    // Cart item validation
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId AND ci.quantity <= 0")
    List<CartItemJpaEntity> findInvalidQuantityItemsByCartId(@Param("cartId") String cartId);
    
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId AND ci.unitPrice <= 0")
    List<CartItemJpaEntity> findInvalidPriceItemsByCartId(@Param("cartId") String cartId);
    
    // Recent activity
    @Query("SELECT ci FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId AND ci.updatedAt > :since ORDER BY ci.updatedAt DESC")
    List<CartItemJpaEntity> findRecentlyUpdatedItemsByCartId(@Param("cartId") String cartId, @Param("since") LocalDateTime since);
    
    // Cart item cleanup
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItemJpaEntity ci WHERE ci.cart.status IN ('EXPIRED', 'ABANDONED') AND ci.updatedAt < :cutoffDate")
    int deleteItemsFromExpiredCarts(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Gift items
    @Query("SELECT COUNT(ci) FROM CartItemJpaEntity ci WHERE ci.cart.id = :cartId AND ci.isGift = true")
    long countGiftItemsByCartId(@Param("cartId") String cartId);
    
    @Modifying
    @Transactional
    @Query("UPDATE CartItemJpaEntity ci SET ci.isGift = :isGift, ci.giftMessage = :giftMessage, ci.updatedAt = :now WHERE ci.id = :itemId")
    int updateGiftStatus(@Param("itemId") String itemId, @Param("isGift") Boolean isGift, @Param("giftMessage") String giftMessage, @Param("now") LocalDateTime now);
    
    // Check existence
    boolean existsByCartIdAndProductId(String cartId, String productId);
    boolean existsByCartId(String cartId);
    boolean existsByProductId(String productId);
} 