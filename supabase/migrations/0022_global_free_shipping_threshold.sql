-- Make the storewide "free shipping above X" threshold admin-editable
-- instead of hardcoded in the codebase.
alter table store_settings add column if not exists free_shipping_threshold numeric(10, 2) not null default 2500;
