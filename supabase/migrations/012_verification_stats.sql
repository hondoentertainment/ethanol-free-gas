-- Aggregate verification stats for admin dashboard

create or replace function public.get_verification_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with latest as (
    select distinct on (station_id)
      station_id,
      status,
      created_at
    from verifications
    order by station_id, created_at desc
  )
  select json_build_object(
    'total_stations', (select count(*)::int from stations),
    'verifications_this_week', (
      select count(*)::int
      from verifications
      where created_at >= now() - interval '7 days'
    ),
    'stations_ever_verified', (select count(*)::int from latest),
    'verified_fresh', (
      select count(*)::int
      from latest
      where status = 'available'
        and created_at >= now() - interval '90 days'
    ),
    'negative_listing', (
      select count(*)::int
      from latest
      where status in ('unavailable', 'closed', 'incorrect')
    ),
    'never_verified', (
      select count(*)::int
      from stations s
      where not exists (
        select 1 from latest l where l.station_id = s.id
      )
    )
  );
$$;
