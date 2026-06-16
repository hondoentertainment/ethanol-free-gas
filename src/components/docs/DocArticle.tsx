import Link from "next/link";
import type { DocPage, DocSubsection } from "@/lib/content/docs";
import { getDoc } from "@/lib/content/docs";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderParagraph(text: string) {
  const linkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (linkMatch) {
    const [full, label, href] = linkMatch;
    const before = text.slice(0, text.indexOf(full));
    const after = text.slice(text.indexOf(full) + full.length);
    const isExternal = href.startsWith("http");
    return (
      <p>
        {renderInline(before)}
        <a
          href={href}
          className="font-medium text-sky-700 hover:text-sky-800"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>
        {renderInline(after)}
      </p>
    );
  }
  return <p>{renderInline(text)}</p>;
}

function DocSubsectionBlock({ section }: { section: DocSubsection }) {
  return (
    <section className="space-y-3">
      {section.heading && (
        <h2 className="text-base font-semibold text-zinc-900">{section.heading}</h2>
      )}
      {section.paragraphs?.map((p) => (
        <div key={p} className="text-sm leading-relaxed text-zinc-700">
          {renderParagraph(p)}
        </div>
      ))}
      {section.bullets && (
        <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-700">
          {section.bullets.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>
      )}
      {section.steps && (
        <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-700">
          {section.steps.map((step) => (
            <li key={step} className="pl-1">
              {renderInline(step)}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function DocArticle({ doc }: { doc: DocPage }) {
  return (
    <article>
      <h1 className="text-2xl font-semibold text-zinc-900">{doc.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{doc.description}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {doc.category}
      </p>

      <div className="mt-8 space-y-8">
        {doc.subsections.map((section, i) => (
          <DocSubsectionBlock key={section.heading ?? i} section={section} />
        ))}
      </div>

      {doc.relatedSlugs && doc.relatedSlugs.length > 0 && (
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="text-sm font-semibold text-zinc-900">Related topics</h2>
          <ul className="mt-2 space-y-1">
            {doc.relatedSlugs.map((slug) => {
              const related = getDoc(slug);
              return (
                <li key={slug}>
                  <Link
                    href={`/docs/${slug}`}
                    className="text-sm font-medium text-sky-700 hover:text-sky-800"
                  >
                    {related?.title ?? slug}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
