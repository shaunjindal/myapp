-- Migration to populate existing products with price component data
-- This migration assigns reasonable default values for existing products

-- Update existing products with price components
-- We'll assume current price includes 18% GST (common in India)
-- Formula: base_amount = price / 1.18, tax_rate = 18%, tax_amount = base_amount * 0.18

UPDATE products 
SET 
    base_amount = ROUND(price / 1.18, 2),
    tax_rate = 18.00,
    tax_amount = ROUND((price / 1.18) * 0.18, 2)
WHERE base_amount IS NULL;

-- For any products where the calculation results in inconsistency, 
-- adjust tax_amount to make base_amount + tax_amount = price
UPDATE products 
SET tax_amount = price - base_amount
WHERE ABS((base_amount + tax_amount) - price) > 0.01;

-- Add NOT NULL constraints after populating data
ALTER TABLE products 
MODIFY COLUMN base_amount DECIMAL(12,2) NOT NULL,
MODIFY COLUMN tax_rate DECIMAL(5,2) NOT NULL,
MODIFY COLUMN tax_amount DECIMAL(12,2) NOT NULL;

-- Add constraints to ensure data integrity
ALTER TABLE products 
ADD CONSTRAINT chk_base_amount_positive CHECK (base_amount > 0),
ADD CONSTRAINT chk_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 100),
ADD CONSTRAINT chk_tax_amount_non_negative CHECK (tax_amount >= 0); 