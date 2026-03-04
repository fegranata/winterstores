"use client";

import { useEffect, useState, useCallback } from "react";
import RatingStars from "./RatingStars";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  text: string;
  date: string;
  source: string;
}

interface ReviewListProps {
  storeId: string;
  refreshKey?: number;
}

export default function ReviewList({ storeId, refreshKey }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    fetch(`/api/reviews?storeId=${storeId}`)
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
            <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-full bg-slate-200 rounded mb-1" />
            <div className="h-3 w-3/4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-500">
          No reviews yet. Be the first to review this store!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 text-sm">
                  {review.authorName}
                </span>
                {review.source !== "winterstores" && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    via {review.source}
                  </span>
                )}
              </div>
              {review.title && (
                <p className="font-medium text-slate-800 mt-1">
                  {review.title}
                </p>
              )}
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </div>
          {review.text && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {review.text}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">{review.date}</p>
        </div>
      ))}
    </div>
  );
}
