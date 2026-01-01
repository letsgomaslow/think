"use client";

import { useRef } from "react";
import { LaserHero } from "@/components/test/hero/laser-hero";
import { ToolSections } from "@/components/test/hero/tool-sections";

export default function HeroTestPage() {
  const toolsRef = useRef<HTMLDivElement>(null);

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-[#0a1628]">
      {/* Hero Section */}
      <LaserHero onScrollToTools={scrollToTools} />

      {/* Tool Sections */}
      <div ref={toolsRef}>
        <ToolSections />
      </div>
    </main>
  );
}
