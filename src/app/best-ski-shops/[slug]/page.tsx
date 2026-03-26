import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoresByCountry, getUniqueCountries } from "@/lib/store-search";
import StoreCard from "@/components/store/StoreCard";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

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
  const ranked = stores.sort(
    (a, b) => b.winterstoresScore - a.winterstoresScore
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/best-ski-shops"
          className="hover:text-slate-600 transition-colors"
        >
          Best Ski Shops
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">
          {countryInfo.country}
        </span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Best Ski Shops in {countryInfo.country}
      </h1>
      <p className="mt-2 text-slate-500">
        {ranked.length} winter sport store{ranked.length !== 1 ? "s" : ""}{" "}
        ranked by WinterStores Score
      </p>

      {/* Top 3 highlight */}
      {ranked.length >= 3 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ranked.slice(0, 3).map((store, i) => (
            <div key={store.id} className="relative">
              <StoreCard store={store} />
              <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900 shadow">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <AdSlot slot="browse-country-mid" format="banner" />
      </div>

      {/* Remaining stores */}
      {ranked.length > 3 && (
        <>
          <h2 className="mt-10 text-xl font-semibold text-slate-800">
            All Stores
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.slice(3).map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </>
      )}

      {/* Cross-links */}
      <div className="mt-10 text-center">
        <Link
          href={`/browse/${slug.toLowerCase()}`}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Browse all stores in {countryInfo.country}
        </Link>
      </div>

      <div className="mt-8">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
    </div>
  );
}
