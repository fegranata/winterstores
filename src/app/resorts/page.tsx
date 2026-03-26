import Link from "next/link";
import { getResortsByRegion } from "@/lib/data/resorts";
import AdSlot from "@/components/ui/AdSlot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Resorts", href: "/resorts" },
        ]}
      />

      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Resorts</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Ski Resorts & Nearby Shops
      </h1>
      <p className="mt-2 text-slate-500">
        Browse {regions.reduce((sum, [, r]) => sum + r.length, 0)} major ski
        resorts across {regions.length} regions. Find the best winter sport
        stores near each resort.
      </p>

      {regions.map(([region, resorts]) => (
        <section key={region} className="mt-10">
          <h2 className="text-xl font-semibold text-slate-800">{region}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resorts.map((r) => (
              <Link
                key={r.slug}
                href={`/resorts/${r.slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {r.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {r.country}
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
        </section>
      ))}

      <div className="mt-8">
        <AdSlot slot="browse-bottom" format="banner" />
      </div>
    </div>
  );
}
