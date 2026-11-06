import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { SnowflakeIcon } from "@/components/ui/Icons";

const COLUMNS = [
  {
    title: "Popular Sports",
    links: [
      { label: "Skiing", href: "/search?sport=skiing" },
      { label: "Snowboarding", href: "/search?sport=snowboarding" },
      { label: "Cross-Country", href: "/search?sport=cross-country" },
      { label: "Ice Skating", href: "/search?sport=ice-skating" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Ski Resorts", href: "/resorts" },
      { label: "Best Ski Shops", href: "/best-ski-shops" },
      { label: "Guides & Tips", href: "/guides" },
      { label: "Browse by Country", href: "/browse" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Suggest a Store", href: "/suggest" },
      { label: "For Shop Owners", href: "/for-shops" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Find the best winter sport stores near you. Compare reviews, filter by sport, and discover gear shops worldwide.
            </p>
          </div>

          {COLUMNS.map((col, i) => (
            <div key={col.title} className={i === COLUMNS.length - 1 ? "lg:col-span-3" : "lg:col-span-2"}>
              <h3 className="eyebrow text-slate-800">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-500 transition-colors hover:text-blue-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6">
          <p className="flex flex-wrap items-center justify-center gap-x-1 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} WinterStores. All rights reserved. Built with{" "}
            <SnowflakeIcon className="inline h-3.5 w-3.5 text-blue-600" title="snow" /> for winter sports enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
