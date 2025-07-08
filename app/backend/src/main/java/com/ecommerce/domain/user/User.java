package com.ecommerce.domain.user;

import com.ecommerce.domain.common.AuditableEntity;
import com.ecommerce.domain.common.Address;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * User domain entity representing a customer in the e-commerce system
 * 
 * This entity follows DDD principles:
 * - Rich domain model with business logic
 * - Encapsulation of data and behavior
 * - Validation rules embedded in the domain
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public class User extends AuditableEntity {
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number must be valid")
    private String phoneNumber;
    
    private UserStatus status;
    
    private List<Address> addresses;
    
    private List<UserRole> roles;
    
    // Default constructor
    public User() {
        this.addresses = new ArrayList<>();
        this.roles = new ArrayList<>();
        this.status = UserStatus.ACTIVE;
    }
    
    // Constructor for user registration
    public User(String firstName, String lastName, String email, String password) {
        this();
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.roles.add(UserRole.CUSTOMER);
    }
    
    // Business methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isActive() {
        return UserStatus.ACTIVE.equals(this.status);
    }
    
    public void activate() {
        this.status = UserStatus.ACTIVE;
    }
    
    public void deactivate() {
        this.status = UserStatus.INACTIVE;
    }
    
    public void suspend() {
        this.status = UserStatus.SUSPENDED;
    }
    
    public void addAddress(Address address) {
        if (address != null) {
            this.addresses.add(address);
        }
    }
    
    public void removeAddress(Address address) {
        this.addresses.remove(address);
    }
    
    public void addRole(UserRole role) {
        if (role != null && !this.roles.contains(role)) {
            this.roles.add(role);
        }
    }
    
    public void removeRole(UserRole role) {
        this.roles.remove(role);
    }
    
    public boolean hasRole(UserRole role) {
        return this.roles.contains(role);
    }
    
    public Address getPrimaryAddress() {
        return addresses.stream()
                .filter(Address::isPrimary)
                .findFirst()
                .orElse(null);
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public UserStatus getStatus() {
        return status;
    }
    
    public void setStatus(UserStatus status) {
        this.status = status;
    }
    
    public List<Address> getAddresses() {
        return new ArrayList<>(addresses);
    }
    
    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses != null ? new ArrayList<>(addresses) : new ArrayList<>();
    }
    
    public List<UserRole> getRoles() {
        return new ArrayList<>(roles);
    }
    
    public void setRoles(List<UserRole> roles) {
        this.roles = roles != null ? new ArrayList<>(roles) : new ArrayList<>();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(getId(), user.getId()) &&
               Objects.equals(email, user.email);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(getId(), email);
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + getId() +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", status=" + status +
                ", roles=" + roles +
                '}';
    }
} 