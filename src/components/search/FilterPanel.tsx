"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SPORT_LABELS, SERVICE_LABELS } from "@/types/store";
import { ServiceIcon, ShoppingBagIcon, SportIcon, StarIcon } from "@/components/ui/Icons";
import type { SportType, ServiceType } from "@/types/store";

const SPORT_OPTIONS = Object.entries(SPORT_LABELS) as [SportType, string][];
const SERVICE_OPTIONS = Object.entries(SERVICE_LABELS) as [ServiceType, string][];

export default function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSports = searchParams.getAll("sport") as SportType[];
  const activeServices = searchParams.getAll("service") as ServiceType[];
  const activeOnlineShop = searchParams.get("hasOnlineShop");
  const activeMinRating = searchParams.get("minRating");
  const activePriceLevel = searchParams.get("priceLevel");

  const updateParams = useCallback(
    (key: string, value: string | null, multi?: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (multi) {
        const existing = params.getAll(key);
        if (value && existing.includes(value)) {
          // Remove this value
          params.delete(key);
          existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
        } else if (value) {
          params.append(key, value);
        }
      } else {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset page when filters change
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => {
    const q = searchParams.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`/search?${params.toString()}`);
  };

  const hasFilters =
    activeSports.length > 0 ||
    activeServices.length > 0 ||
    activeOnlineShop !== null ||
    activeMinRating !== null ||
    activePriceLevel !== null;

  return (
    <div className="space-y-6 [&>div+div]:border-t [&>div+div]:border-slate-100 [&>div+div]:pt-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sport Type */}
      <div>
        <h3 className="eyebrow text-slate-500 mb-3">
          Sport Type
        </h3>
        <div className="space-y-2">
          {SPORT_OPTIONS.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeSports.includes(key)}
                onChange={() => updateParams("sport", key, true)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="inline-flex items-center gap-2 text-sm text-slate-700 group-hover:text-ink-900 transition-colors">
                <SportIcon sport={key} className="h-4 w-4 text-slate-400" />
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Online Shop */}
      <div>
        <h3 className="eyebrow text-slate-500 mb-3">
          Online Shop
        </h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={activeOnlineShop === "true"}
            onChange={() =>
              updateParams("hasOnlineShop", activeOnlineShop === "true" ? null : "true")
            }
            className="h-4 w-4 rounded border-slate-300 accent-blue-600"
          />
          <span className="inline-flex items-center gap-2 text-sm text-slate-700 group-hover:text-ink-900 transition-colors">
            <ShoppingBagIcon className="h-4 w-4 text-slate-400" />
            Has online shop
          </span>
        </label>
      </div>

      {/* Min Rating */}
      <div>
        <h3 className="eyebrow text-slate-500 mb-3">
          Minimum Rating
        </h3>
        <div className="flex gap-1.5">
          {[3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() =>
                updateParams("minRating", activeMinRating === String(r) ? null : String(r))
              }
              aria-pressed={activeMinRating === String(r)}
              aria-label={`${r}+ stars`}
              className={`inline-flex items-center gap-0.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeMinRating === String(r)
                  ? "bg-ink-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {r}+
              <StarIcon className="h-3 w-3 text-amber-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Price Level */}
      <div>
        <h3 className="eyebrow text-slate-500 mb-3">
          Price Level
        </h3>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() =>
                updateParams("priceLevel", activePriceLevel === String(p) ? null : String(p))
              }
              aria-pressed={activePriceLevel === String(p)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                activePriceLevel === String(p)
                  ? "bg-ink-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {"$".repeat(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <h3 className="eyebrow text-slate-500 mb-3">
          Services
        </h3>
        <div className="space-y-2">
          {SERVICE_OPTIONS.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeServices.includes(key)}
                onChange={() => updateParams("service", key, true)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="inline-flex items-center gap-2 text-sm text-slate-700 group-hover:text-ink-900 transition-colors">
                <ServiceIcon service={key} className="h-4 w-4 text-slate-400" />
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
