import { logApiUsage } from "@/lib/api/usage-log";
import { validateApiLicenseKey } from "@/lib/api/license";
import {
  parseClassificationFromRequest,
  queryStations,
} from "@/lib/data/query-stations";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey =
    request.headers.get("x-api-key") ??
    request.nextUrl.searchParams.get("api_key");

  if (!validateApiLicenseKey(apiKey)) {
    return NextResponse.json(
      { error: "Valid API license key required (X-API-Key header)" },
      { status: 401 }
    );
  }

  // Enforce the documented partner quota per API key (not per IP).
  const limited = await enforceRateLimit(request, {
    name: "api-v1",
    requests: 60,
    windowSeconds: 60,
    identifier: apiKey ?? undefined,
  });
  if (limited) return limited;

  if (apiKey) {
    void logApiUsage(apiKey, "/api/v1/stations");
  }

  const { searchParams } = request.nextUrl;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;

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
      radius: Number(searchParams.get("radius") ?? 25),
      limit: Math.min(Number(searchParams.get("limit") ?? 100), 500),
    });

    return NextResponse.json({
      data: stations.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        city: s.city,
        state: s.state,
        zip: s.zip,
        country: s.country,
        lat: s.lat,
        lng: s.lng,
        classification: s.classification,
        fuel_type: s.fuel_type,
        ethanol_percent: s.ethanol_percent,
        phone: s.phone,
        is_premium: s.is_premium,
        is_sponsored: s.is_sponsored,
        verification_label: s.verification_label,
        distance_miles: s.distance_miles,
      })),
      meta: { count: stations.length, version: "v1" },
    });
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
