"use client";

import { useState, useEffect, useCallback } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import ReviewDistribution from "./ReviewDistribution";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  text: string;
  date: string;
  source: string;
}

interface ReviewSectionProps {
  storeId: string;
  storeSlug: string;
  initialReviews?: Review[];
}

export default function ReviewSection({ storeId, storeSlug, initialReviews }: ReviewSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(initialReviews ?? []);
  const [loading, setLoading] = useState(!initialReviews);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    fetch(`/api/reviews?storeId=${storeId}`)
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    // Skip the initial fetch when server-provided data exists;
    // only refetch after a new review is submitted (refreshKey > 0)
    if (initialReviews && refreshKey === 0) return;
    fetchReviews();
  }, [fetchReviews, refreshKey, initialReviews]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
      {!loading && reviews.length > 0 && (
        <ReviewDistribution reviews={reviews} />
      )}
      <ReviewForm
        storeId={storeId}
        storeSlug={storeSlug}
        onReviewSubmitted={() => setRefreshKey((k) => k + 1)}
      />
      <ReviewList reviews={reviews} loading={loading} />
    </div>
  );
}
