"use client";

import { getToolById } from "@/components/tools/tools-data";
import { ToolPageTemplate } from "@/components/tools/tool-page-template";
import { CouncilDemo } from "@/components/demos/council-demo";
import { DecideDemo } from "@/components/demos/decide-demo";
import { TraceDemo } from "@/components/demos/trace-demo";
import { MapDemo } from "@/components/demos/map-demo";
import { DebateDemo } from "@/components/demos/debate-demo";
import { HypothesisDemo } from "@/components/demos/hypothesis-demo";
import { ReflectDemo } from "@/components/demos/reflect-demo";
import { DebugDemo } from "@/components/demos/debug-demo";
import { ModelDemo } from "@/components/demos/model-demo";
import { PatternDemo } from "@/components/demos/pattern-demo";
import { ParadigmDemo } from "@/components/demos/paradigm-demo";

interface ToolPageContentProps {
  toolId: string;
}

// Map of tool IDs to their demo components
function getDemoComponent(toolId: string) {
  switch (toolId) {
    case "council":
      return <CouncilDemo />;
    case "decide":
      return <DecideDemo />;
    case "trace":
      return <TraceDemo />;
    case "map":
      return <MapDemo />;
    case "debate":
      return <DebateDemo />;
    case "hypothesis":
      return <HypothesisDemo />;
    case "reflect":
      return <ReflectDemo />;
    case "debug":
      return <DebugDemo />;
    case "model":
      return <ModelDemo />;
    case "pattern":
      return <PatternDemo />;
    case "paradigm":
      return <ParadigmDemo />;
    default:
      return undefined;
  }
}

export function ToolPageContent({ toolId }: ToolPageContentProps) {
  const tool = getToolById(toolId);

  // This should never happen due to server-side validation, but TypeScript needs it
  if (!tool) {
    return null;
  }

  // Use the standardized template with tool-specific demo if available
  return (
    <ToolPageTemplate
      tool={tool}
      demoComponent={getDemoComponent(toolId)}
    />
  );
}
