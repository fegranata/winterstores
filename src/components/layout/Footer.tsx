import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <span className="text-xl">🏔️</span>
              Winter<span className="text-blue-600">Stores</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              Find the best winter sport stores near you. Compare reviews, filter by sport, and discover gear shops worldwide.
            </p>
          </div>

          {/* Popular Sports */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Popular Sports</h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Skiing", href: "/search?sport=skiing" },
                { label: "Snowboarding", href: "/search?sport=snowboarding" },
                { label: "Cross-Country", href: "/search?sport=cross-country" },
                { label: "Ice Skating", href: "/search?sport=ice-skating" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Explore</h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Ski Resorts", href: "/resorts" },
                { label: "Best Ski Shops", href: "/best-ski-shops" },
                { label: "Guides & Tips", href: "/guides" },
                { label: "Browse by Country", href: "/browse" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">About</h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Suggest a Store", href: "/suggest" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} WinterStores. All rights reserved. Built with ❄️ for winter sports enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
