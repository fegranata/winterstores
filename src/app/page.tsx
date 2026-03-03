import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";
import { SPORT_ICONS, SPORT_LABELS } from "@/types/store";
import type { SportType } from "@/types/store";
import { getUniqueCountries, getStoreCount, getTotalReviewCount } from "@/lib/store-search";
import AdSlot from "@/components/ui/AdSlot";

export const dynamic = "force-dynamic";

const FEATURED_SPORTS: SportType[] = [
  "skiing",
  "snowboarding",
  "cross-country",
  "ice-skating",
  "sledding",
  "snowshoeing",
];

const POPULAR_REGIONS = [
  { name: "Colorado", country: "USA", emoji: "🏔️", query: "q=Colorado" },
  { name: "Swiss Alps", country: "Switzerland", emoji: "🇨🇭", query: "country=CH" },
  { name: "Austrian Tyrol", country: "Austria", emoji: "🇦🇹", query: "country=AT" },
  { name: "French Alps", country: "France", emoji: "🇫🇷", query: "country=FR" },
  { name: "Hokkaido", country: "Japan", emoji: "🇯🇵", query: "q=Hokkaido" },
  { name: "Scandinavia", country: "Norway & Sweden", emoji: "❄️", query: "q=Norway" },
];

export default async function HomePage() {
  const countries = await getUniqueCountries();
  const storeCount = await getStoreCount();
  const totalReviews = await getTotalReviewCount();

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Decorative snow dots */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-[10%] h-2 w-2 rounded-full bg-white" />
          <div className="absolute top-20 left-[25%] h-1.5 w-1.5 rounded-full bg-white" />
          <div className="absolute top-8 left-[50%] h-1 w-1 rounded-full bg-white" />
          <div className="absolute top-32 left-[70%] h-2 w-2 rounded-full bg-white" />
          <div className="absolute top-16 left-[85%] h-1.5 w-1.5 rounded-full bg-white" />
          <div className="absolute top-40 left-[40%] h-1 w-1 rounded-full bg-white" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the Best{" "}
              <span className="text-blue-200">Winter Sport Stores</span>{" "}
              Near You
            </h1>
            <p className="mt-4 text-lg text-blue-100 sm:text-xl">
              Find the best-rated winter sport stores with our WinterStores
              Score, plus ratings from Google and Yelp. Filter by sport,
              distance, and services.
            </p>
            <div className="mt-8 mx-auto max-w-lg">
              <SearchBar size="lg" placeholder="Search by city, region, or store name…" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Sport Quick Filters ──────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {FEATURED_SPORTS.map((sport) => (
              <Link
                key={sport}
                href={`/search?sport=${sport}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
              >
                <span>{SPORT_ICONS[sport]}</span>
                {SPORT_LABELS[sport]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {storeCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Stores Listed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {countries.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">Countries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {totalReviews.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-500">Reviews Tracked</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Regions ──────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Popular Winter Sport Regions
            </h2>
            <p className="mt-2 text-slate-500">
              Explore stores in the world&apos;s best winter destinations
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_REGIONS.map((region) => (
              <Link
                key={region.name}
                href={`/search?${region.query}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl group-hover:bg-blue-100 transition-colors">
                  {region.emoji}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {region.name}
                  </h3>
                  <p className="text-sm text-slate-500">{region.country}</p>
                </div>
                <svg
                  className="ml-auto h-5 w-5 text-slate-300 group-hover:text-blue-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad Slot ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AdSlot slot="homepage-mid" format="leaderboard" />
      </div>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              How It Works
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: "🔍",
                title: "Search",
                desc: "Enter your location or browse by region to find winter sport stores nearby.",
              },
              {
                step: "2",
                icon: "⚖️",
                title: "Compare",
                desc: "Filter by sport type, services, and ratings. See reviews from multiple sources in one view.",
              },
              {
                step: "3",
                icon: "🏂",
                title: "Visit or Shop",
                desc: "Find the perfect store — visit in person or shop online. Get geared up for winter!",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Ad Slot ──────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AdSlot slot="homepage-bottom" format="banner" />
      </div>
    </div>
  );
}
