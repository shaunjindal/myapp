package com.ecommerce.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * JPA Entity for Product Images
 * Represents a single image associated with a product
 * Part of the normalized product schema
 */
@Entity
@Table(name = "product_images", indexes = {
    @Index(name = "idx_product_image_product_id", columnList = "product_id"),
    @Index(name = "idx_product_image_display_order", columnList = "product_id, display_order")
})
public class ProductImageJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    @NotNull(message = "Product is required")
    private ProductJpaEntity product;

    @NotBlank(message = "Image URL is required")
    @Size(max = 2048, message = "Image URL must not exceed 2048 characters")
    @Column(name = "image_url", nullable = false, length = 2048)
    private String imageUrl;

    @Size(max = 255, message = "Alt text must not exceed 255 characters")
    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Size(max = 50, message = "Image type must not exceed 50 characters")
    @Column(name = "image_type", length = 50)
    private String imageType; // e.g., "main", "thumbnail", "gallery"

    // File metadata
    @Column(name = "file_size")
    private Long fileSize;

    @Size(max = 20, message = "File format must not exceed 20 characters")
    @Column(name = "file_format", length = 20)
    private String fileFormat; // e.g., "jpg", "png", "webp"

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    // Default constructor
    public ProductImageJpaEntity() {
        super();
    }

    // Constructor
    public ProductImageJpaEntity(ProductJpaEntity product, String imageUrl, String altText, Integer displayOrder) {
        super();
        this.product = product;
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    // Getters and Setters
    public ProductJpaEntity getProduct() {
        return product;
    }

    public void setProduct(ProductJpaEntity product) {
        this.product = product;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(String fileFormat) {
        this.fileFormat = fileFormat;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        ProductImageJpaEntity that = (ProductImageJpaEntity) o;

        if (!product.equals(that.product)) return false;
        if (!imageUrl.equals(that.imageUrl)) return false;
        return displayOrder.equals(that.displayOrder);
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + product.hashCode();
        result = 31 * result + imageUrl.hashCode();
        result = 31 * result + displayOrder.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "ProductImageJpaEntity{" +
                "id='" + getId() + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", altText='" + altText + '\'' +
                ", displayOrder=" + displayOrder +
                ", isPrimary=" + isPrimary +
                ", imageType='" + imageType + '\'' +
                '}';
    }
} 