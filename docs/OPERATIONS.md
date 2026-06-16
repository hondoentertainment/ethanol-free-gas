# Operations guide

Day-to-day operations for the E0 Finder production deployment.

## Deploy

**Vercel (primary):**

```bash
git push origin main          # auto-deploy if connected
npx vercel deploy --prod --yes  # manual production deploy
```

**Environment sync:**

```bash
npm run env:push
```

## Health & smoke tests

```bash
# Quick health JSON
curl https://ethanol-free-gas.vercel.app/api/health

# Full smoke suite (needs ADMIN_SECRET in .env.local for admin check)
npm run smoke:prod
```

Smoke tests verify: health, stations API, homepage, sitemap, robots.txt, admin dashboard.

## CI (GitHub Actions)

`.github/workflows/ci.yml` on push/PR to `main`:

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`

## Weekly station import

Two mechanisms (use one or both):

### Vercel Cron (production app)

- Path: `/api/cron/import-stations`
- Schedule: `0 6 * * 0` (Sunday 06:00 UTC) in `vercel.json`
- Requires `CRON_SECRET` on Vercel

Check logs: Vercel → Project → Cron Jobs.

### GitHub Actions (optional backup)

`.github/workflows/weekly-import.yml` — Sunday 07:00 UTC:

- `npm run import:pure-gas`
- `npm run import:supabase`

Requires GitHub secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Manual import

```bash
# Fetch JSON only
npm run import:pure-gas

# Upsert to Supabase from JSON
npm run import:supabase

# Fresh fetch + upsert
npm run import:supabase -- --fresh

# Dry run
npm run import:supabase -- --dry-run

# Full pipeline
npm run import:all
```

Or use **Run full import** in `/admin`.

## Monitoring checklist

| Check | How |
|-------|-----|
| App up | `/api/health` returns `status: ok` |
| Station count | `checks.station_count` > 17,000 |
| Mapbox | `checks.mapbox: true` when token set |
| Resend | `checks.resend: true` when email configured |
| Cron ran | Admin → Import runs, recent Sunday entry |
| Data quality | Admin → Data quality metrics |

## Rollback

Vercel → Deployments → select previous deployment → **Promote to Production**.

Database rollbacks require manual SQL — prefer forward-fix migrations.

## Backups

Supabase project → Settings → Database → backups (plan-dependent).

## Incident response

1. Check `/api/health` and Vercel deployment status.
2. Review Vercel function logs for 5xx errors.
3. Check Supabase dashboard for connection limits or RLS issues.
4. If data stale, trigger manual import from admin.
5. If cron auth fails, verify `CRON_SECRET` has no whitespace (`npm run env:push` trims).

## Related

- [SETUP.md](./SETUP.md) — initial production setup
- [ADMIN.md](./ADMIN.md) — admin console
- [ENV.md](./ENV.md) — environment variables
