-- Fixed, administrator-editable image placements for the home and about pages.
-- Initial images are selected from the club's existing published event-media library.
begin;

create table if not exists public.page_media (
  id uuid primary key default gen_random_uuid(),
  placement text not null unique check (placement ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  page text not null check (page in ('home', 'about')),
  label text not null check (length(trim(label)) > 0),
  image_url text not null default '',
  image_alt text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.page_media enable row level security;
revoke all on public.page_media from anon, authenticated;
grant select on public.page_media to anon, authenticated;
grant update on public.page_media to authenticated;

drop policy if exists page_media_read on public.page_media;
create policy page_media_read on public.page_media for select to anon, authenticated using (active or public.is_admin());
drop policy if exists page_media_update on public.page_media;
create policy page_media_update on public.page_media for update to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 20971520, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists page_media_storage_insert on storage.objects;
create policy page_media_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_admin() and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists page_media_storage_delete on storage.objects;
create policy page_media_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and public.is_admin());

with slots(placement, page, label, fallback_alt, sort_order) as (
  values
    ('home-president-poster', 'home', 'President message poster', 'Eko Club Louisiana community gathering', 1),
    ('home-impact-panel', 'home', 'Impact panel', 'Eko Club Louisiana community members', 2),
    ('home-causes-panel', 'home', 'Causes panel', 'Eko Club Louisiana community event', 3),
    ('home-cause-education', 'home', 'Education card', 'Community members supporting education', 4),
    ('home-cause-youth-leadership', 'home', 'Youth Leadership card', 'Young community members gathered together', 5),
    ('home-cause-cultural-heritage', 'home', 'Cultural Heritage card', 'Eko Club Louisiana cultural celebration', 6),
    ('home-cause-humanitarian-support', 'home', 'Humanitarian Support card', 'Community members serving together', 7),
    ('home-cause-community-building', 'home', 'Community Building card', 'Eko Club Louisiana members celebrating together', 8),
    ('home-cause-health-and-wellbeing', 'home', 'Health and Wellbeing card', 'Community members at an Eko Club Louisiana gathering', 9),
    ('home-culture-feature', 'home', 'Culture feature', 'Eko Club Louisiana cultural celebration', 10),
    ('home-editorial', 'home', 'Get involved feature', 'Eko Club Louisiana members at a community event', 11),
    ('about-hero', 'about', 'About page hero', 'Eko Club Louisiana members gathered together', 12)
),
chosen as (
  select jsonb_agg(jsonb_build_object('url', media_url, 'alt', alt_text) order by random()) as images
  from public.event_media
  where published and media_type = 'image' and length(trim(media_url)) > 0
)
insert into public.page_media (placement, page, label, image_url, image_alt, active, sort_order)
select
  slot.placement,
  slot.page,
  slot.label,
  chosen.images -> ((slot.sort_order - 1) % jsonb_array_length(chosen.images)) ->> 'url',
  coalesce(nullif(chosen.images -> ((slot.sort_order - 1) % jsonb_array_length(chosen.images)) ->> 'alt', ''), slot.fallback_alt),
  true,
  slot.sort_order
from slots slot
cross join chosen
where jsonb_array_length(chosen.images) > 0
on conflict (placement) do nothing;

-- Existing hero slides are already editable in the dashboard; replace bundled-file posters with
-- a club image from the same Supabase media library so every homepage photograph is managed.
update public.hero_slides as slide
set image_url = chosen.media_url,
    image_alt = coalesce(nullif(chosen.alt_text, ''), slide.image_alt)
from (
  select media_url, alt_text
  from public.event_media
  where published and media_type = 'image' and length(trim(media_url)) > 0
  order by random()
  limit 1
) as chosen
where slide.active and slide.image_url !~ '^https://';

notify pgrst, 'reload schema';
commit;
