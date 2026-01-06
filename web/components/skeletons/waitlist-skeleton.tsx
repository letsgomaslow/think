import { Skeleton } from "@/components/ui/skeleton";

export function WaitlistSkeleton() {
  return (
    <section className="relative bg-gradient-to-b from-[hsl(var(--surface-dark))] via-[#0a1224] to-[hsl(var(--surface-dark))] overflow-hidden py-16 xs:py-18 sm:py-20 md:py-24 lg:py-28 xl:py-32">
      {/* Gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--brand-primary)/0.1)] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--brand-accent)/0.1)] rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10 px-4 xs:px-5 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 xs:mb-14 sm:mb-16 md:mb-18">
            <Skeleton
              variant="rectangular"
              className="h-7 w-32 rounded-full mx-auto mb-6"
            />

            <div className="mb-4 xs:mb-5 sm:mb-6 space-y-3 px-4 sm:px-0">
              <Skeleton
                variant="text"
                className="h-10 xs:h-12 sm:h-14 md:h-16 w-full max-w-2xl mx-auto"
              />
            </div>

            <div className="space-y-2 px-4 sm:px-0">
              <Skeleton
                variant="text"
                className="h-6 sm:h-7 w-full max-w-2xl mx-auto"
              />
              <Skeleton
                variant="text"
                className="h-6 sm:h-7 w-4/5 max-w-xl mx-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xs:gap-10 sm:gap-12 md:gap-14 lg:gap-16 items-start">
            {/* Left: Features */}
            <div className="space-y-6">
              <Skeleton variant="text" className="h-8 w-48 mb-8" />

              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton
                    variant="rectangular"
                    className="flex-shrink-0 w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-6 w-40" />
                    <Skeleton variant="text" className="h-4 w-full" />
                  </div>
                </div>
              ))}

              {/* Free MCP callout */}
              <div className="mt-10 p-6 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-4/5" />
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:sticky lg:top-8">
              <div className="p-6 xs:p-7 sm:p-8 md:p-9 lg:p-10 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm shadow-2xl space-y-6">
                {/* Form fields placeholders */}
                <div className="space-y-4">
                  <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
                  <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
                  <Skeleton variant="rectangular" className="h-32 w-full rounded-lg" />
                </div>
                <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WaitlistSkeleton;
