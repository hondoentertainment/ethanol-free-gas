-- Fuel alerts, notifications, achievement tracking

-- ---------------------------------------------------------------------------
-- Fuel alert subscriptions
-- ---------------------------------------------------------------------------

create type public.alert_type as enum ('new_station', 'unavailable', 'available');

create table if not exists public.fuel_alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  radius_miles numeric(6, 2) not null default 25,
  alert_types public.alert_type[] not null default array['new_station', 'unavailable', 'available']::public.alert_type[],
  push_endpoint text,
  push_p256dh text,
  push_auth text,
  created_at timestamptz not null default now(),

  constraint fuel_alert_radius check (radius_miles > 0 and radius_miles <= 100)
);

create index if not exists fuel_alert_user_idx
  on public.fuel_alert_subscriptions (user_id);

create index if not exists fuel_alert_geo_idx
  on public.fuel_alert_subscriptions (lat, lng);

-- ---------------------------------------------------------------------------
-- In-app notifications
-- ---------------------------------------------------------------------------

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  station_id uuid references public.stations (id) on delete set null,
  alert_type public.alert_type,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_user_idx
  on public.user_notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.fuel_alert_subscriptions enable row level security;
alter table public.user_notifications enable row level security;

create policy "fuel_alerts_select_own"
  on public.fuel_alert_subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "fuel_alerts_insert_own"
  on public.fuel_alert_subscriptions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "fuel_alerts_update_own"
  on public.fuel_alert_subscriptions
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "fuel_alerts_delete_own"
  on public.fuel_alert_subscriptions
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_select_own"
  on public.user_notifications
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.user_notifications
  for update
  to authenticated
  using (user_id = auth.uid());

-- Notifications are inserted by the API using the service role key.
