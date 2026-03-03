"use client";

import Link from "next/link";
import type { Store } from "@/types/store";
import { SPORT_ICONS, SPORT_LABELS } from "@/types/store";
import { formatDistance } from "@/lib/geo";
import RatingStars from "./RatingStars";
import FavoriteButton from "./FavoriteButton";

interface StoreCardProps {
  store: Store & { distance?: number };
}

export default function StoreCard({ store }: StoreCardProps) {
  const priceDollars = "$".repeat(store.priceLevel);

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      {/* Favorite button */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton slug={store.slug} name={store.name} size="sm" />
      </div>

      <Link href={`/store/${store.slug}`} className="block">
        {/* Top row: name + verified */}
        <div className="flex items-start justify-between gap-2 pr-8">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {store.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500 truncate">
              {store.city}, {store.region}, {store.country}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {store.isVerified && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Rating + distance row */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <RatingStars rating={store.winterstoresScore} size="sm" />
          <span className="text-xs text-slate-400">
            ({store.totalReviewCount} reviews)
          </span>
          {store.distance != null && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {formatDistance(store.distance)}
            </span>
          )}
        </div>

        {/* Sport types */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {store.sportTypes.map((sport) => (
            <span
              key={sport}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {SPORT_ICONS[sport]} {SPORT_LABELS[sport]}
            </span>
          ))}
        </div>

        {/* Bottom row: price + online shop + services count */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{priceDollars}</span>
          {store.hasOnlineShop && (
            <span className="inline-flex items-center gap-1 text-green-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              Online Shop
            </span>
          )}
          <span>{store.services.length} services</span>
        </div>
      </Link>
    </div>
  );
}
