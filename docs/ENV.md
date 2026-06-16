# Environment variables

Copy `.env.example` to `.env.local` for local development. Set the same values in **Vercel → Project → Settings → Environment Variables** for production.

Push local values to Vercel:

```bash
npm run env:push
```

## Required (production)

| Variable | Expose to client? | Purpose |
|----------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (RLS-protected) |

## Recommended (production)

| Variable | Expose? | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL for sitemap, metadata, emails |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox map, geocoding, route search |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** | Server-only admin, imports, cron |
| `CRON_SECRET` | No | Secures `/api/cron/import-stations` (Vercel Cron sends this automatically) |
| `ADMIN_SECRET` | No | `/admin` and `/api/admin/*` via `X-Admin-Key` header |

## Web push (fuel alerts)

| Variable | Expose? | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | Browser push subscription |
| `VAPID_PRIVATE_KEY` | No | Sign push payloads |
| `VAPID_SUBJECT` | No | `mailto:` contact for push (e.g. `mailto:support@example.com`) |

Generate keys:

```bash
npm run generate:vapid
```

## Email (Resend)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Send fuel-alert and premium inquiry emails |
| `RESEND_FROM_EMAIL` | From address (e.g. `E0 Finder <alerts@yourdomain.com>`) |
| `ADMIN_NOTIFY_EMAIL` | Inbox for premium inquiry notifications |

## API licensing

| Variable | Purpose |
|----------|---------|
| `API_LICENSE_KEYS` | Comma-separated keys for `GET /api/v1/stations` |

## OAuth (Supabase Auth external providers)

Set locally to run setup scripts; also configure in Supabase dashboard / `supabase secrets`:

| Variable | Provider |
|----------|----------|
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | Google |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` | Google |
| `SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID` | GitHub |
| `SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET` | GitHub |

Apple Sign-In is configured in Supabase dashboard (no env vars in this repo).

Scripts:

```bash
node scripts/setup-google-oauth.mjs
node scripts/setup-github-oauth.mjs
```

## Optional

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console meta tag |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense display ads |
| `IMPORT_CRON_KEY` | Alias for `CRON_SECRET` (import scripts) |

## Health check

`GET /api/health` reports:

- `supabase` — URL + anon key present
- `mapbox` — `NEXT_PUBLIC_MAPBOX_TOKEN` present
- `vapid` — public VAPID key present
- `resend` — `RESEND_API_KEY` present
- `station_count` — live count from Supabase

## Security notes

- Never commit `.env.local`
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`, `CRON_SECRET`, or `VAPID_PRIVATE_KEY` to the client
- `NEXT_PUBLIC_*` variables are bundled into the browser — only put public tokens there
