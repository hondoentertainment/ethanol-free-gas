import type {
  LastVerification,
  Station,
  StationClassification,
  StationWithMeta,
  Verification,
} from "@/lib/types/station";
import { haversineMiles } from "@/lib/utils/geo";
import { getListingStatus } from "@/lib/utils/listing-status";
import { getVerificationLabel } from "@/lib/utils/verification";
import { isVerificationStale } from "@/lib/utils/verification-stale";

type RawStation = Station;

export function enrichStation(
  station: RawStation,
  verifications: Verification[],
  center?: { lat: number; lng: number }
): StationWithMeta {
  const sorted = [...verifications].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const latestAvailable = sorted.find((v) => v.status === "available");
  const latestReport = sorted[0] ?? null;

  const lastVerification: LastVerification | null = latestAvailable
    ? { status: latestAvailable.status, created_at: latestAvailable.created_at }
    : null;

  const latestReportMeta: LastVerification | null = latestReport
    ? { status: latestReport.status, created_at: latestReport.created_at }
    : null;

  const listingStatus = getListingStatus(latestReportMeta);

  const enriched: StationWithMeta = {
    ...station,
    is_premium: station.is_premium ?? false,
    is_sponsored: station.is_sponsored ?? false,
    submitted_by: station.submitted_by ?? null,
    last_verification: lastVerification,
    latest_report: latestReportMeta,
    listing_status: listingStatus,
    verification_label: getVerificationLabel(lastVerification),
    verification_stale:
      listingStatus === "active" &&
      isVerificationStale(lastVerification),
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
