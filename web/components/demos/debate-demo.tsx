"use client";

import React, { useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ThumbsUp,
  ThumbsDown,
  GitMerge,
  AlertTriangle,
  Shield,
  Swords,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Link2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  debateData,
  argumentTypeStyles,
  type Argument,
  type ArgumentType,
} from "./debate-demo-data";

// Icon mapping
const iconMap = {
  ThumbsUp,
  ThumbsDown,
  GitMerge,
  AlertTriangle,
  Shield,
};

// Get icon component by name
function getIcon(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap] || ThumbsUp;
}

// Argument relationship badge
function RelationshipBadge({
  type,
  targetId,
}: {
  type: "responds" | "supports" | "contradicts";
  targetId: string;
}) {
  const colors = {
    responds: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    supports: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    contradicts: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  const labels = {
    responds: "Responds to",
    supports: "Supports",
    contradicts: "Contradicts",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border",
        colors[type]
      )}
    >
      <Link2 className="w-2.5 h-2.5" />
      {labels[type]} {targetId}
    </span>
  );
}

// Flow state indicator
function FlowStateIndicator({
  nextArgumentNeeded,
  suggestedNextTypes,
}: {
  nextArgumentNeeded: boolean;
  suggestedNextTypes?: ArgumentType[];
}) {
  if (!nextArgumentNeeded) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Resolution Reached
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-amber-400">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Debate Continues
      </div>
      {suggestedNextTypes && suggestedNextTypes.length > 0 && (
        <div className="flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-slate-500">Next:</span>
          {suggestedNextTypes.map((type) => (
            <span
              key={type}
              className="px-1.5 py-0.5 rounded text-[10px] capitalize"
              style={{
                backgroundColor: argumentTypeStyles[type].bgColor,
                color: argumentTypeStyles[type].color,
              }}
            >
              {type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact argument card for the dialectical view
function ArgumentCard({
  argument,
  nodeRef,
  isActive,
  onClick,
  showBeamTarget,
}: {
  argument: Argument;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  onClick: () => void;
  showBeamTarget?: boolean;
}) {
  const style = argumentTypeStyles[argument.argumentType];
  const Icon = getIcon(style.icon);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      ref={nodeRef as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative rounded-xl border overflow-hidden cursor-pointer transition-all",
        isActive && "ring-2 ring-offset-2 ring-offset-slate-950"
      )}
      style={{
        backgroundColor: style.bgColor,
        borderColor: style.borderColor,
        ...(isActive && { ringColor: style.color }),
      }}
      onClick={onClick}
    >
      {/* Highlight beam for synthesis */}
      {argument.argumentType === "synthesis" && (
        <BorderBeam
          size={120}
          duration={8}
          colorFrom={style.beamColor}
          colorTo="#a855f7"
        />
      )}

      {/* Header */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between"
        style={{ borderColor: style.borderColor }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${style.color}20` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: style.color }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: style.color }}>
              {style.label}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {argument.argumentId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Confidence:</span>
            <span className="text-xs font-medium" style={{ color: style.color }}>
              {Math.round(argument.confidence * 100)}%
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-1 hover:bg-white/5 rounded"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Relationship badges */}
        {(argument.respondsTo ||
          (argument.supports && argument.supports.length > 0) ||
          (argument.contradicts && argument.contradicts.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {argument.respondsTo && (
              <RelationshipBadge type="responds" targetId={argument.respondsTo} />
            )}
            {argument.supports?.map((id) => (
              <RelationshipBadge key={id} type="supports" targetId={id} />
            ))}
            {argument.contradicts?.map((id) => (
              <RelationshipBadge key={id} type="contradicts" targetId={id} />
            ))}
          </div>
        )}

        {/* Claim */}
        <p className="text-sm text-white font-medium leading-snug">
          {argument.claim}
        </p>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Premises */}
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1.5">
                  Premises
                </span>
                <ul className="space-y-1">
                  {argument.premises.map((premise, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-xs text-slate-300"
                    >
                      <span style={{ color: style.color }}>•</span>
                      {premise}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conclusion */}
              <div
                className="p-2 rounded-lg border"
                style={{
                  backgroundColor: `${style.color}08`,
                  borderColor: `${style.color}20`,
                }}
              >
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                  Conclusion
                </span>
                <p className="text-xs" style={{ color: style.color }}>
                  {argument.conclusion}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mb-1">
                    <ThumbsUp className="w-2.5 h-2.5" /> Strengths
                  </span>
                  <ul className="space-y-0.5">
                    {argument.strengths.map((s, i) => (
                      <li key={i} className="text-[10px] text-slate-400">
                        + {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] text-red-400 flex items-center gap-1 mb-1">
                    <ThumbsDown className="w-2.5 h-2.5" /> Weaknesses
                  </span>
                  <ul className="space-y-0.5">
                    {argument.weaknesses.map((w, i) => (
                      <li key={i} className="text-[10px] text-slate-400">
                        - {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Flow indicator */}
              <div className="pt-1 border-t border-slate-700/50">
                <FlowStateIndicator
                  nextArgumentNeeded={argument.nextArgumentNeeded}
                  suggestedNextTypes={argument.suggestedNextTypes}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Main debate demo component with dialectical layout
export function DebateDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeArgument, setActiveArgument] = useState<string | null>(null);

  // Create refs for each argument for AnimatedBeam connections
  const argumentRefs = useMemo(() => {
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {};
    debateData.arguments.forEach((arg) => {
      refs[arg.argumentId] = React.createRef<HTMLDivElement>();
    });
    return refs;
  }, []);

  // Organize arguments by type for dialectical layout
  const thesis = debateData.arguments.find((a) => a.argumentType === "thesis");
  const antithesis = debateData.arguments.find(
    (a) => a.argumentType === "antithesis"
  );
  const objection = debateData.arguments.find(
    (a) => a.argumentType === "objection"
  );
  const rebuttal = debateData.arguments.find(
    (a) => a.argumentType === "rebuttal"
  );
  const synthesis = debateData.arguments.find(
    (a) => a.argumentType === "synthesis"
  );

  return (
    <div ref={containerRef} className="relative space-y-4">
      {/* Thesis vs Antithesis - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {thesis && (
          <BlurFade delay={0.1}>
            <ArgumentCard
              argument={thesis}
              nodeRef={argumentRefs[thesis.argumentId]}
              isActive={activeArgument === thesis.argumentId}
              onClick={() =>
                setActiveArgument(
                  activeArgument === thesis.argumentId ? null : thesis.argumentId
                )
              }
            />
          </BlurFade>
        )}
        {antithesis && (
          <BlurFade delay={0.2}>
            <ArgumentCard
              argument={antithesis}
              nodeRef={argumentRefs[antithesis.argumentId]}
              isActive={activeArgument === antithesis.argumentId}
              onClick={() =>
                setActiveArgument(
                  activeArgument === antithesis.argumentId
                    ? null
                    : antithesis.argumentId
                )
              }
            />
          </BlurFade>
        )}
      </div>

      {/* VS indicator */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-400">Dialectical Exchange</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* Objection & Rebuttal - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {objection && (
          <BlurFade delay={0.3}>
            <ArgumentCard
              argument={objection}
              nodeRef={argumentRefs[objection.argumentId]}
              isActive={activeArgument === objection.argumentId}
              onClick={() =>
                setActiveArgument(
                  activeArgument === objection.argumentId
                    ? null
                    : objection.argumentId
                )
              }
            />
          </BlurFade>
        )}
        {rebuttal && (
          <BlurFade delay={0.4}>
            <ArgumentCard
              argument={rebuttal}
              nodeRef={argumentRefs[rebuttal.argumentId]}
              isActive={activeArgument === rebuttal.argumentId}
              onClick={() =>
                setActiveArgument(
                  activeArgument === rebuttal.argumentId
                    ? null
                    : rebuttal.argumentId
                )
              }
            />
          </BlurFade>
        )}
      </div>

      {/* Synthesis - Full Width */}
      {synthesis && (
        <BlurFade delay={0.5}>
          <ArgumentCard
            argument={synthesis}
            nodeRef={argumentRefs[synthesis.argumentId]}
            isActive={activeArgument === synthesis.argumentId}
            onClick={() =>
              setActiveArgument(
                activeArgument === synthesis.argumentId
                  ? null
                  : synthesis.argumentId
              )
            }
          />
        </BlurFade>
      )}

      {/* AnimatedBeam connections */}
      {/* Thesis to Antithesis contradiction */}
      {thesis && antithesis && (
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={argumentRefs[thesis.argumentId]}
          toRef={argumentRefs[antithesis.argumentId]}
          curvature={-50}
          pathColor="rgba(244, 63, 94, 0.2)"
          gradientStartColor="#f43f5e"
          gradientStopColor="#fb7185"
          pathWidth={1.5}
          duration={4}
        />
      )}

      {/* Objection contradicts antithesis, supports thesis */}
      {objection && antithesis && (
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={argumentRefs[objection.argumentId]}
          toRef={argumentRefs[antithesis.argumentId]}
          curvature={30}
          pathColor="rgba(244, 63, 94, 0.2)"
          gradientStartColor="#f59e0b"
          gradientStopColor="#f43f5e"
          pathWidth={1.5}
          duration={5}
        />
      )}

      {/* Rebuttal supports antithesis */}
      {rebuttal && antithesis && (
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={argumentRefs[rebuttal.argumentId]}
          toRef={argumentRefs[antithesis.argumentId]}
          curvature={-30}
          pathColor="rgba(16, 185, 129, 0.2)"
          gradientStartColor="#10b981"
          gradientStopColor="#22d3ee"
          pathWidth={1.5}
          duration={5}
          reverse
        />
      )}

      {/* Synthesis connects to both thesis and antithesis */}
      {synthesis && thesis && (
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={argumentRefs[synthesis.argumentId]}
          toRef={argumentRefs[thesis.argumentId]}
          curvature={40}
          pathColor="rgba(168, 85, 247, 0.2)"
          gradientStartColor="#a855f7"
          gradientStopColor="#3b82f6"
          pathWidth={1.5}
          duration={6}
          reverse
        />
      )}
      {synthesis && antithesis && (
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={argumentRefs[synthesis.argumentId]}
          toRef={argumentRefs[antithesis.argumentId]}
          curvature={-40}
          pathColor="rgba(168, 85, 247, 0.2)"
          gradientStartColor="#a855f7"
          gradientStopColor="#f43f5e"
          pathWidth={1.5}
          duration={6}
          reverse
        />
      )}

      {/* Final Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.05)]"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand-primary)/0.2)] flex items-center justify-center flex-shrink-0">
            <Swords className="w-5 h-5 text-[hsl(var(--brand-primary))]" />
          </div>
          <div>
            <div className="text-xs font-medium text-[hsl(var(--brand-primary))] mb-1">
              Dialectical Resolution
            </div>
            <p className="text-sm text-slate-300">{debateData.finalVerdict}</p>
          </div>
        </div>
      </motion.div>

      {/* Argument flow legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gradient-to-r from-rose-500 to-rose-400" />
          <span>Contradicts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-400" />
          <span>Supports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          <span>Synthesizes</span>
        </div>
      </div>
    </div>
  );
}

export default DebateDemo;
