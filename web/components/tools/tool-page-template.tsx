"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Tool } from "./tools-data";
import { getToolById } from "./tools-data";

interface ToolPageTemplateProps {
  tool: Tool;
  /** Optional custom demo component to replace the placeholder */
  demoComponent?: ReactNode;
  /** Optional before/after content */
  beforeAfter?: {
    before: ReactNode;
    after: ReactNode;
  };
}

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

export function ToolPageTemplate({
  tool,
  demoComponent,
  beforeAfter,
}: ToolPageTemplateProps) {
  const Icon = tool.icon;
  const installCommand = "npx @anthropic-ai/claude-code mcp add think-mcp";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto px-6 py-12"
    >
      {/* ===== HERO SECTION ===== */}
      <motion.section variants={itemVariants} className="text-center mb-16">
        {/* Tool Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${tool.color.replace(")", " / 0.2)")}` }}
        >
          <Icon className="w-10 h-10" style={{ color: tool.color }} />
        </motion.div>

        {/* Persona Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-4"
          style={{
            backgroundColor: `${tool.color.replace(")", " / 0.15)")}`,
            color: tool.color,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>For {tool.persona}s</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
          {tool.name}
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl mb-4" style={{ color: tool.color }}>
          {tool.tagline}
        </p>

        {/* Description */}
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {tool.description}
        </p>
      </motion.section>

      {/* ===== BEFORE/AFTER SECTION ===== */}
      {beforeAfter ? (
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-6 text-center">
            The Transformation
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-400">Before</span>
              </div>
              {beforeAfter.before}
            </div>
            {/* After */}
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-400">After</span>
              </div>
              {beforeAfter.after}
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-6 text-center">
            The Transformation
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Placeholder */}
            <div className="rounded-xl border border-dashed border-slate-600 bg-slate-800/30 p-6 min-h-[120px] flex items-center justify-center">
              <p className="text-sm text-slate-500 text-center">
                Before scenario<br />
                <span className="text-xs">(Coming soon)</span>
              </p>
            </div>
            {/* After Placeholder */}
            <div className="rounded-xl border border-dashed border-slate-600 bg-slate-800/30 p-6 min-h-[120px] flex items-center justify-center">
              <p className="text-sm text-slate-500 text-center">
                After transformation<br />
                <span className="text-xs">(Coming soon)</span>
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ===== DEMO/OUTPUT SECTION ===== */}
      <motion.section variants={itemVariants} className="mb-16">
        <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-4">
          See It In Action
        </h2>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          {/* Demo Scenario Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
            <p className="text-sm text-slate-400">
              <span className="text-slate-500">Scenario:</span>{" "}
              <span className="text-white italic">&ldquo;{tool.demoScenario}&rdquo;</span>
            </p>
          </div>

          {/* Demo Content */}
          <div className="p-6">
            {demoComponent ? (
              demoComponent
            ) : (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${tool.color.replace(")", " / 0.1)")}` }}
                >
                  <Icon className="w-8 h-8" style={{ color: tool.color }} />
                </div>
                <p className="text-slate-400 mb-2">Interactive demo coming soon</p>
                <p className="text-sm text-slate-500 max-w-md">
                  This will showcase how {tool.name.toLowerCase()} transforms your thinking
                  with a real-world {tool.persona.toLowerCase()} scenario.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ===== WHEN TO USE SECTION ===== */}
      <motion.section variants={itemVariants} className="mb-16">
        <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-6">
          When to Use {tool.name}
        </h2>
        <ul className="space-y-4">
          {tool.whenToUse.map((useCase, index) => (
            <motion.li
              key={useCase}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${tool.color.replace(")", " / 0.15)")}` }}
              >
                <span className="text-sm font-bold" style={{ color: tool.color }}>
                  {index + 1}
                </span>
              </div>
              <span className="text-slate-300 leading-relaxed">{useCase}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* ===== WORKS WELL WITH SECTION ===== */}
      <motion.section variants={itemVariants} className="mb-16">
        <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-6">
          Works Well With
        </h2>
        <div className="flex flex-wrap gap-4">
          {tool.worksWellWith.map((toolId, index) => {
            const relatedTool = getToolById(toolId);
            if (!relatedTool) return null;
            const RelatedIcon = relatedTool.icon;

            return (
              <motion.div
                key={toolId}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/tools/${toolId}`}
                  className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all hover:scale-105"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${relatedTool.color.replace(")", " / 0.15)")}`,
                    }}
                  >
                    <RelatedIcon
                      className="w-5 h-5"
                      style={{ color: relatedTool.color }}
                    />
                  </div>
                  <div>
                    <span className="block text-white font-medium group-hover:text-white transition-colors">
                      {relatedTool.name}
                    </span>
                    <span className="text-xs text-slate-500">{relatedTool.tagline}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all ml-2" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tool Chain Suggestion */}
        <div className="mt-6 p-4 rounded-lg bg-slate-800/20 border border-slate-700/30">
          <p className="text-sm text-slate-400">
            <span className="text-slate-500">Pro tip:</span> Chain{" "}
            <span style={{ color: tool.color }}>{tool.name}</span> with{" "}
            {tool.worksWellWith.slice(0, 2).map((id, i) => {
              const t = getToolById(id);
              return t ? (
                <span key={id}>
                  <span style={{ color: t.color }}>{t.name}</span>
                  {i === 0 && tool.worksWellWith.length > 1 ? " → " : ""}
                </span>
              ) : null;
            })}{" "}
            for comprehensive analysis.
          </p>
        </div>
      </motion.section>

      {/* ===== INSTALL CTA SECTION ===== */}
      <motion.section
        variants={itemVariants}
        className="text-center p-8 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50"
      >
        <h2 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-manrope)]">
          Ready to use {tool.name}?
        </h2>
        <p className="text-slate-400 mb-6">
          Add Think to your AI assistant in one command
        </p>

        {/* Install Command */}
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700">
          <code className="text-sm text-slate-300 font-mono">{installCommand}</code>
          <CopyButton text={installCommand} />
        </div>

        {/* Additional CTAs */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/pillar#tools"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            View all tools
          </Link>
          <span className="text-slate-700">•</span>
          <a
            href="https://github.com/letsgomaslow/think"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default ToolPageTemplate;
