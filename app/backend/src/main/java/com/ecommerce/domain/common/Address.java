package com.ecommerce.domain.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Objects;

/**
 * Value object representing a physical address
 * 
 * This is an immutable value object following DDD principles:
 * - Encapsulates address-related data and behavior
 * - Provides validation for address components
 * - Immutable to ensure data integrity
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class Address {
    
    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    private final String street;
    
    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private final String street2;
    
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private final String city;
    
    @NotBlank(message = "State/Province is required")
    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    private final String state;
    
    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[A-Za-z0-9\\s-]{3,10}$", message = "Invalid postal code format")
    private final String postalCode;
    
    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private final String country;
    
    private final boolean isPrimary;
    
    private final AddressType type;
    
    // Private constructor for builder pattern
    private Address(Builder builder) {
        this.street = builder.street;
        this.street2 = builder.street2;
        this.city = builder.city;
        this.state = builder.state;
        this.postalCode = builder.postalCode;
        this.country = builder.country;
        this.isPrimary = builder.isPrimary;
        this.type = builder.type;
    }
    
    /**
     * Get the full formatted address as a single string
     * @return formatted address string
     */
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
    
    /**
     * Check if this address can be used for shipping
     * @return true if address is suitable for shipping
     */
    public boolean isShippingEligible() {
        return street != null && !street.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               state != null && !state.trim().isEmpty() &&
               postalCode != null && !postalCode.trim().isEmpty() &&
               country != null && !country.trim().isEmpty();
    }
    
    // Getters
    public String getStreet() {
        return street;
    }
    
    public String getStreet2() {
        return street2;
    }
    
    public String getCity() {
        return city;
    }
    
    public String getState() {
        return state;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public boolean isPrimary() {
        return isPrimary;
    }
    
    public AddressType getType() {
        return type;
    }
    
    // Builder pattern for immutable object creation
    public static class Builder {
        private String street;
        private String street2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private boolean isPrimary = false;
        private AddressType type = AddressType.BILLING;
        
        public Builder street(String street) {
            this.street = street;
            return this;
        }
        
        public Builder street2(String street2) {
            this.street2 = street2;
            return this;
        }
        
        public Builder city(String city) {
            this.city = city;
            return this;
        }
        
        public Builder state(String state) {
            this.state = state;
            return this;
        }
        
        public Builder postalCode(String postalCode) {
            this.postalCode = postalCode;
            return this;
        }
        
        public Builder country(String country) {
            this.country = country;
            return this;
        }
        
        public Builder isPrimary(boolean isPrimary) {
            this.isPrimary = isPrimary;
            return this;
        }
        
        public Builder type(AddressType type) {
            this.type = type;
            return this;
        }
        
        public Address build() {
            return new Address(this);
        }
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return Objects.equals(street, address.street) &&
               Objects.equals(street2, address.street2) &&
               Objects.equals(city, address.city) &&
               Objects.equals(state, address.state) &&
               Objects.equals(postalCode, address.postalCode) &&
               Objects.equals(country, address.country) &&
               Objects.equals(type, address.type);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(street, street2, city, state, postalCode, country, type);
    }
    
    @Override
    public String toString() {
        return "Address{" +
                "street='" + street + '\'' +
                ", street2='" + street2 + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", postalCode='" + postalCode + '\'' +
                ", country='" + country + '\'' +
                ", isPrimary=" + isPrimary +
                ", type=" + type +
                '}';
    }
} 