package com.ecommerce.infrastructure.persistence.entity;

import com.ecommerce.domain.user.UserRole;
import com.ecommerce.domain.user.UserStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * JPA entity representing a user in the persistence layer.
 * This entity maps the User domain object to the database table
 * with proper MySQL-specific configurations and security considerations.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_status", columnList = "status"),
        @Index(name = "idx_users_created_at", columnList = "created_at")
    }
)
public class UserJpaEntity extends BaseJpaEntity {
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 60, max = 100, message = "Encoded password must be between 60 and 100 characters")
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;
    
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number must be valid")
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;
    
    @ElementCollection(targetClass = UserRole.class, fetch = FetchType.EAGER)
    @CollectionTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        indexes = @Index(name = "idx_user_roles_user_id", columnList = "user_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20)
    private Set<UserRole> roles = new HashSet<>();
    
    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;
    
    @Column(name = "email_verification_token", length = 100)
    private String emailVerificationToken;
    
    @Column(name = "password_reset_token", length = 100)
    private String passwordResetToken;
    
    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;
    
    @Column(name = "account_locked_until")
    private java.time.LocalDateTime accountLockedUntil;
    
    @Column(name = "last_login_at")
    private java.time.LocalDateTime lastLoginAt;
    
    @Column(name = "last_login_ip", length = 45) // IPv6 support
    private String lastLoginIp;
    
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;
    
    @Column(name = "preferred_language", length = 10)
    private String preferredLanguage = "en";
    
    @Column(name = "timezone", length = 50)
    private String timezone = "UTC";
    
    @Column(name = "marketing_emails_enabled", nullable = false)
    private Boolean marketingEmailsEnabled = true;
    
    @Column(name = "two_factor_enabled", nullable = false)
    private Boolean twoFactorEnabled = false;
    
    @Column(name = "two_factor_secret", length = 100)
    private String twoFactorSecret;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AddressJpaEntity> addresses = new ArrayList<>();
    
    // Default constructor
    public UserJpaEntity() {
        super();
        this.roles.add(UserRole.CUSTOMER);
    }
    
    // Constructor for user registration
    public UserJpaEntity(String firstName, String lastName, String email, String passwordHash) {
        this();
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email.toLowerCase().trim();
        this.passwordHash = passwordHash;
    }
    
    // Business methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isActive() {
        return UserStatus.ACTIVE.equals(this.status);
    }
    
    public boolean isAccountLocked() {
        return accountLockedUntil != null && accountLockedUntil.isAfter(java.time.LocalDateTime.now());
    }
    
    public boolean hasRole(UserRole role) {
        return this.roles.contains(role);
    }
    
    public void addRole(UserRole role) {
        if (role != null) {
            this.roles.add(role);
        }
    }
    
    public void removeRole(UserRole role) {
        this.roles.remove(role);
    }
    
    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
        
        // Lock account after 5 failed attempts for 30 minutes
        if (this.failedLoginAttempts >= 5) {
            this.accountLockedUntil = java.time.LocalDateTime.now().plusMinutes(30);
        }
    }
    
    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.accountLockedUntil = null;
    }
    
    public void updateLastLogin(String ipAddress) {
        this.lastLoginAt = java.time.LocalDateTime.now();
        this.lastLoginIp = ipAddress;
        resetFailedLoginAttempts();
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
        this.email = email != null ? email.toLowerCase().trim() : null;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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
    
    public Set<UserRole> getRoles() {
        return new HashSet<>(roles);
    }
    
    public void setRoles(Set<UserRole> roles) {
        this.roles = roles != null ? new HashSet<>(roles) : new HashSet<>();
    }
    
    public Boolean getEmailVerified() {
        return emailVerified;
    }
    
    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    
    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }
    
    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }
    
    public String getPasswordResetToken() {
        return passwordResetToken;
    }
    
    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }
    
    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }
    
    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }
    
    public java.time.LocalDateTime getAccountLockedUntil() {
        return accountLockedUntil;
    }
    
    public void setAccountLockedUntil(java.time.LocalDateTime accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }
    
    public java.time.LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }
    
    public void setLastLoginAt(java.time.LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
    
    public String getLastLoginIp() {
        return lastLoginIp;
    }
    
    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }
    
    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    
    public String getPreferredLanguage() {
        return preferredLanguage;
    }
    
    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public Boolean getMarketingEmailsEnabled() {
        return marketingEmailsEnabled;
    }
    
    public void setMarketingEmailsEnabled(Boolean marketingEmailsEnabled) {
        this.marketingEmailsEnabled = marketingEmailsEnabled;
    }
    
    public Boolean getTwoFactorEnabled() {
        return twoFactorEnabled;
    }
    
    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }
    
    public String getTwoFactorSecret() {
        return twoFactorSecret;
    }
    
    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
    }
    
    public List<AddressJpaEntity> getAddresses() {
        return new ArrayList<>(addresses);
    }
    
    public void setAddresses(List<AddressJpaEntity> addresses) {
        this.addresses = addresses != null ? new ArrayList<>(addresses) : new ArrayList<>();
    }
    
    public void addAddress(AddressJpaEntity address) {
        if (address != null) {
            this.addresses.add(address);
            address.setUser(this);
        }
    }
    
    public void removeAddress(AddressJpaEntity address) {
        if (address != null) {
            this.addresses.remove(address);
            address.setUser(null);
        }
    }
    
    public AddressJpaEntity getPrimaryAddress() {
        return addresses.stream()
                .filter(AddressJpaEntity::getIsDefault)
                .findFirst()
                .orElse(null);
    }
} 