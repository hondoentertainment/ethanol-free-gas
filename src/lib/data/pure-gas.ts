import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { StationWithMeta } from "@/lib/types/station";
import { haversineMiles } from "@/lib/utils/geo";
import { getVerificationLabel } from "@/lib/utils/verification";

export interface PureGasDataset {
  imported_at: string;
  source: string;
  attribution: string;
  count: number;
  stations: PureGasStationRow[];
}

export interface PureGasStationRow {
  id: string;
  pure_gas_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  country: string;
  lat: number;
  lng: number;
  classification: "car" | "boat" | "dual";
  fuel_type: string;
  ethanol_percent: number;
  phone: string | null;
  hours: null;
  is_premium: boolean;
  is_sponsored: boolean;
  submitted_by: null;
  source: string;
  source_url: string;
  notes: string | null;
}

let cachedDataset: PureGasDataset | null = null;

function dataFilePath(): string {
  return join(process.cwd(), "data", "pure-gas-stations.json");
}

export function isPureGasDataAvailable(): boolean {
  return existsSync(dataFilePath());
}

export function loadPureGasDataset(): PureGasDataset | null {
  if (cachedDataset) return cachedDataset;
  const path = dataFilePath();
  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, "utf-8");
    cachedDataset = JSON.parse(raw) as PureGasDataset;
    return cachedDataset;
  } catch {
    return null;
  }
}

export function pureGasRowsToStations(
  rows: PureGasStationRow[],
  center?: { lat: number; lng: number }
): StationWithMeta[] {
  const now = new Date().toISOString();

  return rows.map((row) => {
    const station: StationWithMeta = {
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      country: row.country,
      lat: row.lat,
      lng: row.lng,
      classification: row.classification,
      fuel_type: row.fuel_type,
      ethanol_percent: row.ethanol_percent,
      phone: row.phone,
      hours: null,
      is_premium: row.is_premium,
      is_sponsored: row.is_sponsored,
      submitted_by: null,
      created_at: now,
      updated_at: now,
      last_verification: null,
      verification_label: getVerificationLabel(null),
    };

    if (center) {
      station.distance_miles = haversineMiles(
        center.lat,
        center.lng,
        row.lat,
        row.lng
      );
    }

    return station;
  });
}

export function getAllPureGasStations(
  center?: { lat: number; lng: number }
): StationWithMeta[] {
  const dataset = loadPureGasDataset();
  if (!dataset) return [];
  return pureGasRowsToStations(dataset.stations, center);
}

export function getPureGasAttribution(): string | null {
  return loadPureGasDataset()?.attribution ?? null;
}
