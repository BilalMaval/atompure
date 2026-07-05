// Supabase/PostgREST reports a missing column two different ways depending
// on the code path: a raw Postgres error (code 42703) when the query runs
// directly against the database, or a schema-cache miss (code PGRST204,
// no 42703) when the REST API's cached schema doesn't know about a column
// yet — e.g. right after a migration that hasn't been picked up. Treat both
// as "this column doesn't exist yet" so graceful-fallback logic actually
// triggers in both cases instead of silently failing only on the second.
export function isMissingColumnError(error: { code?: string | null; message?: string | null } | null): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  return /column .* (of|in) .* (schema cache|does not exist)/i.test(error.message ?? "");
}

// Same idea, but for a referenced table that doesn't exist yet (e.g. a
// relation embedded in a .select() before its migration has been run).
export function isMissingTableError(error: { code?: string | null; message?: string | null } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  return /relation .* does not exist|could not find the table/i.test(error.message ?? "");
}
