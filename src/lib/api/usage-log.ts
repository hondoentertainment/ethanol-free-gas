import { createHash } from "crypto";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}

export async function logApiUsage(apiKey: string, path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return;

  await fetch(`${url}/rest/v1/api_usage_log`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      api_key_hash: hashApiKey(apiKey),
      path,
    }),
  });
}
