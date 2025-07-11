package com.ecommerce.controller;

import com.ecommerce.application.dto.PaymentOrderRequest;
import com.ecommerce.application.dto.PaymentOrderResponse;
import com.ecommerce.application.dto.PaymentVerificationRequest;
import com.ecommerce.application.dto.PaymentVerificationResponse;
import com.ecommerce.application.service.RazorpayPaymentService;
import com.ecommerce.infrastructure.persistence.entity.PaymentJpaEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * REST controller for payment operations
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payment", description = "Payment management operations")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    private final RazorpayPaymentService razorpayPaymentService;
    
    @Autowired
    public PaymentController(RazorpayPaymentService razorpayPaymentService) {
        this.razorpayPaymentService = razorpayPaymentService;
    }
    
    /**
     * Creates a Razorpay order for payment
     * 
     * @param request the payment order request
     * @param userId the user ID
     * @param orderId the order ID
     * @return PaymentOrderResponse containing order details
     */
    @PostMapping("/create-order")
    @Operation(summary = "Create payment order", description = "Creates a Razorpay order for payment processing")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "404", description = "User or order not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @Valid @RequestBody PaymentOrderRequest request,
            @Parameter(description = "User ID", required = true)
            @RequestParam String userId,
            @Parameter(description = "Order ID", required = true)
            @RequestParam String orderId) {
        
        try {
            logger.info("Creating payment order for user: {}, order: {}", userId, orderId);
            
            PaymentOrderResponse response = razorpayPaymentService.createPaymentOrder(request, userId, orderId);
            
            logger.info("Payment order created successfully: {}", response.getOrderId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            logger.error("Invalid state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            logger.error("Error creating payment order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
    @PostMapping("/create-payment-order")
    @Operation(summary = "Create payment order without existing order", description = "Creates a Razorpay order for payment-first flow")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PaymentOrderResponse> createPaymentOrderWithoutExistingOrder(
            @Valid @RequestBody PaymentOrderRequest request,
            @Parameter(description = "User ID", required = true)
            @RequestParam String userId) {
        
        try {
            logger.info("Creating payment order without existing order for user: {}", userId);
            
            PaymentOrderResponse response = razorpayPaymentService.createPaymentOrderWithoutExistingOrder(request, userId);
            
            logger.info("Payment order created successfully: {}", response.getOrderId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating payment order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Verifies a Razorpay payment
     * 
     * @param request the payment verification request
     * @return PaymentVerificationResponse containing verification result
     */
    @PostMapping("/verify")
    @Operation(summary = "Verify payment", description = "Verifies a Razorpay payment using signature verification")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment verified successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or verification failed"),
        @ApiResponse(responseCode = "404", description = "Payment not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        
        try {
            logger.info("Verifying payment: {}", request.getRazorpayPaymentId());
            
            PaymentVerificationResponse response = razorpayPaymentService.verifyPayment(request);
            
            if (response.isVerified()) {
                logger.info("Payment verified successfully: {}", request.getRazorpayPaymentId());
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Payment verification failed: {}", request.getRazorpayPaymentId());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error verifying payment: {}", e.getMessage(), e);
            PaymentVerificationResponse errorResponse = PaymentVerificationResponse.error("Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Gets payment details by payment ID
     * 
     * @param paymentId the payment ID
     * @return Payment details
     */
    @GetMapping("/{paymentId}")
    @Operation(summary = "Get payment details", description = "Retrieves payment details by payment ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment found"),
        @ApiResponse(responseCode = "404", description = "Payment not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PaymentJpaEntity> getPayment(
            @Parameter(description = "Payment ID", required = true)
            @PathVariable String paymentId) {
        
        try {
            logger.info("Getting payment details for: {}", paymentId);
            
            Optional<PaymentJpaEntity> payment = razorpayPaymentService.getPaymentByPaymentId(paymentId);
            
            if (payment.isPresent()) {
                return ResponseEntity.ok(payment.get());
            } else {
                logger.warn("Payment not found: {}", paymentId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Error getting payment details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Gets payment details by Razorpay order ID
     * 
     * @param razorpayOrderId the Razorpay order ID
     * @return Payment details
     */
    @GetMapping("/order/{razorpayOrderId}")
    @Operation(summary = "Get payment by Razorpay order ID", description = "Retrieves payment details by Razorpay order ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment found"),
        @ApiResponse(responseCode = "404", description = "Payment not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PaymentJpaEntity> getPaymentByRazorpayOrderId(
            @Parameter(description = "Razorpay Order ID", required = true)
            @PathVariable String razorpayOrderId) {
        
        try {
            logger.info("Getting payment details for Razorpay order: {}", razorpayOrderId);
            
            Optional<PaymentJpaEntity> payment = razorpayPaymentService.getPaymentByRazorpayOrderId(razorpayOrderId);
            
            if (payment.isPresent()) {
                return ResponseEntity.ok(payment.get());
            } else {
                logger.warn("Payment not found for Razorpay order: {}", razorpayOrderId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Error getting payment details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Health check endpoint
     * 
     * @return Health status
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Checks if the payment service is healthy")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Payment service is healthy");
    }
} 