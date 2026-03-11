"use client";

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
  reviews: Review[];
  loading: boolean;
}

export default function ReviewList({ reviews, loading }: ReviewListProps) {
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
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/50 p-8 text-center">
        <svg
          className="mx-auto h-10 w-10 text-blue-300 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
        <p className="text-sm font-medium text-slate-700">No reviews yet</p>
        <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
          Be the first to share your experience. Your review helps other
          winter sports enthusiasts find the right store.
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
