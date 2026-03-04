"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/use-favorites";
import type { Store } from "@/types/store";
import StoreCard from "@/components/store/StoreCard";
import { StoreCardSkeleton } from "@/components/ui/Skeleton";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setStores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/stores/by-slugs?slugs=${favorites.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        // Maintain favorites order
        const storeMap = new Map<string, Store>();
        for (const s of data.stores) {
          storeMap.set(s.slug, s);
        }
        setStores(
          favorites
            .map((slug) => storeMap.get(slug))
            .filter((s): s is Store => s != null)
        );
      })
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Favorites</span>
      </nav>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Your Favorites
          </h1>
          <p className="mt-2 text-slate-500">
            {favorites.length === 0
              ? "Save stores you love for quick access later."
              : `${favorites.length} saved store${favorites.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      ) : stores.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-slate-200 bg-white px-8 py-16 text-center">
          <p className="text-5xl">&#10084;&#65039;</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No favorites yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Browse stores and tap the heart icon to save your favorites. They&apos;ll appear here for easy access.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            Find Stores
          </Link>
        </div>
      )}
    </div>
  );
}
