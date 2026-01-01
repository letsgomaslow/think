"use client";

import { motion } from "framer-motion";
import { Check, Lightbulb, HelpCircle, ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import type { Synthesis, ContributionType } from "./council-demo-data";
import { contributionTypeConfig } from "./council-demo-data";

interface SynthesisPanelProps {
  synthesis: Synthesis;
  delay?: number;
  nextContributionNeeded?: boolean;
  suggestedContributionTypes?: ContributionType[];
}

export function SynthesisPanel({
  synthesis,
  delay = 0,
  nextContributionNeeded,
  suggestedContributionTypes,
}: SynthesisPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      className="rounded-xl border border-[hsl(var(--brand-primary)/0.3)] bg-slate-800/30 overflow-hidden"
    >
      {/* Header with Status */}
      <div className="px-4 py-3 bg-[hsl(var(--brand-primary)/0.1)] border-b border-[hsl(var(--brand-primary)/0.2)]">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[hsl(var(--brand-primary))]">
            Council Synthesis
          </h4>
          {nextContributionNeeded !== undefined && (
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${
                nextContributionNeeded
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {nextContributionNeeded ? (
                <>
                  <PlayCircle className="w-3 h-3" />
                  More contributions needed
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Council complete
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Consensus Points */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Consensus Reached
            </span>
          </div>
          <ul className="space-y-1.5">
            {synthesis.consensusPoints.map((point, index) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="text-emerald-400 mt-0.5">✓</span>
                {point}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Key Insights */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Key Insights
            </span>
          </div>
          <ul className="space-y-1.5">
            {synthesis.keyInsights.map((insight, index) => (
              <motion.li
                key={insight}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="text-amber-400 mt-0.5">→</span>
                {insight}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Open Questions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Still to Clarify
            </span>
          </div>
          <ul className="space-y-1.5">
            {synthesis.openQuestions.map((question, index) => (
              <motion.li
                key={question}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-2 text-sm text-slate-400 italic"
              >
                <span className="text-blue-400 mt-0.5">?</span>
                {question}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Final Recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.7 }}
          viewport={{ once: true }}
          className="mt-4 p-4 rounded-lg bg-[hsl(var(--brand-primary)/0.1)] border border-[hsl(var(--brand-primary)/0.3)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
            <span className="text-xs uppercase tracking-wider text-[hsl(var(--brand-primary))]">
              Recommendation
            </span>
          </div>
          <p className="text-sm text-white leading-relaxed">
            {synthesis.finalRecommendation}
          </p>
        </motion.div>

        {/* Suggested Contribution Types (if any) */}
        {suggestedContributionTypes && suggestedContributionTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.9 }}
            viewport={{ once: true }}
            className="pt-3 border-t border-slate-700/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Suggested Next Contributions
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedContributionTypes.map((type) => {
                const config = contributionTypeConfig[type];
                return (
                  <span
                    key={type}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: config.color.replace(")", " / 0.15)"),
                      color: config.color,
                    }}
                  >
                    {config.label}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default SynthesisPanel;
