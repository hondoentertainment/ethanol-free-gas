"use client";

import { useCallback, useEffect, useState } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import { MapView } from "@/components/map/MapView";
import { ClassificationFilterChips } from "@/components/search/ClassificationFilterChips";
import { RouteSearchPanel } from "@/components/search/RouteSearchPanel";
import {
  SearchBar,
  type GeocodeSuggestion,
  type SearchFilters,
} from "@/components/search/SearchBar";
import { StationBottomSheet } from "@/components/station/StationBottomSheet";
import { StationCard } from "@/components/station/StationCard";
import { MOCK_STATIONS } from "@/lib/data/stations";
import { cacheStations, getCachedStations } from "@/lib/offline/station-cache";
import type { StationWithMeta } from "@/lib/types/station";
import { haversineMiles } from "@/lib/utils/geo";

const DEFAULT_CENTER = { lat: 38.9784, lng: -76.4922 };
const SEARCH_AREA_THRESHOLD_MILES = 0.75;

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
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [searchCenter, setSearchCenter] = useState(DEFAULT_CENTER);
  const [routePolyline, setRoutePolyline] = useState<
    { lat: number; lng: number }[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(true);
  const [routeMode, setRouteMode] = useState(false);

  const mapMovedFromSearch =
    !routeMode &&
    haversineMiles(
      mapCenter.lat,
      mapCenter.lng,
      searchCenter.lat,
      searchCenter.lng
    ) > SEARCH_AREA_THRESHOLD_MILES;

  const persistCache = useCallback(
    (results: StationWithMeta[], center: { lat: number; lng: number }) => {
      cacheStations({
        stations: results,
        cachedAt: Date.now(),
        center,
      });
    },
    []
  );

  const fetchStations = useCallback(
    async (
      nextSearchCenter = searchCenter,
      searchFilters = filters
    ) => {
      if (!navigator.onLine) {
        const cached = getCachedStations();
        if (cached?.stations?.length) {
          setStations(cached.stations as StationWithMeta[]);
          setUsingMockData(false);
          setError("Offline — showing cached stations");
        }
        return;
      }

      setLoading(true);
      setError(null);
      setRouteMode(false);
      setRoutePolyline(null);

      const params = new URLSearchParams({
        lat: String(nextSearchCenter.lat),
        lng: String(nextSearchCenter.lng),
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
          persistCache(results, nextSearchCenter);
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

        setSearchCenter(nextSearchCenter);
        setMapCenter(nextSearchCenter);
      } catch (fetchError) {
        const cached = getCachedStations();
        if (cached?.stations?.length) {
          setStations(cached.stations as StationWithMeta[]);
          setUsingMockData(false);
          setError("Network error — showing cached stations");
        } else {
          setStations(MOCK_STATIONS);
          setUsingMockData(true);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Using demo data — connect Supabase to load live stations"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [filters, searchCenter, persistCache]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchStations(DEFAULT_CENTER, EMPTY_FILTERS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        fetchStations(center, EMPTY_FILTERS);
      },
      () => fetchStations(DEFAULT_CENTER, EMPTY_FILTERS),
      { timeout: 8000, maximumAge: 60000 }
    );
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
        setMapCenter(nextCenter);
        fetchStations(nextCenter, filters);
      },
      () => setError("Unable to access your location")
    );
  }

  function handleSelectLocation(suggestion: GeocodeSuggestion) {
    const nextCenter = { lat: suggestion.lat, lng: suggestion.lng };
    setMapCenter(nextCenter);
    fetchStations(nextCenter, {
      ...filters,
      q: suggestion.label,
      city: suggestion.city ?? filters.city,
      state: suggestion.state ?? filters.state,
      zip: suggestion.zip ?? filters.zip,
    });
  }

  function handleClassificationChange(
    classification: SearchFilters["classification"]
  ) {
    const nextFilters = { ...filters, classification };
    setFilters(nextFilters);
    fetchStations(searchCenter, nextFilters);
  }

  function handleRouteResults(
    results: StationWithMeta[],
    route: { lat: number; lng: number }[]
  ) {
    setStations(results);
    setRoutePolyline(route);
    setRouteMode(true);
    setUsingMockData(false);
    setSearchCenter({
      lat: route[0]?.lat ?? searchCenter.lat,
      lng: route[0]?.lng ?? searchCenter.lng,
    });
    if (route[0]) {
      setMapCenter({ lat: route[0].lat, lng: route[0].lng });
    }
    persistCache(results, searchCenter);
  }

  function clearRoute() {
    setRoutePolyline(null);
    setRouteMode(false);
    fetchStations(searchCenter, filters);
  }

  return (
    <div className="relative flex-1 min-h-0">
      <SearchBar
        filters={filters}
        onChange={setFilters}
        onSearch={() => fetchStations(mapCenter, filters)}
        onUseLocation={handleUseLocation}
        onSelectLocation={handleSelectLocation}
        loading={loading}
        classificationChips={
          <ClassificationFilterChips
            value={filters.classification}
            onChange={handleClassificationChange}
          />
        }
        routeSearch={
          <RouteSearchPanel
            classification={filters.classification}
            loading={loading}
            onResults={handleRouteResults}
            onClear={clearRoute}
          />
        }
      />

      <div className="absolute inset-0 top-0 flex flex-col">
        <div className="relative flex-1 min-h-[45vh]">
          <MapView
            stations={stations}
            selectedId={selectedStation?.id ?? null}
            center={mapCenter}
            searchCenter={searchCenter}
            routePolyline={routePolyline}
            onSelectStation={setSelectedStation}
            onMoveEnd={setMapCenter}
          />

          {mapMovedFromSearch && (
            <div className="absolute inset-x-0 top-36 z-10 flex justify-center px-3">
              <button
                type="button"
                onClick={() => fetchStations(mapCenter, filters)}
                disabled={loading}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-lg ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-50"
              >
                Search this area
              </button>
            </div>
          )}

          {routeMode && (
            <div className="absolute inset-x-0 top-36 z-10 flex justify-center px-3">
              <button
                type="button"
                onClick={clearRoute}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-sky-700"
              >
                Clear route search
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-800">
              {routeMode ? "Along route" : "Nearby"}: {stations.length} station
              {stations.length === 1 ? "" : "s"}
            </p>
            {usingMockData && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Demo data
              </span>
            )}
          </div>
          {error && (
            <p className="mb-2 text-sm text-amber-700" role="alert">
              {error}
            </p>
          )}
          <AdSlot placement="list" />
          <div className="mt-2 grid gap-2 max-h-[32vh] overflow-y-auto">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                selected={selectedStation?.id === station.id}
                onSelect={() => setSelectedStation(station)}
              />
            ))}
          </div>
          <div className="mt-3">
            <AdSlot placement="footer" />
          </div>
        </div>
      </div>

      <StationBottomSheet
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onVerified={() => fetchStations(searchCenter, filters)}
      />
    </div>
  );
}
