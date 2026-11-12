-- Run in the existing Supabase project's SQL Editor. Rerunning preserves existing content.
begin;
create table if not exists public.event_categories (
 id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title))>0),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 description text not null default '', image_url text not null default '',
 sort_order integer not null default 0, published boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.event_media (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.event_categories(id) on delete restrict,
 title text not null check(length(trim(title))>0), media_type text not null check(media_type in ('image','video')),
 media_url text not null check(length(trim(media_url))>0), poster_url text not null default '',
 alt_text text not null default '', caption text not null default '',
 sort_order integer not null default 0, published boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists event_media_category_idx on public.event_media(category_id,sort_order);
alter table public.event_categories enable row level security;
revoke all on public.event_categories from anon,authenticated;
grant select on public.event_categories to anon,authenticated;
grant insert,update,delete on public.event_categories to authenticated;
drop policy if exists event_categories_read on public.event_categories;
create policy event_categories_read on public.event_categories for select to anon,authenticated using ((published) or public.is_admin());
drop policy if exists event_categories_insert on public.event_categories;
create policy event_categories_insert on public.event_categories for insert to authenticated with check(public.is_admin());
drop policy if exists event_categories_update on public.event_categories;
create policy event_categories_update on public.event_categories for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists event_categories_delete on public.event_categories;
create policy event_categories_delete on public.event_categories for delete to authenticated using(public.is_admin());
alter table public.event_media enable row level security;
revoke all on public.event_media from anon,authenticated;
grant select on public.event_media to anon,authenticated;
grant insert,update,delete on public.event_media to authenticated;
drop policy if exists event_media_read on public.event_media;
create policy event_media_read on public.event_media for select to anon,authenticated using ((published and exists(select 1 from public.event_categories c where c.id=category_id and c.published)) or public.is_admin());
drop policy if exists event_media_insert on public.event_media;
create policy event_media_insert on public.event_media for insert to authenticated with check(public.is_admin());
drop policy if exists event_media_update on public.event_media;
create policy event_media_update on public.event_media for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists event_media_delete on public.event_media;
create policy event_media_delete on public.event_media for delete to authenticated using(public.is_admin());
insert into public.event_categories(id,title,slug,sort_order,published) values
('b1000000-0000-4000-8000-000000000001','2nd Line','2nd-line',0,true),
('b1000000-0000-4000-8000-000000000002','Banquets','banquets',1,true),
('b1000000-0000-4000-8000-000000000003','Oldies Social Night','oldies-social-night',2,true),
('b1000000-0000-4000-8000-000000000004','Youth Outreach','youth-outreach',3,true)
on conflict(slug) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('event-media','event-media',true,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists event_media_storage_insert on storage.objects;
create policy event_media_storage_insert on storage.objects for insert to authenticated with check(bucket_id='event-media' and public.is_admin() and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists event_media_storage_delete on storage.objects;
create policy event_media_storage_delete on storage.objects for delete to authenticated using(bucket_id='event-media' and public.is_admin());
notify pgrst,'reload schema';
commit;
