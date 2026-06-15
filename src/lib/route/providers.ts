import type { LatLng } from "@/lib/utils/route";

export async function fetchRouteWithMapbox(
  origin: LatLng,
  destination: LatLng,
  token: string
): Promise<LatLng[]> {
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

  return coordinates.map(([lng, lat]) => ({ lat, lng }));
}

export async function fetchRouteWithOsrm(
  origin: LatLng,
  destination: LatLng
): Promise<LatLng[]> {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
  );
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");

  const response = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Failed to fetch route from OSRM");

  const data = (await response.json()) as {
    routes?: { geometry?: { coordinates?: [number, number][] } }[];
  };

  const coordinates = data.routes?.[0]?.geometry?.coordinates;
  if (!coordinates?.length) throw new Error("No route found for this trip");

  return coordinates.map(([lng, lat]) => ({ lat, lng }));
}
