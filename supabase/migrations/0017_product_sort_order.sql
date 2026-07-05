-- Manual display order for products on the shop/category listing pages,
-- set by the admin via drag-and-drop. Backfilled by creation date so the
-- initial order is stable rather than arbitrary.
alter table products add column if not exists sort_order integer not null default 0;

update products p
set sort_order = ranked.rn
from (
  select id, row_number() over (order by created_at) as rn
  from products
) ranked
where p.id = ranked.id and p.sort_order = 0;
