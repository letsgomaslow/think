import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black min-h-[500px] xs:min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px]">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-[hsl(var(--surface-dark))]" />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10">
        {/* Badge Placeholder */}
        <div className="mb-6">
          <Skeleton
            variant="rectangular"
            className="h-7 w-32 rounded-full mx-auto"
          />
        </div>

        {/* Main Headline Placeholder - 2 lines */}
        <div className="mb-4 sm:mb-6 max-w-4xl w-full px-2 sm:px-0 space-y-3">
          <Skeleton
            variant="text"
            className="h-10 xs:h-12 sm:h-14 md:h-16 lg:h-20 w-full max-w-3xl mx-auto"
          />
          <Skeleton
            variant="text"
            className="h-10 xs:h-12 sm:h-14 md:h-16 lg:h-20 w-4/5 max-w-2xl mx-auto"
          />
        </div>

        {/* Subheadline Placeholder - 2 lines */}
        <div className="mb-6 sm:mb-8 md:mb-10 max-w-2xl w-full px-4 sm:px-0 space-y-3">
          <Skeleton
            variant="text"
            className="h-6 sm:h-7 w-full mx-auto"
          />
          <Skeleton
            variant="text"
            className="h-6 sm:h-7 w-4/5 mx-auto"
          />
        </div>

        {/* CTA Buttons Placeholder */}
        <div className="flex flex-col items-center gap-4">
          {/* Primary button */}
          <Skeleton
            variant="rectangular"
            className="h-12 xs:h-13 sm:h-14 w-full sm:w-64 rounded-lg"
          />

          {/* Secondary link */}
          <Skeleton
            variant="text"
            className="h-5 w-32 rounded"
          />
        </div>
      </div>

      {/* Scroll Indicator Placeholder */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden xs:flex flex-col items-center gap-2">
        <Skeleton
          variant="text"
          className="h-3 w-32 rounded"
        />
        <Skeleton
          variant="circular"
          className="w-5 h-5"
        />
      </div>
    </section>
  );
}

export default HeroSkeleton;
