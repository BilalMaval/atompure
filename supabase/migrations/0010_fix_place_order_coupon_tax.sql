-- place_order() predates coupon_code/tax_total being passed from checkout;
-- it silently dropped them since they weren't in its INSERT column list.
-- Verified via a live test order where coupon_code came back null despite
-- a coupon being applied. Update the function to persist both.

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

-- Increment coupon usage count when a coupon was applied to an order.
create or replace function increment_coupon_usage()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.coupon_code is not null then
    update coupons set times_used = times_used + 1 where code = new.coupon_code;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_coupon_applied on orders;
create trigger on_order_coupon_applied
  after insert on orders
  for each row execute procedure increment_coupon_usage();
