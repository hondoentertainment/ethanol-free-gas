-- Seed data for development and demos
-- Run after 001_initial_schema.sql

insert into public.stations (
  name, address, city, state, zip, country, lat, lng,
  classification, fuel_type, ethanol_percent, phone, hours
) values
  (
    'Annapolis Harbor Marina Fuel Dock',
    '222 Severn Ave',
    'Annapolis',
    'MD',
    '21403',
    'US',
    38.9722,
    -76.4856,
    'boat',
    'E0 Marine Gasoline',
    0,
    '+1-410-263-9266',
    '{"mon":"6:00-20:00","tue":"6:00-20:00","wed":"6:00-20:00","thu":"6:00-20:00","fri":"6:00-20:00","sat":"6:00-20:00","sun":"7:00-19:00"}'::jsonb
  ),
  (
    'Sheetz — E0 Pump',
    '1201 Solomons Island Rd',
    'Annapolis',
    'MD',
    '21401',
    'US',
    38.9784,
    -76.5451,
    'car',
    'E0 Gasoline',
    0,
    '+1-410-266-1234',
    '{"mon":"0:00-24:00","tue":"0:00-24:00","wed":"0:00-24:00","thu":"0:00-24:00","fri":"0:00-24:00","sat":"0:00-24:00","sun":"0:00-24:00"}'::jsonb
  ),
  (
    'Lake Norman Marina',
    '1495 NC Highway 150',
    'Mooresville',
    'NC',
    '28117',
    'US',
    35.5978,
    -80.8776,
    'dual',
    'E0 Gasoline',
    0,
    '+1-704-664-2628',
    '{"mon":"7:00-19:00","tue":"7:00-19:00","wed":"7:00-19:00","thu":"7:00-19:00","fri":"7:00-19:00","sat":"7:00-19:00","sun":"8:00-18:00"}'::jsonb
  ),
  (
    'RaceWay — Ethanol-Free',
    '4500 Mobile Hwy',
    'Pensacola',
    'FL',
    '32506',
    'US',
    30.4213,
    -87.2642,
    'car',
    'E0 Gasoline',
    0,
    '+1-850-455-7890',
    '{"mon":"5:00-22:00","tue":"5:00-22:00","wed":"5:00-22:00","thu":"5:00-22:00","fri":"5:00-22:00","sat":"5:00-22:00","sun":"6:00-21:00"}'::jsonb
  ),
  (
    'Toronto Harbour Fuel Dock',
    '243 Queen''s Quay W',
    'Toronto',
    'ON',
    'M5J 2G8',
    'CA',
    43.6392,
    -79.3806,
    'boat',
    'E0 Marine Gasoline',
    0,
    '+1-416-555-0199',
    '{"mon":"8:00-18:00","tue":"8:00-18:00","wed":"8:00-18:00","thu":"8:00-18:00","fri":"8:00-18:00","sat":"9:00-17:00","sun":"9:00-17:00"}'::jsonb
  ),
  (
    'Kwik Trip — E0',
    '2101 E Washington Ave',
    'Madison',
    'WI',
    '53704',
    'US',
    43.1067,
    -89.3542,
    'car',
    'E0 Gasoline',
    0,
    '+1-608-241-5678',
    '{"mon":"0:00-24:00","tue":"0:00-24:00","wed":"0:00-24:00","thu":"0:00-24:00","fri":"0:00-24:00","sat":"0:00-24:00","sun":"0:00-24:00"}'::jsonb
  );

-- Sample verifications (recent freshness badges)
insert into public.verifications (station_id, status, notes, created_at)
select
  s.id,
  'available',
  'Confirmed E0 at pump',
  now() - interval '2 hours'
from public.stations s
where s.name = 'Sheetz — E0 Pump';

insert into public.verifications (station_id, status, notes, created_at)
select
  s.id,
  'available',
  'Marine dock open',
  now() - interval '3 days'
from public.stations s
where s.name = 'Annapolis Harbor Marina Fuel Dock';

insert into public.verifications (station_id, status, notes, created_at)
select
  s.id,
  'unavailable',
  'Temporarily out of E0',
  now() - interval '1 day'
from public.stations s
where s.name = 'RaceWay — Ethanol-Free';
