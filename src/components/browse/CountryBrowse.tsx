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
import { pageCount, pageSlice, pageStart } from "@/lib/pagination";

/**
 * Stores per page.
 *
 * /browse/us shipped 1.1MB of HTML with 327 cards — bad for Core Web Vitals and
 * heavy enough that prerendering the country pages blew the build's per-page
 * timeout. Paginating rather than capping is deliberate: this route is the main
 * source of internal links into store pages (Search Console shows each store
 * receiving only 4-6), so a top-N cap would delete most of them. Splitting keeps
 * every store linked exactly once, just across several pages.
 *
 * 48 divides evenly into the 3-column grid.
 */
export const COUNTRY_PAGE_SIZE = 48;

export function countryPath(code: string, page: number): string {
  const base = `/browse/${code.toLowerCase()}`;
  return page <= 1 ? base : `${base}/${page}`;
}

export async function getCountryPageData(code: string, page: number) {
  const countries = await getUniqueCountries();
  const countryInfo = countries.find(
    (c) => c.countryCode.toLowerCase() === code.toLowerCase()
  );
  if (!countryInfo) return null;

  const all = await getStoresByCountry(code);
  const totalPages = pageCount(all.length, COUNTRY_PAGE_SIZE);
  if (page < 1 || page > totalPages) return null;

  return { countryInfo, total: all.length, totalPages };
}

interface CountryBrowseProps {
  code: string;
  page: number;
}

export default async function CountryBrowse({ code, page }: CountryBrowseProps) {
  const countries = await getUniqueCountries();
  const countryInfo = countries.find(
    (c) => c.countryCode.toLowerCase() === code.toLowerCase()
  );
  if (!countryInfo) notFound();

  const [allStores, regions] = await Promise.all([
    getStoresByCountry(code),
    getRegionsByCountry(code),
  ]);

  const totalPages = pageCount(allStores.length, COUNTRY_PAGE_SIZE);
  if (page < 1 || page > totalPages) notFound();

  const ranked = [...allStores].sort(
    (a, b) => b.winterstoresScore - a.winterstoresScore
  );
  const start = pageStart(page, COUNTRY_PAGE_SIZE);
  const stores = pageSlice(ranked, page, COUNTRY_PAGE_SIZE);

  const lower = code.toLowerCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Browse", href: "/browse" },
          { name: countryInfo.country, href: `/browse/${lower}` },
        ]}
      />

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-slate-600 transition-colors">Browse</Link>
        <span>/</span>
        {page > 1 ? (
          <>
            <Link href={`/browse/${lower}`} className="hover:text-slate-600 transition-colors">
              {countryInfo.country}
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Page {page}</span>
          </>
        ) : (
          <span className="text-slate-700 font-medium">{countryInfo.country}</span>
        )}
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Winter Sport Stores in {countryInfo.country}
        {page > 1 && (
          <span className="text-slate-400 font-normal"> — page {page}</span>
        )}
      </h1>
      <p className="mt-2 text-slate-500">
        {allStores.length} store{allStores.length !== 1 ? "s" : ""} across{" "}
        {regions.length} region{regions.length !== 1 ? "s" : ""}
        {totalPages > 1 && ` · showing ${start + 1}–${start + stores.length}`}
      </p>

      {/* Regions summary — page 1 only; it is the same list on every page */}
      {page === 1 && regions.length > 1 && (
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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label={`${countryInfo.country} store pages`}
        >
          {page > 1 && (
            <Link
              href={countryPath(code, page - 1)}
              rel="prev"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors"
            >
              ← Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={countryPath(code, n)}
              aria-current={n === page ? "page" : undefined}
              className={
                n === page
                  ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors"
              }
            >
              {n}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={countryPath(code, page + 1)}
              rel="next"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors"
            >
              Next →
            </Link>
          )}
        </nav>
      )}

      <div className="mt-8">
        <AdSlot slot="browse-country-mid" format="banner" />
      </div>

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
