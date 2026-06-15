import {
  geocodeWithMapbox,
  geocodeWithNominatim,
} from "@/lib/geocode/providers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  try {
    const suggestions = token
      ? await geocodeWithMapbox(q, token)
      : await geocodeWithNominatim(q);
    return NextResponse.json({ suggestions });
  } catch {
    if (token) {
      try {
        const suggestions = await geocodeWithNominatim(q);
        return NextResponse.json({ suggestions });
      } catch {
        return NextResponse.json(
          { error: "Geocoding request failed", suggestions: [] },
          { status: 502 }
        );
      }
    }
    return NextResponse.json(
      { error: "Geocoding request failed", suggestions: [] },
      { status: 502 }
    );
  }
}
