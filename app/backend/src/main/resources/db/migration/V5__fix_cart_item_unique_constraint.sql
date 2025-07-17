-- Migration V5: Fix cart item unique constraint for variable dimension products
-- This migration removes the old constraint that only considered cart_id + product_id
-- and relies on the existing constraint that includes custom_length

-- Drop the old unique constraint that was preventing multiple items with different custom_length
DROP INDEX idx_cart_item_cart_product ON cart_items;

-- The new constraint idx_cart_item_cart_product_length (cart_id, product_id, custom_length) 
-- already exists and will handle both:
-- 1. Variable dimension products: allows multiple items with same product but different custom_length
-- 2. Regular products: allows single item per product (custom_length = NULL)

-- Verification query to check remaining constraints:
-- SHOW INDEX FROM cart_items WHERE Key_name LIKE '%cart_product%'; 