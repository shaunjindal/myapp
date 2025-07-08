package com.ecommerce.infrastructure.security;

import com.ecommerce.domain.user.UserRole;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * UserDetailsService implementation for Spring Security.
 * Loads user details from the database for authentication and authorization.
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Service
@Transactional(readOnly = true)
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);
    
    private final UserJpaRepository userRepository;
    
    @Autowired
    public UserDetailsServiceImpl(UserJpaRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading user details for email: {}", email);
        
        Optional<UserJpaEntity> userOptional = userRepository.findByEmailIgnoreCase(email);
        
        if (userOptional.isEmpty()) {
            logger.warn("User not found with email: {}", email);
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        
        UserJpaEntity user = userOptional.get();
        
        logger.debug("User found: {} with status: {}", user.getEmail(), user.getStatus());
        
        return User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(mapRolesToAuthorities(user.getRoles()))
                .accountExpired(false)
                .accountLocked(user.isAccountLocked())
                .credentialsExpired(false)
                .disabled(!user.isActive())
                .build();
    }
    
    /**
     * Maps user roles to Spring Security authorities
     * 
     * @param roles Set of user roles
     * @return Collection of GrantedAuthority objects
     */
    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(java.util.Set<UserRole> roles) {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getAuthority()))
                .collect(Collectors.toList());
    }
} 