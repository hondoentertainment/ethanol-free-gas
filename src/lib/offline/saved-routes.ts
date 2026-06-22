import type { RouteEndpoints } from "@/lib/utils/route-share";

export interface SavedRoute {
  id: string;
  label: string;
  endpoints: RouteEndpoints;
  savedAt: number;
}

const STORAGE_KEY = "e0-saved-routes";
const MAX_ROUTES = 10;

export function getSavedRoutes(): SavedRoute[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedRoute[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRoute(
  endpoints: RouteEndpoints,
  label: string
): SavedRoute[] {
  const routes = getSavedRoutes().filter(
    (route) =>
      !(
        route.endpoints.origin.lat === endpoints.origin.lat &&
        route.endpoints.origin.lng === endpoints.origin.lng &&
        route.endpoints.dest.lat === endpoints.dest.lat &&
        route.endpoints.dest.lng === endpoints.dest.lng
      )
  );

  const entry: SavedRoute = {
    id: crypto.randomUUID(),
    label,
    endpoints,
    savedAt: Date.now(),
  };

  const next = [entry, ...routes].slice(0, MAX_ROUTES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeSavedRoute(id: string): SavedRoute[] {
  const next = getSavedRoutes().filter((route) => route.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
