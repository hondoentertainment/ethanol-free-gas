"use client";

import { useEffect, useState } from "react";
import type { GeocodeSuggestion } from "@/components/search/SearchBar";
import {
  getSavedRoutes,
  removeSavedRoute,
  type SavedRoute,
} from "@/lib/offline/saved-routes";
import type { StationClassification, StationWithMeta } from "@/lib/types/station";
import type { RouteEndpoints } from "@/lib/utils/route-share";

interface RouteSearchPanelProps {
  onResults: (
    stations: StationWithMeta[],
    route: { lat: number; lng: number }[],
    endpoints: RouteEndpoints
  ) => void;
  onClear: () => void;
  onLoadSavedRoute?: (endpoints: RouteEndpoints) => void;
  classification: StationClassification | "";
  loading?: boolean;
}

export function RouteSearchPanel({
  onResults,
  onClear,
  onLoadSavedRoute,
  classification,
  loading,
}: RouteSearchPanelProps) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoords, setOriginCoords] = useState<GeocodeSuggestion | null>(null);
  const [destCoords, setDestCoords] = useState<GeocodeSuggestion | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    if (open) setSavedRoutes(getSavedRoutes());
  }, [open]);

  async function geocode(query: string): Promise<GeocodeSuggestion | null> {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.suggestions?.[0] ?? null;
  }

  async function fetchRouteForEndpoints(endpoints: RouteEndpoints) {
    setSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        origin_lat: String(endpoints.origin.lat),
        origin_lng: String(endpoints.origin.lng),
        dest_lat: String(endpoints.dest.lat),
        dest_lng: String(endpoints.dest.lng),
        corridor: "5",
      });
      if (classification) params.set("classification", classification);

      const response = await fetch(`/api/route/stations?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Route search failed");
      }

      onResults(
        data.stations as StationWithMeta[],
        data.route,
        endpoints
      );
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Route search failed");
    } finally {
      setSearching(false);
    }
  }

  async function searchRoute() {
    setSearching(true);
    setError(null);

    try {
      const from = originCoords ?? (await geocode(origin));
      const to = destCoords ?? (await geocode(destination));

      if (!from || !to) {
        setError("Enter valid origin and destination locations");
        return;
      }

      await fetchRouteForEndpoints({
        origin: { lat: from.lat, lng: from.lng },
        dest: { lat: to.lat, lng: to.lng },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Route search failed");
    } finally {
      setSearching(false);
    }
  }

  function loadSavedRoute(route: SavedRoute) {
    onLoadSavedRoute?.(route.endpoints);
    void fetchRouteForEndpoints(route.endpoints);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Plan route → find E0
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-sky-200 bg-sky-50/80 p-3">
      <p className="text-xs font-semibold text-sky-900">Find E0 along your route</p>
      {savedRoutes.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-sky-900">Saved routes</p>
          <ul className="mt-1 space-y-1">
            {savedRoutes.map((route) => (
              <li key={route.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadSavedRoute(route)}
                  className="flex-1 rounded-lg bg-white px-2 py-1.5 text-left text-xs text-zinc-800 hover:bg-sky-100"
                >
                  {route.label}
                </button>
                <button
                  type="button"
                  onClick={() => setSavedRoutes(removeSavedRoute(route.id))}
                  className="text-xs text-zinc-500 hover:text-zinc-800"
                  aria-label={`Remove ${route.label}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-2 grid gap-2">
        <input
          type="text"
          value={origin}
          onChange={(e) => {
            setOrigin(e.target.value);
            setOriginCoords(null);
          }}
          placeholder="Origin (city or address)"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            setDestCoords(null);
          }}
          placeholder="Destination"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={searchRoute}
          disabled={searching || loading || !origin || !destination}
          className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {searching ? "Searching…" : "Search route"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onClear();
          }}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
