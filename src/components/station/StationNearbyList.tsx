import Link from "next/link";
import type { StationWithMeta } from "@/lib/types/station";
import { cityPagePath, statePagePath } from "@/lib/content/region-links";

export function StationNearbyList({
  stations,
  city,
  state,
  country,
}: {
  stations: StationWithMeta[];
  city: string;
  state: string;
  country: string;
}) {
  if (stations.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold text-zinc-900">Nearby E0 stations</h2>
      <ul className="mt-3 space-y-2">
        {stations.map((nearby) => (
          <li key={nearby.id}>
            <Link
              href={`/station/${nearby.id}`}
              className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
            >
              <p className="font-medium text-zinc-900">{nearby.name}</p>
              <p className="text-sm text-zinc-500">
                {nearby.city}, {nearby.state}
                {nearby.distance_miles != null &&
                  ` · ${nearby.distance_miles.toFixed(1)} mi`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <Link
          href={cityPagePath(city, state, country)}
          className="font-medium text-sky-700 hover:text-sky-800"
        >
          More in {city}
        </Link>
        <span className="text-zinc-300" aria-hidden>
          ·
        </span>
        <Link
          href={statePagePath(state, country)}
          className="font-medium text-sky-700 hover:text-sky-800"
        >
          Browse {state}
        </Link>
        <span className="text-zinc-300" aria-hidden>
          ·
        </span>
        <Link
          href={`/?state=${state}&country=${country}`}
          className="font-medium text-sky-700 hover:text-sky-800"
        >
          View on map
        </Link>
      </div>
    </section>
  );
}
