"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Target,
  ChevronDown,
  ChevronRight,
  Scale,
  Lightbulb,
  Shield,
  RefreshCw,
  Clock,
  Hash,
} from "lucide-react";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import {
  reflectDemoData,
  STAGES,
  knowledgeLevelStyles,
  claimStatusStyles,
  getStageIndex,
  isStageComplete,
  isCurrentStage,
  formatPercentage,
  getConfidenceColor,
  type Stage,
  type ClaimAssessment,
  type ReasoningAssessment,
} from "./reflect-demo-data";

// ============================================================================
// Stage Progression Component
// ============================================================================

function StageProgression({ currentStage }: { currentStage: Stage }) {
  const currentIndex = getStageIndex(currentStage);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-700/50 bg-slate-800/30"
    >
      <div className="text-xs text-slate-500 mr-2 flex items-center gap-1.5">
        <RefreshCw className="w-3 h-3" />
        <span>Stage</span>
      </div>
      {STAGES.map((stage, index) => {
        const isComplete = isStageComplete(currentStage, stage.id);
        const isCurrent = isCurrentStage(currentStage, stage.id);

        return (
          <div key={stage.id} className="flex items-center gap-1.5">
            {index > 0 && (
              <div
                className={`w-4 h-0.5 ${
                  index <= currentIndex ? "bg-[hsl(var(--brand-primary))]" : "bg-slate-700"
                }`}
              />
            )}
            <div
              className={`
                px-2 py-1 rounded-md text-[10px] font-medium transition-all
                ${isCurrent
                  ? "bg-[hsl(var(--brand-primary))] text-white"
                  : isComplete
                  ? "bg-[hsl(var(--brand-primary)/0.2)] text-[hsl(var(--brand-primary))]"
                  : "bg-slate-800 text-slate-500"
                }
              `}
            >
              {stage.label}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ============================================================================
// Session Header Component
// ============================================================================

function SessionHeader() {
  const { monitoringId, iteration, nextAssessmentNeeded } = reflectDemoData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex flex-wrap items-center gap-3 text-xs"
    >
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 text-slate-400">
        <Hash className="w-3 h-3" />
        <span className="font-mono">{monitoringId}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 text-slate-400">
        <Clock className="w-3 h-3" />
        <span>Iteration {iteration}</span>
      </div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded ${
          nextAssessmentNeeded
            ? "bg-amber-500/10 text-amber-400"
            : "bg-emerald-500/10 text-emerald-400"
        }`}
      >
        {nextAssessmentNeeded ? (
          <>
            <RefreshCw className="w-3 h-3" />
            <span>More assessment needed</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3" />
            <span>Assessment complete</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Knowledge Assessment Component (Single)
// ============================================================================

function KnowledgeAssessmentCard() {
  const ka = reflectDemoData.knowledgeAssessment;
  if (!ka) return null;

  const style = knowledgeLevelStyles[ka.knowledgeLevel];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{ka.domain}</span>
        <span
          className="text-xs capitalize px-2 py-0.5 rounded"
          style={{ color: style.color, backgroundColor: `${style.color}15` }}
        >
          {ka.knowledgeLevel}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${ka.confidenceScore * 100}%` }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="h-full rounded-full"
          style={{ backgroundColor: style.color }}
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <p className="text-xs text-slate-400">{ka.supportingEvidence}</p>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatPercentage(ka.confidenceScore)}
        </span>
      </div>

      {/* Limitations */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          Known Limitations
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ka.knownLimitations.map((limit, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
            >
              {limit}
            </span>
          ))}
        </div>
      </div>

      {/* Training Cutoff */}
      {ka.relevantTrainingCutoff && (
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-700/30">
          Training cutoff: {ka.relevantTrainingCutoff}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Reasoning Step Card Component
// ============================================================================

function ReasoningStepCard({
  step,
  index,
  defaultExpanded,
}: {
  step: ReasoningAssessment;
  index: number;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      viewport={{ once: true }}
      className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="w-6 h-6 rounded-lg bg-[hsl(var(--brand-primary)/0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-semibold text-[hsl(var(--brand-primary))]">
            {index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white">{step.step}</p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
      </button>

      {/* Validity Bars (always visible) */}
      <div className="px-4 pb-3 space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Scale className="w-3 h-3" />
              Logical Validity
            </span>
            <span className="text-slate-400">{formatPercentage(step.logicalValidity)}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${step.logicalValidity * 100}%` }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="h-full rounded-full"
              style={{ backgroundColor: getConfidenceColor(step.logicalValidity) }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Inference Strength
            </span>
            <span className="text-slate-400">{formatPercentage(step.inferenceStrength)}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${step.inferenceStrength * 100}%` }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="h-full rounded-full"
              style={{ backgroundColor: getConfidenceColor(step.inferenceStrength) }}
            />
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-700/30 pt-3">
              {/* Potential Biases */}
              {step.potentialBiases.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Potential Biases
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {step.potentialBiases.map((bias, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        {bias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assumptions */}
              {step.assumptions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Assumptions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {step.assumptions.map((assumption, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
                      >
                        {assumption}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// Claim Card Component
// ============================================================================

function ClaimCard({ claim, index }: { claim: ClaimAssessment; index: number }) {
  const [showDetails, setShowDetails] = useState(false);
  const style = claimStatusStyles[claim.status];

  const StatusIcon = {
    fact: CheckCircle2,
    inference: Brain,
    speculation: HelpCircle,
    uncertain: AlertTriangle,
  }[claim.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      viewport={{ once: true }}
      className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: style.bgColor }}
        >
          <StatusIcon className="w-3.5 h-3.5" style={{ color: style.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium" style={{ color: style.color }}>
              {style.label}
            </span>
            <span className="text-xs text-slate-500">
              {formatPercentage(claim.confidenceScore)} confidence
            </span>
          </div>
          <p className="text-sm text-white mb-1">{claim.claim}</p>
          <p className="text-xs text-slate-500">Basis: {claim.evidenceBasis}</p>

          {/* Expandable Details */}
          {(claim.falsifiabilityCriteria || (claim.alternativeInterpretations && claim.alternativeInterpretations.length > 0)) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-[10px] text-[hsl(var(--brand-primary))] hover:underline flex items-center gap-1"
            >
              {showDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {showDetails ? "Hide details" : "Show details"}
            </button>
          )}

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-3">
                  {claim.falsifiabilityCriteria && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-red-400 block mb-1">
                        What would disprove this?
                      </span>
                      <p className="text-xs text-slate-400">{claim.falsifiabilityCriteria}</p>
                    </div>
                  )}

                  {claim.alternativeInterpretations && claim.alternativeInterpretations.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-blue-400 block mb-1">
                        Alternative interpretations
                      </span>
                      <ul className="space-y-1">
                        {claim.alternativeInterpretations.map((alt, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                            <span className="text-blue-400 mt-0.5">•</span>
                            {alt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ReflectDemo() {
  return (
    <div className="space-y-5">
      {/* Stage Progression */}
      <StageProgression currentStage={reflectDemoData.stage} />

      {/* Session Header */}
      <SessionHeader />

      {/* Task Header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Task Under Analysis</span>
        </div>
        <p className="text-white font-medium">{reflectDemoData.task}</p>
      </motion.div>

      {/* Knowledge Assessment */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" />
          Knowledge Self-Assessment
        </h4>
        <KnowledgeAssessmentCard />
      </div>

      {/* Reasoning Steps (NEW) */}
      {reflectDemoData.reasoningSteps && reflectDemoData.reasoningSteps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" />
            Reasoning Steps
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--brand-primary)/0.2)] text-[hsl(var(--brand-primary))]">
              NEW
            </span>
          </h4>
          <div className="space-y-2">
            {reflectDemoData.reasoningSteps.map((step, index) => (
              <ReasoningStepCard
                key={index}
                step={step}
                index={index}
                defaultExpanded={index === 0} // First expanded by default
              />
            ))}
          </div>
        </div>
      )}

      {/* Claims Analysis */}
      {reflectDemoData.claims && reflectDemoData.claims.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-500">
            Claim Confidence Assessment
          </h4>
          <div className="space-y-2">
            {reflectDemoData.claims.map((claim, index) => (
              <ClaimCard key={index} claim={claim} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Uncertainties */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
      >
        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Acknowledged Uncertainties</span>
        </div>
        <ul className="space-y-1.5">
          {reflectDemoData.uncertaintyAreas.map((u, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">?</span>
              {u}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Suggested Assessments */}
      {reflectDemoData.suggestedAssessments && reflectDemoData.suggestedAssessments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 text-xs"
        >
          <span className="text-slate-500">Suggested next:</span>
          {reflectDemoData.suggestedAssessments.map((assessment) => (
            <span
              key={assessment}
              className="px-2 py-0.5 rounded bg-[hsl(var(--brand-primary)/0.1)] text-[hsl(var(--brand-primary))] border border-[hsl(var(--brand-primary)/0.2)]"
            >
              {assessment} assessment
            </span>
          ))}
        </motion.div>
      )}

      {/* Overall Confidence + Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-[hsl(var(--brand-primary)/0.05)]"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AnimatedCircularProgressBar
              max={100}
              value={Math.round(reflectDemoData.overallConfidence * 100)}
              min={0}
              gaugePrimaryColor="hsl(var(--brand-primary))"
              gaugeSecondaryColor="hsl(var(--brand-primary) / 0.2)"
              className="w-20 h-20"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[hsl(var(--brand-primary)/0.2)] flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-[hsl(var(--brand-primary))]" />
              </div>
              <span className="text-xs font-medium text-[hsl(var(--brand-primary))]">
                Metacognitive Summary
              </span>
            </div>
            <p className="text-sm text-slate-300">{reflectDemoData.recommendedApproach}</p>
          </div>
        </div>
      </motion.div>

      {/* Tool badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Knowledge-Aware Reasoning</span>
      </div>
    </div>
  );
}

export default ReflectDemo;
