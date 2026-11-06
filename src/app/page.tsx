import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";
import { SPORT_LABELS } from "@/types/store";
import type { SportType } from "@/types/store";
import { getUniqueCountries, getStoreCount, getTotalReviewCount } from "@/lib/store-search";
import AdSlot from "@/components/ui/AdSlot";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  MountainIcon,
  ScaleIcon,
  SearchIcon,
  SnowboardingIcon,
  SportIcon,
} from "@/components/ui/Icons";

export const revalidate = 604800; // counts/country list change only on imports, which always end in a deploy

// Title/description come from the root layout; this only pins the canonical,
// which was the one page on the site without one.
export const metadata: Metadata = {
  alternates: { canonical: "https://winterstores.co" },
};

const FEATURED_SPORTS: SportType[] = [
  "skiing",
  "snowboarding",
  "cross-country",
  "ice-skating",
  "sledding",
  "snowshoeing",
];

const POPULAR_REGIONS = [
  { name: "Colorado", country: "USA", query: "q=Colorado" },
  { name: "Swiss Alps", country: "Switzerland", query: "country=CH" },
  { name: "Austrian Tyrol", country: "Austria", query: "country=AT" },
  { name: "French Alps", country: "France", query: "country=FR" },
  { name: "Hokkaido", country: "Japan", query: "q=Hokkaido" },
  { name: "Scandinavia", country: "Norway & Sweden", query: "q=Norway" },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    Icon: SearchIcon,
    title: "Search",
    desc: "Enter your location or browse by region to find winter sport stores nearby.",
  },
  {
    step: "2",
    Icon: ScaleIcon,
    title: "Compare",
    desc: "Filter by sport type, services, and ratings. See reviews from multiple sources in one view.",
  },
  {
    step: "3",
    Icon: SnowboardingIcon,
    title: "Visit or Shop",
    desc: "Find the perfect store — visit in person or shop online. Get geared up for winter!",
  },
];

/** Layered ridgelines that fade the dark hero into the page ground. */
function HeroRidges() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full sm:h-32 lg:h-40"
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 110 L120 70 L210 96 L330 38 L450 92 L560 60 L690 104 L800 46 L930 88 L1040 30 L1170 90 L1290 58 L1440 96 V160 H0 Z"
        fill="#ffffff"
        opacity="0.05"
      />
      <path
        d="M0 132 L150 98 L260 122 L390 84 L520 126 L640 100 L770 134 L900 92 L1030 124 L1160 88 L1300 122 L1440 104 V160 H0 Z"
        fill="#ffffff"
        opacity="0.08"
      />
      <path
        d="M0 160 L0 146 L180 128 L340 148 L520 124 L700 150 L880 130 L1060 150 L1250 128 L1440 146 L1440 160 Z"
        fill="#fbfaf7"
      />
    </svg>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="px-2">
      <p className="font-display text-2xl font-semibold tabular-nums text-white sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-white/65 sm:text-sm">{label}</p>
    </div>
  );
}

export default async function HomePage() {
  const countries = await getUniqueCountries();
  const storeCount = await getStoreCount();
  const totalReviews = await getTotalReviewCount();

  return (
    <div>
      <WebSiteJsonLd />

      {/* ── Hero: typography-led, the search bar is the object ── */}
      {/* no overflow-hidden: the search autocomplete must be able to drop below the hero */}
      <section className="relative bg-ink-900 bg-contours">
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-36 sm:px-6 sm:pt-24 sm:pb-44 lg:px-8 lg:pt-28 lg:pb-52">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="heading-display text-[2.6rem] text-white sm:text-6xl lg:text-7xl">
              Find the Best{" "}
              <span className="font-medium italic text-blue-200">Winter Sport Stores</span>{" "}
              Near You
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Find the best-rated winter sport stores with the WinterStores
              Score — 265,000+ reviews condensed into one comparable number.
              Filter by sport, distance, and services.
            </p>
            <div className="mx-auto mt-10 max-w-2xl">
              <SearchBar size="lg" placeholder="Search by city, region, or store name…" />
            </div>

            {/* Stats */}
            <div className="mx-auto mt-12 grid max-w-xl grid-cols-3 divide-x divide-white/10">
              <Stat value={storeCount} label="Stores Listed" />
              <Stat value={countries.length} label="Countries" />
              <Stat value={totalReviews.toLocaleString()} label="Reviews Tracked" />
            </div>
          </div>
        </div>
        <HeroRidges />
      </section>

      {/* ── Sport entry points ───────────────────────── */}
      <section className="relative z-10 -mt-20 sm:-mt-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
            {FEATURED_SPORTS.map((sport) => (
              <Link
                key={sport}
                href={`/search?sport=${sport}`}
                className="group flex flex-col items-center gap-2.5 card card-hover px-2 py-4 text-center sm:py-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white sm:h-12 sm:w-12">
                  <SportIcon sport={sport} className="h-6 w-6" />
                </span>
                <span className="text-[13px] font-semibold leading-tight text-ink-900 sm:text-sm">
                  {SPORT_LABELS[sport]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Regions ──────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6 lg:px-8 lg:pt-24 lg:pb-16">
          <div className="max-w-2xl">
            <h2 className="heading-display text-3xl text-ink-900 sm:text-4xl">
              Popular Winter Sport Regions
            </h2>
            <p className="mt-3 text-slate-500 sm:text-lg">
              Explore stores in the world&apos;s best winter destinations
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {POPULAR_REGIONS.map((region) => (
              <Link
                key={region.name}
                href={`/search?${region.query}`}
                className="group flex items-center gap-4 card card-hover p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink-800 to-blue-700 text-white shadow-sm">
                  <MountainIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-ink-900 transition-colors group-hover:text-blue-700">
                    {region.name}
                  </h3>
                  <p className="text-sm text-slate-500">{region.country}</p>
                </div>
                <ArrowRightIcon className="ml-auto h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
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
      <section className="mt-10 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="text-center">
            <h2 className="heading-display text-3xl text-ink-900 sm:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            <span
              className="absolute top-8 left-[16.66%] right-[16.66%] hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent sm:block"
              aria-hidden="true"
            />
            {HOW_IT_WORKS.map(({ step, Icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-md ring-8 ring-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink-900">
                  {title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is WinterStores ───────────────────── */}
      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-24">
          <div className="lg:col-span-4">
            <h2 className="heading-display text-3xl text-ink-900 sm:text-4xl lg:sticky lg:top-24">
              What is WinterStores?
            </h2>
          </div>
          <div className="prose-editorial lg:col-span-8 lg:border-l lg:border-slate-200 lg:pl-12">
            <p>
              WinterStores is a free, community-powered directory of winter sport
              stores from around the world. We condense hundreds of thousands of
              aggregated reviews into a single WinterStores Score — weighted by
              review volume — making it easy to compare ski shops, snowboard
              stores, rental services, and winter gear retailers at a glance.
            </p>
            <p>
              Whether you are planning a ski trip to the Alps, looking for snowboard
              gear in Colorado, or searching for cross-country skiing equipment in
              Scandinavia, WinterStores helps you find the best-rated stores near
              any winter sport destination. Filter by sport type, services offered,
              price level, and online shop availability.
            </p>
            <p>
              Our directory covers stores across {countries.length} countries and is
              growing every day thanks to community contributions. Anyone can{" "}
              <Link
                href="/suggest"
                className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:decoration-blue-700"
              >
                suggest a store
              </Link>{" "}
              or leave a review to help fellow winter sport enthusiasts find the
              perfect gear shop.
            </p>
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
