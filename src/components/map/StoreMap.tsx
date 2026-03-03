"use client";

import { useEffect, useState } from "react";
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
  const [MapComponent, setMapComponent] = useState<React.ComponentType<StoreMapProps> | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues with Leaflet
    import("./StoreMapInner").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-xl ${className}`}>
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
