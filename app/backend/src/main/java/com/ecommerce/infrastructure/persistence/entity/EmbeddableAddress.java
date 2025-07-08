package com.ecommerce.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Embeddable Address class for order addresses
 * Used when we need to store address information as part of another entity
 * (like billing/shipping addresses in orders)
 */
@Embeddable
public class EmbeddableAddress {

    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Column(name = "first_name", length = 100)
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Column(name = "last_name", length = 100)
    private String lastName;

    @Size(max = 100, message = "Company name must not exceed 100 characters")
    @Column(name = "company", length = 100)
    private String company;

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

    @Pattern(regexp = "^[+]?[0-9\\s-()]{10,20}$", message = "Invalid phone number format")
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    // Default constructor
    public EmbeddableAddress() {
    }

    // Constructor with required fields
    public EmbeddableAddress(String firstName, String lastName, String street, String city, 
                           String state, String postalCode, String country) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
    }

    // Constructor from AddressJpaEntity
    public EmbeddableAddress(AddressJpaEntity addressEntity) {
        if (addressEntity != null) {
            this.street = addressEntity.getStreet();
            this.street2 = addressEntity.getStreet2();
            this.city = addressEntity.getCity();
            this.state = addressEntity.getState();
            this.postalCode = addressEntity.getPostalCode();
            this.country = addressEntity.getCountry();
            
            // Extract firstName and lastName from user if available
            if (addressEntity.getUser() != null) {
                this.firstName = addressEntity.getUser().getFirstName();
                this.lastName = addressEntity.getUser().getLastName();
            }
        }
    }

    // Business methods
    public String getFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        
        if (firstName != null && !firstName.trim().isEmpty()) {
            sb.append(firstName);
            if (lastName != null && !lastName.trim().isEmpty()) {
                sb.append(" ").append(lastName);
            }
            sb.append("\n");
        }
        
        if (company != null && !company.trim().isEmpty()) {
            sb.append(company).append("\n");
        }
        
        sb.append(street);
        
        if (street2 != null && !street2.trim().isEmpty()) {
            sb.append("\n").append(street2);
        }
        
        sb.append("\n").append(city)
          .append(", ").append(state)
          .append(" ").append(postalCode)
          .append("\n").append(country);
        
        return sb.toString();
    }

    public String getFullName() {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.trim().isEmpty()) {
            sb.append(firstName);
        }
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(lastName);
        }
        return sb.toString();
    }

    public boolean isComplete() {
        return street != null && !street.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               state != null && !state.trim().isEmpty() &&
               postalCode != null && !postalCode.trim().isEmpty() &&
               country != null && !country.trim().isEmpty();
    }

    // Getters and Setters
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public String toString() {
        return "EmbeddableAddress{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", postalCode='" + postalCode + '\'' +
                ", country='" + country + '\'' +
                '}';
    }
} 