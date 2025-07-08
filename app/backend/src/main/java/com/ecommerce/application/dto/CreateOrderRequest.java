package com.ecommerce.application.dto;

import com.ecommerce.domain.order.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO for creating a new order
 */
public class CreateOrderRequest {

    @NotBlank(message = "Billing address ID is required")
    private String billingAddressId;

    @NotBlank(message = "Shipping address ID is required")
    private String shippingAddressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Size(max = 1000, message = "Customer notes must not exceed 1000 characters")
    private String customerNotes;

    @Size(max = 50, message = "Discount code must not exceed 50 characters")
    private String discountCode;

    // For direct orders (not from cart)
    private List<OrderItemRequest> items;

    // Constructors
    public CreateOrderRequest() {
    }

    public CreateOrderRequest(String billingAddressId, String shippingAddressId, 
                            PaymentMethod paymentMethod, String customerNotes) {
        this.billingAddressId = billingAddressId;
        this.shippingAddressId = shippingAddressId;
        this.paymentMethod = paymentMethod;
        this.customerNotes = customerNotes;
    }

    // Getters and Setters
    public String getBillingAddressId() {
        return billingAddressId;
    }

    public void setBillingAddressId(String billingAddressId) {
        this.billingAddressId = billingAddressId;
    }

    public String getShippingAddressId() {
        return shippingAddressId;
    }

    public void setShippingAddressId(String shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCustomerNotes() {
        return customerNotes;
    }

    public void setCustomerNotes(String customerNotes) {
        this.customerNotes = customerNotes;
    }

    public String getDiscountCode() {
        return discountCode;
    }

    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    // Nested class for order items
    public static class OrderItemRequest {
        @NotBlank(message = "Product ID is required")
        private String productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private boolean isGift = false;

        @Size(max = 500, message = "Gift message must not exceed 500 characters")
        private String giftMessage;

        // Constructors
        public OrderItemRequest() {
        }

        public OrderItemRequest(String productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        // Getters and Setters
        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public boolean isGift() {
            return isGift;
        }

        public void setGift(boolean gift) {
            isGift = gift;
        }

        public String getGiftMessage() {
            return giftMessage;
        }

        public void setGiftMessage(String giftMessage) {
            this.giftMessage = giftMessage;
        }
    }
} 