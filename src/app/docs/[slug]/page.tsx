import Link from "next/link";
import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/DocArticle";
import { DOCS, getDoc } from "@/lib/content/docs";
import { breadcrumbList, JsonLd } from "@/components/seo/JsonLd";
import { RelatedRegionLinks } from "@/components/seo/RelatedRegionLinks";

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <JsonLd
        data={breadcrumbList([
          { name: "Docs", path: "/docs" },
          { name: doc.title, path: `/docs/${doc.slug}` },
        ])}
      />
      <Link href="/docs" className="text-sm font-medium text-sky-700">
        ← All documentation
      </Link>
      <div className="mt-4">
        <DocArticle doc={doc} />
      </div>
      <RelatedRegionLinks />
    </div>
  );
}
