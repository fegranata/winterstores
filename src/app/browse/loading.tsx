import { Skeleton } from "@/components/ui/Skeleton";

export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-80" />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
