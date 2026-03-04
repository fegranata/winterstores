"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserReview {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  date: string;
  createdAt: string;
  storeName: string;
  storeSlug: string;
  storeCity: string;
  storeCountry: string;
}

export default function UserReviews() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me/reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">My Reviews</h2>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        My Reviews ({reviews.length})
      </h2>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-3xl mb-3">📝</p>
          <p className="font-medium text-slate-700">No reviews yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Share your experience with winter sport stores.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Browse Stores
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/store/${review.storeSlug}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {review.storeName}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {review.storeCity}, {review.storeCountry}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating
                          ? "text-amber-400"
                          : "text-slate-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {review.title && (
                <p className="mt-2 font-medium text-sm text-slate-800">
                  {review.title}
                </p>
              )}
              {review.text && (
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {review.text}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
