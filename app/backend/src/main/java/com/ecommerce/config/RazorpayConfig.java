package com.ecommerce.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Razorpay integration
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Configuration
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(RazorpayConfig.class);
    
    private String keyId;
    private String keySecret;
    private String webhookSecret;
    private String currency = "INR";
    private boolean autoCapture = true;
    private int captureTimeoutMinutes = 5;
    
    /**
     * Creates and configures the Razorpay client bean
     * 
     * @return RazorpayClient instance
     * @throws RazorpayException if client initialization fails
     */
    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId == null || keyId.trim().isEmpty()) {
            throw new IllegalArgumentException("Razorpay key ID is required");
        }
        if (keySecret == null || keySecret.trim().isEmpty()) {
            throw new IllegalArgumentException("Razorpay key secret is required");
        }
        
        // Check if using dummy credentials
        if (isDummyCredentials()) {
            logger.warn("Using dummy Razorpay credentials - will use mock responses in service layer");
            // Still create a real client but the service will intercept calls
            return new RazorpayClient(keyId, keySecret);
        }
        
        logger.info("Initializing Razorpay client with key ID: {}", keyId);
        return new RazorpayClient(keyId, keySecret);
    }
    
    /**
     * Checks if using dummy/placeholder credentials
     */
    public boolean isDummyCredentials() {
        return keyId.contains("dummy") || keySecret.contains("dummy") || 
               keyId.startsWith("rzp_test_dummy") || keySecret.equals("dummy_key_secret");
    }
    
    // Getters and setters for configuration properties
    public String getKeyId() {
        return keyId;
    }
    
    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }
    
    public String getKeySecret() {
        return keySecret;
    }
    
    public void setKeySecret(String keySecret) {
        this.keySecret = keySecret;
    }
    
    public String getWebhookSecret() {
        return webhookSecret;
    }
    
    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public boolean isAutoCapture() {
        return autoCapture;
    }
    
    public void setAutoCapture(boolean autoCapture) {
        this.autoCapture = autoCapture;
    }
    
    public int getCaptureTimeoutMinutes() {
        return captureTimeoutMinutes;
    }
    
    public void setCaptureTimeoutMinutes(int captureTimeoutMinutes) {
        this.captureTimeoutMinutes = captureTimeoutMinutes;
    }
} 