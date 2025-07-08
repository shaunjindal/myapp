package com.ecommerce.application.dto;

import com.ecommerce.infrastructure.persistence.entity.AddressJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;

/**
 * Mapper utility class for converting between Address DTOs and JPA entities.
 * Handles all conversions and data mapping between different layers.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class AddressMapper {
    
    /**
     * Convert AddressJpaEntity to AddressDto
     * @param entity The JPA entity to convert
     * @return The converted DTO
     */
    public static AddressDto toDto(AddressJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        
        AddressDto dto = new AddressDto();
        dto.setId(entity.getId());
        dto.setStreet(entity.getStreet());
        dto.setStreet2(entity.getStreet2());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setPostalCode(entity.getPostalCode());
        dto.setCountry(entity.getCountry());
        dto.setType(entity.getType());
        dto.setIsDefault(entity.getIsDefault());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * Convert CreateAddressRequest to AddressJpaEntity
     * @param request The create request DTO
     * @param user The user who owns this address
     * @return The created JPA entity
     */
    public static AddressJpaEntity toEntity(CreateAddressRequest request, UserJpaEntity user) {
        if (request == null) {
            return null;
        }
        
        AddressJpaEntity entity = new AddressJpaEntity();
        entity.setStreet(request.getStreet());
        entity.setStreet2(request.getStreet2());
        entity.setCity(request.getCity());
        entity.setState(request.getState());
        entity.setPostalCode(request.getZipCode());
        entity.setCountry(request.getCountry());
        entity.setType(request.getType());
        entity.setIsDefault(request.getIsDefault());
        entity.setUser(user);
        
        return entity;
    }
    
    /**
     * Update AddressJpaEntity with data from UpdateAddressRequest
     * @param entity The entity to update
     * @param request The update request DTO
     */
    public static void updateEntity(AddressJpaEntity entity, UpdateAddressRequest request) {
        if (entity == null || request == null) {
            return;
        }
        
        if (request.getStreet() != null) {
            entity.setStreet(request.getStreet());
        }
        if (request.getStreet2() != null) {
            entity.setStreet2(request.getStreet2());
        }
        if (request.getCity() != null) {
            entity.setCity(request.getCity());
        }
        if (request.getState() != null) {
            entity.setState(request.getState());
        }
        if (request.getZipCode() != null) {
            entity.setPostalCode(request.getZipCode());
        }
        if (request.getCountry() != null) {
            entity.setCountry(request.getCountry());
        }
        if (request.getType() != null) {
            entity.setType(request.getType());
        }
        if (request.getIsDefault() != null) {
            entity.setIsDefault(request.getIsDefault());
        }
    }
    
    /**
     * Convert AddressDto to AddressJpaEntity (for updates)
     * @param dto The DTO to convert
     * @param user The user who owns this address
     * @return The converted JPA entity
     */
    public static AddressJpaEntity toEntity(AddressDto dto, UserJpaEntity user) {
        if (dto == null) {
            return null;
        }
        
        AddressJpaEntity entity = new AddressJpaEntity();
        entity.setId(dto.getId());
        entity.setStreet(dto.getStreet());
        entity.setStreet2(dto.getStreet2());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setPostalCode(dto.getPostalCode());
        entity.setCountry(dto.getCountry());
        entity.setType(dto.getType());
        entity.setIsDefault(dto.getIsDefault());
        entity.setUser(user);
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
        
        return entity;
    }
    
    /**
     * Create a CreateAddressRequest from AddressDto
     * @param dto The DTO to convert
     * @return The converted create request
     */
    public static CreateAddressRequest toCreateRequest(AddressDto dto) {
        if (dto == null) {
            return null;
        }
        
        return new CreateAddressRequest(
            dto.getStreet(),
            dto.getStreet2(),
            dto.getCity(),
            dto.getState(),
            dto.getPostalCode(),
            dto.getCountry(),
            dto.getType(),
            dto.getIsDefault()
        );
    }
    
    /**
     * Create an UpdateAddressRequest from AddressDto
     * @param dto The DTO to convert
     * @return The converted update request
     */
    public static UpdateAddressRequest toUpdateRequest(AddressDto dto) {
        if (dto == null) {
            return null;
        }
        
        return new UpdateAddressRequest(
            dto.getStreet(),
            dto.getStreet2(),
            dto.getCity(),
            dto.getState(),
            dto.getPostalCode(),
            dto.getCountry(),
            dto.getType(),
            dto.getIsDefault()
        );
    }
    
    /**
     * Create a minimal AddressDto with just the essential fields
     * @param street The street address
     * @param city The city
     * @param state The state
     * @param zipCode The postal code
     * @param country The country
     * @return The created DTO
     */
    public static AddressDto createMinimalDto(String street, String city, String state, String zipCode, String country) {
        AddressDto dto = new AddressDto();
        dto.setStreet(street);
        dto.setCity(city);
        dto.setState(state);
        dto.setPostalCode(zipCode);
        dto.setCountry(country);
        return dto;
    }
} 