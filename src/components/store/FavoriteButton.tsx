"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/components/ui/Toast";

interface FavoriteButtonProps {
  slug: string;
  name: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({
  slug,
  name,
  size = "sm",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const favorited = isFavorite(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowFavorited = toggleFavorite(slug);
    toast(
      nowFavorited
        ? `Added ${name} to favorites`
        : `Removed ${name} from favorites`,
      nowFavorited ? "success" : "info"
    );
  };

  const sizeClass = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <button
      onClick={handleClick}
      className="group rounded-full p-1.5 transition-colors hover:bg-red-50"
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className={`${sizeClass} transition-colors ${
          favorited
            ? "fill-red-500 text-red-500"
            : "fill-none text-slate-400 group-hover:text-red-400"
        }`}
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
