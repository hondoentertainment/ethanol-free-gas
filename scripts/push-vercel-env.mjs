/**
 * Push selected .env.local values to Vercel production.
 * Skips vars that are already set unless --force is passed.
 */
import { spawnSync } from "node:child_process";
import { loadEnv } from "./lib/env.mjs";

loadEnv();

const force = process.argv.includes("--force");

const VARS = [
  "CRON_SECRET",
  "IMPORT_CRON_KEY",
  "NEXT_PUBLIC_MAPBOX_TOKEN",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "ADMIN_NOTIFY_EMAIL",
  "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID",
  "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET",
  "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID",
  "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET",
];

function listProductionEnv() {
  const result = spawnSync("npx", ["vercel", "env", "ls", "production"], {
    encoding: "utf-8",
    shell: true,
  });
  return result.stdout ?? "";
}

function addEnv(name, value) {
  const trimmed = value.trim();
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", name, "production", "--yes"],
    {
      input: trimmed,
      encoding: "utf-8",
      shell: process.platform === "win32",
    }
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    return false;
  }
  return true;
}

const existing = listProductionEnv();
let pushed = 0;
let skipped = 0;
let missing = 0;

for (const name of VARS) {
  const value = process.env[name]?.trim();
  if (!value) {
    missing++;
    continue;
  }
  if (!force && existing.includes(name)) {
    console.log(`skip ${name} (already on Vercel)`);
    skipped++;
    continue;
  }
  console.log(`push ${name}…`);
  if (addEnv(name, value)) {
    pushed++;
  }
}

console.log(`\nDone: ${pushed} pushed, ${skipped} skipped, ${missing} not in .env.local`);

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()) {
  console.log(
    "\nTip: add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local for Mapbox geocoding and routing."
  );
}
if (!process.env.RESEND_API_KEY?.trim()) {
  console.log(
    "Tip: add RESEND_API_KEY + RESEND_FROM_EMAIL for fuel-alert emails."
  );
}
