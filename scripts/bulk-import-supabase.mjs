/**
 * Bulk import stations into Supabase from pure-gas JSON or live API.
 *
 * Prerequisites:
 *   - Run supabase/migrations/004_external_source.sql
 *   - Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   npm run import:supabase              # from data/pure-gas-stations.json
 *   npm run import:supabase -- --fresh   # fetch from pure-gas.org first
 *   npm run import:supabase -- --dry-run # preview counts only
 *   npm run import:supabase -- --clear     # delete pure-gas.org rows before import
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadEnv, requireEnv } from "./lib/env.mjs";
import {
  fetchAllPureGasStations,
  toSupabaseRow,
} from "./lib/pure-gas.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_JSON = join(__dirname, "..", "data", "pure-gas-stations.json");
const BATCH_SIZE = 200;
const SOURCE = "pure-gas.org";

function parseArgs(argv) {
  return {
    fresh: argv.includes("--fresh"),
    dryRun: argv.includes("--dry-run"),
    clear: argv.includes("--clear"),
    file: argv.find((a, i) => argv[i - 1] === "--file") ?? DEFAULT_JSON,
  };
}

function loadFromJson(path) {
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}. Run npm run import:pure-gas first.`);
  }
  const data = JSON.parse(readFileSync(path, "utf-8"));
  const stations = data.stations ?? data;
  if (!Array.isArray(stations)) {
    throw new Error("JSON must contain a stations array");
  }
  return stations;
}

async function upsertBatches(supabase, rows, { dryRun }) {
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    if (dryRun) {
      process.stdout.write(
        `\r[dry-run] batch ${batchNum}/${totalBatches} (${batch.length} rows)`
      );
      inserted += batch.length;
      continue;
    }

    const { error } = await supabase
      .from("stations")
      .upsert(batch, { onConflict: "source,external_id" });

    if (error) {
      console.error(`\nBatch ${batchNum} failed: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(
        `\rUpserted batch ${batchNum}/${totalBatches} (${inserted}/${rows.length})`
      );
    }
  }

  if (!dryRun) console.log();
  return { inserted, errors };
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));

  let stations;
  if (args.fresh) {
    console.log("Fetching live data from pure-gas.org...");
    const result = await fetchAllPureGasStations({
      onProgress: (i, total, code) =>
        process.stdout.write(`\r[${i}/${total}] ${code}...`),
    });
    console.log(
      `\nFetched ${result.stations.length} stations (${result.skipped} skipped).`
    );
    stations = result.stations;
  } else {
    console.log(`Loading ${args.file}...`);
    stations = loadFromJson(args.file);
    console.log(`Loaded ${stations.length} stations.`);
  }

  const rows = stations
    .map((s) => toSupabaseRow(s))
    .filter((r) => r.external_id && r.lat != null && r.lng != null);

  console.log(`Prepared ${rows.length} rows for Supabase.`);

  if (args.dryRun) {
    console.log("Dry run — no database changes.");
    await upsertBatches(null, rows, { dryRun: true });
    console.log(`\nWould upsert ${rows.length} stations.`);
    return;
  }

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  if (args.clear) {
    console.log(`Deleting existing rows where source = ${SOURCE}...`);
    const { error, count } = await supabase
      .from("stations")
      .delete({ count: "exact" })
      .eq("source", SOURCE);
    if (error) throw new Error(`Clear failed: ${error.message}`);
    console.log(`Deleted ${count ?? 0} existing ${SOURCE} stations.`);
  }

  const { inserted, errors } = await upsertBatches(supabase, rows, {
    dryRun: false,
  });

  console.log(`Done. Upserted ${inserted} stations (${errors} errors).`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
