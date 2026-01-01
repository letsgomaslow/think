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
      className="relative bg-[#121D35] text-white py-16 md:py-24 overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Large animated logo */}
        <motion.div
          className="flex items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16 overflow-hidden"
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
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight"
                style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Separator */}
          <motion.span
            variants={letterVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#6DC4AD]"
          >
            |
          </motion.span>

          {/* AI text */}
          <div className="flex">
            {aiText.split("").map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-white/80"
                style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Accent line */}
        <motion.div
          className="w-24 h-[3px] bg-[#6DC4AD] mx-auto mb-10"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Links */}
        <motion.nav
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10"
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
              className="text-[#6DC4AD] hover:text-white text-base md:text-lg font-medium transition-colors duration-200 hover:underline underline-offset-4"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* Copyright */}
        <motion.p
          className="text-center text-white/50 text-sm md:text-base"
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
