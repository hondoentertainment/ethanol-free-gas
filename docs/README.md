# Documentation index

Complete documentation for **Ethanol-Free Fuel Finder** (E0 Finder).

## User documentation (on the live site)

| Resource | URL | Description |
|----------|-----|-------------|
| Help center | `/docs` | 18 articles — map, verify, alerts, FAQ, privacy |
| Fuel guides | `/guides` | Educational content about E0 fuel by topic and state |
| API docs | `/developers` | Partner API reference and licensing |
| About | `/about` | Product overview and quick links |

Source for site docs: `src/lib/content/docs.ts` and `src/lib/content/guides.ts`.

## Operator & developer docs (this folder)

| Document | Audience | Contents |
|----------|----------|----------|
| [SETUP.md](./SETUP.md) | DevOps | Production setup, migrations, env, smoke tests |
| [ENV.md](./ENV.md) | Developers | All environment variables |
| [API.md](./API.md) | Integrators | REST API reference (public + internal) |
| [ADMIN.md](./ADMIN.md) | Operators | Admin console, imports, premium |
| [OPERATIONS.md](./OPERATIONS.md) | DevOps | Cron, CI, deploy, monitoring |
| [DOMAIN.md](./DOMAIN.md) | DevOps | Custom domain and auth URLs |
| [MOBILE.md](./MOBILE.md) | Product | PWA install and mobile strategy |
| [PRD.md](./PRD.md) | Product | Product requirements |
| [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) | Engineering | Architecture, schema, sprint history |

## Quick links

```bash
npm run dev          # Local development
npm test             # Unit tests
npm run build        # Production build
npm run smoke:prod   # Production health checks
npm run env:push     # Push .env.local vars to Vercel
npm run import:all   # Refresh pure-gas.org → Supabase
```

## Migration order

Run via `npx supabase db push` or SQL editor in order:

1. `001_initial_schema.sql`
2. `002_premium_contributions_api.sql`
3. `003_station_photos_storage.sql`
4. `004_external_source.sql`
5. `005_fuel_alerts_notifications.sql`
6. `006_upsert_constraint.sql`
7. `007_profile_on_signup.sql`
8. `008_state_stats_rpc.sql`
9. `009_ratings_premium.sql`
10. `010_ops_admin.sql`
11. `011_closed_status.sql`
12. `012_verification_stats.sql`

## Production URL

Default: https://ethanol-free-gas.vercel.app

Override with `NEXT_PUBLIC_SITE_URL` for custom domains.
