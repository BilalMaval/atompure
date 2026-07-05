-- RLS policies for AtomPure

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table coupons enable row level security;
alter table support_tickets enable row level security;
alter table blog_posts enable row level security;
alter table wishlists enable row level security;

-- profiles
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own_or_admin" on profiles
  for update using (id = auth.uid() or is_admin());

-- categories (public read of all; admin write)
create policy "categories_public_read" on categories
  for select using (true);
create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

-- products
create policy "products_public_read" on products
  for select using (is_active = true or is_admin());
create policy "products_admin_write" on products
  for all using (is_admin()) with check (is_admin());

-- product_variants
create policy "variants_public_read" on product_variants
  for select using (true);
create policy "variants_admin_write" on product_variants
  for all using (is_admin()) with check (is_admin());

-- product_images
create policy "images_public_read" on product_images
  for select using (true);
create policy "images_admin_write" on product_images
  for all using (is_admin()) with check (is_admin());

-- addresses (owner or admin)
create policy "addresses_owner_select" on addresses
  for select using (profile_id = auth.uid() or is_admin());
create policy "addresses_owner_write" on addresses
  for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

-- orders (owner or admin; guest orders only visible to admin)
create policy "orders_owner_select" on orders
  for select using (customer_id = auth.uid() or is_admin());
create policy "orders_owner_insert" on orders
  for insert with check (customer_id = auth.uid() or customer_id is null or is_admin());
create policy "orders_admin_update" on orders
  for update using (is_admin());

-- order_items (via parent order ownership)
create policy "order_items_owner_select" on order_items
  for select using (
    is_admin() or exists (
      select 1 from orders o where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );
create policy "order_items_insert" on order_items
  for insert with check (
    is_admin() or exists (
      select 1 from orders o where o.id = order_items.order_id and (o.customer_id = auth.uid() or o.customer_id is null)
    )
  );

-- reviews
create policy "reviews_public_read_approved" on reviews
  for select using (status = 'approved' or customer_id = auth.uid() or is_admin());
create policy "reviews_owner_insert" on reviews
  for insert with check (customer_id = auth.uid());
create policy "reviews_admin_moderate" on reviews
  for update using (is_admin());
create policy "reviews_admin_delete" on reviews
  for delete using (is_admin());

-- coupons (public read of active codes; admin write)
create policy "coupons_public_read_active" on coupons
  for select using ((expires_at is null or expires_at > now()) or is_admin());
create policy "coupons_admin_write" on coupons
  for all using (is_admin()) with check (is_admin());

-- support_tickets (anyone can insert; owner or admin can read; admin updates)
create policy "tickets_insert_anyone" on support_tickets
  for insert with check (true);
create policy "tickets_owner_or_admin_select" on support_tickets
  for select using (customer_id = auth.uid() or is_admin());
create policy "tickets_admin_update" on support_tickets
  for update using (is_admin());

-- blog_posts (public read of published; admin write)
create policy "blog_public_read_published" on blog_posts
  for select using (published_at is not null or is_admin());
create policy "blog_admin_write" on blog_posts
  for all using (is_admin()) with check (is_admin());

-- wishlists (owner only)
create policy "wishlists_owner_all" on wishlists
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
