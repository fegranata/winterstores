"use client";

import { useToast } from "@/components/ui/Toast";

interface ShareButtonProps {
  slug: string;
  name: string;
}

export default function ShareButton({ slug, name }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/store/${slug}`;
    const shareData = {
      title: `${name} — WinterStores`,
      text: `Check out ${name} on WinterStores`,
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard", "success");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="rounded-full p-1.5 transition-colors hover:bg-slate-100"
      aria-label="Share this store"
    >
      <svg
        className="h-5 w-5 text-slate-400 hover:text-slate-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
        />
      </svg>
    </button>
  );
}
