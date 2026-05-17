-- =====================================================
-- Admin role + politici pentru editare globală
-- =====================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Helper function: e admin user-ul curent?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- =====================================================
-- LOCATIONS: admin poate insert/update/delete
-- =====================================================
drop policy if exists "locations_admin_insert" on public.locations;
create policy "locations_admin_insert" on public.locations
  for insert with check (public.is_admin());

drop policy if exists "locations_admin_update" on public.locations;
create policy "locations_admin_update" on public.locations
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "locations_admin_delete" on public.locations;
create policy "locations_admin_delete" on public.locations
  for delete using (public.is_admin());

-- =====================================================
-- STORIES: admin peste tot
-- =====================================================
drop policy if exists "stories_update_own" on public.stories;
create policy "stories_update_own_or_admin" on public.stories
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "stories_delete_own" on public.stories;
create policy "stories_delete_own_or_admin" on public.stories
  for delete using (auth.uid() = user_id or public.is_admin());

-- =====================================================
-- STORY IMAGES: admin peste tot
-- =====================================================
drop policy if exists "story_images_delete_own" on public.story_images;
create policy "story_images_delete_own_or_admin" on public.story_images
  for delete using (
    exists (
      select 1 from public.stories s
      where s.id = story_id and (s.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "story_images_insert_own" on public.story_images;
create policy "story_images_insert_own_or_admin" on public.story_images
  for insert with check (
    exists (
      select 1 from public.stories s
      where s.id = story_id and (s.user_id = auth.uid() or public.is_admin())
    )
  );
