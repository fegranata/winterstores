import { notFound } from "next/navigation";
import Link from "next/link";
import { RESORTS, getResortBySlug, getAllResortSlugs } from "@/lib/data/resorts";
import { getResortPageStores } from "@/lib/resort-search";
import StoreCard from "@/components/store/StoreCard";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ResortJsonLd from "@/components/seo/ResortJsonLd";
import RelatedGuides from "@/components/store/RelatedGuides";
import { getGuidesForStore } from "@/lib/data/guides";
import {
  buildResortDescription,
  buildResortMetaDescription,
} from "@/lib/resort-description";
import type { Metadata } from "next";
import { MapPinIcon, MountainIcon, SearchIcon } from "@/components/ui/Icons";

interface ResortPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllResortSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ResortPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resort = getResortBySlug(slug);
  if (!resort) return { title: "Resort Not Found" };

  // A resort with no stores nearby renders as an empty "Ski Shops Near X"
  // page, which Google files as a soft 404. Keep it for humans, keep it out
  // of the index. Shares the page body's cached lookup — no extra query.
  const { stores: nearby, radiusUsed } = await getResortPageStores(
    resort.lat,
    resort.lng
  );

  return {
    title: `Ski Shops Near ${resort.name}, ${resort.country}`,
    // Composed from this resort's actual store set — the previous description
    // was identical boilerplate on all 83 resort pages.
    description: buildResortMetaDescription(resort, nearby, radiusUsed),
    alternates: {
      canonical: `https://winterstores.co/resorts/${resort.slug}`,
    },
    ...(nearby.length === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function ResortPage({ params }: ResortPageProps) {
  const { slug } = await params;
  const resort = getResortBySlug(slug);
  if (!resort) notFound();

  // 30km, widened to 50km when that turns up too few (shared with generateMetadata)
  const { stores, radiusUsed } = await getResortPageStores(
    resort.lat,
    resort.lng
  );

  // Get nearby resorts in the same region for cross-linking
  const relatedResorts = RESORTS.filter(
    (r) => r.region === resort.region && r.slug !== resort.slug
  ).slice(0, 6);

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Resorts", href: "/resorts" },
          { name: resort.name, href: `/resorts/${resort.slug}` },
        ]}
      />
      <ResortJsonLd resort={resort} storeCount={stores.length} />

      {/* ── Hero: name, place, composed intro ──────────── */}
      <section className="relative bg-ink-900 bg-contours text-white">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="text-white/30" aria-hidden="true">/</span>
            <Link href="/resorts" className="transition-colors hover:text-white">
              Resorts
            </Link>
            <span className="text-white/30" aria-hidden="true">/</span>
            <span className="font-medium text-white" aria-current="page">{resort.name}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h1 className="heading-display text-4xl text-white sm:text-5xl lg:text-6xl">
                Ski Shops Near {resort.name}
              </h1>
              <p className="mt-4 flex items-center gap-1.5 text-white/70">
                <MapPinIcon className="h-4 w-4 text-blue-300" />
                {resort.region}, {resort.country}
              </p>

              {/* Composed intro — driven by this resort's actual store set, so no
                  two resort pages share their prose (see resort-description.ts) */}
              {stores.length > 0 && (
                <div className="mt-8 max-w-3xl space-y-4">
                  {buildResortDescription(resort, stores, radiusUsed).map((p, i) => (
                    <p key={i} className="text-[1.0625rem] leading-relaxed text-white/80">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Store count */}
            <div className="lg:col-span-4 lg:self-end">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 backdrop-blur-sm">
                {stores.length > 0 ? (
                  <p className="leading-relaxed">
                    <strong className="block font-display text-5xl font-semibold tabular-nums text-white">{stores.length}</strong> winter sport store
                    {stores.length !== 1 ? "s" : ""} within {radiusUsed}km of{" "}
                    {resort.name}
                  </p>
                ) : (
                  <p className="leading-relaxed">
                    No stores found within 50km of {resort.name}.{" "}
                    <Link
                      href="/search"
                      className="font-semibold text-white underline underline-offset-4 hover:text-blue-200"
                    >
                      Try searching
                    </Link>{" "}
                    for stores in {resort.country}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Store grid */}
        {stores.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                distanceLabel={
                  Number.isFinite(store.distance)
                    ? `${store.distance.toFixed(1)}km`
                    : "—"
                }
              />
            ))}
          </div>
        )}

        {/* Ad placement */}
        <div className="mt-10">
          <AdSlot slot="browse-country-mid" format="banner" />
        </div>

        {/* Related resorts */}
        {relatedResorts.length > 0 && (
          <section className="mt-14">
            <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl">
              More Resorts in {resort.region}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {relatedResorts.map((r) => (
                <Link
                  key={r.slug}
                  href={`/resorts/${r.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:border-blue-300 hover:text-blue-700"
                >
                  <MountainIcon className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  {r.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href={`/search?q=${encodeURIComponent(resort.name)}`}
            className="btn-primary"
          >
            <SearchIcon className="h-4 w-4" strokeWidth={2.25} />
            Search with filters near {resort.name}
          </Link>
        </div>

        {/* Match guides against what the shops around this resort actually offer,
            so a resort known for boot fitting surfaces the boot-fitting guide. */}
        <RelatedGuides
          guides={getGuidesForStore({
            services: [...new Set(stores.flatMap((s) => s.services))],
            sportTypes: [...new Set(stores.flatMap((s) => s.sportTypes))],
          })}
        />

        {/* Bottom ad */}
        <div className="mt-10">
          <AdSlot slot="browse-bottom" format="banner" />
        </div>
      </div>
    </div>
  );
}
