"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

// Brand colors from design system
const BRAND_COLORS = {
  teal: "#6DC4AD",      // color-primary (dark mode laser)
  purple: "#401877",    // color-purple (light mode laser)
  pink: "#EE7BB3",      // color-accent
  surfaceDark: "#121D35", // surface-dark
  surfaceLight: "#E6EAF3", // surface-background
};

// Lazy load LaserFlow for performance (heavy Three.js component)
const LaserFlow = dynamic(
  () => import("@/components/ui/laser-flow").then((mod) => mod.LaserFlow),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-[hsl(220,45%,14%)] via-[hsl(220,35%,21%)] to-[hsl(220,45%,14%)] dark:from-[hsl(220,45%,14%)] dark:via-[hsl(220,35%,21%)] dark:to-[hsl(220,45%,14%)]" />
    )
  }
);

interface LaserHeroProps {
  onScrollToTools?: () => void;
}

export function LaserHero({ onScrollToTools }: LaserHeroProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <section
      className="relative w-full h-screen min-h-[600px] overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: isDark ? BRAND_COLORS.surfaceDark : BRAND_COLORS.surfaceLight
      }}
    >
      {/* LaserFlow Background - Theme-aware colors */}
      <div className="absolute inset-0">
        <LaserFlow
          color={BRAND_COLORS.teal}
          fogIntensity={isDark ? 0.35 : 0.25}
          wispDensity={1.2}
          flowSpeed={0.3}
          verticalSizing={1.8}
          horizontalSizing={0.6}
          mouseTiltStrength={0.015}
          verticalBeamOffset={0.35}
          decay={1.3}
        />
      </div>

      {/* Text zone protection overlay - radial gradient for center protection */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 100% 60% at 50% 45%, ${BRAND_COLORS.surfaceDark}99, transparent 70%)`
            : `radial-gradient(ellipse 100% 60% at 50% 45%, ${BRAND_COLORS.surfaceLight}99, transparent 70%)`
        }}
      />

      {/* Theme Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-6 right-6 z-20 p-3 rounded-full transition-all duration-300"
        style={{
          backgroundColor: isDark ? `${BRAND_COLORS.teal}20` : `${BRAND_COLORS.purple}20`,
          borderWidth: 1,
          borderColor: isDark ? `${BRAND_COLORS.teal}40` : `${BRAND_COLORS.purple}40`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? `${BRAND_COLORS.teal}35` : `${BRAND_COLORS.purple}35`;
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? `${BRAND_COLORS.teal}20` : `${BRAND_COLORS.purple}20`;
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
        ) : (
          <Moon className="w-5 h-5" style={{ color: BRAND_COLORS.purple }} />
        )}
      </motion.button>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300"
            style={{
              backgroundColor: `${BRAND_COLORS.teal}15`,
              borderWidth: 1,
              borderColor: `${BRAND_COLORS.teal}4d`,
              color: BRAND_COLORS.teal,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: BRAND_COLORS.teal }}
            />
            MCP Server for Claude
          </span>
        </motion.div>

        {/* Main Headline - "Illuminate Your Thinking" */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl transition-colors duration-300"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            color: isDark ? "#ffffff" : "#1a1f36",
          }}
        >
          <span style={{ color: BRAND_COLORS.teal }}>Illuminate</span>{" "}
          Your Thinking
        </motion.h1>

        {/* Subheadline - Connects light metaphor to benefit */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-lg md:text-xl mb-10 max-w-2xl transition-colors duration-300"
          style={{
            fontFamily: "'Graphik', system-ui, sans-serif",
            color: isDark ? "#a0aec0" : "#4a5568",
          }}
        >
          Like light cutting through fog, think-mcp brings structure to AI reasoning.{" "}
          <span style={{ color: BRAND_COLORS.pink }}>11 mental models</span>{" "}
          that transform complexity into clarity.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          onClick={onScrollToTools}
          className="group px-8 py-4 text-white font-semibold rounded-lg transition-all duration-300"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            backgroundColor: BRAND_COLORS.teal,
            boxShadow: `0 10px 25px ${BRAND_COLORS.teal}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#7dd4bd";
            e.currentTarget.style.boxShadow = `0 15px 35px ${BRAND_COLORS.teal}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND_COLORS.teal;
            e.currentTarget.style.boxShadow = `0 10px 25px ${BRAND_COLORS.teal}40`;
          }}
        >
          Explore the Tools
          <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
            →
          </span>
        </motion.button>

        {/* Stats bar - Enhanced narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-12 flex items-center gap-8 text-sm transition-colors duration-300"
          style={{ color: isDark ? "#718096" : "#4a5568" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color: isDark ? "#ffffff" : "#1a1f36" }}
            >
              11
            </span>
            <span>Ways to Think</span>
          </div>
          <div
            className="w-px h-6"
            style={{ backgroundColor: isDark ? "#4a5568" : "#cbd5e0" }}
          />
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color: isDark ? "#ffffff" : "#1a1f36" }}
            >
              6
            </span>
            <span>Mental Models</span>
          </div>
          <div
            className="w-px h-6"
            style={{ backgroundColor: isDark ? "#4a5568" : "#cbd5e0" }}
          />
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.pink }}
            >
              ∞
            </span>
            <span>Clarity</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.button
          onClick={onScrollToTools}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 transition-colors"
          style={{ color: isDark ? "#718096" : "#4a5568" }}
          onMouseEnter={(e) => e.currentTarget.style.color = BRAND_COLORS.teal}
          onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#718096" : "#4a5568"}
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </section>
  );
}

export default LaserHero;
