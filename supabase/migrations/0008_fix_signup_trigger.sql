-- Signup failed with "Database error saving new user": the handle_new_user()
-- trigger fires from auth.users (owned by the Auth admin role), whose search_path
-- doesn't include public, so the unqualified "profiles" reference failed to resolve.
-- Fix: schema-qualify the table and pin search_path on the function itself.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
