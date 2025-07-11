package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.payment.PaymentStatus;
import com.ecommerce.infrastructure.persistence.entity.PaymentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA repository for payment transactions
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Repository
public interface PaymentJpaRepository extends JpaRepository<PaymentJpaEntity, Long> {
    
    /**
     * Find payment by payment ID
     * 
     * @param paymentId the payment ID
     * @return Optional containing the payment if found
     */
    Optional<PaymentJpaEntity> findByPaymentId(String paymentId);
    
    /**
     * Find payment by Razorpay order ID
     * 
     * @param razorpayOrderId the Razorpay order ID
     * @return Optional containing the payment if found
     */
    Optional<PaymentJpaEntity> findByRazorpayOrderId(String razorpayOrderId);
    
    /**
     * Find payment by Razorpay payment ID
     * 
     * @param razorpayPaymentId the Razorpay payment ID
     * @return Optional containing the payment if found
     */
    Optional<PaymentJpaEntity> findByRazorpayPaymentId(String razorpayPaymentId);
    
    /**
     * Find all payments for a user
     * 
     * @param userId the user ID
     * @return List of payments for the user
     */
    List<PaymentJpaEntity> findByUser_IdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find all payments for an order
     * 
     * @param orderId the order ID
     * @return List of payments for the order
     */
    List<PaymentJpaEntity> findByOrder_IdOrderByCreatedAtDesc(String orderId);
    
    /**
     * Find payments by status
     * 
     * @param status the payment status
     * @return List of payments with the specified status
     */
    List<PaymentJpaEntity> findByStatusOrderByCreatedAtDesc(PaymentStatus status);
    
    /**
     * Find all payments for a user with specific status
     * 
     * @param userId the user ID
     * @param status the payment status
     * @return List of payments for the user with the specified status
     */
    List<PaymentJpaEntity> findByUser_IdAndStatusOrderByCreatedAtDesc(String userId, PaymentStatus status);
    
    /**
     * Count payments by status
     * 
     * @param status the payment status
     * @return Number of payments with the specified status
     */
    long countByStatus(PaymentStatus status);
    
    /**
     * Check if payment exists by Razorpay order ID
     * 
     * @param razorpayOrderId the Razorpay order ID
     * @return true if payment exists, false otherwise
     */
    boolean existsByRazorpayOrderId(String razorpayOrderId);
    
    /**
     * Find successful payments for a user
     * 
     * @param userId the user ID
     * @return List of successful payments for the user
     */
    @Query("SELECT p FROM PaymentJpaEntity p WHERE p.user.id = :userId AND p.status = 'PAID' ORDER BY p.createdAt DESC")
    List<PaymentJpaEntity> findSuccessfulPaymentsByUser(@Param("userId") String userId);
    
    /**
     * Find failed payments for a user
     * 
     * @param userId the user ID
     * @return List of failed payments for the user
     */
    @Query("SELECT p FROM PaymentJpaEntity p WHERE p.user.id = :userId AND p.status IN ('FAILED', 'CANCELLED') ORDER BY p.createdAt DESC")
    List<PaymentJpaEntity> findFailedPaymentsByUser(@Param("userId") String userId);
} 