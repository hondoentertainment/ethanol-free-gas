"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import type { StationWithMeta } from "@/lib/types/station";
import { boundsFromPoints } from "@/lib/utils/geo";
import { STATION_COLORS, getPinColor } from "@/lib/map/colors";

interface LeafletMapViewProps {
  stations: StationWithMeta[];
  selectedId: string | null;
  userLocation?: { lat: number; lng: number } | null;
  routePolyline?: { lat: number; lng: number }[] | null;
  fitToStations?: boolean;
  flyTo?: { lat: number; lng: number } | null;
  onSelectStation: (station: StationWithMeta) => void;
  onMoveEnd?: (center: { lat: number; lng: number }) => void;
}

const pinColor = (station: StationWithMeta) => getPinColor(station);

export function LeafletMapView({
  stations,
  selectedId,
  userLocation,
  routePolyline,
  fitToStations,
  flyTo,
  onSelectStation,
  onMoveEnd,
}: LeafletMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const stationMapRef = useRef<Map<string, StationWithMeta>>(new Map());
  const onMoveEndRef = useRef(onMoveEnd);
  const suppressMoveEndRef = useRef(false);

  onMoveEndRef.current = onMoveEnd;

  const stationIndex = useMemo(() => {
    const map = new Map<string, StationWithMeta>();
    stations.forEach((s) => map.set(s.id, s));
    return map;
  }, [stations]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    const cluster = L.markerClusterGroup({ maxClusterRadius: 50, showCoverageOnHover: false });
    map.addLayer(cluster);

    map.on("moveend", () => {
      if (suppressMoveEndRef.current) return;
      const center = map.getCenter();
      onMoveEndRef.current?.({ lat: center.lat, lng: center.lng });
    });

    mapRef.current = map;
    clusterRef.current = cluster;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cluster = clusterRef.current;
    const map = mapRef.current;
    if (!cluster || !map) return;

    cluster.clearLayers();
    stationMapRef.current = stationIndex;

    stations.forEach((station) => {
      const marker = L.circleMarker([station.lat, station.lng], {
        radius: selectedId === station.id ? 9 : 7,
        color: pinColor(station),
        fillColor: pinColor(station),
        fillOpacity: 0.9,
        weight: selectedId === station.id ? 3 : 2,
      });
      marker.on("click", () => onSelectStation(station));
      cluster.addLayer(marker);
    });

    if (userLocation) {
      L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        color: STATION_COLORS.userLocation,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
    }
  }, [stations, stationIndex, selectedId, userLocation, onSelectStation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    if (routePolyline?.length) {
      routeRef.current = L.polyline(
        routePolyline.map((p) => [p.lat, p.lng] as [number, number]),
        { color: STATION_COLORS.route, weight: 4, opacity: 0.85 }
      ).addTo(map);
    }
  }, [routePolyline]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const runProgrammaticMove = (action: () => void) => {
      suppressMoveEndRef.current = true;
      action();
      window.setTimeout(() => {
        suppressMoveEndRef.current = false;
      }, 1200);
    };

    if (flyTo) {
      runProgrammaticMove(() =>
        map.flyTo([flyTo.lat, flyTo.lng], 12, { duration: 0.8 })
      );
      return;
    }

    if (fitToStations && stations.length > 0) {
      const bounds = boundsFromPoints(
        stations.map((s) => ({ lat: s.lat, lng: s.lng }))
      );
      if (bounds) {
        runProgrammaticMove(() =>
          map.fitBounds(
            [
              [bounds.minLat, bounds.minLng],
              [bounds.maxLat, bounds.maxLng],
            ],
            { padding: [40, 40], maxZoom: 12 }
          )
        );
      }
    }
  }, [flyTo, fitToStations, stations]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <p className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] text-zinc-600 shadow">
        Map data © OpenStreetMap
      </p>
    </div>
  );
}
