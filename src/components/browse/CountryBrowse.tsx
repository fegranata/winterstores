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
import PageHeader from "@/components/ui/PageHeader";
import { SearchIcon } from "@/components/ui/Icons";

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
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Browse", href: "/browse" },
          { name: countryInfo.country, href: `/browse/${lower}` },
        ]}
      />

      <PageHeader
        crumbs={
          page > 1
            ? [
                { label: "Home", href: "/" },
                { label: "Browse", href: "/browse" },
                { label: countryInfo.country, href: `/browse/${lower}` },
                { label: <>Page {page}</> },
              ]
            : [
                { label: "Home", href: "/" },
                { label: "Browse", href: "/browse" },
                { label: countryInfo.country },
              ]
        }
        title={
          <>
            Winter Sport Stores in {countryInfo.country}
            {page > 1 && (
              <span className="font-normal italic text-slate-400"> — page {page}</span>
            )}
          </>
        }
        lede={
          <>
            {allStores.length} store{allStores.length !== 1 ? "s" : ""} across{" "}
            {regions.length} region{regions.length !== 1 ? "s" : ""}
            {totalPages > 1 && ` · showing ${start + 1}–${start + stores.length}`}
          </>
        }
      >
        {/* Regions summary — page 1 only; it is the same list on every page */}
        {page === 1 && regions.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {regions.map((r) => (
              <Link
                key={r.region}
                href={`/search?country=${code.toUpperCase()}&q=${encodeURIComponent(r.region)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:border-blue-300 hover:text-blue-700"
              >
                {r.region}
                <span className="rounded-full bg-slate-100 px-1.5 text-xs tabular-nums text-slate-500">({r.count})</span>
              </Link>
            ))}
          </div>
        )}
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
          aria-label={`${countryInfo.country} store pages`}
        >
          {page > 1 && (
            <Link
              href={countryPath(code, page - 1)}
              rel="prev"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
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
                  ? "rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              }
            >
              {n}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={countryPath(code, page + 1)}
              rel="next"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
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
          className="btn-primary"
        >
          <SearchIcon className="h-4 w-4" strokeWidth={2.25} />
          Search with filters in {countryInfo.country}
        </Link>
      </div>
      </div>
    </div>
  );
}
