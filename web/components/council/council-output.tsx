"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  Lightbulb,
  ArrowRightLeft,
  ListChecks,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { councilOutputData, stageLabels } from "./council-output-data";
import type { CouncilOutput as CouncilOutputType } from "./council-output-data";

interface CouncilOutputProps {
  data?: CouncilOutputType;
  delay?: number;
}

export function CouncilOutput({
  data = councilOutputData,
  delay = 0,
}: CouncilOutputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.15)] to-transparent border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[hsl(var(--brand-primary)/0.2)]">
            <Bot className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
          </div>
          <h4 className="text-sm font-semibold text-white">
            AI Council Analysis
          </h4>
        </div>
        <p className="text-xs text-slate-400 mt-1 ml-8">
          Synthesized output after council deliberation
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Final Recommendation */}
        <div className="p-4 rounded-lg bg-[hsl(var(--brand-primary)/0.08)] border border-[hsl(var(--brand-primary)/0.2)]">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[hsl(var(--brand-primary))] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-[hsl(var(--brand-primary))] mb-1">
                Final Recommendation
              </div>
              <div className="text-lg font-bold text-white mb-2">
                {data.finalRecommendation.headline}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {data.finalRecommendation.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Evolution Table */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="w-4 h-4 text-slate-500" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              How the Council Evolved
            </span>
          </div>
          <div className="rounded-lg border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider">
                    Key Development
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.stageEvolution.map((evolution, index) => (
                  <motion.tr
                    key={evolution.stage}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.1 + index * 0.05 }}
                    viewport={{ once: true }}
                    className="border-t border-slate-700/30"
                  >
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-700/50 text-xs font-medium text-slate-300">
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        {stageLabels[evolution.stage] || evolution.stage}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-sm">
                      {evolution.keyDevelopment}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Key Insights ({data.keyInsights.length})
            </span>
          </div>
          <ul className="space-y-2">
            {data.keyInsights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.2 + index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-amber-500 mt-1">•</span>
                <span className="text-slate-300">{insight}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Disagreements Resolved */}
        {data.disagreementsResolved.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Disagreements Resolved ({data.disagreementsResolved.length})
              </span>
            </div>
            <div className="space-y-2">
              {data.disagreementsResolved.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.3 + index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-900/10 border border-emerald-800/30"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-300">
                      {item.topic}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-emerald-400">
                      {item.resolution}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Recommended Actions ({data.recommendedActions.length})
            </span>
          </div>
          <ol className="space-y-2">
            {data.recommendedActions.map((action, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.4 + index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start gap-3 text-sm"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--brand-primary)/0.2)] text-[hsl(var(--brand-primary))] text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-slate-300">{action}</span>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Open Questions for Leadership */}
        <div className="p-3 rounded-lg bg-amber-900/10 border border-amber-800/30">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs uppercase tracking-wider text-amber-500">
              Open Questions for Leadership
            </span>
          </div>
          <ul className="space-y-1.5">
            {data.openQuestionsForLeadership.map((question, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-amber-300/80"
              >
                <span className="text-amber-500">?</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default CouncilOutput;
