export interface RouteEndpoints {
  origin: { lat: number; lng: number };
  dest: { lat: number; lng: number };
}

export function parseRouteParams(
  params: URLSearchParams
): RouteEndpoints | null {
  const olat = Number(params.get("olat"));
  const olng = Number(params.get("olng"));
  const dlat = Number(params.get("dlat"));
  const dlng = Number(params.get("dlng"));

  if (
    !Number.isFinite(olat) ||
    !Number.isFinite(olng) ||
    !Number.isFinite(dlat) ||
    !Number.isFinite(dlng)
  ) {
    return null;
  }

  return {
    origin: { lat: olat, lng: olng },
    dest: { lat: dlat, lng: dlng },
  };
}

export function buildRouteShareUrl(
  endpoints: RouteEndpoints,
  origin = "https://ethanol-free-gas.vercel.app"
): string {
  const params = new URLSearchParams({
    olat: String(endpoints.origin.lat),
    olng: String(endpoints.origin.lng),
    dlat: String(endpoints.dest.lat),
    dlng: String(endpoints.dest.lng),
  });
  return `${origin}/?${params.toString()}`;
}
