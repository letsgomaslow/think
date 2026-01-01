"use client";

import { motion } from "framer-motion";
import { Quote, Lightbulb, Code2, Rocket } from "lucide-react";

const storyBeats = [
  {
    icon: Quote,
    color: "hsl(var(--brand-primary))",
    title: "The Frustration",
    content:
      "I kept typing the same prompts over and over. \"Think step by step.\" \"Consider multiple perspectives.\" \"What are the tradeoffs?\" Every conversation, the same scaffolding.",
  },
  {
    icon: Lightbulb,
    color: "hsl(var(--brand-accent))",
    title: "The Realization",
    content:
      "These weren't just prompts—they were thinking tools. Mental models I'd internalized over years of problem-solving. Why was I teaching them to AI every single time?",
  },
  {
    icon: Code2,
    color: "hsl(159 43% 70%)",
    title: "The Solution",
    content:
      "So I codified them. Chain of thought became Trace. Expert panels became Council. Decision frameworks became Decide. 11 tools, each encoding a different way of thinking.",
  },
  {
    icon: Rocket,
    color: "hsl(45 93% 60%)",
    title: "The Result",
    content:
      "Now instead of prompting, I just call the tool. The AI already knows the structure. I focus on the problem, not the scaffolding. Every conversation starts smarter.",
  },
];

export function OriginStorySection() {
  return (
    <section className="relative w-full bg-[hsl(var(--surface-dark))] py-24 px-6 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm uppercase tracking-widest text-[hsl(var(--brand-primary))] mb-4 block">
            The Story
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-manrope)]">
            Built by Someone Who Was{" "}
            <span className="text-[hsl(var(--brand-accent))]">Tired of Repeating Themselves</span>
          </h2>
        </motion.div>

        {/* Story Timeline */}
        <div className="relative">
          {/* Vertical line - left on mobile, center on desktop */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700" />

          {/* Story beats */}
          <div className="space-y-12 md:space-y-16">
            {storyBeats.map((beat, index) => {
              const Icon = beat.icon;

              return (
                <motion.div
                  key={beat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative flex items-start gap-6 pl-0 md:pl-0"
                >
                  {/* Icon node - sits on the timeline */}
                  <div
                    className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 bg-slate-900"
                    style={{
                      backgroundColor: `${beat.color.replace(")", " / 0.15)")}`,
                      borderColor: beat.color,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: beat.color }} />
                  </div>

                  {/* Content card */}
                  <div className="flex-1 max-w-2xl">
                    <h3
                      className="text-lg md:text-xl font-bold mb-2 font-[family-name:var(--font-manrope)]"
                      style={{ color: beat.color }}
                    >
                      {beat.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-base md:text-lg">
                      {beat.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <p className="text-xl text-slate-300 italic mb-4">
              &ldquo;The best tools disappear into your workflow. You stop thinking about the tool and start thinking about the problem.&rdquo;
            </p>
            <p className="text-sm text-slate-500">
              — The philosophy behind Think
            </p>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="#install"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--brand-primary))] text-white font-medium hover:bg-[hsl(var(--brand-primary)/0.9)] transition-colors"
          >
            Start thinking better
            <Rocket className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default OriginStorySection;
