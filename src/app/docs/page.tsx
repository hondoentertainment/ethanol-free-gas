import Link from "next/link";
import { DOC_CATEGORIES, DOCS, getDocsByCategory } from "@/lib/content/docs";

export const metadata = {
  title: "Help & Documentation",
  description:
    "User guides, FAQs, and reference documentation for E0 Finder — the ethanol-free fuel map.",
};

export default function DocsIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-sky-700">
        ← Map
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
        Help &amp; documentation
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Everything you need to find ethanol-free fuel, verify stations, set alerts,
        and contribute to the community map.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/docs/getting-started"
          className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium text-sky-900 hover:bg-sky-100"
        >
          New here? Start with getting started →
        </Link>
        <Link
          href="/guides"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Fuel education guides →
        </Link>
      </div>

      <div className="mt-10 space-y-10">
        {DOC_CATEGORIES.map((category) => {
          const pages = getDocsByCategory(category);
          if (pages.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {category}
              </h2>
              <ul className="mt-3 space-y-2">
                {pages.map((doc) => (
                  <li key={doc.slug}>
                    <Link
                      href={`/docs/${doc.slug}`}
                      className="block rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
                    >
                      <p className="font-medium text-zinc-900">{doc.title}</p>
                      <p className="mt-1 text-sm text-zinc-600">{doc.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-zinc-500">
        {DOCS.length} articles · Also see{" "}
        <Link href="/developers" className="text-sky-700 hover:text-sky-800">
          API documentation
        </Link>{" "}
        for partners
      </p>
    </div>
  );
}
