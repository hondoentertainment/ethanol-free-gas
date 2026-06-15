export type StationClassification = "car" | "boat" | "dual";

export type VerificationStatus =
  | "available"
  | "unavailable"
  | "closed"
  | "incorrect";

export type ListingStatus =
  | "active"
  | "no_e0"
  | "closed"
  | "needs_review"
  | "unknown";

export type VerificationLabel =
  | "verified_today"
  | "verified_this_week"
  | "verified_this_month"
  | "unverified";

export interface StationHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  country: string;
  lat: number;
  lng: number;
  classification: StationClassification;
  fuel_type: string;
  ethanol_percent: number;
  phone: string | null;
  hours: StationHours | null;
  is_premium: boolean;
  is_sponsored: boolean;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Verification {
  id: string;
  station_id: string;
  user_id: string | null;
  status: VerificationStatus;
  notes: string | null;
  created_at: string;
}

export interface LastVerification {
  status: VerificationStatus;
  created_at: string;
}

export interface StationWithMeta extends Station {
  last_verification: LastVerification | null;
  latest_report: LastVerification | null;
  listing_status: ListingStatus;
  verification_label: VerificationLabel;
  verification_stale?: boolean;
  distance_miles?: number;
  distance_from_route_miles?: number;
}

export interface StationsListResponse {
  stations: StationWithMeta[];
  count: number;
}

export interface StationDetailResponse {
  station: Station;
  verifications: Verification[];
  verification_label: VerificationLabel;
}
