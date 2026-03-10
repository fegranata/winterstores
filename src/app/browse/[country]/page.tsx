import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getStoresByCountry,
  getRegionsByCountry,
  getUniqueCountries,
} from "@/lib/store-search";
import StoreCard from "@/components/store/StoreCard";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CountryPageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country: code } = await params;
  const countries = await getUniqueCountries();
  const match = countries.find((c) => c.countryCode.toLowerCase() === code.toLowerCase());
  if (!match) return { title: "Country Not Found" };
  return {
    title: `Winter Sport Stores in ${match.country}`,
    description: `Find ${match.count} winter sport stores in ${match.country}. Compare WinterStores Scores, filter by sport type, and find the best gear shops.`,
    alternates: { canonical: `https://winterstores.co/browse/${code.toLowerCase()}` },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country: code } = await params;
  const countries = await getUniqueCountries();
  const countryInfo = countries.find((c) => c.countryCode.toLowerCase() === code.toLowerCase());

  if (!countryInfo) notFound();

  const storesInCountry = await getStoresByCountry(code);
  const regions = await getRegionsByCountry(code);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Browse", href: "/browse" },
        { name: countryInfo.country, href: `/browse/${code.toLowerCase()}` },
      ]} />
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-slate-600 transition-colors">Browse</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{countryInfo.country}</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Winter Sport Stores in {countryInfo.country}
      </h1>
      <p className="mt-2 text-slate-500">
        {storesInCountry.length} store{storesInCountry.length !== 1 ? "s" : ""} across {regions.length} region{regions.length !== 1 ? "s" : ""}
      </p>

      {/* Regions summary */}
      {regions.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {regions.map((r) => (
            <Link
              key={r.region}
              href={`/search?country=${code.toUpperCase()}&q=${encodeURIComponent(r.region)}`}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
            >
              {r.region}
              <span className="text-xs text-slate-400">({r.count})</span>
            </Link>
          ))}
        </div>
      )}

      {/* All stores */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {storesInCountry
          .sort((a, b) => b.winterstoresScore - a.winterstoresScore)
          .map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
      </div>

      {/* Ad placement */}
      <div className="mt-8">
        <AdSlot slot="browse-country-mid" format="banner" />
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href={`/search?country=${code.toUpperCase()}`}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Search with filters in {countryInfo.country}
        </Link>
      </div>
    </div>
  );
}
