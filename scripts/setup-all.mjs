import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("=== E0 Finder setup checklist ===\n");

console.log("1. Generate secrets (ADMIN_SECRET, IMPORT_CRON_KEY)…");
run("node", ["scripts/generate-secrets.mjs"]);

console.log("\n2. Generate VAPID keys for web push…");
run("node", ["scripts/generate-vapid-keys.mjs"]);

console.log("\n3. Manual steps:");
console.log("   • Supabase: apply migrations, set env vars on Vercel");
console.log("   • GitHub: add NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY secrets");
console.log("   • OAuth: node scripts/setup-google-oauth.mjs / setup-github-oauth.mjs");
console.log("   • Optional: NEXT_PUBLIC_MAPBOX_TOKEN, RESEND_API_KEY");
console.log("   • Vercel cron: set CRON_SECRET = IMPORT_CRON_KEY, restore vercel.json crons");
console.log("   • Import data: npm run import:all");
