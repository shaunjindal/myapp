-- Migration to update some products with varied tax rates based on product categories
-- This demonstrates the flexibility of product-level tax rates

-- Update electronics products to have 18% GST (standard rate)
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 18.00,
    base_amount = ROUND(p.price / 1.18, 2),
    tax_amount = ROUND((p.price / 1.18) * 0.18, 2)
WHERE LOWER(c.name) LIKE '%electronic%' 
   OR LOWER(c.name) LIKE '%mobile%' 
   OR LOWER(c.name) LIKE '%computer%'
   OR LOWER(c.name) LIKE '%gadget%';

-- Update books/education products to have 5% GST (reduced rate)
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 5.00,
    base_amount = ROUND(p.price / 1.05, 2),
    tax_amount = ROUND((p.price / 1.05) * 0.05, 2)
WHERE LOWER(c.name) LIKE '%book%' 
   OR LOWER(c.name) LIKE '%education%'
   OR LOWER(c.name) LIKE '%stationary%';

-- Update clothing products to have 12% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 12.00,
    base_amount = ROUND(p.price / 1.12, 2),
    tax_amount = ROUND((p.price / 1.12) * 0.12, 2)
WHERE LOWER(c.name) LIKE '%cloth%' 
   OR LOWER(c.name) LIKE '%fashion%'
   OR LOWER(c.name) LIKE '%apparel%'
   OR LOWER(c.name) LIKE '%garment%';

-- Update food/grocery products to have 5% GST
UPDATE products p
JOIN categories c ON p.category_id = c.id
SET 
    tax_rate = 5.00,
    base_amount = ROUND(p.price / 1.05, 2),
    tax_amount = ROUND((p.price / 1.05) * 0.05, 2)
WHERE LOWER(c.name) LIKE '%food%' 
   OR LOWER(c.name) LIKE '%grocery%'
   OR LOWER(c.name) LIKE '%snack%'
   OR LOWER(c.name) LIKE '%beverage%';

-- Ensure consistency: adjust any rounding differences
UPDATE products 
SET tax_amount = price - base_amount
WHERE ABS((base_amount + tax_amount) - price) > 0.01; 