"use client";

import React from "react";
import { motion } from "motion/react";
import {
  GitBranch,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Brain,
  ArrowDown,
} from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";

// Same interface and data from trace-demo.tsx
interface ThoughtStep {
  id: string;
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  isBranch?: boolean;
  needsMoreThoughts?: boolean;
  complete?: boolean;
}

const traceData: ThoughtStep[] = [
  {
    id: "t1",
    thoughtNumber: 1,
    totalThoughts: 6,
    thought:
      "Quantum computers use qubits that can exist in superposition, allowing them to process multiple states simultaneously. This exponentially increases computational power for certain problems.",
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
  },
  {
    id: "t2",
    thoughtNumber: 2,
    totalThoughts: 6,
    thought:
      "Current encryption (RSA, ECC) relies on the difficulty of factoring large numbers or solving discrete logarithms. Classical computers would need billions of years to break 2048-bit RSA.",
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
  },
  {
    id: "t3",
    thoughtNumber: 3,
    totalThoughts: 6,
    thought:
      "Shor's algorithm on a sufficiently powerful quantum computer could break RSA in hours. But wait - I should revise my estimate of 'sufficiently powerful'...",
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
    isRevision: false,
  },
  {
    id: "t3-rev",
    thoughtNumber: 3,
    totalThoughts: 7,
    thought:
      "Revision: Breaking 2048-bit RSA requires ~4,000 logical qubits. Current quantum computers have ~1,000 physical qubits with high error rates. We need error correction, requiring millions of physical qubits. Timeline: 10-15 years, not imminent.",
    nextThoughtNeeded: true,
    isRevision: true,
    revisesThought: 3,
    needsMoreThoughts: true,
  },
  {
    id: "t4",
    thoughtNumber: 4,
    totalThoughts: 7,
    thought:
      'This creates a "harvest now, decrypt later" threat. Adversaries may be storing encrypted data today to decrypt once quantum computers mature. Sensitive data with 15+ year relevance is already at risk.',
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
  },
  {
    id: "t5-branch-a",
    thoughtNumber: 5,
    totalThoughts: 7,
    thought:
      "Branch A - Defense: Post-quantum cryptography (NIST standards like CRYSTALS-Kyber) uses lattice problems that are hard for both classical and quantum computers. Migration should start now.",
    nextThoughtNeeded: true,
    isBranch: true,
    branchFromThought: 4,
    branchId: "defense",
    needsMoreThoughts: true,
  },
  {
    id: "t5-branch-b",
    thoughtNumber: 5,
    totalThoughts: 7,
    thought:
      "Branch B - Offense: Quantum key distribution (QKD) uses quantum mechanics itself for provably secure key exchange. Laws of physics prevent eavesdropping without detection.",
    nextThoughtNeeded: true,
    isBranch: true,
    branchFromThought: 4,
    branchId: "offense",
    needsMoreThoughts: true,
  },
  {
    id: "t6",
    thoughtNumber: 6,
    totalThoughts: 7,
    thought:
      "Synthesis: Organizations should (1) inventory cryptographic assets, (2) prioritize long-lived sensitive data, (3) begin hybrid classical/post-quantum implementations, (4) monitor NIST standards. The threat is real but manageable with proactive migration.",
    nextThoughtNeeded: false,
    complete: true,
    needsMoreThoughts: false,
  },
];

// Get step styling based on type
function getStepStyle(step: ThoughtStep) {
  if (!step.nextThoughtNeeded) {
    return {
      icon: CheckCircle2,
      color: "hsl(159 43% 60%)",
      label: "Conclusion",
      gradient: "from-[hsl(159_43%_60%)] to-[hsl(159_43%_45%)]",
      bgColor: "hsl(159 43% 60% / 0.1)",
      borderColor: "hsl(159 43% 60% / 0.3)",
    };
  }
  if (step.isRevision) {
    return {
      icon: RotateCcw,
      color: "hsl(330 72% 70%)",
      label: `Revises #${step.revisesThought}`,
      gradient: "from-[hsl(330_72%_70%)] to-[hsl(330_72%_55%)]",
      bgColor: "hsl(330 72% 70% / 0.1)",
      borderColor: "hsl(330 72% 70% / 0.3)",
    };
  }
  if (step.isBranch) {
    return {
      icon: GitBranch,
      color: "hsl(45 93% 60%)",
      label: step.branchId === "defense" ? "Defense Path" : "Offense Path",
      gradient: "from-[hsl(45_93%_60%)] to-[hsl(45_93%_45%)]",
      bgColor: "hsl(45 93% 60% / 0.1)",
      borderColor: "hsl(45 93% 60% / 0.3)",
    };
  }
  return {
    icon: Lightbulb,
    color: "hsl(200 70% 60%)",
    label: "Reasoning",
    gradient: "from-[hsl(200_70%_60%)] to-[hsl(200_70%_45%)]",
    bgColor: "hsl(200 70% 60% / 0.1)",
    borderColor: "hsl(200 70% 60% / 0.2)",
  };
}

// Individual thought card with animations
function ThoughtCard({ step, index }: { step: ThoughtStep; index: number }) {
  const style = getStepStyle(step);
  const Icon = style.icon;

  return (
    <BlurFade delay={0.1 + index * 0.15} direction="up">
      <div className="relative">
        {/* Connection arrow for non-branch items */}
        {index > 0 && !step.isBranch && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-0.5 h-4 bg-gradient-to-b from-slate-600 to-slate-500" />
            <ArrowDown className="w-3 h-3 text-slate-500 -mt-1" />
          </div>
        )}

        {/* Branch connection */}
        {step.isBranch && (
          <div className="absolute -top-6 left-6 flex items-end">
            <div className="w-0.5 h-3 bg-slate-600" />
            <div className="w-4 h-0.5 bg-slate-600 -ml-0.5" />
            <GitBranch className="w-3 h-3 text-slate-500 -ml-1 -mb-0.5" />
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          style={{
            backgroundColor: style.bgColor,
            borderColor: style.borderColor,
          }}
        >
          <div className="flex gap-4">
            {/* Animated number badge */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              {step.isRevision ? (
                <RotateCcw className="w-5 h-5 text-white" />
              ) : step.isBranch ? (
                <GitBranch className="w-5 h-5 text-white" />
              ) : !step.nextThoughtNeeded ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <span className="text-lg font-bold text-white">
                  <NumberTicker
                    value={step.thoughtNumber}
                    delay={0.2 + index * 0.15}
                  />
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${style.color.replace(")", " / 0.15)")}`,
                    color: style.color,
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {style.label}
                </span>

                {/* Progress indicator */}
                <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                  {step.nextThoughtNeeded ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>thinking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        className="w-3 h-3"
                        style={{ color: style.color }}
                      />
                      <span style={{ color: style.color }}>Complete</span>
                    </>
                  )}
                </span>
              </div>

              {/* Thought text */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {step.thought}
              </p>

              {/* Branch metadata */}
              {step.isBranch && (
                <div className="mt-2 pt-2 border-t border-slate-700/30 text-xs text-slate-500 flex items-center gap-1.5">
                  <GitBranch className="w-3 h-3" />
                  Exploring from thought #{step.branchFromThought}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}

export function TraceDemoStagger() {
  // Count stats
  const totalThoughts = traceData.filter(
    (s) => !s.isRevision && !s.isBranch
  ).length;
  const revisions = traceData.filter((s) => s.isRevision).length;
  const branches = traceData.filter((s) => s.isBranch).length;

  return (
    <div className="w-full">
      {/* Header with animated stats */}
      <BlurFade delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(200_70%_60%)] to-[hsl(263_66%_28%)] flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Trace Tool
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                <NumberTicker value={traceData.length} delay={0.5} /> steps
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Sequential thinking with revisions & branches
            </p>
          </div>
        </div>
      </BlurFade>

      {/* Thought chain with AnimatedGroup for stagger */}
      <AnimatedGroup preset="blur-slide" className="space-y-8">
        {traceData.map((step, index) => (
          <ThoughtCard key={step.id} step={step} index={index} />
        ))}
      </AnimatedGroup>

      {/* Summary footer */}
      <BlurFade delay={0.8 + traceData.length * 0.1}>
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-[hsl(200_70%_60%/0.2)] flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5 text-[hsl(200_70%_60%)]" />
                </div>
                <NumberTicker value={totalThoughts} delay={1} />
                <span className="text-xs">thoughts</span>
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-[hsl(330_72%_70%/0.2)] flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5 text-[hsl(330_72%_70%)]" />
                </div>
                <NumberTicker value={revisions} delay={1.1} />
                <span className="text-xs">revision</span>
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-[hsl(45_93%_60%/0.2)] flex items-center justify-center">
                  <GitBranch className="w-3.5 h-3.5 text-[hsl(45_93%_60%)]" />
                </div>
                <NumberTicker value={branches} delay={1.2} />
                <span className="text-xs">branches</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[hsl(159_43%_60%)]">
              <CheckCircle2 className="w-4 h-4" />
              Chain complete
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}

export default TraceDemoStagger;
