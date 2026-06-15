/**
 * Import all ethanol-free stations from pure-gas.org GraphQL API.
 * Usage: node scripts/import-pure-gas.mjs
 * Output: data/pure-gas-stations.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "pure-gas-stations.json");
const GRAPHQL_URL = "https://www.pure-gas.org/graphql";

const CANADIAN_CODES = new Set([
  "AB", "BC", "MB", "NB", "NF", "NS", "NT", "ON", "PE", "QC", "SK", "YT",
]);

const STATIONS_QUERY = `
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

const STATES_QUERY = `
  query States {
    states { code name numStations }
  }
`;

async function gql(query, variables = {}) {
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

function inferClassification(name, comment, locationComment) {
  const text = `${name} ${comment ?? ""} ${locationComment ?? ""}`.toLowerCase();
  const boat = [
    "marina",
    "dock",
    "harbor",
    "harbour",
    "yacht",
    "boat",
    "marine",
    "waterside",
    "fuel dock",
    "sailfish",
    "nautical",
  ].some((k) => text.includes(k));
  const car = [
    "sheetz",
    "racetrac",
    "race way",
    "marathon",
    "shell",
    "exxon",
    "chevron",
    "mobil",
    "kwik trip",
    "circle k",
    "speedway",
    "gas station",
    "convenience",
    "irving",
    "petro",
  ].some((k) => text.includes(k));

  if (boat && car) return "dual";
  if (boat) return "boat";
  return "car";
}

function mapStation(raw) {
  if (raw.removed) return null;
  const lat = raw.location?.latitude;
  const lng = raw.location?.longitude;
  if (lat == null || lng == null) return null;

  const stateCode = raw.state?.code ?? "";
  const country = CANADIAN_CODES.has(stateCode) ? "CA" : "US";
  const octanes = raw.octanes?.length
    ? raw.octanes.join(", ")
    : "E0";
  const brand = raw.brand?.name;
  const name = brand && !raw.name?.includes(brand)
    ? `${brand} — ${raw.name}`
    : raw.name;

  return {
    id: `pure-gas-${raw.id}`,
    pure_gas_id: raw.id,
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
    submitted_by: null,
    source: "pure-gas.org",
    source_url: "https://www.pure-gas.org/",
    notes: raw.comment?.trim() || null,
  };
}

async function main() {
  console.log("Fetching state list from pure-gas.org...");
  const { states } = await gql(STATES_QUERY);
  const allStations = [];
  let skipped = 0;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    process.stdout.write(
      `\r[${i + 1}/${states.length}] ${state.code} (${state.name})...`
    );

    const data = await gql(STATIONS_QUERY, { code: state.code });
    for (const raw of data.stationsByState ?? []) {
      const mapped = mapStation(raw);
      if (mapped) allStations.push(mapped);
      else skipped++;
    }

    // polite delay
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nImported ${allStations.length} stations (${skipped} skipped).`);

  const output = {
    imported_at: new Date().toISOString(),
    source: "https://www.pure-gas.org/",
    attribution:
      "Station data sourced from pure-gas.org — the definitive list of ethanol-free gasoline stations in the U.S. and Canada.",
    count: allStations.length,
    stations: allStations,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(output));
  console.log(`Written to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
