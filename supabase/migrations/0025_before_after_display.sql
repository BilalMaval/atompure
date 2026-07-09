alter table products
  add column if not exists before_after_image_height integer not null default 420,
  add column if not exists before_after_image_position text not null default 'center';
