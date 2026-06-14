import { enrichStation, MOCK_STATIONS, parseClassification } from "@/lib/data/stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Station, Verification } from "@/lib/types/station";
import { boundingBox, haversineMiles } from "@/lib/utils/geo";
import { NextRequest, NextResponse } from "next/server";

function filterMockStations(
  searchParams: URLSearchParams,
  center?: { lat: number; lng: number },
  radius = 50
) {
  const q = searchParams.get("q")?.trim().toLowerCase();
  const zip = searchParams.get("zip")?.trim();
  const city = searchParams.get("city")?.trim().toLowerCase();
  const state = searchParams.get("state")?.trim().toLowerCase();
  const classification = parseClassification(
    searchParams.get("classification")
  );

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

  if (center) {
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
      .filter((s) => s.distance_miles <= radius)
      .sort((a, b) => a.distance_miles! - b.distance_miles!);
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const zip = searchParams.get("zip")?.trim();
  const city = searchParams.get("city")?.trim();
  const state = searchParams.get("state")?.trim();
  const classification = parseClassification(
    searchParams.get("classification")
  );

  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");

  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;
  const radius = Math.min(
    Math.max(radiusParam ? Number(radiusParam) : 25, 1),
    100
  );
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? 50), 1),
    200
  );

  if (
    (latParam && Number.isNaN(lat)) ||
    (lngParam && Number.isNaN(lng)) ||
    (lat != null && lng == null) ||
    (lng != null && lat == null)
  ) {
    return NextResponse.json(
      { error: "lat and lng must be valid numbers when provided" },
      { status: 400 }
    );
  }

  const center = lat != null && lng != null ? { lat, lng } : undefined;

  if (!isSupabaseConfigured()) {
    const stations = filterMockStations(searchParams, center, radius);
    return NextResponse.json({ stations, count: stations.length });
  }

  const supabase = await createClient();
  let query = supabase.from("stations").select("*");

  if (classification) {
    query = query.eq("classification", classification);
  }

  if (zip) {
    query = query.ilike("zip", `${zip}%`);
  }

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (state) {
    query = query.ilike("state", state);
  }

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,address.ilike.%${q}%,city.ilike.%${q}%,zip.ilike.%${q}%`
    );
  }

  if (lat != null && lng != null) {
    const box = boundingBox(lat, lng, radius);
    query = query
      .gte("lat", box.minLat)
      .lte("lat", box.maxLat)
      .gte("lng", box.minLng)
      .lte("lng", box.maxLng);
  }

  query = query.limit(limit);

  const { data: stations, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stationRows = (stations ?? []) as Station[];
  const stationIds = stationRows.map((s) => s.id);

  let verifications: Verification[] = [];

  if (stationIds.length > 0) {
    const { data: verificationRows, error: verificationError } = await supabase
      .from("verifications")
      .select("*")
      .in("station_id", stationIds)
      .order("created_at", { ascending: false });

    if (verificationError) {
      return NextResponse.json(
        { error: verificationError.message },
        { status: 500 }
      );
    }

    verifications = (verificationRows ?? []) as Verification[];
  }

  let enriched = stationRows.map((station) =>
    enrichStation(
      station,
      verifications.filter((v) => v.station_id === station.id),
      center
    )
  );

  if (center) {
    enriched = enriched
      .filter((s) => (s.distance_miles ?? 0) <= radius)
      .sort((a, b) => (a.distance_miles ?? 0) - (b.distance_miles ?? 0));
  }

  return NextResponse.json({
    stations: enriched,
    count: enriched.length,
  });
}
