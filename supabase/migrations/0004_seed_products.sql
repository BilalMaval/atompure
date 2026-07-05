-- Seed initial AtomPure catalog

insert into categories (id, name, slug, sort_order, seo_title, seo_description)
values
  ('11111111-1111-1111-1111-111111111111', 'Oral Care', 'oral-care', 1, 'Oral Care', 'Natural, organic oral care products.'),
  ('22222222-2222-2222-2222-222222222222', 'Hair Care', 'hair-care', 2, 'Hair Care', 'Natural, organic hair care products.'),
  ('33333333-3333-3333-3333-333333333333', 'Kitchen & Wellness', 'kitchen-wellness', 3, 'Kitchen & Wellness', 'Pure, cold-pressed oils for everyday wellness.')
on conflict (slug) do nothing;

insert into products (id, category_id, name, slug, description, ingredients, how_to_use, base_price, is_active, seo_title, seo_description)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'SmileUp Teeth Whitening Powder',
    'smileup-teeth-whitening-powder',
    'A gentle, natural teeth whitening powder formulated to lift surface stains and brighten your smile without harsh chemicals or abrasives.',
    'Activated charcoal, bentonite clay, baking soda, peppermint oil, neem extract.',
    'Wet your toothbrush, dip into the powder, and brush gently for 2 minutes. Use 2-3 times per week. Rinse thoroughly.',
    899.00,
    true,
    'SmileUp Teeth Whitening Powder',
    'Natural teeth whitening powder with activated charcoal and neem. Brighten your smile, naturally.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Atom Pure Hair Oil',
    'atom-pure-hair-oil',
    'A nourishing blend of cold-pressed natural oils designed to strengthen roots, reduce hair fall, and restore shine.',
    'Coconut oil, almond oil, castor oil, rosemary extract, vitamin E.',
    'Massage a small amount into the scalp and hair. Leave for at least 1 hour, or overnight, then wash out. Use 2-3 times per week.',
    1299.00,
    true,
    'Atom Pure Hair Oil',
    'Natural hair oil blend to strengthen roots and reduce hair fall. 100% pure, no additives.'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Atom Pure Mustard Oil',
    'atom-pure-mustard-oil',
    'Cold-pressed, unrefined mustard oil — pure and unadulterated, ideal for cooking and traditional wellness use.',
    '100% cold-pressed mustard seed oil.',
    'Use as a cooking oil, or for traditional massage/wellness applications. Store in a cool, dry place.',
    699.00,
    true,
    'Atom Pure Mustard Oil',
    'Cold-pressed, unrefined pure mustard oil for cooking and wellness.'
  )
on conflict (slug) do nothing;

insert into product_variants (product_id, name, sku, price, stock_quantity)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '100g', 'SMILEUP-100G', 899.00, 100),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '200ml', 'HAIROIL-200ML', 1299.00, 100),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '500ml', 'MUSTARDOIL-500ML', 699.00, 100)
on conflict (sku) do nothing;
