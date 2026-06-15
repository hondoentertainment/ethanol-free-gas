import {
  enrichStation,
  MOCK_STATIONS,
  parseClassification,
} from "@/lib/data/stations";
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
  decodeMapboxPolyline,
  distanceToPolylineMiles,
  sortStationsForDisplay,
  type LatLng,
} from "@/lib/utils/route";

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
}

function filterMockStations(params: StationQueryParams): StationWithMeta[] {
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

  let results = [...MOCK_STATIONS];

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
      .filter((s) => s.distance_miles <= radius);
  }

  return sortStationsForDisplay(results);
}

export async function queryStations(
  params: StationQueryParams
): Promise<StationWithMeta[]> {
  const radius = Math.min(Math.max(params.radius ?? 25, 1), 100);
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
  const center =
    params.lat != null && params.lng != null
      ? { lat: params.lat, lng: params.lng }
      : undefined;

  if (!isSupabaseConfigured()) {
    return filterMockStations({ ...params, radius });
  }

  const supabase = await createClient();
  let query = supabase.from("stations").select("*");

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

  if (center && !params.routePolyline?.length) {
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

  query = query.limit(limit);

  const { data: stations, error } = await query;
  if (error) throw new Error(error.message);

  const stationRows = (stations ?? []) as Station[];
  const stationIds = stationRows.map((s) => s.id);

  let verifications: Verification[] = [];
  if (stationIds.length > 0) {
    const { data: verificationRows, error: verificationError } = await supabase
      .from("verifications")
      .select("*")
      .in("station_id", stationIds)
      .order("created_at", { ascending: false });

    if (verificationError) throw new Error(verificationError.message);
    verifications = (verificationRows ?? []) as Verification[];
  }

  let enriched = stationRows.map((station) =>
    enrichStation(
      station,
      verifications.filter((v) => v.station_id === station.id),
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
  } else if (center) {
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
  if (!token) throw new Error("Mapbox token not configured");

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "full");

  const response = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Failed to fetch route from Mapbox");

  const data = (await response.json()) as {
    routes?: { geometry?: { coordinates?: [number, number][] } }[];
  };

  const coordinates = data.routes?.[0]?.geometry?.coordinates;
  if (!coordinates?.length) throw new Error("No route found for this trip");

  return decodeMapboxPolyline(coordinates);
}

export function parseClassificationFromRequest(
  value: string | null
): StationClassification | null {
  return parseClassification(value);
}
