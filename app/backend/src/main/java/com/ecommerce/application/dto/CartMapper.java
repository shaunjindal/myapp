package com.ecommerce.application.dto;

import com.ecommerce.application.service.PaymentComponentService;
import com.ecommerce.infrastructure.persistence.entity.CartJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.CartItemJpaEntity;
import com.ecommerce.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between Cart entities and DTOs
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
@Component
public class CartMapper {
    
    private final PaymentComponentService paymentComponentService;
    
    @Autowired
    public CartMapper(PaymentComponentService paymentComponentService) {
        this.paymentComponentService = paymentComponentService;
    }
    
    /**
     * Convert CartJpaEntity to CartDto
     */
    public CartDto toDto(CartJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        
        CartDto dto = new CartDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setSessionId(entity.getSessionId());
        dto.setStatus(entity.getStatus());
        dto.setSubtotal(entity.getSubtotal());
        dto.setTaxAmount(entity.getTaxAmount());
        dto.setShippingAmount(entity.getShippingAmount());
        dto.setDiscountAmount(entity.getDiscountAmount());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setDiscountCode(entity.getDiscountCode());
        dto.setTotalItems(entity.getTotalItemCount());
        dto.setUniqueItems(entity.getUniqueItemCount());
        dto.setGuestCart(entity.isGuestCart());
        dto.setHasDiscount(entity.getDiscountAmount() != null && entity.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0);
        dto.setExpiresAt(entity.getExpiresAt());
        dto.setLastActivityAt(entity.getLastActivityAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCurrency(entity.getCurrency());
        
        // Calculate payment components dynamically
        List<PaymentComponent> paymentComponents = paymentComponentService.calculatePaymentComponentsList(
            entity, null, null, entity.getDiscountCode(), null);
        dto.setPaymentComponents(paymentComponents);
        
        // Convert cart items
        if (entity.getItems() != null) {
            List<CartItemDto> itemDtos = entity.getItems().stream()
                    .map(this::toItemDto)
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        }
        
        return dto;
    }
    
    /**
     * Convert CartItemJpaEntity to CartItemDto
     */
    public CartItemDto toItemDto(CartItemJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        
        CartItemDto dto = new CartItemDto();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setTotalPrice(entity.getTotalPrice());
        dto.setOriginalPrice(entity.getPriceAtTime());
        dto.setDiscountAmount(entity.getDiscountAmount());
        dto.setSavingsAmount(entity.getSavingsAmount());
        dto.setIsGift(entity.getIsGift());
        dto.setGiftMessage(entity.getGiftMessage());
        dto.setAddedAt(entity.getAddedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Set product information
        ProductJpaEntity product = entity.getProduct();
        if (product != null) {
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            // Get the first image from the images list, or null if no images
            dto.setProductImageUrl(product.getImages() != null && !product.getImages().isEmpty() 
                ? product.getImages().get(0) : null);
            dto.setProductSku(product.getSku());
            dto.setProductBrand(product.getBrand()); // Add brand mapping
            dto.setIsAvailable(product.isAvailable());
            
            // Set price component information from product
            dto.setBaseAmount(product.getBaseAmount());
            dto.setTaxRate(product.getTaxRate());
            dto.setTaxAmount(product.getTaxAmount());
            dto.setIsPriceChanged(entity.isPriceChanged());
            
            // Set variable dimension product properties
            dto.setIsVariableDimension(product.isVariableDimension());
            dto.setFixedHeight(product.getFixedHeight());
            dto.setDimensionUnit(product.getDimensionUnit() != null ? product.getDimensionUnit().toString() : null);
            dto.setVariableDimensionRate(product.getVariableDimensionRate());
            dto.setMaxLength(product.getMaxLength());
            
            // Set unavailability reason if product is not available
            if (!product.isAvailable() || product.getStockQuantity() < entity.getQuantity()) {
                dto.setIsAvailable(false);
                if (!product.isAvailable()) {
                    dto.setUnavailabilityReason("Product is no longer available");
                } else if (product.getStockQuantity() < entity.getQuantity()) {
                    dto.setUnavailabilityReason("Insufficient stock (available: " + product.getStockQuantity() + ")");
                }
            } else {
                dto.setIsAvailable(true);
            }
        }
        
        // Map variable dimension fields
        dto.setCustomLength(entity.getCustomLength());
        dto.setCalculatedUnitPrice(entity.getCalculatedUnitPrice());
        dto.setDimensionDetails(entity.getDimensionDetails());
        
        return dto;
    }
    
    /**
     * Convert list of CartJpaEntity to list of CartDto
     */
    public List<CartDto> toDtoList(List<CartJpaEntity> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert list of CartItemJpaEntity to list of CartItemDto
     */
    public List<CartItemDto> toItemDtoList(List<CartItemJpaEntity> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Create a summary CartDto with minimal information (for performance)
     */
    public CartDto toSummaryDto(CartJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        
        CartDto dto = new CartDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setSessionId(entity.getSessionId());
        dto.setStatus(entity.getStatus());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setTotalItems(entity.getTotalItemCount());
        dto.setUniqueItems(entity.getUniqueItemCount());
        dto.setGuestCart(entity.isGuestCart());
        dto.setHasDiscount(entity.getDiscountAmount() != null && entity.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0);
        dto.setExpiresAt(entity.getExpiresAt());
        dto.setLastActivityAt(entity.getLastActivityAt());
        
        return dto;
    }
} 