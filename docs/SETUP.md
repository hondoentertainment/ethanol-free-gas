# Production Setup

Complete checklist for deploying E0 Finder to production.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Link locally: `npx supabase link --project-ref YOUR_REF`
3. Apply all migrations:

```bash
npx supabase db push
```

Migration files (`supabase/migrations/`):

| # | File | Purpose |
|---|------|---------|
| 001 | `initial_schema` | Stations, verifications, photos, RLS |
| 002 | `premium_contributions_api` | Premium flags, contributor points |
| 003 | `station_photos_storage` | Storage bucket for photos |
| 004 | `external_source` | pure-gas.org import fields |
| 005 | `fuel_alerts_notifications` | Alerts, push, notifications |
| 006 | `upsert_constraint` | Import deduplication |
| 007 | `profile_on_signup` | Auto-create profile on sign-up |
| 008 | `state_stats_rpc` | State directory stats |
| 009 | `ratings_premium` | Ratings + premium inquiries |
| 010 | `ops_admin` | Import runs, API usage log |
| 011 | `closed_status` | `closed` verification enum |
| 012 | `verification_stats` | Admin dashboard aggregates |

4. **Auth → URL configuration:**
   - Site URL: `https://ethanol-free-gas.vercel.app` (or custom domain)
   - Redirect URLs:
     - `https://ethanol-free-gas.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

5. **Auth → Providers:** Enable Email. For Google/GitHub/Apple see [ENV.md](./ENV.md).

6. Optional seeds: `supabase/seed.sql`, `supabase/seed_regional_stations.sql`

## 2. Environment variables

Copy `.env.example` → `.env.local`. See [ENV.md](./ENV.md) for full reference.

**Minimum for production:**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://ethanol-free-gas.vercel.app
ADMIN_SECRET=
CRON_SECRET=
```

**Recommended:**

```
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:support@yourdomain.com
API_LICENSE_KEYS=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_NOTIFY_EMAIL=
```

Push to Vercel:

```bash
npm run env:push
```

## 3. Import station data

```bash
npm run import:all
```

Requires `SUPABASE_SERVICE_ROLE_KEY` and migration `004`.

Attribution: data from [pure-gas.org](https://www.pure-gas.org/) — credited on the map UI.

## 4. Deploy to Vercel

1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Add environment variables
4. Deploy — `vercel.json` configures weekly cron

```bash
npx vercel deploy --prod --yes
```

## 5. Custom domain

See [DOMAIN.md](./DOMAIN.md). Set `NEXT_PUBLIC_SITE_URL` after adding domain.

## 6. OAuth (optional)

```bash
node scripts/setup-google-oauth.mjs
node scripts/setup-github-oauth.mjs
```

Apple: configure in Supabase dashboard + Apple Developer portal.

## 7. Verify production

```bash
npm run smoke:prod
```

Manual checklist:

- [ ] Map loads (Mapbox or OSM fallback)
- [ ] Stations load from Supabase (not “Demo data” badge)
- [ ] ~17,000+ stations on “Load all”
- [ ] Sign in → verify station works
- [ ] Add station at `/station/add`
- [ ] Route search finds stations along a trip
- [ ] `/api/v1/stations` returns data with API key
- [ ] `/admin` dashboard loads with admin key
- [ ] `/docs` help center accessible

## 8. Ongoing operations

See [OPERATIONS.md](./OPERATIONS.md) for cron, monitoring, and imports.

## 9. Documentation

| Audience | Location |
|----------|----------|
| End users | `/docs` on live site |
| Fuel education | `/guides` |
| API partners | `/developers` + [API.md](./API.md) |
| Operators | [ADMIN.md](./ADMIN.md) |
| Developers | [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) |
