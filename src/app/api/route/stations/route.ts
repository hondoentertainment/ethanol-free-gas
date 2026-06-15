import {
  fetchMapboxRoute,
  parseClassificationFromRequest,
  queryStations,
} from "@/lib/data/query-stations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const originLat = Number(searchParams.get("origin_lat"));
  const originLng = Number(searchParams.get("origin_lng"));
  const destLat = Number(searchParams.get("dest_lat"));
  const destLng = Number(searchParams.get("dest_lng"));
  const corridorMiles = Math.min(
    Math.max(Number(searchParams.get("corridor") ?? 5), 1),
    25
  );

  if (
    Number.isNaN(originLat) ||
    Number.isNaN(originLng) ||
    Number.isNaN(destLat) ||
    Number.isNaN(destLng)
  ) {
    return NextResponse.json(
      {
        error:
          "origin_lat, origin_lng, dest_lat, and dest_lng are required numbers",
      },
      { status: 400 }
    );
  }

  try {
    const routePolyline = await fetchMapboxRoute(
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng }
    );

    const stations = await queryStations({
      classification: parseClassificationFromRequest(
        searchParams.get("classification")
      ),
      routePolyline,
      corridorMiles,
      limit: 100,
    });

    return NextResponse.json({
      stations,
      count: stations.length,
      route: routePolyline,
      corridor_miles: corridorMiles,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to search route",
      },
      { status: 500 }
    );
  }
}
