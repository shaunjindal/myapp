package com.ecommerce.application.dto;

import com.ecommerce.domain.common.AddressType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Address entities.
 * Handles communication between frontend and backend for address operations.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class AddressDto {
    
    private String id;
    
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
    
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    @Size(max = 100, message = "Company name must not exceed 100 characters")
    private String company;
    
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
    private String postalCode;
    
    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    @Pattern(regexp = "^[+]?[0-9\\s-()]{10,20}$", message = "Invalid phone number format")
    private String phone;
    
    private AddressType type;
    
    private Boolean isDefault;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public AddressDto() {
        this.type = AddressType.SHIPPING;
        this.isDefault = false;
    }
    
    // Constructor with required fields
    public AddressDto(String street, String city, String state, String zipCode, String country) {
        this();
        this.street = street;
        this.city = city;
        this.state = state;
        this.postalCode = zipCode;
        this.country = country;
    }
    
    // Full constructor
    public AddressDto(String id, String street, String street2, String city, String state, 
                     String zipCode, String country, AddressType type, Boolean isDefault,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.street = street;
        this.street2 = street2;
        this.city = city;
        this.state = state;
        this.postalCode = zipCode;
        this.country = country;
        this.type = type;
        this.isDefault = isDefault;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
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
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "AddressDto{" +
                "id='" + id + '\'' +
                ", street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zipCode='" + postalCode + '\'' +
                ", country='" + country + '\'' +
                ", type=" + type +
                ", isDefault=" + isDefault +
                '}';
    }
} 