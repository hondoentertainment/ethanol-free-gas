import Link from "next/link";

export const metadata = {
  title: "About E0 Finder",
  description:
    "Ethanol-Free Fuel Finder helps boat owners, classic car enthusiasts, and small-engine users locate verified E0 gasoline across North America.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← Back to map
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">About E0 Finder</h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          E0 Finder is a mobile-first map for locating ethanol-free (E0) gasoline
          stations across the United States and Canada. Whether you fuel a boat,
          classic car, motorcycle, or small engine, you can find stations that sell
          gasoline without ethanol blends.
        </p>
        <p>
          Stations are classified as car, boat, or dual-access so you know whether
          a location is a roadside gas station or a marina fuel dock. Community
          members verify availability and upload photos to keep listings accurate.
        </p>
        <p>
          Station data is sourced from{" "}
          <a
            href="https://www.pure-gas.org/"
            className="font-medium text-sky-700 hover:text-sky-800"
            rel="noopener noreferrer"
            target="_blank"
          >
            pure-gas.org
          </a>
          , supplemented by crowdsourced additions and verifications.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/states"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Browse by state →
        </Link>
        <Link
          href="/station/add"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Add a station →
        </Link>
      </div>
    </div>
  );
}
