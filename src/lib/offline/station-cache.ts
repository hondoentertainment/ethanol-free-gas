const CACHE_KEY = "e0finder_stations_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** Below this count the cache is likely a regional subset, not the full map. */
export const NATIONWIDE_CACHE_MIN = 1000;

export interface CachedStationsPayload {
  stations: unknown[];
  cachedAt: number;
  center?: { lat: number; lng: number };
  nationwide?: boolean;
}

export function cacheStations(payload: CachedStationsPayload): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // quota or private mode
  }
}

export function isNationwideCache(
  payload: CachedStationsPayload | null
): payload is CachedStationsPayload {
  if (!payload?.stations?.length) return false;
  if (payload.nationwide) return true;
  // Legacy caches: no center + large count means a prior nationwide load.
  return !payload.center && payload.stations.length >= NATIONWIDE_CACHE_MIN;
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
