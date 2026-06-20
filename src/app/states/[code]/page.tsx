import Link from "next/link";
import { notFound } from "next/navigation";
import { queryStations } from "@/lib/data/query-stations";
import {
  CA_PROVINCE_NAMES,
  getRegionName,
  US_STATE_NAMES,
} from "@/lib/data/state-stats";
import { slugify } from "@/lib/utils/slug";
import { breadcrumbList, JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { code } = await params;
  const { country = "US" } = await searchParams;
  const stateCode = code.toUpperCase();
  const name = getRegionName(stateCode, country);

  return {
    title: `Ethanol-Free Gas in ${name}`,
    description: `Find ethanol-free (E0) gasoline stations in ${name}. Map, directions, and community verification.`,
  };
}

export default async function StatePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { code } = await params;
  const { country = "US" } = await searchParams;
  const stateCode = code.toUpperCase();
  const countryCode = country.toUpperCase();

  const valid =
    countryCode === "US"
      ? US_STATE_NAMES[stateCode]
      : CA_PROVINCE_NAMES[stateCode];

  if (!valid) notFound();

  const name = getRegionName(stateCode, countryCode);
  const stations = await queryStations({
    state: stateCode,
    all: true,
  });

  const filtered = stations.filter(
    (s) => s.state === stateCode && s.country === countryCode
  );

  const countryQuery = countryCode === "CA" ? "?country=CA" : "";

  const cityCounts = new Map<string, { city: string; count: number }>();
  for (const s of filtered) {
    if (!s.city) continue;
    const slug = slugify(s.city);
    const existing = cityCounts.get(slug);
    if (existing) existing.count += 1;
    else cityCounts.set(slug, { city: s.city, count: 1 });
  }
  const cities = Array.from(cityCounts.entries())
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <JsonLd
        data={breadcrumbList([
          { name: "Regions", path: "/states" },
          {
            name,
            path: `/states/${stateCode.toLowerCase()}${countryQuery}`,
          },
        ])}
      />
      <Link href="/states" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← All regions
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
        Ethanol-free gas in {name}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        {filtered.length.toLocaleString()} stations listed. Open the map to search
        and filter across all of {name}.
      </p>

      <Link
        href={`/?state=${stateCode}&country=${countryCode}`}
        className="mt-4 inline-block rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        View on map
      </Link>

      {cities.length > 1 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-900">Browse by city</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.slice(0, 40).map((c) => (
              <Link
                key={c.slug}
                href={`/states/${stateCode.toLowerCase()}/${c.slug}${countryQuery}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                {c.city}{" "}
                <span className="text-zinc-400">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-8 text-sm font-semibold text-zinc-900">
        Featured stations
      </h2>
      <ul className="mt-3 space-y-2">
        {filtered.slice(0, 30).map((station) => (
          <li key={station.id}>
            <Link
              href={`/station/${station.id}`}
              className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
            >
              <p className="font-medium text-zinc-900">{station.name}</p>
              <p className="text-sm text-zinc-500">
                {station.city}, {station.state}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length > 30 && (
        <p className="mt-4 text-sm text-zinc-500">
          Showing 30 of {filtered.length.toLocaleString()} stations.
        </p>
      )}
    </div>
  );
}
