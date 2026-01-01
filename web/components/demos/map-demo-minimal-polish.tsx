"use client";

/**
 * Map Demo - Combo 3: Minimal Polish
 *
 * Components used:
 * - AnimatedBackground: For smooth step indicator highlighting
 * - Disclosure: For collapsible cognitive outputs
 * - BorderBeam: For subtle active element borders
 *
 * Best for: Quick enhancement with less complexity
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/ui/disclosure";
import { BorderBeam } from "@/components/ui/border-beam";
import { mapDemoSteps, operationLabels, diagramTypeLabels } from "./map-demo-data";
import {
  Megaphone,
  Search,
  Scale,
  ShoppingCart,
  Heart,
  Users,
  RefreshCw,
  Eye,
  Lightbulb,
  FlaskConical,
  Play,
  Layers,
  RotateCw,
  GitBranch,
  ChevronDown,
  ArrowRight,
  Workflow,
  AlertCircle
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

export function MapDemoMinimalPolish() {
  const [currentStep, setCurrentStep] = useState(0);

  const step = mapDemoSteps[currentStep];
  const nodes = step.elements.filter(el => el.type === 'node');
  const edges = step.elements.filter(el => el.type === 'edge');
  const containers = step.elements.filter(el => el.type === 'container');
  const annotations = step.elements.filter(el => el.type === 'annotation');

  return (
    <div className="space-y-6">
      {/* Step Tabs with AnimatedBackground */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/50 border border-slate-800/50">
        <AnimatedBackground
          defaultValue={`step-${currentStep}`}
          className="rounded-md bg-emerald-500/20"
          transition={{
            type: "spring",
            bounce: 0.2,
            duration: 0.3,
          }}
        >
          {mapDemoSteps.map((s, i) => {
            const Icon = operationIcons[s.operation];

            return (
              <button
                key={i}
                data-id={`step-${i}`}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors relative",
                  currentStep === i
                    ? "text-emerald-400"
                    : "text-slate-500 hover:text-slate-400"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium capitalize hidden sm:inline">
                  {operationLabels[s.operation]}
                </span>
              </button>
            );
          })}
        </AnimatedBackground>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50">
            <Workflow className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">{diagramTypeLabels[step.diagramType]}</span>
          </div>
          <div className="text-slate-500">
            Iteration {step.iteration} • {step.elementCount} elements
          </div>
        </div>
        {step.transformationType && (
          <div className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400">
            Transform: {step.transformationType}
          </div>
        )}
      </div>

      {/* Diagram Canvas */}
      <div className="relative bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Container groups if present */}
            {containers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {containers.map((container) => {
                  const containedNodes = nodes.filter(n =>
                    container.contains?.includes(n.id)
                  );

                  return (
                    <div
                      key={container.id}
                      className={cn(
                        "relative p-4 rounded-xl border-2 border-dashed",
                        container.properties.color === 'blue'
                          ? "border-blue-500/30 bg-blue-500/5"
                          : "border-emerald-500/30 bg-emerald-500/5"
                      )}
                    >
                      <span className={cn(
                        "absolute -top-3 left-3 px-2 py-0.5 text-xs font-medium rounded bg-slate-900",
                        container.properties.color === 'blue'
                          ? "text-blue-400"
                          : "text-emerald-400"
                      )}>
                        {container.label}
                      </span>
                      <div className="flex flex-wrap gap-3 pt-2">
                        {containedNodes.map((node) => (
                          <NodeCard key={node.id} node={node} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Ungrouped nodes */}
                {nodes.filter(n => !containers.some(c => c.contains?.includes(n.id))).length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/20">
                    <span className="absolute -top-3 left-3 px-2 py-0.5 text-xs font-medium rounded bg-slate-900 text-slate-400">
                      Other
                    </span>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {nodes.filter(n => !containers.some(c => c.contains?.includes(n.id))).map((node) => (
                        <NodeCard key={node.id} node={node} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Simple node flow when no containers
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {nodes.map((node, index) => (
                  <div key={node.id} className="flex items-center gap-3">
                    <NodeCard node={node} />
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
              <div className="flex justify-center">
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cognitive Outputs with Disclosure */}
      {(step.observation || step.insight || step.hypothesis) && (
        <div className="space-y-2">
          {step.observation && (
            <CognitiveDisclosure
              type="observation"
              icon={Eye}
              content={step.observation}
              color="amber"
            />
          )}
          {step.insight && (
            <CognitiveDisclosure
              type="insight"
              icon={Lightbulb}
              content={step.insight}
              color="emerald"
            />
          )}
          {step.hypothesis && (
            <CognitiveDisclosure
              type="hypothesis"
              icon={FlaskConical}
              content={step.hypothesis}
              color="purple"
            />
          )}
        </div>
      )}

      {/* Bottom Status */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {step.nodeCount} nodes
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {step.edgeCount} edges
          </span>
          {step.containerCount > 0 && (
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {step.containerCount} containers
            </span>
          )}
        </div>
        <span className={cn(
          "text-[10px] font-medium",
          step.nextOperationNeeded ? "text-amber-400" : "text-emerald-400"
        )}>
          {step.nextOperationNeeded ? "Next step needed" : "Journey complete"}
        </span>
      </div>
    </div>
  );
}

// Simple node card component
function NodeCard({ node }: { node: { id: string; label?: string; properties: Record<string, unknown> } }) {
  const Icon = iconMap[(node.properties.icon as string) || 'search'] || Search;
  const isNew = node.properties.isNew as boolean;

  return (
    <div className={cn(
      "relative flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all",
      "bg-slate-800/70 border",
      isNew
        ? "border-emerald-500/50"
        : "border-slate-700/50"
    )}>
      {isNew && (
        <BorderBeam
          size={30}
          duration={3}
          colorFrom="#10b981"
          colorTo="#22d3ee"
          borderWidth={1}
        />
      )}
      <div className={cn(
        "p-2 rounded-md",
        isNew ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50 text-slate-300"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
        {node.label}
      </span>
    </div>
  );
}

// Disclosure for cognitive outputs
function CognitiveDisclosure({
  type,
  icon: Icon,
  content,
  color
}: {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  color: 'amber' | 'emerald' | 'purple';
}) {
  const [isOpen, setIsOpen] = useState(false);

  const colorMap = {
    amber: { line: 'bg-amber-500', icon: 'text-amber-400', bg: 'bg-amber-500/5' },
    emerald: { line: 'bg-emerald-500', icon: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    purple: { line: 'bg-purple-500', icon: 'text-purple-400', bg: 'bg-purple-500/5' },
  };
  const colors = colorMap[color];

  return (
    <Disclosure
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("rounded-lg transition-colors overflow-hidden", colors.bg)}
    >
      <DisclosureTrigger>
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer group">
          <div className={cn("w-1 h-8 rounded-full transition-all", colors.line, isOpen && "h-4")} />
          <Icon className={cn("w-4 h-4", colors.icon)} />
          <span className="flex-1 text-sm font-medium text-slate-300 capitalize">{type}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
          </motion.div>
        </div>
      </DisclosureTrigger>
      <DisclosureContent>
        <div className="px-4 pb-4 pl-12">
          <p className="text-xs text-slate-400 leading-relaxed">
            {content}
          </p>
        </div>
      </DisclosureContent>
    </Disclosure>
  );
}
