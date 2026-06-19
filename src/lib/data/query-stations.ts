import {
  fetchRouteWithMapbox,
  fetchRouteWithOsrm,
} from "@/lib/route/providers";
import {
  enrichStation,
  parseClassification,
} from "@/lib/data/stations";
import {
  getAllPureGasStations,
  isPureGasDataAvailable,
} from "@/lib/data/pure-gas";
import { ALL_DEMO_STATIONS } from "@/lib/data/seed-stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  Station,
  StationClassification,
  StationWithMeta,
  Verification,
} from "@/lib/types/station";
import { boundingBox, haversineMiles } from "@/lib/utils/geo";
import {
  distanceToPolylineMiles,
  sortStationsForDisplay,
  type LatLng,
} from "@/lib/utils/route";

/**
 * Columns needed to render the map + list + bottom sheet. Excludes heavy or
 * detail-only fields (notes, source_url, hours, timestamps) to shrink the
 * payload — especially important for the "all stations" (up to 20k rows) load.
 */
const STATION_LIST_COLUMNS =
  "id,name,address,city,state,zip,country,lat,lng,classification,fuel_type,ethanol_percent,phone,is_premium,is_sponsored";

export interface StationQueryParams {
  q?: string;
  zip?: string;
  city?: string;
  state?: string;
  classification?: StationClassification | null;
  lat?: number | null;
  lng?: number | null;
  radius?: number;
  limit?: number;
  routePolyline?: LatLng[];
  corridorMiles?: number;
  all?: boolean;
}

function getLocalStationPool(center?: { lat: number; lng: number }): StationWithMeta[] {
  if (isPureGasDataAvailable()) {
    return getAllPureGasStations(center);
  }
  if (!center) return [...ALL_DEMO_STATIONS];
  return ALL_DEMO_STATIONS.map((station) => ({
    ...station,
    distance_miles: haversineMiles(
      center.lat,
      center.lng,
      station.lat,
      station.lng
    ),
  }));
}

function filterLocalStations(params: StationQueryParams): StationWithMeta[] {
  const q = params.q?.trim().toLowerCase();
  const zip = params.zip?.trim();
  const city = params.city?.trim().toLowerCase();
  const state = params.state?.trim().toLowerCase();
  const classification = params.classification;
  const radius = params.radius ?? 50;
  const center =
    params.lat != null && params.lng != null
      ? { lat: params.lat, lng: params.lng }
      : undefined;

  let results = getLocalStationPool(center);

  if (classification) {
    results = results.filter((s) => s.classification === classification);
  }
  if (zip) {
    results = results.filter((s) => s.zip?.startsWith(zip));
  }
  if (city) {
    results = results.filter((s) => s.city.toLowerCase().includes(city));
  }
  if (state) {
    results = results.filter((s) => s.state.toLowerCase() === state);
  }
  if (q) {
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.zip?.toLowerCase().includes(q) ?? false)
    );
  }

  if (params.routePolyline?.length) {
    const corridor = params.corridorMiles ?? 5;
    results = results
      .map((station) => ({
        ...station,
        distance_from_route_miles: distanceToPolylineMiles(
          { lat: station.lat, lng: station.lng },
          params.routePolyline!
        ),
      }))
      .filter((s) => s.distance_from_route_miles <= corridor);
  } else if (center) {
    results = results
      .map((station) => ({
        ...station,
        distance_miles: haversineMiles(
          center.lat,
          center.lng,
          station.lat,
          station.lng
        ),
      }))
      .filter((s) => params.all || s.distance_miles <= radius);
  }

  return sortStationsForDisplay(results);
}

export async function queryStations(
  params: StationQueryParams
): Promise<StationWithMeta[]> {
  const radius = Math.min(Math.max(params.radius ?? 25, 1), 100);
  const limit = Math.min(
    Math.max(params.limit ?? (params.all ? 20000 : 50), 1),
    20000
  );
  const center =
    params.lat != null && params.lng != null
      ? { lat: params.lat, lng: params.lng }
      : undefined;

  if (!isSupabaseConfigured()) {
    return filterLocalStations({ ...params, radius }).slice(0, limit);
  }

  const supabase = await createClient();

  // Rebuild a fresh filtered query per page. PostgREST caps a single response
  // at its `max-rows` setting (1000 here), so anything larger must be fetched
  // with stable, ordered .range() pagination — otherwise the nationwide "all"
  // view silently truncates to 1000 stations.
  const buildQuery = (opts?: { withCount?: boolean }) => {
    let query = supabase
      .from("stations")
      .select(
        STATION_LIST_COLUMNS,
        opts?.withCount ? { count: "exact" } : undefined
      )
      .order("id", { ascending: true });

    if (params.classification) {
      query = query.eq("classification", params.classification);
    }
    if (params.zip) {
      query = query.ilike("zip", `${params.zip}%`);
    }
    if (params.city) {
      query = query.ilike("city", `%${params.city}%`);
    }
    if (params.state) {
      query = query.ilike("state", params.state);
    }
    if (params.q) {
      query = query.or(
        `name.ilike.%${params.q}%,address.ilike.%${params.q}%,city.ilike.%${params.q}%,zip.ilike.%${params.q}%`
      );
    }

    if (center && !params.routePolyline?.length && !params.all) {
      const box = boundingBox(center.lat, center.lng, radius);
      query = query
        .gte("lat", box.minLat)
        .lte("lat", box.maxLat)
        .gte("lng", box.minLng)
        .lte("lng", box.maxLng);
    }

    if (params.routePolyline?.length) {
      const lats = params.routePolyline.map((p) => p.lat);
      const lngs = params.routePolyline.map((p) => p.lng);
      const corridor = params.corridorMiles ?? 5;
      const latPad = corridor / 69;
      const lngPad =
        corridor /
        (69 * Math.cos(((Math.min(...lats) + Math.max(...lats)) / 2) * (Math.PI / 180)));
      query = query
        .gte("lat", Math.min(...lats) - latPad)
        .lte("lat", Math.max(...lats) + latPad)
        .gte("lng", Math.min(...lngs) - lngPad)
        .lte("lng", Math.max(...lngs) + lngPad);
    }

    return query;
  };

  const PAGE_SIZE = 1000;
  const stations: Station[] = [];

  if (limit <= PAGE_SIZE) {
    // Single page (regional / search) — one round trip.
    const { data: page, error } = await buildQuery().range(0, limit - 1);
    if (error) throw new Error(error.message);
    stations.push(...((page ?? []) as Station[]));
  } else {
    // Large set (nationwide "all"). Fetch the first page together with an exact
    // count, then request the remaining pages in parallel instead of walking
    // ~18 sequential round trips.
    const {
      data: firstPage,
      count,
      error,
    } = await buildQuery({ withCount: true }).range(0, PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    stations.push(...((firstPage ?? []) as Station[]));

    const total = Math.min(count ?? stations.length, limit);
    const pageStarts: number[] = [];
    for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) {
      pageStarts.push(from);
    }

    // Cap concurrency so we don't open too many simultaneous PostgREST requests.
    const CONCURRENCY = 6;
    for (let i = 0; i < pageStarts.length; i += CONCURRENCY) {
      const batch = pageStarts.slice(i, i + CONCURRENCY);
      const pages = await Promise.all(
        batch.map((from) =>
          buildQuery().range(from, Math.min(from + PAGE_SIZE, total) - 1)
        )
      );
      for (const { data: page, error: pageError } of pages) {
        if (pageError) throw new Error(pageError.message);
        stations.push(...((page ?? []) as Station[]));
      }
    }
  }

  const stationRows = stations;
  const stationIds = stationRows.map((s) => s.id);

  let verifications: Verification[] = [];
  if (stationIds.length > 0) {
    // PostgREST rejects very large .in() lists (the nationwide "all" view can
    // include 17k+ ids, producing a multi-hundred-KB query string → 500).
    // Above a threshold, fetch the much smaller verifications table in full and
    // group it in memory instead of filtering by id.
    const VERIFICATION_IN_LIMIT = 300;
    let verificationQuery = supabase
      .from("verifications")
      .select("station_id,status,created_at,notes")
      .order("created_at", { ascending: false })
      .limit(100000);

    if (stationIds.length <= VERIFICATION_IN_LIMIT) {
      verificationQuery = verificationQuery.in("station_id", stationIds);
    }

    const { data: verificationRows, error: verificationError } =
      await verificationQuery;

    if (verificationError) throw new Error(verificationError.message);
    verifications = (verificationRows ?? []) as Verification[];
  }

  // Group once (O(n)) instead of filtering per station (O(n·m)).
  const verificationsByStation = new Map<string, Verification[]>();
  for (const verification of verifications) {
    const list = verificationsByStation.get(verification.station_id);
    if (list) list.push(verification);
    else verificationsByStation.set(verification.station_id, [verification]);
  }

  let enriched = stationRows.map((station) =>
    enrichStation(
      station,
      verificationsByStation.get(station.id) ?? [],
      center
    )
  );

  if (params.routePolyline?.length) {
    const corridor = params.corridorMiles ?? 5;
    enriched = enriched
      .map((station) => ({
        ...station,
        distance_from_route_miles: distanceToPolylineMiles(
          { lat: station.lat, lng: station.lng },
          params.routePolyline!
        ),
      }))
      .filter((s) => s.distance_from_route_miles <= corridor);
  } else if (center && !params.all) {
    enriched = enriched
      .filter((s) => (s.distance_miles ?? 0) <= radius)
      .sort((a, b) => (a.distance_miles ?? 0) - (b.distance_miles ?? 0));
  }

  return sortStationsForDisplay(enriched);
}

export async function fetchMapboxRoute(
  origin: LatLng,
  destination: LatLng
): Promise<LatLng[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (token) {
    return fetchRouteWithMapbox(origin, destination, token);
  }
  return fetchRouteWithOsrm(origin, destination);
}

export function parseClassificationFromRequest(
  value: string | null
): StationClassification | null {
  return parseClassification(value);
}
