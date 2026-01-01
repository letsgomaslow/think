"use client";

import { motion } from "framer-motion";
import {
  Check,
  AlertTriangle,
  Scale,
  Users,
  Clock,
  Shield,
  ChevronRight,
  Target,
  TrendingUp,
  Gauge,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  decisionData,
  DECISION_STAGES,
  getOutcomesByOption,
  calculateExpectedValue,
  calculateAverageConfidence,
  optionColors,
  type DecisionStage,
} from "./decide-demo-data";

// Stage progression component
function StageProgression({ currentStage }: { currentStage: DecisionStage }) {
  const currentIndex = DECISION_STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center justify-between gap-1 mb-2">
      {DECISION_STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={stage.key} className="flex items-center flex-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                isCompleted
                  ? "bg-[hsl(var(--brand-primary))] text-slate-900"
                  : isCurrent
                  ? "bg-[hsl(var(--brand-primary)/0.3)] text-[hsl(var(--brand-primary))] ring-2 ring-[hsl(var(--brand-primary))]"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
            {index < DECISION_STAGES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  isCompleted ? "bg-[hsl(var(--brand-primary))]" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Context badges component
function DecisionContext() {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      {/* Stakeholders */}
      <div className="flex items-start gap-2">
        <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex flex-wrap gap-1.5">
          {decisionData.stakeholders.map((stakeholder) => (
            <Badge
              key={stakeholder}
              variant="secondary"
              className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs"
            >
              {stakeholder}
            </Badge>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex flex-wrap gap-1.5">
          {decisionData.constraints.map((constraint) => (
            <Badge
              key={constraint}
              variant="secondary"
              className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs"
            >
              {constraint}
            </Badge>
          ))}
        </div>
      </div>

      {/* Time Horizon & Risk */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300">{decisionData.timeHorizon}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-slate-400" />
          <Badge
            variant="outline"
            className={`text-xs ${
              decisionData.riskTolerance === "risk-averse"
                ? "text-green-400 border-green-500/30"
                : decisionData.riskTolerance === "risk-seeking"
                ? "text-red-400 border-red-500/30"
                : "text-slate-300 border-slate-500/30"
            }`}
          >
            {decisionData.riskTolerance.replace("-", " ")}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Criteria weights visualization
function CriteriaWeights() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {decisionData.criteria.map((criterion, index) => (
        <motion.div
          key={criterion.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">
              {criterion.name}
            </span>
            <span className="text-xs text-[hsl(var(--brand-primary))]">
              {Math.round(criterion.weight * 100)}%
            </span>
          </div>
          <Progress
            value={criterion.weight * 100}
            className="h-1.5 bg-slate-700"
          />
        </motion.div>
      ))}
    </div>
  );
}

// Outcome card component
function OutcomeCard({
  outcome,
  optionName,
  color,
  index,
}: {
  outcome: (typeof decisionData.possibleOutcomes)[0];
  optionName: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      viewport={{ once: true }}
      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
    >
      <p className="text-sm text-slate-300 mb-4 leading-relaxed">
        &ldquo;{outcome.description}&rdquo;
      </p>

      <div className="space-y-3">
        {/* Probability */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 w-24">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Probability</span>
          </div>
          <div className="flex-1">
            <Progress
              value={outcome.probability * 100}
              className="h-2 bg-slate-700"
              style={
                {
                  "--tw-progress-color": color,
                } as React.CSSProperties
              }
            />
          </div>
          <span className="text-xs font-medium text-white w-10 text-right">
            {Math.round(outcome.probability * 100)}%
          </span>
        </div>

        {/* Value & Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Value:</span>
              <span className="text-sm font-bold text-white">{outcome.value}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Confidence:</span>
              <span
                className="text-sm font-medium"
                style={{ color }}
              >
                {Math.round(outcome.confidenceInEstimate * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Option outcomes section
function OptionOutcomes({
  optionId,
  optionName,
  optionDescription,
  color,
  isRecommended,
}: {
  optionId: string;
  optionName: string;
  optionDescription: string;
  color: string;
  isRecommended: boolean;
}) {
  const outcomes = getOutcomesByOption(decisionData.possibleOutcomes, optionId);
  const expectedValue = calculateExpectedValue(outcomes);
  const avgConfidence = calculateAverageConfidence(outcomes);

  return (
    <div
      className={`rounded-xl border p-4 ${
        isRecommended
          ? "border-[hsl(var(--brand-primary)/0.5)] bg-[hsl(var(--brand-primary)/0.05)]"
          : "border-slate-700/50 bg-slate-800/20"
      }`}
    >
      {/* Option Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{optionName}</h4>
              {isRecommended && (
                <Badge className="bg-[hsl(var(--brand-primary))] text-slate-900 text-xs">
                  Recommended
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{optionDescription}</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              <NumberTicker value={parseFloat(expectedValue.toFixed(1))} decimalPlaces={1} />
            </div>
            <div className="text-xs text-slate-500">Expected</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color }}>
              {Math.round(avgConfidence * 100)}%
            </div>
            <div className="text-xs text-slate-500">Confidence</div>
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="space-y-3">
        {outcomes.map((outcome, index) => (
          <OutcomeCard
            key={outcome.id}
            outcome={outcome}
            optionName={optionName}
            color={color}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export function DecideDemo() {
  return (
    <div className="space-y-6">
      {/* Header: Decision Statement & Stage */}
      <div className="rounded-xl border border-slate-700/50 p-4 bg-slate-800/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-[hsl(var(--brand-primary))]" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Decision Analysis
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">
              {decisionData.decisionStatement}
            </h3>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-xs mb-1">
              {decisionData.analysisType.replace("-", " ")}
            </Badge>
            <div className="text-xs text-slate-500">
              ID: {decisionData.decisionId} | Iter: {decisionData.iteration}
            </div>
          </div>
        </div>

        {/* Stage Progression */}
        <StageProgression currentStage={decisionData.stage} />
        <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
          {DECISION_STAGES.map((stage) => (
            <span
              key={stage.key}
              className={
                stage.key === decisionData.stage
                  ? "text-[hsl(var(--brand-primary))] font-medium"
                  : ""
              }
            >
              {stage.shortLabel}
            </span>
          ))}
        </div>
      </div>

      {/* Context Section */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          Decision Context
        </h4>
        <DecisionContext />
      </div>

      {/* Criteria Weights */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          Evaluation Criteria
        </h4>
        <CriteriaWeights />
      </div>

      {/* Possible Outcomes by Option */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          Possible Outcomes
        </h4>
        <div className="space-y-4">
          {decisionData.options.map((option) => (
            <OptionOutcomes
              key={option.id}
              optionId={option.id || option.name.toLowerCase()}
              optionName={option.name}
              optionDescription={option.description}
              color={optionColors[option.id || option.name.toLowerCase()] || "hsl(200 70% 55%)"}
              isRecommended={option.name === decisionData.recommendation}
            />
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.05)] p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand-primary)/0.2)] flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-[hsl(var(--brand-primary))]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-[hsl(var(--brand-primary))]">
                Recommendation: {decisionData.recommendation}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {decisionData.rationale}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Scale className="w-3.5 h-3.5" />
        <span>
          {decisionData.analysisType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} •{" "}
          {DECISION_STAGES.find((s) => s.key === decisionData.stage)?.label} Stage
        </span>
      </div>
    </div>
  );
}

export default DecideDemo;
