-- Baseline schema migration
-- This represents the existing schema before normalization

-- Note: If tables already exist, this migration will be skipped
-- This is for Flyway baseline purposes

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    long_description VARCHAR(2000),
    sku VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),
    category_id VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    max_stock_level INT DEFAULT 1000,
    weight DECIMAL(8,3),
    dimensions JSON,
    images JSON,
    specifications JSON,
    tags JSON,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT NOT NULL DEFAULT 0,
    meta_title VARCHAR(150),
    meta_description VARCHAR(300),
    meta_keywords VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0,
    
    INDEX idx_product_sku (sku),
    INDEX idx_product_category (category_id),
    INDEX idx_product_status (status),
    INDEX idx_product_brand (brand),
    INDEX idx_product_featured (featured),
    INDEX idx_product_price (price),
    INDEX idx_product_stock (stock_quantity)
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    parent_id VARCHAR(255),
    display_order INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(2048),
    meta_title VARCHAR(150),
    meta_description VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0,
    
    INDEX idx_category_parent (parent_id),
    INDEX idx_category_active (active),
    INDEX idx_category_order (display_order)
);

-- Add foreign key constraint for products -> categories
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE RESTRICT; 