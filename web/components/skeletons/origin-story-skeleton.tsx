import { Skeleton } from "@/components/ui/skeleton";

export function OriginStorySkeleton() {
  return (
    <section className="relative w-full bg-[hsl(var(--surface-dark))] py-16 xs:py-18 sm:py-20 md:py-22 lg:py-24 px-4 xs:px-5 sm:px-6 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 xs:mb-14 sm:mb-16">
          <Skeleton variant="text" className="h-4 w-20 mx-auto mb-4 rounded" />
          <div className="mb-4 xs:mb-5 sm:mb-6 space-y-3 px-4 sm:px-0">
            <Skeleton
              variant="text"
              className="h-10 xs:h-12 sm:h-14 w-full max-w-2xl mx-auto"
            />
            <Skeleton
              variant="text"
              className="h-10 xs:h-12 sm:h-14 w-3/4 max-w-xl mx-auto"
            />
          </div>
        </div>

        {/* Story Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 xs:left-5.5 sm:left-6 md:left-7 lg:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700" />

          {/* Story beats */}
          <div className="space-y-10 xs:space-y-12 md:space-y-14 lg:space-y-16">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="relative flex items-start gap-6 pl-0 md:pl-0"
              >
                {/* Icon node */}
                <Skeleton
                  variant="circular"
                  className="relative z-10 flex-shrink-0 w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12"
                />

                {/* Content card */}
                <div className="flex-1 max-w-2xl space-y-2">
                  <Skeleton
                    variant="text"
                    className="h-6 xs:h-7 md:h-8 w-48"
                  />
                  <Skeleton variant="text" className="h-4 xs:h-5 md:h-6 w-full" />
                  <Skeleton
                    variant="text"
                    className="h-4 xs:h-5 md:h-6 w-5/6"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing statement */}
        <div className="mt-16 xs:mt-18 sm:mt-20 text-center">
          <div className="inline-block p-6 xs:p-7 sm:p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <div className="space-y-3 mb-4">
              <Skeleton variant="text" className="h-6 xs:h-7 w-full max-w-lg" />
              <Skeleton variant="text" className="h-6 xs:h-7 w-4/5 max-w-md mx-auto" />
            </div>
            <Skeleton variant="text" className="h-4 w-40 mx-auto" />
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-10 xs:mt-11 sm:mt-12 text-center">
          <Skeleton
            variant="rectangular"
            className="h-12 xs:h-13 sm:h-14 w-full sm:w-64 max-w-xs mx-auto rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}

export default OriginStorySkeleton;
