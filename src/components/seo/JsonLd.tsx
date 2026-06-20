import { getSiteUrl } from "@/lib/site-url";

/** Renders a JSON-LD <script> tag from a server-built, trusted object. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export interface Crumb {
  name: string;
  path: string;
}

/** Builds a schema.org BreadcrumbList from a list of crumbs (relative paths). */
export function breadcrumbList(crumbs: Crumb[]): Record<string, unknown> {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${base}${crumb.path}`,
    })),
  };
}
