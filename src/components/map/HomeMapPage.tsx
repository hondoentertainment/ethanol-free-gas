"use client";

import { useCallback, useEffect, useState } from "react";
import { MapView } from "@/components/map/MapView";
import {
  SearchBar,
  type SearchFilters,
} from "@/components/search/SearchBar";
import { StationBottomSheet } from "@/components/station/StationBottomSheet";
import { StationCard } from "@/components/station/StationCard";
import { MOCK_STATIONS } from "@/lib/data/stations";
import type { StationWithMeta } from "@/lib/types/station";

const DEFAULT_CENTER = { lat: 38.9784, lng: -76.4922 };

const EMPTY_FILTERS: SearchFilters = {
  q: "",
  zip: "",
  city: "",
  state: "",
  classification: "",
};

export function HomeMapPage() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [stations, setStations] = useState<StationWithMeta[]>(MOCK_STATIONS);
  const [selectedStation, setSelectedStation] = useState<StationWithMeta | null>(
    null
  );
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(true);

  const fetchStations = useCallback(
    async (searchCenter = center, searchFilters = filters) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        lat: String(searchCenter.lat),
        lng: String(searchCenter.lng),
        radius: "50",
      });

      if (searchFilters.q) params.set("q", searchFilters.q);
      if (searchFilters.zip) params.set("zip", searchFilters.zip);
      if (searchFilters.city) params.set("city", searchFilters.city);
      if (searchFilters.state) params.set("state", searchFilters.state);
      if (searchFilters.classification) {
        params.set("classification", searchFilters.classification);
      }

      try {
        const response = await fetch(`/api/stations?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load stations");
        }

        const results = data.stations as StationWithMeta[];
        if (results.length > 0) {
          setStations(results);
          setUsingMockData(false);
        } else if (
          searchFilters.q ||
          searchFilters.zip ||
          searchFilters.city ||
          searchFilters.state
        ) {
          setStations([]);
          setUsingMockData(false);
        } else {
          setStations(MOCK_STATIONS);
          setUsingMockData(true);
        }
      } catch (fetchError) {
        setStations(MOCK_STATIONS);
        setUsingMockData(true);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Using demo data — connect Supabase to load live stations"
        );
      } finally {
        setLoading(false);
      }
    },
    [center, filters]
  );

  useEffect(() => {
    fetchStations(DEFAULT_CENTER, EMPTY_FILTERS);
    // Initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;

    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(nextCenter);
        fetchStations(nextCenter, filters);
      },
      () => setError("Unable to access your location")
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <SearchBar
        filters={filters}
        onChange={setFilters}
        onSearch={() => fetchStations(center, filters)}
        onUseLocation={handleUseLocation}
        loading={loading}
      />

      <div className="absolute inset-0 top-0 flex flex-col">
        <div className="relative flex-1 min-h-[45vh]">
          <MapView
            stations={stations}
            selectedId={selectedStation?.id ?? null}
            center={center}
            onSelectStation={setSelectedStation}
            onMoveEnd={setCenter}
          />
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-800">
              {stations.length} station{stations.length === 1 ? "" : "s"} nearby
            </p>
            {usingMockData && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Demo data
              </span>
            )}
          </div>
          {error && (
            <p className="mb-2 text-sm text-amber-700" role="alert">{error}</p>
          )}
          <div className="grid gap-2 max-h-[32vh] overflow-y-auto">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                selected={selectedStation?.id === station.id}
                onSelect={() => setSelectedStation(station)}
              />
            ))}
          </div>
        </div>
      </div>

      <StationBottomSheet
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onVerified={() => fetchStations(center, filters)}
      />
    </div>
  );
}
