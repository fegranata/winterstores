"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Store } from "@/types/store";
import { SPORT_ICONS, SPORT_LABELS } from "@/types/store";
import { useEffect, useMemo } from "react";

// Fix default marker icons in Leaflet with webpack/next
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "selected-marker",
});

L.Marker.prototype.options.icon = defaultIcon;

interface StoreMapInnerProps {
  stores: (Store & { distance?: number })[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (store: Store) => void;
  selectedStoreId?: string | null;
}

function FitBounds({ stores }: { stores: Store[] }) {
  const map = useMap();
  useEffect(() => {
    if (stores.length === 0) return;
    if (stores.length === 1) {
      map.setView([stores[0].latitude, stores[0].longitude], 12);
      return;
    }
    const bounds = L.latLngBounds(
      stores.map((s) => [s.latitude, s.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [stores, map]);
  return null;
}

export default function StoreMapInner({
  stores,
  center,
  zoom = 3,
  className = "",
  onMarkerClick,
  selectedStoreId,
}: StoreMapInnerProps) {
  const defaultCenter = useMemo<[number, number]>(() => {
    if (center) return center;
    if (stores.length === 0) return [47, 10]; // Default: Central Europe
    const avgLat = stores.reduce((sum, s) => sum + s.latitude, 0) / stores.length;
    const avgLng = stores.reduce((sum, s) => sum + s.longitude, 0) / stores.length;
    return [avgLat, avgLng];
  }, [center, stores]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      className={`rounded-xl z-0 ${className}`}
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds stores={stores} />
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[store.latitude, store.longitude]}
          icon={store.id === selectedStoreId ? selectedIcon : defaultIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(store),
          }}
        >
          <Popup maxWidth={280} minWidth={200}>
            <div className="font-sans">
              <a
                href={`/store/${store.slug}`}
                className="text-sm font-semibold text-blue-700 hover:text-blue-900 no-underline"
              >
                {store.name}
              </a>
              <p className="text-xs text-slate-500 mt-0.5 mb-1">
                {store.city}, {store.country}
              </p>
              <div className="flex items-center gap-1 text-xs mb-1">
                <span className="text-amber-500">{"★".repeat(Math.round(store.winterstoresScore))}</span>
                <span className="font-semibold text-slate-700">{store.winterstoresScore.toFixed(1)}</span>
                <span className="text-slate-400">({store.totalReviewCount})</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {store.sportTypes.slice(0, 3).map((sport) => (
                  <span
                    key={sport}
                    className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
                  >
                    {SPORT_ICONS[sport]} {SPORT_LABELS[sport]}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{"$".repeat(store.priceLevel)}</span>
                {store.hasOnlineShop && (
                  <span className="text-green-600">🛒 Online Shop</span>
                )}
              </div>
              <a
                href={`/store/${store.slug}`}
                className="mt-2 block text-center rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white no-underline hover:bg-blue-700"
              >
                View Details
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
