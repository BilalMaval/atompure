-- The auto-managed base-product variant is now always shown to customers
-- (alongside any real variants) instead of being hidden, so it needs a
-- customer-presentable name instead of the internal placeholder "Default".
update product_variants
set name = 'Standard'
where is_default_variant = true and name = 'Default';
