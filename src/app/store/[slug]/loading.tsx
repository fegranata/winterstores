import { Skeleton } from "@/components/ui/Skeleton";

export default function StoreLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>

          {/* Rating card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>

          {/* About */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
