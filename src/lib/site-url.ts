/** Canonical site URL for metadata, sitemaps, and outbound links. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    "https://ethanol-free-gas.vercel.app";
  return raw.replace(/\/$/, "");
}
