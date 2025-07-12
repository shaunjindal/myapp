package com.ecommerce.application.service;

import com.ecommerce.domain.cart.Cart;
import com.ecommerce.domain.cart.CartItem;
import com.ecommerce.domain.cart.CartStatus;
import com.ecommerce.domain.product.Product;
import com.ecommerce.domain.user.User;
import com.ecommerce.infrastructure.persistence.entity.*;
import com.ecommerce.infrastructure.persistence.repository.CartJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.CartItemJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.ProductJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for Cart operations
 * 
 * This service handles:
 * - Cart creation and management for both authenticated and guest users
 * - Cart item operations (add, update, remove)
 * - Cart merging when guest users log in
 * - Cart cleanup and maintenance
 * - Session-based cart identification
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Service
@Transactional
public class CartService {
    
    private static final Logger logger = LoggerFactory.getLogger(CartService.class);
    
    private final CartJpaRepository cartRepository;
    private final CartItemJpaRepository cartItemRepository;
    private final ProductJpaRepository productRepository;
    private final UserJpaRepository userRepository;
    private final PaymentComponentService paymentComponentService;
    
    @Autowired
    public CartService(
            CartJpaRepository cartRepository,
            CartItemJpaRepository cartItemRepository,
            ProductJpaRepository productRepository,
            UserJpaRepository userRepository,
            PaymentComponentService paymentComponentService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.paymentComponentService = paymentComponentService;
    }
    
    /**
     * Get or create cart for authenticated user
     */
    public CartJpaEntity getOrCreateUserCart(String userId) {
        logger.debug("Getting or creating cart for user: {}", userId);
        
        Optional<CartJpaEntity> existingCart = cartRepository.findActiveCartByUserId(userId);
        if (existingCart.isPresent()) {
            CartJpaEntity cart = existingCart.get();
            cart.updateLastActivity();
            return cartRepository.save(cart);
        }
        
        // Create new cart for user
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        
        CartJpaEntity newCart = new CartJpaEntity(user);
        newCart = cartRepository.save(newCart);
        
        logger.info("Created new cart for user: {} with cart ID: {}", userId, newCart.getId());
        return newCart;
    }
    
    /**
     * Get or create cart for guest user
     */
    public CartJpaEntity getOrCreateGuestCart(String sessionId, String deviceFingerprint, HttpServletRequest request) {
        logger.debug("Getting or creating guest cart for session: {}, fingerprint: {}", sessionId, deviceFingerprint);
        
        // Try to find existing active guest cart
        Optional<CartJpaEntity> existingCart = cartRepository.findActiveGuestCart(sessionId, deviceFingerprint);
        if (existingCart.isPresent()) {
            CartJpaEntity cart = existingCart.get();
            cart.updateLastActivity();
            return cartRepository.save(cart);
        }
        
        // Try to find by device fingerprint (in case session changed)
        List<CartJpaEntity> guestCarts = cartRepository.findActiveGuestCartsByDeviceFingerprint(deviceFingerprint);
        if (!guestCarts.isEmpty()) {
            CartJpaEntity cart = guestCarts.get(0); // Get most recent
            cart.setSessionId(sessionId);
            cart.updateLastActivity();
            return cartRepository.save(cart);
        }
        
        // Create new guest cart
        CartJpaEntity newCart = new CartJpaEntity(sessionId, deviceFingerprint);
        if (request != null) {
            newCart.setIpAddress(getClientIpAddress(request));
            newCart.setUserAgent(request.getHeader("User-Agent"));
        }
        newCart = cartRepository.save(newCart);
        
        logger.info("Created new guest cart with session: {} and cart ID: {}", sessionId, newCart.getId());
        return newCart;
    }
    
    /**
     * Get cart by ID with items
     */
    public Optional<CartJpaEntity> getCartWithItems(String cartId) {
        return cartRepository.findCartWithItems(cartId);
    }
    
    /**
     * Add item to cart
     */
    public CartJpaEntity addItemToCart(String cartId, String productId, int quantity) {
        logger.debug("Adding item to cart: {} product: {} quantity: {}", cartId, productId, quantity);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        if (cart.getStatus() != CartStatus.ACTIVE) {
            throw new IllegalStateException("Cannot add items to inactive cart");
        }
        
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        
        // Check if item already exists in cart
        Optional<CartItemJpaEntity> existingItem = cartItemRepository.findByCartIdAndProductId(cartId, productId);
        
        if (existingItem.isPresent()) {
            // Update existing item quantity
            CartItemJpaEntity item = existingItem.get();
            item.updateQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Create new cart item
            CartItemJpaEntity newItem = new CartItemJpaEntity(cart, product, quantity, product.getPrice());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }
        
        cart.updateLastActivity();
        return cartRepository.save(cart);
    }
    
    /**
     * Update cart item quantity
     */
    public CartJpaEntity updateCartItemQuantity(String cartId, String itemId, int quantity) {
        logger.debug("Updating cart item quantity: {} to {}", itemId, quantity);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        CartItemJpaEntity item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));
        
        if (!item.getCart().getId().equals(cartId)) {
            throw new IllegalArgumentException("Cart item does not belong to this cart");
        }
        
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            item.updateQuantity(quantity);
            cartItemRepository.save(item);
        }
        
        cart.updateLastActivity();
        return cartRepository.save(cart);
    }
    
    /**
     * Remove item from cart
     */
    public CartJpaEntity removeItemFromCart(String cartId, String itemId) {
        logger.debug("Removing item from cart: {} item: {}", cartId, itemId);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        CartItemJpaEntity item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));
        
        if (!item.getCart().getId().equals(cartId)) {
            throw new IllegalArgumentException("Cart item does not belong to this cart");
        }
        
        cart.removeItem(item);
        cartItemRepository.delete(item);
        
        cart.updateLastActivity();
        return cartRepository.save(cart);
    }
    
    /**
     * Clear all items from cart
     */
    public CartJpaEntity clearCart(String cartId) {
        logger.debug("Clearing cart: {}", cartId);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        cartItemRepository.deleteByCartId(cartId);
        cart.clearItems();
        cart.updateLastActivity();
        
        return cartRepository.save(cart);
    }
    
    /**
     * Merge guest cart with user cart on login
     */
    public CartJpaEntity mergeGuestCartWithUserCart(String userId, String sessionId, String deviceFingerprint) {
        logger.debug("Merging guest cart with user cart for user: {}", userId);
        
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        
        // Get or create user cart
        CartJpaEntity userCart = getOrCreateUserCart(userId);
        
        // Find guest cart(s) to merge
        List<CartJpaEntity> guestCarts = new ArrayList<>();
        
        // Look for session-based cart
        Optional<CartJpaEntity> sessionCart = cartRepository.findActiveCartBySessionId(sessionId);
        sessionCart.ifPresent(guestCarts::add);
        
        // Look for device fingerprint-based carts
        List<CartJpaEntity> deviceCarts = cartRepository.findActiveGuestCartsByDeviceFingerprint(deviceFingerprint);
        guestCarts.addAll(deviceCarts);
        
        // Remove duplicates
        guestCarts = guestCarts.stream().distinct().collect(Collectors.toList());
        
        if (guestCarts.isEmpty()) {
            logger.debug("No guest carts found to merge for user: {}", userId);
            return userCart;
        }
        
        // Merge each guest cart
        for (CartJpaEntity guestCart : guestCarts) {
            mergeCartItems(userCart, guestCart);
            
            // Mark guest cart as merged/expired
            guestCart.setStatus(CartStatus.CHECKED_OUT);
            cartRepository.save(guestCart);
        }
        
        userCart.updateLastActivity();
        CartJpaEntity mergedCart = cartRepository.save(userCart);
        
        logger.info("Successfully merged {} guest carts with user cart: {}", guestCarts.size(), userId);
        return mergedCart;
    }
    
    /**
     * Merge items from source cart to target cart
     */
    private void mergeCartItems(CartJpaEntity targetCart, CartJpaEntity sourceCart) {
        List<CartItemJpaEntity> sourceItems = cartItemRepository.findByCartIdWithProduct(sourceCart.getId());
        
        for (CartItemJpaEntity sourceItem : sourceItems) {
            Optional<CartItemJpaEntity> existingItem = cartItemRepository.findByCartIdAndProductId(
                    targetCart.getId(), sourceItem.getProduct().getId());
            
            if (existingItem.isPresent()) {
                // Merge quantities
                CartItemJpaEntity targetItem = existingItem.get();
                targetItem.updateQuantity(targetItem.getQuantity() + sourceItem.getQuantity());
                cartItemRepository.save(targetItem);
            } else {
                // Create new item in target cart
                CartItemJpaEntity newItem = new CartItemJpaEntity(
                        targetCart, sourceItem.getProduct(), sourceItem.getQuantity(), sourceItem.getUnitPrice());
                newItem.setDiscountAmount(sourceItem.getDiscountAmount());
                newItem.setIsGift(sourceItem.getIsGift());
                newItem.setGiftMessage(sourceItem.getGiftMessage());
                targetCart.addItem(newItem);
                cartItemRepository.save(newItem);
            }
        }
    }
    
    /**
     * Apply discount to cart
     */
    public CartJpaEntity applyDiscountToCart(String cartId, String discountCode, BigDecimal discountAmount) {
        logger.debug("Applying discount to cart: {} code: {} amount: {}", cartId, discountCode, discountAmount);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        cart.applyDiscount(discountCode, discountAmount);
        cart.updateLastActivity();
        
        return cartRepository.save(cart);
    }
    
    /**
     * Remove discount from cart
     */
    public CartJpaEntity removeDiscountFromCart(String cartId) {
        logger.debug("Removing discount from cart: {}", cartId);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        cart.removeDiscount();
        cart.updateLastActivity();
        
        return cartRepository.save(cart);
    }
    
    /**
     * Calculate tax and shipping for cart
     */
    public CartJpaEntity calculateTaxAndShipping(String cartId, BigDecimal taxAmount, BigDecimal shippingAmount) {
        logger.debug("Calculating tax and shipping for cart: {} tax: {} shipping: {}", cartId, taxAmount, shippingAmount);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        cart.updateTaxAndShipping(taxAmount, shippingAmount);
        cart.updateLastActivity();
        
        return cartRepository.save(cart);
    }
    
    /**
     * Calculate payment components for cart with address
     */
    public CartJpaEntity calculatePaymentComponents(String cartId, String addressId, String shippingMethod, String discountCode) {
        logger.debug("Calculating payment components for cart: {} with address: {}", cartId, addressId);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        // Get address if provided
        AddressJpaEntity address = null;
        if (addressId != null && !addressId.trim().isEmpty()) {
            // Note: You might need to add AddressJpaRepository as a dependency
            // For now, we'll calculate without address
        }
        
        // Calculate all components using the old method for individual amounts
        Map<String, PaymentComponentService.PaymentComponentResult> components = 
            paymentComponentService.calculateAllComponents(cart, address, shippingMethod, discountCode, null);
        
        // Update cart with calculated components (still need individual amounts for database)
        PaymentComponentService.PaymentComponentResult tax = components.get("tax");
        if (tax != null) {
            cart.setTaxAmount(tax.getAmount());
        }
        
        PaymentComponentService.PaymentComponentResult shipping = components.get("shipping");
        if (shipping != null) {
            cart.setShippingAmount(shipping.getAmount());
        }
        
        PaymentComponentService.PaymentComponentResult discount = components.get("discount");
        if (discount != null) {
            cart.setDiscountAmount(discount.getAmount());
            cart.setDiscountCode(discountCode);
        }
        
        cart.updateLastActivity();
        return cartRepository.save(cart);
    }
    
    /**
     * Validate cart items (check availability, prices, etc.)
     */
    public Map<String, Object> validateCart(String cartId) {
        logger.debug("Validating cart: {}", cartId);
        
        CartJpaEntity cart = cartRepository.findCartWithItems(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        Map<String, Object> validation = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        boolean isValid = true;
        boolean hasChanges = false;
        
        for (CartItemJpaEntity item : cart.getItems()) {
            ProductJpaEntity product = item.getProduct();
            
            // Check product availability
            if (!product.isAvailable()) {
                errors.add("Product " + product.getName() + " is no longer available");
                isValid = false;
                continue;
            }
            
            // Check stock availability
            if (product.getStockQuantity() < item.getQuantity()) {
                errors.add("Insufficient stock for " + product.getName() + 
                          " (requested: " + item.getQuantity() + ", available: " + product.getStockQuantity() + ")");
                isValid = false;
                continue;
            }
            
            // Check price changes
            if (item.isPriceChanged()) {
                warnings.add("Price changed for " + product.getName() + 
                           " (was: " + item.getUnitPrice() + ", now: " + product.getPrice() + ")");
                item.updatePrice(product.getPrice());
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            cartRepository.save(cart);
        }
        
        validation.put("valid", isValid);
        validation.put("errors", errors);
        validation.put("warnings", warnings);
        validation.put("hasChanges", hasChanges);
        
        return validation;
    }
    
    /**
     * Mark cart as checked out
     */
    public CartJpaEntity checkoutCart(String cartId) {
        logger.debug("Checking out cart: {}", cartId);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        cart.checkout();
        return cartRepository.save(cart);
    }
    
    /**
     * Abandon cart
     */
    public CartJpaEntity abandonCart(String cartId) {
        logger.debug("Abandoning cart: {}", cartId);
        
        CartJpaEntity cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        
        cart.abandon();
        return cartRepository.save(cart);
    }
    
    /**
     * Get cart statistics
     */
    public Map<String, Object> getCartStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("activeGuestCarts", cartRepository.countActiveGuestCarts());
        stats.put("totalActiveCarts", cartRepository.countCartsByStatus(CartStatus.ACTIVE));
        stats.put("totalAbandonedCarts", cartRepository.countCartsByStatus(CartStatus.ABANDONED));
        stats.put("totalExpiredCarts", cartRepository.countCartsByStatus(CartStatus.EXPIRED));
        
        // Average cart size for last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Double avgSize = cartRepository.getAverageCartSize(thirtyDaysAgo);
        stats.put("averageCartSize", avgSize != null ? avgSize : 0.0);
        
        return stats;
    }
    
    /**
     * Cleanup expired and abandoned carts (scheduled task)
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Async
    public void cleanupCarts() {
        logger.debug("Starting cart cleanup task");
        
        LocalDateTime now = LocalDateTime.now();
        
        // Mark expired carts
        int expiredCount = cartRepository.markExpiredCarts(now);
        logger.info("Marked {} carts as expired", expiredCount);
        
        // Mark abandoned guest carts (inactive for 24 hours)
        LocalDateTime abandonCutoff = now.minusHours(24);
        int abandonedCount = cartRepository.markAbandonedGuestCarts(abandonCutoff, now);
        logger.info("Marked {} guest carts as abandoned", abandonedCount);
        
        // Delete old expired and abandoned carts (older than 30 days)
        LocalDateTime deleteCutoff = now.minusDays(30);
        int deletedCount = cartRepository.deleteOldCarts(deleteCutoff);
        logger.info("Deleted {} old carts", deletedCount);
        
        // Delete inactive guest carts (older than 7 days)
        LocalDateTime guestDeleteCutoff = now.minusDays(7);
        int deletedGuestCount = cartRepository.deleteInactiveGuestCarts(guestDeleteCutoff);
        logger.info("Deleted {} inactive guest carts", deletedGuestCount);
    }
    
    /**
     * Generate device fingerprint from request
     */
    public String generateDeviceFingerprint(HttpServletRequest request) {
        StringBuilder fingerprint = new StringBuilder();
        
        String userAgent = request.getHeader("User-Agent");
        if (StringUtils.hasText(userAgent)) {
            fingerprint.append(userAgent);
        }
        
        String acceptLanguage = request.getHeader("Accept-Language");
        if (StringUtils.hasText(acceptLanguage)) {
            fingerprint.append("|").append(acceptLanguage);
        }
        
        String acceptEncoding = request.getHeader("Accept-Encoding");
        if (StringUtils.hasText(acceptEncoding)) {
            fingerprint.append("|").append(acceptEncoding);
        }
        
        // Simple hash of the fingerprint
        return String.valueOf(fingerprint.toString().hashCode());
    }
    
    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 