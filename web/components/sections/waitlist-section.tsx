"use client";

import { motion } from "framer-motion";
import { WaitlistForm } from "./waitlist-form";
import { Eye, Zap, Users, Shield } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Visual Reasoning",
    description: "See every decision, perspective, and reasoning step",
  },
  {
    icon: Zap,
    title: "Async Workflows",
    description: "Set agents running, come back to insights",
  },
  {
    icon: Users,
    title: "Multi-Agent Debates",
    description: "4+ expert perspectives on every question",
  },
  {
    icon: Shield,
    title: "Export & Compliance",
    description: "Download reasoning traces for audit trails",
  },
];

export function WaitlistSection() {
  return (
    <section
      id="waitlist"
      className="relative bg-gradient-to-b from-[hsl(var(--surface-dark))] via-[#0a1224] to-[hsl(var(--surface-dark))] overflow-hidden py-16 xs:py-18 sm:py-20 md:py-24 lg:py-28 xl:py-32"
    >
      {/* Gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--brand-primary)/0.1)] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--brand-accent)/0.1)] rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10 px-4 xs:px-5 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 xs:mb-14 sm:mb-16 md:mb-18"
          >
            <span className="inline-block px-3 xs:px-3.5 sm:px-4 py-1 xs:py-1.5 mb-6 rounded-full text-xs sm:text-sm font-medium bg-[hsl(var(--brand-primary)/0.15)] border border-[hsl(var(--brand-primary)/0.3)] text-[hsl(var(--brand-primary))]">
              Early Access
            </span>

            <h2 className="heading-lg mb-4 xs:mb-5 sm:mb-6 px-4 sm:px-0 font-bold text-white font-[family-name:var(--font-manrope)]">
              Be the first to see{" "}
              <span className="text-[hsl(var(--brand-accent))]">inside</span> AI
            </h2>

            <p className="body-lg text-slate-400 px-4 sm:px-0 max-w-2xl mx-auto font-[family-name:var(--font-graphik)]">
              Join the waitlist for exclusive early access to the visual AI
              reasoning platform. No more black boxes. No more blind trust.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xs:gap-10 sm:gap-12 md:gap-14 lg:gap-16 items-start">
            {/* Left: Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white mb-8 font-[family-name:var(--font-manrope)]">
                What you'll get:
              </h3>

              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg bg-[hsl(var(--brand-primary)/0.1)] border border-[hsl(var(--brand-primary)/0.2)] flex items-center justify-center group-hover:bg-[hsl(var(--brand-primary)/0.2)] transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-[hsl(var(--brand-primary))]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}

              {/* Free MCP callout */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-10 p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-sm text-slate-400">
                  <span className="text-[hsl(var(--brand-primary))] font-semibold">
                    Already using the free MCP?
                  </span>{" "}
                  You'll get priority access when we launch the visual platform.
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:sticky lg:top-8"
            >
              <div className="p-6 xs:p-7 sm:p-8 md:p-9 lg:p-10 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm shadow-2xl">
                <WaitlistForm />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WaitlistSection;
