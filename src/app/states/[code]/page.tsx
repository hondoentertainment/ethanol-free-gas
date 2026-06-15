import Link from "next/link";
import { notFound } from "next/navigation";
import { queryStations } from "@/lib/data/query-stations";
import {
  CA_PROVINCE_NAMES,
  getRegionName,
  US_STATE_NAMES,
} from "@/lib/data/state-stats";

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
    limit: 50,
  });

  const filtered = stations.filter(
    (s) => s.state === stateCode && s.country === countryCode
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
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

      <ul className="mt-8 space-y-2">
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
