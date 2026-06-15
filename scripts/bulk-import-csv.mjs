/**
 * Bulk import stations from a CSV file into Supabase.
 *
 * Expected columns (header row required):
 *   name, address, city, state, lat, lng
 *
 * Optional columns:
 *   zip, country, classification, fuel_type, ethanol_percent, phone,
 *   external_id, source, notes, is_premium, is_sponsored
 *
 * Usage:
 *   npm run import:csv -- --file path/to/stations.csv
 *   npm run import:csv -- --file stations.csv --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { loadEnv, requireEnv } from "./lib/env.mjs";

const BATCH_SIZE = 200;

function parseArgs(argv) {
  const fileIdx = argv.indexOf("--file");
  if (fileIdx === -1 || !argv[fileIdx + 1]) {
    throw new Error("Usage: npm run import:csv -- --file path/to/stations.csv");
  }
  return {
    file: argv[fileIdx + 1],
    dryRun: argv.includes("--dry-run"),
    source: argv.find((a, i) => argv[i - 1] === "--source") ?? "csv-import",
  };
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function toRow(raw, defaultSource) {
  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  if (!raw.name || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const classification = ["car", "boat", "dual"].includes(raw.classification)
    ? raw.classification
    : "car";

  const externalId = raw.external_id?.trim() || `${raw.name}-${lat}-${lng}`;

  return {
    name: raw.name.trim(),
    address: raw.address?.trim() || raw.city?.trim() || "Unknown",
    city: raw.city?.trim() || "Unknown",
    state: raw.state?.trim() || "NA",
    zip: raw.zip?.trim() || null,
    country: raw.country?.trim() || "US",
    lat,
    lng,
    classification,
    fuel_type: raw.fuel_type?.trim() || "E0 Gasoline",
    ethanol_percent: Number(raw.ethanol_percent ?? 0),
    phone: raw.phone?.trim() || null,
    hours: null,
    is_premium: raw.is_premium === "true" || raw.is_premium === "1",
    is_sponsored: raw.is_sponsored === "true" || raw.is_sponsored === "1",
    external_id: externalId,
    source: raw.source?.trim() || defaultSource,
    source_url: null,
    notes: raw.notes?.trim() || null,
  };
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));

  if (!existsSync(args.file)) {
    throw new Error(`File not found: ${args.file}`);
  }

  const content = readFileSync(args.file, "utf-8");
  const parsed = parseCsv(content);
  const rows = parsed.map((r) => toRow(r, args.source)).filter(Boolean);

  console.log(`Parsed ${rows.length} valid rows from ${args.file}`);

  if (args.dryRun) {
    console.log("Dry run — no database changes.");
    return;
  }

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("stations")
      .upsert(batch, { onConflict: "source,external_id" });

    if (error) throw new Error(`Batch failed: ${error.message}`);
    inserted += batch.length;
    process.stdout.write(`\rUpserted ${inserted}/${rows.length}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
