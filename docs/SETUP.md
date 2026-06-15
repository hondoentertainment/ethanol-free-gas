# Production Setup

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL editor, run in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_premium_contributions_api.sql`
   - `supabase/seed.sql`
   - `supabase/seed_regional_stations.sql`
3. Auth → URL configuration:
   - Site URL: `https://ethanol-free-gas.vercel.app`
   - Redirect URLs:
     - `https://ethanol-free-gas.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
4. Enable Email and Google providers

## 2. Environment variables (Vercel + local)

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Map + geocoding + route search |
| `API_LICENSE_KEYS` | Optional | Comma-separated keys for `/api/v1/stations` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Optional | Display ads |

In Vercel: Project → Settings → Environment Variables → add for Production and Preview.

## 3. Custom domain

Vercel → Project → Settings → Domains → add your domain (e.g. `e0finder.com`).

## 4. API licensing

Partners call:

```http
GET /api/v1/stations?lat=38.98&lng=-76.49&radius=25
X-API-Key: your-license-key
```

Set `API_LICENSE_KEYS` in Vercel to one or more keys.

## 5. PWA / offline

The app caches the last station search in `localStorage` and shows cached data when offline. Install via browser “Add to Home Screen” after visiting the site.

## 6. Verify production

- [ ] Map loads with Mapbox token
- [ ] Stations load from Supabase (not “Demo data” badge)
- [ ] Sign in → verify station works
- [ ] Add station at `/station/add`
- [ ] Route search finds stations along a trip
- [ ] `/api/v1/stations` returns data with API key

## 7. Import from pure-gas.org

The app can load ~17,000+ ethanol-free stations from [pure-gas.org](https://www.pure-gas.org/) via their public GraphQL API.

```bash
npm run import:pure-gas
```

This writes `data/pure-gas-stations.json`. When Supabase is not configured, the API serves this dataset automatically. Re-run periodically to refresh listings.

**Attribution:** Station data is sourced from pure-gas.org and is displayed with a credit link on the map.
