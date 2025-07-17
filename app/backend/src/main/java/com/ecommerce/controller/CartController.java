package com.ecommerce.controller;

import com.ecommerce.application.dto.*;
import com.ecommerce.application.service.CartService;
import com.ecommerce.infrastructure.persistence.entity.CartJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import com.ecommerce.infrastructure.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Cart management
 * 
 * This controller handles cart operations for both authenticated and guest users:
 * - Cart creation and retrieval
 * - Adding, updating, and removing items
 * - Cart validation and checkout
 * - Guest cart merging on login
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);
    
    private final CartService cartService;
    private final CartMapper cartMapper;
    private final JwtTokenProvider tokenProvider;
    private final UserJpaRepository userRepository;
    
    @Autowired
    public CartController(CartService cartService, CartMapper cartMapper, JwtTokenProvider tokenProvider, UserJpaRepository userRepository) {
        this.cartService = cartService;
        this.cartMapper = cartMapper;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    /**
     * Get current cart for user or guest
     */
    @GetMapping
    public ResponseEntity<CartDto> getCart(HttpServletRequest request) {
        try {
            logger.debug("Getting cart for request");
            
            CartJpaEntity cart = getOrCreateCart(request);
            CartDto cartDto = cartMapper.toDto(cart);
            
            return ResponseEntity.ok(cartDto);
            
        } catch (Exception e) {
            logger.error("Failed to get cart", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Add item to cart
     */
    @PostMapping("/items")
    public ResponseEntity<CartDto> addToCart(@Valid @RequestBody AddToCartRequest request, HttpServletRequest httpRequest) {
        try {
            logger.debug("Adding item to cart: {}", request);
            
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            
            // Use session and device fingerprint from request if provided, otherwise extract from HTTP request
            String sessionId = StringUtils.hasText(request.getSessionId()) ? 
                    request.getSessionId() : getSessionId(httpRequest);
            String deviceFingerprint = StringUtils.hasText(request.getDeviceFingerprint()) ? 
                    request.getDeviceFingerprint() : cartService.generateDeviceFingerprint(httpRequest);
            
            CartJpaEntity updatedCart = cartService.addItemToCart(cart.getId(), request.getProductId(), request.getQuantity(), request.getCustomLength());
            CartDto cartDto = cartMapper.toDto(updatedCart);
            
            logger.info("Item added to cart successfully: product={}, quantity={}, customLength={}", 
                       request.getProductId(), request.getQuantity(), request.getCustomLength());
            return ResponseEntity.ok(cartDto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for adding item to cart: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Failed to add item to cart", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Update cart item quantity
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateCartItem(
            @PathVariable String itemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            HttpServletRequest httpRequest) {
        try {
            logger.debug("Updating cart item: {} with request: {}", itemId, request);
            
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            CartJpaEntity updatedCart = cartService.updateCartItemQuantity(cart.getId(), itemId, request.getQuantity());
            CartDto cartDto = cartMapper.toDto(updatedCart);
            
            logger.info("Cart item updated successfully: item={}, quantity={}", itemId, request.getQuantity());
            return ResponseEntity.ok(cartDto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for updating cart item: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Failed to update cart item", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Remove item from cart
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable String itemId, HttpServletRequest httpRequest) {
        try {
            logger.debug("Removing item from cart: {}", itemId);
            
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            CartJpaEntity updatedCart = cartService.removeItemFromCart(cart.getId(), itemId);
            CartDto cartDto = cartMapper.toDto(updatedCart);
            
            logger.info("Item removed from cart successfully: item={}", itemId);
            return ResponseEntity.ok(cartDto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for removing cart item: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Failed to remove cart item", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Clear all items from cart
     */
    @DeleteMapping
    public ResponseEntity<CartDto> clearCart(HttpServletRequest httpRequest) {
        try {
            logger.debug("Clearing cart");
            
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            CartJpaEntity clearedCart = cartService.clearCart(cart.getId());
            CartDto cartDto = cartMapper.toDto(clearedCart);
            
            logger.info("Cart cleared successfully");
            return ResponseEntity.ok(cartDto);
            
        } catch (Exception e) {
            logger.error("Failed to clear cart", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Validate cart items
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCart(HttpServletRequest httpRequest) {
        try {
            logger.debug("Validating cart");
            
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            Map<String, Object> validation = cartService.validateCart(cart.getId());
            
            logger.info("Cart validation completed: valid={}", validation.get("valid"));
            return ResponseEntity.ok(validation);
            
        } catch (Exception e) {
            logger.error("Failed to validate cart", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Merge guest cart with user cart (called after login)
     */
    @PostMapping("/merge")
    public ResponseEntity<CartDto> mergeCart(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String userId = getCurrentUserId();
            if (userId == null) {
                logger.warn("Cannot merge cart: user not authenticated");
                return ResponseEntity.status(401).build();
            }
            
            String sessionId = request.get("sessionId");
            String deviceFingerprint = request.get("deviceFingerprint");
            
            if (!StringUtils.hasText(sessionId)) {
                sessionId = getSessionId(httpRequest);
            }
            if (!StringUtils.hasText(deviceFingerprint)) {
                deviceFingerprint = getDeviceFingerprint(httpRequest);
            }
            
            logger.debug("Merging guest cart for user: {} with session: {}", userId, sessionId);
            
            CartJpaEntity mergedCart = cartService.mergeGuestCartWithUserCart(userId, sessionId, deviceFingerprint);
            CartDto cartDto = cartMapper.toDto(mergedCart);
            
            logger.info("Cart merged successfully for user: {}", userId);
            return ResponseEntity.ok(cartDto);
            
        } catch (Exception e) {
            logger.error("Failed to merge cart", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Apply discount to cart
     */
    @PostMapping("/discount")
    public ResponseEntity<CartDto> applyDiscount(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        try {
            String discountCode = (String) request.get("code");
            BigDecimal discountAmount = new BigDecimal(request.get("amount").toString());
            
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            CartJpaEntity updatedCart = cartService.applyDiscountToCart(cart.getId(), discountCode, discountAmount);
            CartDto cartDto = cartMapper.toDto(updatedCart);
            
            logger.info("Discount applied to cart: code={}, amount={}", discountCode, discountAmount);
            return ResponseEntity.ok(cartDto);
            
        } catch (Exception e) {
            logger.error("Failed to apply discount", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Remove discount from cart
     */
    @DeleteMapping("/discount")
    public ResponseEntity<CartDto> removeDiscount(HttpServletRequest httpRequest) {
        try {
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            CartJpaEntity updatedCart = cartService.removeDiscountFromCart(cart.getId());
            CartDto cartDto = cartMapper.toDto(updatedCart);
            
            logger.info("Discount removed from cart");
            return ResponseEntity.ok(cartDto);
            
        } catch (Exception e) {
            logger.error("Failed to remove discount", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get cart summary (minimal information for performance)
     */
    @GetMapping("/summary")
    public ResponseEntity<CartDto> getCartSummary(HttpServletRequest httpRequest) {
        try {
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            CartDto cartDto = cartMapper.toSummaryDto(cart);
            
            return ResponseEntity.ok(cartDto);
            
        } catch (Exception e) {
            logger.error("Failed to get cart summary", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Checkout cart
     */
    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkout(HttpServletRequest httpRequest) {
        try {
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            
            // Validate cart before checkout
            Map<String, Object> validation = cartService.validateCart(cart.getId());
            if (!(Boolean) validation.get("valid")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Cart validation failed");
                response.put("validation", validation);
                return ResponseEntity.badRequest().body(response);
            }
            
            CartJpaEntity checkedOutCart = cartService.checkoutCart(cart.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cartId", checkedOutCart.getId());
            response.put("message", "Cart checked out successfully");
            
            logger.info("Cart checked out successfully: {}", cart.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to checkout cart", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Calculate payment components for cart
     */
    @PostMapping("/calculate-components")
    public ResponseEntity<CartDto> calculatePaymentComponents(
            @RequestBody(required = false) Map<String, Object> request, 
            HttpServletRequest httpRequest) {
        try {
            String addressId = request != null ? (String) request.get("addressId") : null;
            String shippingMethod = request != null ? (String) request.get("shippingMethod") : null;
            String discountCode = request != null ? (String) request.get("discountCode") : null;
            
            CartJpaEntity cart = getOrCreateCart(httpRequest);
            CartJpaEntity updatedCart = cartService.calculatePaymentComponents(cart.getId(), addressId, shippingMethod, discountCode);
            CartDto cartDto = cartMapper.toDto(updatedCart);
            
            logger.info("Payment components calculated for cart: {}", cart.getId());
            return ResponseEntity.ok(cartDto);
            
        } catch (Exception e) {
            logger.error("Failed to calculate payment components", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get cart statistics (admin endpoint)
     */
    @GetMapping("/admin/statistics")
    public ResponseEntity<Map<String, Object>> getCartStatistics() {
        try {
            Map<String, Object> stats = cartService.getCartStatistics();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Failed to get cart statistics", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    // Helper methods
    
    /**
     * Get or create cart based on user authentication status
     */
    private CartJpaEntity getOrCreateCart(HttpServletRequest request) {
        String userId = getCurrentUserId();
        
        if (userId != null) {
            // Authenticated user
            return cartService.getOrCreateUserCart(userId);
        } else {
            // Guest user
            String sessionId = getSessionId(request);
            String deviceFingerprint = getDeviceFingerprint(request);
            return cartService.getOrCreateGuestCart(sessionId, deviceFingerprint, request);
        }
    }
    
    /**
     * Get current authenticated user ID
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            
            // The authentication name is the email, we need to get the user ID from the database
            String email = authentication.getName();
            
            // Look up user by email to get the user ID
            try {
                Optional<UserJpaEntity> userOptional = userRepository.findByEmailIgnoreCase(email);
                if (userOptional.isPresent()) {
                    return userOptional.get().getId();
                }
            } catch (Exception e) {
                logger.warn("Failed to lookup user by email: {}", email, e);
            }
        }
        return null;
    }
    
    /**
     * Get session ID from HTTP request
     */
    private String getSessionId(HttpServletRequest request) {
        // First try to get from custom header
        String sessionId = request.getHeader("X-Session-ID");
        if (StringUtils.hasText(sessionId)) {
            return sessionId;
        }
        
        // Fall back to HTTP session
        HttpSession session = request.getSession(true);
        return session.getId();
    }
    
    /**
     * Get device fingerprint from HTTP request
     */
    private String getDeviceFingerprint(HttpServletRequest request) {
        // First try to get from custom header
        String deviceFingerprint = request.getHeader("X-Device-Fingerprint");
        if (StringUtils.hasText(deviceFingerprint)) {
            return deviceFingerprint;
        }
        
        // Fall back to service method
        return cartService.generateDeviceFingerprint(request);
    }
} 