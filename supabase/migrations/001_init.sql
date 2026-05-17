-- =====================================================
-- Aici Era — Arhiva vie a Pantelimonului
-- Initial schema, RLS policies, storage buckets
-- =====================================================

create extension if not exists "pgcrypto";

-- =====================================================
-- PROFILES
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- LOCATIONS
-- =====================================================
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  historical_period text,
  cover_image text,
  created_at timestamptz not null default now()
);

create index if not exists locations_slug_idx on public.locations(slug);

-- =====================================================
-- STORIES
-- =====================================================
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  title text not null,
  memory text not null,
  year int,
  tags text[] default '{}',
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create index if not exists stories_user_idx on public.stories(user_id);
create index if not exists stories_location_idx on public.stories(location_id);
create index if not exists stories_created_idx on public.stories(created_at desc);

-- =====================================================
-- STORY IMAGES
-- =====================================================
create table if not exists public.story_images (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  image_url text not null,
  is_historical boolean not null default false,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists story_images_story_idx on public.story_images(story_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.stories enable row level security;
alter table public.story_images enable row level security;

-- PROFILES
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- LOCATIONS (public read, admin-managed via service role for now)
drop policy if exists "locations_read_all" on public.locations;
create policy "locations_read_all" on public.locations
  for select using (true);

-- STORIES
drop policy if exists "stories_read_all" on public.stories;
create policy "stories_read_all" on public.stories
  for select using (true);

drop policy if exists "stories_insert_own" on public.stories;
create policy "stories_insert_own" on public.stories
  for insert with check (auth.uid() = user_id);

drop policy if exists "stories_update_own" on public.stories;
create policy "stories_update_own" on public.stories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "stories_delete_own" on public.stories;
create policy "stories_delete_own" on public.stories
  for delete using (auth.uid() = user_id);

-- STORY IMAGES
drop policy if exists "story_images_read_all" on public.story_images;
create policy "story_images_read_all" on public.story_images
  for select using (true);

drop policy if exists "story_images_insert_own" on public.story_images;
create policy "story_images_insert_own" on public.story_images
  for insert with check (
    exists (
      select 1 from public.stories s
      where s.id = story_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "story_images_delete_own" on public.story_images;
create policy "story_images_delete_own" on public.story_images
  for delete using (
    exists (
      select 1 from public.stories s
      where s.id = story_id and s.user_id = auth.uid()
    )
  );

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
insert into storage.buckets (id, name, public)
values ('story-images', 'story-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies: anyone can read; authenticated users can upload
-- into a folder that starts with their user id (e.g. "<uid>/...").
drop policy if exists "story_images_read" on storage.objects;
create policy "story_images_read" on storage.objects
  for select using (bucket_id in ('story-images', 'avatars'));

drop policy if exists "story_images_upload" on storage.objects;
create policy "story_images_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('story-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "story_images_delete" on storage.objects;
create policy "story_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('story-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
