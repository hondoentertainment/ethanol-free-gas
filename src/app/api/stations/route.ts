import { dispatchFuelAlerts } from "@/lib/alerts/dispatch";
import {
  parseClassificationFromRequest,
  queryStations,
} from "@/lib/data/query-stations";
import { isPureGasDataAvailable } from "@/lib/data/pure-gas";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { StationClassification } from "@/lib/types/station";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;
  const radius = Math.min(
    Math.max(Number(searchParams.get("radius") ?? 25), 1),
    100
  );
  const showAll = searchParams.get("all") === "true";
  const limit = showAll
    ? Math.min(Math.max(Number(searchParams.get("limit") ?? 20000), 1), 20000)
    : Math.min(Math.max(Number(searchParams.get("limit") ?? 50), 1), 200);

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

  try {
    const stations = await queryStations({
      q: searchParams.get("q")?.trim(),
      zip: searchParams.get("zip")?.trim(),
      city: searchParams.get("city")?.trim(),
      state: searchParams.get("state")?.trim(),
      classification: parseClassificationFromRequest(
        searchParams.get("classification")
      ),
      lat,
      lng,
      radius,
      limit,
      all: showAll,
    });

    return NextResponse.json(
      {
        stations,
        count: stations.length,
        source: isSupabaseConfigured()
          ? "supabase"
          : isPureGasDataAvailable()
            ? "pure-gas"
            : "demo",
      },
      {
        headers: {
          // Public station data — let the CDN/browser serve repeat and
          // multi-user loads instantly while revalidating in the background.
          // The nationwide "all" dataset only changes on the weekly import, so
          // it can be cached far more aggressively than location/search queries.
          "Cache-Control": showAll
            ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
            : "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load stations",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const name = (body.name as string | undefined)?.trim();
  const address = (body.address as string | undefined)?.trim();
  const city = (body.city as string | undefined)?.trim();
  const state = (body.state as string | undefined)?.trim();
  const zip = (body.zip as string | undefined)?.trim() || null;
  const country = (body.country as string | undefined)?.trim() || "US";
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const classification = body.classification as StationClassification;
  const fuelType = (body.fuel_type as string | undefined)?.trim() || "E0 Gasoline";
  const ethanolPercent = Number(body.ethanol_percent ?? 0);
  const phone = (body.phone as string | undefined)?.trim() || null;

  if (
    !name ||
    !address ||
    !city ||
    !state ||
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    !["car", "boat", "dual"].includes(classification)
  ) {
    return NextResponse.json(
      {
        error:
          "name, address, city, state, lat, lng, and classification (car|boat|dual) are required",
      },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Connect Supabase to add stations" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in required to add a station" },
      { status: 401 }
    );
  }

  const { data: nearby } = await supabase.rpc("find_nearby_station", {
    p_lat: lat,
    p_lng: lng,
    p_miles: 0.15,
  });

  const duplicate = (nearby as { id: string; source: string | null }[] | null)?.find(
    (s) => s.source === "pure-gas.org"
  );
  if (duplicate) {
    return NextResponse.json(
      {
        error: "A station already exists at this location (imported listing). Verify it instead of adding a duplicate.",
        existing_station_id: duplicate.id,
      },
      { status: 409 }
    );
  }

  const { data: station, error } = await supabase
    .from("stations")
    .insert({
      name,
      address,
      city,
      state,
      zip,
      country,
      lat,
      lng,
      classification,
      fuel_type: fuelType,
      ethanol_percent: ethanolPercent,
      phone,
      submitted_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await dispatchFuelAlerts(
    {
      stationId: station.id,
      stationName: station.name,
      alertType: "new_station",
      target: { lat: station.lat, lng: station.lng },
    },
    user.id
  );

  return NextResponse.json({ station }, { status: 201 });
}
