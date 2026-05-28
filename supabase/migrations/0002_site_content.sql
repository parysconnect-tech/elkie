-- ====================================================================
-- Elkie Web Studio — migration 0002: site_content
-- The editable copy for each client's hosted site (managed from
-- /dashboard/content). Run AFTER 0001_initial_schema.sql.
-- ====================================================================

create table public.site_content (
  client_id uuid primary key references public.profiles(id) on delete cascade,
  business_name text,
  tagline text,
  about text,
  contact_email text,
  contact_phone text,
  address text,
  hours text,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- A client can read + write only their own content row
create policy "clients manage own content"
  on site_content for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- Admins can read everything (for support / impersonation)
create policy "admins read all content"
  on site_content for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins update all content"
  on site_content for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
