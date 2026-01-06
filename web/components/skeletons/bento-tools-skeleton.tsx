import { Skeleton } from "@/components/ui/skeleton";

interface ToolCardSkeletonProps {
  isLarge?: boolean;
}

function ToolCardSkeleton({ isLarge = false }: ToolCardSkeletonProps) {
  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700/50 ${
        isLarge ? "min-h-[240px] xs:min-h-[260px] sm:min-h-[280px]" : ""
      }`}
    >
      {/* Content */}
      <div className="relative p-4 xs:p-5 sm:p-6">
        {/* Icon */}
        <div className="mb-4">
          <Skeleton
            variant="rectangular"
            className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg"
          />
        </div>

        {/* Title */}
        <div className="mb-3">
          <Skeleton variant="text" className="h-6 xs:h-7 w-3/4 mb-2" />
          {/* Tagline */}
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>

        {/* Description - 2 lines */}
        <div className="mb-4 space-y-2">
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-5/6" />
        </div>

        {/* Badge */}
        <Skeleton
          variant="rectangular"
          className="h-6 w-32 rounded-full"
        />
      </div>
    </div>
  );
}

interface CategorySectionSkeletonProps {
  toolCount: number;
}

function CategorySectionSkeleton({ toolCount }: CategorySectionSkeletonProps) {
  const isLarge = toolCount === 2;

  return (
    <div className="mb-16">
      {/* Category Header */}
      <div className="mb-6">
        <Skeleton variant="text" className="h-7 xs:h-8 w-48 mb-2" />
        <Skeleton variant="text" className="h-5 w-64" />
      </div>

      {/* Tools Grid */}
      <div
        className={`grid gap-3 xs:gap-3.5 sm:gap-4 ${
          toolCount === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {Array.from({ length: toolCount }).map((_, index) => (
          <ToolCardSkeleton key={index} isLarge={isLarge} />
        ))}
      </div>
    </div>
  );
}

export function BentoToolsSkeleton() {
  return (
    <section
      id="tools"
      className="relative w-full bg-[hsl(var(--surface-dark))] py-24 px-6 overflow-hidden"
    >
      {/* Section Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="mb-4">
          <Skeleton
            variant="rectangular"
            className="h-5 w-24 rounded mx-auto"
          />
        </div>

        {/* Heading - 2 lines */}
        <div className="mb-4 xs:mb-5 sm:mb-6 space-y-3 px-4 sm:px-0">
          <Skeleton
            variant="text"
            className="h-10 xs:h-12 sm:h-14 md:h-16 w-full max-w-2xl mx-auto"
          />
          <Skeleton
            variant="text"
            className="h-10 xs:h-12 sm:h-14 md:h-16 w-3/4 max-w-xl mx-auto"
          />
        </div>

        {/* Subtitle */}
        <Skeleton variant="text" className="h-6 sm:h-7 w-full max-w-lg mx-auto" />
      </div>

      {/* Categories - showing 3 categories with varied tool counts (3, 3, 2) = 8 total */}
      <div className="max-w-6xl mx-auto">
        <CategorySectionSkeleton toolCount={3} />
        <CategorySectionSkeleton toolCount={3} />
        <CategorySectionSkeleton toolCount={2} />
      </div>

      {/* Chain Tools Together CTA */}
      <div className="text-center mt-8">
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 xs:gap-3.5 sm:gap-4 px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <Skeleton variant="text" className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" className="h-7 w-20 rounded-lg" />
            <Skeleton variant="rectangular" className="h-4 w-4 rounded" />
            <Skeleton variant="rectangular" className="h-7 w-20 rounded-lg" />
            <Skeleton variant="rectangular" className="h-4 w-4 rounded" />
            <Skeleton variant="rectangular" className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BentoToolsSkeleton;
