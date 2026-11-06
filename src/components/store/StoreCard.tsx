"use client";

import Link from "next/link";
import type { Store } from "@/types/store";
import { SPORT_LABELS, SERVICE_LABELS } from "@/types/store";
import { formatDistance } from "@/lib/geo";
import RatingStars from "./RatingStars";
import FavoriteButton from "./FavoriteButton";
import {
  MapPinIcon,
  NavigationIcon,
  ServiceIcon,
  ShoppingBagIcon,
  SportIcon,
  VerifiedIcon,
} from "@/components/ui/Icons";

interface StoreCardProps {
  store: Store & { distance?: number };
  /**
   * Overrides the distance badge text (resort pages show distance from the
   * resort with one decimal, e.g. "4.2km").
   */
  distanceLabel?: string;
  /** Shows a rank medal before the name (best-ski-shops podium). */
  rank?: number;
}

export default function StoreCard({ store, distanceLabel, rank }: StoreCardProps) {
  const priceDollars = "$".repeat(store.priceLevel);
  const score = Number.isFinite(store.winterstoresScore) ? store.winterstoresScore : 0;
  const distanceText =
    distanceLabel ?? (store.distance != null ? formatDistance(store.distance) : null);

  return (
    <div
      id={`store-${store.id}`}
      className="group relative flex h-full flex-col card card-hover"
    >
      {/* Favorite button */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton slug={store.slug} name={store.name} size="sm" />
      </div>

      <Link href={`/store/${store.slug}`} className="flex h-full flex-col rounded-[inherit] p-5">
        {/* Name + place */}
        <div className="flex items-start gap-3 pr-8">
          {rank != null && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-glow-500 font-display text-sm font-semibold text-white shadow-sm ring-4 ring-glow-100">
              #{rank}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-blue-700">
              {store.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">
                {[store.city, store.region, store.country]
                  .filter((part) => part && part.trim())
                  .join(", ")}
              </span>
            </p>
          </div>
        </div>

        {/* Score + evidence + distance */}
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-10 min-w-[2.75rem] items-center justify-center rounded-xl bg-ink-900 px-2 font-display text-lg font-semibold tabular-nums text-white">
            {score.toFixed(1)}
          </span>
          <div className="min-w-0">
            <RatingStars rating={store.winterstoresScore} size="sm" showValue={false} />
            <span className="mt-0.5 block text-xs text-slate-500">
              ({store.totalReviewCount} reviews)
            </span>
          </div>
          <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
            {distanceText && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <NavigationIcon className="h-3 w-3" />
                {distanceText}
              </span>
            )}
            {store.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <VerifiedIcon className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Sport types */}
        {store.sportTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {store.sportTypes.map((sport) => (
              <span
                key={sport}
                className="inline-flex items-center gap-1 rounded-md bg-blue-50/70 px-2 py-1 text-xs font-medium text-blue-800"
              >
                <SportIcon sport={sport} className="h-3.5 w-3.5" />
                {SPORT_LABELS[sport]}
              </span>
            ))}
          </div>
        )}

        {/* Services as compact chips */}
        {store.services.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {store.services.map((service) => (
              <span
                key={service}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
              >
                <ServiceIcon service={service} className="h-3.5 w-3.5 text-slate-500" />
                {SERVICE_LABELS[service]}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row: price + online shop + services count */}
        <div className="min-h-4 flex-1" aria-hidden="true" />
        <div className="flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="font-semibold tracking-wide text-slate-800">{priceDollars}</span>
          {store.hasOnlineShop && (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <ShoppingBagIcon className="h-3.5 w-3.5" />
              Online Shop
            </span>
          )}
          <span className="ml-auto">
            {store.services.length} service{store.services.length !== 1 && "s"}
          </span>
        </div>
      </Link>
    </div>
  );
}
