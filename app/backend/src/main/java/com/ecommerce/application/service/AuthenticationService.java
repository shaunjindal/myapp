package com.ecommerce.application.service;

import com.ecommerce.application.dto.auth.AuthenticationResponse;
import com.ecommerce.application.dto.auth.LoginRequest;
import com.ecommerce.application.dto.auth.UserRegistrationRequest;
import com.ecommerce.domain.user.User;
import com.ecommerce.domain.user.UserRole;
import com.ecommerce.domain.user.UserStatus;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import com.ecommerce.infrastructure.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Service class for handling authentication operations.
 * Provides user registration, login, and token management functionality.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Service
@Transactional
public class AuthenticationService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);
    
    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    
    @Autowired
    public AuthenticationService(
            UserJpaRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }
    
    /**
     * Register a new user account
     * 
     * @param request User registration request
     * @return Authentication response with JWT token
     * @throws IllegalArgumentException if validation fails
     */
    public AuthenticationResponse register(UserRegistrationRequest request) {
        logger.info("Attempting to register user with email: {}", request.getEmail());
        
        // Validate the request
        validateRegistrationRequest(request);
        
        // Check if user already exists
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            logger.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new IllegalArgumentException("Email address is already registered");
        }
        
        try {
            // Create and save new user
            UserJpaEntity user = createUserFromRequest(request);
            user = userRepository.save(user);
            
            logger.info("User registered successfully with ID: {}", user.getId());
            
            // Generate JWT token
            String token = tokenProvider.generateToken(user.getEmail());
            Long expiresIn = tokenProvider.getExpirationTime();
            
            // Create user info for response
            AuthenticationResponse.UserInfo userInfo = createUserInfo(user);
            
            return new AuthenticationResponse(token, expiresIn, userInfo);
            
        } catch (Exception e) {
            logger.error("Registration failed for email: {}", request.getEmail(), e);
            throw new RuntimeException("Registration failed. Please try again.", e);
        }
    }
    
    /**
     * Authenticate user login
     * 
     * @param request Login request
     * @param clientIp Client IP address
     * @return Authentication response with JWT token
     * @throws AuthenticationException if authentication fails
     */
    public AuthenticationResponse login(LoginRequest request, String clientIp) {
        logger.info("Attempting to authenticate user with email: {}", request.getEmail());
        
        try {
            // Find user by email
            Optional<UserJpaEntity> userOptional = userRepository.findByEmailIgnoreCase(request.getEmail());
            if (userOptional.isEmpty()) {
                logger.warn("Login failed: User not found - {}", request.getEmail());
                throw new BadCredentialsException("Invalid email or password");
            }
            
            UserJpaEntity user = userOptional.get();
            
            // Check if account is locked
            if (user.isAccountLocked()) {
                logger.warn("Login failed: Account is locked - {}", request.getEmail());
                throw new BadCredentialsException("Account is temporarily locked. Please try again later.");
            }
            
            // Check if account is active
            if (!user.isActive()) {
                logger.warn("Login failed: Account is not active - {}", request.getEmail());
                throw new BadCredentialsException("Account is not active. Please contact support.");
            }
            
            // Authenticate credentials
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            if (authentication.isAuthenticated()) {
                // Update last login information
                user.updateLastLogin(clientIp);
                userRepository.save(user);
                
                logger.info("User authenticated successfully: {}", request.getEmail());
                
                // Generate JWT token
                String token = tokenProvider.generateToken(user.getEmail());
                Long expiresIn = tokenProvider.getExpirationTime();
                
                // Create user info for response
                AuthenticationResponse.UserInfo userInfo = createUserInfo(user);
                
                return new AuthenticationResponse(token, expiresIn, userInfo);
            }
            
        } catch (AuthenticationException e) {
            // Handle failed authentication
            handleFailedLogin(request.getEmail());
            logger.warn("Authentication failed for email: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        } catch (Exception e) {
            logger.error("Login failed for email: {}", request.getEmail(), e);
            throw new RuntimeException("Login failed. Please try again.", e);
        }
        
        throw new BadCredentialsException("Invalid email or password");
    }
    
    /**
     * Refresh JWT token
     * 
     * @param token Current JWT token
     * @return New authentication response with refreshed token
     */
    public AuthenticationResponse refreshToken(String token) {
        logger.info("Attempting to refresh JWT token");
        
        try {
            String email = tokenProvider.getEmailFromToken(token);
            
            if (email != null && tokenProvider.isTokenValid(token, email)) {
                Optional<UserJpaEntity> userOptional = userRepository.findByEmailIgnoreCase(email);
                
                if (userOptional.isPresent()) {
                    UserJpaEntity user = userOptional.get();
                    
                    // Generate new token
                    String newToken = tokenProvider.generateToken(user.getEmail());
                    Long expiresIn = tokenProvider.getExpirationTime();
                    
                    // Create user info for response
                    AuthenticationResponse.UserInfo userInfo = createUserInfo(user);
                    
                    logger.info("Token refreshed successfully for user: {}", email);
                    return new AuthenticationResponse(newToken, expiresIn, userInfo);
                }
            }
            
            logger.warn("Token refresh failed: Invalid token or user not found");
            throw new BadCredentialsException("Invalid token");
            
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            throw new BadCredentialsException("Token refresh failed");
        }
    }
    
    /**
     * Validate user registration request
     */
    private void validateRegistrationRequest(UserRegistrationRequest request) {
        if (!request.isPasswordMatching()) {
            throw new IllegalArgumentException("Password and confirmation password do not match");
        }
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
    }
    
    /**
     * Create user entity from registration request
     */
    private UserJpaEntity createUserFromRequest(UserRegistrationRequest request) {
        UserJpaEntity user = new UserJpaEntity();
        
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStatus(UserStatus.ACTIVE);
        user.setMarketingEmailsEnabled(request.getMarketingEmailsEnabled());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setTimezone(request.getTimezone());
        user.setEmailVerified(false);
        
        // Set default role
        Set<UserRole> roles = new HashSet<>();
        roles.add(UserRole.CUSTOMER);
        user.setRoles(roles);
        
        return user;
    }
    
    /**
     * Create user info for authentication response
     */
    private AuthenticationResponse.UserInfo createUserInfo(UserJpaEntity user) {
        AuthenticationResponse.UserInfo userInfo = new AuthenticationResponse.UserInfo();
        
        userInfo.setId(user.getId());
        userInfo.setFirstName(user.getFirstName());
        userInfo.setLastName(user.getLastName());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhoneNumber(user.getPhoneNumber());
        userInfo.setStatus(user.getStatus());
        userInfo.setRoles(user.getRoles());
        userInfo.setEmailVerified(user.getEmailVerified());
        userInfo.setProfileImageUrl(user.getProfileImageUrl());
        userInfo.setPreferredLanguage(user.getPreferredLanguage());
        userInfo.setTimezone(user.getTimezone());
        userInfo.setMarketingEmailsEnabled(user.getMarketingEmailsEnabled());
        userInfo.setTwoFactorEnabled(user.getTwoFactorEnabled());
        userInfo.setLastLoginAt(user.getLastLoginAt());
        userInfo.setCreatedAt(user.getCreatedAt());
        
        return userInfo;
    }
    
    /**
     * Handle failed login attempt
     */
    private void handleFailedLogin(String email) {
        Optional<UserJpaEntity> userOptional = userRepository.findByEmailIgnoreCase(email);
        
        if (userOptional.isPresent()) {
            UserJpaEntity user = userOptional.get();
            user.incrementFailedLoginAttempts();
            userRepository.save(user);
            
            logger.info("Failed login attempt recorded for user: {}", email);
        }
    }
} 