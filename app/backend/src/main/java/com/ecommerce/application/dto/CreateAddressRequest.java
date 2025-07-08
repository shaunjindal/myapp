package com.ecommerce.application.dto;

import com.ecommerce.domain.common.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for address creation requests.
 * Contains all necessary information for creating a new address
 * with proper validation constraints.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class CreateAddressRequest {
    
    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    private String street;
    
    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String street2;
    
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @NotBlank(message = "State/Province is required")
    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    private String state;
    
    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[A-Za-z0-9\\s-]{3,10}$", message = "Invalid postal code format")
    private String zipCode;
    
    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    private AddressType type;
    
    private Boolean isDefault;
    
    // Default constructor
    public CreateAddressRequest() {
        this.type = AddressType.SHIPPING;
        this.isDefault = false;
        this.country = "USA";
    }
    
    // Constructor with required fields
    public CreateAddressRequest(String street, String city, String state, String zipCode, String country) {
        this();
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
    }
    
    // Full constructor
    public CreateAddressRequest(String street, String street2, String city, String state, 
                               String zipCode, String country, AddressType type, Boolean isDefault) {
        this.street = street;
        this.street2 = street2;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.type = type != null ? type : AddressType.SHIPPING;
        this.isDefault = isDefault != null ? isDefault : false;
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
          .append(" ").append(zipCode)
          .append(", ").append(country);
        
        return sb.toString();
    }
    
    public boolean isValid() {
        return street != null && !street.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               state != null && !state.trim().isEmpty() &&
               zipCode != null && !zipCode.trim().isEmpty() &&
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
    
    public String getZipCode() {
        return zipCode;
    }
    
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public AddressType getType() {
        return type;
    }
    
    public void setType(AddressType type) {
        this.type = type;
    }
    
    public Boolean getIsDefault() {
        return isDefault;
    }
    
    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
    
    @Override
    public String toString() {
        return "CreateAddressRequest{" +
                "street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zipCode='" + zipCode + '\'' +
                ", country='" + country + '\'' +
                ", type=" + type +
                ", isDefault=" + isDefault +
                '}';
    }
} 