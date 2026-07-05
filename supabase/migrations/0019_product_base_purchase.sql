-- Let a product be directly purchasable using its own price/SKU/stock,
-- without forcing the admin to add a separate "variant" first. A hidden
-- "default" variant row mirrors these fields so the existing variant-based
-- cart/checkout/order schema (order_items.product_variant_id) doesn't need
-- to change — variants become purely optional, for real variations only.
alter table products add column if not exists sku text;
alter table products add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0);

alter table product_variants add column if not exists is_default_variant boolean not null default false;
