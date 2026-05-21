-- =====================================================
-- Catalog de fotografii al comunității
-- (paralel cu poveștile text — pagina /poze)
-- =====================================================

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  image_url text not null,
  caption text,
  year int,
  created_at timestamptz not null default now()
);

create index if not exists photos_user_idx on public.photos(user_id);
create index if not exists photos_location_idx on public.photos(location_id);
create index if not exists photos_created_idx on public.photos(created_at desc);

-- =====================================================
-- RLS
-- =====================================================
alter table public.photos enable row level security;

drop policy if exists "photos_read_all" on public.photos;
create policy "photos_read_all" on public.photos
  for select using (true);

drop policy if exists "photos_insert_own" on public.photos;
create policy "photos_insert_own" on public.photos
  for insert with check (auth.uid() = user_id);

drop policy if exists "photos_update_own_or_admin" on public.photos;
create policy "photos_update_own_or_admin" on public.photos
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "photos_delete_own_or_admin" on public.photos;
create policy "photos_delete_own_or_admin" on public.photos
  for delete using (auth.uid() = user_id or public.is_admin());

-- =====================================================
-- Storage bucket pentru pozele utilizatorilor
-- =====================================================
insert into storage.buckets (id, name, public)
values ('user-photos', 'user-photos', true)
on conflict (id) do nothing;

drop policy if exists "user_photos_read" on storage.objects;
create policy "user_photos_read" on storage.objects
  for select using (bucket_id = 'user-photos');

drop policy if exists "user_photos_upload" on storage.objects;
create policy "user_photos_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_photos_delete" on storage.objects;
create policy "user_photos_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'user-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
