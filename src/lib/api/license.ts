import { createHash } from "crypto";

export function validateApiLicenseKey(providedKey: string | null): boolean {
  if (!providedKey?.trim()) return false;

  const keys = process.env.API_LICENSE_KEYS?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!keys?.length) return false;

  return keys.includes(providedKey.trim());
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
