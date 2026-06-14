import { NextRequest, NextResponse } from "next/server";

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  place_type: string[];
  context?: { id: string; text: string; short_code?: string }[];
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Mapbox token not configured", suggestions: [] },
      { status: 503 }
    );
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "US,CA");
  url.searchParams.set("types", "place,postcode,address,locality,neighborhood");
  url.searchParams.set("limit", "6");
  url.searchParams.set("autocomplete", "true");

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Geocoding request failed", suggestions: [] },
      { status: 502 }
    );
  }

  const data = (await response.json()) as { features: MapboxFeature[] };

  const suggestions = data.features.map((feature) => {
    const zipContext = feature.context?.find((c) => c.id.startsWith("postcode"));
    const placeContext = feature.context?.find((c) => c.id.startsWith("place"));
    const regionContext = feature.context?.find((c) =>
      c.id.startsWith("region")
    );

    return {
      id: feature.id,
      label: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
      city: placeContext?.text ?? feature.text,
      state: regionContext?.short_code?.replace("US-", "").replace("CA-", ""),
      zip: zipContext?.text,
      place_type: feature.place_type[0] ?? "place",
    };
  });

  return NextResponse.json({ suggestions });
}
