export interface GeocodeSuggestion {
  id: string;
  label: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zip?: string;
  place_type: string;
}

const NOMINATIM_UA = "EthanolFreeFuelFinder/1.0 (ethanol-free-gas.vercel.app)";

export async function geocodeWithMapbox(
  q: string,
  token: string
): Promise<GeocodeSuggestion[]> {
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
  if (!response.ok) throw new Error("Mapbox geocoding failed");

  const data = (await response.json()) as {
    features: {
      id: string;
      place_name: string;
      center: [number, number];
      text: string;
      place_type: string[];
      context?: { id: string; text: string; short_code?: string }[];
    }[];
  };

  return data.features.map((feature) => {
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
      state: regionContext?.short_code
        ?.replace("US-", "")
        .replace("CA-", ""),
      zip: zipContext?.text,
      place_type: feature.place_type[0] ?? "place",
    };
  });
}

export async function geocodeWithNominatim(q: string): Promise<GeocodeSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "us,ca");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": NOMINATIM_UA },
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error("Nominatim geocoding failed");

  const data = (await response.json()) as {
    place_id: number;
    display_name: string;
    lat: string;
    lng: string;
    type?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      postcode?: string;
    };
  }[];

  return data.map((item) => ({
    id: String(item.place_id),
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lng),
    city: item.address?.city ?? item.address?.town ?? item.address?.village,
    state: item.address?.state,
    zip: item.address?.postcode,
    place_type: item.type ?? "place",
  }));
}
