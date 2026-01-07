import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Section Skeleton */}
      <section className="mb-12">
        {/* Title skeleton */}
        <Skeleton className="w-64 h-10 mb-4" />

        {/* Description skeleton */}
        <Skeleton className="w-96 max-w-full h-6 mb-2" />
        <Skeleton className="w-80 max-w-full h-6" />
      </section>

      {/* Stats Cards Skeleton */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6"
            >
              <Skeleton className="w-24 h-4 mb-3" />
              <Skeleton className="w-16 h-8 mb-2" />
              <Skeleton className="w-20 h-3" />
            </div>
          ))}
        </div>
      </section>

      {/* Chart Section Skeleton */}
      <section className="mb-12">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <Skeleton className="w-48 h-6 mb-6" />
          <Skeleton className="w-full h-64" />
        </div>
      </section>

      {/* Feedback List Section Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="w-40 h-6" />
          <div className="flex gap-3">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-32 h-10" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" className="w-8 h-8" />
                  <Skeleton className="w-24 h-5" />
                </div>
                <Skeleton className="w-28 h-4" />
              </div>
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
