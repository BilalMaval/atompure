-- Checkout: guest shipping address columns + atomic order placement

alter table orders
  add column shipping_full_name text,
  add column shipping_phone text,
  add column shipping_line1 text,
  add column shipping_line2 text,
  add column shipping_city text,
  add column shipping_province text,
  add column shipping_postal_code text,
  add column shipping_country text not null default 'PK';

create or replace function place_order(p_order jsonb, p_items jsonb)
returns orders
language plpgsql
security definer
as $$
declare
  v_order orders;
  v_item jsonb;
  v_updated integer;
begin
  insert into orders (
    order_number, customer_id, guest_email, payment_method,
    subtotal, shipping_total, discount_total, total, notes,
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
    (p_order->>'total')::numeric,
    p_order->>'notes',
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

    insert into order_items (order_id, product_variant_id, quantity, unit_price)
    values (
      v_order.id,
      (v_item->>'product_variant_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric
    );
  end loop;

  return v_order;
end;
$$;
