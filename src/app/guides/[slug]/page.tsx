import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuideBySlug, getAllGuideSlugs } from "@/lib/data/guides";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide Not Found" };

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: `https://winterstores.co/guides/${guide.slug}`,
    },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      publishedTime: guide.publishedAt,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug);

  // Schema.org Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "WinterStores",
      url: "https://winterstores.co",
    },
    mainEntityOfPage: `https://winterstores.co/guides/${guide.slug}`,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: guide.title, href: `/guides/${guide.slug}` },
        ]}
      />

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/guides"
          className="hover:text-slate-600 transition-colors"
        >
          Guides
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium line-clamp-1">
          {guide.title}
        </span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">
          {guide.title}
        </h1>
        <p className="mt-3 text-lg text-slate-500">{guide.description}</p>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
          <time dateTime={guide.publishedAt}>
            {new Date(guide.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{guide.sections.length} min read</span>
        </div>
      </header>

      {/* Table of contents */}
      <nav className="mb-10 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">
          In This Guide
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
          {guide.sections.map((s, i) => (
            <li key={i}>
              <a
                href={`#section-${i}`}
                className="hover:text-blue-600 transition-colors"
              >
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Article content */}
      <article className="prose prose-slate max-w-none">
        {guide.sections.map((section, i) => (
          <section key={i} id={`section-${i}`} className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              {section.heading}
            </h2>
            <p className="text-slate-600 leading-relaxed">{section.content}</p>
          </section>
        ))}
      </article>

      {/* Ad */}
      <div className="mt-8">
        <AdSlot slot="store-detail-content" format="banner" />
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-xl bg-blue-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-blue-900">
          Find a Shop Near You
        </h2>
        <p className="mt-1 text-sm text-blue-700">
          Compare over 1,000 winter sport stores worldwide on WinterStores.
        </p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Search Stores
        </Link>
      </div>

      {/* Related guides */}
      {otherGuides.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-800">
            More Guides
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {otherGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md hover:border-blue-200"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {g.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {g.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
