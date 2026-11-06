"use client";

import { StarIcon } from "@/components/ui/Icons";

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
    <div className="card p-5">
      <div className="space-y-2">
        {distribution.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="flex w-8 items-center justify-end gap-0.5 text-slate-600 font-medium">
              {star} <StarIcon className="h-3.5 w-3.5 text-amber-400" />
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
