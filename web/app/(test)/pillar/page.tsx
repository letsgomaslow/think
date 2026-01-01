"use client";

import { useRef } from "react";
import { PillarHero } from "@/components/test/hero/pillar-hero";
import { TransformationSection } from "@/components/sections/transformation";
import { BentoToolsSection } from "@/components/sections/bento-tools";
import { ToolChains } from "@/components/sections/tool-chains";
import { InstallSection } from "@/components/sections/install";
import { OriginStorySection } from "@/components/sections/origin-story";

export default function PillarTestPage() {
  const transformationRef = useRef<HTMLDivElement>(null);

  const scrollToTransformation = () => {
    transformationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-[hsl(var(--surface-dark))]">
      {/* Hero Section with Light Pillar - Pain-first messaging */}
      <PillarHero onScrollToTools={scrollToTransformation} />

      {/* Transformation Section - Before/After Council Demo */}
      <div ref={transformationRef}>
        <TransformationSection />
      </div>

      {/* Tool Sections - Bento grid layout */}
      <BentoToolsSection />

      {/* Tool Chains - Show how tools work together */}
      <ToolChains />

      {/* Install Section - One URL, zero setup */}
      <InstallSection />

      {/* Origin Story - Authentic founder narrative */}
      <OriginStorySection />
    </main>
  );
}
