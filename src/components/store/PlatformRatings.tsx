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
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
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
    bgTint: "bg-blue-50/50",
    borderTint: "border-blue-100",
    linkColor: "text-blue-600 hover:text-blue-800",
  },
  facebook: {
    name: "Facebook",
    logo: "/images/facebook-logo.svg",
    linkText: "View on Facebook",
    bgTint: "bg-[#1877F2]/5",
    borderTint: "border-[#1877F2]/15",
    linkColor: "text-[#1877F2] hover:text-[#1565C0]",
  },
  foursquare: {
    name: "Foursquare",
    logo: "/images/foursquare-logo.svg",
    linkText: "View on Foursquare",
    bgTint: "bg-[#E95B8B]/5",
    borderTint: "border-[#E95B8B]/15",
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
    <div className={`${config.bgTint} rounded-xl border ${config.borderTint} p-5 flex flex-col gap-2`}>
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
          className={`text-sm ${config.linkColor} hover:underline mt-1`}
        >
          {config.linkText} &rarr;
        </a>
      )}
    </div>
  );
}
