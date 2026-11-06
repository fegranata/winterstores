import Link from "next/link";
import { getUniqueCountries } from "@/lib/store-search";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowRightIcon, GlobeIcon } from "@/components/ui/Icons";

// 7 days, matching /store/[slug]: the country list only changes when import
// scripts run, and those are always followed by a deploy that rebuilds this.
export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Browse Winter Sport Stores by Country",
  description: "Explore winter sport stores worldwide. Browse by country to find ski shops, snowboard stores, and rental services near popular resorts.",
  alternates: { canonical: "https://winterstores.co/browse" },
};

export default async function BrowsePage() {
  const countries = await getUniqueCountries();

  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Browse", href: "/browse" }]} />
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Browse" }]}
        title="Browse by Country"
        lede={<>Explore winter sport stores in {countries.length} countries around the world.</>}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {countries.map((c) => (
          <Link
            key={c.countryCode}
            href={`/browse/${c.countryCode.toLowerCase()}`}
            className="group flex items-center justify-between gap-4 card card-hover p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <GlobeIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-ink-900 group-hover:text-blue-700 transition-colors">
                {c.country}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {c.count} store{c.count !== 1 ? "s" : ""}
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </Link>
        ))}
      </div>

      {/* Ad placement */}
      <div className="mt-12">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
      </div>
    </div>
  );
}
