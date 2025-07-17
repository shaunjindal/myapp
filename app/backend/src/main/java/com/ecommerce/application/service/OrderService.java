package com.ecommerce.application.service;

import com.ecommerce.domain.order.OrderStatus;
import com.ecommerce.domain.order.PaymentMethod;
import com.ecommerce.infrastructure.persistence.entity.*;
import com.ecommerce.infrastructure.persistence.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for Order management operations
 * Handles order creation, status management, and business logic
 */
@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderJpaRepository orderRepository;

    @Autowired
    private OrderItemJpaRepository orderItemRepository;

    @Autowired
    private OrderStatusHistoryJpaRepository orderStatusHistoryRepository;

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private ProductJpaRepository productRepository;

    @Autowired
    private CartJpaRepository cartRepository;

    @Autowired
    private CartItemJpaRepository cartItemRepository;

    @Autowired
    private AddressJpaRepository addressRepository;

    @Autowired
    private CartService cartService;

    // Order Creation Methods

    /**
     * Create order from cart
     */
    public OrderJpaEntity createOrderFromCart(String customerId, String billingAddressId, String shippingAddressId, 
                                            PaymentMethod paymentMethod, String customerNotes) {
        logger.info("Creating order from cart for customer: {}", customerId);

        // Validate customer
        UserJpaEntity customer = userRepository.findById(customerId)
            .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        // Get active cart through CartService
        CartJpaEntity cart = cartService.getOrCreateUserCart(customerId);
        
        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot create order from empty cart");
        }

        // Validate cart before creating order
        var cartValidation = cartService.validateCart(cart.getId());
        if (!(Boolean) cartValidation.get("valid")) {
            throw new IllegalArgumentException("Cart validation failed: " + cartValidation.get("errors"));
        }

        // Get addresses
        AddressJpaEntity billingAddress = addressRepository.findById(billingAddressId)
            .orElseThrow(() -> new IllegalArgumentException("Billing address not found: " + billingAddressId));
        
        AddressJpaEntity shippingAddress = addressRepository.findById(shippingAddressId)
            .orElseThrow(() -> new IllegalArgumentException("Shipping address not found: " + shippingAddressId));

        // Validate address ownership
        if (!billingAddress.getUser().getId().equals(customerId) || 
            !shippingAddress.getUser().getId().equals(customerId)) {
            throw new IllegalArgumentException("Address does not belong to customer");
        }

        // Create order
        OrderJpaEntity order = new OrderJpaEntity();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setBillingAddress(new EmbeddableAddress(billingAddress));
        order.setShippingAddress(new EmbeddableAddress(shippingAddress));
        order.setPaymentMethod(paymentMethod);
        order.setCustomerNotes(customerNotes);
        order.setStatus(OrderStatus.ORDER_RAISED);

        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        // Save order first to get ID
        order = orderRepository.save(order);

        // Convert cart items to order items
        for (CartItemJpaEntity cartItem : cart.getItems()) {
            ProductJpaEntity product = cartItem.getProduct();
            
            // Validate product availability
            if (!product.canReserve(cartItem.getQuantity())) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            OrderItemJpaEntity orderItem = new OrderItemJpaEntity(order, product, 
                cartItem.getQuantity(), cartItem.getEffectiveUnitPrice());
            
            // Set additional properties
            orderItem.setDiscountAmount(cartItem.getDiscountAmount());
            orderItem.setGift(cartItem.getIsGift() != null ? cartItem.getIsGift() : false);
            orderItem.setGiftMessage(cartItem.getGiftMessage());
            orderItem.setCustomAttributes(cartItem.getCustomAttributes());
            
            // Handle variable dimension pricing
            if (cartItem.hasCustomDimensions()) {
                orderItem.setCustomLength(cartItem.getCustomLength());
                orderItem.setCalculatedUnitPrice(cartItem.getCalculatedUnitPrice());
                orderItem.setDimensionDetails(cartItem.getDimensionDetails());
            }
            
            // Set price component fields from product
            orderItem.setBaseAmount(product.getBaseAmount());
            orderItem.setTaxRate(product.getTaxRate());
            orderItem.setTaxAmount(product.getTaxAmount().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            order.addItem(orderItem);
            
            // Calculate subtotal from effective unit price (for both regular and variable dimension products)
            BigDecimal itemTotal = orderItem.getEffectiveUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            totalWeight = totalWeight.add(orderItem.getTotalWeight());

            // Reserve product stock
            product.reserveStock(cartItem.getQuantity());
            productRepository.save(product);
        }

        // Set calculated totals
        order.setSubtotal(subtotal);
        order.setTotalWeight(totalWeight);
        
        // Apply cart-level discounts and calculations
        order.setDiscountAmount(cart.getDiscountAmount());
        order.setDiscountCode(cart.getDiscountCode());
        order.setTaxAmount(cart.getTaxAmount());
        order.setShippingAmount(cart.getShippingAmount());
        
        // Calculate final total
        BigDecimal totalAmount = subtotal
            .subtract(order.getDiscountAmount())
            .add(order.getTaxAmount())
            .add(order.getShippingAmount());
        order.setTotalAmount(totalAmount);

        // Save order with items
        order = orderRepository.save(order);

        // Add initial status history
        addStatusHistory(order, OrderStatus.ORDER_RAISED, null, "Order created", getCurrentUsername(), false);

        // Checkout the cart through CartService
        cartService.checkoutCart(cart.getId());
        
        logger.info("Order created successfully: {}", order.getOrderNumber());
        return order;
    }

    /**
     * Create order directly (without cart)
     */
    public OrderJpaEntity createDirectOrder(String customerId, List<OrderItemRequest> itemRequests,
                                          String billingAddressId, String shippingAddressId,
                                          PaymentMethod paymentMethod, String customerNotes) {
        logger.info("Creating direct order for customer: {}", customerId);

        // Validate customer
        UserJpaEntity customer = userRepository.findById(customerId)
            .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        if (itemRequests.isEmpty()) {
            throw new IllegalArgumentException("Cannot create order with no items");
        }

        // Get addresses
        AddressJpaEntity billingAddress = addressRepository.findById(billingAddressId)
            .orElseThrow(() -> new IllegalArgumentException("Billing address not found: " + billingAddressId));
        
        AddressJpaEntity shippingAddress = addressRepository.findById(shippingAddressId)
            .orElseThrow(() -> new IllegalArgumentException("Shipping address not found: " + shippingAddressId));

        // Create order
        OrderJpaEntity order = new OrderJpaEntity();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setBillingAddress(new EmbeddableAddress(billingAddress));
        order.setShippingAddress(new EmbeddableAddress(shippingAddress));
        order.setPaymentMethod(paymentMethod);
        order.setCustomerNotes(customerNotes);
        order.setStatus(OrderStatus.ORDER_RAISED);

        // Save order first to get ID
        order = orderRepository.save(order);

        // Process items
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : itemRequests) {
            ProductJpaEntity product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemRequest.getProductId()));

            if (!product.canReserve(itemRequest.getQuantity())) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            OrderItemJpaEntity orderItem = new OrderItemJpaEntity(order, product, 
                itemRequest.getQuantity(), product.getPrice());

            // Set price component fields from product
            orderItem.setBaseAmount(product.getBaseAmount());
            orderItem.setTaxRate(product.getTaxRate());
            orderItem.setTaxAmount(product.getTaxAmount().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            order.addItem(orderItem);
            
            // Calculate subtotal from base amounts (excluding tax)
            BigDecimal itemBaseTotal = orderItem.getBaseAmount().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
            subtotal = subtotal.add(itemBaseTotal);
            totalWeight = totalWeight.add(orderItem.getTotalWeight());

            // Reserve product stock
            product.reserveStock(itemRequest.getQuantity());
            productRepository.save(product);
        }

        // Set totals
        order.setSubtotal(subtotal);
        order.setTotalWeight(totalWeight);
        order.setTotalAmount(subtotal); // Simple calculation, can be enhanced with tax/shipping logic

        // Save order
        order = orderRepository.save(order);

        // Add initial status history
        addStatusHistory(order, OrderStatus.ORDER_RAISED, null, "Order created", getCurrentUsername(), false);

        logger.info("Direct order created successfully: {}", order.getOrderNumber());
        return order;
    }

    // Order Status Management

    /**
     * Process payment - transitions from ORDER_RAISED to PAYMENT_DONE
     */
    public OrderJpaEntity processPayment(String orderId, String transactionId, String notes) {
        OrderJpaEntity order = getOrderById(orderId);
        
        if (order.getStatus() != OrderStatus.ORDER_RAISED) {
            throw new IllegalStateException("Can only process payment for raised orders. Current status: " + order.getStatus());
        }

        if (transactionId == null || transactionId.trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction ID is required");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.PAYMENT_DONE);
        order.setPaymentTransactionId(transactionId);
        order = orderRepository.save(order);

        addStatusHistory(order, OrderStatus.PAYMENT_DONE, previousStatus, 
            notes != null ? notes : "Payment processed successfully", getCurrentUsername(), false);

        logger.info("Payment processed for order: {}", order.getOrderNumber());
        return order;
    }

    /**
     * Deliver order - transitions from PAYMENT_DONE to DELIVERED
     */
    public OrderJpaEntity deliverOrder(String orderId, String notes) {
        OrderJpaEntity order = getOrderById(orderId);
        
        if (order.getStatus() != OrderStatus.PAYMENT_DONE) {
            throw new IllegalStateException("Can only deliver orders with completed payment. Current status: " + order.getStatus());
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredDate(LocalDateTime.now());
        order = orderRepository.save(order);

        addStatusHistory(order, OrderStatus.DELIVERED, previousStatus, 
            notes != null ? notes : "Order delivered successfully", getCurrentUsername(), false);

        logger.info("Order delivered: {}", order.getOrderNumber());
        return order;
    }

    /**
     * Cancel order
     */
    public OrderJpaEntity cancelOrder(String orderId, String reason) {
        OrderJpaEntity order = getOrderById(orderId);
        
        if (!order.canBeCancelled()) {
            throw new IllegalStateException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }

        // Release reserved stock
        for (OrderItemJpaEntity item : order.getItems()) {
            ProductJpaEntity product = item.getProduct();
            product.releaseReservedStock(item.getQuantity());
            productRepository.save(product);
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setCancelledDate(LocalDateTime.now());
        order = orderRepository.save(order);

        addStatusHistory(order, OrderStatus.CANCELLED, previousStatus, 
            "Order cancelled: " + reason, getCurrentUsername(), false);

        logger.info("Order cancelled: {} - Reason: {}", order.getOrderNumber(), reason);
        return order;
    }

    // Query Methods

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderJpaEntity getOrderById(String orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public Optional<OrderJpaEntity> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    /**
     * Get orders for customer
     */
    @Transactional(readOnly = true)
    public Page<OrderJpaEntity> getCustomerOrders(String customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable);
    }

    /**
     * Get recent orders for customer
     */
    @Transactional(readOnly = true)
    public Page<OrderJpaEntity> getRecentCustomerOrders(String customerId, LocalDateTime since, Pageable pageable) {
        return orderRepository.findRecentOrdersByCustomerId(customerId, since, pageable);
    }

    /**
     * Search orders
     */
    @Transactional(readOnly = true)
    public Page<OrderJpaEntity> searchOrders(String search, Pageable pageable) {
        return orderRepository.searchOrders(search, pageable);
    }

    /**
     * Search customer orders
     */
    @Transactional(readOnly = true)
    public Page<OrderJpaEntity> searchCustomerOrders(String customerId, String search, Pageable pageable) {
        return orderRepository.searchCustomerOrders(customerId, search, pageable);
    }

    /**
     * Get orders by status
     */
    @Transactional(readOnly = true)
    public Page<OrderJpaEntity> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }

    /**
     * Get order status history
     */
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryJpaEntity> getOrderStatusHistory(String orderId) {
        return orderStatusHistoryRepository.findByOrderId(orderId);
    }

    /**
     * Get customer visible status history
     */
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryJpaEntity> getCustomerVisibleStatusHistory(String orderId) {
        return orderStatusHistoryRepository.findCustomerVisibleByOrderId(orderId);
    }

    // Utility Methods

    /**
     * Generate unique order number
     */
    private String generateOrderNumber() {
        // Generate exactly 10 digits by taking last 10 digits of timestamp
        String timestamp = String.valueOf(System.currentTimeMillis());
        String lastTenDigits = timestamp.substring(timestamp.length() - 10);
        return "ORD-" + lastTenDigits;
    }

    /**
     * Add status history entry
     */
    private void addStatusHistory(OrderJpaEntity order, OrderStatus newStatus, OrderStatus previousStatus, 
                                String notes, String changedBy, boolean systemGenerated) {
        OrderStatusHistoryJpaEntity history = new OrderStatusHistoryJpaEntity(
            order, newStatus, previousStatus, notes, changedBy, systemGenerated);
        order.addStatusHistory(history);
        orderStatusHistoryRepository.save(history);
    }

    /**
     * Get current username from security context
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    // Inner class for order item requests
    public static class OrderItemRequest {
        private String productId;
        private int quantity;

        public OrderItemRequest() {}

        public OrderItemRequest(String productId, int quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
} 