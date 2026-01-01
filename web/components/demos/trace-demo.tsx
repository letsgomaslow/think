"use client";

import React from "react";
import {
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  GitBranch,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

// Demo data: Researcher exploring quantum computing implications
// Interface matches MCP JSON schema from /src/tools/traceServer.ts
interface ThoughtStep {
  id: string;                  // Internal React key (not in MCP schema)

  // Required MCP fields:
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;  // Required MCP field

  // Optional MCP fields:
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;

  // UI semantic fields (derived for display):
  isBranch?: boolean;          // Derived from branchFromThought !== undefined
  complete?: boolean;          // Derived from nextThoughtNeeded === false
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
      color: "hsl(159 43% 60%)", // brand-primary
      label: "Conclusion",
      badgeBg: "bg-[hsl(159_43%_60%/0.15)]",
      badgeText: "text-[hsl(159_43%_60%)]",
    };
  }
  if (step.isRevision) {
    return {
      icon: RotateCcw,
      color: "hsl(330 72% 70%)", // brand-accent
      label: `Revises Thought #${step.revisesThought}`,
      badgeBg: "bg-[hsl(330_72%_70%/0.15)]",
      badgeText: "text-[hsl(330_72%_70%)]",
    };
  }
  if (step.isBranch) {
    return {
      icon: GitBranch,
      color: "hsl(45 93% 60%)",
      label: step.branchId === "defense" ? "Defense Path" : "Offense Path",
      badgeBg: "bg-[hsl(45_93%_60%/0.15)]",
      badgeText: "text-[hsl(45_93%_60%)]",
    };
  }
  return {
    icon: Lightbulb,
    color: "hsl(200 70% 60%)",
    label: "Reasoning",
    badgeBg: "bg-[hsl(200_70%_60%/0.15)]",
    badgeText: "text-[hsl(200_70%_60%)]",
  };
}

// Timeline entry content component
function ThoughtContent({ step }: { step: ThoughtStep }) {
  const style = getStepStyle(step);
  const Icon = style.icon;

  return (
    <div className="space-y-3">
      {/* Type badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.badgeBg} ${style.badgeText}`}
        >
          <Icon className="w-3 h-3" />
          {style.label}
        </span>
        {step.nextThoughtNeeded ? (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            thinking...
          </span>
        ) : (
          <span className="text-xs text-[hsl(159_43%_60%)] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Complete
          </span>
        )}
      </div>

      {/* Thought content */}
      <p className="text-slate-300 text-sm leading-relaxed">{step.thought}</p>

      {/* Branch indicator */}
      {step.isBranch && (
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
          <GitBranch className="w-3 h-3" />
          <span>Branched from thought #{step.branchFromThought}</span>
        </div>
      )}
    </div>
  );
}

// Timeline-based Trace Demo with scroll-animated progress line
export function TraceDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full font-sans" ref={containerRef}>
      {/* Timeline */}
      <div ref={ref} className="relative max-w-4xl mx-auto pb-8">
        {traceData.map((step, index) => {
          const style = getStepStyle(step);

          return (
            <div
              key={step.id}
              className="flex justify-start pt-6 md:pt-12 md:gap-8"
            >
              {/* Left: Sticky step number */}
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-48">
                {/* Step indicator */}
                <div
                  className="h-10 absolute left-3 md:left-3 w-10 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: style.color }}
                >
                  {step.isRevision ? (
                    <RotateCcw className="w-4 h-4 text-white" />
                  ) : step.isBranch ? (
                    <GitBranch className="w-4 h-4 text-white" />
                  ) : !step.nextThoughtNeeded ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {step.thoughtNumber}
                    </span>
                  )}
                </div>

                {/* Step title */}
                <h3 className="hidden md:block text-lg md:pl-20 font-semibold text-slate-400">
                  {step.isRevision
                    ? "Revision"
                    : step.isBranch
                      ? `Branch ${step.branchId === "defense" ? "A" : "B"}`
                      : !step.nextThoughtNeeded
                        ? "Synthesis"
                        : `Step ${step.thoughtNumber}`}
                </h3>
              </div>

              {/* Right: Content */}
              <div className="relative pl-20 pr-4 md:pl-4 w-full">
                <h3 className="md:hidden block text-lg mb-3 text-left font-semibold text-slate-400">
                  {step.isRevision
                    ? "Revision"
                    : step.isBranch
                      ? `Branch ${step.branchId === "defense" ? "A" : "B"}`
                      : !step.nextThoughtNeeded
                        ? "Synthesis"
                        : `Step ${step.thoughtNumber}`}
                </h3>

                {/* Thought card */}
                <div
                  className="p-4 rounded-xl border transition-all"
                  style={{
                    backgroundColor: `${style.color}10`,
                    borderColor: `${style.color}30`,
                  }}
                >
                  <ThoughtContent step={step} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Animated progress line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-slate-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[hsl(159_43%_60%)] via-[hsl(200_70%_60%)] to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>

      {/* Summary footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 py-4 border-t border-slate-700/50"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[hsl(200_70%_60%)]" />5
              thoughts
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[hsl(330_72%_70%)]" />1
              revision
            </span>
            <span className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[hsl(45_93%_60%)]" />2
              branches
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[hsl(159_43%_60%)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Chain complete
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TraceDemo;
