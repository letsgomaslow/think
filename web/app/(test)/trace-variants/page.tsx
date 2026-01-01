"use client";

import { useState } from "react";
import { TraceDemo } from "@/components/demos/trace-demo";
import { TraceDemoTimeline } from "@/components/demos/trace-demo-timeline";
import { TraceDemoStagger } from "@/components/demos/trace-demo-stagger";
import { TraceDemoBeam } from "@/components/demos/trace-demo-beam";
import { cn } from "@/lib/utils";

type VariantKey = "original" | "timeline" | "stagger" | "beam";

interface Variant {
  key: VariantKey;
  name: string;
  description: string;
  component: React.ComponentType;
  pros: string[];
  cons: string[];
}

const variants: Variant[] = [
  {
    key: "original",
    name: "Original",
    description: "Current card-based layout with Framer Motion animations",
    component: TraceDemo,
    pros: [
      "Simple, familiar card layout",
      "Clear connection lines",
      "Good for short chains",
    ],
    cons: [
      "Can feel static",
      "Branches not visually distinct",
      "Limited 'wow factor'",
    ],
  },
  {
    key: "timeline",
    name: "Timeline",
    description:
      "Aceternity scroll-based timeline with animated progress line",
    component: TraceDemoTimeline,
    pros: [
      "Beautiful scroll-triggered animation",
      "Clear sequential progression",
      "Sticky step titles",
    ],
    cons: [
      "Requires scrolling to see full chain",
      "Branch visualization needs work",
      "May be too long for demos",
    ],
  },
  {
    key: "stagger",
    name: "Stagger",
    description:
      "AnimatedGroup with BlurFade stagger and NumberTicker counters",
    component: TraceDemoStagger,
    pros: [
      "Smooth staggered reveal",
      "Animated number counters",
      "Polished, professional feel",
    ],
    cons: [
      "Animation plays once on load",
      "Connections less visible",
      "Similar structure to original",
    ],
  },
  {
    key: "beam",
    name: "Beam",
    description:
      "AnimatedBeam connections showing thought relationships visually",
    component: TraceDemoBeam,
    pros: [
      "Clearly shows connections",
      "Revision/branch links obvious",
      "Impressive visual effect",
    ],
    cons: [
      "Complex layout",
      "May be overwhelming",
      "Harder to follow sequence",
    ],
  },
];

export default function TraceVariantsPage() {
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>("original");
  const [showSideBySide, setShowSideBySide] = useState(false);

  const currentVariant = variants.find((v) => v.key === selectedVariant)!;
  const CurrentComponent = currentVariant.component;

  return (
    <div className="min-h-screen bg-[hsl(220_45%_14%)] text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Trace Demo Variants</h1>
              <p className="text-sm text-slate-400 mt-1">
                Compare different UI approaches for visualizing the Trace tool
              </p>
            </div>
            <button
              onClick={() => setShowSideBySide(!showSideBySide)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                showSideBySide
                  ? "bg-[hsl(159_43%_60%)] text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              {showSideBySide ? "Single View" : "Side by Side"}
            </button>
          </div>

          {/* Variant tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {variants.map((variant) => (
              <button
                key={variant.key}
                onClick={() => setSelectedVariant(variant.key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  selectedVariant === variant.key
                    ? "bg-[hsl(159_43%_60%)] text-slate-900"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      {showSideBySide ? (
        /* Side by side view */
        <div className="max-w-[1800px] mx-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {variants.map((variant) => {
              const Component = variant.component;
              return (
                <div
                  key={variant.key}
                  className="border border-slate-700/50 rounded-2xl overflow-hidden"
                >
                  <div className="bg-slate-800/30 px-4 py-3 border-b border-slate-700/50">
                    <h3 className="font-semibold">{variant.name}</h3>
                    <p className="text-xs text-slate-400">
                      {variant.description}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/30 max-h-[600px] overflow-auto">
                    <Component />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Single variant view */
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Variant info sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-4">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="font-semibold mb-2">{currentVariant.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {currentVariant.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-[hsl(159_43%_60%)] uppercase tracking-wide mb-2">
                        Pros
                      </h4>
                      <ul className="space-y-1">
                        {currentVariant.pros.map((pro, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-300 flex items-start gap-2"
                          >
                            <span className="text-[hsl(159_43%_60%)] mt-0.5">
                              +
                            </span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-[hsl(330_72%_70%)] uppercase tracking-wide mb-2">
                        Cons
                      </h4>
                      <ul className="space-y-1">
                        {currentVariant.cons.map((con, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-300 flex items-start gap-2"
                          >
                            <span className="text-[hsl(330_72%_70%)] mt-0.5">
                              -
                            </span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Components used */}
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Components Used
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentVariant.key === "original" && (
                      <span className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                        Framer Motion
                      </span>
                    )}
                    {currentVariant.key === "timeline" && (
                      <>
                        <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-300">
                          @aceternity/timeline
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                          Framer Motion
                        </span>
                      </>
                    )}
                    {currentVariant.key === "stagger" && (
                      <>
                        <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-300">
                          @motion-primitives/animated-group
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-pink-900/30 text-pink-300">
                          @magicui/blur-fade
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-300">
                          @magicui/number-ticker
                        </span>
                      </>
                    )}
                    {currentVariant.key === "beam" && (
                      <>
                        <span className="text-xs px-2 py-1 rounded bg-orange-900/30 text-orange-300">
                          @magicui/animated-beam
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                          Framer Motion
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Demo area */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 min-h-[600px]">
                <CurrentComponent />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concept reminder footer */}
      <div className="border-t border-slate-700/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Key Concepts to Communicate
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
              <div className="w-8 h-8 rounded-lg bg-[hsl(200_70%_60%/0.2)] flex items-center justify-center flex-shrink-0">
                <span className="text-[hsl(200_70%_60%)] font-bold text-sm">
                  1
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">
                  Sequential Steps
                </h4>
                <p className="text-xs text-slate-400">
                  Thoughts build on each other in a logical chain
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
              <div className="w-8 h-8 rounded-lg bg-[hsl(330_72%_70%/0.2)] flex items-center justify-center flex-shrink-0">
                <span className="text-[hsl(330_72%_70%)] font-bold text-sm">
                  R
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Revisions</h4>
                <p className="text-xs text-slate-400">
                  AI can reconsider and update previous conclusions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
              <div className="w-8 h-8 rounded-lg bg-[hsl(45_93%_60%/0.2)] flex items-center justify-center flex-shrink-0">
                <span className="text-[hsl(45_93%_60%)] font-bold text-sm">
                  B
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Branches</h4>
                <p className="text-xs text-slate-400">
                  Explore multiple parallel solution paths
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
