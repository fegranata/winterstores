"use client";

import Link from "next/link";
import { useState } from "react";
import AuthStatus from "@/components/auth/AuthStatus";
import Logo from "@/components/ui/Logo";
import { HeartIcon, MenuIcon, SearchIcon, XIcon } from "@/components/ui/Icons";

const NAV_LINKS = [
  { href: "/search", label: "Find Stores" },
  { href: "/search?sort=highest-rated", label: "Top Rated" },
  { href: "/browse", label: "Browse" },
  { href: "/resorts", label: "Resorts" },
  { href: "/guides", label: "Guides" },
];

const MOBILE_LINKS = [
  { href: "/search", label: "Find Stores" },
  { href: "/search?sort=highest-rated", label: "Top Rated" },
  { href: "/browse", label: "Browse by Country" },
  { href: "/resorts", label: "Resorts" },
  { href: "/best-ski-shops", label: "Best Ski Shops" },
  { href: "/guides", label: "Guides" },
  { href: "/favorites", label: "Favorites" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-snow/90 backdrop-blur-md supports-[backdrop-filter]:bg-snow/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/favorites"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink-900"
          >
            <HeartIcon className="h-4 w-4" />
            Favorites
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
          >
            <SearchIcon className="h-4 w-4" strokeWidth={2.25} />
            Search
          </Link>
          <AuthStatus />
        </div>

        {/* Mobile: quick search + menu */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white"
            aria-label="Search"
          >
            <SearchIcon className="h-4.5 w-4.5" strokeWidth={2.25} />
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-snow px-4 pb-4 pt-2">
          <nav className="grid gap-0.5" aria-label="Mobile">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-100 hover:text-ink-900"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 border-t border-slate-200 px-3 pt-3" onClick={() => setMenuOpen(false)}>
            <AuthStatus />
          </div>
        </div>
      )}
    </header>
  );
}
