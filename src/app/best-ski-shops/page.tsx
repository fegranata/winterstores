import Link from "next/link";
import { getUniqueCountries } from "@/lib/store-search";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowRightIcon, StarIcon } from "@/components/ui/Icons";

export const revalidate = 604800; // store data changes only on imports, which always end in a deploy

export const metadata: Metadata = {
  title: "Best Ski Shops Worldwide",
  description:
    "Discover the highest-rated ski and snowboard shops in every country. Compare WinterStores Scores and find the best winter sport stores near you.",
  alternates: { canonical: "https://winterstores.co/best-ski-shops" },
};

export default async function BestSkiShopsPage() {
  const countries = await getUniqueCountries();

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Best Ski Shops", href: "/best-ski-shops" },
        ]}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Best Ski Shops" }]}
        title="Best Ski Shops Worldwide"
        lede={
          <>
            Top-rated winter sport stores across {countries.length} countries,
            ranked by WinterStores Score.
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {countries.map((c) => (
          <Link
            key={c.countryCode}
            href={`/best-ski-shops/${c.countryCode.toLowerCase()}`}
            className="group flex items-center justify-between gap-4 card card-hover p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-glow-50 text-glow-600 ring-1 ring-glow-100">
              <StarIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-ink-900 group-hover:text-blue-700 transition-colors">
                Best Ski Shops in {c.country}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {c.count} store{c.count !== 1 ? "s" : ""} ranked
              </p>
            </div>
<ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
      </div>
    </div>
  );
}
