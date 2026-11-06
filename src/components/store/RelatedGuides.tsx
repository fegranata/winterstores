import Link from "next/link";
import type { Guide } from "@/lib/data/guides";
import { BookIcon } from "@/components/ui/Icons";

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
    <section className="mt-16 pt-12 border-t border-slate-200">
      <h2 className="heading-display text-2xl text-ink-900 sm:text-3xl">
        {storeName ? `Before you visit ${storeName}` : "Helpful guides"}
      </h2>
      <p className="mt-2 text-slate-500">
        Practical reading for choosing gear and getting the most out of your trip.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group flex flex-col card card-hover p-6"
          >
            <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-glow-50 text-glow-700">
              <BookIcon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg font-semibold leading-snug text-ink-900 group-hover:text-blue-700 transition-colors">
              {guide.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-slate-500">
              {guide.description}
            </p>
            <span className="mt-auto pt-4 text-sm font-semibold text-blue-700">
              Read guide →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
