-- Fast state/province counts for SEO landing pages

create or replace function public.state_station_counts()
returns table (state text, country text, count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select state, country, count(*)::bigint as count
  from public.stations
  group by state, country
  order by count desc;
$$;

grant execute on function public.state_station_counts() to anon, authenticated;
