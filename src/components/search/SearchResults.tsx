"use client";

import { useState } from "react";
import StoreCard from "@/components/store/StoreCard";
import StoreMap from "@/components/map/StoreMap";
import type { Store } from "@/types/store";
import { ListIcon, MapIcon, MountainIcon } from "@/components/ui/Icons";

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
      <div className="mb-4 flex items-center gap-1 rounded-full bg-slate-100 p-1 lg:hidden">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              view === v
                ? "bg-white text-ink-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-ink-900"
            }`}
          >
            {v === "list" ? <ListIcon className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            {v === "list" ? "List" : "Map"}
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
            <div className="card px-8 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <MountainIcon className="h-7 w-7" />
              </span>
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
          <div className="sticky top-24 h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
