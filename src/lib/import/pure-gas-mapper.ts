import type { StationClassification, StationHours } from "@/lib/types/station";
import { inferClassification } from "@/lib/import/classification";

const CANADIAN_CODES = new Set([
  "AB",
  "BC",
  "MB",
  "NB",
  "NF",
  "NS",
  "NT",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
]);

export interface PureGasImportRow {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: null;
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
  external_id: string;
  source: "pure-gas.org";
  source_url: "https://www.pure-gas.org/";
  notes: string | null;
}

export function mapPureGasRow(raw: Record<string, unknown>): PureGasImportRow | null {
  if (raw.removed) return null;

  const loc = raw.location as
    | { latitude?: number; longitude?: number; comment?: string }
    | undefined;
  if (loc?.latitude == null || loc?.longitude == null) return null;

  const state = (raw.state as { code?: string })?.code ?? "";
  const brand = (raw.brand as { name?: string })?.name;
  const rawName = (raw.name as string) ?? "";
  const display =
    brand && !rawName.includes(brand) ? `${brand} — ${rawName}` : rawName;
  const name = display.trim() || "E0 Station";
  const octanes = Array.isArray(raw.octanes)
    ? (raw.octanes as string[]).join(", ")
    : "E0";

  return {
    name,
    address: ((raw.streetaddress as string) ?? "").trim() || "Unknown",
    city: ((raw.city as string) ?? "").trim() || "Unknown",
    state,
    zip: null,
    country: CANADIAN_CODES.has(state) ? "CA" : "US",
    lat: loc.latitude,
    lng: loc.longitude,
    classification: inferClassification(
      name,
      raw.comment as string | undefined,
      loc.comment
    ),
    fuel_type: `E0 Gasoline (${octanes})`,
    ethanol_percent: 0,
    phone: ((raw.phone as string) ?? "").trim() || null,
    hours: null,
    is_premium: false,
    is_sponsored: false,
    external_id: String(raw.id),
    source: "pure-gas.org",
    source_url: "https://www.pure-gas.org/",
    notes: ((raw.comment as string) ?? "").trim() || null,
  };
}
