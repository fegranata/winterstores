import { SearchResultsSkeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 h-11 w-full max-w-xl animate-pulse rounded-full bg-slate-200" />
      <div className="flex gap-6">
        <div className="hidden lg:block w-56 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-slate-200" />
          <SearchResultsSkeleton />
        </div>
      </div>
    </div>
  );
}
