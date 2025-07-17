-- Migration to add variable dimension pricing support to products
-- This enables products with fixed height but variable length pricing

-- Add variable dimension fields to products table
ALTER TABLE products 
ADD COLUMN is_variable_dimension BOOLEAN DEFAULT FALSE COMMENT 'Whether this product uses variable dimension pricing',
ADD COLUMN fixed_height DECIMAL(10,3) NULL COMMENT 'Fixed height for variable dimension products (in specified unit)',
ADD COLUMN variable_dimension_rate DECIMAL(12,2) NULL COMMENT 'Rate per square unit for variable dimension products',
ADD COLUMN max_length DECIMAL(10,3) NULL COMMENT 'Maximum allowed length for variable dimension products',
ADD COLUMN dimension_unit ENUM('MILLIMETER', 'CENTIMETER', 'METER', 'INCH', 'FOOT', 'YARD') NULL COMMENT 'Unit of measurement for dimensions';

-- Add indexes for performance
CREATE INDEX idx_product_variable_dimension ON products(is_variable_dimension);
CREATE INDEX idx_product_dimension_unit ON products(dimension_unit);

-- Add constraints for data integrity
ALTER TABLE products 
ADD CONSTRAINT chk_variable_dimension_fields 
CHECK (
    (is_variable_dimension = FALSE) OR 
    (is_variable_dimension = TRUE AND fixed_height IS NOT NULL AND fixed_height > 0 AND 
     variable_dimension_rate IS NOT NULL AND variable_dimension_rate > 0 AND 
     max_length IS NOT NULL AND max_length > 0 AND 
     dimension_unit IS NOT NULL)
);

-- Add custom length fields to cart_items table
ALTER TABLE cart_items 
ADD COLUMN custom_length DECIMAL(10,3) NULL COMMENT 'Custom length selected by user for variable dimension products',
ADD COLUMN calculated_unit_price DECIMAL(19,2) NULL COMMENT 'Calculated unit price based on custom dimensions',
ADD COLUMN dimension_details JSON NULL COMMENT 'JSON object storing dimension calculation details';

-- Add custom length fields to order_items table  
ALTER TABLE order_items 
ADD COLUMN custom_length DECIMAL(10,3) NULL COMMENT 'Custom length selected by user for variable dimension products',
ADD COLUMN calculated_unit_price DECIMAL(19,2) NULL COMMENT 'Calculated unit price based on custom dimensions',
ADD COLUMN dimension_details JSON NULL COMMENT 'JSON object storing dimension calculation details';

-- Update existing products to have default values
UPDATE products 
SET is_variable_dimension = FALSE 
WHERE is_variable_dimension IS NULL;

-- Make is_variable_dimension NOT NULL after setting defaults
ALTER TABLE products 
MODIFY COLUMN is_variable_dimension BOOLEAN NOT NULL DEFAULT FALSE; 