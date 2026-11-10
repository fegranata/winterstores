import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowRightIcon, LayersIcon, StarIcon } from "@/components/ui/Icons";
import {
  RANKED_RESORTS,
  REPORT_PATHS,
  RESORT_RATINGS,
  formatSnapshotDate,
} from "@/lib/data/resort-ratings";

const { totals, season } = RESORT_RATINGS;
const n = (v: number) => v.toLocaleString("en-US");

export const metadata: Metadata = {
  title: "Reports: Ski Shop Data and Rankings",
  description:
    `Original data from the WinterStores directory: ${RANKED_RESORTS.length} ski resorts ranked by the customer ratings of their rental and gear shops, ` +
    `built on ${n(totals.reviews)} public reviews. Free to quote with a link.`,
  alternates: { canonical: `https://winterstores.co${REPORT_PATHS.index}` },
};

export default function ReportsPage() {
  const reports = [
    {
      href: REPORT_PATHS.ratings,
      icon: <LayersIcon className="h-5 w-5" />,
      kicker: `Data report · ${season}`,
      title: "Ski Shop Ratings by Resort",
      body: `The full table: ${RANKED_RESORTS.length} resorts ranked on the customer ratings of ${n(totals.storesRated)} shops, by area and by country, with the method and a CSV download.`,
    },
    {
      href: REPORT_PATHS.topResorts,
      icon: <StarIcon className="h-5 w-5" />,
      kicker: `Ranking · ${season}`,
      title: "The 10 Ski Resorts With the Best-Rated Ski Shops",
      body: `${RANKED_RESORTS[0].name}, ${RANKED_RESORTS[1].name}, ${RANKED_RESORTS[2].name} and seven more, with the shops behind each score and the best resort in every region.`,
    },
  ];

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Reports", href: REPORT_PATHS.index },
        ]}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Reports" }]}
        title="Reports"
        lede={
          <>
            Original data from our directory of {n(totals.stores)} ski and snowboard shops. Free to
            quote and republish with a link to the source page.
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {reports.map((r) => (
            <Link key={r.href} href={r.href} className="group card card-hover flex flex-col p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                {r.icon}
              </span>
              <p className="eyebrow mt-5 text-slate-500">{r.kicker}</p>
              <h2 className="mt-2 heading-display text-2xl text-ink-900 group-hover:text-blue-700 sm:text-3xl">
                {r.title}
              </h2>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">{r.body}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                Read the report
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Data as of {formatSnapshotDate()}. Questions about the figures, or a request for a resort
          or country breakdown: <span className="font-medium text-slate-700">hello@winterstores.co</span>
        </p>
      </div>
    </div>
  );
}
