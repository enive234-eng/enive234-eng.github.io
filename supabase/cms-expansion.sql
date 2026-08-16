-- Run once in the Supabase SQL editor for an existing ENIVÈ database.
-- Safe to run repeatedly.
create table if not exists public.page_content(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  eyebrow text,
  intro text,
  body text,
  seo_title text,
  seo_description text,
  status public.content_status default 'draft',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.page_content enable row level security;
drop policy if exists "public reads published pages" on public.page_content;
drop policy if exists "admins manage pages" on public.page_content;
create policy "public reads published pages" on public.page_content for select to anon,authenticated using(status='published');
create policy "admins manage pages" on public.page_content for all to authenticated using(public.is_admin()) with check(public.is_admin());
create index if not exists page_content_status_sort_idx on public.page_content(status,sort_order);

insert into public.page_content(slug,title,eyebrow,status,sort_order) values
('about','About ENIVÈ','About ENIVÈ','draft',1),
('privacy-policy','Privacy Policy','Legal','draft',10),
('terms-and-conditions','Terms & Conditions','Legal','draft',11),
('cancellation-no-show-policy','Cancellation & No-Show Policy','Legal','draft',12),
('refund-policy','Refund Policy','Legal','draft',13),
('hipaa-privacy-notice','HIPAA Privacy Notice','Legal','draft',14),
('medical-disclaimer','Medical Disclaimer','Legal','draft',15)
on conflict(slug) do nothing;
