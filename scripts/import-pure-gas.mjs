/**
 * Import all ethanol-free stations from pure-gas.org GraphQL API.
 * Usage: npm run import:pure-gas
 * Output: data/pure-gas-stations.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { fetchAllPureGasStations } from "./lib/pure-gas.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "pure-gas-stations.json");

async function main() {
  console.log("Fetching state list from pure-gas.org...");
  const { stations, skipped } = await fetchAllPureGasStations({
    onProgress: (i, total, code) =>
      process.stdout.write(`\r[${i}/${total}] ${code}...`),
  });

  console.log(`\nImported ${stations.length} stations (${skipped} skipped).`);

  const output = {
    imported_at: new Date().toISOString(),
    source: "https://www.pure-gas.org/",
    attribution:
      "Station data sourced from pure-gas.org — the definitive list of ethanol-free gasoline stations in the U.S. and Canada.",
    count: stations.length,
    stations,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(output));
  console.log(`Written to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
