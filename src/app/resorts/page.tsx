import Link from "next/link";
import { getResortsByRegion } from "@/lib/data/resorts";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowRightIcon, MountainIcon, StarIcon } from "@/components/ui/Icons";
import { RANKED_RESORTS, REPORT_PATHS, RESORT_RATINGS } from "@/lib/data/resort-ratings";

export const metadata: Metadata = {
  title: "Ski Resorts & Nearby Shops",
  description:
    "Browse 82 major ski resorts worldwide and find winter sport shops nearby. From the French Alps to Japan, discover the best gear shops near your favourite resort.",
  alternates: { canonical: "https://winterstores.co/resorts" },
};

export default function ResortsPage() {
  const regionMap = getResortsByRegion();
  const regions = Array.from(regionMap.entries());

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Resorts", href: "/resorts" },
        ]}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Resorts" }]}
        title="Ski Resorts & Nearby Shops"
        lede={
          <>
            Browse {regions.reduce((sum, [, r]) => sum + r.length, 0)} major ski
            resorts across {regions.length} regions. Find the best winter sport
            stores near each resort.
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <Link
        href={REPORT_PATHS.ratings}
        className="group mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink-900 bg-contours p-6 text-white sm:p-8"
      >
        <span className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-glow-300">
            <StarIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="eyebrow text-blue-300">New · {RESORT_RATINGS.season} report</span>
            <span className="mt-1 block font-display text-xl font-semibold sm:text-2xl">
              Which resorts have the best-rated ski shops?
            </span>
            <span className="mt-1 block text-sm text-white/70">
              {RANKED_RESORTS.length} resorts ranked on {RESORT_RATINGS.totals.reviews.toLocaleString("en-US")} customer reviews.{" "}
              {RANKED_RESORTS[0].name} comes first.
            </span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
          See the ranking
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
      {regions.map(([region, resorts]) => (
        <section key={region} className="mt-12">
          <h2 className="flex items-center gap-4 heading-display text-2xl text-ink-900 sm:text-3xl">
            {region}
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resorts.map((r) => (
              <Link
                key={r.slug}
                href={`/resorts/${r.slug}`}
                className="group flex items-center justify-between gap-4 card card-hover p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <MountainIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink-900 group-hover:text-blue-700 transition-colors">
                    {r.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {r.country}
                  </p>
                </div>
<ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-12">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
      </div>
    </div>
  );
}
