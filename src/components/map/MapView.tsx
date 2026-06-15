"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Layer, Marker, NavigationControl, Source } from "react-map-gl/mapbox";
import type { StationClassification, StationWithMeta } from "@/lib/types/station";

const CLASSIFICATION_COLORS: Record<StationClassification, string> = {
  car: "#2563eb",
  boat: "#0d9488",
  dual: "#7c3aed",
};

interface MapViewProps {
  stations: StationWithMeta[];
  selectedId: string | null;
  center: { lat: number; lng: number };
  searchCenter?: { lat: number; lng: number };
  routePolyline?: { lat: number; lng: number }[] | null;
  onSelectStation: (station: StationWithMeta) => void;
  onMoveEnd?: (center: { lat: number; lng: number }) => void;
}

export function MapView({
  stations,
  selectedId,
  center,
  searchCenter,
  routePolyline,
  onSelectStation,
  onMoveEnd,
}: MapViewProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-100 p-6 text-center">
        <div>
          <p className="font-medium text-zinc-800">Map unavailable</p>
          <p className="mt-1 text-sm text-zinc-600">
            Add <code className="text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> to
            enable the interactive map. Stations are shown in the list below.
          </p>
        </div>
      </div>
    );
  }

  const flyTarget = searchCenter ?? center;

  const routeGeoJson =
    routePolyline && routePolyline.length > 1
      ? {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: routePolyline.map((p) => [p.lng, p.lat]),
          },
        }
      : null;

  return (
    <Map
      key={`${flyTarget.lat.toFixed(4)}-${flyTarget.lng.toFixed(4)}-${routePolyline?.length ?? 0}`}
      mapboxAccessToken={token}
      initialViewState={{
        longitude: flyTarget.lng,
        latitude: flyTarget.lat,
        zoom: routePolyline ? 8 : 10,
      }}
      onMoveEnd={(event) =>
        onMoveEnd?.({
          lat: event.viewState.latitude,
          lng: event.viewState.longitude,
        })
      }
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      attributionControl={false}
    >
      <NavigationControl position="bottom-right" />

      {routeGeoJson && (
        <Source id="route" type="geojson" data={routeGeoJson}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              "line-color": "#0284c7",
              "line-width": 4,
              "line-opacity": 0.75,
            }}
          />
        </Source>
      )}

      {stations.map((station) => {
        const isSelected = station.id === selectedId;
        const color = CLASSIFICATION_COLORS[station.classification];
        const isFeatured = station.is_premium || station.is_sponsored;

        return (
          <Marker
            key={station.id}
            longitude={station.lng}
            latitude={station.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectStation(station);
            }}
          >
            <button
              type="button"
              aria-label={station.name}
              className="transition-transform"
              style={{
                transform: isSelected ? "scale(1.2)" : "scale(1)",
              }}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold text-white shadow-md ${
                  isFeatured ? "border-amber-300 ring-2 ring-amber-400/60" : "border-white"
                }`}
                style={{ backgroundColor: color }}
              >
                E0
              </span>
            </button>
          </Marker>
        );
      })}
    </Map>
  );
}
