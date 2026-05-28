-- ====================================================================
-- Elkie Web Studio — initial schema
-- Run this ONCE in your Supabase project's SQL editor on first setup.
-- See supabase/README.md for step-by-step instructions.
-- ====================================================================

-- ===================================================
-- 1. profiles  (extends auth.users)
-- ===================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  business_name text,
  plan text,
  domain text,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- Auto-create a profile row whenever a new auth.users row is added
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, business_name)
  values (new.id, 'client', new.raw_user_meta_data->>'business_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Admins can read + update ANY profile
create policy "admins can read all profiles"
  on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can update all profiles"
  on profiles for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ===================================================
-- 2. messages  (leads from elkie.com AND per-client visitor messages)
-- ===================================================
-- client_id IS NULL  → lead submitted via elkie.com (admin sees in /admin/messages)
-- client_id IS SET   → message from a visitor on a client's site
-- ===================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade,
  -- Distinguish elkie.com lead types so /admin/messages can filter them:
  --   'client'  → small business filling out /start asking for a website
  --   'partner' → drop-servicer applying via /partners
  --   'contact' → catch-all visitor messages from a client's hosted site
  lead_type text not null default 'client' check (lead_type in ('client','partner','contact')),
  business_name text,
  email text not null,
  category text,
  about text,
  features jsonb default '[]'::jsonb,
  plan text,
  domain text,
  -- Free-form per-lead-type extras (partner experience, monthly volume, etc.)
  metadata jsonb default '{}'::jsonb,
  status text not null default 'new' check (status in ('new','read','replied','archived')),
  turnstile_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_client_id_idx on public.messages(client_id);
create index messages_lead_type_idx on public.messages(lead_type);
create index messages_status_idx on public.messages(status);
create index messages_created_at_idx on public.messages(created_at desc);

alter table public.messages enable row level security;

-- Anyone (even anon) can submit a lead
create policy "anyone can insert messages"
  on messages for insert with check (true);

-- Clients see ONLY their own site's visitor messages
create policy "clients read own messages"
  on messages for select
  using (client_id = auth.uid());

-- Admins read + update ALL messages
create policy "admins read all messages"
  on messages for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins update all messages"
  on messages for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ===================================================
-- 3. page_views  (homemade analytics)
-- ===================================================
-- site_id IS NULL  → page view on elkie.com itself
-- site_id IS SET   → page view on a client's hosted site
-- ===================================================
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  site_id uuid,
  path text not null,
  referrer text,
  user_agent text,
  country text,
  session_id text,
  created_at timestamptz not null default now()
);

create index page_views_site_id_idx on public.page_views(site_id);
create index page_views_created_at_idx on public.page_views(created_at desc);
create index page_views_path_idx on public.page_views(path);

alter table public.page_views enable row level security;

create policy "anyone can insert page views"
  on page_views for insert with check (true);

create policy "admins read all page views"
  on page_views for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "clients read own site page views"
  on page_views for select
  using (site_id = auth.uid());

-- ===================================================
-- 4. projects  (recent work showcase — managed via /admin/work)
-- ===================================================
-- Replaces the old "themes" concept. Each row represents a launched
-- (or in-progress) client project shown in the /work portfolio.
-- ===================================================
create table public.projects (
  slug text primary key,
  client text not null,
  category text,
  industry text,
  description text,
  thumbnail_url text,
  launched_at text,                  -- free-form, e.g. "2026 · Jan"
  live_url text,
  is_live boolean not null default false,
  swatch text,                       -- Tailwind gradient classes for placeholder
  vibe text,                         -- short descriptor like "serif · warm"
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index projects_active_idx on public.projects(active);
create index projects_featured_idx on public.projects(featured);

alter table public.projects enable row level security;

create policy "anyone can read active projects"
  on projects for select using (active = true);

create policy "admins can read all projects"
  on projects for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can insert projects"
  on projects for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can update projects"
  on projects for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can delete projects"
  on projects for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Seed placeholder showcase entries (matches src/lib/projects.ts).
-- Replace each row with real launched projects as they ship.
insert into public.projects (slug, client, category, industry, description, launched_at, swatch, vibe) values
  ('madeira-kitchen',          'Madeira Kitchen',          'Restaurant',  'Neighbourhood bistro',     'Warm photo-led one-pager with menu, hours, gallery.',                  '2026 · Jan', 'from-amber-500 via-orange-600 to-rose-700',    'serif · warm'),
  ('jordan-reyes-photography', 'Jordan Reyes Photography', 'Portfolio',   'Commercial photographer',  'Minimal monochrome portfolio with case grid and project pages.',       '2025 · Nov', 'from-zinc-800 via-zinc-600 to-zinc-300',       'mono · minimal'),
  ('lumina-spa',               'Lumina Spa',               'Salon & Spa', 'Boutique spa & wellness',  'Pastel booking-led site with services, pricing, booking widget.',      '2025 · Oct', 'from-pink-300 via-rose-200 to-amber-100',      'pastel · soft'),
  ('iron-oak-builders',        'Iron & Oak Builders',      'Trades',      'General contractor',       'Bold industrial site with services, gallery, quote-request form.',     '2025 · Sep', 'from-slate-900 via-slate-700 to-orange-600',   'bold · industrial'),
  ('tessera-goods',            'Tessera Goods',            'E-commerce',  'Small-batch homeware',     'Clean shop for made-to-order ceramics with lookbook and Buy Buttons.', '2025 · Aug', 'from-neutral-100 via-neutral-50 to-stone-200', 'clean · modern'),
  ('reps-reps-coaching',       'Reps & Reps Coaching',     'Fitness',     'Personal training',        'High-energy site with pricing tiers, class timetable, gallery.',       '2025 · Jul', 'from-lime-500 via-emerald-500 to-teal-600',    'energetic · loud'),
  ('halsey-sterling',          'Halsey & Sterling',        'Real estate', 'Luxury real estate',       'Stately serif-led site with listings, agent profiles, market reports.','2025 · Jun', 'from-stone-800 via-amber-900 to-stone-200',    'luxe · serif'),
  ('north-light-studio',       'North Light Studio',       'Agency',      'Creative agency',          'Loud brutalist one-pager with case grid, hover glitches, contact.',    '2025 · May', 'from-fuchsia-600 via-violet-700 to-indigo-900','brutalist · loud');

-- ===================================================
-- 5. settings  (key-value store, admin-editable)
-- ===================================================
create table public.settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "admins can read settings"
  on settings for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can insert settings"
  on settings for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins can update settings"
  on settings for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Seed default settings
insert into public.settings (key, value) values
  ('whatsapp_number',         '""'::jsonb),
  ('resend_from_email',       '"hello@elkie.com"'::jsonb),
  ('resend_from_name',        '"Elkie Web Studio"'::jsonb),
  ('default_language',        '"en"'::jsonb),
  ('admin_notify_new_lead',   'true'::jsonb),
  ('admin_notify_new_signup', 'true'::jsonb);

-- ===================================================
-- 6. realtime  (so /admin/messages updates without refresh)
-- ===================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.profiles;
