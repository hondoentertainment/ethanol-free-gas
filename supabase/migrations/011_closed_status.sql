-- Allow reporting permanently closed / gone stations
alter type public.verification_status add value if not exists 'closed';
