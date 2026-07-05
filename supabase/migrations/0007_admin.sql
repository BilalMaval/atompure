-- Admin dashboard support: customer notes + store settings singleton

alter table profiles add column admin_notes text;

create table store_settings (
  id boolean primary key default true,
  store_name text,
  support_email text,
  support_phone text,
  ga_measurement_id text,
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id)
);

insert into store_settings (id, store_name, support_email)
values (true, 'AtomPure', 'support@atompurelife.com');

alter table store_settings enable row level security;

create policy "store_settings_admin_all" on store_settings
  for all using (is_admin()) with check (is_admin());
