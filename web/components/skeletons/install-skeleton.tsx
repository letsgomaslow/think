import { Skeleton } from "@/components/ui/skeleton";

export function InstallSkeleton() {
  return (
    <section className="relative w-full bg-[hsl(var(--surface-dark))] overflow-hidden py-16 xs:py-18 sm:py-20 md:py-22 lg:py-24 px-4 xs:px-5 sm:px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--brand-primary)/0.03)] to-transparent" />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Skeleton
            variant="text"
            className="h-4 w-24 mx-auto mb-4 rounded"
          />
          <div className="mb-4 xs:mb-5 sm:mb-6 space-y-3 px-2 sm:px-0">
            <Skeleton
              variant="text"
              className="h-10 xs:h-12 sm:h-14 w-full max-w-md mx-auto"
            />
          </div>
          <Skeleton variant="text" className="h-6 w-full max-w-lg mx-auto" />
        </div>

        {/* Install Card */}
        <div className="relative">
          {/* Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 xs:p-7 sm:p-8 md:p-9 lg:p-10">
            {/* Terminal header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-green-500/80" />
              </div>
              <Skeleton variant="text" className="h-4 w-32" />
            </div>

            {/* URL display */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
              <Skeleton
                variant="rectangular"
                className="flex-1 h-12 xs:h-13 sm:h-14 rounded-lg"
              />
              <Skeleton
                variant="rectangular"
                className="h-10 xs:h-11 sm:h-10 w-full md:w-24 rounded-lg"
              />
            </div>

            {/* Quick setup hint */}
            <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <Skeleton variant="rectangular" className="w-5 h-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        </div>

        {/* Client compatibility */}
        <div className="mt-12 text-center">
          <Skeleton variant="text" className="h-4 w-48 mx-auto mb-6" />
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <Skeleton
                  variant="rectangular"
                  className="w-12 h-12 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-xl"
                />
                <Skeleton variant="text" className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Skeleton variant="text" className="h-5 w-80 max-w-full mx-auto" />
        </div>
      </div>
    </section>
  );
}

export default InstallSkeleton;
