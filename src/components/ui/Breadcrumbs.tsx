import Link from "next/link";

export interface Crumb {
  label: React.ReactNode;
  href?: string;
}

/**
 * Visible breadcrumb trail. Structured-data breadcrumbs stay in
 * BreadcrumbJsonLd; this only renders the links people see.
 */
export default function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-slate-500">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors hover:text-ink-900">
                  {item.label}
                </Link>
              ) : (
                <span
                  className="line-clamp-1 font-medium text-slate-800"
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <span className="text-slate-300" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
