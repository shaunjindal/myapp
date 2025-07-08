package com.ecommerce.infrastructure.persistence.repository;

import com.ecommerce.domain.common.AddressType;
import com.ecommerce.infrastructure.persistence.entity.AddressJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA repository interface for Address entities.
 * Provides database operations for address management including
 * user-specific address operations, default address management, and validation.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Repository
public interface AddressJpaRepository extends JpaRepository<AddressJpaEntity, String> {
    
    /**
     * Find all addresses for a specific user
     * @param user The user entity
     * @return List of user's addresses ordered by creation date
     */
    @Query("SELECT a FROM AddressJpaEntity a WHERE a.user = :user ORDER BY a.createdAt DESC")
    List<AddressJpaEntity> findByUser(@Param("user") UserJpaEntity user);
    
    /**
     * Find all addresses for a specific user by user ID
     * @param userId The user ID
     * @return List of user's addresses ordered by creation date
     */
    @Query("SELECT a FROM AddressJpaEntity a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<AddressJpaEntity> findByUserId(@Param("userId") String userId);
    
    /**
     * Find the default address for a specific user
     * @param user The user entity
     * @return Optional containing the default address if found
     */
    Optional<AddressJpaEntity> findByUserAndIsDefaultTrue(UserJpaEntity user);
    
    /**
     * Find the default address for a specific user by user ID
     * @param userId The user ID
     * @return Optional containing the default address if found
     */
    @Query("SELECT a FROM AddressJpaEntity a WHERE a.user.id = :userId AND a.isDefault = true")
    Optional<AddressJpaEntity> findByUserIdAndIsDefaultTrue(@Param("userId") String userId);
    
    /**
     * Find addresses by type for a specific user
     * @param user The user entity
     * @param type The address type
     * @return List of addresses with the specified type
     */
    List<AddressJpaEntity> findByUserAndType(UserJpaEntity user, AddressType type);
    
    /**
     * Find addresses by type for a specific user by user ID
     * @param userId The user ID
     * @param type The address type
     * @return List of addresses with the specified type
     */
    @Query("SELECT a FROM AddressJpaEntity a WHERE a.user.id = :userId AND a.type = :type")
    List<AddressJpaEntity> findByUserIdAndType(@Param("userId") String userId, @Param("type") AddressType type);
    
    /**
     * Check if a user has any addresses
     * @param userId The user ID
     * @return true if user has addresses, false otherwise
     */
    @Query("SELECT COUNT(a) > 0 FROM AddressJpaEntity a WHERE a.user.id = :userId")
    boolean existsByUserId(@Param("userId") String userId);
    
    /**
     * Check if a user has a default address
     * @param userId The user ID
     * @return true if user has a default address, false otherwise
     */
    @Query("SELECT COUNT(a) > 0 FROM AddressJpaEntity a WHERE a.user.id = :userId AND a.isDefault = true")
    boolean hasDefaultAddress(@Param("userId") String userId);
    
    /**
     * Count addresses for a specific user
     * @param userId The user ID
     * @return Number of addresses for the user
     */
    @Query("SELECT COUNT(a) FROM AddressJpaEntity a WHERE a.user.id = :userId")
    long countByUserId(@Param("userId") String userId);
    
    /**
     * Count addresses by type for a specific user
     * @param userId The user ID
     * @param type The address type
     * @return Number of addresses with the specified type
     */
    @Query("SELECT COUNT(a) FROM AddressJpaEntity a WHERE a.user.id = :userId AND a.type = :type")
    long countByUserIdAndType(@Param("userId") String userId, @Param("type") AddressType type);
    
    /**
     * Find addresses by partial text search in address fields
     * @param userId The user ID
     * @param searchTerm The search term
     * @return List of matching addresses
     */
    @Query("SELECT a FROM AddressJpaEntity a WHERE a.user.id = :userId AND " +
           "(LOWER(a.street) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.state) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.postalCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<AddressJpaEntity> findByUserIdAndAddressContaining(@Param("userId") String userId, @Param("searchTerm") String searchTerm);
    
    /**
     * Find addresses by country for a specific user
     * @param userId The user ID
     * @param country The country name
     * @return List of addresses in the specified country
     */
    @Query("SELECT a FROM AddressJpaEntity a WHERE a.user.id = :userId AND LOWER(a.country) = LOWER(:country)")
    List<AddressJpaEntity> findByUserIdAndCountry(@Param("userId") String userId, @Param("country") String country);
    
    /**
     * Unset all default addresses for a user (used before setting a new default)
     * @param userId The user ID
     * @return Number of addresses updated
     */
    @Modifying
    @Query("UPDATE AddressJpaEntity a SET a.isDefault = false WHERE a.user.id = :userId AND a.isDefault = true")
    int unsetDefaultAddresses(@Param("userId") String userId);
    
    /**
     * Set a specific address as default for a user
     * @param addressId The address ID
     * @param userId The user ID
     * @return Number of addresses updated
     */
    @Modifying
    @Query("UPDATE AddressJpaEntity a SET a.isDefault = true WHERE a.id = :addressId AND a.user.id = :userId")
    int setDefaultAddress(@Param("addressId") String addressId, @Param("userId") String userId);
    
    /**
     * Delete all addresses for a specific user
     * @param userId The user ID
     * @return Number of addresses deleted
     */
    @Modifying
    @Query("DELETE FROM AddressJpaEntity a WHERE a.user.id = :userId")
    int deleteByUserId(@Param("userId") String userId);
    
    /**
     * Validate that an address belongs to a specific user
     * @param addressId The address ID
     * @param userId The user ID
     * @return true if address belongs to user, false otherwise
     */
    @Query("SELECT COUNT(a) > 0 FROM AddressJpaEntity a WHERE a.id = :addressId AND a.user.id = :userId")
    boolean validateAddressOwnership(@Param("addressId") String addressId, @Param("userId") String userId);
    
    /**
     * Find addresses suitable for shipping (complete addresses)
     * @param userId The user ID
     * @return List of shipping-eligible addresses
     */
    @Query("SELECT a FROM AddressJpaEntity a WHERE a.user.id = :userId AND " +
           "a.street IS NOT NULL AND a.street != '' AND " +
           "a.city IS NOT NULL AND a.city != '' AND " +
           "a.state IS NOT NULL AND a.state != '' AND " +
           "a.postalCode IS NOT NULL AND a.postalCode != '' AND " +
           "a.country IS NOT NULL AND a.country != '' " +
           "ORDER BY a.isDefault DESC, a.createdAt DESC")
    List<AddressJpaEntity> findShippingEligibleAddresses(@Param("userId") String userId);
} 