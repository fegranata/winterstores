"use client";

import { useEffect, useRef, useState } from "react";
import type { Store } from "@/types/store";

interface StoreMapProps {
  stores: (Store & { distance?: number })[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (store: Store) => void;
  selectedStoreId?: string | null;
}

export default function StoreMap({
  stores,
  center,
  zoom = 3,
  className = "",
  onMarkerClick,
  selectedStoreId,
}: StoreMapProps) {
  const [MapComponent, setMapComponent] =
    useState<React.ComponentType<StoreMapProps> | null>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (MapComponent) return;

    // Leaflet plus its CSS is the largest chunk on the search page, and on
    // mobile the map container is hidden entirely while the list view is
    // active. Importing on mount downloaded all of it for something nobody
    // could see. A hidden element never intersects, so gating on visibility
    // defers the cost until the user actually switches to the map.
    const load = () => {
      import("./StoreMapInner").then((mod) => setMapComponent(() => mod.default));
    };

    if (typeof IntersectionObserver === "undefined") {
      load();
      return;
    }

    const node = placeholderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      // Start fetching slightly before it scrolls into view so the map is
      // usually ready by the time it lands.
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [MapComponent]);

  if (!MapComponent) {
    return (
      <div
        ref={placeholderRef}
        className={`flex items-center justify-center bg-slate-100 rounded-xl ${className}`}
      >
        <div className="text-sm text-slate-400 animate-pulse">Loading map…</div>
      </div>
    );
  }

  return (
    <MapComponent
      stores={stores}
      center={center}
      zoom={zoom}
      className={className}
      onMarkerClick={onMarkerClick}
      selectedStoreId={selectedStoreId}
    />
  );
}
