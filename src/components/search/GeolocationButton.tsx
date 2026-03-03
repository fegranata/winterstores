"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export default function GeolocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = searchParams.has("lat") && searchParams.has("lng");

  const handleClick = () => {
    if (isActive) {
      // Remove geolocation
      const params = new URLSearchParams(searchParams.toString());
      params.delete("lat");
      params.delete("lng");
      if (params.get("sort") === "closest") params.delete("sort");
      router.push(`/search?${params.toString()}`);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        toast("Location found — sorting by distance", "success");
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", position.coords.latitude.toFixed(6));
        params.set("lng", position.coords.longitude.toFixed(6));
        params.set("sort", "closest");
        router.push(`/search?${params.toString()}`);
      },
      (err) => {
        setLoading(false);
        let msg = "Could not get location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = "Location access denied";
            break;
          case err.POSITION_UNAVAILABLE:
            msg = "Location unavailable";
            break;
        }
        setError(msg);
        toast(msg, "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
          isActive
            ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        } ${loading ? "opacity-60 cursor-wait" : ""}`}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        )}
        {isActive ? "Near me ✓" : "Use my location"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
