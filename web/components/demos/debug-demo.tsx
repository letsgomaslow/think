"use client";

import { motion } from "framer-motion";
import { Bug, Search, CheckCircle2, XCircle, ArrowRight, Target, Lightbulb } from "lucide-react";

// Demo data: Problem Solver persona - Binary search debugging
interface DebugStep {
  stepNumber: number;
  action: string;
  observation: string;
  outcome: "narrowed" | "eliminated" | "found";
  scope: string; // What's left to investigate
}

interface DebugData {
  issue: string;
  approach: "binary_search" | "divide_conquer" | "backtracking";
  steps: DebugStep[];
  resolution: string;
  rootCause: string;
}

const debugData: DebugData = {
  issue: "Users report 500 errors on checkout, but only on Tuesdays between 2-4pm EST",
  approach: "binary_search",
  steps: [
    {
      stepNumber: 1,
      action: "Check if error occurs in payment service OR order service",
      observation: "Logs show payment service returns 200, order service throws exception",
      outcome: "narrowed",
      scope: "Order service (3 modules)",
    },
    {
      stepNumber: 2,
      action: "Isolate: inventory module vs pricing module vs fulfillment module",
      observation: "Pricing module queries external tax API that times out",
      outcome: "narrowed",
      scope: "Tax API integration",
    },
    {
      stepNumber: 3,
      action: "Test tax API directly during failure window",
      observation: "Tax API has scheduled maintenance Tue 2-4pm - returns 503",
      outcome: "found",
      scope: "External dependency",
    },
  ],
  resolution: "Add circuit breaker with cached tax rates fallback. Alert on tax API degradation.",
  rootCause: "External tax API weekly maintenance window not accounted for in integration design.",
};

// Outcome styling
const outcomeStyles = {
  narrowed: { icon: Search, color: "hsl(45 93% 60%)", label: "Scope Narrowed" },
  eliminated: { icon: XCircle, color: "hsl(200 70% 55%)", label: "Eliminated" },
  found: { icon: CheckCircle2, color: "hsl(var(--brand-primary))", label: "Root Cause Found" },
};

function DebugStepCard({ step, index, isLast }: { step: DebugStep; index: number; isLast: boolean }) {
  const style = outcomeStyles[step.outcome];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Step connector line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-slate-600 to-slate-700" />
      )}

      <div className="flex gap-4">
        {/* Step number */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border-2"
          style={{
            borderColor: style.color,
            color: style.color,
            backgroundColor: `${style.color.replace(")", " / 0.1)")}`,
          }}
        >
          {step.stepNumber}
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          {/* Action */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Search className="w-3 h-3" />
              <span>Investigation</span>
            </div>
            <p className="text-sm text-white">{step.action}</p>
          </div>

          {/* Observation */}
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Bug className="w-3 h-3" />
              <span>Observation</span>
            </div>
            <p className="text-sm text-slate-300">{step.observation}</p>
          </div>

          {/* Outcome */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: style.color }} />
              <span className="text-xs font-medium" style={{ color: style.color }}>
                {style.label}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Remaining: <span className="text-slate-400">{step.scope}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DebugDemo() {
  return (
    <div className="space-y-6">
      {/* Issue Header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-red-500/30 bg-red-500/5"
      >
        <div className="flex items-center gap-2 text-xs text-red-400 mb-2">
          <Bug className="w-3.5 h-3.5" />
          <span>Issue Under Investigation</span>
        </div>
        <p className="text-white font-medium">{debugData.issue}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
            Approach: Binary Search
          </span>
        </div>
      </motion.div>

      {/* Debug Steps */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Target className="w-3.5 h-3.5" />
          Systematic Investigation
        </h4>
        <div>
          {debugData.steps.map((step, index) => (
            <DebugStepCard
              key={step.stepNumber}
              step={step}
              index={index}
              isLast={index === debugData.steps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Root Cause */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
      >
        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Root Cause Identified</span>
        </div>
        <p className="text-sm text-slate-300">{debugData.rootCause}</p>
      </motion.div>

      {/* Resolution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.05)]"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-primary)/0.2)] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
          </div>
          <div>
            <div className="text-xs font-medium text-[hsl(var(--brand-primary))] mb-1">
              Resolution
            </div>
            <p className="text-sm text-slate-300">{debugData.resolution}</p>
          </div>
        </div>
      </motion.div>

      {/* Method badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Binary Search Debugging • 3 Steps to Root Cause</span>
      </div>
    </div>
  );
}

export default DebugDemo;
