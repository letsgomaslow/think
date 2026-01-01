"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  ListChecks,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ============================================================================
// SCHEMA-ACCURATE INTERFACES (matching MCP schema from /src/index.ts:30-66)
// ============================================================================

/**
 * Model name enum values from MCP schema
 */
type ModelName =
  | "first_principles"
  | "opportunity_cost"
  | "error_propagation"
  | "rubber_duck"
  | "pareto_principle"
  | "occams_razor";

/**
 * Props for the Model demo component
 */
interface ModelDemoProps {
  results?: string;
}

/**
 * Parsed model data matching MCP response structure
 * From /web/lib/tools/model.ts handleModel return type
 */
interface ParsedModelData {
  modelName: ModelName;
  problem: string;
  steps: string[]; // Simple string array - NO nested objects
  reasoning: string;
  conclusion: string;
  status: "success" | "failed";
  hasSteps: boolean;
  hasConclusion: boolean;
}

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

const modelDisplayNames: Record<ModelName, string> = {
  first_principles: "First Principles Thinking",
  opportunity_cost: "Opportunity Cost Analysis",
  error_propagation: "Error Propagation Understanding",
  rubber_duck: "Rubber Duck Debugging",
  pareto_principle: "Pareto Principle (80/20)",
  occams_razor: "Occam's Razor",
};

// ============================================================================
// RESULTS PARSER
// ============================================================================

function parseModelResults(text: string): ParsedModelData | null {
  if (!text) return null;

  try {
    // Try to parse as JSON first
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        modelName: parsed.modelName || "first_principles",
        problem: parsed.problem || "",
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        reasoning: parsed.reasoning || "",
        conclusion: parsed.conclusion || "",
        status: parsed.status || "success",
        hasSteps: parsed.hasSteps ?? false,
        hasConclusion: parsed.hasConclusion ?? false,
      };
    }
  } catch {
    // If JSON parsing fails, try regex extraction
    const modelNameMatch = text.match(/Model:\s*(\w+)/i);
    const problemMatch = text.match(/Problem:\s*(.+?)(?:\n|$)/i);
    const stepsMatch = text.match(/Steps?:\s*([\s\S]*?)(?:Reasoning:|Conclusion:|$)/i);
    const reasoningMatch = text.match(/Reasoning:\s*([\s\S]*?)(?:Conclusion:|$)/i);
    const conclusionMatch = text.match(/Conclusion:\s*([\s\S]*?)$/i);
    const statusMatch = text.match(/Status:\s*(\w+)/i);

    const steps = stepsMatch
      ? stepsMatch[1]
          .split(/\n/)
          .map((s) => s.replace(/^[-•*\d.)\s]+/, "").trim())
          .filter(Boolean)
      : [];

    return {
      modelName: (modelNameMatch?.[1] as ModelName) || "first_principles",
      problem: problemMatch?.[1]?.trim() || "",
      steps,
      reasoning: reasoningMatch?.[1]?.trim() || "",
      conclusion: conclusionMatch?.[1]?.trim() || "",
      status: (statusMatch?.[1] as "success" | "failed") || "success",
      hasSteps: steps.length > 0,
      hasConclusion: !!conclusionMatch?.[1]?.trim(),
    };
  }

  return null;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Status badge showing success/failed state
 */
function StatusBadge({ status }: { status: "success" | "failed" }) {
  const isSuccess = status === "success";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        isSuccess
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : "bg-red-500/15 text-red-400 border border-red-500/30"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isSuccess ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {status}
    </span>
  );
}

/**
 * Boolean indicator for hasSteps/hasConclusion
 */
function BooleanIndicator({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500">{label}:</span>
      <span
        className={`font-mono ${value ? "text-emerald-400" : "text-slate-400"}`}
      >
        {value ? "true" : "false"}
      </span>
    </div>
  );
}

/**
 * Step item component - renders simple string step with auto-numbering
 */
function StepItem({ step, index }: { step: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      viewport={{ once: true }}
      className="flex gap-3"
    >
      {/* Auto-numbered indicator using array index */}
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-[hsl(var(--brand-accent)/0.15)] border border-[hsl(var(--brand-accent)/0.3)] flex items-center justify-center text-xs font-bold text-[hsl(var(--brand-accent))]">
          {index + 1}
        </div>
        {/* Connector line */}
        <div className="w-0.5 flex-1 bg-gradient-to-b from-[hsl(var(--brand-accent)/0.2)] to-transparent mt-1" />
      </div>

      {/* Step content - simple string, NO title field */}
      <div className="flex-1 pb-4">
        <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
      </div>
    </motion.div>
  );
}

/**
 * Collapsible section for steps list
 */
function StepsSection({ steps }: { steps: string[] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (steps.length === 0) {
    return (
      <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
        <p className="text-xs text-slate-500 italic">No steps provided</p>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 mb-3 hover:text-slate-400 transition-colors w-full">
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        <ListChecks className="w-3.5 h-3.5" />
        <span>Steps ({steps.length})</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1">
          {steps.map((step, index) => (
            <StepItem key={index} step={step} index={index} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// DEMO DATA (Schema-accurate Pareto Principle example)
// ============================================================================

const demoData: ParsedModelData = {
  modelName: "pareto_principle",
  problem: "Applying Pareto principle to prioritize our product roadmap",
  steps: [
    "Identify all roadmap items and categorize by potential business impact",
    "Analyze historical data: which 20% of features drove 80% of user engagement",
    "Map customer feedback frequency to identify high-value requests",
    "Calculate effort-to-impact ratio for each roadmap item",
    "Focus resources on top 20% of items that will deliver 80% of value",
  ],
  reasoning:
    "By applying the 80/20 rule, we can identify the vital few roadmap items that will generate the majority of business value. Historical analysis shows that a small subset of features typically drives most user engagement and revenue.",
  conclusion:
    "Prioritize the top 20% of roadmap items by impact score. Defer or eliminate the bottom 80% that contribute minimal value. Review quarterly to rebalance based on new data.",
  status: "success",
  hasSteps: true,
  hasConclusion: true,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModelDemo({ results }: ModelDemoProps) {
  // Parse results or use demo data
  const data = results ? parseModelResults(results) ?? demoData : demoData;
  const [reasoningOpen, setReasoningOpen] = useState(true);

  return (
    <div className="space-y-5">
      {/* Header: Status + Model Name */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-accent)/0.2)] flex items-center justify-center">
            <Layers className="w-4 h-4 text-[hsl(var(--brand-accent))]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[hsl(var(--brand-accent))]">
              {modelDisplayNames[data.modelName]}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {data.modelName}
            </div>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </motion.div>

      {/* Problem Statement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-[hsl(var(--brand-accent)/0.3)] bg-[hsl(var(--brand-accent)/0.05)]"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Problem Statement</span>
        </div>
        <p className="text-white font-medium">{data.problem}</p>
      </motion.div>

      {/* Steps Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        viewport={{ once: true }}
      >
        <StepsSection steps={data.steps} />
      </motion.div>

      {/* Reasoning (Collapsible) */}
      {data.reasoning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Collapsible open={reasoningOpen} onOpenChange={setReasoningOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Reasoning</span>
                  </div>
                  {reasoningOpen ? (
                    <ChevronDown className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 pt-2 border-x border-b border-amber-500/30 rounded-b-xl bg-amber-500/5">
                <p className="text-sm text-slate-300">{data.reasoning}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      )}

      {/* Conclusion (conditional on hasConclusion) */}
      {data.hasConclusion && data.conclusion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="p-4 rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.05)]"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-primary)/0.2)] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
            </div>
            <div>
              <div className="text-xs font-medium text-[hsl(var(--brand-primary))] mb-1">
                Conclusion
              </div>
              <p className="text-sm text-slate-300">{data.conclusion}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Metadata Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
        className="flex items-center justify-between pt-2 border-t border-slate-700/50"
      >
        <div className="flex items-center gap-4">
          <BooleanIndicator label="hasSteps" value={data.hasSteps} />
          <BooleanIndicator label="hasConclusion" value={data.hasConclusion} />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Layers className="w-3.5 h-3.5" />
          <span>{modelDisplayNames[data.modelName]}</span>
        </div>
      </motion.div>
    </div>
  );
}

export default ModelDemo;
