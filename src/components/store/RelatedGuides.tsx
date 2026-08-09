import Link from "next/link";
import type { Guide } from "@/lib/data/guides";

interface RelatedGuidesProps {
  guides: Guide[];
  /** Woven into the heading, e.g. "Reading before you visit Bründl Sports". */
  storeName?: string;
}

/**
 * Contextual links from a store page out to relevant guides.
 *
 * These are the only internal links most guide articles get — the header nav
 * points at /guides but never at an individual article — so this is what routes
 * internal equity to the pages that can actually rank for informational queries.
 */
export default function RelatedGuides({ guides, storeName }: RelatedGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <section className="mt-12 pt-12 border-t border-slate-200">
      <h2 className="text-xl font-bold text-slate-900">
        {storeName ? `Before you visit ${storeName}` : "Helpful guides"}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Practical reading for choosing gear and getting the most out of your trip.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
              {guide.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-slate-500">
              {guide.description}
            </p>
            <span className="mt-3 text-sm font-medium text-blue-600">
              Read guide →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
