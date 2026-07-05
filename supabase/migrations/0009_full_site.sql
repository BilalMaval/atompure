-- Full-site pass: newsletter signups, threaded ticket replies, shipping/tax settings

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

create policy "newsletter_insert_anyone" on newsletter_subscribers
  for insert with check (true);
create policy "newsletter_admin_select" on newsletter_subscribers
  for select using (is_admin());

create table ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index ticket_replies_ticket_id_idx on ticket_replies (ticket_id);

alter table ticket_replies enable row level security;

create policy "ticket_replies_admin_all" on ticket_replies
  for all using (is_admin()) with check (is_admin());

alter table store_settings
  add column flat_shipping_rate numeric not null default 0,
  add column tax_rate_percent numeric not null default 0;

alter table orders
  add column tax_total numeric not null default 0;
