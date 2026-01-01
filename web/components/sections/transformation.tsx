"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExpertCard } from "@/components/council/expert-card";
import { SynthesisPanel } from "@/components/council/synthesis-panel";
import {
  councilDemoData,
  getPersonaById,
} from "@/components/council/council-demo-data";

// Generic AI response - the "before"
const genericResponse = {
  question: "Should I quit my job to start a startup?",
  answer: `It depends on your situation. There are pros and cons to consider.

**Pros of quitting:**
• You can focus full-time on your startup
• More time to dedicate to building your product
• Shows commitment to investors

**Cons of quitting:**
• Loss of stable income
• Risk to your financial security
• Stress of uncertainty

You should think about your financial situation, your risk tolerance, and whether you have a good idea. It's a personal decision that only you can make.

I'd recommend talking to people who have done it before and weighing your options carefully. There's no one-size-fits-all answer to this question.`,
  followUp: [
    "What's your current financial situation?",
    "How much runway do you have saved?",
    "What industry is your startup in?",
  ],
};

export function TransformationSection() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      id="transformation"
      className="relative w-full bg-[hsl(var(--surface-dark))] py-24 px-6 overflow-hidden"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16 max-w-3xl mx-auto"
      >
        <span className="text-sm uppercase tracking-widest text-[hsl(var(--brand-primary))] mb-4 block">
          The Difference
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-manrope)]">
          What if AI actually{" "}
          <span className="text-[hsl(var(--brand-accent))]">challenged</span>{" "}
          your assumptions?
        </h2>
        <p className="text-lg text-slate-400">
          Same question. Radically different depth.{" "}
          <span className="text-slate-500">(Click cards to explore)</span>
        </p>
      </motion.div>

      {/* Split Comparison */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 relative">
        {/* Center Pillar Divider - visible on md+ */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full h-full origin-top"
            style={{
              background: `linear-gradient(to bottom, hsl(var(--brand-accent)), hsl(var(--brand-primary)))`,
              boxShadow: `0 0 30px hsl(var(--brand-primary) / 0.3)`,
            }}
          />
        </div>

        {/* LEFT: Generic Response */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--brand-accent)/0.5)]" />
            <span className="text-sm font-medium text-[hsl(var(--brand-accent))]">
              Generic AI
            </span>
          </div>

          {/* Mock Browser Window */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 overflow-hidden h-full flex flex-col">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-slate-700/50 rounded px-3 py-1 text-xs text-slate-400 text-center">
                  chatgpt.com
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Question */}
              <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border-l-2 border-slate-600">
                <p className="text-sm text-slate-300">
                  {genericResponse.question}
                </p>
              </div>

              {/* Response */}
              <div className="flex-1 space-y-3 text-sm text-slate-400 leading-relaxed">
                <p>It depends on your situation. There are pros and cons to consider.</p>

                <div className="p-3 rounded-lg bg-slate-800/30">
                  <p className="text-slate-500 font-medium mb-2">Pros of quitting:</p>
                  <ul className="space-y-1 text-slate-400">
                    <li>• You can focus full-time on your startup</li>
                    <li>• More time to dedicate to building your product</li>
                    <li>• Shows commitment to investors</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/30">
                  <p className="text-slate-500 font-medium mb-2">Cons of quitting:</p>
                  <ul className="space-y-1 text-slate-400">
                    <li>• Loss of stable income</li>
                    <li>• Risk to your financial security</li>
                    <li>• Stress of uncertainty</li>
                  </ul>
                </div>

                <p>You should think about your financial situation, your risk tolerance, and whether you have a good idea. It&apos;s a personal decision that only you can make.</p>

                <p className="text-slate-500">I&apos;d recommend talking to people who have done it before and weighing your options carefully.</p>
              </div>

              {/* Generic follow-up questions */}
              <div className="mt-4 pt-4 border-t border-slate-700/30">
                <p className="text-xs text-slate-500 mb-2">Follow-up questions:</p>
                <div className="flex flex-wrap gap-2">
                  {genericResponse.followUp.map((q, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded bg-slate-800/50 text-slate-500">
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              {/* Frustration indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                viewport={{ once: true }}
                className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-[hsl(var(--brand-accent))]"
              >
                <span className="text-sm italic">
                  &ldquo;That tells me nothing I didn&apos;t already know...&rdquo;
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Council Response */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--brand-primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--brand-primary))]">
              think-mcp council
            </span>
          </div>

          {/* Mock Browser Window */}
          <div className="rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-slate-900/80 overflow-hidden shadow-[0_0_40px_hsl(var(--brand-primary)/0.1)]">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-[hsl(var(--brand-primary)/0.2)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-slate-700/50 rounded px-3 py-1 text-xs text-slate-400 text-center">
                  claude.ai + think-mcp
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Question */}
              <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border-l-2 border-[hsl(var(--brand-primary))]">
                <p className="text-sm text-slate-300">
                  {councilDemoData.topic}
                </p>
              </div>

              {/* Expert Cards Grid */}
              <div className="grid gap-3 mb-4">
                {councilDemoData.contributions.map((contribution, index) => {
                  const persona = getPersonaById(contribution.personaId);
                  if (!persona) return null;
                  return (
                    <ExpertCard
                      key={`${contribution.personaId}-${index}`}
                      persona={persona}
                      contribution={contribution}
                      delay={0.5 + index * 0.1}
                    />
                  );
                })}
              </div>

              {/* Synthesis Panel */}
              <SynthesisPanel synthesis={councilDemoData.synthesis} delay={0.9} />

              {/* Satisfaction indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                viewport={{ once: true }}
                className="mt-4 flex items-center gap-2 text-[hsl(var(--brand-primary))]"
              >
                <span className="text-sm italic">
                  &ldquo;Now I can actually make an informed decision.&rdquo;
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <p className="text-slate-400 mb-6">
          This is just one of{" "}
          <span className="text-white font-semibold">11 thinking tools</span>.
        </p>
        <a
          href="#tools"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[hsl(var(--brand-primary)/0.5)] text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.1)] transition-colors"
        >
          Explore all tools
          <span>→</span>
        </a>
      </motion.div>
    </section>
  );
}

export default TransformationSection;
