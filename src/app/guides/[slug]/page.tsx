import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, GUIDES } from "@/lib/content/guides";
import { breadcrumbList, JsonLd } from "@/components/seo/JsonLd";
import { RelatedRegionLinks } from "@/components/seo/RelatedRegionLinks";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.description };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-6">
      <JsonLd
        data={breadcrumbList([
          { name: "Guides", path: "/guides" },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ])}
      />
      <Link href="/guides" className="text-sm font-medium text-sky-700">← Guides</Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">{guide.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{guide.description}</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-700">
        {guide.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {"mapQuery" in guide && guide.mapQuery && (
        <Link
          href={`/?${guide.mapQuery}`}
          className="mt-6 inline-block rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white"
        >
          View on map
        </Link>
      )}

      {"mapQuery" in guide && guide.mapQuery && (
        <RelatedRegionLinks mapQuery={guide.mapQuery} />
      )}
    </article>
  );
}
