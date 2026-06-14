# Technical Specification — Ethanol-Free Fuel Finder

**PRD Version:** 1.0  
**Spec Version:** 1.0  
**Stack:** Next.js 16, React 19, Tailwind 4, Supabase, Mapbox

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Browser (mobile-first)                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ MapView      │  │ SearchBar    │  │ Station UI   │  │
│  │ (Mapbox)     │  │              │  │ BottomSheet  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         └─────────────────┼─────────────────┘          │
│                           ▼                            │
│              Next.js App Router + API Routes           │
└───────────────────────────┬─────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase                                               │
│  PostgreSQL + RLS │ Auth │ Storage (photos, Phase 2)   │
└─────────────────────────────────────────────────────────┘
```

**Rendering strategy**

- Map and interactive search: client components (`"use client"`).
- Station detail page: server component with optional client verification form.
- API routes: server-side Supabase client for consistent querying.

---

## 2. Database Schema

### Enums

| Enum | Values |
|------|--------|
| `station_classification` | `car`, `boat`, `dual` |
| `verification_status` | `available`, `unavailable`, `incorrect` |

### Tables

#### `stations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text` | Required |
| `address` | `text` | Street address |
| `city` | `text` | |
| `state` | `text` | US state / CA province code |
| `zip` | `text` | |
| `country` | `text` | Default `US` |
| `lat` | `double precision` | |
| `lng` | `double precision` | |
| `classification` | `station_classification` | `car` \| `boat` \| `dual` |
| `fuel_type` | `text` | e.g. `E0 Gasoline` |
| `ethanol_percent` | `numeric(4,2)` | Default `0` |
| `phone` | `text` | Optional |
| `hours` | `jsonb` | Structured hours object |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

#### `verifications`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `station_id` | `uuid` FK → `stations` | |
| `user_id` | `uuid` FK → `auth.users` | Nullable for anonymous MVP |
| `status` | `verification_status` | |
| `notes` | `text` | Optional |
| `created_at` | `timestamptz` | |

#### `photos` (schema ready; upload UI Phase 2)

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `station_id` | `uuid` FK | |
| `user_id` | `uuid` FK | |
| `url` | `text` | Storage public URL |
| `created_at` | `timestamptz` | |

### RLS Policies (MVP)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `stations` | Public | Service role only | Service role | Service role |
| `verifications` | Public | Authenticated users | — | — |
| `photos` | Public | Authenticated users | — | — |

### Derived: Verification Freshness

Computed in application layer from latest `verifications` row where `status = 'available'`:

| Label | Condition |
|-------|-----------|
| Verified Today | `created_at` within 24 hours |
| Verified This Week | Within 7 days |
| Verified This Month | Within 30 days |
| Unverified | No verification or older than 30 days |

---

## 3. API Contracts

### `GET /api/stations`

List and search stations.

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search (name, address, city) |
| `zip` | string | Exact or prefix ZIP match |
| `city` | string | City name (case-insensitive) |
| `state` | string | State/province code |
| `lat` | number | Center latitude |
| `lng` | number | Center longitude |
| `radius` | number | Radius in miles (default 25, max 100) |
| `classification` | string | `car`, `boat`, or `dual` |
| `limit` | number | Max results (default 50, max 200) |

**Response `200`**

```json
{
  "stations": [
    {
      "id": "uuid",
      "name": "Marina Fuel Dock",
      "address": "123 Harbor Rd",
      "city": "Annapolis",
      "state": "MD",
      "zip": "21401",
      "country": "US",
      "lat": 38.9784,
      "lng": -76.4922,
      "classification": "boat",
      "fuel_type": "E0 Gasoline",
      "ethanol_percent": 0,
      "phone": "+1-410-555-0100",
      "hours": { "mon": "6:00-20:00" },
      "last_verification": {
        "status": "available",
        "created_at": "2026-06-14T10:00:00Z"
      },
      "verification_label": "verified_today",
      "distance_miles": 3.2
    }
  ],
  "count": 1
}
```

**Errors:** `400` invalid params, `500` server error.

---

### `GET /api/stations/[id]`

Single station with recent verifications.

**Response `200`**

```json
{
  "station": { /* station fields */ },
  "verifications": [ /* last 10 */ ],
  "verification_label": "verified_this_week"
}
```

**Errors:** `404` not found.

---

### `POST /api/verifications`

Submit a verification (requires auth when configured).

**Body**

```json
{
  "station_id": "uuid",
  "status": "available",
  "notes": "Pump 3, rec-90 available"
}
```

**Response `201`**

```json
{
  "verification": {
    "id": "uuid",
    "station_id": "uuid",
    "status": "available",
    "created_at": "2026-06-14T12:00:00Z"
  }
}
```

**Errors:** `400` validation, `401` unauthenticated, `404` station not found.

---

## 4. Component Tree

```
app/layout.tsx
├── components/layout/Header.tsx
└── app/page.tsx (Home — Map)
    ├── components/search/SearchBar.tsx
    ├── components/map/MapView.tsx
    │   └── components/map/StationMarker.tsx (inline)
    └── components/station/StationBottomSheet.tsx
        ├── ClassificationBadge
        ├── VerificationBadge
        └── DirectionsLinks

app/station/[id]/page.tsx
├── Station detail (server)
├── ClassificationBadge
├── VerificationBadge
├── DirectionsLinks
└── components/station/VerificationForm.tsx (client)

app/auth/login/page.tsx
└── Email + OAuth buttons (Supabase Auth UI pattern)
```

---

## 5. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes* | Mapbox public token |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Admin seed/scripts only |

\* Map UI degrades to list-only mode without token.

---

## 6. Sprint Plan

### Sprint 1 — Foundation (current)

- [x] PRD + technical spec
- [x] Next.js scaffold
- [x] Supabase schema + RLS + seed
- [x] API routes
- [x] Map MVP wired to API

### Sprint 2 — Auth + Verification

- Supabase Auth (email, Google)
- Protected verification POST
- Login page + callback route
- Middleware session refresh

### Sprint 3 — Search Polish

- Mapbox Geocoding for address search
- ZIP/city autocomplete
- Classification filters on map

### Sprint 4 — Route Search (Phase 2 MVP)

- Route input (origin + destination)
- Stations along polyline corridor
- RV/boat trip use cases

### Sprint 5 — Community + Photos

- Add/edit station flows
- Supabase Storage for photos
- Contributor points (basic)

### Sprint 6 — Monetization + PWA

- Ad slot components
- Premium listing flags in DB
- Service worker + offline cache

---

## 7. File Map

```
docs/PRD.md
docs/TECHNICAL_SPEC.md
supabase/migrations/001_initial_schema.sql
supabase/seed.sql
src/app/api/stations/route.ts
src/app/api/stations/[id]/route.ts
src/app/api/verifications/route.ts
src/app/auth/login/page.tsx
src/app/auth/callback/route.ts
src/app/station/[id]/page.tsx
src/components/map/MapView.tsx
src/components/search/SearchBar.tsx
src/components/station/*
src/components/layout/Header.tsx
src/lib/supabase/*
src/lib/types/station.ts
src/lib/utils/geo.ts
src/lib/utils/verification.ts
```

---

## 8. Non-Goals (MVP)

- Route-based search
- Push notifications / fuel alerts
- Photo uploads
- Premium listings / ads
- Apple Sign-In (Sprint 2+)
- Native mobile apps
