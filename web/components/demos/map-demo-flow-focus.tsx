"use client";

/**
 * Map Demo - Combo 1: Flow Focus
 *
 * Components used:
 * - AnimatedBeam: For visualizing data flow between nodes
 * - TransitionPanel: For smooth step-by-step navigation
 * - Disclosure: For collapsible cognitive outputs
 * - BorderBeam: For highlighting active elements
 *
 * Best for: Flowcharts and data flow visualization
 */

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { TransitionPanel } from "@/components/ui/transition-panel";
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/ui/disclosure";
import { BorderBeam } from "@/components/ui/border-beam";
import { mapDemoSteps, operationLabels } from "./map-demo-data";
import {
  Megaphone,
  Search,
  Scale,
  ShoppingCart,
  Heart,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  FlaskConical,
  Play,
  Layers,
  GitBranch,
  RotateCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  megaphone: Megaphone,
  search: Search,
  scale: Scale,
  cart: ShoppingCart,
  heart: Heart,
  users: Users,
  refresh: RefreshCw,
};

const operationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  create: Play,
  observe: Eye,
  update: Layers,
  transform: RotateCw,
  delete: GitBranch,
};

export function MapDemoFlowFocus() {
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Node refs for animated beams
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const step = mapDemoSteps[currentStep];
  const nodes = step.elements.filter(el => el.type === 'node');
  const edges = step.elements.filter(el => el.type === 'edge');

  const handlePrev = () => setCurrentStep(Math.max(0, currentStep - 1));
  const handleNext = () => setCurrentStep(Math.min(mapDemoSteps.length - 1, currentStep + 1));

  return (
    <div className="space-y-6">
      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mapDemoSteps.map((s, i) => {
            const Icon = operationIcons[s.operation];
            const isActive = i === currentStep;
            const isPast = i < currentStep;

            return (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : isPast
                    ? "bg-slate-800/50 text-slate-400"
                    : "bg-slate-800/30 text-slate-500"
                )}
              >
                {isActive && (
                  <BorderBeam
                    size={60}
                    duration={3}
                    colorFrom="#3b82f6"
                    colorTo="#8b5cf6"
                  />
                )}
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium capitalize hidden sm:inline">
                  {operationLabels[s.operation]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500">
            {currentStep + 1} / {mapDemoSteps.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentStep === mapDemoSteps.length - 1}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content with TransitionPanel */}
      <TransitionPanel
        activeIndex={currentStep}
        className="min-h-[400px]"
        transition={{ duration: 0.4, ease: "easeInOut" }}
        variants={{
          enter: { opacity: 0, x: 20 },
          center: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
        }}
      >
        {mapDemoSteps.map((stepData, stepIndex) => (
          <div key={stepIndex} className="space-y-6">
            {/* Diagram Canvas with Animated Beams */}
            <div
              ref={containerRef}
              className="relative bg-slate-900/50 rounded-xl border border-slate-700/50 p-8 min-h-[280px] overflow-hidden"
            >
              {/* Nodes */}
              <div className="relative flex items-center justify-between gap-4 h-full">
                {nodes.map((node) => {
                  const Icon = iconMap[(node.properties.icon as string) || 'search'] || Search;
                  const isNew = node.properties.isNew as boolean;

                  return (
                    <div
                      key={node.id}
                      ref={(el) => { nodeRefs.current[node.id] = el; }}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
                        "bg-slate-800/80 border border-slate-700/50",
                        isNew && "ring-2 ring-emerald-500/50"
                      )}
                    >
                      {isNew && (
                        <BorderBeam
                          size={40}
                          duration={2}
                          colorFrom="#10b981"
                          colorTo="#22d3ee"
                        />
                      )}
                      <div className={cn(
                        "p-3 rounded-lg",
                        isNew ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                        {node.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Animated Beams for Edges */}
              {containerRef.current && edges.map((edge) => {
                const fromRef = { current: nodeRefs.current[edge.source!] };
                const toRef = { current: nodeRefs.current[edge.target!] };
                const isNew = edge.properties.isNew as boolean;

                if (!fromRef.current || !toRef.current) return null;

                return (
                  <AnimatedBeam
                    key={edge.id}
                    containerRef={containerRef as React.RefObject<HTMLElement>}
                    fromRef={fromRef as React.RefObject<HTMLElement>}
                    toRef={toRef as React.RefObject<HTMLElement>}
                    curvature={-20}
                    pathColor={isNew ? "#10b981" : "#475569"}
                    pathOpacity={isNew ? 0.4 : 0.2}
                    gradientStartColor={isNew ? "#10b981" : "#3b82f6"}
                    gradientStopColor={isNew ? "#22d3ee" : "#8b5cf6"}
                    duration={3}
                    delay={Math.random() * 2}
                  />
                );
              })}

              {/* Conversion Labels on Edges */}
              <div className="absolute inset-0 pointer-events-none">
                {edges.slice(0, Math.min(edges.length, 4)).map((edge, i) => (
                  <div
                    key={edge.id}
                    className={cn(
                      "absolute text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/50",
                      edge.properties.isNew ? "text-emerald-400" : "text-slate-400"
                    )}
                    style={{
                      left: `${18 + i * 20}%`,
                      top: '35%',
                    }}
                  >
                    {edge.properties.conversion as string}
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive Outputs with Disclosure */}
            {(stepData.observation || stepData.insight || stepData.hypothesis) && (
              <div className="grid gap-3 md:grid-cols-3">
                {stepData.observation && (
                  <CognitiveDisclosure
                    type="observation"
                    icon={Eye}
                    title="Observation"
                    content={stepData.observation}
                    color="amber"
                  />
                )}
                {stepData.insight && (
                  <CognitiveDisclosure
                    type="insight"
                    icon={Lightbulb}
                    title="Insight"
                    content={stepData.insight}
                    color="blue"
                  />
                )}
                {stepData.hypothesis && (
                  <CognitiveDisclosure
                    type="hypothesis"
                    icon={FlaskConical}
                    title="Hypothesis"
                    content={stepData.hypothesis}
                    color="purple"
                  />
                )}
              </div>
            )}

            {/* Metrics Bar */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{stepData.nodeCount} nodes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>{stepData.edgeCount} edges</span>
              </div>
              {stepData.containerCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{stepData.containerCount} containers</span>
                </div>
              )}
              {stepData.annotationCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{stepData.annotationCount} annotations</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </TransitionPanel>
    </div>
  );
}

// Collapsible disclosure for cognitive outputs
function CognitiveDisclosure({
  type,
  icon: Icon,
  title,
  content,
  color
}: {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  color: 'amber' | 'blue' | 'purple';
}) {
  const [isOpen, setIsOpen] = useState(false);

  const colorClasses = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
      hover: 'hover:bg-amber-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      hover: 'hover:bg-blue-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
      hover: 'hover:bg-purple-500/20'
    },
  };

  const colors = colorClasses[color];

  return (
    <Disclosure
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-lg border transition-colors",
        colors.bg,
        colors.border,
        colors.hover
      )}
    >
      <DisclosureTrigger>
        <div className="flex items-center justify-between p-3 cursor-pointer">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", colors.icon)} />
            <span className="text-sm font-medium text-slate-300">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </motion.div>
        </div>
      </DisclosureTrigger>
      <DisclosureContent className="px-3 pb-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          {content}
        </p>
      </DisclosureContent>
    </Disclosure>
  );
}
