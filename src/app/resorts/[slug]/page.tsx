import { notFound } from "next/navigation";
import Link from "next/link";
import { RESORTS, getResortBySlug, getAllResortSlugs } from "@/lib/data/resorts";
import { getStoresNearResort } from "@/lib/resort-search";
import StoreCard from "@/components/store/StoreCard";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ResortJsonLd from "@/components/seo/ResortJsonLd";
import type { Metadata } from "next";

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

  return {
    title: `Ski Shops Near ${resort.name}, ${resort.country}`,
    description: `Find the best ski and snowboard shops near ${resort.name}. Browse winter sport stores within 30km of ${resort.name}, ${resort.region}.`,
    alternates: {
      canonical: `https://winterstores.co/resorts/${resort.slug}`,
    },
  };
}

export default async function ResortPage({ params }: ResortPageProps) {
  const { slug } = await params;
  const resort = getResortBySlug(slug);
  if (!resort) notFound();

  // Try 30km first, expand to 50km if too few results
  let stores = await getStoresNearResort(resort.lat, resort.lng, 30);
  let radiusUsed = 30;
  if (stores.length < 3) {
    stores = await getStoresNearResort(resort.lat, resort.lng, 50);
    radiusUsed = 50;
  }

  // Get nearby resorts in the same region for cross-linking
  const relatedResorts = RESORTS.filter(
    (r) => r.region === resort.region && r.slug !== resort.slug
  ).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Resorts", href: "/resorts" },
          { name: resort.name, href: `/resorts/${resort.slug}` },
        ]}
      />
      <ResortJsonLd resort={resort} storeCount={stores.length} />

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/resorts"
          className="hover:text-slate-600 transition-colors"
        >
          Resorts
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{resort.name}</span>
      </nav>

      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Ski Shops Near {resort.name}
      </h1>
      <p className="mt-2 text-slate-500">
        {resort.region}, {resort.country}
      </p>

      {/* Store count */}
      <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {stores.length > 0 ? (
          <>
            <strong>{stores.length}</strong> winter sport store
            {stores.length !== 1 ? "s" : ""} within {radiusUsed}km of{" "}
            {resort.name}
          </>
        ) : (
          <>
            No stores found within 50km of {resort.name}.{" "}
            <Link
              href="/search"
              className="font-medium underline hover:text-blue-900"
            >
              Try searching
            </Link>{" "}
            for stores in {resort.country}.
          </>
        )}
      </div>

      {/* Store grid */}
      {stores.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div key={store.id} className="relative">
              <StoreCard store={store} />
              <span className="absolute right-3 top-3 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {store.distance.toFixed(1)}km
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Ad placement */}
      <div className="mt-8">
        <AdSlot slot="browse-country-mid" format="banner" />
      </div>

      {/* Related resorts */}
      {relatedResorts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-800">
            More Resorts in {resort.region}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedResorts.map((r) => (
              <Link
                key={r.slug}
                href={`/resorts/${r.slug}`}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href={`/search?q=${encodeURIComponent(resort.name)}`}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          Search with filters near {resort.name}
        </Link>
      </div>

      {/* Bottom ad */}
      <div className="mt-8">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
    </div>
  );
}
