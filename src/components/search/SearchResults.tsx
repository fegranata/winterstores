"use client";

import { useState } from "react";
import StoreCard from "@/components/store/StoreCard";
import StoreMap from "@/components/map/StoreMap";
import type { Store } from "@/types/store";

interface SearchResultsProps {
  stores: (Store & { distance?: number })[];
  userLat?: number;
  userLng?: number;
}

export default function SearchResults({ stores, userLat, userLng }: SearchResultsProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [view, setView] = useState<"split" | "list" | "map">("split");

  const mapCenter: [number, number] | undefined =
    userLat != null && userLng != null ? [userLat, userLng] : undefined;

  return (
    <div>
      {/* View toggle (mobile) */}
      <div className="flex items-center gap-1.5 mb-4 lg:hidden">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === v
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {v === "list" ? "📋 List" : "🗺️ Map"}
          </button>
        ))}
      </div>

      {/* Desktop: split view / Mobile: toggle */}
      <div className="flex gap-6">
        {/* Store cards */}
        <div
          className={`flex-1 min-w-0 ${
            view === "map" ? "hidden lg:block" : ""
          }`}
        >
          {stores.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {stores.map((store) => (
                <div
                  key={store.id}
                  onMouseEnter={() => setSelectedStoreId(store.id)}
                  onMouseLeave={() => setSelectedStoreId(null)}
                >
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white px-8 py-16 text-center">
              <p className="text-4xl">🏔️</p>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No stores found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try adjusting your filters or search for a different location.
              </p>
            </div>
          )}
        </div>

        {/* Map */}
        <div
          className={`lg:w-[45%] lg:shrink-0 ${
            view === "list" ? "hidden lg:block" : ""
          } ${view === "map" ? "w-full" : ""}`}
        >
          <div className="sticky top-20 h-[calc(100vh-8rem)]">
            <StoreMap
              stores={stores}
              center={mapCenter}
              zoom={mapCenter ? 10 : 3}
              className="h-full w-full"
              selectedStoreId={selectedStoreId}
              onMarkerClick={(store) => {
                setSelectedStoreId(store.id);
                // Scroll card into view on desktop
                const card = document.getElementById(`store-${store.id}`);
                card?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
