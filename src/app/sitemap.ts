import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/content/guides";
import { DOCS } from "@/lib/content/docs";
import { getStateStationStats } from "@/lib/data/state-stats";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = getSiteUrl();
  const stats = await getStateStationStats();

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
  ];
}
