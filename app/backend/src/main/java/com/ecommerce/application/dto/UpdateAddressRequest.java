package com.ecommerce.application.dto;

import com.ecommerce.domain.common.AddressType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for address update requests.
 * Contains optional fields for updating an existing address.
 * All fields are optional to support partial updates.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class UpdateAddressRequest {
    
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    private String street;
    
    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String street2;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    private String state;
    
    @Pattern(regexp = "^[A-Za-z0-9\\s-]{3,10}$", message = "Invalid postal code format")
    private String zipCode;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    private AddressType type;
    
    private Boolean isDefault;
    
    // Default constructor
    public UpdateAddressRequest() {
    }
    
    // Constructor with all fields
    public UpdateAddressRequest(String street, String street2, String city, String state, 
                               String zipCode, String country, AddressType type, Boolean isDefault) {
        this.street = street;
        this.street2 = street2;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.type = type;
        this.isDefault = isDefault;
    }
    
    // Business methods
    public String getFormattedAddress() {
        if (street == null || city == null || state == null || zipCode == null || country == null) {
            return null; // Cannot format partial address
        }
        
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
    
    public boolean hasAddressFields() {
        return street != null || street2 != null || city != null || 
               state != null || zipCode != null || country != null;
    }
    
    public boolean hasMetadataFields() {
        return type != null || isDefault != null;
    }
    
    public boolean isEmpty() {
        return street == null && street2 == null && city == null && 
               state == null && zipCode == null && country == null &&
               type == null && isDefault == null;
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
        return "UpdateAddressRequest{" +
                "street='" + street + '\'' +
                ", street2='" + street2 + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zipCode='" + zipCode + '\'' +
                ", country='" + country + '\'' +
                ", type=" + type +
                ", isDefault=" + isDefault +
                '}';
    }
} 