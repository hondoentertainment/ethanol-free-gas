-- Ops: API usage, email alerts, import tracking, premium inquiry status

alter table public.fuel_alert_subscriptions
  add column if not exists email text;

alter table public.premium_inquiries
  add column if not exists status text not null default 'pending';

create table if not exists public.api_usage_log (
  id uuid primary key default gen_random_uuid(),
  api_key_hash text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists api_usage_log_created_idx
  on public.api_usage_log (created_at desc);

create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  stations_upserted integer not null default 0,
  states_processed integer not null default 0,
  error text
);

-- Dedup helper: find nearby stations within ~0.15 miles
create or replace function public.find_nearby_station(
  p_lat double precision,
  p_lng double precision,
  p_miles double precision default 0.15
)
returns table (
  id uuid,
  name text,
  source text,
  external_id text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.name, s.source, s.external_id
  from public.stations s
  where (
    3959 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(p_lat)) * cos(radians(s.lat)) *
        cos(radians(s.lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(s.lat))
      ))
    )
  ) <= p_miles
  order by (
    3959 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(p_lat)) * cos(radians(s.lat)) *
        cos(radians(s.lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(s.lat))
      ))
    )
  )
  limit 5;
$$;

grant execute on function public.find_nearby_station(double precision, double precision, double precision)
  to authenticated, service_role;
