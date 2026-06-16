import Link from "next/link";

export const metadata = {
  title: "About E0 Finder",
  description:
    "Ethanol-Free Fuel Finder helps boat owners, classic car enthusiasts, and small-engine users locate verified E0 gasoline across North America.",
};

const DOC_LINKS = [
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/verifying-stations", label: "Verifying stations" },
  { href: "/docs/fuel-alerts", label: "Fuel alerts" },
  { href: "/docs/faq", label: "FAQ" },
];

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
          Stations are classified as <strong>car</strong>, <strong>boat</strong>, or{" "}
          <strong>dual-access</strong> so you know whether a location is a roadside gas
          station or a marina fuel dock. Community members verify availability, report
          closures, and upload photos to keep listings accurate.
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
          , supplemented by crowdsourced additions and verifications. The database
          includes 17,000+ listings refreshed weekly.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          What you can do
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          <li>Search by city, ZIP, address, or along a driving route</li>
          <li>Filter by car, boat, or dual station type</li>
          <li>Get directions via Google Maps, Apple Maps, or Waze</li>
          <li>Verify fuel availability and earn contributor points</li>
          <li>Set fuel alerts when status changes near home or your marina</li>
          <li>Install as a PWA for quick mobile access and offline cache</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Documentation</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Step-by-step help for every feature.
        </p>
        <ul className="mt-3 space-y-2">
          {DOC_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-sky-700 hover:text-sky-800"
              >
                {link.label} →
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/docs"
              className="text-sm font-medium text-sky-700 hover:text-sky-800"
            >
              Full help center →
            </Link>
          </li>
        </ul>
      </section>

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
        <Link
          href="/premium"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Premium listings →
        </Link>
        <Link
          href="/developers"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Partner API →
        </Link>
      </div>
    </div>
  );
}
