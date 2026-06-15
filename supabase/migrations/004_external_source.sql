-- External source tracking for bulk imports (e.g. pure-gas.org)

alter table public.stations
  add column if not exists external_id text,
  add column if not exists source text,
  add column if not exists source_url text,
  add column if not exists notes text;

create unique index if not exists stations_source_external_id_idx
  on public.stations (source, external_id)
  where external_id is not null and source is not null;

create index if not exists stations_source_idx on public.stations (source);
