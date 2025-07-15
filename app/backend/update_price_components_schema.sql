-- Complete schema update script for price components
-- This script can be run directly in MySQL to add price component support
-- Run this on your ecommerce database

USE ecommerce_db_dev; -- Change to your database name

-- Step 1: Add the new price component columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS base_amount DECIMAL(12,2) NULL COMMENT 'Base price before tax',
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) NULL COMMENT 'Tax rate percentage (0-100)',
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) NULL COMMENT 'Calculated tax amount';

-- Step 2: Populate existing products with default values (18% GST)
UPDATE products 
SET 
    base_amount = ROUND(price / 1.18, 2),
    tax_rate = 18.00,
    tax_amount = ROUND((price / 1.18) * 0.18, 2)
WHERE base_amount IS NULL;

-- Step 3: Fix any rounding inconsistencies
UPDATE products 
SET tax_amount = price - base_amount
WHERE ABS((base_amount + tax_amount) - price) > 0.01;

-- Step 4: Apply category-specific tax rates (if categories table exists)
-- Electronics: 18% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 18.00,
    base_amount = ROUND(p.price / 1.18, 2),
    tax_amount = ROUND((p.price / 1.18) * 0.18, 2)
WHERE LOWER(c.name) LIKE '%electronic%' 
   OR LOWER(c.name) LIKE '%mobile%' 
   OR LOWER(c.name) LIKE '%computer%'
   OR LOWER(c.name) LIKE '%gadget%'
   OR LOWER(c.name) LIKE '%phone%'
   OR LOWER(c.name) LIKE '%laptop%';

-- Books/Education: 5% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 5.00,
    base_amount = ROUND(p.price / 1.05, 2),
    tax_amount = ROUND((p.price / 1.05) * 0.05, 2)
WHERE LOWER(c.name) LIKE '%book%' 
   OR LOWER(c.name) LIKE '%education%'
   OR LOWER(c.name) LIKE '%stationary%'
   OR LOWER(c.name) LIKE '%study%';

-- Clothing: 12% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 12.00,
    base_amount = ROUND(p.price / 1.12, 2),
    tax_amount = ROUND((p.price / 1.12) * 0.12, 2)
WHERE LOWER(c.name) LIKE '%cloth%' 
   OR LOWER(c.name) LIKE '%fashion%'
   OR LOWER(c.name) LIKE '%apparel%'
   OR LOWER(c.name) LIKE '%garment%'
   OR LOWER(c.name) LIKE '%shirt%'
   OR LOWER(c.name) LIKE '%dress%';

-- Food/Grocery: 5% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 5.00,
    base_amount = ROUND(p.price / 1.05, 2),
    tax_amount = ROUND((p.price / 1.05) * 0.05, 2)
WHERE LOWER(c.name) LIKE '%food%' 
   OR LOWER(c.name) LIKE '%grocery%'
   OR LOWER(c.name) LIKE '%snack%'
   OR LOWER(c.name) LIKE '%beverage%'
   OR LOWER(c.name) LIKE '%fruit%'
   OR LOWER(c.name) LIKE '%vegetable%';

-- Personal Care: 18% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 18.00,
    base_amount = ROUND(p.price / 1.18, 2),
    tax_amount = ROUND((p.price / 1.18) * 0.18, 2)
WHERE LOWER(c.name) LIKE '%personal%' 
   OR LOWER(c.name) LIKE '%care%'
   OR LOWER(c.name) LIKE '%cosmetic%'
   OR LOWER(c.name) LIKE '%beauty%'
   OR LOWER(c.name) LIKE '%hygiene%';

-- Sports: 18% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 18.00,
    base_amount = ROUND(p.price / 1.18, 2),
    tax_amount = ROUND((p.price / 1.18) * 0.18, 2)
WHERE LOWER(c.name) LIKE '%sport%' 
   OR LOWER(c.name) LIKE '%fitness%'
   OR LOWER(c.name) LIKE '%gym%'
   OR LOWER(c.name) LIKE '%exercise%';

-- Final consistency check
UPDATE products 
SET tax_amount = price - base_amount
WHERE ABS((base_amount + tax_amount) - price) > 0.01;

-- Step 5: Add NOT NULL constraints
ALTER TABLE products 
MODIFY COLUMN base_amount DECIMAL(12,2) NOT NULL,
MODIFY COLUMN tax_rate DECIMAL(5,2) NOT NULL,
MODIFY COLUMN tax_amount DECIMAL(12,2) NOT NULL;

-- Step 6: Add data integrity constraints
ALTER TABLE products 
ADD CONSTRAINT IF NOT EXISTS chk_base_amount_positive CHECK (base_amount > 0),
ADD CONSTRAINT IF NOT EXISTS chk_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 100),
ADD CONSTRAINT IF NOT EXISTS chk_tax_amount_non_negative CHECK (tax_amount >= 0);

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_base_amount ON products(base_amount);
CREATE INDEX IF NOT EXISTS idx_product_tax_rate ON products(tax_rate);

-- Step 8: Display summary of changes
SELECT 
    'Price Components Update Summary' as summary,
    COUNT(*) as total_products,
    COUNT(DISTINCT tax_rate) as unique_tax_rates,
    MIN(tax_rate) as min_tax_rate,
    MAX(tax_rate) as max_tax_rate,
    AVG(tax_rate) as avg_tax_rate,
    SUM(base_amount) as total_base_amount,
    SUM(tax_amount) as total_tax_amount,
    SUM(price) as total_price
FROM products;

-- Display products by tax rate
SELECT 
    tax_rate,
    COUNT(*) as product_count,
    AVG(base_amount) as avg_base_amount,
    AVG(tax_amount) as avg_tax_amount,
    AVG(price) as avg_total_price
FROM products
GROUP BY tax_rate
ORDER BY tax_rate;

-- Show sample products with their price breakdown
SELECT 
    id,
    name,
    sku,
    base_amount,
    tax_rate,
    tax_amount,
    price,
    (base_amount + tax_amount) as calculated_price,
    ABS((base_amount + tax_amount) - price) as price_difference
FROM products
ORDER BY id
LIMIT 10; 