import { slugify } from "@/lib/utils/slug";

/** Extract a US/CA state code from a map deep-link query (e.g. `state=FL`). */
export function stateFromMapQuery(mapQuery?: string): string | null {
  if (!mapQuery) return null;
  const match = mapQuery.match(/(?:^|&)state=([A-Za-z]{2})(?:&|$)/);
  return match ? match[1].toUpperCase() : null;
}

export function countryFromMapQuery(mapQuery?: string): string {
  const match = mapQuery?.match(/(?:^|&)country=([A-Za-z]{2})(?:&|$)/i);
  return match ? match[1].toUpperCase() : "US";
}

export function statePagePath(state: string, country = "US"): string {
  const code = state.toLowerCase();
  return country === "CA" ? `/states/${code}?country=CA` : `/states/${code}`;
}

export function cityPagePath(
  city: string,
  state: string,
  country = "US"
): string {
  const base = `/states/${state.toLowerCase()}/${slugify(city)}`;
  return country === "CA" ? `${base}?country=CA` : base;
}
