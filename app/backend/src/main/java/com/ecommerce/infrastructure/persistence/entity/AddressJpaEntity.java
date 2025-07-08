package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.common.AddressType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * JPA Entity for Address
 * Maps the Address domain entity to the database with proper MySQL optimizations
 * and security considerations.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Entity
@Table(
    name = "addresses",
    indexes = {
        @Index(name = "idx_addresses_user_id", columnList = "user_id"),
        @Index(name = "idx_addresses_type", columnList = "type"),
        @Index(name = "idx_addresses_is_default", columnList = "is_default"),
        @Index(name = "idx_addresses_created_at", columnList = "created_at")
    }
)
public class AddressJpaEntity extends BaseJpaEntity {
    
    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    @Column(name = "street", nullable = false, length = 255)
    private String street;
    
    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    @Column(name = "street2", length = 255)
    private String street2;
    
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(name = "city", nullable = false, length = 100)
    private String city;
    
    @NotBlank(message = "State/Province is required")
    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    @Column(name = "state", nullable = false, length = 100)
    private String state;
    
    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[A-Za-z0-9\\s-]{3,10}$", message = "Invalid postal code format")
    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;
    
    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(name = "country", nullable = false, length = 100)
    private String country;
    
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private AddressType type = AddressType.SHIPPING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;
    
    // Default constructor
    public AddressJpaEntity() {
        super();
    }
    
    // Constructor with required fields
    public AddressJpaEntity(String street, String city, String state, String postalCode, String country, AddressType type, UserJpaEntity user) {
        this();
        this.street = street;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.type = type;
        this.user = user;
    }
    
    // Business methods
    public String getFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(street);
        
        if (street2 != null && !street2.trim().isEmpty()) {
            sb.append(", ").append(street2);
        }
        
        sb.append(", ").append(city)
          .append(", ").append(state)
          .append(" ").append(postalCode)
          .append(", ").append(country);
        
        return sb.toString();
    }
    
    public boolean isShippingEligible() {
        return street != null && !street.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               state != null && !state.trim().isEmpty() &&
               postalCode != null && !postalCode.trim().isEmpty() &&
               country != null && !country.trim().isEmpty();
    }
    
    // Getters and Setters
    public String getStreet() {
        return street;
    }
    
    public void setStreet(String street) {
        this.street = street;
    }
    
    public String getStreet2() {
        return street2;
    }
    
    public void setStreet2(String street2) {
        this.street2 = street2;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public Boolean getIsDefault() {
        return isDefault;
    }
    
    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
    
    public AddressType getType() {
        return type;
    }
    
    public void setType(AddressType type) {
        this.type = type;
    }
    
    public UserJpaEntity getUser() {
        return user;
    }
    
    public void setUser(UserJpaEntity user) {
        this.user = user;
    }
    
    @Override
    public String toString() {
        return "AddressJpaEntity{" +
                "id=" + getId() +
                ", street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", postalCode='" + postalCode + '\'' +
                ", country='" + country + '\'' +
                ", type=" + type +
                ", isDefault=" + isDefault +
                '}';
    }
} 