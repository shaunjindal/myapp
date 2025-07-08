-- Migration script to normalize product schema
-- This script creates new normalized tables and migrates data from JSON columns

-- Create product_dimensions table
CREATE TABLE product_dimensions (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    length DECIMAL(10,3) NOT NULL,
    width DECIMAL(10,3) NOT NULL,
    height DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    volume DECIMAL(15,6),
    longest_dimension DECIMAL(10,3),
    shortest_dimension DECIMAL(10,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0,
    
    CONSTRAINT fk_product_dimensions_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product_dimension_product_id (product_id)
);

-- Create product_images table
CREATE TABLE product_images (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(2048) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    image_type VARCHAR(50),
    file_size BIGINT,
    file_format VARCHAR(20),
    width INT,
    height INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0,
    
    CONSTRAINT fk_product_images_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product_image_product_id (product_id),
    INDEX idx_product_image_display_order (product_id, display_order)
);

-- Create product_specifications table
CREATE TABLE product_specifications (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    spec_key VARCHAR(100) NOT NULL,
    spec_value VARCHAR(1000) NOT NULL,
    spec_category VARCHAR(50),
    data_type VARCHAR(20),
    unit VARCHAR(20),
    display_order INT NOT NULL DEFAULT 0,
    is_searchable BOOLEAN NOT NULL DEFAULT FALSE,
    is_filterable BOOLEAN NOT NULL DEFAULT FALSE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0,
    
    CONSTRAINT fk_product_specifications_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product_spec_product_id (product_id),
    INDEX idx_product_spec_key (product_id, spec_key),
    INDEX idx_product_spec_category (spec_category)
);

-- Create product_tags table
CREATE TABLE product_tags (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    tag_category VARCHAR(30),
    description VARCHAR(200),
    is_searchable BOOLEAN NOT NULL DEFAULT TRUE,
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT DEFAULT 0,
    
    CONSTRAINT fk_product_tags_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product_tag_product_id (product_id),
    INDEX idx_product_tag_name (tag_name),
    INDEX idx_product_tag_category (tag_category)
);

-- Migrate data from JSON columns to normalized tables
-- Note: This is a simplified migration. In a production environment, you might need more sophisticated JSON parsing.

-- Migrate product dimensions (only if dimensions JSON is not null/empty)
INSERT INTO product_dimensions (id, product_id, length, width, height, unit, volume, longest_dimension, shortest_dimension, created_at, updated_at, version)
SELECT 
    CONCAT('dim-', p.id) as id,
    p.id as product_id,
    CAST(JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.length')) AS DECIMAL(10,3)) as length,
    CAST(JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.width')) AS DECIMAL(10,3)) as width,
    CAST(JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.height')) AS DECIMAL(10,3)) as height,
    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.unit')), 'CM') as unit,
    CAST(JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.volume')) AS DECIMAL(15,6)) as volume,
    CAST(JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.longestDimension')) AS DECIMAL(10,3)) as longest_dimension,
    CAST(JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.shortestDimension')) AS DECIMAL(10,3)) as shortest_dimension,
    NOW() as created_at,
    NOW() as updated_at,
    0 as version
FROM products p
WHERE p.dimensions IS NOT NULL 
  AND JSON_VALID(p.dimensions)
  AND JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.length')) IS NOT NULL
  AND JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.width')) IS NOT NULL
  AND JSON_UNQUOTE(JSON_EXTRACT(p.dimensions, '$.height')) IS NOT NULL;

-- Migrate product images from JSON array
INSERT INTO product_images (id, product_id, image_url, display_order, is_primary, created_at, updated_at, version)
SELECT 
    CONCAT('img-', p.id, '-', (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY j.idx))) as id,
    p.id as product_id,
    j.image_url,
    j.idx as display_order,
    CASE WHEN j.idx = 0 THEN TRUE ELSE FALSE END as is_primary,
    NOW() as created_at,
    NOW() as updated_at,
    0 as version
FROM products p
CROSS JOIN JSON_TABLE(
    p.images,
    '$[*]' COLUMNS (
        idx FOR ORDINALITY,
        image_url VARCHAR(2048) PATH '$'
    )
) j
WHERE p.images IS NOT NULL 
  AND JSON_VALID(p.images)
  AND JSON_LENGTH(p.images) > 0;

-- Migrate product specifications from JSON object
INSERT INTO product_specifications (id, product_id, spec_key, spec_value, is_visible, created_at, updated_at, version)
SELECT 
    CONCAT('spec-', p.id, '-', REPLACE(j.spec_key, ' ', '-')) as id,
    p.id as product_id,
    j.spec_key,
    j.spec_value,
    TRUE as is_visible,
    NOW() as created_at,
    NOW() as updated_at,
    0 as version
FROM products p
CROSS JOIN JSON_TABLE(
    p.specifications,
    '$.*' COLUMNS (
        spec_key VARCHAR(100) PATH '$',
        spec_value VARCHAR(1000) PATH '$'
    )
) j
WHERE p.specifications IS NOT NULL 
  AND JSON_VALID(p.specifications)
  AND JSON_LENGTH(p.specifications) > 0;

-- Migrate product tags from JSON array
INSERT INTO product_tags (id, product_id, tag_name, is_visible, created_at, updated_at, version)
SELECT 
    CONCAT('tag-', p.id, '-', REPLACE(j.tag_name, ' ', '-')) as id,
    p.id as product_id,
    j.tag_name,
    TRUE as is_visible,
    NOW() as created_at,
    NOW() as updated_at,
    0 as version
FROM products p
CROSS JOIN JSON_TABLE(
    p.tags,
    '$[*]' COLUMNS (
        tag_name VARCHAR(50) PATH '$'
    )
) j
WHERE p.tags IS NOT NULL 
  AND JSON_VALID(p.tags)
  AND JSON_LENGTH(p.tags) > 0;

-- After successful migration, drop the JSON columns from products table
-- Note: Uncomment these lines after verifying the migration is successful
-- ALTER TABLE products DROP COLUMN dimensions;
-- ALTER TABLE products DROP COLUMN images;
-- ALTER TABLE products DROP COLUMN specifications;
-- ALTER TABLE products DROP COLUMN tags;

-- Add comments to the new tables
ALTER TABLE product_dimensions COMMENT = 'Normalized product dimensions table';
ALTER TABLE product_images COMMENT = 'Normalized product images table';
ALTER TABLE product_specifications COMMENT = 'Normalized product specifications table';
ALTER TABLE product_tags COMMENT = 'Normalized product tags table';

-- Create indexes for better performance
CREATE INDEX idx_product_images_primary ON product_images (product_id, is_primary);
CREATE INDEX idx_product_specifications_searchable ON product_specifications (is_searchable);
CREATE INDEX idx_product_specifications_filterable ON product_specifications (is_filterable);
CREATE INDEX idx_product_tags_searchable ON product_tags (is_searchable);
CREATE INDEX idx_product_tags_filterable ON product_tags (is_filterable);

-- Insert some default data if tables are empty (optional)
-- This can be useful for testing
INSERT IGNORE INTO product_dimensions (id, product_id, length, width, height, unit, volume, longest_dimension, shortest_dimension, created_at, updated_at, version)
SELECT 
    CONCAT('dim-default-', p.id) as id,
    p.id as product_id,
    10.0 as length,
    10.0 as width,
    10.0 as height,
    'CM' as unit,
    1000.0 as volume,
    10.0 as longest_dimension,
    10.0 as shortest_dimension,
    NOW() as created_at,
    NOW() as updated_at,
    0 as version
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_dimensions pd WHERE pd.product_id = p.id
)
LIMIT 0; -- Set to appropriate limit or remove this line to apply to all products

-- Note: This migration script assumes MySQL 8.0+ for JSON_TABLE support
-- For older MySQL versions, you might need to use alternative approaches or update MySQL first 