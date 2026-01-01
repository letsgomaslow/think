"use client";

import { MapDemoFlowFocus } from "@/components/demos/map-demo-flow-focus";
import { MapDemoConceptCanvas } from "@/components/demos/map-demo-concept-canvas";
import { MapDemoMinimalPolish } from "@/components/demos/map-demo-minimal-polish";

export default function MapVariantsPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Map Tool UI Variants
          </h1>
          <p className="text-slate-400">
            Compare 3 different UI approaches for the Map visualization tool
          </p>
        </div>

        {/* Variant Sections */}
        <div className="space-y-16">
          {/* Combo 1: Flow Focus */}
          <section>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                  Combo 1
                </span>
                <h2 className="text-xl font-semibold text-white">Flow Focus</h2>
              </div>
              <p className="text-sm text-slate-400">
                Animated beams for connections, transition panels for steps, disclosure for outputs.
                Best for flowcharts and data flow visualization.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6">
              <MapDemoFlowFocus />
            </div>
          </section>

          {/* Combo 2: Concept Canvas */}
          <section>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                  Combo 2
                </span>
                <h2 className="text-xl font-semibold text-white">Concept Canvas</h2>
              </div>
              <p className="text-sm text-slate-400">
                Orbiting circles for relationships, vertical timeline, stacked cards for insights.
                Best for concept maps and brainstorming.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6">
              <MapDemoConceptCanvas />
            </div>
          </section>

          {/* Combo 3: Minimal Polish */}
          <section>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  Combo 3
                </span>
                <h2 className="text-xl font-semibold text-white">Minimal Polish</h2>
              </div>
              <p className="text-sm text-slate-400">
                Animated background for step indicator, disclosure panels, subtle border effects.
                Quick enhancement with less complexity.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-6">
              <MapDemoMinimalPolish />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Test page for Map tool UI variants • /map-variants
          </p>
        </div>
      </div>
    </div>
  );
}
