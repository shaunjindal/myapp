package com.ecommerce.controller;

import com.ecommerce.application.dto.CreateOrderRequest;
import com.ecommerce.application.dto.OrderDto;
import com.ecommerce.application.dto.OrderItemDto;
import com.ecommerce.application.dto.OrderStatusHistoryDto;
import com.ecommerce.application.service.OrderService;
import com.ecommerce.application.service.PaymentComponentService;
import com.ecommerce.domain.order.OrderStatus;
import com.ecommerce.domain.order.PaymentMethod;
import com.ecommerce.infrastructure.persistence.entity.OrderJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.OrderItemJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.OrderStatusHistoryJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import com.ecommerce.application.dto.PaymentComponent;

/**
 * REST Controller for Order management
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserJpaRepository userRepository;
    
    @Autowired
    private PaymentComponentService paymentComponentService;

    // Order Creation Endpoints

    /**
     * Create order from cart
     */
    @PostMapping("/from-cart")
    public ResponseEntity<OrderDto> createOrderFromCart(
            @Valid @RequestBody CreateOrderRequest request,
            HttpServletRequest httpRequest) {
        
        String customerId = getCurrentUserId();
        logger.info("Creating order from cart for customer: {}", customerId);

        try {
            OrderJpaEntity order = orderService.createOrderFromCart(
                customerId,
                request.getBillingAddressId(),
                request.getShippingAddressId(),
                request.getPaymentMethod(),
                request.getCustomerNotes()
            );

            OrderDto orderDto = convertToDto(order);
            logger.info("Order created successfully: {}", order.getOrderNumber());
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            logger.error("Error creating order from cart: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Create order directly (without cart)
     */
    @PostMapping("/direct")
    public ResponseEntity<OrderDto> createDirectOrder(
            @Valid @RequestBody CreateOrderRequest request,
            HttpServletRequest httpRequest) {
        
        String customerId = getCurrentUserId();
        logger.info("Creating direct order for customer: {}", customerId);

        try {
            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new IllegalArgumentException("Items are required for direct order");
            }

            List<OrderService.OrderItemRequest> itemRequests = request.getItems().stream()
                .map(item -> new OrderService.OrderItemRequest(item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());

            OrderJpaEntity order = orderService.createDirectOrder(
                customerId,
                itemRequests,
                request.getBillingAddressId(),
                request.getShippingAddressId(),
                request.getPaymentMethod(),
                request.getCustomerNotes()
            );

            OrderDto orderDto = convertToDto(order);
            logger.info("Direct order created successfully: {}", order.getOrderNumber());
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            logger.error("Error creating direct order: {}", e.getMessage());
            throw e;
        }
    }

    // Order Query Endpoints

    /**
     * Get user's orders with pagination
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        String customerId = getCurrentUserId();
        logger.info("Fetching orders for customer: {}", customerId);

        try {
            Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<OrderJpaEntity> orderPage;
            
            if (search != null && !search.trim().isEmpty()) {
                orderPage = orderService.searchCustomerOrders(customerId, search, pageable);
            } else if (status != null && !status.trim().isEmpty()) {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                orderPage = orderService.getOrdersByStatus(orderStatus, pageable);
            } else {
                orderPage = orderService.getCustomerOrders(customerId, pageable);
            }

            List<OrderDto> orders = orderPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", orders);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalElements", orderPage.getTotalElements());
            response.put("totalPages", orderPage.getTotalPages());
            response.put("hasNext", orderPage.hasNext());
            response.put("hasPrevious", orderPage.hasPrevious());

            // Add message for empty state
            if (orders.isEmpty()) {
                response.put("message", "You haven't placed any orders yet. Start shopping to see your order history here!");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching user orders: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get recent orders for user
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "30") int days) {
        
        String customerId = getCurrentUserId();
        logger.info("Fetching recent orders for customer: {}", customerId);

        try {
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());

            Page<OrderJpaEntity> orderPage = orderService.getRecentCustomerOrders(customerId, since, pageable);

            List<OrderDto> orders = orderPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", orders);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalElements", orderPage.getTotalElements());
            response.put("totalPages", orderPage.getTotalPages());
            response.put("hasNext", orderPage.hasNext());
            response.put("hasPrevious", orderPage.hasPrevious());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching recent orders: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable String orderId) {
        String customerId = getCurrentUserId();
        logger.info("Fetching order {} for customer: {}", orderId, customerId);

        try {
            OrderJpaEntity order = orderService.getOrderById(orderId);
            
            // Ensure customer can only access their own orders
            if (!order.getCustomer().getId().equals(customerId)) {
                logger.warn("Customer {} attempted to access order {} belonging to {}", 
                    customerId, orderId, order.getCustomer().getId());
                throw new IllegalArgumentException("Order not found");
            }

            OrderDto orderDto = convertToDto(order);
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            logger.error("Error fetching order {}: {}", orderId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get order by order number
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDto> getOrderByNumber(@PathVariable String orderNumber) {
        String customerId = getCurrentUserId();
        logger.info("Fetching order {} for customer: {}", orderNumber, customerId);

        try {
            Optional<OrderJpaEntity> orderOpt = orderService.getOrderByNumber(orderNumber);
            if (orderOpt.isEmpty()) {
                throw new IllegalArgumentException("Order not found");
            }

            OrderJpaEntity order = orderOpt.get();
            
            // Ensure customer can only access their own orders
            if (!order.getCustomer().getId().equals(customerId)) {
                logger.warn("Customer {} attempted to access order {} belonging to {}", 
                    customerId, orderNumber, order.getCustomer().getId());
                throw new IllegalArgumentException("Order not found");
            }

            OrderDto orderDto = convertToDto(order);
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            logger.error("Error fetching order {}: {}", orderNumber, e.getMessage());
            throw e;
        }
    }

    // Order Status Management Endpoints

    /**
     * Get order status history
     */
    @GetMapping("/{orderId}/status-history")
    public ResponseEntity<List<OrderStatusHistoryDto>> getOrderStatusHistory(@PathVariable String orderId) {
        String customerId = getCurrentUserId();
        logger.info("Fetching status history for order {} by customer: {}", orderId, customerId);

        try {
            OrderJpaEntity order = orderService.getOrderById(orderId);
            
            // Ensure customer can only access their own orders
            if (!order.getCustomer().getId().equals(customerId)) {
                throw new IllegalArgumentException("Order not found");
            }

            List<OrderStatusHistoryJpaEntity> history = orderService.getCustomerVisibleStatusHistory(orderId);
            
            List<OrderStatusHistoryDto> historyDto = history.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(historyDto);
        } catch (Exception e) {
            logger.error("Error fetching status history for order {}: {}", orderId, e.getMessage());
            throw e;
        }
    }

    /**
     * Cancel order
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable String orderId,
            @RequestParam(required = false) String reason) {
        
        String customerId = getCurrentUserId();
        logger.info("Cancelling order {} for customer: {}", orderId, customerId);

        try {
            OrderJpaEntity order = orderService.getOrderById(orderId);
            
            // Ensure customer can only cancel their own orders
            if (!order.getCustomer().getId().equals(customerId)) {
                throw new IllegalArgumentException("Order not found");
            }

            String cancellationReason = reason != null ? reason : "Cancelled by customer";
            OrderJpaEntity cancelledOrder = orderService.cancelOrder(orderId, cancellationReason);
            
            OrderDto orderDto = convertToDto(cancelledOrder);
            logger.info("Order {} cancelled successfully", orderId);
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            logger.error("Error cancelling order {}: {}", orderId, e.getMessage());
            throw e;
        }
    }

    // Administrative Endpoints (for internal use)

    /**
     * Process payment (transitions from ORDER_RAISED to PAYMENT_DONE)
     */
    @PutMapping("/{orderId}/process-payment")
    public ResponseEntity<OrderDto> processPayment(
            @PathVariable String orderId,
            @RequestParam String transactionId,
            @RequestParam(required = false) String notes) {
        
        logger.info("Processing payment for order: {}", orderId);

        try {
            OrderJpaEntity order = orderService.processPayment(orderId, transactionId, notes);
            OrderDto orderDto = convertToDto(order);
            logger.info("Payment processed for order {}", orderId);
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            logger.error("Error processing payment for order {}: {}", orderId, e.getMessage());
            throw e;
        }
    }

    /**
     * Deliver order (transitions from PAYMENT_DONE to DELIVERED)
     */
    @PutMapping("/{orderId}/deliver")
    public ResponseEntity<OrderDto> deliverOrder(
            @PathVariable String orderId,
            @RequestParam(required = false) String notes) {
        
        logger.info("Delivering order: {}", orderId);

        try {
            OrderJpaEntity order = orderService.deliverOrder(orderId, notes);
            OrderDto orderDto = convertToDto(order);
            logger.info("Order {} delivered successfully", orderId);
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            logger.error("Error delivering order {}: {}", orderId, e.getMessage());
            throw e;
        }
    }

    // Utility Methods

    /**
     * Get current user ID from security context
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        
        String email = authentication.getName();
        UserJpaEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("User not found with email: " + email));
        
        return user.getId();
    }

    /**
     * Convert OrderJpaEntity to OrderDto
     */
    private OrderDto convertToDto(OrderJpaEntity order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getCustomer().getId());
        dto.setStatus(order.getStatus());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setShippingAmount(order.getShippingAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDiscountCode(order.getDiscountCode());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentTransactionId(order.getPaymentTransactionId());
        dto.setOrderDate(order.getOrderDate());
        dto.setShippedDate(order.getShippedDate());
        dto.setDeliveredDate(order.getDeliveredDate());
        dto.setCancelledDate(order.getCancelledDate());
        dto.setCancellationReason(order.getCancellationReason());
        dto.setCustomerNotes(order.getCustomerNotes());
        dto.setInternalNotes(order.getInternalNotes());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setShippingCarrier(order.getShippingCarrier());
        dto.setTotalWeight(order.getTotalWeight());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setCurrency(order.getCurrency());

        // Calculate payment components dynamically for order
        List<PaymentComponent> paymentComponents = paymentComponentService.calculateOrderPaymentComponentsList(
            order, null, null, order.getDiscountCode(), null);
        dto.setPaymentComponents(paymentComponents);

        // Convert shipping address
        if (order.getShippingAddress() != null) {
            dto.setShippingAddress(convertToDto(order.getShippingAddress()));
        }

        // Convert billing address
        if (order.getBillingAddress() != null) {
            dto.setBillingAddress(convertToDto(order.getBillingAddress()));
        }

        // Convert items
        if (order.getItems() != null) {
            List<OrderItemDto> items = order.getItems().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            dto.setItems(items);
        }

        // Include customer-visible status history
        try {
            List<OrderStatusHistoryJpaEntity> history = orderService.getCustomerVisibleStatusHistory(order.getId());
            if (history != null && !history.isEmpty()) {
                List<OrderStatusHistoryDto> statusHistory = history.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
                dto.setStatusHistory(statusHistory);
            }
        } catch (Exception e) {
            logger.warn("Error fetching status history for order {}: {}", order.getId(), e.getMessage());
        }

        return dto;
    }

    /**
     * Convert EmbeddableAddress to AddressDto
     */
    private com.ecommerce.application.dto.AddressDto convertToDto(com.ecommerce.infrastructure.persistence.entity.EmbeddableAddress address) {
        com.ecommerce.application.dto.AddressDto dto = new com.ecommerce.application.dto.AddressDto();
        dto.setFirstName(address.getFirstName());
        dto.setLastName(address.getLastName());
        dto.setCompany(address.getCompany());
        dto.setStreet(address.getStreet());
        dto.setStreet2(address.getStreet2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setPhone(address.getPhoneNumber());
        return dto;
    }

    /**
     * Convert OrderItemJpaEntity to OrderItemDto
     */
    private OrderItemDto convertToDto(OrderItemJpaEntity item) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProductName());
        dto.setProductSku(item.getProductSku());
        dto.setProductDescription(item.getProductDescription());
        dto.setProductImageUrl(item.getProductImageUrl());
        dto.setProductBrand(item.getProductBrand());
        dto.setProductCategory(item.getProductCategory());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        dto.setProductWeight(item.getProductWeight());
        dto.setDiscountAmount(item.getDiscountAmount());
        dto.setTaxAmount(item.getTaxAmount());
        dto.setAddedAt(item.getAddedAt());
        
        // Price component fields
        dto.setBaseAmount(item.getBaseAmount());
        dto.setTaxRate(item.getTaxRate());
        dto.setGift(item.isGift());
        dto.setGiftMessage(item.getGiftMessage());
        dto.setCustomAttributes(item.getCustomAttributes());
        return dto;
    }

    /**
     * Convert OrderStatusHistoryJpaEntity to OrderStatusHistoryDto
     */
    private OrderStatusHistoryDto convertToDto(OrderStatusHistoryJpaEntity history) {
        OrderStatusHistoryDto dto = new OrderStatusHistoryDto();
        dto.setId(history.getId());
        dto.setStatus(history.getStatus());
        dto.setPreviousStatus(history.getPreviousStatus());
        dto.setTimestamp(history.getTimestamp());
        dto.setNotes(history.getNotes());
        dto.setChangedBy(history.getChangedBy());
        dto.setSystemGenerated(history.isSystemGenerated());
        dto.setNotificationSent(history.isNotificationSent());
        dto.setCustomerVisible(history.isCustomerVisible());
        return dto;
    }
} 