-- Unique constraint required for Supabase upsert onConflict (partial index is not enough)

drop index if exists public.stations_source_external_id_idx;

alter table public.stations
  drop constraint if exists stations_source_external_id_unique;

alter table public.stations
  add constraint stations_source_external_id_unique
  unique (source, external_id);
