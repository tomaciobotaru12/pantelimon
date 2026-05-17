-- =====================================================
-- Imagini „atunci / acum" la nivel de locație
-- (separate de fotografiile uploadate de comunitate pe povești)
-- =====================================================

alter table public.locations
  add column if not exists historical_image_url text,
  add column if not exists current_image_url text;

-- Bucket separat pentru imaginile locațiilor (gestionate de admin)
insert into storage.buckets (id, name, public)
values ('location-images', 'location-images', true)
on conflict (id) do nothing;

-- Politici storage pentru bucket-ul nou
drop policy if exists "location_images_read" on storage.objects;
create policy "location_images_read" on storage.objects
  for select using (bucket_id = 'location-images');

drop policy if exists "location_images_admin_upload" on storage.objects;
create policy "location_images_admin_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'location-images'
    and public.is_admin()
  );

drop policy if exists "location_images_admin_delete" on storage.objects;
create policy "location_images_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'location-images'
    and public.is_admin()
  );
