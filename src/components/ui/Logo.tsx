import Link from "next/link";

/**
 * The WinterStores mark: the snow-capped peak from the "Listed on
 * WinterStores" badge (public/badge/listed-on-winterstores.svg), redrawn
 * inline so it costs no extra request.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" focusable="false">
      <path d="M14 2 L26 26 L2 26 Z" fill="#2563eb" />
      <path d="M19.2 15.4 L26 26 L15.6 26 Z" fill="#1e40af" opacity="0.5" />
      <path d="M14 2 L18.5 11 L14 9 L9.5 11 Z" fill="#ffffff" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  size?: "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const text = size === "lg" ? "text-xl" : "text-lg";
  const mark = size === "lg" ? "h-8 w-8" : "h-7 w-7";
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 font-semibold tracking-tight text-ink-900 ${text} ${className}`}
    >
      <LogoMark className={`${mark} transition-transform duration-200 group-hover:-translate-y-0.5`} />
      <span>
        Winter<span className="text-blue-600">Stores</span>
      </span>
    </Link>
  );
}
