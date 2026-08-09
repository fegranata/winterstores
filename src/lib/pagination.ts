/**
 * Pure pagination helpers, kept out of the route files so they can be tested
 * without pulling in Next's server runtime or a database.
 */

/**
 * Parses a page segment from a URL.
 *
 * Strict on purpose: with `dynamicParams = false` only the exact strings
 * returned by generateStaticParams resolve, but this also guards the
 * development path and any future loosening. "01", "2.5", "-1", "1e2" and ""
 * must not be treated as page numbers, or the same URL becomes reachable under
 * several spellings.
 */
export function parsePageParam(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;

  const page = Number(raw);
  return Number.isSafeInteger(page) ? page : null;
}

/** Number of pages needed for `total` items, never less than 1. */
export function pageCount(total: number, pageSize: number): number {
  if (!Number.isFinite(total) || total <= 0) return 1;
  if (!Number.isFinite(pageSize) || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Zero-based start index for a 1-based page number. */
export function pageStart(page: number, pageSize: number): number {
  return Math.max(0, (page - 1) * pageSize);
}

/** The slice of `items` belonging to a 1-based page. */
export function pageSlice<T>(items: T[], page: number, pageSize: number): T[] {
  const start = pageStart(page, pageSize);
  return items.slice(start, start + pageSize);
}
