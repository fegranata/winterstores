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

export default function AdSlot({
  slot,
  format = "banner",
  className = "",
}: AdSlotProps) {
  return (
    <div
      className={`mx-auto flex items-center justify-center ${FORMAT_STYLES[format]} ${className}`}
      data-ad-slot={slot}
      data-ad-format={format}
      aria-hidden="true"
    >
      {/* Ad network script will fill this container */}
      {/* In development, show a placeholder */}
      {process.env.NODE_ENV === "development" && (
        <div className="flex h-full w-full items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          Ad: {slot} ({format})
        </div>
      )}
    </div>
  );
}
