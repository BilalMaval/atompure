-- Let the admin control the label shown for the base ("Standard") variant,
-- and the group title shown above the variant dropdown (e.g. "Size",
-- "Color", "Weight") instead of these being hardcoded.
alter table products add column if not exists base_variant_name text not null default 'Standard';
alter table products add column if not exists variant_option_label text not null default 'Size';
