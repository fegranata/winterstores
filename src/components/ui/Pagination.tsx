import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

/**
 * Renders: ← Prev  1 ... 4 [5] 6 ... 53  Next →
 * Always shows first, last, current, and 1 neighbor on each side.
 */
export default function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page number set: first, last, current ± 1
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  // Build display items with ellipsis gaps
  const items: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(sorted[i]);
  }

  const btnBase =
    "flex h-9 min-w-[36px] items-center justify-center rounded-lg text-sm font-medium transition-colors px-2";
  const btnActive = "bg-blue-600 text-white";
  const btnInactive =
    "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50";
  const btnDisabled = "pointer-events-none text-slate-300 border border-slate-100 bg-slate-50";

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link href={buildHref(currentPage - 1)} className={`${btnBase} ${btnInactive} gap-1`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled} gap-1`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      {/* Page numbers */}
      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e${i}`} className="flex h-9 w-6 items-center justify-center text-sm text-slate-400">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            className={`${btnBase} ${currentPage === item ? btnActive : btnInactive}`}
            aria-current={currentPage === item ? "page" : undefined}
          >
            {item}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link href={buildHref(currentPage + 1)} className={`${btnBase} ${btnInactive} gap-1`}>
          <span className="hidden sm:inline">Next</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled} gap-1`}>
          <span className="hidden sm:inline">Next</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      )}
    </nav>
  );
}
