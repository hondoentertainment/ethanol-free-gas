import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { queryStations } from "@/lib/data/query-stations";
import {
  CA_PROVINCE_NAMES,
  getRegionName,
  US_STATE_NAMES,
} from "@/lib/data/state-stats";
import { getSiteUrl } from "@/lib/site-url";
import { slugify } from "@/lib/utils/slug";
import type { StationWithMeta } from "@/lib/types/station";

async function loadCity(code: string, citySlug: string, country: string) {
  const stateCode = code.toUpperCase();
  const countryCode = country.toUpperCase();

  const valid =
    countryCode === "US"
      ? US_STATE_NAMES[stateCode]
      : CA_PROVINCE_NAMES[stateCode];
  if (!valid) return null;

  const stations = await queryStations({ state: stateCode, all: true });
  const matches = stations.filter(
    (s) =>
      s.country === countryCode &&
      s.state === stateCode &&
      slugify(s.city) === citySlug
  );

  if (matches.length === 0) return null;

  return {
    stateCode,
    countryCode,
    regionName: getRegionName(stateCode, countryCode),
    cityName: matches[0].city,
    stations: matches as StationWithMeta[],
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ code: string; city: string }>;
  searchParams: Promise<{ country?: string }>;
}): Promise<Metadata> {
  const { code, city } = await params;
  const { country = "US" } = await searchParams;

  let data;
  try {
    data = await loadCity(code, city, country);
  } catch {
    data = null;
  }

  if (!data) {
    return { title: "City not found", robots: { index: false } };
  }

  const title = `Ethanol-Free Gas in ${data.cityName}, ${data.stateCode}`;
  const description = `${data.stations.length.toLocaleString()} ethanol-free (E0) gas stations in ${data.cityName}, ${data.regionName}. Find pure gas for cars, boats, and small engines with directions and community verification.`;
  const canonical = `${getSiteUrl()}/states/${data.stateCode.toLowerCase()}/${city}${
    data.countryCode === "CA" ? "?country=CA" : ""
  }`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string; city: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { code, city } = await params;
  const { country = "US" } = await searchParams;

  let data;
  try {
    data = await loadCity(code, city, country);
  } catch {
    data = null;
  }

  if (!data) notFound();

  const { stateCode, countryCode, regionName, cityName, stations } = data;
  const countryQuery = countryCode === "CA" ? "&country=CA" : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Ethanol-free gas stations in ${cityName}, ${stateCode}`,
    numberOfItems: stations.length,
    itemListElement: stations.slice(0, 30).map((station, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${getSiteUrl()}/station/${station.id}`,
      name: station.name,
    })),
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-zinc-500">
        <Link href="/states" className="font-medium text-sky-700 hover:text-sky-800">
          Regions
        </Link>
        <span className="px-1.5">/</span>
        <Link
          href={`/states/${stateCode.toLowerCase()}${
            countryCode === "CA" ? "?country=CA" : ""
          }`}
          className="font-medium text-sky-700 hover:text-sky-800"
        >
          {regionName}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-zinc-700">{cityName}</span>
      </nav>

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
        Ethanol-free gas in {cityName}, {stateCode}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        {stations.length.toLocaleString()} ethanol-free (E0) station
        {stations.length === 1 ? "" : "s"} in {cityName}. Tap a station for
        directions, hours, and the latest community verification.
      </p>

      <Link
        href={`/?state=${stateCode}${countryQuery}`}
        className="mt-4 inline-block rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        View {regionName} on map
      </Link>

      <ul className="mt-8 space-y-2">
        {stations.map((station) => (
          <li key={station.id}>
            <Link
              href={`/station/${station.id}`}
              className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
            >
              <p className="font-medium text-zinc-900">{station.name}</p>
              <p className="text-sm text-zinc-500">
                {station.address}, {station.city}, {station.state}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
