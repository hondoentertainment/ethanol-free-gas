-- Station quality ratings (Phase 2 PRD)

create table if not exists public.station_ratings (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  availability smallint not null check (availability between 1 and 5),
  access smallint not null check (access between 1 and 5),
  cleanliness smallint not null check (cleanliness between 1 and 5),
  service smallint not null check (service between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (station_id, user_id)
);

create index if not exists station_ratings_station_idx
  on public.station_ratings (station_id);

alter table public.station_ratings enable row level security;

create policy "ratings_select_public"
  on public.station_ratings
  for select
  to anon, authenticated
  using (true);

create policy "ratings_insert_own"
  on public.station_ratings
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "ratings_update_own"
  on public.station_ratings
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Premium listing inquiries
create table if not exists public.premium_inquiries (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_email text not null,
  station_name text,
  message text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.premium_inquiries enable row level security;

create policy "premium_inquiries_insert"
  on public.premium_inquiries
  for insert
  to anon, authenticated
  with check (true);

-- Service role reads inquiries; no public select
