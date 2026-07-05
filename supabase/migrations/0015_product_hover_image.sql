-- Optional hover-state image for product cards (swaps in on hover,
-- separate from the gallery order so admins can pick a dedicated shot).
alter table products add column if not exists hover_image_url text;
