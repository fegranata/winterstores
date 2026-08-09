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
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
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
    <div className="flex items-center gap-1">
      <div className={`flex ${sizeClass}`}>
        {Array.from({ length: adjustedFull }).map((_, i) => (
          <span key={`full-${i}`} className="text-amber-400">★</span>
        ))}
        {hasHalf && <span className="text-amber-400">★</span>}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <span key={`empty-${i}`} className="text-slate-300">★</span>
        ))}
      </div>
      {showValue && (
        <span className={`font-semibold text-slate-700 ${valueSizeClass}`}>
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
