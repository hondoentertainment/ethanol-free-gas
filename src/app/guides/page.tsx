import Link from "next/link";
import { GUIDES } from "@/lib/content/guides";

export const metadata = {
  title: "E0 Fuel Guides",
  description: "Learn about ethanol-free gasoline, boat fuel, and trip planning.",
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700">← Map</Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Guides</h1>
      <ul className="mt-6 space-y-3">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
            >
              <p className="font-medium text-zinc-900">{guide.title}</p>
              <p className="mt-1 text-sm text-zinc-600">{guide.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
