"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function RecentlyViewedTracker({ slug }: { slug: string }) {
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    addRecentlyViewed(slug);
  }, [slug, addRecentlyViewed]);

  return null;
}
