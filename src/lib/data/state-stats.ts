import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface StateStat {
  state: string;
  country: string;
  count: number;
}

export async function getStateStationStats(): Promise<StateStat[]> {
  if (!isSupabaseConfigured()) {
    return [
      { state: "FL", country: "US", count: 1200 },
      { state: "TX", country: "US", count: 980 },
      { state: "CA", country: "US", count: 850 },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("state_station_counts");

  if (error || !data) {
    const { data: rows } = await supabase
      .from("stations")
      .select("state, country");

    const counts = new Map<string, StateStat>();
    for (const row of rows ?? []) {
      const key = `${row.country}:${row.state}`;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { state: row.state, country: row.country, count: 1 });
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }

  return data as StateStat[];
}

export const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export const CA_PROVINCE_NAMES: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NF: "Newfoundland",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

export function getRegionName(state: string, country: string): string {
  if (country === "CA") return CA_PROVINCE_NAMES[state] ?? state;
  return US_STATE_NAMES[state] ?? state;
}
