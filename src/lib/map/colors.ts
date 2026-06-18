import type { StationWithMeta } from "@/lib/types/station";

/**
 * Single source of truth for station pin colors.
 *
 * Previously the Mapbox layer, the Leaflet fallback, the legend, and the
 * onboarding modal each hard-coded their own (conflicting) colors. Keep every
 * surface importing from here so they can never drift again.
 */
export const STATION_COLORS = {
  car: "#2563eb", // blue
  boat: "#0d9488", // teal
  dual: "#7c3aed", // violet
  premium: "#f59e0b", // amber
  noE0: "#dc2626", // red
  closed: "#71717a", // zinc
  needsReview: "#a1a1aa", // light zinc
  stale: "#ea580c", // orange
  route: "#0284c7", // sky
  userLocation: "#2563eb",
} as const;

/** Status precedence order, shared by both map renderers. */
export function getPinColor(station: {
  is_premium?: boolean;
  is_sponsored?: boolean;
  listing_status?: StationWithMeta["listing_status"];
  verification_stale?: boolean;
  classification: StationWithMeta["classification"];
}): string {
  if (station.is_premium || station.is_sponsored) return STATION_COLORS.premium;
  if (station.listing_status === "closed") return STATION_COLORS.closed;
  if (station.listing_status === "no_e0") return STATION_COLORS.noE0;
  if (station.listing_status === "needs_review") return STATION_COLORS.needsReview;
  if (station.verification_stale) return STATION_COLORS.stale;
  if (station.classification === "boat") return STATION_COLORS.boat;
  if (station.classification === "dual") return STATION_COLORS.dual;
  return STATION_COLORS.car;
}

/** Legend rows, derived from the same tokens. */
export const LEGEND_ITEMS: { color: string; label: string }[] = [
  { color: STATION_COLORS.car, label: "Car station" },
  { color: STATION_COLORS.boat, label: "Boat dock" },
  { color: STATION_COLORS.dual, label: "Car & boat" },
  { color: STATION_COLORS.noE0, label: "Reported: no E0" },
  { color: STATION_COLORS.closed, label: "Reported: out of business" },
  { color: STATION_COLORS.stale, label: "Needs verification" },
  { color: STATION_COLORS.premium, label: "Premium / sponsored" },
];
