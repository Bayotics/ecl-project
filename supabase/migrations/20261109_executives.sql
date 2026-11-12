-- Run once in the existing project Supabase SQL Editor. Safe to rerun: existing records are preserved.
begin;
create table if not exists public.executives (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check (length(trim(name)) > 0),
 role text not null check (length(trim(role)) > 0),
 term text not null,
 section text not null default 'current' check (section in ('current','past','presidents')),
 bio text not null default '',
 image_url text not null default '',
 image_alt text not null default '',
 sort_order integer not null default 0,
 published boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.executives enable row level security;
revoke all on public.executives from anon, authenticated;
grant select on public.executives to anon, authenticated;
grant insert, update, delete on public.executives to authenticated;
drop policy if exists executives_public_read on public.executives;
create policy executives_public_read on public.executives for select to anon, authenticated using (published or public.is_admin());
drop policy if exists executives_admin_insert on public.executives;
create policy executives_admin_insert on public.executives for insert to authenticated with check (public.is_admin());
drop policy if exists executives_admin_update on public.executives;
create policy executives_admin_update on public.executives for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists executives_admin_delete on public.executives;
create policy executives_admin_delete on public.executives for delete to authenticated using (public.is_admin());
insert into public.executives (slug,name,role,term,section,bio,image_url,image_alt,sort_order,published) values
('wallace-jimson','Hon. Wallace Jimson','President','2025–2028','current','','/media/executives/wallace-jimson.webp','Hon. Wallace Jimson',0,true),
('dominic-adedeji','Hon. Dominic Adedeji','Vice President','2025–2028','current','','/media/executives/dominic-adedeji.webp','Hon. Dominic Adedeji',1,true),
('bode-omololu','Hon. Bode Omololu','General Secretary','2025–2028','current','','/media/executives/bode-omololu.webp','Hon. Bode Omololu',2,true),
('ademola-oloko','Hon. Ademola Oloko','Treasurer/Financial Secretary','2025–2028','current','','/media/executives/ademola-oloko.webp','Hon. Ademola Oloko',3,true),
('james-olalekan','Hon. James Olalekan','PRO/Social Secretary','2025–2028','current','','/media/executives/james-olalekan.webp','Hon. James Olalekan',4,true),
('francis-adelaja','Hon. Dr. Francis A. Adelaja','President','2016–2020','presidents','','/media/executives/francis-adelaja.webp','Hon. Dr. Francis A. Adelaja',0,true),
('ayodeji-famuyide','Hon. Dr. Ayodeji Famuyide','President','2020–2025','presidents','','/media/executives/ayodeji-famuyide.webp','Hon. Dr. Ayodeji Famuyide',1,true),
('wallace-jimson-presidency','Hon. Wallace Jimson','President','2025–present','presidents','','/media/executives/wallace-jimson-presidency.webp','Hon. Wallace Jimson',2,true)
on conflict (slug) do nothing;
notify pgrst, 'reload schema';
commit;
