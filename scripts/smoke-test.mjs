/**
 * Production smoke tests for E0 Finder.
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 */
import { loadEnv } from "./lib/env.mjs";

loadEnv();

const base =
  process.argv[2]?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://ethanol-free-gas.vercel.app";

const adminSecret = process.env.ADMIN_SECRET?.trim();
const apiKeys = process.env.API_LICENSE_KEYS?.trim()?.split(/[,\s]+/).filter(Boolean);

const checks = [];

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    checks.push({ name, ok: false, message });
    console.log(`✗ ${name}: ${message}`);
  }
}

await check("health endpoint", async () => {
  const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(15000) });
  const data = await res.json();
  if (!res.ok) throw new Error(`status ${res.status}`);
  if (!data.checks?.supabase) throw new Error("supabase not configured");
  if (Number(data.checks.station_count) < 1000) {
    throw new Error(`low station count: ${data.checks.station_count}`);
  }
});

await check("stations API returns live data", async () => {
  const res = await fetch(`${base}/api/stations?all=true&limit=5`, {
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `status ${res.status}`);
  if (!data.stations?.length) throw new Error("no stations returned");
});

await check("homepage loads", async () => {
  const res = await fetch(base, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const html = await res.text();
  if (!html.includes("Ethanol-Free") && !html.includes("E0")) {
    throw new Error("unexpected homepage content");
  }
});

await check("sitemap", async () => {
  const res = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const xml = await res.text();
  if (!xml.includes("<urlset")) throw new Error("invalid sitemap");
});

await check("sitemap includes station URLs", async () => {
  const res = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const xml = await res.text();
  const stationUrls = (xml.match(/\/station\//g) ?? []).length;
  if (stationUrls < 1000) {
    throw new Error(`expected 1000+ station URLs, got ${stationUrls}`);
  }
});

await check("station detail includes GasStation JSON-LD", async () => {
  const res = await fetch(`${base}/api/stations?limit=1&all=true`, {
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  const id = data.stations?.[0]?.id;
  if (!id) throw new Error("no station id");
  const page = await fetch(`${base}/station/${id}`, {
    signal: AbortSignal.timeout(15000),
  });
  const html = await page.text();
  if (!html.includes('"GasStation"')) {
    throw new Error("missing GasStation JSON-LD on station page");
  }
});

await check("robots.txt", async () => {
  const res = await fetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`status ${res.status}`);
});

if (apiKeys?.[0]) {
  await check("v1 stations API (license key)", async () => {
    const res = await fetch(`${base}/api/v1/stations?limit=1`, {
      headers: { "x-api-key": apiKeys[0] },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
  });
} else {
  console.log("○ v1 stations API — skipped (no API_LICENSE_KEYS in .env.local)");
}

if (adminSecret) {
  await check("admin dashboard", async () => {
    const res = await fetch(`${base}/api/admin/dashboard`, {
      headers: { "x-admin-key": adminSecret },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
  });
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
