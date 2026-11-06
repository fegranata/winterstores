import Image from "next/image";
import RatingStars from "./RatingStars";

type PlatformName = "google" | "facebook" | "foursquare";

interface PlatformRating {
  platform: string;
  rating: number;
  reviewCount: number;
  platformUrl: string;
}

type RatingsData = Record<string, PlatformRating | null>;

const PLATFORM_ORDER: PlatformName[] = [
  "google",
  "facebook",
  "foursquare",
];

export default function PlatformRatings({ ratings }: { ratings: RatingsData }) {
  // Only show platforms that have data
  const availablePlatforms = PLATFORM_ORDER.filter(
    (p) => ratings[p] != null
  );

  if (availablePlatforms.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
        <p className="text-sm text-slate-500">
          Platform ratings will appear here once available
        </p>
      </div>
    );
  }

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
        const rating = ratings[platform]!;
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
  { name: string; logo: string; linkText: string; bgTint: string; borderTint: string; linkColor: string }
> = {
  google: {
    name: "Google",
    logo: "/images/google-logo.svg",
    linkText: "View on Google Maps",
    bgTint: "bg-blue-50",
    borderTint: "hover:border-blue-200",
    linkColor: "text-blue-700 hover:text-blue-900",
  },
  facebook: {
    name: "Facebook",
    logo: "/images/facebook-logo.svg",
    linkText: "View on Facebook",
    bgTint: "bg-[#1877F2]/10",
    borderTint: "hover:border-[#1877F2]/30",
    linkColor: "text-[#1877F2] hover:text-[#1565C0]",
  },
  foursquare: {
    name: "Foursquare",
    logo: "/images/foursquare-logo.svg",
    linkText: "View on Foursquare",
    bgTint: "bg-[#E95B8B]/10",
    borderTint: "hover:border-[#E95B8B]/30",
    linkColor: "text-[#E95B8B] hover:text-[#D14476]",
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
    <div className={`card ${config.borderTint} p-5 flex flex-col gap-2.5`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgTint}`}>
        <Image
          src={config.logo}
          alt={`${config.name} logo`}
          width={20}
          height={20}
          className="flex-shrink-0"
        />
        </span>
        <span className="font-semibold text-ink-900">{config.name}</span>
      </div>
      <RatingStars rating={rating} size="lg" />
      <p className="text-sm text-slate-500">
        {reviewCount.toLocaleString()} review{reviewCount !== 1 ? "s" : ""}
      </p>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-auto pt-1 text-sm font-medium ${config.linkColor} hover:underline underline-offset-4`}
        >
          {config.linkText} &rarr;
        </a>
      )}
    </div>
  );
}
