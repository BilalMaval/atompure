-- Variant images + order item snapshot (image, product name, variant name)
-- Also fixes FK so variants/products can be deleted without blocking on order history.

-- 1. Variant-level image
alter table product_variants
  add column if not exists image_url text;

-- 2. Snapshot columns on order_items (nullable — old rows stay intact)
alter table order_items
  add column if not exists image_url     text,
  add column if not exists product_name  text,
  add column if not exists variant_name  text;

-- 3. Allow deleting variants: set null on order_items instead of blocking
alter table order_items
  drop constraint if exists order_items_product_variant_id_fkey;

alter table order_items
  alter column product_variant_id drop not null;

alter table order_items
  add constraint order_items_product_variant_id_fkey
    foreign key (product_variant_id)
    references product_variants(id)
    on delete set null;

-- 4. Update place_order to store snapshot fields from p_items
create or replace function place_order(p_order jsonb, p_items jsonb)
returns orders
language plpgsql
security definer
as $$
declare
  v_order orders;
  v_item  jsonb;
  v_updated integer;
begin
  insert into orders (
    order_number, customer_id, guest_email, payment_method,
    subtotal, shipping_total, discount_total, tax_total, total, notes,
    coupon_code,
    shipping_full_name, shipping_phone, shipping_line1, shipping_line2,
    shipping_city, shipping_province, shipping_postal_code, shipping_country
  )
  values (
    p_order->>'order_number',
    (p_order->>'customer_id')::uuid,
    p_order->>'guest_email',
    (p_order->>'payment_method')::payment_method,
    (p_order->>'subtotal')::numeric,
    (p_order->>'shipping_total')::numeric,
    (p_order->>'discount_total')::numeric,
    coalesce((p_order->>'tax_total')::numeric, 0),
    (p_order->>'total')::numeric,
    p_order->>'notes',
    p_order->>'coupon_code',
    p_order->>'shipping_full_name',
    p_order->>'shipping_phone',
    p_order->>'shipping_line1',
    p_order->>'shipping_line2',
    p_order->>'shipping_city',
    p_order->>'shipping_province',
    p_order->>'shipping_postal_code',
    coalesce(p_order->>'shipping_country', 'PK')
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    update product_variants
    set stock_quantity = stock_quantity - (v_item->>'quantity')::integer
    where id = (v_item->>'product_variant_id')::uuid
      and stock_quantity >= (v_item->>'quantity')::integer;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'insufficient_stock:%', v_item->>'product_variant_id';
    end if;

    insert into order_items (
      order_id, product_variant_id, quantity, unit_price,
      image_url, product_name, variant_name
    )
    values (
      v_order.id,
      (v_item->>'product_variant_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric,
      v_item->>'image_url',
      v_item->>'product_name',
      v_item->>'variant_name'
    );
  end loop;

  return v_order;
end;
$$;
