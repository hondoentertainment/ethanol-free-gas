import type { MetadataRoute } from "next";
import { getStateStationStats } from "@/lib/data/state-stats";

const BASE = "https://ethanol-free-gas.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stats = await getStateStationStats();

  const stateUrls: MetadataRoute.Sitemap = stats.map((row) => ({
    url:
      row.country === "CA"
        ? `${BASE}/states/${row.state.toLowerCase()}?country=CA`
        : `${BASE}/states/${row.state.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE}/states`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/developers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/premium`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    ...stateUrls,
  ];
}
