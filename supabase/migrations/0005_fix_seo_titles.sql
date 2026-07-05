-- seo_title fields were seeded with a redundant "| AtomPure" suffix that the
-- root layout's title template already appends; strip it so titles don't repeat.

update products set seo_title = regexp_replace(seo_title, '\s*\|\s*AtomPure$', '')
where seo_title ~ '\| AtomPure$';

update categories set seo_title = regexp_replace(seo_title, '\s*\|\s*AtomPure$', '')
where seo_title ~ '\| AtomPure$';
