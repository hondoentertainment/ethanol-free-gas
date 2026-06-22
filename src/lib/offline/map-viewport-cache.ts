const STORAGE_KEY = "e0-map-viewport";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface MapViewport {
  lat: number;
  lng: number;
  zoom: number;
}

interface StoredViewport {
  viewport: MapViewport;
  savedAt: number;
}

export function getCachedMapViewport(): MapViewport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredViewport;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    if (
      !Number.isFinite(parsed.viewport.lat) ||
      !Number.isFinite(parsed.viewport.lng) ||
      !Number.isFinite(parsed.viewport.zoom)
    ) {
      return null;
    }
    return parsed.viewport;
  } catch {
    return null;
  }
}

export function cacheMapViewport(viewport: MapViewport): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredViewport = { viewport, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota or private mode — ignore.
  }
}
