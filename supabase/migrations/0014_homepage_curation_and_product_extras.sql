-- Product page additions: benefits copy (replaces Ingredients in the UI,
-- since ingredient info can live in Description) + an optional before/after
-- result image shown as a full-width banner on the product page.
alter table products add column if not exists benefits text;
alter table products add column if not exists before_after_image_url text;

-- Atombook (homepage featured products) curation: admin picks a subset of
-- products and an explicit display order for the homepage product row.
create table homepage_featured_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references products (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table homepage_featured_products enable row level security;

create policy "homepage_featured_products_public_read" on homepage_featured_products
  for select using (true);

create policy "homepage_featured_products_admin_write" on homepage_featured_products
  for all using (is_admin()) with check (is_admin());

-- Same curation system for the homepage category showcase row.
create table homepage_featured_categories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null unique references categories (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table homepage_featured_categories enable row level security;

create policy "homepage_featured_categories_public_read" on homepage_featured_categories
  for select using (true);

create policy "homepage_featured_categories_admin_write" on homepage_featured_categories
  for all using (is_admin()) with check (is_admin());

-- Results gallery: admin-managed row of 1:1 "real results" images shown
-- in a slow marquee at the bottom of the homepage.
create table results_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table results_gallery enable row level security;

create policy "results_gallery_public_read_active" on results_gallery
  for select using (is_active = true or is_admin());

create policy "results_gallery_admin_write" on results_gallery
  for all using (is_admin()) with check (is_admin());

-- Storage bucket for results-gallery images and product before/after images.
insert into storage.buckets (id, name, public)
values ('results-gallery', 'results-gallery', true)
on conflict (id) do nothing;

create policy "results_gallery_images_public_read" on storage.objects
  for select using (bucket_id = 'results-gallery');

create policy "results_gallery_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'results-gallery' and is_admin());

create policy "results_gallery_images_admin_update" on storage.objects
  for update using (bucket_id = 'results-gallery' and is_admin());

create policy "results_gallery_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'results-gallery' and is_admin());
