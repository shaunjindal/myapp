-- Create recommendation tables for product recommendations

-- Main recommendation table to store recommendation relationships
CREATE TABLE product_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    source_product_id VARCHAR(36) NOT NULL,
    recommended_product_id VARCHAR(36) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL DEFAULT 'SIMILAR',
    score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (source_product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Ensure we don't recommend a product to itself
    CONSTRAINT chk_not_self_recommendation CHECK (source_product_id != recommended_product_id),
    
    -- Unique constraint to prevent duplicate recommendations
    UNIQUE KEY uk_product_recommendations (source_product_id, recommended_product_id, recommendation_type)
);

-- Index for faster lookups
CREATE INDEX idx_product_recommendations_source ON product_recommendations(source_product_id, active);
CREATE INDEX idx_product_recommendations_score ON product_recommendations(score DESC);
CREATE INDEX idx_product_recommendations_type ON product_recommendations(recommendation_type);

-- Recommendation metadata table for storing additional recommendation context
CREATE TABLE recommendation_metadata (
    id VARCHAR(36) PRIMARY KEY,
    recommendation_id VARCHAR(36) NOT NULL,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recommendation_id) REFERENCES product_recommendations(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_recommendation_metadata (recommendation_id, metadata_key)
);

-- Index for metadata lookups
CREATE INDEX idx_recommendation_metadata_key ON recommendation_metadata(metadata_key);

-- Insert some sample recommendations for existing products
-- This will be populated by the service layer based on business logic
INSERT INTO product_recommendations (id, source_product_id, recommended_product_id, recommendation_type, score, reason)
SELECT 
    UUID() as id,
    p1.id as source_product_id,
    p2.id as recommended_product_id,
    'SIMILAR' as recommendation_type,
    CASE 
        WHEN p1.category_id = p2.category_id THEN 0.8
        WHEN p1.brand = p2.brand THEN 0.7
        ELSE 0.5
    END as score,
    CASE 
        WHEN p1.category_id = p2.category_id THEN 'Same category'
        WHEN p1.brand = p2.brand THEN 'Same brand'
        ELSE 'Popular item'
    END as reason
FROM products p1
CROSS JOIN products p2
WHERE p1.id != p2.id
    AND p1.status = 'ACTIVE'
    AND p2.status = 'ACTIVE'
    AND p2.stock_quantity > 0
    AND (p1.category_id = p2.category_id OR p1.brand = p2.brand)
ORDER BY p1.id, 
    CASE 
        WHEN p1.category_id = p2.category_id THEN 0.8
        WHEN p1.brand = p2.brand THEN 0.7
        ELSE 0.5
    END DESC
LIMIT 1000; -- Limit to prevent too many recommendations initially 