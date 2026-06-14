# Ethanol-Free Fuel Finder

Mobile-first map for locating ethanol-free (E0) gasoline stations across the US and Canada. Built with Next.js 16, Supabase, and Mapbox.

## Features

- Interactive map with car / boat / dual station classification
- Search by city, ZIP, or address (Mapbox geocoding autocomplete)
- “Search this area” when panning the map
- Station detail pages with directions (Google Maps, Apple Maps, Waze)
- Crowdsourced fuel availability verification (requires sign-in)
- Email magic link and Google OAuth via Supabase Auth

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes* | Mapbox public token |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Admin seeding only |

\* Without Mapbox, the app falls back to a list-only view with demo data.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Run `supabase/seed.sql` for sample stations
4. Enable **Email** and **Google** providers under Authentication → Providers
5. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase configured, the app runs in **demo mode** with mock stations.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the same environment variables from `.env.local`
4. Deploy

## Project structure

```
docs/PRD.md              Product requirements
docs/TECHNICAL_SPEC.md   API contracts, schema, sprint plan
src/app/                 Next.js App Router pages and API routes
src/components/          Map, search, station UI
src/lib/                 Supabase clients, types, utilities
supabase/                SQL migrations and seed data
```

## Documentation

- [Product Requirements](docs/PRD.md)
- [Technical Specification](docs/TECHNICAL_SPEC.md)
