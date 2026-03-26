import Link from "next/link";
import { getUniqueCountries } from "@/lib/store-search";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best Ski Shops Worldwide",
  description:
    "Discover the highest-rated ski and snowboard shops in every country. Compare WinterStores Scores and find the best winter sport stores near you.",
  alternates: { canonical: "https://winterstores.co/best-ski-shops" },
};

export default async function BestSkiShopsPage() {
  const countries = await getUniqueCountries();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Best Ski Shops", href: "/best-ski-shops" },
        ]}
      />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Best Ski Shops</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Best Ski Shops Worldwide
      </h1>
      <p className="mt-2 text-slate-500">
        Top-rated winter sport stores across {countries.length} countries,
        ranked by WinterStores Score.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c) => (
          <Link
            key={c.countryCode}
            href={`/best-ski-shops/${c.countryCode.toLowerCase()}`}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Best Ski Shops in {c.country}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {c.count} store{c.count !== 1 ? "s" : ""} ranked
              </p>
            </div>
            <svg
              className="h-5 w-5 text-slate-300 group-hover:text-blue-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
    </div>
  );
}
