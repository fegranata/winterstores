import { StarIcon } from "@/components/ui/Icons";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
}: RatingStarsProps) {
  const starClass = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const valueSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  // A missing or non-numeric rating must not throw: this renders during static
  // generation, where one bad value would fail the entire build.
  const safeRating = Number.isFinite(rating) ? rating : 0;

  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating - fullStars >= 0.25 && safeRating - fullStars < 0.75;
  const fullRoundUp = safeRating - fullStars >= 0.75;
  const adjustedFull = fullRoundUp ? fullStars + 1 : fullStars;
  const emptyStars = maxRating - adjustedFull - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-px"
        role="img"
        aria-label={`Rated ${safeRating.toFixed(1)} out of ${maxRating}`}
      >
        {Array.from({ length: Math.max(0, adjustedFull) }).map((_, i) => (
          <StarIcon key={`full-${i}`} className={`${starClass} text-amber-400`} />
        ))}
        {hasHalf && (
          <span className={`relative inline-block ${starClass}`}>
            <StarIcon className={`absolute inset-0 ${starClass} text-slate-200`} />
            <span className="absolute inset-0 w-1/2 overflow-hidden">
              <StarIcon className={`${starClass} text-amber-400`} />
            </span>
          </span>
        )}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <StarIcon key={`empty-${i}`} className={`${starClass} text-slate-200`} />
        ))}
      </div>
      {showValue && (
        <span className={`font-semibold tabular-nums text-slate-800 ${valueSizeClass}`}>
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
