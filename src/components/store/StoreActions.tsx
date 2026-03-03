"use client";

import FavoriteButton from "./FavoriteButton";
import ShareButton from "./ShareButton";

interface StoreActionsProps {
  slug: string;
  name: string;
}

export default function StoreActions({ slug, name }: StoreActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <FavoriteButton slug={slug} name={name} size="md" />
      <ShareButton slug={slug} name={name} />
    </div>
  );
}
