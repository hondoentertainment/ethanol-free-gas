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

export const MOCK_STATIONS: StationWithMeta[] = [
  {
    id: "mock-annapolis-marina",
    name: "Annapolis Harbor Marina Fuel Dock",
    address: "222 Severn Ave",
    city: "Annapolis",
    state: "MD",
    zip: "21403",
    country: "US",
    lat: 38.9722,
    lng: -76.4856,
    classification: "boat",
    fuel_type: "E0 Marine Gasoline",
    ethanol_percent: 0,
    phone: "+1-410-263-9266",
    hours: { mon: "6:00-20:00", sun: "7:00-19:00" },
    is_premium: true,
    is_sponsored: false,
    submitted_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verification: {
      status: "available",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    verification_label: "verified_this_week",
  },
  {
    id: "mock-sheetz",
    name: "Sheetz — E0 Pump",
    address: "1201 Solomons Island Rd",
    city: "Annapolis",
    state: "MD",
    zip: "21401",
    country: "US",
    lat: 38.9784,
    lng: -76.5451,
    classification: "car",
    fuel_type: "E0 Gasoline",
    ethanol_percent: 0,
    phone: "+1-410-266-1234",
    hours: { mon: "0:00-24:00" },
    is_premium: false,
    is_sponsored: true,
    submitted_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verification: {
      status: "available",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    verification_label: "verified_today",
  },
  {
    id: "mock-lake-norman",
    name: "Lake Norman Marina",
    address: "1495 NC Highway 150",
    city: "Mooresville",
    state: "NC",
    zip: "28117",
    country: "US",
    lat: 35.5978,
    lng: -80.8776,
    classification: "dual",
    fuel_type: "E0 Gasoline",
    ethanol_percent: 0,
    phone: "+1-704-664-2628",
    hours: { mon: "7:00-19:00" },
    is_premium: false,
    is_sponsored: false,
    submitted_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_verification: null,
    verification_label: "unverified",
  },
];
