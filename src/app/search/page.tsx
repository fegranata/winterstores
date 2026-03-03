import { Suspense } from "react";
import SearchBar from "@/components/search/SearchBar";
import FilterPanel from "@/components/search/FilterPanel";
import MobileFilterDrawer from "@/components/search/MobileFilterDrawer";
import GeolocationButton from "@/components/search/GeolocationButton";
import SearchResults from "@/components/search/SearchResults";
import AdSlot from "@/components/ui/AdSlot";
import { searchStores } from "@/lib/store-search";
import type { SportType, ServiceType } from "@/types/store";
import type { Metadata } from "next";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : null;
  const country = typeof params.country === "string" ? params.country : null;

  let title = "Search Winter Sport Stores";
  if (q) title = `"${q}" — Winter Sport Stores`;
  else if (country) title = `Winter Sport Stores in ${country.toUpperCase()}`;

  return {
    title,
    description: `Search and compare winter sport stores${q ? ` for "${q}"` : ""}. Filter by sport, services, rating, and location.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // Normalize sport/service to arrays
  const sportRaw = params.sport;
  const sportArr: SportType[] = sportRaw
    ? ((Array.isArray(sportRaw) ? sportRaw : [sportRaw]) as SportType[])
    : [];

  const serviceRaw = params.service;
  const serviceArr: ServiceType[] = serviceRaw
    ? ((Array.isArray(serviceRaw) ? serviceRaw : [serviceRaw]) as ServiceType[])
    : [];

  const userLat = typeof params.lat === "string" ? Number(params.lat) : undefined;
  const userLng = typeof params.lng === "string" ? Number(params.lng) : undefined;

  const result = await searchStores({
    q: typeof params.q === "string" ? params.q : undefined,
    sport: sportArr.length > 0 ? sportArr : undefined,
    service: serviceArr.length > 0 ? serviceArr : undefined,
    lat: userLat,
    lng: userLng,
    distance: typeof params.distance === "string" ? Number(params.distance) : undefined,
    minRating: typeof params.minRating === "string" ? Number(params.minRating) : undefined,
    hasOnlineShop:
      params.hasOnlineShop === "true"
        ? true
        : params.hasOnlineShop === "false"
        ? false
        : undefined,
    priceLevel: typeof params.priceLevel === "string" ? Number(params.priceLevel) : undefined,
    country: typeof params.country === "string" ? params.country : undefined,
    sort: (typeof params.sort === "string" ? params.sort : "highest-rated") as
      | "closest"
      | "highest-rated"
      | "most-reviewed"
      | "newest",
    page: typeof params.page === "string" ? Number(params.page) : 1,
    limit: 20,
  });

  const currentPage = typeof params.page === "string" ? Number(params.page) : 1;
  const currentSort = typeof params.sort === "string" ? params.sort : "highest-rated";

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Search bar + geo + mobile filter */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-xl">
          <SearchBar
            defaultValue={typeof params.q === "string" ? params.q : ""}
            size="md"
          />
        </div>
        <Suspense>
          <GeolocationButton />
        </Suspense>
        <Suspense>
          <MobileFilterDrawer />
        </Suspense>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar — desktop only */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
            <Suspense fallback={<div className="text-sm text-slate-400">Loading filters…</div>}>
              <FilterPanel />
            </Suspense>
          </div>
        </aside>

        {/* Results + Map area */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{result.total}</span>{" "}
              store{result.total !== 1 ? "s" : ""} found
              {typeof params.q === "string" && params.q && (
                <span>
                  {" "}for &ldquo;<span className="font-medium text-slate-700">{params.q}</span>&rdquo;
                </span>
              )}
            </p>

            {/* Sort pills */}
            <SortSelect current={currentSort} searchParams={params} />
          </div>

          {/* Store list + Map split view */}
          <SearchResults
            stores={result.stores}
            userLat={userLat}
            userLng={userLng}
          />

          {/* Ad placement — search results */}
          <div className="my-6">
            <AdSlot slot="search-results-bottom" format="banner" />
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: result.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const pageParams = new URLSearchParams();
                for (const [key, val] of Object.entries(params)) {
                  if (val === undefined) continue;
                  if (Array.isArray(val)) {
                    val.forEach((v) => pageParams.append(key, v));
                  } else {
                    pageParams.set(key, val);
                  }
                }
                pageParams.set("page", String(pageNum));
                return (
                  <Link
                    key={pageNum}
                    href={`/search?${pageParams.toString()}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sort Select ───────────────────────────────────── */
function SortSelect({
  current,
  searchParams,
}: {
  current: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const options = [
    { value: "highest-rated", label: "Highest Rated" },
    { value: "most-reviewed", label: "Most Reviewed" },
    { value: "newest", label: "Newest" },
    { value: "closest", label: "Closest" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400">Sort by:</span>
      <div className="flex gap-1">
        {options.map((opt) => {
          const sortParams = new URLSearchParams();
          for (const [key, val] of Object.entries(searchParams)) {
            if (val === undefined || key === "sort" || key === "page") continue;
            if (Array.isArray(val)) {
              val.forEach((v) => sortParams.append(key, v));
            } else {
              sortParams.set(key, val);
            }
          }
          sortParams.set("sort", opt.value);
          return (
            <Link
              key={opt.value}
              href={`/search?${sortParams.toString()}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                current === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
