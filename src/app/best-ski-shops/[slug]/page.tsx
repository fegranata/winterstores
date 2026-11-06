import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoresByCountry, getUniqueCountries } from "@/lib/store-search";
import StoreCard from "@/components/store/StoreCard";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";

export const revalidate = 604800; // store data changes only on imports, which always end in a deploy

// A "best shops" page should be a shortlist, not the full index. Rendering
// every store made this a near-duplicate of /browse/[country] (same store
// set, different sort) and pushed /best-ski-shops/us past 1MB of HTML.
// The full list lives on /browse/[country], linked at the foot of the page.
const TOP_N = 30;

// Prerendering this previously hung past the per-page timeout. Two things have
// changed since: the list is capped at TOP_N rather than rendering every store,
// and getStoresByCountry/getUniqueCountries now hit the country_code index and
// share a cache() per render instead of running repeated sequential scans.
export const dynamicParams = false;

export async function generateStaticParams() {
  const countries = await getUniqueCountries();
  return countries.map((c) => ({ slug: c.countryCode.toLowerCase() }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const countries = await getUniqueCountries();
  const match = countries.find(
    (c) => c.countryCode.toLowerCase() === slug.toLowerCase()
  );
  if (!match) return { title: "Not Found" };

  return {
    title: `Best Ski Shops in ${match.country}`,
    description: `The top-rated ski and snowboard shops in ${match.country}, ranked by WinterStores Score. Compare ${match.count} stores and find the best winter gear near you.`,
    alternates: {
      canonical: `https://winterstores.co/best-ski-shops/${slug.toLowerCase()}`,
    },
  };
}

export default async function BestSkiShopsCountryPage({ params }: Props) {
  const { slug } = await params;
  const countries = await getUniqueCountries();
  const countryInfo = countries.find(
    (c) => c.countryCode.toLowerCase() === slug.toLowerCase()
  );

  if (!countryInfo) notFound();

  const stores = await getStoresByCountry(slug);
  const ranked = [...stores]
    .sort((a, b) => b.winterstoresScore - a.winterstoresScore)
    .slice(0, TOP_N);
  const remaining = stores.length - ranked.length;

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Best Ski Shops", href: "/best-ski-shops" },
          {
            name: countryInfo.country,
            href: `/best-ski-shops/${slug.toLowerCase()}`,
          },
        ]}
      />

      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Best Ski Shops", href: "/best-ski-shops" },
          { label: countryInfo.country },
        ]}
        title={<>Best Ski Shops in {countryInfo.country}</>}
        lede={
          remaining > 0
            ? `The top ${ranked.length} of ${stores.length} winter sport stores, ranked by WinterStores Score`
            : `${ranked.length} winter sport store${ranked.length !== 1 ? "s" : ""} ranked by WinterStores Score`
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top 3 highlight */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-1 gap-4 rounded-3xl bg-gradient-to-b from-glow-50 to-transparent p-2 sm:grid-cols-3 sm:p-3">
          {ranked.slice(0, 3).map((store, i) => (
            <StoreCard key={store.id} store={store} rank={i + 1} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <AdSlot slot="browse-country-mid" format="banner" />
      </div>

      {/* Remaining stores */}
      {ranked.length > 3 && (
        <>
          <h2 className="mt-14 heading-display text-2xl text-ink-900 sm:text-3xl">
            Ranked #4–#{ranked.length}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.slice(3).map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </>
      )}

      {/* Cross-links */}
      <div className="mt-14 text-center">
        {remaining > 0 && (
          <p className="mb-4 text-sm text-slate-500">
            {remaining} more store{remaining !== 1 ? "s" : ""} in{" "}
            {countryInfo.country} didn&apos;t make the top {ranked.length}.
          </p>
        )}
        <Link
          href={`/browse/${slug.toLowerCase()}`}
          className="btn-primary"
        >
          Browse all {stores.length} stores in {countryInfo.country}
        </Link>
      </div>

      <div className="mt-10">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
      </div>
    </div>
  );
}
