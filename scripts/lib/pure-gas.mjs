import { inferClassification } from "./classification.mjs";

export { inferClassification };

export const CANADIAN_CODES = new Set([
  "AB", "BC", "MB", "NB", "NF", "NS", "NT", "ON", "PE", "QC", "SK", "YT",
]);

export const GRAPHQL_URL = "https://www.pure-gas.org/graphql";

export const STATIONS_QUERY = `
  query StationsByState($code: ID!) {
    stationsByState(code: $code) {
      id
      name
      streetaddress
      city
      state { code name }
      phone
      brand { name }
      location { latitude longitude comment }
      octanes
      comment
      removed
    }
  }
`;

export const STATES_QUERY = `
  query States {
    states { code name numStations }
  }
`;

export async function gql(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

export function mapPureGasStation(raw) {
  if (raw.removed) return null;
  const lat = raw.location?.latitude;
  const lng = raw.location?.longitude;
  if (lat == null || lng == null) return null;

  const stateCode = raw.state?.code ?? "";
  const country = CANADIAN_CODES.has(stateCode) ? "CA" : "US";
  const octanes = raw.octanes?.length ? raw.octanes.join(", ") : "E0";
  const brand = raw.brand?.name;
  const name =
    brand && !raw.name?.includes(brand) ? `${brand} — ${raw.name}` : raw.name;

  return {
    pure_gas_id: String(raw.id),
    name: name?.trim() || "E0 Station",
    address: raw.streetaddress?.trim() || "",
    city: raw.city?.trim() || "",
    state: stateCode,
    zip: null,
    country,
    lat,
    lng,
    classification: inferClassification(
      name,
      raw.comment,
      raw.location?.comment
    ),
    fuel_type: `E0 Gasoline (${octanes})`,
    ethanol_percent: 0,
    phone: raw.phone?.trim() || null,
    hours: null,
    is_premium: false,
    is_sponsored: false,
    source: "pure-gas.org",
    source_url: "https://www.pure-gas.org/",
    notes: raw.comment?.trim() || null,
  };
}

export async function fetchAllPureGasStations({ onProgress } = {}) {
  const { states } = await gql(STATES_QUERY);
  const allStations = [];
  let skipped = 0;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    onProgress?.(i + 1, states.length, state.code);

    const data = await gql(STATIONS_QUERY, { code: state.code });
    for (const raw of data.stationsByState ?? []) {
      const mapped = mapPureGasStation(raw);
      if (mapped) allStations.push(mapped);
      else skipped++;
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  return { stations: allStations, skipped };
}

export function toSupabaseRow(station) {
  return {
    name: station.name,
    address: station.address || station.city || "Address unknown",
    city: station.city || "Unknown",
    state: station.state || "NA",
    zip: station.zip ?? null,
    country: station.country || "US",
    lat: station.lat,
    lng: station.lng,
    classification: station.classification,
    fuel_type: station.fuel_type || "E0 Gasoline",
    ethanol_percent: station.ethanol_percent ?? 0,
    phone: station.phone ?? null,
    hours: station.hours ?? null,
    is_premium: station.is_premium ?? false,
    is_sponsored: station.is_sponsored ?? false,
    external_id: station.pure_gas_id ?? station.external_id ?? null,
    source: station.source ?? "pure-gas.org",
    source_url: station.source_url ?? "https://www.pure-gas.org/",
    notes: station.notes ?? null,
  };
}
