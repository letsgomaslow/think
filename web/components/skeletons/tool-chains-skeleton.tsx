import { Skeleton } from "@/components/ui/skeleton";

export function ToolChainsSkeleton() {
  return (
    <section className="py-16 xs:py-18 sm:py-20 md:py-22 lg:py-24 px-4 xs:px-5 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="mb-4">
            <Skeleton
              variant="rectangular"
              className="h-6 w-40 rounded-full mx-auto"
            />
          </div>

          {/* Heading */}
          <div className="mb-4 space-y-3 px-4 sm:px-0">
            <Skeleton
              variant="text"
              className="h-10 xs:h-12 sm:h-14 w-full max-w-2xl mx-auto"
            />
          </div>

          {/* Subtitle */}
          <Skeleton variant="text" className="h-6 w-full max-w-xl mx-auto" />
        </div>

        {/* Pattern Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              className="h-10 w-32 xs:w-40 sm:w-44 rounded-xl"
            />
          ))}
        </div>

        {/* Chain Visualization Container */}
        <div className="p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-2xl border border-slate-700/50 bg-slate-900/50 min-h-[300px]">
          {/* Icon and description */}
          <div className="flex items-start gap-4 mb-6">
            <Skeleton variant="rectangular" className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-6 w-48" />
              <Skeleton variant="text" className="h-5 w-full max-w-md" />
            </div>
          </div>

          {/* Tool flow placeholders */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton
                  variant="rectangular"
                  className="h-14 w-32 rounded-xl"
                />
                {index < 3 && (
                  <Skeleton variant="rectangular" className="w-4 h-4 rounded" />
                )}
              </div>
            ))}
          </div>

          {/* Outcome */}
          <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
        </div>

        {/* Pro tip */}
        <div className="mt-8 text-center">
          <Skeleton variant="text" className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </section>
  );
}

export default ToolChainsSkeleton;
