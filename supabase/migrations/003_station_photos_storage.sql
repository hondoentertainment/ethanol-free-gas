-- Supabase Storage for station photos

insert into storage.buckets (id, name, public)
values ('station-photos', 'station-photos', true)
on conflict (id) do nothing;

create policy "station_photos_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'station-photos');

create policy "station_photos_authenticated_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'station-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "station_photos_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'station-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Award 10 points for photo uploads
create or replace function public.award_photo_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null then
    insert into public.profiles (id, contributor_points)
    values (new.user_id, 10)
    on conflict (id) do update
      set contributor_points = public.profiles.contributor_points + 10,
          updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists photos_award_points on public.photos;

create trigger photos_award_points
  after insert on public.photos
  for each row
  execute function public.award_photo_points();

-- Allow authenticated users to update stations they submitted
create policy "stations_update_submitter"
  on public.stations
  for update
  to authenticated
  using (submitted_by = auth.uid())
  with check (submitted_by = auth.uid());
