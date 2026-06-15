"use client";

import { useState } from "react";
import type { GeocodeSuggestion } from "@/components/search/SearchBar";
import type { StationClassification, StationWithMeta } from "@/lib/types/station";

interface RouteSearchPanelProps {
  onResults: (
    stations: StationWithMeta[],
    route: { lat: number; lng: number }[],
    endpoints: {
      origin: { lat: number; lng: number };
      dest: { lat: number; lng: number };
    }
  ) => void;
  onClear: () => void;
  classification: StationClassification | "";
  loading?: boolean;
}

export function RouteSearchPanel({
  onResults,
  onClear,
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

  async function geocode(query: string): Promise<GeocodeSuggestion | null> {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.suggestions?.[0] ?? null;
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

      const params = new URLSearchParams({
        origin_lat: String(from.lat),
        origin_lng: String(from.lng),
        dest_lat: String(to.lat),
        dest_lng: String(to.lng),
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
        {
          origin: { lat: from.lat, lng: from.lng },
          dest: { lat: to.lat, lng: to.lng },
        }
      );
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Route search failed");
    } finally {
      setSearching(false);
    }
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
