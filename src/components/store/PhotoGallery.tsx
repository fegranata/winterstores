"use client";

import Image from "next/image";
import { useState } from "react";

interface PhotoGalleryProps {
  photos: string[];
  storeName: string;
}

export default function PhotoGallery({ photos, storeName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Main image */}
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image
          src={photos[selectedIndex]}
          alt={`${storeName} - Photo ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority={selectedIndex === 0}
        />
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selectedIndex
                  ? "border-blue-500"
                  : "border-transparent hover:border-slate-300"
              }`}
            >
              <Image
                src={photo}
                alt={`${storeName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
