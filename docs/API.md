# API reference

Base URL: `https://ethanol-free-gas.vercel.app` (or your `NEXT_PUBLIC_SITE_URL`).

## Public API (licensed)

### `GET /api/v1/stations`

Licensed station search for partners.

**Auth:** `X-API-Key: your-license-key` (or `?api_key=`)

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `lat`, `lng` | number | Search center |
| `radius` | number | Miles (default 25, max 100) |
| `classification` | string | `car`, `boat`, or `dual` |
| `state`, `city`, `zip`, `q` | string | Text filters |
| `limit` | number | Max results (default 100, max 500) |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Station Name",
      "address": "123 Main St",
      "city": "Annapolis",
      "state": "MD",
      "zip": "21401",
      "country": "US",
      "lat": 38.97,
      "lng": -76.49,
      "classification": "boat",
      "fuel_type": "E0 Gasoline",
      "ethanol_percent": 0,
      "phone": null,
      "is_premium": false,
      "is_sponsored": false,
      "verification_label": "unverified",
      "distance_miles": 2.4
    }
  ],
  "meta": { "count": 1, "version": "v1" }
}
```

---

## App API (browser / same-origin)

### Stations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stations` | No | List/search stations (`?lat=&lng=&radius=`, `?all=true`, filters) |
| POST | `/api/stations` | User | Add station |
| GET | `/api/stations/[id]` | No | Station detail + verifications + photos |
| PATCH | `/api/stations/[id]` | User | Edit own station |
| POST | `/api/stations/[id]/photos` | User | Upload photo |
| GET | `/api/stations/[id]/ratings` | No | Aggregate ratings |
| POST | `/api/stations/[id]/ratings` | User | Submit/update rating |

### Search & routing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/geocode` | No | Address autocomplete (Mapbox) |
| GET | `/api/route/stations` | No | Stations along route corridor |

### Community

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/verifications` | User | Submit verification report |
| GET | `/api/leaderboard` | No | Top contributors |
| GET | `/api/profile` | User | Contributor profile |
| PATCH | `/api/profile` | User | Update display name |

### Alerts & notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/alerts` | User | List fuel alert subscriptions |
| POST | `/api/alerts` | User | Create subscription |
| DELETE | `/api/alerts/[id]` | User | Remove subscription |
| GET | `/api/notifications` | User | In-app notifications |
| PATCH | `/api/notifications` | User | Mark read |
| POST | `/api/push/subscribe` | User | Register web push endpoint |
| DELETE | `/api/push/subscribe` | User | Unregister push |

### Business

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/premium` | Optional user | Premium listing inquiry |

### System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Deployment health checks |

---

## Admin API

All admin routes require header: `X-Admin-Key: ADMIN_SECRET`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Inquiries, import runs, API usage, verification stats |
| GET | `/api/admin/stations?q=` | Search stations for premium promotion |
| PATCH | `/api/admin/actions` | Set premium/sponsored, resolve inquiries |
| POST | `/api/admin/import` | Trigger full pure-gas import |

---

## Cron

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cron/import-stations` | `Authorization: Bearer CRON_SECRET` | Weekly chunked import |

Vercel Cron invokes this automatically when `CRON_SECRET` is set. Schedule: Sunday 06:00 UTC (`vercel.json`).

Manual trigger:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://ethanol-free-gas.vercel.app/api/cron/import-stations"
```

---

## Verification statuses

| Status | Meaning |
|--------|---------|
| `available` | Still sells E0 |
| `unavailable` | Open but no longer sells E0 |
| `closed` | Closed or no longer at address |
| `incorrect` | Wrong listing details |

---

## Contributor points (server-side triggers)

| Action | Points |
|--------|--------|
| Verify station | 5 |
| Upload photo | 10 |
| Add station | 25 |

---

## Error format

```json
{ "error": "Human-readable message" }
```

Common status codes: `400` validation, `401` auth, `403` forbidden, `404` not found, `500` server error, `503` service unavailable.
