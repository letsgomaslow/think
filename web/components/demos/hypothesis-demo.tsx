"use client";

import { motion } from "framer-motion";
import {
  Eye,
  HelpCircle,
  Lightbulb,
  FlaskConical,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Beaker,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

// ============================================================================
// TYPE DEFINITIONS - Matching MCP ScientificInquiryData schema exactly
// ============================================================================

interface Variable {
  name: string;
  type: "independent" | "dependent" | "controlled" | "confounding";
  operationalization?: string;
}

interface Prediction {
  if: string;
  then: string;
  else?: string;
}

interface HypothesisData {
  statement: string;
  variables: Variable[];
  assumptions: string[];
  hypothesisId: string;
  confidence: number; // 0-1
  domain: string;
  iteration: number;
  status: "proposed" | "testing" | "supported" | "refuted" | "refined";
  alternativeTo?: string[];
  refinementOf?: string;
}

interface ExperimentData {
  design: string;
  methodology: string;
  predictions: Prediction[];
  experimentId: string;
  hypothesisId: string;
  controlMeasures: string[];
  results?: string;
  outcomeMatched?: boolean;
  unexpectedObservations?: string[];
  limitations?: string[];
  nextSteps?: string[];
}

interface ScientificInquiryDisplay {
  stage:
    | "observation"
    | "question"
    | "hypothesis"
    | "experiment"
    | "analysis"
    | "conclusion"
    | "iteration";
  inquiryId: string;
  iteration: number;
  nextStageNeeded: boolean;
  observation?: string;
  question?: string;
  hypothesis?: HypothesisData;
  experiment?: ExperimentData;
  analysis?: string;
  conclusion?: string;
}

// ============================================================================
// DEMO DATA - Matching MCP schema exactly (no fabricated fields)
// ============================================================================

const demoInquiry: ScientificInquiryDisplay = {
  stage: "conclusion",
  inquiryId: "checkout-flow-preference-001",
  iteration: 3,
  nextStageNeeded: false,
  observation:
    "Checkout abandonment rate increased from 32% to 41% after the last release. Exit surveys mention 'too many steps'. Average checkout time increased by 23 seconds, with mobile devices showing 48% abandonment.",
  question:
    "Do users actually prefer the new checkout flow? What measurable behaviors indicate user preference compared to the previous single-page design?",
  hypothesis: {
    statement:
      "Users who experience the new streamlined single-page checkout flow will show higher completion rates and satisfaction scores compared to the legacy multi-step checkout process.",
    variables: [
      {
        name: "checkout_flow_version",
        type: "independent",
        operationalization:
          "Binary assignment: new single-page flow vs. legacy multi-step flow",
      },
      {
        name: "completion_rate",
        type: "dependent",
        operationalization:
          "Percentage of users who complete purchase after adding to cart",
      },
      {
        name: "satisfaction_score",
        type: "dependent",
        operationalization: "Post-purchase NPS score on 0-10 scale",
      },
      {
        name: "device_type",
        type: "controlled",
        operationalization:
          "Desktop vs. mobile, kept equal distribution across groups",
      },
      {
        name: "user_experience_level",
        type: "confounding",
        operationalization:
          "New vs. returning users - may affect results independently",
      },
    ],
    assumptions: [
      "Users have similar purchasing intent across groups",
      "Network conditions do not significantly vary between groups",
      "Product availability is consistent during the test period",
      "No major external events will affect shopping behavior",
    ],
    hypothesisId: "H-checkout-001",
    confidence: 0.72,
    domain: "UX/E-commerce",
    iteration: 1,
    status: "supported",
    alternativeTo: ["H-checkout-baseline"],
    refinementOf: undefined,
  },
  experiment: {
    design:
      "A/B randomized controlled trial with 50/50 traffic split between new checkout flow (treatment) and legacy checkout (control)",
    methodology:
      "Random assignment at user level with 14-day test duration. Measure completion rates, time-to-checkout, and post-purchase NPS scores. Statistical significance threshold: p < 0.05 with 95% statistical power.",
    predictions: [
      {
        if: "Users prefer the new checkout flow",
        then: "Completion rates will increase by at least 5% with statistical significance",
        else: "No significant difference or decrease in completion rates",
      },
      {
        if: "The new flow reduces cognitive load",
        then: "Average checkout time will decrease by at least 15%",
      },
      {
        if: "User satisfaction improves",
        then: "NPS scores will increase by at least 0.5 points",
      },
    ],
    experimentId: "EXP-checkout-001",
    hypothesisId: "H-checkout-001",
    controlMeasures: [
      "Equal traffic distribution maintained via load balancer",
      "Same product catalog for both groups",
      "No promotional differences between groups",
      "Device type stratification to ensure equal mobile/desktop split",
    ],
    results:
      "After 14 days with 12,000 users per variant: Abandonment Rate - Control: 41%, Variant: 29% (-12pp). Avg Checkout Time - Control: 87s, Variant: 54s (-38%). Support Tickets - Control: 142, Variant: 89 (-37%). All differences statistically significant (p < 0.01).",
    outcomeMatched: true,
    unexpectedObservations: [
      "Mobile users showed 2x improvement compared to desktop users",
      "Returning users had faster adaptation to new flow than expected",
      "Cart value increased by 8% in treatment group (not hypothesized)",
    ],
    limitations: [
      "14-day duration may not capture long-term habit effects",
      "Sample limited to US users only",
      "Cannot control for external factors like seasonal trends",
      "Self-selection bias in users who completed exit surveys",
    ],
    nextSteps: [
      "Roll out to 100% of mobile users immediately",
      "Monitor for 30 days post-rollout for regression",
      "Plan follow-up test: express checkout for returning users",
      "Investigate unexpected cart value increase",
    ],
  },
  analysis:
    "Results after 14 days show statistically significant improvements across all metrics (p < 0.01). The single-page checkout reduced abandonment by 12 percentage points, exceeding our 8pp threshold. Checkout time decreased by 38% and support tickets dropped by 37%. The hypothesis is strongly supported by the data.",
  conclusion:
    "Hypothesis SUPPORTED. Single-page checkout significantly reduces abandonment (12pp reduction vs. 8pp threshold). Recommend immediate full rollout to mobile users with 30-day monitoring period. The unexpected 8% cart value increase warrants further investigation as a potential secondary benefit.",
};

// ============================================================================
// STYLING CONFIGURATION
// ============================================================================

const stageConfig = {
  observation: {
    icon: Eye,
    color: "hsl(200 70% 55%)",
    label: "Observation",
  },
  question: {
    icon: HelpCircle,
    color: "hsl(45 93% 60%)",
    label: "Question",
  },
  hypothesis: {
    icon: Lightbulb,
    color: "hsl(var(--brand-accent))",
    label: "Hypothesis",
  },
  experiment: {
    icon: FlaskConical,
    color: "hsl(280 60% 70%)",
    label: "Experiment",
  },
  analysis: {
    icon: BarChart3,
    color: "hsl(35 90% 55%)",
    label: "Analysis",
  },
  conclusion: {
    icon: CheckCircle2,
    color: "hsl(var(--brand-primary))",
    label: "Conclusion",
  },
  iteration: {
    icon: Target,
    color: "hsl(170 60% 50%)",
    label: "Iteration",
  },
};

const statusConfig: Record<
  HypothesisData["status"],
  { color: string; bg: string; label: string }
> = {
  proposed: {
    color: "hsl(200 70% 55%)",
    bg: "hsl(200 70% 55% / 0.15)",
    label: "Proposed",
  },
  testing: {
    color: "hsl(45 93% 60%)",
    bg: "hsl(45 93% 60% / 0.15)",
    label: "Testing",
  },
  supported: {
    color: "hsl(142 70% 45%)",
    bg: "hsl(142 70% 45% / 0.15)",
    label: "Supported",
  },
  refuted: {
    color: "hsl(0 70% 55%)",
    bg: "hsl(0 70% 55% / 0.15)",
    label: "Refuted",
  },
  refined: {
    color: "hsl(280 60% 70%)",
    bg: "hsl(280 60% 70% / 0.15)",
    label: "Refined",
  },
};

const variableTypeConfig: Record<
  Variable["type"],
  { color: string; bg: string }
> = {
  independent: { color: "hsl(200 70% 55%)", bg: "hsl(200 70% 55% / 0.15)" },
  dependent: {
    color: "hsl(var(--brand-accent))",
    bg: "hsl(var(--brand-accent) / 0.15)",
  },
  controlled: { color: "hsl(0 0% 60%)", bg: "hsl(0 0% 60% / 0.15)" },
  confounding: { color: "hsl(35 90% 55%)", bg: "hsl(35 90% 55% / 0.15)" },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Confidence:</span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor:
                    percentage >= 70
                      ? "hsl(142 70% 45%)"
                      : percentage >= 40
                        ? "hsl(45 93% 60%)"
                        : "hsl(0 70% 55%)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-medium text-white">{percentage}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Hypothesis confidence level: {percentage}% (0-100 scale)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatusBadge({ status }: { status: HypothesisData["status"] }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium border-0"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </Badge>
  );
}

function VariableTypeBadge({ type }: { type: Variable["type"] }) {
  const config = variableTypeConfig[type];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {type}
    </span>
  );
}

function VariablesTable({ variables }: { variables: Variable[] }) {
  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
      <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-slate-800/50 text-xs text-slate-400 font-medium">
        <span>Variable</span>
        <span>Type</span>
        <span>Operationalization</span>
      </div>
      {variables.map((v, i) => (
        <div
          key={i}
          className="grid grid-cols-3 gap-2 px-3 py-2 border-t border-slate-700/30 text-xs"
        >
          <span className="text-white font-medium">{v.name}</span>
          <span>
            <VariableTypeBadge type={v.type} />
          </span>
          <span className="text-slate-400">{v.operationalization || "-"}</span>
        </div>
      ))}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-xs text-slate-500 font-medium w-12">IF</span>
        <span className="text-xs text-slate-300 flex-1">{prediction.if}</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-xs text-emerald-500 font-medium w-12">THEN</span>
        <span className="text-xs text-emerald-300 flex-1">{prediction.then}</span>
      </div>
      {prediction.else && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-amber-500 font-medium w-12">ELSE</span>
          <span className="text-xs text-amber-300 flex-1">{prediction.else}</span>
        </div>
      )}
    </div>
  );
}

function CollapsibleList({
  title,
  items,
  defaultOpen = false,
}: {
  title: string;
  items: string[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!items || items.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors">
        <ChevronRight
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <span>
          {title} ({items.length})
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pl-5">
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-xs text-slate-400 flex items-start gap-2"
            >
              <span className="text-slate-600">-</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function UnexpectedObservationsAlert({
  observations,
}: {
  observations: string[];
}) {
  if (!observations || observations.length === 0) return null;

  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-medium text-amber-400">
            Unexpected Observations
          </span>
          <ul className="space-y-1">
            {observations.map((obs, i) => (
              <li key={i} className="text-xs text-amber-300/80">
                {obs}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function OutcomeIndicator({ matched }: { matched: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">Outcome Matched:</span>
      {matched ? (
        <Badge
          variant="outline"
          className="text-xs border-0 bg-emerald-500/15 text-emerald-400"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Yes
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-xs border-0 bg-red-500/15 text-red-400"
        >
          No
        </Badge>
      )}
    </div>
  );
}

function ParsedResultsTable({ results }: { results: string }) {
  // Attempt to parse structured data from results string
  // Format expected: "Metric - Control: X, Variant: Y (change)"
  const metrics: { metric: string; control: string; variant: string; change: string }[] = [];

  // Parse the results string for key metrics
  // Format: "Abandonment Rate - Control: 41%, Variant: 29% (-12pp)"
  const patterns = [
    /Abandonment Rate\s*-\s*Control:\s*(\d+%),\s*Variant:\s*(\d+%)\s*\(([^)]+)\)/i,
    /Avg\.?\s*Checkout Time\s*-\s*Control:\s*(\d+s),\s*Variant:\s*(\d+s)\s*\(([^)]+)\)/i,
    /Support Tickets\s*-\s*Control:\s*(\d+),\s*Variant:\s*(\d+)\s*\(([^)]+)\)/i,
  ];

  const metricNames = ["Abandonment Rate", "Avg. Checkout Time", "Support Tickets"];

  patterns.forEach((pattern, i) => {
    const match = results.match(pattern);
    if (match) {
      metrics.push({
        metric: metricNames[i],
        control: match[1],
        variant: match[2],
        change: match[3],
      });
    }
  });

  if (metrics.length === 0) {
    // Fallback: display raw results string
    return (
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-xs text-slate-300">{results}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
      <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-slate-800/50 text-xs text-slate-400 font-medium">
        <span>Metric</span>
        <span className="text-center">Control</span>
        <span className="text-center">Variant</span>
        <span className="text-center">Change</span>
      </div>
      {metrics.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-slate-700/30 text-xs"
        >
          <span className="text-slate-300">{r.metric}</span>
          <span className="text-center text-slate-400">{r.control}</span>
          <span className="text-center text-slate-300">{r.variant}</span>
          <span className="text-center text-emerald-400 font-medium">
            {r.change}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HypothesisDemo() {
  const data = demoInquiry;
  const currentStageConfig = stageConfig[data.stage];

  return (
    <div className="space-y-4">
      {/* Header: Metadata Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
      >
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-xs border-0"
            style={{
              backgroundColor: `${currentStageConfig.color.replace(")", " / 0.15)")}`,
              color: currentStageConfig.color,
            }}
          >
            <currentStageConfig.icon className="w-3 h-3 mr-1" />
            {currentStageConfig.label}
          </Badge>
          {data.hypothesis && <StatusBadge status={data.hypothesis.status} />}
        </div>
        <div className="flex items-center gap-4">
          {data.hypothesis && (
            <ConfidenceIndicator confidence={data.hypothesis.confidence} />
          )}
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">ID:</span> {data.inquiryId}
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">Iteration:</span> {data.iteration}
          </div>
        </div>
      </motion.div>

      {/* Accordion Stages */}
      <Accordion type="multiple" defaultValue={["observation", "hypothesis", "experiment", "conclusion"]} className="space-y-2">
        {/* Observation */}
        {data.observation && (
          <AccordionItem value="observation" className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stageConfig.observation.color.replace(")", " / 0.2)")}` }}
                >
                  <Eye className="w-4 h-4" style={{ color: stageConfig.observation.color }} />
                </div>
                <span className="text-sm font-medium text-white">Observation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-slate-300 leading-relaxed">{data.observation}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Question */}
        {data.question && (
          <AccordionItem value="question" className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stageConfig.question.color.replace(")", " / 0.2)")}` }}
                >
                  <HelpCircle className="w-4 h-4" style={{ color: stageConfig.question.color }} />
                </div>
                <span className="text-sm font-medium text-white">Question</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-slate-300 leading-relaxed">{data.question}</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Hypothesis */}
        {data.hypothesis && (
          <AccordionItem value="hypothesis" className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(var(--brand-accent) / 0.2)" }}
                >
                  <Lightbulb className="w-4 h-4" style={{ color: "hsl(var(--brand-accent))" }} />
                </div>
                <span className="text-sm font-medium text-white">Hypothesis</span>
                <span className="text-xs text-slate-500">({data.hypothesis.hypothesisId})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Statement */}
              <div>
                <span className="text-xs text-slate-500 block mb-1">Statement</span>
                <p className="text-sm text-white leading-relaxed">{data.hypothesis.statement}</p>
              </div>

              {/* Domain */}
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Domain</span>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                    {data.hypothesis.domain}
                  </Badge>
                </div>
                {data.hypothesis.refinementOf && (
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Refinement Of</span>
                    <span className="text-xs text-slate-400">{data.hypothesis.refinementOf}</span>
                  </div>
                )}
                {data.hypothesis.alternativeTo && data.hypothesis.alternativeTo.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Alternative To</span>
                    <span className="text-xs text-slate-400">{data.hypothesis.alternativeTo.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Variables Table */}
              <div>
                <span className="text-xs text-slate-500 block mb-2">Variables</span>
                <VariablesTable variables={data.hypothesis.variables} />
              </div>

              {/* Assumptions */}
              <CollapsibleList
                title="Assumptions"
                items={data.hypothesis.assumptions}
                defaultOpen={false}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Experiment */}
        {data.experiment && (
          <AccordionItem value="experiment" className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stageConfig.experiment.color.replace(")", " / 0.2)")}` }}
                >
                  <FlaskConical className="w-4 h-4" style={{ color: stageConfig.experiment.color }} />
                </div>
                <span className="text-sm font-medium text-white">Experiment</span>
                <span className="text-xs text-slate-500">({data.experiment.experimentId})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Design */}
              <div>
                <span className="text-xs text-slate-500 block mb-1">Design</span>
                <p className="text-sm text-slate-300">{data.experiment.design}</p>
              </div>

              {/* Methodology */}
              <div>
                <span className="text-xs text-slate-500 block mb-1">Methodology</span>
                <p className="text-sm text-slate-300">{data.experiment.methodology}</p>
              </div>

              {/* Predictions */}
              <div>
                <span className="text-xs text-slate-500 block mb-2">Predictions</span>
                <div className="space-y-2">
                  {data.experiment.predictions.map((pred, i) => (
                    <PredictionCard key={i} prediction={pred} />
                  ))}
                </div>
              </div>

              {/* Control Measures */}
              <CollapsibleList
                title="Control Measures"
                items={data.experiment.controlMeasures}
                defaultOpen={false}
              />

              {/* Limitations */}
              <CollapsibleList
                title="Limitations"
                items={data.experiment.limitations || []}
                defaultOpen={false}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Analysis */}
        {data.analysis && (
          <AccordionItem value="analysis" className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stageConfig.analysis.color.replace(")", " / 0.2)")}` }}
                >
                  <BarChart3 className="w-4 h-4" style={{ color: stageConfig.analysis.color }} />
                </div>
                <span className="text-sm font-medium text-white">Analysis</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {/* Analysis Text */}
              <p className="text-sm text-slate-300 leading-relaxed">{data.analysis}</p>

              {/* Parsed Results Table (from experiment.results) */}
              {data.experiment?.results && (
                <div>
                  <span className="text-xs text-slate-500 block mb-2">Results</span>
                  <ParsedResultsTable results={data.experiment.results} />
                </div>
              )}

              {/* Outcome Matched */}
              {data.experiment?.outcomeMatched !== undefined && (
                <OutcomeIndicator matched={data.experiment.outcomeMatched} />
              )}

              {/* Unexpected Observations */}
              {data.experiment?.unexpectedObservations && (
                <UnexpectedObservationsAlert
                  observations={data.experiment.unexpectedObservations}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Conclusion */}
        {data.conclusion && (
          <AccordionItem value="conclusion" className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(var(--brand-primary) / 0.2)" }}
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--brand-primary))" }} />
                </div>
                <span className="text-sm font-medium text-white">Conclusion</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <p className="text-sm text-white leading-relaxed">{data.conclusion}</p>

              {/* Next Steps */}
              {data.experiment?.nextSteps && (
                <CollapsibleList
                  title="Next Steps"
                  items={data.experiment.nextSteps}
                  defaultOpen={true}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Footer: Method Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2"
      >
        <Beaker className="w-3.5 h-3.5" />
        <span>Scientific Method</span>
        <ArrowRight className="w-3 h-3" />
        <span style={{ color: "hsl(var(--brand-primary))" }}>
          {data.hypothesis?.status === "supported"
            ? "Hypothesis Supported"
            : data.hypothesis?.status === "refuted"
              ? "Hypothesis Refuted"
              : data.hypothesis?.status === "testing"
                ? "Testing in Progress"
                : "Hypothesis " + (data.hypothesis?.status || "Proposed")}
        </span>
        {!data.nextStageNeeded && (
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 ml-2">
            Complete
          </Badge>
        )}
      </motion.div>
    </div>
  );
}

export default HypothesisDemo;
