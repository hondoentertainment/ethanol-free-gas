import { haversineMiles } from "@/lib/utils/geo";

export interface LatLng {
  lat: number;
  lng: number;
}

/** Distance in miles from a point to a polyline (sequence of lat/lng). */
export function distanceToPolylineMiles(
  point: LatLng,
  polyline: LatLng[]
): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) {
    return haversineMiles(point.lat, point.lng, polyline[0].lat, polyline[0].lng);
  }

  let min = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = pointToSegmentDistanceMiles(point, polyline[i], polyline[i + 1]);
    if (d < min) min = d;
  }
  return min;
}

function pointToSegmentDistanceMiles(
  p: LatLng,
  a: LatLng,
  b: LatLng
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const latScale = Math.cos(toRad((a.lat + b.lat + p.lat) / 3));

  const px = p.lng * latScale;
  const py = p.lat;
  const ax = a.lng * latScale;
  const ay = a.lat;
  const bx = b.lng * latScale;
  const by = b.lat;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return haversineMiles(p.lat, p.lng, a.lat, a.lng);
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))
  );
  const closestLng = (ax + t * dx) / latScale;
  const closestLat = ay + t * dy;

  return haversineMiles(p.lat, p.lng, closestLat, closestLng);
}

export function decodeMapboxPolyline(
  coordinates: [number, number][]
): LatLng[] {
  return coordinates.map(([lng, lat]) => ({ lat, lng }));
}

export function sortStationsForDisplay<T extends {
  is_premium?: boolean;
  is_sponsored?: boolean;
  distance_miles?: number;
  distance_from_route_miles?: number;
}>(stations: T[]): T[] {
  return [...stations].sort((a, b) => {
    const aFeatured = (a.is_premium ? 2 : 0) + (a.is_sponsored ? 1 : 0);
    const bFeatured = (b.is_premium ? 2 : 0) + (b.is_sponsored ? 1 : 0);
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;

    const aDist = a.distance_from_route_miles ?? a.distance_miles ?? Infinity;
    const bDist = b.distance_from_route_miles ?? b.distance_miles ?? Infinity;
    return aDist - bDist;
  });
}
