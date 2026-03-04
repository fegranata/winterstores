"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

interface ReviewSectionProps {
  storeId: string;
  storeSlug: string;
}

export default function ReviewSection({ storeId, storeSlug }: ReviewSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
      <ReviewForm
        storeId={storeId}
        storeSlug={storeSlug}
        onReviewSubmitted={() => setRefreshKey((k) => k + 1)}
      />
      <ReviewList storeId={storeId} refreshKey={refreshKey} />
    </div>
  );
}
