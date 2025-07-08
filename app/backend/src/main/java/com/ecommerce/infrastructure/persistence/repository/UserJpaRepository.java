package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.user.UserStatus;
import com.ecommerce.infrastructure.persistence.BaseJpaRepository;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * JPA repository interface for User entities.
 * Provides database operations for user management, authentication,
 * and security-related functionality.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Repository
public interface UserJpaRepository extends BaseJpaRepository<UserJpaEntity> {
    
    /**
     * Find a user by email address
     * @param email The email address (case-insensitive)
     * @return Optional containing the user if found
     */
    Optional<UserJpaEntity> findByEmailIgnoreCase(String email);
    
    /**
     * Check if a user exists with the given email
     * @param email The email address (case-insensitive)
     * @return true if user exists, false otherwise
     */
    boolean existsByEmailIgnoreCase(String email);
    
    /**
     * Find a user by email verification token
     * @param token The email verification token
     * @return Optional containing the user if found
     */
    Optional<UserJpaEntity> findByEmailVerificationToken(String token);
    
    /**
     * Find a user by password reset token
     * @param token The password reset token
     * @return Optional containing the user if found
     */
    Optional<UserJpaEntity> findByPasswordResetToken(String token);
    
    /**
     * Find users by status
     * @param status The user status
     * @return List of users with the given status
     */
    List<UserJpaEntity> findByStatus(UserStatus status);
    
    /**
     * Find users created after a specific date
     * @param date The date threshold
     * @return List of users created after the date
     */
    List<UserJpaEntity> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find users who have not verified their email
     * @return List of users with unverified emails
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.emailVerified = false")
    List<UserJpaEntity> findUnverifiedUsers();
    
    /**
     * Find users whose accounts are currently locked
     * @param now Current timestamp
     * @return List of locked users
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.accountLockedUntil IS NOT NULL AND u.accountLockedUntil > :now")
    List<UserJpaEntity> findLockedUsers(@Param("now") LocalDateTime now);
    
    /**
     * Find users who have failed login attempts above threshold
     * @param threshold The minimum number of failed attempts
     * @return List of users with excessive failed attempts
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.failedLoginAttempts >= :threshold")
    List<UserJpaEntity> findUsersWithFailedAttempts(@Param("threshold") int threshold);
    
    /**
     * Find users who haven't logged in since a specific date
     * @param date The date threshold
     * @return List of inactive users
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.lastLoginAt IS NULL OR u.lastLoginAt < :date")
    List<UserJpaEntity> findInactiveUsersSince(@Param("date") LocalDateTime date);
    
    /**
     * Count users by status
     * @param status The user status
     * @return Count of users with the given status
     */
    long countByStatus(UserStatus status);
    
    /**
     * Count users registered today
     * @param startOfDay Start of current day
     * @return Count of users registered today
     */
    @Query("SELECT COUNT(u) FROM UserJpaEntity u WHERE u.createdAt >= :startOfDay")
    long countUsersRegisteredToday(@Param("startOfDay") LocalDateTime startOfDay);
    
    /**
     * Find users by partial name match (first name or last name)
     * @param searchTerm The search term
     * @return List of matching users
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<UserJpaEntity> findByNameContaining(@Param("searchTerm") String searchTerm);
    
    /**
     * Find users by phone number
     * @param phoneNumber The phone number
     * @return Optional containing the user if found
     */
    Optional<UserJpaEntity> findByPhoneNumber(String phoneNumber);
    
    /**
     * Clear expired password reset tokens
     * @param expiryDate The expiry threshold date
     * @return Number of users updated
     */
    @Query("UPDATE UserJpaEntity u SET u.passwordResetToken = NULL WHERE u.updatedAt < :expiryDate AND u.passwordResetToken IS NOT NULL")
    int clearExpiredPasswordResetTokens(@Param("expiryDate") LocalDateTime expiryDate);
    
    /**
     * Clear expired email verification tokens
     * @param expiryDate The expiry threshold date
     * @return Number of users updated
     */
    @Query("UPDATE UserJpaEntity u SET u.emailVerificationToken = NULL WHERE u.createdAt < :expiryDate AND u.emailVerificationToken IS NOT NULL AND u.emailVerified = false")
    int clearExpiredEmailVerificationTokens(@Param("expiryDate") LocalDateTime expiryDate);
    
    /**
     * Unlock accounts that have passed their lock expiry time
     * @param now Current timestamp
     * @return Number of users unlocked
     */
    @Query("UPDATE UserJpaEntity u SET u.accountLockedUntil = NULL, u.failedLoginAttempts = 0 WHERE u.accountLockedUntil IS NOT NULL AND u.accountLockedUntil <= :now")
    int unlockExpiredAccounts(@Param("now") LocalDateTime now);
} 