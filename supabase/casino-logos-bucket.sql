-- Run once in Supabase Dashboard → SQL Editor (or via psql on the project DB).
-- Creates a public bucket for casino logos. Uploads go through the app with the
-- service role (bypasses RLS); the public can only read.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'casino-logos',
  'casino-logos',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read casino logos" on storage.objects;
create policy "Public read casino logos"
on storage.objects
for select
to public
using (bucket_id = 'casino-logos');
