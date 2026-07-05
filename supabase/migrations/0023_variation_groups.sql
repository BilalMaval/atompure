-- Reusable variation system: admin defines Variation Groups once (e.g.
-- "Size", "Color"), each with an ordered set of Values and a display
-- layout (horizontal pills vs vertical list), then assigns one or more
-- groups to any product, in whatever order that product should show them.
-- A product's variants are then linked to a specific combination of values
-- (one per assigned group) instead of a single free-text name.
create table variation_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  layout text not null default 'horizontal' check (layout in ('horizontal', 'vertical')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table variation_values (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references variation_groups (id) on delete cascade,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index variation_values_group_id_idx on variation_values (group_id);

create table product_variation_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  group_id uuid not null references variation_groups (id) on delete cascade,
  sort_order integer not null default 0,
  unique (product_id, group_id)
);
create index product_variation_groups_product_id_idx on product_variation_groups (product_id);

create table product_variant_values (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants (id) on delete cascade,
  value_id uuid not null references variation_values (id) on delete cascade,
  unique (variant_id, value_id)
);
create index product_variant_values_variant_id_idx on product_variant_values (variant_id);

alter table variation_groups enable row level security;
alter table variation_values enable row level security;
alter table product_variation_groups enable row level security;
alter table product_variant_values enable row level security;

create policy "variation_groups_public_read" on variation_groups for select using (true);
create policy "variation_groups_admin_write" on variation_groups for all using (is_admin()) with check (is_admin());

create policy "variation_values_public_read" on variation_values for select using (true);
create policy "variation_values_admin_write" on variation_values for all using (is_admin()) with check (is_admin());

create policy "product_variation_groups_public_read" on product_variation_groups for select using (true);
create policy "product_variation_groups_admin_write" on product_variation_groups for all using (is_admin()) with check (is_admin());

create policy "product_variant_values_public_read" on product_variant_values for select using (true);
create policy "product_variant_values_admin_write" on product_variant_values for all using (is_admin()) with check (is_admin());
