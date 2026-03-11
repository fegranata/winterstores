"use client";

interface ReviewDistributionProps {
  reviews: { rating: number }[];
}

export default function ReviewDistribution({ reviews }: ReviewDistributionProps) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="space-y-2">
        {distribution.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="w-8 text-right text-slate-600 font-medium">
              {star} <span className="text-amber-400">&#9733;</span>
            </span>
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 text-slate-500 text-xs">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
