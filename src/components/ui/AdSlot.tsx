"use client";

import { useEffect, useRef } from "react";
import {
  AD_PROVIDER,
  ADSENSE_CLIENT,
  MEDIANET_CID,
  CARBON_SERVE,
  CARBON_PLACEMENT,
} from "@/lib/ad-config";

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

// ── AdSense slot → ad unit ID mapping ────────────────────────
const ADSENSE_UNITS: Record<string, string> = {
  "homepage-mid": "",
  "homepage-bottom": "",
  "search-results-bottom": "",
  "store-detail-content": "",
  "store-detail-sidebar": "",
  "browse-bottom": "",
  "browse-country-mid": "",
};

// ── Media.net slot → widget ID mapping ───────────────────────
const MEDIANET_UNITS: Record<string, string> = {
  "homepage-mid": "",
  "homepage-bottom": "",
  "search-results-bottom": "",
  "store-detail-content": "",
  "store-detail-sidebar": "",
  "browse-bottom": "",
  "browse-country-mid": "",
};

// ── Ezoic slot → placeholder ID mapping ─────────────────────
const EZOIC_UNITS: Record<string, number> = {
  "homepage-mid": 101,
  "homepage-bottom": 102,
  "search-results-bottom": 103,
  "store-detail-content": 104,
  "store-detail-sidebar": 105,
  "browse-bottom": 106,
  "browse-country-mid": 107,
};

export default function AdSlot({
  slot,
  format = "banner",
  className = "",
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || typeof window === "undefined") return;

    if (AD_PROVIDER === "adsense" && ADSENSE_CLIENT && ADSENSE_UNITS[slot]) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adsbygoogle = (window as any).adsbygoogle ?? [];
        adsbygoogle.push({});
        pushed.current = true;
      } catch {
        // AdSense not loaded or ad blocker
      }
    }

    if (AD_PROVIDER === "medianet" && MEDIANET_CID && MEDIANET_UNITS[slot]) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mNHandle = (window as any)._mNHandle;
        if (mNHandle?.queue) {
          mNHandle.queue.push({});
          pushed.current = true;
        }
      } catch {
        // Media.net not loaded
      }
    }

    if (AD_PROVIDER === "carbon" && CARBON_SERVE && adRef.current && !pushed.current) {
      const script = document.createElement("script");
      script.src = `//cdn.carbonads.com/carbon.js?serve=${CARBON_SERVE}&placement=${CARBON_PLACEMENT}`;
      script.id = "_carbonads_js";
      script.async = true;
      adRef.current.appendChild(script);
      pushed.current = true;
    }
    // Ezoic auto-detects placeholders — no push needed
  }, [slot]);

  const containerClass = `mx-auto flex items-center justify-center ${FORMAT_STYLES[format]} ${className}`;

  // ── No provider configured or dev mode → placeholder ───────
  if (AD_PROVIDER === "none") {
    return (
      <div className={containerClass} data-ad-slot={slot} data-ad-format={format} aria-hidden="true">
        {process.env.NODE_ENV === "development" && (
          <div className="flex h-full w-full items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
            Ad: {slot} ({format})
          </div>
        )}
      </div>
    );
  }

  // ── AdSense ────────────────────────────────────────────────
  if (AD_PROVIDER === "adsense") {
    if (!ADSENSE_CLIENT || !ADSENSE_UNITS[slot]) {
      return <div className={containerClass} aria-hidden="true" />;
    }
    return (
      <div ref={adRef} className={containerClass} aria-hidden="true">
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

  // ── Media.net ──────────────────────────────────────────────
  if (AD_PROVIDER === "medianet") {
    if (!MEDIANET_CID || !MEDIANET_UNITS[slot]) {
      return <div className={containerClass} aria-hidden="true" />;
    }
    return (
      <div ref={adRef} className={containerClass} aria-hidden="true">
        <div id={`medianet_${MEDIANET_UNITS[slot]}`} data-cid={MEDIANET_CID} />
      </div>
    );
  }

  // ── Ezoic ──────────────────────────────────────────────────
  if (AD_PROVIDER === "ezoic") {
    const placeholderId = EZOIC_UNITS[slot];
    if (!placeholderId) {
      return <div className={containerClass} aria-hidden="true" />;
    }
    return (
      <div className={containerClass} aria-hidden="true">
        <div id={`ezoic-pub-ad-placeholder-${placeholderId}`} />
      </div>
    );
  }

  // ── Carbon Ads ─────────────────────────────────────────────
  if (AD_PROVIDER === "carbon") {
    if (!CARBON_SERVE) {
      return <div className={containerClass} aria-hidden="true" />;
    }
    return <div ref={adRef} className={containerClass} aria-hidden="true" />;
  }

  return null;
}
