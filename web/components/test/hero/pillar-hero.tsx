"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Hex values only for WebGL shader uniforms - these MUST match globals.css CSS variables
const WEBGL_COLORS = {
  primary: "#6DC4AD",    // --brand-primary: 159 43% 60%
  accent: "#EE7BB3",     // --brand-accent: 330 72% 70%
  surfaceDark: "#121D35" // --surface-dark: 220 45% 14%
} as const;

// Lazy load LightPillar for performance
const LightPillar = dynamic(
  () => import("@/components/ui/light-pillar").then((mod) => mod.LightPillar),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[hsl(var(--surface-dark))]" />
    ),
  }
);

interface PillarHeroProps {
  onScrollToTools?: () => void;
}

export function PillarHero({ onScrollToTools }: PillarHeroProps) {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black min-h-[500px] xs:min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px]">
      {/* Light Pillar Background */}
      <div className="absolute inset-0">
        <LightPillar
          topColor={WEBGL_COLORS.primary}
          bottomColor={WEBGL_COLORS.accent}
          intensity={0.6}
          glowAmount={0.003}
          pillarWidth={2.2}
          pillarHeight={0.3}
          noiseIntensity={1.5}
          mixBlendMode="normal"
          pillarRotation={69}
          interactive={true}
        />
      </div>


      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 xs:px-3.5 xs:py-1.5 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 bg-[hsl(var(--brand-primary)/0.15)] border border-[hsl(var(--brand-primary)/0.3)] text-[hsl(var(--brand-primary))]">
            <span className="w-2 h-2 rounded-full animate-pulse bg-[hsl(var(--brand-primary))]" />
            Coming Soon
          </span>
        </motion.div>

        {/* Main Headline - Transparency-focused messaging */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="heading-xl mb-4 sm:mb-6 max-w-4xl px-2 sm:px-0 font-bold font-[family-name:var(--font-manrope)] text-white"
        >
          Stop trusting AI{" "}
          <span className="text-[hsl(var(--brand-accent))]">blindly</span>.{" "}
          <br />
          See how it thinks.
        </motion.h1>

        {/* Subheadline - Visual reasoning + agentic workflows */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="body-lg mb-6 sm:mb-8 md:mb-10 max-w-2xl px-4 sm:px-0 font-[family-name:var(--font-graphik)] text-slate-400"
        >
          The mental models powering your Claude—now with{" "}
          <span className="text-[hsl(var(--brand-primary))]">visual reasoning traces</span>,{" "}
          multi-agent debates, and async workflows. No more black boxes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={onScrollToTools}
            className="group touch-target-min w-full sm:w-auto px-6 xs:px-7 sm:px-8 py-3 xs:py-3.5 sm:py-4 text-sm sm:text-base max-w-xs sm:max-w-none text-white font-semibold rounded-lg transition-all duration-300 font-[family-name:var(--font-manrope)] bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.85)] shadow-[0_10px_25px_hsl(var(--brand-primary)/0.4)] hover:shadow-[0_15px_35px_hsl(var(--brand-primary)/0.5)]"
          >
            Join the Waitlist
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>

          <a
            href="#install"
            className="text-sm text-slate-400 hover:text-[hsl(var(--brand-primary))] transition-colors duration-200 underline underline-offset-4 touch-target-min inline-flex items-center justify-center"
          >
            Try the free MCP
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator - CSS hover instead of JS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden xs:block"
      >
        <motion.button
          onClick={onScrollToTools}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 transition-colors text-slate-500 hover:text-[hsl(var(--brand-primary))]"
        >
          <span className="text-xs uppercase tracking-widest">See what&apos;s inside</span>
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </section>
  );
}

export default PillarHero;
