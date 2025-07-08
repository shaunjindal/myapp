package com.ecommerce.controller;

import com.ecommerce.application.dto.*;
import com.ecommerce.application.service.AddressService;
import com.ecommerce.infrastructure.persistence.entity.AddressJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Address management
 * Provides complete CRUD operations for user addresses with proper DTO handling and validation
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    
    private final AddressService addressService;
    private final UserJpaRepository userRepository;
    
    @Autowired
    public AddressController(AddressService addressService, UserJpaRepository userRepository) {
        this.addressService = addressService;
        this.userRepository = userRepository;
    }
    
    /**
     * Get all addresses for the authenticated user
     * @return Response containing list of addresses and metadata
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserAddresses() {
        try {
            String userId = getCurrentUserId();
            List<AddressJpaEntity> addresses = addressService.getUserAddresses(userId);
            
            // Convert entities to DTOs
            List<AddressDto> addressDtos = addresses.stream()
                    .map(AddressMapper::toDto)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("addresses", addressDtos);
            response.put("totalAddresses", addresses.size());
            response.put("hasDefault", addressService.hasDefaultAddress(userId));
            
            // Add message for empty state
            if (addresses.isEmpty()) {
                response.put("message", "You haven't added any addresses yet. Add your first address to make checkout faster and easier!");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Create a new address
     * @param request The address creation request
     * @return Response containing the created address
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createAddress(@Valid @RequestBody CreateAddressRequest request) {
        try {
            String userId = getCurrentUserId();
            
            // Validate request
            if (!request.isValid()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Invalid address data", "Please provide all required address fields"));
            }
            
            // Create address using service
            AddressJpaEntity address = addressService.createAddress(
                    userId, 
                    request.getStreet(), 
                    request.getStreet2(), 
                    request.getCity(), 
                    request.getState(), 
                    request.getZipCode(), 
                    request.getCountry(), 
                    request.getType(), 
                    request.getIsDefault()
            );
            
            // Convert to DTO and return
            AddressDto addressDto = AddressMapper.toDto(address);
            return ResponseEntity.ok(createSuccessResponse(addressDto, "Address created successfully"));
            
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Get a specific address by ID
     * @param addressId The address ID
     * @return Response containing the address
     */
    @GetMapping("/{addressId}")
    public ResponseEntity<Map<String, Object>> getAddressById(@PathVariable String addressId) {
        try {
            String userId = getCurrentUserId();
            AddressJpaEntity address = addressService.getAddressById(addressId, userId);
            AddressDto addressDto = AddressMapper.toDto(address);
            return ResponseEntity.ok(createSuccessResponse(addressDto, null));
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Update an existing address
     * @param addressId The address ID
     * @param request The address update request
     * @return Response containing the updated address
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<Map<String, Object>> updateAddress(
            @PathVariable String addressId,
            @Valid @RequestBody UpdateAddressRequest request) {
        try {
            String userId = getCurrentUserId();
            
            // Check if request is empty
            if (request.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No update data provided", "Please provide at least one field to update"));
            }
            
            // Update address using service
            AddressJpaEntity address = addressService.updateAddress(
                    addressId, userId, 
                    request.getStreet(), 
                    request.getStreet2(), 
                    request.getCity(), 
                    request.getState(), 
                    request.getZipCode(), 
                    request.getCountry(), 
                    request.getType(), 
                    request.getIsDefault()
            );
            
            // Convert to DTO and return
            AddressDto addressDto = AddressMapper.toDto(address);
            return ResponseEntity.ok(createSuccessResponse(addressDto, "Address updated successfully"));
            
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Delete an address
     * @param addressId The address ID
     * @return Response confirming deletion
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Map<String, Object>> deleteAddress(@PathVariable String addressId) {
        try {
            String userId = getCurrentUserId();
            addressService.deleteAddress(addressId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Address deleted successfully");
            response.put("deletedAddressId", addressId);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Set an address as the default address
     * @param addressId The address ID
     * @return Response containing the updated address
     */
    @PostMapping("/{addressId}/default")
    public ResponseEntity<Map<String, Object>> setDefaultAddress(@PathVariable String addressId) {
        try {
            String userId = getCurrentUserId();
            AddressJpaEntity address = addressService.setDefaultAddress(addressId, userId);
            
            AddressDto addressDto = AddressMapper.toDto(address);
            return ResponseEntity.ok(createSuccessResponse(addressDto, "Default address updated successfully"));
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Validate an address
     * @param request The address validation request
     * @return Response containing validation results
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateAddress(@RequestBody Map<String, Object> request) {
        try {
            String street = (String) request.get("street");
            String city = (String) request.get("city");
            String state = (String) request.get("state");
            String zipCode = (String) request.get("zipCode");
            String country = (String) request.get("country");
            
            Map<String, Object> validation = new HashMap<>();
            boolean isValid = addressService.validateAddress(street, city, state, zipCode, country);
            
            validation.put("valid", isValid);
            validation.put("message", isValid ? "Address is valid" : "Address validation failed");
            
            if (!isValid) {
                validation.put("errors", getValidationErrors(street, city, state, zipCode, country));
            }
            
            return ResponseEntity.ok(validation);
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Search addresses
     * @param query The search query
     * @return Response containing matching addresses
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAddresses(@RequestParam String query) {
        try {
            String userId = getCurrentUserId();
            List<AddressJpaEntity> addresses = addressService.searchAddresses(userId, query);
            
            // Convert entities to DTOs
            List<AddressDto> addressDtos = addresses.stream()
                    .map(AddressMapper::toDto)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("addresses", addressDtos);
            response.put("totalResults", addresses.size());
            response.put("query", query);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Get the default address
     * @return Response containing the default address or empty if none
     */
    @GetMapping("/default")
    public ResponseEntity<Map<String, Object>> getDefaultAddress() {
        try {
            String userId = getCurrentUserId();
            return addressService.getDefaultAddress(userId)
                    .map(address -> {
                        AddressDto addressDto = AddressMapper.toDto(address);
                        return ResponseEntity.ok(createSuccessResponse(addressDto, null));
                    })
                    .orElse(ResponseEntity.ok(createErrorResponse("No default address found", "Please set a default address")));
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    /**
     * Get shipping-eligible addresses
     * @return Response containing eligible addresses
     */
    @GetMapping("/shipping")
    public ResponseEntity<Map<String, Object>> getShippingAddresses() {
        try {
            String userId = getCurrentUserId();
            List<AddressJpaEntity> addresses = addressService.getShippingEligibleAddresses(userId);
            
            // Convert entities to DTOs
            List<AddressDto> addressDtos = addresses.stream()
                    .map(AddressMapper::toDto)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("addresses", addressDtos);
            response.put("totalAddresses", addresses.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleError(e);
        }
    }
    
    // Private helper methods
    
    /**
     * Get the current authenticated user's ID
     * @return The user ID
     * @throws IllegalStateException if user is not authenticated
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        
        String email = authentication.getName();
        UserJpaEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("User not found with email: " + email));
        
        return user.getId();
    }
    
    /**
     * Create a success response map
     * @param data The response data
     * @param message Optional success message
     * @return Response map
     */
    private Map<String, Object> createSuccessResponse(Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        if (data != null) {
            response.put("data", data);
        }
        if (message != null) {
            response.put("message", message);
        }
        return response;
    }
    
    /**
     * Create an error response map
     * @param error The error message
     * @param message Optional detailed message
     * @return Error response map
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", error);
        if (message != null) {
            response.put("message", message);
        }
        return response;
    }
    
    /**
     * Handle exceptions and return appropriate error responses
     * @param e The exception
     * @return Error response
     */
    private ResponseEntity<Map<String, Object>> handleError(Exception e) {
        if (e instanceof EntityNotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Address not found", e.getMessage()));
        } else if (e instanceof AccessDeniedException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("Access denied", e.getMessage()));
        } else if (e instanceof IllegalArgumentException) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Invalid request", e.getMessage()));
        } else if (e instanceof IllegalStateException) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required", e.getMessage()));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error", "An unexpected error occurred"));
        }
    }
    
    /**
     * Get validation errors for address fields
     * @param street The street address
     * @param city The city
     * @param state The state
     * @param zipCode The ZIP code
     * @param country The country
     * @return List of validation errors
     */
    private java.util.List<String> getValidationErrors(String street, String city, String state, String zipCode, String country) {
        java.util.List<String> errors = new java.util.ArrayList<>();
        
        if (street == null || street.trim().isEmpty()) {
            errors.add("Street address is required");
        }
        if (city == null || city.trim().isEmpty()) {
            errors.add("City is required");
        }
        if (state == null || state.trim().isEmpty()) {
            errors.add("State is required");
        }
        if (zipCode == null || zipCode.trim().isEmpty()) {
            errors.add("ZIP code is required");
        }
        if (country == null || country.trim().isEmpty()) {
            errors.add("Country is required");
        }
        
        return errors;
    }
} 