import { HeroSkeleton } from "@/components/skeletons/hero-skeleton";
import { BentoToolsSkeleton } from "@/components/skeletons/bento-tools-skeleton";

export default function Loading() {
  return (
    <main className="bg-[hsl(var(--surface-dark))]">
      {/* Hero Section Skeleton - Above fold priority */}
      <HeroSkeleton />

      {/* Bento Tools Section Skeleton - Partial view below fold */}
      <BentoToolsSkeleton />
    </main>
  );
}
