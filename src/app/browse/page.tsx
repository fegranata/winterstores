import Link from "next/link";
import { getUniqueCountries } from "@/lib/store-search";
import AdSlot from "@/components/ui/AdSlot";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Winter Sport Stores by Country",
  description: "Explore winter sport stores worldwide. Browse by country to find ski shops, snowboard stores, and rental services near popular resorts.",
  alternates: { canonical: "https://winterstores.vercel.app/browse" },
};

export default async function BrowsePage() {
  const countries = await getUniqueCountries();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Browse</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Browse by Country
      </h1>
      <p className="mt-2 text-slate-500">
        Explore winter sport stores in {countries.length} countries around the world.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c) => (
          <Link
            key={c.countryCode}
            href={`/browse/${c.countryCode.toLowerCase()}`}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {c.country}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {c.count} store{c.count !== 1 ? "s" : ""}
              </p>
            </div>
            <svg
              className="h-5 w-5 text-slate-300 group-hover:text-blue-400 transition-colors"
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

      {/* Ad placement */}
      <div className="mt-8">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
    </div>
  );
}
