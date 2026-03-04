"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import RatingStars from "./RatingStars";

type PlatformName = "google" | "yelp" | "facebook" | "foursquare";

interface PlatformRating {
  platform: PlatformName;
  rating: number;
  reviewCount: number;
  platformUrl: string;
}

type RatingsData = Record<PlatformName, PlatformRating | null>;

const PLATFORM_ORDER: PlatformName[] = [
  "google",
  "yelp",
  "facebook",
  "foursquare",
];

export default function PlatformRatings({ slug }: { slug: string }) {
  const [data, setData] = useState<RatingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stores/${slug}/ratings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse"
          >
            <div className="h-6 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Only show platforms that have data
  const availablePlatforms = PLATFORM_ORDER.filter(
    (p) => data[p] != null
  );

  if (availablePlatforms.length === 0) return null;

  // Dynamic grid: 1 col on mobile, 2 on sm, up to 4 on lg if enough platforms
  const gridCols =
    availablePlatforms.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : availablePlatforms.length === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
      {availablePlatforms.map((platform) => {
        const rating = data[platform]!;
        return (
          <PlatformCard
            key={platform}
            platform={platform}
            rating={rating.rating}
            reviewCount={rating.reviewCount}
            url={rating.platformUrl}
          />
        );
      })}
    </div>
  );
}

const PLATFORM_CONFIG: Record<
  PlatformName,
  { name: string; logo: string; linkText: string }
> = {
  google: {
    name: "Google",
    logo: "/images/google-logo.svg",
    linkText: "View on Google Maps",
  },
  yelp: {
    name: "Yelp",
    logo: "/images/yelp-logo.svg",
    linkText: "View on Yelp",
  },
  facebook: {
    name: "Facebook",
    logo: "/images/facebook-logo.svg",
    linkText: "View on Facebook",
  },
  foursquare: {
    name: "Foursquare",
    logo: "/images/foursquare-logo.svg",
    linkText: "View on Foursquare",
  },
};

function PlatformCard({
  platform,
  rating,
  reviewCount,
  url,
}: {
  platform: PlatformName;
  rating: number;
  reviewCount: number;
  url: string;
}) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Image
          src={config.logo}
          alt={`${config.name} logo`}
          width={20}
          height={20}
          className="flex-shrink-0"
        />
        <span className="font-semibold text-slate-800">{config.name}</span>
      </div>
      <RatingStars rating={rating} size="md" />
      <p className="text-sm text-slate-500">
        {reviewCount.toLocaleString()} review{reviewCount !== 1 ? "s" : ""}
      </p>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1"
        >
          {config.linkText} &rarr;
        </a>
      )}
    </div>
  );
}
