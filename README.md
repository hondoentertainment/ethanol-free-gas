# Ethanol-Free Fuel Finder

Mobile-first map for locating ethanol-free (E0) gasoline stations across the US and Canada.

**Live:** https://ethanol-free-gas.vercel.app

## Features

- Interactive map with **car / boat / dual** station classification
- 17,000+ stations from pure-gas.org + community additions
- Search by city, ZIP, address, and **along a route**
- Crowdsourced verification (available, unavailable, closed, incorrect)
- Fuel alerts (in-app, web push, email)
- Photos, ratings, contributor points, and leaderboard
- PWA install + offline station cache
- Licensed partner API (`/api/v1/stations`)
- Premium/sponsored listings for station owners
- State directory, SEO guides, and full help center

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npx supabase db push         # apply migrations
npm run dev
```

Open http://localhost:3000. Without Supabase, the app runs in **demo mode**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run import:all` | Fetch pure-gas.org → Supabase |
| `npm run smoke:prod` | Production smoke tests |
| `npm run env:push` | Push `.env.local` to Vercel |
| `npm run setup:all` | Secrets + VAPID generation checklist |

## Deploy

1. Push to GitHub and connect Vercel
2. Set env vars — see [docs/ENV.md](docs/ENV.md)
3. `npm run import:all` with service role key
4. `npx vercel deploy --prod --yes`

Full checklist: [docs/SETUP.md](docs/SETUP.md)

## Documentation

### On the live site

| Page | Path |
|------|------|
| Help center | `/docs` |
| Fuel guides | `/guides` |
| API partners | `/developers` |
| About | `/about` |

### Repository (`docs/`)

| Doc | Description |
|-----|-------------|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/SETUP.md](docs/SETUP.md) | Production setup |
| [docs/ENV.md](docs/ENV.md) | Environment variables |
| [docs/API.md](docs/API.md) | REST API reference |
| [docs/ADMIN.md](docs/ADMIN.md) | Admin console |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Cron, CI, monitoring |
| [docs/DOMAIN.md](docs/DOMAIN.md) | Custom domain |
| [docs/MOBILE.md](docs/MOBILE.md) | PWA / mobile |
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) | Architecture & schema |

## Contributor points

| Action | Points |
|--------|--------|
| Verify a station | 5 |
| Upload a photo | 10 |
| Add a station | 25 |

## Project structure

```
src/app/              Next.js pages and API routes
src/components/       Map, search, station, layout UI
src/lib/content/      Guides and help docs content
src/lib/              Supabase, types, utilities
supabase/migrations/  PostgreSQL schema (12 migrations)
docs/                 Operator and developer documentation
scripts/              Import, setup, smoke test tooling
```

## Stack

Next.js 16 · React 19 · Tailwind 4 · Supabase · Mapbox / Leaflet · Vercel

## License

Station data attributed to [pure-gas.org](https://www.pure-gas.org/). Application code per repository license.
