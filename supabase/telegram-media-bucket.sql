-- Run once in Supabase Dashboard → SQL Editor (or via psql).
-- Public bucket for the Telegram bot's welcome media (Telegram fetches it by URL).
-- Uploads go through signed upload URLs issued by an admin-only Server Action.
-- The app enforces 5 MB for images and 20 MB for GIF / MP4; 20 MB is the bucket ceiling.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'telegram-media',
  'telegram-media',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read telegram media" on storage.objects;
create policy "Public read telegram media"
on storage.objects
for select
to public
using (bucket_id = 'telegram-media');
