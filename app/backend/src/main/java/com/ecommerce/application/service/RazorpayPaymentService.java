package com.ecommerce.application.service;

import com.ecommerce.application.dto.PaymentOrderRequest;
import com.ecommerce.application.dto.PaymentOrderResponse;
import com.ecommerce.application.dto.PaymentVerificationRequest;
import com.ecommerce.application.dto.PaymentVerificationResponse;
import com.ecommerce.application.dto.RefundResponse;
import com.ecommerce.config.RazorpayConfig;
import com.ecommerce.domain.order.PaymentMethod;
import com.ecommerce.domain.payment.Payment;
import com.ecommerce.domain.payment.PaymentStatus;
import com.ecommerce.domain.user.User;
import com.ecommerce.infrastructure.persistence.entity.OrderJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.PaymentJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.UserJpaEntity;
import com.ecommerce.infrastructure.persistence.repository.OrderJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.PaymentJpaRepository;
import com.ecommerce.infrastructure.persistence.repository.UserJpaRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Optional;
import java.util.Date;

/**
 * Service class for Razorpay payment operations
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Service
@Transactional
public class RazorpayPaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(RazorpayPaymentService.class);
    
    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final PaymentJpaRepository paymentRepository;
    private final OrderJpaRepository orderRepository;
    private final UserJpaRepository userRepository;
    
    @Autowired
    public RazorpayPaymentService(
            RazorpayClient razorpayClient,
            RazorpayConfig razorpayConfig,
            PaymentJpaRepository paymentRepository,
            OrderJpaRepository orderRepository,
            UserJpaRepository userRepository) {
        this.razorpayClient = razorpayClient;
        this.razorpayConfig = razorpayConfig;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Creates a Razorpay order for payment
     * 
     * @param request the payment order request
     * @param userId the user ID
     * @param orderId the order ID
     * @return PaymentOrderResponse containing order details
     */
    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request, String userId, String orderId) {
        try {
            logger.info("Creating Razorpay order for user: {}, order: {}, amount: {}", 
                       userId, orderId, request.getAmount());
            
            // Validate user and order exist
            UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            
            OrderJpaEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
            
            // Check if payment already exists for this order
            List<PaymentJpaEntity> existingPayments = paymentRepository.findByOrder_IdOrderByCreatedAtDesc(orderId);
            if (!existingPayments.isEmpty()) {
                // Allow creation of new payment if previous ones failed
                boolean hasActivePendingPayment = existingPayments.stream()
                    .anyMatch(p -> p.getStatus() == PaymentStatus.CREATED || p.getStatus() == PaymentStatus.PENDING);
                if (hasActivePendingPayment) {
                    throw new IllegalStateException("Active payment already exists for order: " + orderId);
                }
            }
            
            // Convert amount to paise (Razorpay expects amount in smallest currency unit)
            BigDecimal amountInPaise = request.getAmount().multiply(new BigDecimal("100"));
            
            // Check if using dummy credentials and return mock response
            if (razorpayConfig.isDummyCredentials()) {
                logger.info("Using dummy credentials - returning mock Razorpay order");
                return createMockPaymentOrder(request, user, order, amountInPaise);
            }
            
            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise.intValue());
            orderRequest.put("currency", request.getCurrency());
            orderRequest.put("receipt", request.getReceipt() != null ? request.getReceipt() : order.getOrderNumber());
            
            // Add payment capture settings
            orderRequest.put("payment_capture", razorpayConfig.isAutoCapture());
            
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            
            // Create payment record in database
            PaymentJpaEntity payment = createPaymentRecord(razorpayOrder, user, order, request);
            
            // Create response
            PaymentOrderResponse response = new PaymentOrderResponse();
            response.setOrderId(razorpayOrder.get("id"));
            response.setEntity(razorpayOrder.get("entity"));
            response.setAmount(new BigDecimal(razorpayOrder.get("amount").toString()).divide(new BigDecimal("100")));
            response.setCurrency(razorpayOrder.get("currency"));
            response.setReceipt(razorpayOrder.get("receipt"));
            response.setStatus(razorpayOrder.get("status"));
            response.setCreatedAt(razorpayOrder.get("created_at"));
            response.setKeyId(razorpayConfig.getKeyId());
            
            logger.info("Successfully created Razorpay order: {}", response.getOrderId());
            return response;
            
        } catch (RazorpayException e) {
            logger.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error creating payment order: {}", e.getMessage(), e);
            throw new RuntimeException("Unexpected error creating payment order", e);
        }
    }

    /**
     * Creates a Razorpay order for payment without requiring an existing order
     * This is used for payment-first flow where we collect payment before creating the order
     * 
     * @param request the payment order request
     * @param userId the user ID
     * @return PaymentOrderResponse containing order details
     */
    public PaymentOrderResponse createPaymentOrderWithoutExistingOrder(PaymentOrderRequest request, String userId) {
        try {
            logger.info("Creating Razorpay order without existing order for user: {}, amount: {}", 
                       userId, request.getAmount());
            
            // Validate user exists
            UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            
            // Convert amount to paise (Razorpay expects amount in smallest currency unit)
            BigDecimal amountInPaise = request.getAmount().multiply(new BigDecimal("100"));
            
            // Check if using dummy credentials and return mock response
            if (razorpayConfig.isDummyCredentials()) {
                logger.info("Using dummy credentials - returning mock Razorpay order");
                return createMockPaymentOrderWithoutExistingOrder(request, user, amountInPaise);
            }
            
            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise.intValue());
            orderRequest.put("currency", request.getCurrency());
            orderRequest.put("receipt", request.getReceipt() != null ? request.getReceipt() : "temp_receipt_" + System.currentTimeMillis());
            
            // Add payment capture settings
            orderRequest.put("payment_capture", razorpayConfig.isAutoCapture());
            
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            
            // Create payment record in database without order reference
            PaymentJpaEntity payment = createPaymentRecordWithoutOrder(razorpayOrder, user, request);
            
            // Create response
            PaymentOrderResponse response = new PaymentOrderResponse();
            response.setOrderId(razorpayOrder.get("id"));
            response.setEntity(razorpayOrder.get("entity"));
            response.setAmount(new BigDecimal(razorpayOrder.get("amount").toString()).divide(new BigDecimal("100")));
            response.setCurrency(razorpayOrder.get("currency"));
            response.setReceipt(razorpayOrder.get("receipt"));
            response.setStatus(razorpayOrder.get("status"));
            response.setCreatedAt(razorpayOrder.get("created_at").toString());
            response.setKeyId(razorpayConfig.getKeyId());
            
            logger.info("Successfully created Razorpay order without existing order: {}", response.getOrderId());
            return response;
            
        } catch (RazorpayException e) {
            logger.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error creating payment order: {}", e.getMessage(), e);
            throw new RuntimeException("Unexpected error creating payment order", e);
        }
    }
    
    /**
     * Verifies a Razorpay payment signature
     * 
     * @param request the payment verification request
     * @return PaymentVerificationResponse containing verification result
     */
    public PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request) {
        try {
            logger.info("Verifying Razorpay payment: {}", request.getRazorpayPaymentId());
            
            // Find payment by Razorpay order ID
            Optional<PaymentJpaEntity> paymentOpt = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId());
            
            if (paymentOpt.isEmpty()) {
                logger.warn("Payment not found for Razorpay order ID: {}", request.getRazorpayOrderId());
                return PaymentVerificationResponse.failure("Payment not found");
            }
            
            PaymentJpaEntity payment = paymentOpt.get();
            
            // Verify signature
            boolean isSignatureValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
            );
            
            if (!isSignatureValid) {
                logger.warn("Invalid signature for payment: {}", request.getRazorpayPaymentId());
                updatePaymentStatus(payment, PaymentStatus.FAILED, "Invalid signature", null);
                return PaymentVerificationResponse.failure("Invalid payment signature");
            }
            
            // Update payment status
            updatePaymentStatus(payment, PaymentStatus.PAID, null, request);
            
            logger.info("Successfully verified payment: {}", request.getRazorpayPaymentId());
            return PaymentVerificationResponse.success(
                request.getRazorpayPaymentId(),
                request.getRazorpayOrderId()
            );
            
        } catch (Exception e) {
            logger.error("Error verifying payment: {}", e.getMessage(), e);
            return PaymentVerificationResponse.error("Error verifying payment: " + e.getMessage());
        }
    }
    
    /**
     * Creates a mock payment order for development
     */
    private PaymentOrderResponse createMockPaymentOrder(PaymentOrderRequest request, UserJpaEntity user, OrderJpaEntity order, BigDecimal amountInPaise) {
        logger.info("Creating mock payment order for development");
        
        // Create mock order data
        String orderId = "order_mock_" + System.currentTimeMillis();
        String createdAt = new Date().toString();
        String receipt = request.getReceipt() != null ? request.getReceipt() : order.getOrderNumber();
        
        // Create payment record in database with mock data
        PaymentJpaEntity payment = new PaymentJpaEntity();
        payment.setPaymentId("PAY-" + System.currentTimeMillis());
        payment.setRazorpayOrderId(orderId);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setStatus(PaymentStatus.CREATED);
        payment.setPaymentMethod(PaymentMethod.RAZORPAY_CARD);
        payment.setUser(user);
        payment.setOrder(order);
        payment.setReceipt(receipt);
        payment.setDescription("Mock payment for order: " + order.getOrderNumber());
        
        paymentRepository.save(payment);
        
        // Create mock response
        PaymentOrderResponse response = new PaymentOrderResponse();
        response.setOrderId(orderId);
        response.setEntity("order");
        response.setAmount(request.getAmount());
        response.setCurrency(request.getCurrency());
        response.setReceipt(receipt);
        response.setStatus("created");
        response.setCreatedAt(createdAt);
        response.setKeyId(razorpayConfig.getKeyId());
        
        logger.info("Successfully created mock payment order: {}", orderId);
        return response;
    }

    /**
     * Creates a mock payment order for development without existing order
     */
    private PaymentOrderResponse createMockPaymentOrderWithoutExistingOrder(PaymentOrderRequest request, UserJpaEntity user, BigDecimal amountInPaise) {
        logger.info("Creating mock payment order without existing order for development");
        
        // Create mock order data
        String orderId = "order_mock_" + System.currentTimeMillis();
        String createdAt = new Date().toString();
        String receipt = request.getReceipt() != null ? request.getReceipt() : "temp_receipt_" + System.currentTimeMillis();
        
        // Create payment record in database with mock data (without order reference)
        PaymentJpaEntity payment = new PaymentJpaEntity();
        payment.setPaymentId("PAY-" + System.currentTimeMillis());
        payment.setRazorpayOrderId(orderId);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setStatus(PaymentStatus.CREATED);
        payment.setPaymentMethod(PaymentMethod.RAZORPAY_CARD); // Default, can be updated based on actual payment method
        payment.setUser(user);
        // Note: No order reference for payment-first flow
        payment.setReceipt(receipt);
        payment.setDescription("Mock payment for cart checkout");
        
        paymentRepository.save(payment);
        
        // Create mock response
        PaymentOrderResponse response = new PaymentOrderResponse();
        response.setOrderId(orderId);
        response.setEntity("order");
        response.setAmount(request.getAmount());
        response.setCurrency(request.getCurrency());
        response.setReceipt(receipt);
        response.setStatus("created");
        response.setCreatedAt(createdAt);
        response.setKeyId(razorpayConfig.getKeyId());
        
        logger.info("Successfully created mock payment order without existing order: {}", orderId);
        return response;
    }
    
    /**
     * Creates a payment record in the database
     */
    private PaymentJpaEntity createPaymentRecord(com.razorpay.Order razorpayOrder, UserJpaEntity user, OrderJpaEntity order, PaymentOrderRequest request) {
        PaymentJpaEntity payment = new PaymentJpaEntity();
        payment.setPaymentId("PAY-" + System.currentTimeMillis());
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setStatus(PaymentStatus.CREATED);
        payment.setPaymentMethod(PaymentMethod.RAZORPAY_CARD); // Default, can be updated based on actual payment method
        payment.setUser(user);
        payment.setOrder(order);
        payment.setReceipt(request.getReceipt());
        payment.setDescription("Payment for order: " + order.getOrderNumber());
        
        return paymentRepository.save(payment);
    }

    /**
     * Creates a payment record in the database without order reference
     */
    private PaymentJpaEntity createPaymentRecordWithoutOrder(com.razorpay.Order razorpayOrder, UserJpaEntity user, PaymentOrderRequest request) {
        PaymentJpaEntity payment = new PaymentJpaEntity();
        payment.setPaymentId("PAY-" + System.currentTimeMillis());
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setStatus(PaymentStatus.CREATED);
        payment.setPaymentMethod(PaymentMethod.RAZORPAY_CARD); // Default, can be updated based on actual payment method
        payment.setUser(user);
        // Note: No order reference for payment-first flow
        payment.setReceipt(request.getReceipt());
        payment.setDescription("Payment for cart checkout");
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Updates payment status
     */
    private void updatePaymentStatus(PaymentJpaEntity payment, PaymentStatus status, String errorMessage, PaymentVerificationRequest request) {
        payment.setStatus(status);
        
        if (status == PaymentStatus.PAID && request != null) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
        }
        
        if (status == PaymentStatus.FAILED && errorMessage != null) {
            payment.setErrorDescription(errorMessage);
        }
        
        paymentRepository.save(payment);
    }
    
    /**
     * Verifies Razorpay payment signature
     */
    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            // Create the expected signature
            String payload = orderId + "|" + paymentId;
            String expectedSignature = calculateHMAC(payload, razorpayConfig.getKeySecret());
            
            // Compare signatures
            return expectedSignature.equals(signature);
            
        } catch (Exception e) {
            logger.error("Error verifying signature: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Calculates HMAC-SHA256 hash
     */
    private String calculateHMAC(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKeySpec);
        
        byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex string
        StringBuilder result = new StringBuilder();
        for (byte b : hashBytes) {
            result.append(String.format("%02x", b));
        }
        
        return result.toString();
    }
    
    /**
     * Gets payment by payment ID
     */
    @Transactional(readOnly = true)
    public Optional<PaymentJpaEntity> getPaymentByPaymentId(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId);
    }
    
    /**
     * Gets payment by Razorpay order ID
     */
    @Transactional(readOnly = true)
    public Optional<PaymentJpaEntity> getPaymentByRazorpayOrderId(String razorpayOrderId) {
        return paymentRepository.findByRazorpayOrderId(razorpayOrderId);
    }

    /**
     * Processes Razorpay webhook notifications
     * 
     * @param payload the webhook payload from Razorpay
     * @param signature the webhook signature for verification
     * @return true if webhook was processed successfully, false otherwise
     */
    public boolean processWebhook(String payload, String signature) {
        try {
            logger.info("Processing Razorpay webhook notification");
            
            // Skip signature verification for dummy credentials
            if (!razorpayConfig.isDummyCredentials()) {
                // Verify webhook signature
                if (!verifyWebhookSignature(payload, signature)) {
                    logger.warn("Invalid webhook signature");
                    return false;
                }
            } else {
                logger.info("Skipping webhook signature verification for dummy credentials");
            }
            
            // Parse webhook payload
            JSONObject webhookData = new JSONObject(payload);
            String event = webhookData.getString("event");
            JSONObject paymentData = webhookData.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            
            logger.info("Processing webhook event: {}", event);
            
            // Handle different webhook events
            switch (event) {
                case "payment.captured":
                    return handlePaymentCaptured(paymentData);
                case "payment.failed":
                    return handlePaymentFailed(paymentData);
                case "payment.authorized":
                    return handlePaymentAuthorized(paymentData);
                default:
                    logger.info("Unhandled webhook event: {}", event);
                    return true; // Return true for unknown events to avoid retries
            }
            
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Handles payment captured webhook event
     */
    private boolean handlePaymentCaptured(JSONObject paymentData) {
        try {
            String razorpayPaymentId = paymentData.getString("id");
            String razorpayOrderId = paymentData.getString("order_id");
            
            logger.info("Handling payment captured event: payment_id={}, order_id={}", razorpayPaymentId, razorpayOrderId);
            
            // Find payment by Razorpay order ID
            Optional<PaymentJpaEntity> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (paymentOpt.isEmpty()) {
                logger.warn("Payment not found for Razorpay order ID: {}", razorpayOrderId);
                return false;
            }
            
            PaymentJpaEntity payment = paymentOpt.get();
            
            // Update payment status
            payment.setStatus(PaymentStatus.PAID);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setPaidAt(java.time.LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Update order status if order exists
            if (payment.getOrder() != null) {
                OrderJpaEntity order = payment.getOrder();
                order.setStatus(com.ecommerce.domain.order.OrderStatus.PAYMENT_DONE);
                orderRepository.save(order);
                logger.info("Updated order status to PAYMENT_DONE for order: {}", order.getOrderNumber());
            }
            
            logger.info("Successfully processed payment captured event");
            return true;
            
        } catch (Exception e) {
            logger.error("Error handling payment captured event: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Handles payment failed webhook event
     */
    private boolean handlePaymentFailed(JSONObject paymentData) {
        try {
            String razorpayPaymentId = paymentData.getString("id");
            String razorpayOrderId = paymentData.getString("order_id");
            String errorCode = paymentData.optString("error_code", "");
            String errorDescription = paymentData.optString("error_description", "");
            
            logger.info("Handling payment failed event: payment_id={}, order_id={}", razorpayPaymentId, razorpayOrderId);
            
            // Find payment by Razorpay order ID
            Optional<PaymentJpaEntity> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (paymentOpt.isEmpty()) {
                logger.warn("Payment not found for Razorpay order ID: {}", razorpayOrderId);
                return false;
            }
            
            PaymentJpaEntity payment = paymentOpt.get();
            
            // Update payment status
            payment.setStatus(PaymentStatus.FAILED);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setErrorCode(errorCode);
            payment.setErrorDescription(errorDescription);
            payment.setFailedAt(java.time.LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Update order status if order exists
            if (payment.getOrder() != null) {
                OrderJpaEntity order = payment.getOrder();
                order.setStatus(com.ecommerce.domain.order.OrderStatus.CANCELLED);
                orderRepository.save(order);
                logger.info("Updated order status to CANCELLED for order: {}", order.getOrderNumber());
            }
            
            logger.info("Successfully processed payment failed event");
            return true;
            
        } catch (Exception e) {
            logger.error("Error handling payment failed event: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Handles payment authorized webhook event
     */
    private boolean handlePaymentAuthorized(JSONObject paymentData) {
        try {
            String razorpayPaymentId = paymentData.getString("id");
            String razorpayOrderId = paymentData.getString("order_id");
            
            logger.info("Handling payment authorized event: payment_id={}, order_id={}", razorpayPaymentId, razorpayOrderId);
            
            // Find payment by Razorpay order ID
            Optional<PaymentJpaEntity> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (paymentOpt.isEmpty()) {
                logger.warn("Payment not found for Razorpay order ID: {}", razorpayOrderId);
                return false;
            }
            
            PaymentJpaEntity payment = paymentOpt.get();
            
            // Update payment status
            payment.setStatus(PaymentStatus.AUTHORIZED);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            paymentRepository.save(payment);
            
            logger.info("Successfully processed payment authorized event");
            return true;
            
        } catch (Exception e) {
            logger.error("Error handling payment authorized event: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Verifies webhook signature
     */
    private boolean verifyWebhookSignature(String payload, String signature) {
        try {
            if (signature == null || signature.isEmpty()) {
                logger.warn("No webhook signature provided");
                return false;
            }
            
            String expectedSignature = calculateHMAC(payload, razorpayConfig.getWebhookSecret());
            return expectedSignature.equals(signature);
            
        } catch (Exception e) {
            logger.error("Error verifying webhook signature: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Processes a refund for a payment
     * 
     * @param paymentId the payment ID to refund
     * @param refundAmount the amount to refund (optional, full refund if null)
     * @param reason the reason for refund (optional)
     * @return refund details
     */
    public RefundResponse processRefund(String paymentId, BigDecimal refundAmount, String reason) {
        try {
            logger.info("Processing refund for payment: {}, amount: {}", paymentId, refundAmount);
            
            // Find payment by payment ID
            Optional<PaymentJpaEntity> paymentOpt = paymentRepository.findByPaymentId(paymentId);
            if (paymentOpt.isEmpty()) {
                logger.warn("Payment not found for payment ID: {}", paymentId);
                return RefundResponse.failure("Payment not found");
            }
            
            PaymentJpaEntity payment = paymentOpt.get();
            
            // Validate payment status
            if (!payment.getStatus().isSuccessful()) {
                logger.warn("Cannot refund payment with status: {}", payment.getStatus());
                return RefundResponse.failure("Payment is not in a refundable state");
            }
            
            // Use full payment amount if refund amount not specified
            BigDecimal finalRefundAmount = refundAmount != null ? refundAmount : payment.getAmount();
            
            // Validate refund amount
            if (finalRefundAmount.compareTo(payment.getAmount()) > 0) {
                logger.warn("Refund amount {} exceeds payment amount {}", finalRefundAmount, payment.getAmount());
                return RefundResponse.failure("Refund amount exceeds payment amount");
            }
            
            // Check if using dummy credentials and return mock response
            if (razorpayConfig.isDummyCredentials()) {
                logger.info("Using dummy credentials - returning mock refund response");
                return createMockRefundResponse(payment, finalRefundAmount, reason);
            }
            
            // Process refund through Razorpay API
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", finalRefundAmount.multiply(new BigDecimal("100")).intValue()); // Convert to paise
            refundRequest.put("payment_id", payment.getRazorpayPaymentId());
            if (reason != null && !reason.trim().isEmpty()) {
                refundRequest.put("notes", new JSONObject().put("reason", reason));
            }
            
            // Create refund using Razorpay client
            com.razorpay.Refund refund = razorpayClient.refunds.create(refundRequest);
            
            // Update payment status
            String refundId = (String) refund.get("id");
            updatePaymentRefundStatus(payment, finalRefundAmount, refundId);
            
            logger.info("Successfully processed refund: {}", refundId);
            return RefundResponse.success(
                refundId,
                finalRefundAmount,
                (String) refund.get("status")
            );
            
        } catch (Exception e) {
            logger.error("Error processing refund: {}", e.getMessage(), e);
            return RefundResponse.error("Error processing refund: " + e.getMessage());
        }
    }

    /**
     * Creates a mock refund response for development
     */
    private RefundResponse createMockRefundResponse(PaymentJpaEntity payment, BigDecimal refundAmount, String reason) {
        logger.info("Creating mock refund response for development");
        
        String refundId = "rfnd_mock_" + System.currentTimeMillis();
        
        // Update payment status
        updatePaymentRefundStatus(payment, refundAmount, refundId);
        
        return RefundResponse.success(refundId, refundAmount, "processed");
    }

    /**
     * Updates payment refund status
     */
    private void updatePaymentRefundStatus(PaymentJpaEntity payment, BigDecimal refundAmount, String refundId) {
        BigDecimal totalRefunded = payment.getRefundAmount() != null ? payment.getRefundAmount() : BigDecimal.ZERO;
        totalRefunded = totalRefunded.add(refundAmount);
        
        payment.setRefundAmount(totalRefunded);
        payment.setRefundId(refundId);
        payment.setRefundedAt(java.time.LocalDateTime.now());
        
        // Update payment status based on refund amount
        if (totalRefunded.compareTo(payment.getAmount()) >= 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }
        
        paymentRepository.save(payment);
        logger.info("Updated payment refund status: payment_id={}, refund_amount={}, total_refunded={}", 
                   payment.getPaymentId(), refundAmount, totalRefunded);
    }
} 