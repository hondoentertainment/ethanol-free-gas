"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapView } from "@/components/map/MapView";
import { MapLegend } from "@/components/map/MapLegend";
import { StationListDrawer } from "@/components/map/StationListDrawer";
import { ClassificationFilterChips } from "@/components/search/ClassificationFilterChips";
import { RouteSearchPanel } from "@/components/search/RouteSearchPanel";
import {
  SearchBar,
  type GeocodeSuggestion,
  type SearchFilters,
} from "@/components/search/SearchBar";
import { StationBottomSheet } from "@/components/station/StationBottomSheet";
import { ALL_DEMO_STATIONS } from "@/lib/data/seed-stations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cacheStations, getCachedStations } from "@/lib/offline/station-cache";
import type { StationWithMeta } from "@/lib/types/station";
import { haversineMiles } from "@/lib/utils/geo";
import {
  buildRouteShareUrl,
  parseRouteParams,
  type RouteEndpoints,
} from "@/lib/utils/route-share";
import { isNegativeListingStatus } from "@/lib/utils/listing-status";
import { sortStationsForDisplay } from "@/lib/utils/route";

const EMPTY_FILTERS: SearchFilters = {
  q: "",
  zip: "",
  city: "",
  state: "",
  classification: "",
};

const NEARBY_RADIUS_MILES = 50;
const REGIONAL_RADIUS_MILES = 100;

function applyClientFilters(
  stations: StationWithMeta[],
  filters: SearchFilters,
  nearbyOnly: boolean,
  hideInactive: boolean,
  userLocation: { lat: number; lng: number } | null
): StationWithMeta[] {
  let results = [...stations];
  const q = filters.q.trim().toLowerCase();

  if (hideInactive) {
    results = results.filter(
      (s) => !isNegativeListingStatus(s.listing_status ?? "unknown")
    );
  }
  if (filters.classification) {
    results = results.filter((s) => s.classification === filters.classification);
  }
  if (filters.zip.trim()) {
    results = results.filter((s) => s.zip?.startsWith(filters.zip.trim()));
  }
  if (filters.city.trim()) {
    const city = filters.city.trim().toLowerCase();
    results = results.filter((s) => s.city.toLowerCase().includes(city));
  }
  if (filters.state.trim()) {
    const state = filters.state.trim().toLowerCase();
    results = results.filter((s) => s.state.toLowerCase() === state);
  }
  if (q) {
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.zip?.toLowerCase().includes(q) ?? false)
    );
  }

  if (userLocation) {
    results = results.map((station) => ({
      ...station,
      distance_miles: haversineMiles(
        userLocation.lat,
        userLocation.lng,
        station.lat,
        station.lng
      ),
    }));
    if (nearbyOnly) {
      results = results.filter(
        (s) => (s.distance_miles ?? Infinity) <= NEARBY_RADIUS_MILES
      );
    }
  }

  return sortStationsForDisplay(results);
}

export function HomeMapPage() {
  const searchParams = useSearchParams();
  const [allStations, setAllStations] = useState<StationWithMeta[]>(ALL_DEMO_STATIONS);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [selectedStation, setSelectedStation] = useState<StationWithMeta | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [routePolyline, setRoutePolyline] = useState<
    { lat: number; lng: number }[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"demo" | "pure-gas" | "supabase">("demo");
  const [routeMode, setRouteMode] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [hideInactive, setHideInactive] = useState(true);
  const [listOpen, setListOpen] = useState(false);
  const [showAllMap, setShowAllMap] = useState(false);
  const [fitMap, setFitMap] = useState(true);
  const [routeEndpoints, setRouteEndpoints] = useState<RouteEndpoints | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const mapMoveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayStations = useMemo(() => {
    if (routeMode) return allStations;
    return applyClientFilters(
      allStations,
      filters,
      nearbyOnly,
      hideInactive,
      userLocation
    );
  }, [allStations, filters, nearbyOnly, hideInactive, userLocation, routeMode]);

  const loadStations = useCallback(
    async (
      location?: { lat: number; lng: number },
      options?: { all?: boolean }
    ) => {
    const loadAll = options?.all ?? showAllMap;

    if (!navigator.onLine) {
      const cached = getCachedStations();
      if (cached?.stations?.length) {
        setAllStations(cached.stations as StationWithMeta[]);
        setDataSource("demo");
        setError("Offline — showing cached stations");
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (loadAll) {
      params.set("all", "true");
      params.set("limit", "20000");
    } else if (location) {
      params.set("lat", String(location.lat));
      params.set("lng", String(location.lng));
      params.set("radius", String(REGIONAL_RADIUS_MILES));
      params.set("limit", "500");
    } else {
      params.set("all", "true");
      params.set("limit", "20000");
    }

    try {
      const response = await fetch(`/api/stations?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load stations");
      }

      const results = data.stations as StationWithMeta[];
      if (results.length > 0) {
        setAllStations(results);
        setDataSource(
          data.source === "pure-gas" || data.source === "supabase"
            ? data.source
            : isSupabaseConfigured()
              ? "supabase"
              : "pure-gas"
        );
        cacheStations({
          stations: results,
          cachedAt: Date.now(),
          center: location,
        });
      } else {
        setAllStations(ALL_DEMO_STATIONS);
        setDataSource("demo");
      }
      setFitMap(true);
    } catch (fetchError) {
      const cached = getCachedStations();
      if (cached?.stations?.length) {
        setAllStations(cached.stations as StationWithMeta[]);
        setDataSource("demo");
        setError("Network error — showing cached stations");
      } else {
        setAllStations(ALL_DEMO_STATIONS);
        setDataSource("demo");
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Using demo data — connect Supabase for live stations"
        );
      }
    } finally {
      setLoading(false);
    }
  },
  [showAllMap]
  );

  useEffect(() => {
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    if (!state && !city) return;
    setFilters((prev) => ({
      ...prev,
      state: state?.toUpperCase() ?? prev.state,
      city: city ?? prev.city,
    }));
    setNearbyOnly(false);
    setFitMap(true);
  }, [searchParams]);

  useEffect(() => {
    const endpoints = parseRouteParams(searchParams);
    if (!endpoints) return;

    let cancelled = false;
    async function loadSharedRoute() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          origin_lat: String(endpoints!.origin.lat),
          origin_lng: String(endpoints!.origin.lng),
          dest_lat: String(endpoints!.dest.lat),
          dest_lng: String(endpoints!.dest.lng),
          corridor: "5",
        });
        const classification = searchParams.get("classification");
        if (classification) params.set("classification", classification);

        const response = await fetch(`/api/route/stations?${params.toString()}`);
        const data = await response.json();
        if (!response.ok || cancelled) return;

        setAllStations(data.stations as StationWithMeta[]);
        setRoutePolyline(data.route);
        setRouteMode(true);
        setRouteEndpoints(endpoints);
        setNearbyOnly(false);
        setDataSource("supabase");
        setFitMap(true);
        setShowAllMap(false);
      } catch {
        // ignore — user can search manually
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSharedRoute();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (parseRouteParams(searchParams)) return;

    if (!navigator.geolocation) {
      loadStations();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        loadStations(loc);
      },
      () => loadStations(),
      { timeout: 8000, maximumAge: 120000 }
    );
  }, [loadStations]);

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setFlyTo(loc);
        setNearbyOnly(true);
        setFitMap(false);
      },
      () => setError("Unable to access your location")
    );
  }

  function handleSelectLocation(suggestion: GeocodeSuggestion) {
    const loc = { lat: suggestion.lat, lng: suggestion.lng };
    setFlyTo(loc);
    setFitMap(false);
    setFilters({
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
    setFilters({ ...filters, classification });
    setFitMap(true);
  }

  function handleRouteResults(
    results: StationWithMeta[],
    route: { lat: number; lng: number }[],
    endpoints: RouteEndpoints
  ) {
    setAllStations(results);
    setRoutePolyline(route);
    setRouteMode(true);
    setRouteEndpoints(endpoints);
    setNearbyOnly(false);
    setDataSource("supabase");
    setFitMap(true);
    setFlyTo(null);
    setListOpen(false);
    setShowAllMap(false);
  }

  function clearRoute() {
    setRoutePolyline(null);
    setRouteMode(false);
    setRouteEndpoints(null);
    loadStations(userLocation ?? undefined);
  }

  function handleMapMoveEnd(center: { lat: number; lng: number }) {
    if (routeMode || showAllMap) return;
    if (mapMoveDebounceRef.current) {
      clearTimeout(mapMoveDebounceRef.current);
    }
    mapMoveDebounceRef.current = setTimeout(() => {
      loadStations(center, { all: false });
    }, 800);
  }

  async function copyRouteLink() {
    if (!routeEndpoints) return;
    const url = buildRouteShareUrl(routeEndpoints);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setError("Could not copy link");
    }
  }

  function loadAllNationwide() {
    setShowAllMap(true);
    loadStations(userLocation ?? undefined, { all: true });
    setFitMap(true);
  }

  const listTitle = routeMode
    ? "Stations along route"
    : nearbyOnly
      ? `Within ${NEARBY_RADIUS_MILES} miles`
      : "All E0 stations";

  return (
    <div className="relative h-[calc(100dvh-3.5rem)] min-h-0 w-full">
      <div className="absolute inset-0">
        <MapView
          stations={displayStations}
          selectedId={selectedStation?.id ?? null}
          userLocation={userLocation}
          routePolyline={routePolyline}
          fitToStations={fitMap}
          flyTo={flyTo}
          onSelectStation={(station) => {
            setSelectedStation(station);
            setListOpen(false);
          }}
          onMoveEnd={handleMapMoveEnd}
        />
      </div>

      <div className="absolute inset-x-0 top-0 z-20 mx-auto max-w-lg px-3 pt-3 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchBar
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setFitMap(true);
            }}
            onSearch={() => setFitMap(true)}
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
        </div>
      </div>

      <div className="absolute bottom-4 left-3 z-20">
        <MapLegend />
      </div>

      <div className="absolute bottom-4 right-3 z-20 flex flex-col gap-2">
        {!routeMode && !showAllMap && (
          <button
            type="button"
            onClick={loadAllNationwide}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Load all stations
          </button>
        )}
        {!routeMode && (
          <button
            type="button"
            onClick={() => {
              setNearbyOnly((v) => !v);
              setFitMap(true);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium shadow-lg ring-1 ${
              nearbyOnly
                ? "bg-sky-600 text-white ring-sky-700"
                : "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {nearbyOnly ? "Nearby only" : "Filter nearby"}
          </button>
        )}
        {!routeMode && (
          <button
            type="button"
            onClick={() => {
              setHideInactive((v) => !v);
              setFitMap(true);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium shadow-lg ring-1 ${
              hideInactive
                ? "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50"
                : "bg-zinc-700 text-white ring-zinc-800"
            }`}
          >
            {hideInactive ? "Show closed / no E0" : "Hiding closed / no E0"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setFitMap(true);
            setFlyTo(null);
          }}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          Fit all pins
        </button>
        <button
          type="button"
          onClick={() => setListOpen(true)}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          List ({displayStations.length})
        </button>
      </div>

      {dataSource === "demo" && (
        <div className="absolute left-3 top-[11.5rem] z-10 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 shadow-sm">
          Demo data — {ALL_DEMO_STATIONS.length} stations
        </div>
      )}

      {dataSource === "supabase" && (
        <div className="absolute left-3 top-[11.5rem] z-10 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 shadow-sm">
          {allStations.length.toLocaleString()} live stations
        </div>
      )}

      {dataSource === "pure-gas" && (
        <div className="absolute left-3 top-[11.5rem] z-10 max-w-xs rounded-xl bg-white/95 px-3 py-1.5 text-xs text-zinc-700 shadow-sm ring-1 ring-zinc-200">
          {allStations.length.toLocaleString()} stations from{" "}
          <a
            href="https://www.pure-gas.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky-700 hover:text-sky-800"
          >
            pure-gas.org
          </a>
        </div>
      )}

      {error && (
        <div
          className="absolute left-3 right-3 top-[13.5rem] z-10 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {routeMode && (
        <div className="absolute inset-x-0 top-28 z-10 flex justify-center gap-2 px-3 pointer-events-none">
          <button
            type="button"
            onClick={clearRoute}
            className="pointer-events-auto rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-sky-700"
          >
            Clear route search
          </button>
          {routeEndpoints && (
            <button
              type="button"
              onClick={copyRouteLink}
              className="pointer-events-auto rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              {shareCopied ? "Link copied!" : "Share route"}
            </button>
          )}
        </div>
      )}

      <StationListDrawer
        open={listOpen && !selectedStation}
        onClose={() => setListOpen(false)}
        stations={displayStations}
        selectedId={selectedStation?.id ?? null}
        onSelectStation={setSelectedStation}
        title={listTitle}
      />

      <StationBottomSheet
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onVerified={() => loadStations(userLocation ?? undefined)}
      />
    </div>
  );
}
