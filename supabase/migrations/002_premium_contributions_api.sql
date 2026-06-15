-- Premium listings, community contributions, contributor profiles

alter table public.stations
  add column if not exists is_premium boolean not null default false,
  add column if not exists is_sponsored boolean not null default false,
  add column if not exists submitted_by uuid references auth.users (id) on delete set null;

create index if not exists stations_premium_idx on public.stations (is_premium, is_sponsored);

-- Contributor profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  contributor_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid());

-- Community station submissions (authenticated users)
create policy "stations_insert_authenticated"
  on public.stations
  for insert
  to authenticated
  with check (submitted_by = auth.uid());

-- Remove anonymous verification inserts (auth required)
drop policy if exists "verifications_insert_anon" on public.verifications;

-- Tighten authenticated verification insert
drop policy if exists "verifications_insert_authenticated" on public.verifications;

create policy "verifications_insert_authenticated"
  on public.verifications
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Award contributor points on verification
create or replace function public.award_contributor_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null then
    insert into public.profiles (id, contributor_points)
    values (new.user_id, 5)
    on conflict (id) do update
      set contributor_points = public.profiles.contributor_points + 5,
          updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists verifications_award_points on public.verifications;

create trigger verifications_award_points
  after insert on public.verifications
  for each row
  execute function public.award_contributor_points();

-- Award points when adding a station
create or replace function public.award_station_submission_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.submitted_by is not null then
    insert into public.profiles (id, contributor_points)
    values (new.submitted_by, 25)
    on conflict (id) do update
      set contributor_points = public.profiles.contributor_points + 25,
          updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists stations_award_points on public.stations;

create trigger stations_award_points
  after insert on public.stations
  for each row
  execute function public.award_station_submission_points();
