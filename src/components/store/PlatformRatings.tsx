"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import RatingStars from "./RatingStars";

interface PlatformRating {
  platform: "google" | "yelp";
  rating: number;
  reviewCount: number;
  platformUrl: string;
}

interface RatingsData {
  google: PlatformRating | null;
  yelp: PlatformRating | null;
}

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

  if (!data || (!data.google && !data.yelp)) {
    return null; // No platform data available — hide section
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.google && (
        <PlatformCard
          platform="google"
          rating={data.google.rating}
          reviewCount={data.google.reviewCount}
          url={data.google.platformUrl}
        />
      )}
      {data.yelp && (
        <PlatformCard
          platform="yelp"
          rating={data.yelp.rating}
          reviewCount={data.yelp.reviewCount}
          url={data.yelp.platformUrl}
        />
      )}
    </div>
  );
}

function PlatformCard({
  platform,
  rating,
  reviewCount,
  url,
}: {
  platform: "google" | "yelp";
  rating: number;
  reviewCount: number;
  url: string;
}) {
  const config = {
    google: {
      name: "Google",
      logo: "/images/google-logo.svg",
      linkText: "View on Google Maps",
      bg: "bg-white",
    },
    yelp: {
      name: "Yelp",
      logo: "/images/yelp-logo.svg",
      linkText: "View on Yelp",
      bg: "bg-white",
    },
  }[platform];

  return (
    <div
      className={`${config.bg} rounded-xl border border-slate-200 p-5 flex flex-col gap-2`}
    >
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
