"use client";

import { useLocalStorage } from "./use-local-storage";
import { useCallback } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    "ws-favorites",
    []
  );

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (slug: string) => {
      const wasF = favorites.includes(slug);
      setFavorites((prev) =>
        prev.includes(slug)
          ? prev.filter((s) => s !== slug)
          : [...prev, slug]
      );
      return !wasF;
    },
    [favorites, setFavorites]
  );

  return { favorites, isFavorite, toggleFavorite };
}
