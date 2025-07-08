package com.ecommerce.application.service;

import com.ecommerce.domain.common.AddressType;
import com.ecommerce.infrastructure.persistence.entity.AddressJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.AddressJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

/**
 * Service class for address management operations.
 * Handles all business logic related to user addresses including
 * validation, security checks, and default address management.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Service
@Validated
@Transactional
public class AddressService {
    
    private final AddressJpaRepository addressRepository;
    private final UserJpaRepository userRepository;
    
    @Autowired
    public AddressService(AddressJpaRepository addressRepository, UserJpaRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Get all addresses for a specific user
     * @param userId The user ID
     * @return List of user's addresses
     */
    public List<AddressJpaEntity> getUserAddresses(String userId) {
        validateUserId(userId);
        return addressRepository.findByUserId(userId);
    }
    
    /**
     * Get a specific address by ID
     * @param addressId The address ID
     * @param userId The user ID (for security validation)
     * @return The address entity
     * @throws EntityNotFoundException if address not found
     * @throws AccessDeniedException if address doesn't belong to user
     */
    public AddressJpaEntity getAddressById(String addressId, String userId) {
        validateUserId(userId);
        
        AddressJpaEntity address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with ID: " + addressId));
        
        // Security check: ensure address belongs to the user
        if (!address.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Address does not belong to the authenticated user");
        }
        
        return address;
    }
    
    /**
     * Create a new address for a user
     * @param userId The user ID
     * @param street The street address
     * @param street2 The optional second line of address
     * @param city The city
     * @param state The state/province
     * @param postalCode The postal code
     * @param country The country
     * @param type The address type
     * @param isDefault Whether this should be the default address
     * @return The created address entity
     * @throws EntityNotFoundException if user not found
     */
    public AddressJpaEntity createAddress(String userId, String street, String street2, 
                                        String city, String state, String postalCode, 
                                        String country, AddressType type, Boolean isDefault) {
        validateUserId(userId);
        
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        // Create new address
        AddressJpaEntity address = new AddressJpaEntity();
        address.setStreet(street);
        address.setStreet2(street2);
        address.setCity(city);
        address.setState(state);
        address.setPostalCode(postalCode);
        address.setCountry(country);
        address.setType(type);
        address.setUser(user);
        
        // Handle default address logic
        if (isDefault != null && isDefault) {
            // If this is to be the default, unset all other defaults first
            addressRepository.unsetDefaultAddresses(userId);
            address.setIsDefault(true);
        } else {
            // If user has no addresses, make this the default
            boolean hasAddresses = addressRepository.existsByUserId(userId);
            address.setIsDefault(!hasAddresses);
        }
        
        return addressRepository.save(address);
    }
    
    /**
     * Update an existing address
     * @param addressId The address ID
     * @param userId The user ID (for security validation)
     * @param street The street address
     * @param street2 The optional second line of address
     * @param city The city
     * @param state The state/province
     * @param postalCode The postal code
     * @param country The country
     * @param type The address type
     * @param isDefault Whether this should be the default address
     * @return The updated address entity
     * @throws EntityNotFoundException if address not found
     * @throws AccessDeniedException if address doesn't belong to user
     */
    public AddressJpaEntity updateAddress(String addressId, String userId, String street, 
                                        String street2, String city, String state, 
                                        String postalCode, String country, AddressType type, 
                                        Boolean isDefault) {
        validateUserId(userId);
        
        AddressJpaEntity address = getAddressById(addressId, userId);
        
        // Update address fields
        if (street != null) address.setStreet(street);
        if (street2 != null) address.setStreet2(street2);
        if (city != null) address.setCity(city);
        if (state != null) address.setState(state);
        if (postalCode != null) address.setPostalCode(postalCode);
        if (country != null) address.setCountry(country);
        if (type != null) address.setType(type);
        
        // Handle default address logic
        if (isDefault != null && isDefault && !address.getIsDefault()) {
            // If making this the default, unset all other defaults first
            addressRepository.unsetDefaultAddresses(userId);
            address.setIsDefault(true);
        } else if (isDefault != null && !isDefault && address.getIsDefault()) {
            // If removing default status, set another address as default
            address.setIsDefault(false);
            setFirstAddressAsDefault(userId, addressId);
        }
        
        return addressRepository.save(address);
    }
    
    /**
     * Delete an address
     * @param addressId The address ID
     * @param userId The user ID (for security validation)
     * @throws EntityNotFoundException if address not found
     * @throws AccessDeniedException if address doesn't belong to user
     */
    public void deleteAddress(String addressId, String userId) {
        validateUserId(userId);
        
        AddressJpaEntity address = getAddressById(addressId, userId);
        boolean wasDefault = address.getIsDefault();
        
        addressRepository.delete(address);
        
        // If we deleted the default address, set another one as default
        if (wasDefault) {
            setFirstAddressAsDefault(userId, null);
        }
    }
    
    /**
     * Set an address as the default address for a user
     * @param addressId The address ID
     * @param userId The user ID (for security validation)
     * @return The updated address entity
     * @throws EntityNotFoundException if address not found
     * @throws AccessDeniedException if address doesn't belong to user
     */
    public AddressJpaEntity setDefaultAddress(String addressId, String userId) {
        validateUserId(userId);
        
        AddressJpaEntity address = getAddressById(addressId, userId);
        
        // Unset all other defaults first
        addressRepository.unsetDefaultAddresses(userId);
        
        // Set this address as default
        address.setIsDefault(true);
        
        return addressRepository.save(address);
    }
    
    /**
     * Get the default address for a user
     * @param userId The user ID
     * @return Optional containing the default address if found
     */
    public Optional<AddressJpaEntity> getDefaultAddress(String userId) {
        validateUserId(userId);
        return addressRepository.findByUserIdAndIsDefaultTrue(userId);
    }
    
    /**
     * Get addresses by type for a user
     * @param userId The user ID
     * @param type The address type
     * @return List of addresses with the specified type
     */
    public List<AddressJpaEntity> getAddressesByType(String userId, AddressType type) {
        validateUserId(userId);
        return addressRepository.findByUserIdAndType(userId, type);
    }
    
    /**
     * Get shipping-eligible addresses for a user
     * @param userId The user ID
     * @return List of complete addresses suitable for shipping
     */
    public List<AddressJpaEntity> getShippingEligibleAddresses(String userId) {
        validateUserId(userId);
        return addressRepository.findShippingEligibleAddresses(userId);
    }
    
    /**
     * Search addresses by text
     * @param userId The user ID
     * @param searchTerm The search term
     * @return List of matching addresses
     */
    public List<AddressJpaEntity> searchAddresses(String userId, String searchTerm) {
        validateUserId(userId);
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getUserAddresses(userId);
        }
        
        return addressRepository.findByUserIdAndAddressContaining(userId, searchTerm.trim());
    }
    
    /**
     * Validate address data
     * @param street The street address
     * @param city The city
     * @param state The state/province
     * @param postalCode The postal code
     * @param country The country
     * @return true if valid, false otherwise
     */
    public boolean validateAddress(String street, String city, String state, String postalCode, String country) {
        return street != null && !street.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               state != null && !state.trim().isEmpty() &&
               postalCode != null && !postalCode.trim().isEmpty() &&
               country != null && !country.trim().isEmpty();
    }
    
    /**
     * Check if a user has any addresses
     * @param userId The user ID
     * @return true if user has addresses, false otherwise
     */
    public boolean hasAddresses(String userId) {
        validateUserId(userId);
        return addressRepository.existsByUserId(userId);
    }
    
    /**
     * Check if a user has a default address
     * @param userId The user ID
     * @return true if user has a default address, false otherwise
     */
    public boolean hasDefaultAddress(String userId) {
        validateUserId(userId);
        return addressRepository.hasDefaultAddress(userId);
    }
    
    /**
     * Count addresses for a user
     * @param userId The user ID
     * @return Number of addresses for the user
     */
    public long countAddresses(String userId) {
        validateUserId(userId);
        return addressRepository.countByUserId(userId);
    }
    
    /**
     * Get addresses by country for a user
     * @param userId The user ID
     * @param country The country name
     * @return List of addresses in the specified country
     */
    public List<AddressJpaEntity> getAddressesByCountry(String userId, String country) {
        validateUserId(userId);
        return addressRepository.findByUserIdAndCountry(userId, country);
    }
    
    // Private helper methods
    
    /**
     * Validate that user ID is not null or empty
     * @param userId The user ID to validate
     * @throws IllegalArgumentException if user ID is invalid
     */
    private void validateUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
    }
    
    /**
     * Set the first available address as default for a user
     * @param userId The user ID
     * @param excludeAddressId Address ID to exclude (e.g., the one being deleted)
     */
    private void setFirstAddressAsDefault(String userId, String excludeAddressId) {
        List<AddressJpaEntity> addresses = addressRepository.findByUserId(userId);
        
        if (!addresses.isEmpty()) {
            AddressJpaEntity firstAddress = addresses.stream()
                    .filter(addr -> excludeAddressId == null || !addr.getId().equals(excludeAddressId))
                    .findFirst()
                    .orElse(null);
            
            if (firstAddress != null) {
                firstAddress.setIsDefault(true);
                addressRepository.save(firstAddress);
            }
        }
    }
} 