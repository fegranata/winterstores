"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  slot: string;
  format?: "banner" | "rectangle" | "leaderboard" | "sidebar";
  className?: string;
}

const FORMAT_STYLES: Record<string, string> = {
  banner: "h-[90px] w-full max-w-[728px]",
  rectangle: "h-[250px] w-[300px]",
  leaderboard: "h-[90px] w-full max-w-[970px]",
  sidebar: "h-[600px] w-[300px]",
};

// Map internal slot names to AdSense ad unit IDs
// These will be replaced with real IDs once AdSense is set up
const ADSENSE_UNITS: Record<string, string> = {
  "homepage-mid": "",
  "homepage-bottom": "",
  "search-results-bottom": "",
  "store-detail-content": "",
  "store-detail-sidebar": "",
  "browse-bottom": "",
  "browse-country-mid": "",
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export default function AdSlot({
  slot,
  format = "banner",
  className = "",
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Only push ads in production with a valid client ID and ad unit
    if (
      !ADSENSE_CLIENT ||
      !ADSENSE_UNITS[slot] ||
      pushed.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adsbygoogle = (window as any).adsbygoogle ?? [];
      adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or ad blocker
    }
  }, [slot]);

  // In development or when AdSense is not configured, show placeholder
  if (!ADSENSE_CLIENT || !ADSENSE_UNITS[slot]) {
    return (
      <div
        className={`mx-auto flex items-center justify-center ${FORMAT_STYLES[format]} ${className}`}
        data-ad-slot={slot}
        data-ad-format={format}
        aria-hidden="true"
      >
        {process.env.NODE_ENV === "development" && (
          <div className="flex h-full w-full items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
            Ad: {slot} ({format})
          </div>
        )}
      </div>
    );
  }

  // Production: render real AdSense ad unit
  return (
    <div
      ref={adRef}
      className={`mx-auto flex items-center justify-center ${FORMAT_STYLES[format]} ${className}`}
      aria-hidden="true"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_UNITS[slot]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
