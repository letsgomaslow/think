"use client";

/**
 * Map Demo - Flow Focus Design
 *
 * Uses the Flow Focus UI pattern:
 * - AnimatedBeam: For visualizing data flow between nodes
 * - TransitionPanel: For smooth step-by-step navigation
 * - Disclosure: For collapsible cognitive outputs
 * - BorderBeam: For highlighting active elements
 */

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { TransitionPanel } from "@/components/ui/transition-panel";
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/ui/disclosure";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  mapDemoSteps,
  MapDemoStep,
  operationLabels,
  diagramTypeLabels,
  transformTypeLabels,
  OperationType,
} from "./map-demo-data";
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
  Pause,
  Layers,
  RotateCw,
  GitBranch,
  CheckCircle2,
  Loader2,
  Workflow,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon maps
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

// ============================================================================
// Step Navigation with BorderBeam Highlighting
// ============================================================================
function StepNavigation({
  currentStep,
  onStepChange,
  isPlaying,
  onTogglePlay,
}: {
  currentStep: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  const handlePrev = () => onStepChange(Math.max(0, currentStep - 1));
  const handleNext = () => onStepChange(Math.min(mapDemoSteps.length - 1, currentStep + 1));

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {mapDemoSteps.map((s, i) => {
          const Icon = operationIcons[s.operation];
          const isActive = i === currentStep;
          const isPast = i < currentStep;

          return (
            <button
              key={i}
              onClick={() => onStepChange(i)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
                isActive
                  ? "bg-blue-500/20 text-blue-400"
                  : isPast
                  ? "bg-slate-800/50 text-slate-400"
                  : "bg-slate-800/30 text-slate-500 hover:bg-slate-800/50"
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
        <button
          onClick={onTogglePlay}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isPlaying
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          )}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === mapDemoSteps.length - 1}
          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-xs text-slate-500 ml-2">
          {currentStep + 1} / {mapDemoSteps.length}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Diagram Canvas with AnimatedBeam
// ============================================================================
function DiagramCanvas({ step }: { step: MapDemoStep }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const nodes = step.elements.filter((el) => el.type === "node");
  const edges = step.elements.filter((el) => el.type === "edge");
  const containers = step.elements.filter((el) => el.type === "container");
  const annotations = step.elements.filter((el) => el.type === "annotation");

  // Group nodes by container if containers exist
  const getNodesInContainer = (containerId: string) => {
    const container = containers.find((c) => c.id === containerId);
    return nodes.filter((n) => container?.contains?.includes(n.id));
  };

  const ungroupedNodes = containers.length > 0
    ? nodes.filter((n) => !containers.some((c) => c.contains?.includes(n.id)))
    : nodes;

  return (
    <div
      ref={containerRef}
      className="relative bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 min-h-[300px] overflow-hidden"
    >
      {/* Header info */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/70">
            <Workflow className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">{diagramTypeLabels[step.diagramType]}</span>
          </div>
          {step.transformationType && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/20 text-purple-400">
              <RotateCw className="w-3 h-3" />
              <span>{transformTypeLabels[step.transformationType]}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs",
          step.nextOperationNeeded
            ? "bg-amber-500/10 text-amber-400"
            : "bg-emerald-500/10 text-emerald-400"
        )}>
          {step.nextOperationNeeded ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> In Progress</>
          ) : (
            <><CheckCircle2 className="w-3 h-3" /> Complete</>
          )}
        </div>
      </div>

      {/* Container Groups */}
      {containers.length > 0 ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {containers.map((container) => {
            const containedNodes = getNodesInContainer(container.id);
            return (
              <div
                key={container.id}
                className={cn(
                  "relative p-4 rounded-xl border-2 border-dashed",
                  container.properties.color === "blue"
                    ? "border-blue-500/30 bg-blue-500/5"
                    : "border-emerald-500/30 bg-emerald-500/5"
                )}
              >
                <span
                  className={cn(
                    "absolute -top-3 left-3 px-2 py-0.5 text-xs font-medium rounded bg-slate-900",
                    container.properties.color === "blue"
                      ? "text-blue-400"
                      : "text-emerald-400"
                  )}
                >
                  {container.label}
                </span>
                <div className="flex flex-wrap gap-3 pt-2">
                  {containedNodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      nodeRefs={nodeRefs}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {/* Ungrouped nodes */}
          {ungroupedNodes.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/20">
              <div className="flex flex-wrap gap-3">
                {ungroupedNodes.map((node) => (
                  <NodeCard key={node.id} node={node} nodeRefs={nodeRefs} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Linear flow when no containers
        <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-2">
              <NodeCard node={node} nodeRefs={nodeRefs} />
              {index < nodes.length - 1 && (
                <div className="flex flex-col items-center gap-0.5">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  {edges[index] && (
                    <span className="text-[9px] font-mono text-slate-500">
                      {edges[index].properties.conversion as string}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Annotations */}
      {annotations.length > 0 && (
        <div className="mt-4 flex justify-center gap-2">
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20"
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400">{annotation.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* AnimatedBeams for connections (only for non-container views) */}
      {containers.length === 0 && containerRef.current && edges.map((edge) => {
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
    </div>
  );
}

// Node card component
function NodeCard({
  node,
  nodeRefs,
}: {
  node: { id: string; label?: string; properties: Record<string, unknown> };
  nodeRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  const Icon = iconMap[(node.properties.icon as string) || "search"] || Search;
  const isNew = node.properties.isNew as boolean;

  return (
    <div
      ref={(el) => {
        nodeRefs.current[node.id] = el;
      }}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300",
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
      <div
        className={cn(
          "p-3 rounded-lg",
          isNew ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
        {node.label}
      </span>
    </div>
  );
}

// ============================================================================
// Cognitive Output with Disclosure
// ============================================================================
function CognitiveOutputPanel({ step }: { step: MapDemoStep }) {
  const hasOutput = step.observation || step.insight || step.hypothesis;
  if (!hasOutput) return null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {step.observation && (
        <CognitiveDisclosure
          type="observation"
          icon={Eye}
          title="Observation"
          content={step.observation}
          color="amber"
        />
      )}
      {step.insight && (
        <CognitiveDisclosure
          type="insight"
          icon={Lightbulb}
          title="Insight"
          content={step.insight}
          color="blue"
        />
      )}
      {step.hypothesis && (
        <CognitiveDisclosure
          type="hypothesis"
          icon={FlaskConical}
          title="Hypothesis"
          content={step.hypothesis}
          color="purple"
        />
      )}
    </div>
  );
}

function CognitiveDisclosure({
  type,
  icon: Icon,
  title,
  content,
  color,
}: {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  color: "amber" | "blue" | "purple";
}) {
  const [isOpen, setIsOpen] = useState(false);

  const colorClasses = {
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: "text-amber-400",
      hover: "hover:bg-amber-500/20",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: "text-blue-400",
      hover: "hover:bg-blue-500/20",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      icon: "text-purple-400",
      hover: "hover:bg-purple-500/20",
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
        <p className="text-xs text-slate-400 leading-relaxed">{content}</p>
      </DisclosureContent>
    </Disclosure>
  );
}

// ============================================================================
// Element Metrics Bar
// ============================================================================
function MetricsBar({ step }: { step: MapDemoStep }) {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-500 py-2">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span><NumberTicker value={step.nodeCount} /> nodes</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-purple-500" />
        <span><NumberTicker value={step.edgeCount} /> edges</span>
      </div>
      {step.containerCount > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span><NumberTicker value={step.containerCount} /> containers</span>
        </div>
      )}
      {step.annotationCount > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span><NumberTicker value={step.annotationCount} /> annotations</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main MapDemo Component
// ============================================================================
export function MapDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const step = mapDemoSteps[currentStep];

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= mapDemoSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (currentStep >= mapDemoSteps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-4">
      {/* Step Navigation */}
      <StepNavigation
        currentStep={currentStep}
        onStepChange={handleStepChange}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />

      {/* Main Content with TransitionPanel */}
      <TransitionPanel
        activeIndex={currentStep}
        className="min-h-[420px]"
        transition={{ duration: 0.4, ease: "easeInOut" }}
        variants={{
          enter: { opacity: 0, x: 20 },
          center: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
        }}
      >
        {mapDemoSteps.map((stepData, stepIndex) => (
          <div key={stepIndex} className="space-y-4">
            {/* Diagram Canvas */}
            <DiagramCanvas step={stepData} />

            {/* Cognitive Outputs */}
            <CognitiveOutputPanel step={stepData} />

            {/* Metrics Bar */}
            <MetricsBar step={stepData} />
          </div>
        ))}
      </TransitionPanel>
    </div>
  );
}

export default MapDemo;
