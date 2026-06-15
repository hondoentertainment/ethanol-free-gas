/**
 * Generate VAPID keys for web push notifications.
 * Usage: node scripts/generate-vapid-keys.mjs
 */

import webpush from "web-push";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

const keys = webpush.generateVAPIDKeys();

console.log("Add these to .env.local and Vercel:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:you@example.com`);

if (existsSync(envPath)) {
  let content = readFileSync(envPath, "utf-8");
  const lines = [
    `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`,
    `VAPID_PRIVATE_KEY=${keys.privateKey}`,
    `VAPID_SUBJECT=mailto:support@ethanol-free-gas.vercel.app`,
  ];
  for (const line of lines) {
    const key = line.split("=")[0];
    if (content.includes(`${key}=`)) {
      content = content.replace(new RegExp(`^${key}=.*$`, "m"), line);
    } else {
      content += `\n${line}`;
    }
  }
  writeFileSync(envPath, content.trim() + "\n");
  console.log("\nUpdated .env.local");
}
