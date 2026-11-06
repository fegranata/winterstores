import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuideBySlug, getAllGuideSlugs } from "@/lib/data/guides";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { BookIcon, ClockIcon, SearchIcon } from "@/components/ui/Icons";

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
    <div>
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

      {/* Header */}
      <header className="border-b border-slate-200 bg-white bg-header-wash">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: guide.title },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <h1 className="heading-display text-4xl text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              {guide.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">{guide.description}</p>
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <BookIcon className="h-4 w-4 text-blue-600" />
                <time dateTime={guide.publishedAt}>
                  {new Date(guide.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                {guide.sections.length} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
          {/* Table of contents — first in the DOM (as before), right rail on desktop */}
          <aside className="lg:order-2">
            <nav className="card p-5 lg:sticky lg:top-24 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <h2 className="eyebrow text-slate-500 mb-3">
                In This Guide
              </h2>
              <ol className="space-y-1 border-l border-slate-200 text-sm text-slate-600 [counter-reset:toc]">
                {guide.sections.map((s, i) => (
                  <li key={i} className="[counter-increment:toc]">
                    <a
                      href={`#section-${i}`}
                      className="-ml-px flex gap-2 border-l-2 border-transparent py-1.5 pl-4 leading-snug transition-colors hover:border-blue-600 hover:text-ink-900 before:font-semibold before:tabular-nums before:text-slate-400 before:content-[counter(toc)]"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Article content with mid-article native ad */}
          <div className="min-w-0 lg:order-1">
            <article className="max-w-[68ch]">
              {guide.sections.map((section, i) => (
                <div key={i}>
                  <section id={`section-${i}`} className="mb-10 scroll-mt-24">
                    <h2 className="heading-display text-2xl text-ink-900 sm:text-[1.75rem] mb-4">
                      {section.heading}
                    </h2>
                    <p className="prose-editorial">{section.content}</p>
                  </section>
                  {/* Native ad after second section */}
                  {i === 1 && (
                    <div className="my-10">
                      <AdSlot slot="guide-content-native" format="banner" />
                    </div>
                  )}
                </div>
              ))}
            </article>

            {/* Ad */}
            <div className="mt-10">
              <AdSlot slot="store-detail-content" format="banner" />
            </div>

            {/* CTA */}
            <div className="mt-12 overflow-hidden rounded-3xl bg-ink-900 bg-contours p-8 text-center sm:p-10">
              <h2 className="heading-display text-2xl text-white sm:text-3xl">
                Find a Shop Near You
              </h2>
              <p className="mt-2 text-sm text-white/70 sm:text-base">
                Compare over 1,000 winter sport stores worldwide on WinterStores.
              </p>
              <Link
                href="/search"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 shadow-sm transition-colors hover:bg-blue-50"
              >
                <SearchIcon className="h-4 w-4" strokeWidth={2.25} />
                Search Stores
              </Link>
            </div>
          </div>
        </div>

        {/* Related guides */}
        {otherGuides.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl">
              More Guides
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group card card-hover p-5"
                >
                  <h3 className="font-display text-lg font-semibold leading-snug text-ink-900 group-hover:text-blue-700 transition-colors">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                    {g.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
