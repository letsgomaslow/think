import { Skeleton } from "@/components/ui/skeleton";

export function FooterSkeleton() {
  return (
    <footer className="relative bg-[#121D35] text-white overflow-hidden py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <div className="container mx-auto relative z-10 px-4 xs:px-5 sm:px-6 md:px-8">
        {/* Large logo placeholder */}
        <div className="flex items-center justify-center gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-7 mb-10 xs:mb-12 sm:mb-14 md:mb-16">
          <Skeleton
            variant="text"
            className="h-12 xs:h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-48 xs:w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96"
          />
        </div>

        {/* Accent line */}
        <Skeleton
          variant="rectangular"
          className="h-[3px] mx-auto w-16 xs:w-20 sm:w-24 md:w-28 mb-8 xs:mb-9 sm:mb-10 rounded"
        />

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10 mb-8 xs:mb-9 sm:mb-10">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              className="h-5 xs:h-6 md:h-7 w-20 xs:w-24 sm:w-28 rounded"
            />
          ))}
        </div>

        {/* Copyright */}
        <Skeleton
          variant="text"
          className="h-4 xs:h-5 md:h-6 w-56 xs:w-64 mx-auto rounded"
        />
      </div>
    </footer>
  );
}

export default FooterSkeleton;
