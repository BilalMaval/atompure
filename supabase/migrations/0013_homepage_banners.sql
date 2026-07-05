-- Homepage banners: admin-editable CMS for the homepage promo banner row.

create table homepage_banners (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  mode text not null default 'split' check (mode in ('split', 'image')),
  product_id uuid references products(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  custom_link text,
  heading text,
  heading_size text not null default 'lg' check (heading_size in ('sm','md','lg','xl')),
  heading_position text not null default 'left' check (heading_position in ('left','center','right')),
  background_color text not null default 'sage' check (background_color in ('sage','cream','beige')),
  background_image_url text,
  image_url text,
  image_position text not null default 'left' check (image_position in ('left','right')),
  button_text text not null default 'Shop Now',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table homepage_banners enable row level security;

create policy "homepage_banners_public_read_active" on homepage_banners
  for select using (is_active = true or is_admin());

create policy "homepage_banners_admin_write" on homepage_banners
  for all using (is_admin()) with check (is_admin());

-- Storage bucket for whole-banner images / split-mode side images.
insert into storage.buckets (id, name, public)
values ('banner-images', 'banner-images', true)
on conflict (id) do nothing;

create policy "banner_images_public_read" on storage.objects
  for select using (bucket_id = 'banner-images');

create policy "banner_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'banner-images' and is_admin());

create policy "banner_images_admin_update" on storage.objects
  for update using (bucket_id = 'banner-images' and is_admin());

create policy "banner_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'banner-images' and is_admin());

-- Seed one banner per existing product, alternating image side to match
-- the previous hardcoded zig-zag layout.
insert into homepage_banners (sort_order, mode, product_id, image_position)
select 0, 'split', id, 'left' from products where slug = 'atom-pure-hair-oil'
union all
select 1, 'split', id, 'right' from products where slug = 'atom-pure-mustard-oil'
union all
select 2, 'split', id, 'left' from products where slug = 'smileup-teeth-whitening-powder';
