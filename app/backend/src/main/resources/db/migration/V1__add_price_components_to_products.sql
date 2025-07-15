-- Migration to add price component fields to products table
-- This enables separate tracking of base amount, tax rate, and tax amount

-- Add the new price component columns
ALTER TABLE products 
ADD COLUMN base_amount DECIMAL(12,2) NULL COMMENT 'Base price before tax',
ADD COLUMN tax_rate DECIMAL(5,2) NULL COMMENT 'Tax rate percentage (0-100)',
ADD COLUMN tax_amount DECIMAL(12,2) NULL COMMENT 'Calculated tax amount';

-- Add indexes for performance on the new columns
CREATE INDEX idx_product_base_amount ON products(base_amount);
CREATE INDEX idx_product_tax_rate ON products(tax_rate); 