/**
 * Configure Google OAuth for Supabase Auth.
 *
 * 1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
 * 2. Authorized redirect URI:
 *    https://bswkvvqngtagqvxiphtf.supabase.co/auth/v1/callback
 * 3. Set secrets and push config:
 *
 *   npx supabase secrets set \
 *     SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-client-id \
 *     SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-client-secret
 *
 *   npx supabase config push --yes
 *
 * Apple Sign-In (optional):
 *   https://supabase.com/docs/guides/auth/social-login/auth-apple
 */

import { loadEnv, requireEnv } from "./lib/env.mjs";

loadEnv();

const projectRef = "bswkvvqngtagqvxiphtf";
const googleId = process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID?.trim();
const googleSecret = process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET?.trim();

console.log("Google OAuth setup for ethanol-free-gas");
console.log(`Project: ${projectRef}`);
console.log(`Redirect URI: https://${projectRef}.supabase.co/auth/v1/callback`);

if (!googleId || !googleSecret) {
  console.log("\nAdd to .env.local:");
  console.log("SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=");
  console.log("SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=");
  console.log("\nThen run: node scripts/setup-google-oauth.mjs");
  process.exit(0);
}

console.log("\nGoogle credentials found in .env.local.");
console.log("Run these commands to apply:");
console.log(
  `npx supabase secrets set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=${googleId} SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=${googleSecret} --project-ref ${projectRef}`
);
console.log("npx supabase config push --yes");
