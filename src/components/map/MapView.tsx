"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import type { GeoJSONSource, MapLayerMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Layer, NavigationControl, Source } from "react-map-gl/mapbox";
import type { StationWithMeta } from "@/lib/types/station";
import { boundsFromPoints } from "@/lib/utils/geo";

interface MapViewProps {
  stations: StationWithMeta[];
  selectedId: string | null;
  userLocation?: { lat: number; lng: number } | null;
  routePolyline?: { lat: number; lng: number }[] | null;
  fitToStations?: boolean;
  flyTo?: { lat: number; lng: number } | null;
  onSelectStation: (station: StationWithMeta) => void;
  onMoveEnd?: (center: { lat: number; lng: number }) => void;
}

function stationsToGeoJson(stations: StationWithMeta[]) {
  return {
    type: "FeatureCollection" as const,
    features: stations.map((station) => ({
      type: "Feature" as const,
      properties: {
        id: station.id,
        classification: station.classification,
        is_premium: station.is_premium,
        is_sponsored: station.is_sponsored,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [station.lng, station.lat],
      },
    })),
  };
}

export function MapView({
  stations,
  selectedId,
  routePolyline,
  fitToStations,
  flyTo,
  onSelectStation,
  onMoveEnd,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const geojson = useMemo(() => stationsToGeoJson(stations), [stations]);

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

  const fitMapToStations = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || stations.length === 0) return;

    const bounds = boundsFromPoints(stations);
    if (!bounds) return;

    map.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat],
      ],
      { padding: { top: 100, bottom: 80, left: 40, right: 40 }, duration: 800 }
    );
  }, [stations]);

  useEffect(() => {
    if (fitToStations) {
      fitMapToStations();
    }
  }, [fitToStations, fitMapToStations]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !flyTo) return;
    map.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: 10, duration: 1200 });
  }, [flyTo]);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      const map = mapRef.current?.getMap();
      if (!map) return;

      if (feature.properties?.cluster_id) {
        const clusterId = feature.properties.cluster_id as number;
        const source = map.getSource("stations") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates;
          map.easeTo({
            center: [coordinates[0], coordinates[1]],
            zoom,
            duration: 500,
          });
        });
        return;
      }

      const stationId = feature.properties?.id as string | undefined;
      if (!stationId) return;
      const station = stations.find((s) => s.id === stationId);
      if (station) onSelectStation(station);
    },
    [stations, onSelectStation]
  );

  if (!token) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center bg-zinc-100 p-6 text-center">
        <div>
          <p className="font-medium text-zinc-800">Map unavailable</p>
          <p className="mt-1 text-sm text-zinc-600">
            Add <code className="text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> to
            Vercel to enable the interactive map with all station pins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{
        longitude: -95,
        latitude: 38,
        zoom: 3.5,
      }}
      onMoveEnd={(event) =>
        onMoveEnd?.({
          lat: event.viewState.latitude,
          lng: event.viewState.longitude,
        })
      }
      interactiveLayerIds={[
        "station-clusters",
        "station-unclustered",
      ]}
      onClick={handleMapClick}
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
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}

      <Source
        id="stations"
        type="geojson"
        data={geojson}
        clusterMaxZoom={10}
        clusterRadius={40}
      >
        <Layer
          id="station-clusters"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": "#0284c7",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              5,
              22,
              15,
              28,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          }}
        />
        <Layer
          id="station-cluster-count"
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          }}
          paint={{ "text-color": "#ffffff" }}
        />
        <Layer
          id="station-unclustered"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": [
              "match",
              ["get", "classification"],
              "car",
              "#2563eb",
              "boat",
              "#0d9488",
              "dual",
              "#7c3aed",
              "#2563eb",
            ],
            "circle-radius": [
              "case",
              ["==", ["get", "id"], selectedId ?? ""],
              12,
              8,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>
    </Map>
  );
}
