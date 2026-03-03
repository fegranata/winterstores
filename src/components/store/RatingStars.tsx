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

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const fullRoundUp = rating - fullStars >= 0.75;
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
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
