"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Eye, Zap, HelpCircle, Lightbulb, GitMerge, AlertCircle, MessageSquarePlus, CornerDownRight } from "lucide-react";
import type { Persona, Contribution, ContributionType } from "./council-demo-data";
import { contributionTypeConfig } from "./council-demo-data";

interface ExpertCardProps {
  persona: Persona;
  contribution: Contribution;
  delay?: number;
}

// All 7 MCP contribution types with icons
const typeIcons: Record<ContributionType, React.ElementType> = {
  observation: Eye,
  question: HelpCircle,
  insight: Lightbulb,
  concern: AlertCircle,
  suggestion: MessageSquarePlus,
  challenge: Zap,
  synthesis: GitMerge,
};

export function ExpertCard({ persona, contribution, delay = 0 }: ExpertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const TypeIcon = typeIcons[contribution.type];
  const typeConfig = contributionTypeConfig[contribution.type];
  const cardId = `expert-card-${persona.id}`;
  const detailsId = `expert-details-${persona.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden transition-all duration-300 hover:border-slate-600/50"
      style={{
        boxShadow: isExpanded ? `0 0 20px ${persona.color.replace(")", " / 0.15)")}` : "none",
      }}
      aria-labelledby={cardId}
    >
      {/* Collapsed View (Always Visible) */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: persona.color.replace(")", " / 0.2)"),
                borderColor: persona.color,
                borderWidth: 2,
                color: persona.color,
              }}
            >
              {persona.name.charAt(0)}
            </div>

            {/* Name + Type Badge */}
            <div>
              <div className="flex items-center gap-2">
                <span id={cardId} className="font-semibold text-white">{persona.name}</span>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: typeConfig.color.replace(")", " / 0.15)"),
                    color: typeConfig.color,
                  }}
                >
                  <TypeIcon className="w-3 h-3" />
                  <span>{typeConfig.label}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500" style={{ color: persona.color }}>
                {persona.communication.style} • {persona.communication.tone}
              </div>
            </div>
          </div>

          {/* Expand Button */}
          <motion.button
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="p-1 rounded-full hover:bg-slate-700/50 text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))]"
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} details for ${persona.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Contribution Content */}
        <p className="text-sm text-slate-300 leading-relaxed">
          &ldquo;{contribution.content}&rdquo;
        </p>

        {/* References (if present) */}
        {contribution.referenceIds && contribution.referenceIds.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <CornerDownRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-slate-500">References:</span>
            <div className="flex flex-wrap gap-1">
              {contribution.referenceIds.map((refId) => (
                <span
                  key={refId}
                  className="px-1.5 py-0.5 rounded bg-slate-700/50 font-mono text-slate-300"
                >
                  {refId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Bar (Always Visible) */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-500">Confidence</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${contribution.confidence * 100}%` }}
              transition={{ delay: delay + 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="h-full rounded-full"
              style={{ backgroundColor: persona.color }}
            />
          </div>
          <span className="text-xs text-slate-400">{Math.round(contribution.confidence * 100)}%</span>
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={detailsId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-700/50 overflow-hidden"
            role="region"
            aria-label={`Detailed information about ${persona.name}`}
          >
            <div className="p-4 space-y-4">
              {/* Expertise Tags */}
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">
                  Expertise
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {persona.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 rounded-md text-xs bg-slate-700/50 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">
                  Background
                </span>
                <p className="text-sm text-slate-400">{persona.background}</p>
              </div>

              {/* Core Perspective */}
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">
                  Core Perspective
                </span>
                <p
                  className="text-sm italic border-l-2 pl-3"
                  style={{ borderColor: persona.color, color: persona.color }}
                >
                  &ldquo;{persona.perspective}&rdquo;
                </p>
              </div>

              {/* Biases Warning */}
              <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs uppercase tracking-wider text-amber-500">
                    Known Biases
                  </span>
                </div>
                <ul className="space-y-1">
                  {persona.biases.map((bias) => (
                    <li key={bias} className="text-xs text-amber-300/70 flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {bias}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default ExpertCard;
