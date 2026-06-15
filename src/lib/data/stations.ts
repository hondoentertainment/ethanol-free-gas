import type {
  LastVerification,
  Station,
  StationClassification,
  StationWithMeta,
  Verification,
} from "@/lib/types/station";
import { haversineMiles } from "@/lib/utils/geo";
import { getVerificationLabel } from "@/lib/utils/verification";

type RawStation = Station;

export function enrichStation(
  station: RawStation,
  verifications: Verification[],
  center?: { lat: number; lng: number }
): StationWithMeta {
  const latestAvailable = verifications
    .filter((v) => v.status === "available")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

  const latestAny = verifications.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  const lastVerification: LastVerification | null = latestAvailable
    ? { status: latestAvailable.status, created_at: latestAvailable.created_at }
    : latestAny
      ? { status: latestAny.status, created_at: latestAny.created_at }
      : null;

  const enriched: StationWithMeta = {
    ...station,
    is_premium: station.is_premium ?? false,
    is_sponsored: station.is_sponsored ?? false,
    submitted_by: station.submitted_by ?? null,
    last_verification: lastVerification,
    verification_label: getVerificationLabel(
      latestAvailable
        ? {
            status: latestAvailable.status,
            created_at: latestAvailable.created_at,
          }
        : null
    ),
  };

  if (center) {
    enriched.distance_miles = haversineMiles(
      center.lat,
      center.lng,
      station.lat,
      station.lng
    );
  }

  return enriched;
}

export function parseClassification(
  value: string | null
): StationClassification | null {
  if (value === "car" || value === "boat" || value === "dual") {
    return value;
  }
  return null;
}

import { ALL_DEMO_STATIONS } from "@/lib/data/seed-stations";

/** @deprecated use ALL_DEMO_STATIONS */
export const MOCK_STATIONS = ALL_DEMO_STATIONS;
