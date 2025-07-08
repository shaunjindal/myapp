package com.ecommerce.domain.recommendation;

/**
 * Enum representing different types of product recommendations
 */
public enum RecommendationType {
    SIMILAR("Similar products based on category or attributes"),
    FREQUENTLY_BOUGHT_TOGETHER("Products frequently bought together"),
    VIEWED_TOGETHER("Products viewed together by users"),
    BRAND_RELATED("Products from the same brand"),
    CATEGORY_RELATED("Products from the same category"),
    PRICE_SIMILAR("Products in similar price range"),
    TRENDING("Currently trending products"),
    SEASONAL("Seasonal recommendations"),
    PERSONALIZED("Personalized recommendations based on user behavior");

    private final String description;

    RecommendationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 