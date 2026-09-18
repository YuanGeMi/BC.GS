-- Run once in Supabase Dashboard → SQL Editor (or via psql).
-- Public bucket for site logo / OG image. Uploads use the service role.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-branding',
  'site-branding',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read site branding" on storage.objects;
create policy "Public read site branding"
on storage.objects
for select
to public
using (bucket_id = 'site-branding');
