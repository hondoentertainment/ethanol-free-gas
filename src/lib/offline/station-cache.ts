const CACHE_KEY = "e0finder_stations_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface CachedStationsPayload {
  stations: unknown[];
  cachedAt: number;
  center?: { lat: number; lng: number };
}

export function cacheStations(payload: CachedStationsPayload): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // quota or private mode
  }
}

export function getCachedStations(): CachedStationsPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStationsPayload;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
