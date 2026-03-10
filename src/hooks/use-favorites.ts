"use client";

import { useLocalStorage } from "./use-local-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    "ws-favorites",
    []
  );
  const [user, setUser] = useState<User | null>(null);
  const syncedRef = useRef(false);

  // Subscribe to auth state (same pattern as AuthStatus, UserMenu, ReviewForm)
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      // On sign-in, allow a fresh sync
      if (_event === "SIGNED_IN" && newUser) {
        syncedRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync localStorage favorites with DB when signed in
  useEffect(() => {
    if (!user || syncedRef.current) return;
    syncedRef.current = true;

    // Read current localStorage directly to avoid stale closure
    const currentLocal = (() => {
      try {
        const raw = window.localStorage.getItem("ws-favorites");
        return raw ? (JSON.parse(raw) as string[]) : [];
      } catch {
        return [];
      }
    })();

    fetch("/api/users/me/favorites/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: currentLocal }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.favorites) {
          setFavorites(data.favorites);
        }
      })
      .catch(() => {
        // Sync failed — localStorage remains as fallback
      });
  }, [user, setFavorites]);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (slug: string) => {
      const wasF = favorites.includes(slug);

      // Optimistically update localStorage immediately
      setFavorites((prev) =>
        prev.includes(slug)
          ? prev.filter((s) => s !== slug)
          : [...prev, slug]
      );

      // If signed in, also update DB (fire-and-forget)
      if (user) {
        const method = wasF ? "DELETE" : "POST";
        fetch("/api/users/me/favorites", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        }).catch(() => {
          // API failed — localStorage still has the change
        });
      }

      return !wasF;
    },
    [favorites, setFavorites, user]
  );

  return { favorites, isFavorite, toggleFavorite };
}
