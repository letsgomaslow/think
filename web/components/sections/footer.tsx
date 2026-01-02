"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";

const footerLinks = [
  {
    label: "GitHub",
    href: "https://github.com/chirag127/think-mcp",
    external: true,
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/think-mcp",
    external: true,
  },
  {
    label: "Documentation",
    href: "https://github.com/chirag127/think-mcp#readme",
    external: true,
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
    external: false,
  },
  {
    label: "Terms of Service",
    href: "/terms",
    external: false,
  },
];

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: {
      y: 100,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const logoText = "MASLOW";
  const aiText = "AI";

  return (
    <footer
      ref={ref}
      className="relative bg-[#121D35] text-white overflow-hidden py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <div className="container mx-auto relative z-10 px-4 xs:px-5 sm:px-6 md:px-8">
        {/* Large animated logo */}
        <motion.div
          className="flex items-center justify-center overflow-hidden gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-7 mb-10 xs:mb-12 sm:mb-14 md:mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* MASLOW text */}
          <div className="flex">
            {logoText.split("").map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="font-extrabold tracking-tight text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Separator */}
          <motion.span
            variants={letterVariants}
            className="font-light text-[#6DC4AD] text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            |
          </motion.span>

          {/* AI text */}
          <div className="flex">
            {aiText.split("").map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="font-light tracking-tight text-white/80 text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Accent line */}
        <motion.div
          className="h-[3px] bg-[#6DC4AD] mx-auto w-16 xs:w-20 sm:w-24 md:w-28 mb-8 xs:mb-9 sm:mb-10"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Links */}
        <motion.nav
          className="flex flex-wrap items-center justify-center gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10 mb-8 xs:mb-9 sm:mb-10"
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.6 }}
        >
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-[#6DC4AD] hover:text-white text-sm xs:text-base md:text-lg touch-target-min font-medium transition-colors duration-200 hover:underline underline-offset-4"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* Copyright */}
        <motion.p
          className="text-center text-white/50 text-xs xs:text-sm md:text-base"
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.8 }}
        >
          © {new Date().getFullYear()} Maslow AI. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
}

export default Footer;
