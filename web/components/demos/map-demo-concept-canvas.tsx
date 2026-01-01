"use client";

/**
 * Map Demo - Combo 2: Concept Canvas
 *
 * Components used:
 * - OrbitingCircles: For visualizing relationships around a central concept
 * - Vertical Timeline: For showing operation progression
 * - Card Stack: For stacked cognitive outputs
 * - Container Cards: For phase groupings (custom implementation)
 *
 * Best for: Concept maps and brainstorming visualization
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { mapDemoSteps, operationLabels } from "./map-demo-data";
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
  Check,
  Network
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

export function MapDemoConceptCanvas() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const step = mapDemoSteps[currentStep];
  const nodes = step.elements.filter(el => el.type === 'node');
  const containers = step.elements.filter(el => el.type === 'container');

  const cognitiveOutputs = [
    step.observation && { type: 'observation', icon: Eye, content: step.observation, color: 'amber' as const },
    step.insight && { type: 'insight', icon: Lightbulb, content: step.insight, color: 'blue' as const },
    step.hypothesis && { type: 'hypothesis', icon: FlaskConical, content: step.hypothesis, color: 'purple' as const },
  ].filter(Boolean) as Array<{ type: string; icon: React.ComponentType<{ className?: string }>; content: string; color: 'amber' | 'blue' | 'purple' }>;

  return (
    <div className="grid md:grid-cols-[200px_1fr] gap-6">
      {/* Vertical Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700/50" />
        <div className="space-y-4">
          {mapDemoSteps.map((s, i) => {
            const Icon = operationIcons[s.operation];
            const isActive = i === currentStep;
            const isPast = i < currentStep;

            return (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "relative flex items-center gap-3 w-full text-left pl-2 pr-4 py-3 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-purple-500/20"
                    : "hover:bg-slate-800/50"
                )}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300",
                  isActive
                    ? "bg-purple-500 border-purple-500"
                    : isPast
                    ? "bg-slate-700 border-slate-600"
                    : "bg-slate-800 border-slate-700"
                )}>
                  {isPast ? (
                    <Check className="w-3 h-3 text-slate-400" />
                  ) : (
                    <Icon className={cn("w-2.5 h-2.5", isActive ? "text-white" : "text-slate-500")} />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-sm font-medium capitalize",
                    isActive ? "text-purple-400" : isPast ? "text-slate-400" : "text-slate-500"
                  )}>
                    {operationLabels[s.operation]}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Iteration {s.iteration}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="space-y-6">
        {/* Orbiting Circles Visualization */}
        <div className="relative bg-slate-900/50 rounded-xl border border-slate-700/50 p-8 h-[320px] flex items-center justify-center overflow-hidden">
          {/* Central concept */}
          <div className="absolute z-20 flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Network className="w-8 h-8 text-purple-400" />
            <span className="text-xs font-medium text-slate-300">Customer Journey</span>
            <span className="text-[10px] text-slate-500 capitalize">{step.diagramType}</span>
          </div>

          {/* Orbiting nodes */}
          <OrbitingCircles
            radius={120}
            duration={30}
            speed={0.5}
            iconSize={48}
            path={true}
          >
            {nodes.slice(0, 5).map((node) => {
              const Icon = iconMap[(node.properties.icon as string) || 'search'] || Search;
              const isNew = node.properties.isNew as boolean;

              return (
                <div
                  key={node.id}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/90 border transition-all",
                    isNew
                      ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
                      : "border-slate-700/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isNew ? "text-emerald-400" : "text-blue-400")} />
                  <span className="text-[8px] text-slate-400 whitespace-nowrap">{node.label}</span>
                </div>
              );
            })}
          </OrbitingCircles>

          {/* Additional nodes in outer orbit if we have more */}
          {nodes.length > 5 && (
            <OrbitingCircles
              radius={180}
              duration={45}
              speed={0.3}
              reverse={true}
              iconSize={40}
              path={true}
            >
              {nodes.slice(5).map((node) => {
                const Icon = iconMap[(node.properties.icon as string) || 'search'] || Search;
                const isNew = node.properties.isNew as boolean;

                return (
                  <div
                    key={node.id}
                    className={cn(
                      "flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-slate-800/80 border",
                      isNew
                        ? "border-emerald-500/50"
                        : "border-slate-700/50"
                    )}
                  >
                    <Icon className={cn("w-3 h-3", isNew ? "text-emerald-400" : "text-slate-400")} />
                    <span className="text-[6px] text-slate-500">{node.label}</span>
                  </div>
                );
              })}
            </OrbitingCircles>
          )}

          {/* Container indicators */}
          {containers.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              {containers.map((container) => (
                <div
                  key={container.id}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-lg text-center",
                    container.properties.color === 'blue'
                      ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  )}
                >
                  <span className="text-[10px] font-medium">{container.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stacked Cognitive Output Cards */}
        {cognitiveOutputs.length > 0 && (
          <div className="relative h-[200px]">
            <AnimatePresence mode="popLayout">
              {cognitiveOutputs.map((output, index) => {
                const isExpanded = expandedCard === index;
                const isTop = expandedCard === null ? index === cognitiveOutputs.length - 1 : expandedCard === index;

                const colorClasses = {
                  amber: { bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' },
                  blue: { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' },
                  purple: { bg: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/30', icon: 'text-purple-400' },
                };
                const colors = colorClasses[output.color];
                const Icon = output.icon;

                return (
                  <motion.div
                    key={output.type}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: isExpanded ? 0 : index * 12,
                      x: isExpanded ? 0 : index * 4,
                      scale: isExpanded ? 1 : 1 - (cognitiveOutputs.length - 1 - index) * 0.02,
                      zIndex: isTop ? 20 : index,
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={() => setExpandedCard(isExpanded ? null : index)}
                    className={cn(
                      "absolute inset-x-0 cursor-pointer rounded-xl border bg-gradient-to-br p-4 transition-shadow",
                      colors.bg,
                      colors.border,
                      isTop && "shadow-lg"
                    )}
                    style={{
                      height: isExpanded ? 'auto' : '160px',
                      minHeight: isExpanded ? '160px' : undefined,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg bg-slate-900/50", colors.icon)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-200 capitalize mb-2">
                          {output.type}
                        </h4>
                        <p className={cn(
                          "text-xs text-slate-400 leading-relaxed",
                          !isExpanded && "line-clamp-3"
                        )}>
                          {output.content}
                        </p>
                      </div>
                    </div>
                    {!isExpanded && cognitiveOutputs.length > 1 && (
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="text-[10px] text-slate-600">Click to expand</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Element Counts */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-500">
            <span>{step.nodeCount} nodes</span>
            <span>{step.edgeCount} edges</span>
            {step.containerCount > 0 && <span>{step.containerCount} containers</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium",
              step.nextOperationNeeded
                ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
            )}>
              {step.nextOperationNeeded ? "In Progress" : "Complete"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
