-- Explicit "free home delivery" toggle per product. When true, this product
-- always ships free regardless of any delivery_charge/free_delivery_min_price
-- set on it, and a badge is shown on the product page.
alter table products add column if not exists free_home_delivery boolean not null default false;
