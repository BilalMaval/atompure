-- Sale pricing: optional discounted price shown crossed-out against base_price.
alter table products add column if not exists sale_price numeric(10, 2) check (sale_price >= 0);

-- Per-product delivery charge overrides. Both optional — when null, checkout
-- falls back to the store-wide default (store_settings.flat_shipping_rate +
-- the free-shipping threshold).
alter table products add column if not exists delivery_charge numeric(10, 2) check (delivery_charge >= 0);
alter table products add column if not exists free_delivery_min_price numeric(10, 2) check (free_delivery_min_price >= 0);
