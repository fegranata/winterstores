"use client";

import Link from "next/link";
import { useState } from "react";
import AuthStatus from "@/components/auth/AuthStatus";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <span className="text-2xl">🏔️</span>
          <span>
            Winter<span className="text-blue-600">Stores</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/search"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Find Stores
          </Link>
          <Link
            href="/search?sort=highest-rated"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Top Rated
          </Link>
          <Link
            href="/browse"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/resorts"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Resorts
          </Link>
          <Link
            href="/guides"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Guides
          </Link>
          <Link
            href="/favorites"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Favorites
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search
          </Link>
          <AuthStatus />
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link href="/search" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
            Find Stores
          </Link>
          <Link href="/search?sort=highest-rated" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
            Top Rated
          </Link>
          <Link href="/browse" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
            Browse by Country
          </Link>
          <Link href="/resorts" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
            Resorts
          </Link>
          <Link href="/best-ski-shops" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
            Best Ski Shops
          </Link>
          <Link href="/guides" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
            Guides
          </Link>
          <Link href="/favorites" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
            Favorites
          </Link>
          <div className="border-t border-slate-200 pt-2 mt-2" onClick={() => setMenuOpen(false)}>
            <AuthStatus />
          </div>
        </div>
      )}
    </header>
  );
}
