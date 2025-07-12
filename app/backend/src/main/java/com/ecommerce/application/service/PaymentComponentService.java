package com.ecommerce.application.service;

import com.ecommerce.application.dto.PaymentComponent;
import com.ecommerce.domain.common.Address;
import com.ecommerce.infrastructure.persistence.entity.CartJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.AddressJpaEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service class for payment component calculations
 * 
 * Handles calculation of:
 * - Tax rates and amounts
 * - Shipping costs  
 * - Discount calculations
 * - Fee calculations
 * - Component display names and descriptions
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Service
public class PaymentComponentService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentComponentService.class);
    
    // Tax configuration
    private static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("0.08"); // 8%
    private static final BigDecimal HIGH_TAX_RATE = new BigDecimal("0.10"); // 10%
    private static final BigDecimal LOW_TAX_RATE = new BigDecimal("0.05"); // 5%
    
    // Shipping configuration
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50.00");
    private static final BigDecimal STANDARD_SHIPPING_RATE = new BigDecimal("9.99");
    private static final BigDecimal EXPRESS_SHIPPING_RATE = new BigDecimal("19.99");
    
    /**
     * Calculate tax for a cart
     */
    public PaymentComponentResult calculateTax(CartJpaEntity cart, AddressJpaEntity address) {
        logger.debug("Calculating tax for cart: {} with address: {}", cart.getId(), address != null ? address.getId() : "none");
        
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal taxRate = determineTaxRate(address);
        BigDecimal taxAmount = subtotal.multiply(taxRate);
        
        String taxLabel = determineTaxLabel(address, taxRate);
        String taxDescription = determineTaxDescription(address, taxRate);
        
        logger.debug("Tax calculation result: rate={}, amount={}, label={}", taxRate, taxAmount, taxLabel);
        
        return new PaymentComponentResult(taxAmount, taxLabel, taxDescription);
    }
    
    /**
     * Calculate shipping for a cart
     */
    public PaymentComponentResult calculateShipping(CartJpaEntity cart, AddressJpaEntity address, String shippingMethod) {
        logger.debug("Calculating shipping for cart: {} with address: {} and method: {}", 
                    cart.getId(), address != null ? address.getId() : "none", shippingMethod);
        
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal shippingAmount = determineShippingAmount(subtotal, address, shippingMethod);
        
        String shippingLabel = determineShippingLabel(subtotal, shippingAmount, shippingMethod);
        String shippingDescription = determineShippingDescription(subtotal, shippingAmount, shippingMethod);
        
        logger.debug("Shipping calculation result: amount={}, label={}", shippingAmount, shippingLabel);
        
        return new PaymentComponentResult(shippingAmount, shippingLabel, shippingDescription);
    }
    
    /**
     * Calculate discount for a cart
     */
    public PaymentComponentResult calculateDiscount(CartJpaEntity cart, String discountCode) {
        logger.debug("Calculating discount for cart: {} with code: {}", cart.getId(), discountCode);
        
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal discountAmount = determineDiscountAmount(subtotal, discountCode);
        
        String discountLabel = determineDiscountLabel(discountCode, discountAmount);
        String discountDescription = determineDiscountDescription(discountCode, discountAmount);
        
        logger.debug("Discount calculation result: amount={}, label={}", discountAmount, discountLabel);
        
        return new PaymentComponentResult(discountAmount, discountLabel, discountDescription);
    }
    
    /**
     * Calculate processing fees for a cart
     */
    public PaymentComponentResult calculateProcessingFee(CartJpaEntity cart, String paymentMethod) {
        logger.debug("Calculating processing fee for cart: {} with payment method: {}", cart.getId(), paymentMethod);
        
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal feeAmount = determineProcessingFeeAmount(subtotal, paymentMethod);
        
        String feeLabel = determineProcessingFeeLabel(paymentMethod, feeAmount);
        String feeDescription = determineProcessingFeeDescription(paymentMethod, feeAmount);
        
        logger.debug("Processing fee calculation result: amount={}, label={}", feeAmount, feeLabel);
        
        return new PaymentComponentResult(feeAmount, feeLabel, feeDescription);
    }
    
    /**
     * Calculate all payment components for a cart
     */
    public Map<String, PaymentComponentResult> calculateAllComponents(CartJpaEntity cart, AddressJpaEntity address, 
                                                                     String shippingMethod, String discountCode, 
                                                                     String paymentMethod) {
        Map<String, PaymentComponentResult> components = new HashMap<>();
        
        // Calculate tax
        PaymentComponentResult tax = calculateTax(cart, address);
        components.put("tax", tax);
        
        // Calculate shipping
        PaymentComponentResult shipping = calculateShipping(cart, address, shippingMethod);
        components.put("shipping", shipping);
        
        // Calculate discount if applicable
        if (discountCode != null && !discountCode.trim().isEmpty()) {
            PaymentComponentResult discount = calculateDiscount(cart, discountCode);
            components.put("discount", discount);
        }
        
        // Calculate processing fee if applicable
        if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
            PaymentComponentResult fee = calculateProcessingFee(cart, paymentMethod);
            if (fee.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                components.put("fee", fee);
            }
        }
        
        return components;
    }
    
    /**
     * Calculate all payment components as a list of PaymentComponent DTOs
     */
    public List<PaymentComponent> calculatePaymentComponentsList(CartJpaEntity cart, AddressJpaEntity address, 
                                                               String shippingMethod, String discountCode, 
                                                               String paymentMethod) {
        List<PaymentComponent> components = new ArrayList<>();
        
        // Calculate tax
        PaymentComponentResult tax = calculateTax(cart, address);
        if (tax.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            components.add(new PaymentComponent("TAX", tax.getAmount(), tax.getLabel()));
        }
        
        // Calculate shipping
        PaymentComponentResult shipping = calculateShipping(cart, address, shippingMethod);
        if (shipping.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            components.add(new PaymentComponent("SHIPPING", shipping.getAmount(), shipping.getLabel()));
        } else if (shipping.getAmount().compareTo(BigDecimal.ZERO) == 0) {
            // Show free shipping
            components.add(new PaymentComponent("SHIPPING", BigDecimal.ZERO, shipping.getLabel()));
        }
        
        // Calculate discount if applicable
        if (discountCode != null && !discountCode.trim().isEmpty()) {
            PaymentComponentResult discount = calculateDiscount(cart, discountCode);
            if (discount.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                components.add(new PaymentComponent("DISCOUNT", discount.getAmount(), discount.getLabel(), true));
            }
        }
        
        // Calculate processing fee if applicable
        if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
            PaymentComponentResult fee = calculateProcessingFee(cart, paymentMethod);
            if (fee.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                components.add(new PaymentComponent("FEE", fee.getAmount(), fee.getLabel()));
            }
        }
        
        return components;
    }
    
    // Private helper methods
    private BigDecimal determineTaxRate(AddressJpaEntity address) {
        if (address == null) {
            return DEFAULT_TAX_RATE;
        }
        
        // Tax rate based on state/region
        String state = address.getState();
        if (state != null) {
            switch (state.toUpperCase()) {
                case "CA": // California
                case "NY": // New York
                    return HIGH_TAX_RATE;
                case "OR": // Oregon
                case "NH": // New Hampshire
                    return LOW_TAX_RATE;
                default:
                    return DEFAULT_TAX_RATE;
            }
        }
        
        return DEFAULT_TAX_RATE;
    }
    
    private String determineTaxLabel(AddressJpaEntity address, BigDecimal taxRate) {
        if (address == null) {
            return String.format("Tax (%.0f%%)", taxRate.multiply(new BigDecimal("100")).doubleValue());
        }
        
        String state = address.getState();
        if (state != null) {
            return String.format("%s Tax (%.0f%%)", state.toUpperCase(), taxRate.multiply(new BigDecimal("100")).doubleValue());
        }
        
        return String.format("Tax (%.0f%%)", taxRate.multiply(new BigDecimal("100")).doubleValue());
    }
    
    private String determineTaxDescription(AddressJpaEntity address, BigDecimal taxRate) {
        if (address == null) {
            return "Standard tax rate applied";
        }
        
        String state = address.getState();
        if (state != null) {
            return String.format("State tax for %s at %.1f%%", state.toUpperCase(), taxRate.multiply(new BigDecimal("100")).doubleValue());
        }
        
        return "Tax calculated based on shipping address";
    }
    
    private BigDecimal determineShippingAmount(BigDecimal subtotal, AddressJpaEntity address, String shippingMethod) {
        // Free shipping over threshold
        if (subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            return BigDecimal.ZERO;
        }
        
        // Shipping method specific rates
        if (shippingMethod != null) {
            switch (shippingMethod.toLowerCase()) {
                case "express":
                case "overnight":
                    return EXPRESS_SHIPPING_RATE;
                case "standard":
                case "ground":
                default:
                    return STANDARD_SHIPPING_RATE;
            }
        }
        
        return STANDARD_SHIPPING_RATE;
    }
    
    private String determineShippingLabel(BigDecimal subtotal, BigDecimal shippingAmount, String shippingMethod) {
        if (shippingAmount.compareTo(BigDecimal.ZERO) == 0) {
            return "Free Shipping";
        }
        
        if (shippingMethod != null) {
            switch (shippingMethod.toLowerCase()) {
                case "express":
                    return "Express Shipping";
                case "overnight":
                    return "Overnight Shipping";
                case "standard":
                case "ground":
                default:
                    return "Standard Shipping";
            }
        }
        
        return "Shipping";
    }
    
    private String determineShippingDescription(BigDecimal subtotal, BigDecimal shippingAmount, String shippingMethod) {
        if (shippingAmount.compareTo(BigDecimal.ZERO) == 0) {
            return String.format("Free shipping on orders over $%.2f", FREE_SHIPPING_THRESHOLD.doubleValue());
        }
        
        if (shippingMethod != null) {
            switch (shippingMethod.toLowerCase()) {
                case "express":
                    return "Express delivery within 2-3 business days";
                case "overnight":
                    return "Overnight delivery by next business day";
                case "standard":
                case "ground":
                default:
                    return "Standard delivery within 5-7 business days";
            }
        }
        
        return String.format("Standard shipping rate of $%.2f", shippingAmount.doubleValue());
    }
    
    private BigDecimal determineDiscountAmount(BigDecimal subtotal, String discountCode) {
        if (discountCode == null || discountCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // Sample discount codes
        switch (discountCode.toUpperCase()) {
            case "SAVE10":
                return subtotal.multiply(new BigDecimal("0.10")); // 10% off
            case "SAVE20":
                return subtotal.multiply(new BigDecimal("0.20")); // 20% off
            case "FIRST15":
                return subtotal.multiply(new BigDecimal("0.15")); // 15% off for first-time customers
            case "FLAT5":
                return new BigDecimal("5.00"); // $5 off
            case "FLAT10":
                return new BigDecimal("10.00"); // $10 off
            default:
                return BigDecimal.ZERO;
        }
    }
    
    private String determineDiscountLabel(String discountCode, BigDecimal discountAmount) {
        if (discountAmount.compareTo(BigDecimal.ZERO) == 0) {
            return "Discount";
        }
        
        if (discountCode != null) {
            switch (discountCode.toUpperCase()) {
                case "SAVE10":
                    return "Save 10% Discount";
                case "SAVE20":
                    return "Save 20% Discount";
                case "FIRST15":
                    return "First Customer Discount";
                case "FLAT5":
                    return "$5 Off Discount";
                case "FLAT10":
                    return "$10 Off Discount";
                default:
                    return String.format("%s Discount", discountCode.toUpperCase());
            }
        }
        
        return "Discount Applied";
    }
    
    private String determineDiscountDescription(String discountCode, BigDecimal discountAmount) {
        if (discountAmount.compareTo(BigDecimal.ZERO) == 0) {
            return "No discount applied";
        }
        
        if (discountCode != null) {
            switch (discountCode.toUpperCase()) {
                case "SAVE10":
                    return "10% discount on your order";
                case "SAVE20":
                    return "20% discount on your order";
                case "FIRST15":
                    return "15% discount for first-time customers";
                case "FLAT5":
                    return "$5 flat discount on your order";
                case "FLAT10":
                    return "$10 flat discount on your order";
                default:
                    return String.format("Discount code %s applied", discountCode.toUpperCase());
            }
        }
        
        return String.format("Discount of $%.2f applied", discountAmount.doubleValue());
    }
    
    private BigDecimal determineProcessingFeeAmount(BigDecimal subtotal, String paymentMethod) {
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // Some payment methods might have processing fees
        switch (paymentMethod.toLowerCase()) {
            case "cod":
            case "cash_on_delivery":
                return new BigDecimal("2.99"); // COD fee
            case "international_card":
                return subtotal.multiply(new BigDecimal("0.03")); // 3% international fee
            default:
                return BigDecimal.ZERO;
        }
    }
    
    private String determineProcessingFeeLabel(String paymentMethod, BigDecimal feeAmount) {
        if (feeAmount.compareTo(BigDecimal.ZERO) == 0) {
            return "Processing Fee";
        }
        
        if (paymentMethod != null) {
            switch (paymentMethod.toLowerCase()) {
                case "cod":
                case "cash_on_delivery":
                    return "Cash on Delivery Fee";
                case "international_card":
                    return "International Card Fee";
                default:
                    return "Processing Fee";
            }
        }
        
        return "Processing Fee";
    }
    
    private String determineProcessingFeeDescription(String paymentMethod, BigDecimal feeAmount) {
        if (feeAmount.compareTo(BigDecimal.ZERO) == 0) {
            return "No processing fee";
        }
        
        if (paymentMethod != null) {
            switch (paymentMethod.toLowerCase()) {
                case "cod":
                case "cash_on_delivery":
                    return "Additional fee for cash on delivery service";
                case "international_card":
                    return "3% fee for international card transactions";
                default:
                    return String.format("Processing fee of $%.2f", feeAmount.doubleValue());
            }
        }
        
        return String.format("Processing fee of $%.2f", feeAmount.doubleValue());
    }
    
    /**
     * Inner class to hold payment component calculation results
     */
    public static class PaymentComponentResult {
        private final BigDecimal amount;
        private final String label;
        private final String description;
        
        public PaymentComponentResult(BigDecimal amount, String label, String description) {
            this.amount = amount;
            this.label = label;
            this.description = description;
        }
        
        public BigDecimal getAmount() {
            return amount;
        }
        
        public String getLabel() {
            return label;
        }
        
        public String getDescription() {
            return description;
        }
    }
} 