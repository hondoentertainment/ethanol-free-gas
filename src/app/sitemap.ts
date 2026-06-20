import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/content/guides";
import { DOCS } from "@/lib/content/docs";
import {
  getCityStationStats,
  getStateStationStats,
  getStationSitemapEntries,
} from "@/lib/data/state-stats";
import { getSiteUrl } from "@/lib/site-url";
import { slugify } from "@/lib/utils/slug";

// Regenerate at most once a day — the underlying data (and 17k+ station rows)
// changes slowly and is expensive to enumerate on every request.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = getSiteUrl();
  const [stats, cities, stationEntries] = await Promise.all([
    getStateStationStats(),
    getCityStationStats(),
    getStationSitemapEntries(),
  ]);

  const guideUrls: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${BASE}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const docUrls: MetadataRoute.Sitemap = DOCS.map((doc) => ({
    url: `${BASE}/docs/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.55,
  }));

  const stateUrls: MetadataRoute.Sitemap = stats.map((row) => ({
    url:
      row.country === "CA"
        ? `${BASE}/states/${row.state.toLowerCase()}?country=CA`
        : `${BASE}/states/${row.state.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const cityUrls: MetadataRoute.Sitemap = cities.map((row) => {
    const path = `${BASE}/states/${row.state.toLowerCase()}/${slugify(row.city)}`;
    return {
      url: row.country === "CA" ? `${path}?country=CA` : path,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.65,
    };
  });

  // Keep the sitemap within the 50k-URL limit; the most valuable station pages
  // are surfaced via the city/state landing pages above.
  const STATION_URL_CAP = 40000;
  const stationUrls: MetadataRoute.Sitemap = stationEntries
    .slice(0, STATION_URL_CAP)
    .map((entry) => ({
      url: `${BASE}/station/${entry.id}`,
      lastModified: entry.updated_at ? new Date(entry.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
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
    {
      url: `${BASE}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    ...guideUrls,
    ...docUrls,
    ...stateUrls,
    ...cityUrls,
    ...stationUrls,
  ];
}
