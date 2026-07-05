-- Discovered via testing: anonymous INSERT fails project-wide with "violates
-- row-level security policy" even where a correct "with check (true)" policy
-- exists (confirmed on both newsletter_subscribers and the pre-existing
-- support_tickets policy). Logged-in (authenticated-role) inserts work fine.
-- This points to missing table-level GRANTs for the anon role on this
-- project (RLS policies only take effect once the underlying GRANT exists).
-- Explicitly grant what anonymous visitors need: newsletter signup and the
-- guest contact form.

grant insert, select on newsletter_subscribers to anon, authenticated;
grant insert, select on support_tickets to anon, authenticated;
