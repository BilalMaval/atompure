-- Anonymous newsletter signup was blocked by RLS ("new row violates row-level
-- security policy") even though 0009 created an insert-anyone policy with
-- check(true). Re-assert it idempotently in case the original didn't take.

drop policy if exists "newsletter_insert_anyone" on newsletter_subscribers;
create policy "newsletter_insert_anyone" on newsletter_subscribers
  for insert to anon, authenticated
  with check (true);
