import Link from "next/link";
import {
  countryFromMapQuery,
  stateFromMapQuery,
  statePagePath,
} from "@/lib/content/region-links";
import { getRegionName } from "@/lib/data/state-stats";

interface RelatedRegionLinksProps {
  /** Optional map deep-link query (`state=FL&country=US`). */
  mapQuery?: string;
  /** Explicit state when not using mapQuery. */
  state?: string;
  country?: string;
}

export function RelatedRegionLinks({
  mapQuery,
  state: stateProp,
  country: countryProp,
}: RelatedRegionLinksProps) {
  const state = stateProp ?? stateFromMapQuery(mapQuery);
  const country = countryProp ?? countryFromMapQuery(mapQuery ?? "");

  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">Find E0 on the map</h2>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {state && (
          <>
            <li>
              <Link
                href={statePagePath(state, country)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-50"
              >
                {getRegionName(state, country)} directory
              </Link>
            </li>
            <li>
              <Link
                href={mapQuery ? `/?${mapQuery}` : `/?state=${state}&country=${country}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-50"
              >
                View {state} on map
              </Link>
            </li>
          </>
        )}
        <li>
          <Link
            href="/states"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-50"
          >
            Browse all regions
          </Link>
        </li>
        <li>
          <Link
            href="/guides/find-e0-along-route"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-50"
          >
            Route search guide
          </Link>
        </li>
      </ul>
    </section>
  );
}
