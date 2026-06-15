import { randomBytes } from "node:crypto";

function secret() {
  return randomBytes(32).toString("base64url");
}

console.log("Copy these into Vercel (no leading/trailing spaces):\n");
console.log(`ADMIN_SECRET=${secret()}`);
console.log(`IMPORT_CRON_KEY=${secret()}`);
console.log(
  "\nFor Vercel cron, set CRON_SECRET to the same value as IMPORT_CRON_KEY."
);
