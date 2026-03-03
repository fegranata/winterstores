"use client";

import { useLocalStorage } from "./use-local-storage";
import { useCallback } from "react";

const MAX_RECENT = 10;

export function useRecentlyViewed() {
  const [recent, setRecent] = useLocalStorage<string[]>("ws-recent", []);

  const addRecentlyViewed = useCallback(
    (slug: string) => {
      setRecent((prev) => {
        const filtered = prev.filter((s) => s !== slug);
        return [slug, ...filtered].slice(0, MAX_RECENT);
      });
    },
    [setRecent]
  );

  return { recentSlugs: recent, addRecentlyViewed };
}
