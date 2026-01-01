"use client";

import React, { useRef, forwardRef } from "react";
import { motion } from "motion/react";
import {
  GitBranch,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Brain,
} from "lucide-react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";

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
      "Quantum computers use qubits that can exist in superposition, allowing them to process multiple states simultaneously.",
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
  },
  {
    id: "t2",
    thoughtNumber: 2,
    totalThoughts: 6,
    thought:
      "Current encryption (RSA, ECC) relies on the difficulty of factoring large numbers. Classical computers would need billions of years to break 2048-bit RSA.",
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
  },
  {
    id: "t3",
    thoughtNumber: 3,
    totalThoughts: 6,
    thought:
      "Shor's algorithm could break RSA in hours. But wait - I should revise my estimate...",
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
    isRevision: false,
  },
  {
    id: "t3-rev",
    thoughtNumber: 3,
    totalThoughts: 7,
    thought:
      "Revision: Breaking 2048-bit RSA requires ~4,000 logical qubits. Current computers have ~1,000 with high error rates. Timeline: 10-15 years.",
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
      '"Harvest now, decrypt later" threat: Adversaries may store encrypted data today to decrypt once quantum computers mature.',
    nextThoughtNeeded: true,
    needsMoreThoughts: true,
  },
  {
    id: "t5-branch-a",
    thoughtNumber: 5,
    totalThoughts: 7,
    thought:
      "Defense: Post-quantum cryptography (CRYSTALS-Kyber) uses lattice problems hard for both classical and quantum computers.",
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
      "Offense: Quantum key distribution (QKD) uses quantum mechanics for provably secure key exchange.",
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
      "Synthesis: Start migration now with (1) inventory assets, (2) prioritize data, (3) hybrid implementations, (4) monitor NIST standards.",
    nextThoughtNeeded: false,
    complete: true,
    needsMoreThoughts: false,
  },
];

// Get step styling
function getStepStyle(step: ThoughtStep) {
  if (!step.nextThoughtNeeded) {
    return {
      icon: CheckCircle2,
      color: "#6EBC99", // brand-primary
      label: "Conclusion",
      beamColor: "#6EBC99",
    };
  }
  if (step.isRevision) {
    return {
      icon: RotateCcw,
      color: "#E590B3", // brand-accent
      label: `Revises #${step.revisesThought}`,
      beamColor: "#E590B3",
    };
  }
  if (step.isBranch) {
    return {
      icon: GitBranch,
      color: "#F5C84C", // yellow
      label: step.branchId === "defense" ? "Defense" : "Offense",
      beamColor: "#F5C84C",
    };
  }
  return {
    icon: Lightbulb,
    color: "#5BA3D9", // blue
    label: "Step",
    beamColor: "#5BA3D9",
  };
}

// Compact thought node component
const ThoughtNode = forwardRef<
  HTMLDivElement,
  { step: ThoughtStep; className?: string }
>(({ step, className }, ref) => {
  const style = getStepStyle(step);
  const Icon = style.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative p-3 rounded-xl border bg-slate-900/80 backdrop-blur-sm max-w-xs",
        className
      )}
      style={{ borderColor: `${style.color}40` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${style.color}20` }}
        >
          {step.isRevision || step.isBranch || !step.nextThoughtNeeded ? (
            <Icon className="w-3.5 h-3.5" style={{ color: style.color }} />
          ) : (
            <span
              className="text-xs font-bold"
              style={{ color: style.color }}
            >
              {step.thoughtNumber}
            </span>
          )}
        </div>
        <span className="text-xs font-medium" style={{ color: style.color }}>
          {style.label}
        </span>
        {step.nextThoughtNeeded && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
        {step.thought}
      </p>
    </motion.div>
  );
});
ThoughtNode.displayName = "ThoughtNode";

// Central brain node
const CentralNode = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5BA3D9] to-[#4B2870] flex items-center justify-center shadow-lg shadow-purple-500/20",
          className
        )}
      >
        <Brain className="w-7 h-7 text-white" />
      </div>
    );
  }
);
CentralNode.displayName = "CentralNode";

export function TraceDemoBeam() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centralRef = useRef<HTMLDivElement>(null);

  // Create refs for all thought nodes
  const thoughtRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Separate data into categories for layout
  const mainThoughts = traceData.filter((s) => !s.isRevision && !s.isBranch);
  const revisions = traceData.filter((s) => s.isRevision);
  const branches = traceData.filter((s) => s.isBranch);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">
          Trace Tool - Connection View
        </h2>
        <p className="text-sm text-slate-400">
          Visualizing thought relationships with animated beams
        </p>
      </div>

      {/* Beam visualization container */}
      <div
        ref={containerRef}
        className="relative min-h-[600px] p-4 rounded-2xl border border-slate-700/50 bg-slate-900/30 overflow-hidden"
      >
        {/* Central brain */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2">
          <CentralNode ref={centralRef} />
        </div>

        {/* Main thought column (left) */}
        <div className="absolute left-4 top-24 space-y-4 w-64">
          {mainThoughts.slice(0, 3).map((step) => (
            <ThoughtNode
              key={step.id}
              ref={(el) => {
                thoughtRefs.current[step.id] = el;
              }}
              step={step}
            />
          ))}
        </div>

        {/* Continued thoughts + conclusion (right) */}
        <div className="absolute right-4 top-24 space-y-4 w-64">
          {mainThoughts.slice(3).map((step) => (
            <ThoughtNode
              key={step.id}
              ref={(el) => {
                thoughtRefs.current[step.id] = el;
              }}
              step={step}
            />
          ))}
        </div>

        {/* Revision (center-left) */}
        <div className="absolute left-1/2 -translate-x-32 top-[280px]">
          {revisions.map((step) => (
            <ThoughtNode
              key={step.id}
              ref={(el) => {
                thoughtRefs.current[step.id] = el;
              }}
              step={step}
              className="w-56"
            />
          ))}
        </div>

        {/* Branches (bottom center) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-4">
          {branches.map((step) => (
            <ThoughtNode
              key={step.id}
              ref={(el) => {
                thoughtRefs.current[step.id] = el;
              }}
              step={step}
              className="w-48"
            />
          ))}
        </div>

        {/* Animated beams - Central to first thoughts */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={centralRef}
          toRef={{ current: thoughtRefs.current["t1"] }}
          curvature={-30}
          gradientStartColor="#5BA3D9"
          gradientStopColor="#4B2870"
          pathColor="#334155"
          duration={4}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={centralRef}
          toRef={{ current: thoughtRefs.current["t4"] }}
          curvature={30}
          gradientStartColor="#5BA3D9"
          gradientStopColor="#6EBC99"
          pathColor="#334155"
          duration={4}
          delay={0.3}
        />

        {/* Sequential beams (left column) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t1"] }}
          toRef={{ current: thoughtRefs.current["t2"] }}
          curvature={0}
          gradientStartColor="#5BA3D9"
          gradientStopColor="#5BA3D9"
          pathColor="#334155"
          duration={3}
          delay={0.5}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t2"] }}
          toRef={{ current: thoughtRefs.current["t3"] }}
          curvature={0}
          gradientStartColor="#5BA3D9"
          gradientStopColor="#5BA3D9"
          pathColor="#334155"
          duration={3}
          delay={0.8}
        />

        {/* Revision beam (t3 to t3-rev) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t3"] }}
          toRef={{ current: thoughtRefs.current["t3-rev"] }}
          curvature={50}
          gradientStartColor="#E590B3"
          gradientStopColor="#E590B3"
          pathColor="#E590B340"
          pathWidth={2}
          duration={2.5}
          delay={1}
        />

        {/* Sequential beam (right column) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t4"] }}
          toRef={{ current: thoughtRefs.current["t6"] }}
          curvature={0}
          gradientStartColor="#5BA3D9"
          gradientStopColor="#6EBC99"
          pathColor="#334155"
          duration={3}
          delay={1.2}
        />

        {/* Branch beams (t4 to branches) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t4"] }}
          toRef={{ current: thoughtRefs.current["t5-branch-a"] }}
          curvature={-60}
          gradientStartColor="#F5C84C"
          gradientStopColor="#F5C84C"
          pathColor="#F5C84C30"
          pathWidth={2}
          duration={3}
          delay={1.5}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t5-branch-b"] }}
          toRef={{ current: thoughtRefs.current["t4"] }}
          curvature={60}
          reverse
          gradientStartColor="#F5C84C"
          gradientStopColor="#F5C84C"
          pathColor="#F5C84C30"
          pathWidth={2}
          duration={3}
          delay={1.8}
        />

        {/* Convergence beams (branches to conclusion) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t5-branch-a"] }}
          toRef={{ current: thoughtRefs.current["t6"] }}
          curvature={-40}
          gradientStartColor="#F5C84C"
          gradientStopColor="#6EBC99"
          pathColor="#334155"
          duration={3.5}
          delay={2}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={{ current: thoughtRefs.current["t5-branch-b"] }}
          toRef={{ current: thoughtRefs.current["t6"] }}
          curvature={40}
          gradientStartColor="#F5C84C"
          gradientStopColor="#6EBC99"
          pathColor="#334155"
          duration={3.5}
          delay={2.2}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#5BA3D9] to-[#5BA3D9]" />
          Sequential
        </span>
        <span className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#E590B3] to-[#E590B3]" />
          Revision
        </span>
        <span className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#F5C84C] to-[#F5C84C]" />
          Branch
        </span>
        <span className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#6EBC99] to-[#6EBC99]" />
          Conclusion
        </span>
      </div>
    </div>
  );
}

export default TraceDemoBeam;
