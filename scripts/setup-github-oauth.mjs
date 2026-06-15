/**
 * GitHub OAuth setup for Supabase Auth.
 * Create OAuth App: https://github.com/settings/developers
 * Callback URL: https://bswkvvqngtagqvxiphtf.supabase.co/auth/v1/callback
 */

import { loadEnv } from "./lib/env.mjs";

loadEnv();

const projectRef = "bswkvvqngtagqvxiphtf";
const clientId = process.env.SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID?.trim();
const clientSecret = process.env.SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET?.trim();

console.log(`GitHub OAuth for ${projectRef}`);
console.log(`Callback: https://${projectRef}.supabase.co/auth/v1/callback`);

if (!clientId || !clientSecret) {
  console.log("\nAdd to .env.local:");
  console.log("SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=");
  console.log("SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=");
  process.exit(0);
}

console.log(
  `\nnpx supabase secrets set SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=${clientId} SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=${clientSecret} --project-ref ${projectRef}`
);
console.log("Enable in supabase/config.toml [auth.external.github] enabled = true");
console.log("npx supabase config push --yes");
