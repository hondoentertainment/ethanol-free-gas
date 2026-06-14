-- Ethanol-Free Fuel Finder — initial schema
-- Run via Supabase SQL editor or: supabase db push

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.station_classification as enum ('car', 'boat', 'dual');

create type public.verification_status as enum ('available', 'unavailable', 'incorrect');

-- ---------------------------------------------------------------------------
-- Stations
-- ---------------------------------------------------------------------------

create table public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip text,
  country text not null default 'US',
  lat double precision not null,
  lng double precision not null,
  classification public.station_classification not null default 'car',
  fuel_type text not null default 'E0 Gasoline',
  ethanol_percent numeric(4, 2) not null default 0,
  phone text,
  hours jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint stations_lat_range check (lat >= -90 and lat <= 90),
  constraint stations_lng_range check (lng >= -180 and lng <= 180),
  constraint stations_ethanol_range check (ethanol_percent >= 0 and ethanol_percent <= 100)
);

create index stations_city_state_idx on public.stations (city, state);
create index stations_zip_idx on public.stations (zip);
create index stations_classification_idx on public.stations (classification);
create index stations_lat_lng_idx on public.stations (lat, lng);

-- ---------------------------------------------------------------------------
-- Verifications
-- ---------------------------------------------------------------------------

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  status public.verification_status not null,
  notes text,
  created_at timestamptz not null default now()
);

create index verifications_station_id_idx on public.verifications (station_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Photos (Phase 2 — schema ready)
-- ---------------------------------------------------------------------------

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  url text not null,
  created_at timestamptz not null default now()
);

create index photos_station_id_idx on public.photos (station_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stations_updated_at
  before update on public.stations
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.stations enable row level security;
alter table public.verifications enable row level security;
alter table public.photos enable row level security;

-- Stations: public read
create policy "stations_select_public"
  on public.stations
  for select
  to anon, authenticated
  using (true);

-- Verifications: public read
create policy "verifications_select_public"
  on public.verifications
  for select
  to anon, authenticated
  using (true);

-- Verifications: authenticated insert (user_id must match auth.uid() when set)
create policy "verifications_insert_authenticated"
  on public.verifications
  for insert
  to authenticated
  with check (user_id is null or user_id = auth.uid());

-- Allow anon insert for MVP demos (tighten in Sprint 2)
create policy "verifications_insert_anon"
  on public.verifications
  for insert
  to anon
  with check (user_id is null);

-- Photos: public read
create policy "photos_select_public"
  on public.photos
  for select
  to anon, authenticated
  using (true);

create policy "photos_insert_authenticated"
  on public.photos
  for insert
  to authenticated
  with check (user_id is null or user_id = auth.uid());
