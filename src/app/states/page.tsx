import Link from "next/link";
import {
  getRegionName,
  getStateStationStats,
} from "@/lib/data/state-stats";

export const metadata = {
  title: "Ethanol-Free Gas by State & Province",
  description:
    "Browse ethanol-free (E0) gasoline stations by US state and Canadian province.",
};

export default async function StatesIndexPage() {
  const stats = await getStateStationStats();
  const us = stats.filter((s) => s.country === "US");
  const ca = stats.filter((s) => s.country === "CA");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
        ← Back to map
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
        E0 stations by region
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Find ethanol-free fuel listings across the United States and Canada.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">United States</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {us.map((row) => (
            <li key={`us-${row.state}`}>
              <Link
                href={`/states/${row.state.toLowerCase()}`}
                className="flex justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm hover:bg-zinc-50"
              >
                <span className="font-medium text-zinc-900">
                  {getRegionName(row.state, row.country)}
                </span>
                <span className="text-zinc-500">{row.count.toLocaleString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {ca.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">Canada</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {ca.map((row) => (
              <li key={`ca-${row.state}`}>
                <Link
                  href={`/states/${row.state.toLowerCase()}?country=CA`}
                  className="flex justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm hover:bg-zinc-50"
                >
                  <span className="font-medium text-zinc-900">
                    {getRegionName(row.state, row.country)}
                  </span>
                  <span className="text-zinc-500">{row.count.toLocaleString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
