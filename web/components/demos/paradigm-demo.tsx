"use client";

import { motion } from "framer-motion";
import { Workflow, CheckCircle2, XCircle, Code2, ArrowRight } from "lucide-react";

// Demo data: Decision maker persona - Functional vs OOP comparison
interface ParadigmData {
  paradigmName: string;
  problem: string;
  approach: string[];
  benefits: string[];
  limitations: string[];
  codeExample: string;
  languages: string[];
}

const paradigmData: ParadigmData = {
  paradigmName: "Functional Programming",
  problem: "Data transformation pipeline with complex filtering, mapping, and aggregation across user events.",
  approach: [
    "Model transformations as pure functions (no side effects)",
    "Compose small functions into pipelines",
    "Use immutable data structures throughout",
    "Leverage higher-order functions (map, filter, reduce)",
    "Separate data from behavior",
  ],
  benefits: [
    "Easier to test (pure functions, predictable outputs)",
    "Parallelizable (no shared mutable state)",
    "Composable (build complex from simple)",
    "Debuggable (data flows are explicit)",
  ],
  limitations: [
    "Steeper learning curve for OOP developers",
    "Memory overhead from immutability",
    "Some problems map better to objects",
    "Tooling/debugging can be less mature",
  ],
  codeExample: `const processEvents = pipe(
  filter(isValidEvent),
  map(enrichWithMetadata),
  groupBy(event => event.userId),
  mapValues(calculateMetrics),
  filter(meetsThreshold)
);

const insights = processEvents(rawEvents);`,
  languages: ["TypeScript", "Functional"],
};

export function ParadigmDemo() {
  return (
    <div className="space-y-5">
      {/* Paradigm Header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Workflow className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-sm font-semibold text-cyan-400">
            {paradigmData.paradigmName}
          </span>
          <div className="flex gap-1 ml-auto">
            {paradigmData.languages.map((lang) => (
              <span key={lang} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {lang}
              </span>
            ))}
          </div>
        </div>
        <div className="text-xs text-slate-500 mb-1">Problem Context</div>
        <p className="text-sm text-slate-300">{paradigmData.problem}</p>
      </motion.div>

      {/* Approach */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        viewport={{ once: true }}
        className="space-y-2"
      >
        <h4 className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5" />
          Paradigm Approach
        </h4>
        <div className="space-y-2">
          {paradigmData.approach.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              viewport={{ once: true }}
              className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/30"
            >
              <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-slate-300">{step}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Code Example */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="rounded-xl border border-slate-700/50 overflow-hidden"
      >
        <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Functional Pipeline</span>
        </div>
        <pre className="p-4 text-xs text-slate-300 bg-slate-900/50 overflow-x-auto">
          <code>{paradigmData.codeExample}</code>
        </pre>
      </motion.div>

      {/* Benefits & Limitations */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
        >
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Benefits</span>
          </div>
          <ul className="space-y-2">
            {paradigmData.benefits.map((b, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">+</span>
                {b}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          viewport={{ once: true }}
          className="p-4 rounded-xl border border-red-500/30 bg-red-500/5"
        >
          <div className="flex items-center gap-2 text-xs text-red-400 mb-3">
            <XCircle className="w-3.5 h-3.5" />
            <span>Limitations</span>
          </div>
          <ul className="space-y-2">
            {paradigmData.limitations.map((l, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">-</span>
                {l}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Paradigm badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Workflow className="w-3.5 h-3.5" />
        <span>Programming Paradigm • Data Transformation</span>
      </div>
    </div>
  );
}

export default ParadigmDemo;
