"use client";

import { useRef } from "react";
import { PillarHero } from "@/components/test/hero/pillar-hero";
import { BentoToolsSection } from "@/components/sections/bento-tools";
import { ToolChains } from "@/components/sections/tool-chains";
import { InstallSection } from "@/components/sections/install";
import { OriginStorySection } from "@/components/sections/origin-story";
import { WaitlistSection } from "@/components/sections/waitlist-section";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  const toolsRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-[hsl(var(--surface-dark))]">
      {/* Hero Section with Light Pillar - Transparency messaging */}
      <PillarHero onScrollToTools={scrollToWaitlist} />

      {/* TransformationSection REMOVED - kept in /pillar for A/B testing */}

      {/* Tool Sections - Bento grid layout */}
      <div id="tools" ref={toolsRef}>
        <BentoToolsSection />
      </div>

      {/* Tool Chains - Show how tools work together */}
      <ToolChains />

      {/* Install Section - One URL, zero setup */}
      <InstallSection />

      {/* Origin Story - Authentic founder narrative */}
      <OriginStorySection />

      {/* Waitlist Section - Join early access */}
      <div id="waitlist" ref={waitlistRef}>
        <WaitlistSection />
      </div>

      {/* Footer - Maslow AI branding */}
      <Footer />
    </main>
  );
}
