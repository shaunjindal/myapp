package com.ecommerce.infrastructure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT token provider for generating, validating, and extracting claims from JWT tokens.
 * Handles all JWT operations including token generation, validation, and user extraction.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Component
public class JwtTokenProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private Long jwtExpirationInMs;
    
    private static final String AUTHORITIES_KEY = "authorities";
    private static final String USER_ID_KEY = "userId";
    private static final String FULL_NAME_KEY = "fullName";
    
    /**
     * Generate JWT token for user
     * 
     * @param email User email
     * @return JWT token string
     */
    public String generateToken(String email) {
        return generateToken(email, new HashMap<>());
    }
    
    /**
     * Generate JWT token with additional claims
     * 
     * @param email User email
     * @param extraClaims Additional claims to include in token
     * @return JWT token string
     */
    public String generateToken(String email, Map<String, Object> extraClaims) {
        logger.debug("Generating JWT token for user: {}", email);
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);
        
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    /**
     * Extract email from JWT token
     * 
     * @param token JWT token
     * @return User email
     */
    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }
    
    /**
     * Extract user ID from JWT token
     * 
     * @param token JWT token
     * @return User ID
     */
    public String getUserIdFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.get(USER_ID_KEY, String.class));
    }
    
    /**
     * Extract full name from JWT token
     * 
     * @param token JWT token
     * @return User full name
     */
    public String getFullNameFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.get(FULL_NAME_KEY, String.class));
    }
    
    /**
     * Extract authorities from JWT token
     * 
     * @param token JWT token
     * @return User authorities
     */
    public String getAuthoritiesFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.get(AUTHORITIES_KEY, String.class));
    }
    
    /**
     * Extract expiration date from JWT token
     * 
     * @param token JWT token
     * @return Expiration date
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }
    
    /**
     * Extract issued date from JWT token
     * 
     * @param token JWT token
     * @return Issued date
     */
    public Date getIssuedDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getIssuedAt);
    }
    
    /**
     * Extract specific claim from JWT token
     * 
     * @param token JWT token
     * @param claimsResolver Function to extract claim
     * @param <T> Type of claim
     * @return Extracted claim
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * Check if JWT token is expired
     * 
     * @param token JWT token
     * @return true if token is expired, false otherwise
     */
    public Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
    
    /**
     * Validate JWT token
     * 
     * @param token JWT token
     * @param email User email to validate against
     * @return true if token is valid, false otherwise
     */
    public Boolean isTokenValid(String token, String email) {
        try {
            final String tokenEmail = getEmailFromToken(token);
            return (tokenEmail.equals(email) && !isTokenExpired(token));
        } catch (Exception e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Validate JWT token structure and signature
     * 
     * @param token JWT token
     * @return true if token is valid, false otherwise
     */
    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
    
    /**
     * Get JWT expiration time in milliseconds
     * 
     * @return Expiration time in milliseconds
     */
    public Long getExpirationTime() {
        return jwtExpirationInMs;
    }
    
    /**
     * Get remaining time until token expires
     * 
     * @param token JWT token
     * @return Remaining time in milliseconds
     */
    public Long getRemainingTime(String token) {
        Date expirationDate = getExpirationDateFromToken(token);
        return expirationDate.getTime() - new Date().getTime();
    }
    
    /**
     * Check if token needs refresh (expires within 5 minutes)
     * 
     * @param token JWT token
     * @return true if token needs refresh, false otherwise
     */
    public Boolean needsRefresh(String token) {
        Long remainingTime = getRemainingTime(token);
        return remainingTime < 300000; // 5 minutes in milliseconds
    }
    
    /**
     * Extract all claims from JWT token
     * 
     * @param token JWT token
     * @return Claims object
     */
    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token is expired");
            throw e;
        } catch (Exception e) {
            logger.error("Error parsing JWT token: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid JWT token");
        }
    }
    
    /**
     * Get signing key for JWT operations
     * 
     * @return SecretKey for signing
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * Create token with user details
     * 
     * @param email User email
     * @param userId User ID
     * @param fullName User full name
     * @param authorities User authorities
     * @return JWT token string
     */
    public String createToken(String email, String userId, String fullName, String authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(USER_ID_KEY, userId);
        claims.put(FULL_NAME_KEY, fullName);
        claims.put(AUTHORITIES_KEY, authorities);
        
        return generateToken(email, claims);
    }
} 