"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Blocks,
  Bug,
  Target,
  Search,
  ArrowRight,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Chain patterns with tool sequences
interface ToolInChain {
  id: string;
  name: string;
  role: string; // What this tool does in the chain
}

interface ChainPattern {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tools: ToolInChain[];
  outcome: string;
}

const chainPatterns: ChainPattern[] = [
  {
    id: "architecture",
    name: "Architecture Decision",
    description: "Design major system components with expert input and structured analysis",
    icon: Blocks,
    color: "hsl(280 60% 65%)",
    tools: [
      { id: "council", name: "Council", role: "Gather expert perspectives" },
      { id: "debate", name: "Debate", role: "Explore trade-offs" },
      { id: "pattern", name: "Pattern", role: "Apply design patterns" },
      { id: "decide", name: "Decide", role: "Make weighted decision" },
    ],
    outcome: "Documented architecture decision with rationale",
  },
  {
    id: "debugging",
    name: "Complex Bug Investigation",
    description: "Systematically isolate and resolve difficult production issues",
    icon: Bug,
    color: "hsl(0 70% 60%)",
    tools: [
      { id: "debug", name: "Debug", role: "Binary search isolation" },
      { id: "trace", name: "Trace", role: "Track reasoning path" },
      { id: "hypothesis", name: "Hypothesis", role: "Test fix hypothesis" },
      { id: "reflect", name: "Reflect", role: "Validate confidence" },
    ],
    outcome: "Root cause identified with verified fix",
  },
  {
    id: "strategic",
    name: "Strategic Planning",
    description: "Make high-stakes business decisions with multiple stakeholder views",
    icon: Target,
    color: "hsl(var(--brand-primary))",
    tools: [
      { id: "model", name: "Model", role: "Apply first principles" },
      { id: "council", name: "Council", role: "Stakeholder perspectives" },
      { id: "map", name: "Map", role: "Visualize dependencies" },
      { id: "decide", name: "Decide", role: "Weighted evaluation" },
    ],
    outcome: "Strategic recommendation with implementation plan",
  },
  {
    id: "research",
    name: "Deep Research",
    description: "Explore complex topics with rigorous scientific methodology",
    icon: Search,
    color: "hsl(200 70% 55%)",
    tools: [
      { id: "trace", name: "Trace", role: "Branch exploration paths" },
      { id: "hypothesis", name: "Hypothesis", role: "Formulate & test" },
      { id: "reflect", name: "Reflect", role: "Assess knowledge gaps" },
      { id: "debate", name: "Debate", role: "Challenge findings" },
    ],
    outcome: "Well-reasoned conclusions with confidence levels",
  },
];

function ToolNode({ tool, index, isLast, color }: {
  tool: ToolInChain;
  index: number;
  isLast: boolean;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="flex items-center gap-3"
    >
      <Link
        href={`/tools/${tool.id}`}
        className="group flex items-center gap-3 p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
      >
        {/* Step number */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            backgroundColor: `${color.replace(")", " / 0.2)")}`,
            color: color,
          }}
        >
          {index + 1}
        </div>

        {/* Tool info */}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white group-hover:text-[hsl(var(--brand-primary))] transition-colors flex items-center gap-1">
            {tool.name}
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-xs text-slate-500 truncate">{tool.role}</div>
        </div>
      </Link>

      {/* Arrow to next */}
      {!isLast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.15, duration: 0.2 }}
        >
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </motion.div>
      )}
    </motion.div>
  );
}

function ChainVisualization({ pattern }: { pattern: ChainPattern }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Chain description */}
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${pattern.color.replace(")", " / 0.15)")}` }}
        >
          <pattern.icon className="w-6 h-6" style={{ color: pattern.color }} />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-1">{pattern.name}</h4>
          <p className="text-sm text-slate-400">{pattern.description}</p>
        </div>
      </div>

      {/* Tool flow */}
      <div className="flex flex-wrap items-center gap-2">
        {pattern.tools.map((tool, index) => (
          <ToolNode
            key={tool.id}
            tool={tool}
            index={index}
            isLast={index === pattern.tools.length - 1}
            color={pattern.color}
          />
        ))}
      </div>

      {/* Outcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.05)]"
      >
        <Sparkles className="w-5 h-5 text-[hsl(var(--brand-primary))] flex-shrink-0" />
        <div>
          <span className="text-xs text-[hsl(var(--brand-primary))] font-medium">Outcome: </span>
          <span className="text-sm text-slate-300">{pattern.outcome}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ToolChains() {
  const [activePattern, setActivePattern] = useState<string>("architecture");
  const currentPattern = chainPatterns.find(p => p.id === activePattern) || chainPatterns[0];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-accent))]" />
            <span>Tool Combinations</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Chain tools for <span className="text-[hsl(var(--brand-primary))]">complex workflows</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Individual tools are powerful. Combined, they handle the messiest real-world problems.
            Select a workflow pattern to see how tools work together.
          </p>
        </motion.div>

        {/* Pattern Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {chainPatterns.map((pattern) => {
            const Icon = pattern.icon;
            const isActive = pattern.id === activePattern;

            return (
              <button
                key={pattern.id}
                onClick={() => setActivePattern(pattern.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200",
                  isActive
                    ? "border-[hsl(var(--brand-primary)/0.5)] bg-[hsl(var(--brand-primary)/0.1)]"
                    : "border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600"
                )}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? pattern.color : "rgb(148 163 184)" }}
                />
                <span className={cn(
                  "text-sm font-medium",
                  isActive ? "text-white" : "text-slate-400"
                )}>
                  {pattern.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chain Visualization */}
        <div className="p-6 md:p-8 rounded-2xl border border-slate-700/50 bg-slate-900/50 min-h-[300px]">
          <AnimatePresence mode="wait">
            <ChainVisualization key={currentPattern.id} pattern={currentPattern} />
          </AnimatePresence>
        </div>

        {/* Pro tip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-slate-500">
            <span className="text-[hsl(var(--brand-accent))]">Pro tip:</span> Click any tool in the chain to see its detailed demo and usage guide.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ToolChains;
