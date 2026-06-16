# Admin guide

The admin console is at `/admin`. It is protected by the `ADMIN_SECRET` environment variable — not Supabase user roles.

## Access

1. Set `ADMIN_SECRET` in Vercel and `.env.local` (generate with `npm run generate:secrets`).
2. Open `/admin` in production or locally.
3. Enter the secret and click **Load**.

All admin API calls send `X-Admin-Key: <ADMIN_SECRET>`.

## Dashboard

After loading, the dashboard shows:

### Data quality

| Metric | Meaning |
|--------|---------|
| Freshly verified % | Stations with `available` report within 90 days |
| Stale or unverified % | Everything else minus negative reports |
| Verifications this week | New reports in last 7 days |
| Never verified | Stations with zero community reports |
| Negative reports | Latest report is closed, unavailable, or incorrect |

Powered by SQL function `get_verification_stats()` (migration `012`).

### Premium inquiries

Form submissions from `/premium`. Actions:

- **Mark resolved** — close the inquiry
- **Search station to promote** — find listing and mark premium/sponsored

### Import runs

History of pure-gas.org import jobs (cron and manual).

### API usage

Count of logged `/api/v1/stations` calls.

## Station search

Search by name, city, or address. For each result:

- **Mark premium** — featured pin and profile
- **Mark sponsored** — sponsored placement
- **Remove badges** — clear flags

Updates via `PATCH /api/admin/actions`.

## Manual import

**Run full import** triggers the same pipeline as the weekly cron:

1. Fetch from pure-gas.org GraphQL API
2. Chunked upsert into Supabase on `(source, external_id)`

May take several minutes. Use after bulk data fixes or if cron failed.

Equivalent CLI:

```bash
npm run import:all
```

## Resolving premium inquiries

1. Load dashboard and find pending inquiry.
2. Search for the station by name.
3. Mark premium or sponsored on the correct listing.
4. Mark inquiry resolved (optionally link `promote_station_id` via API).

## Security

- Rotate `ADMIN_SECRET` if exposed.
- Do not share the admin URL publicly.
- Admin routes bypass RLS via service role — protect the secret like a root password.

## Related

- [API.md](./API.md) — admin endpoint details
- [OPERATIONS.md](./OPERATIONS.md) — cron and smoke tests
- [ENV.md](./ENV.md) — `ADMIN_SECRET` configuration
