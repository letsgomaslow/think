"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Info,
  Users,
  MessageSquare,
  Hash,
  Layers,
  RotateCw,
  User,
  Eye,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  MessageSquarePlus,
  Zap,
  GitMerge,
} from "lucide-react";
import type { CouncilSession, ContributionType } from "./council-demo-data";
import { contributionTypeConfig } from "./council-demo-data";

interface InputCollapsibleProps {
  session: CouncilSession;
  delay?: number;
}

// Icon mapping for contribution types
const typeIcons: Record<ContributionType, React.ElementType> = {
  observation: Eye,
  question: HelpCircle,
  insight: Lightbulb,
  concern: AlertCircle,
  suggestion: MessageSquarePlus,
  challenge: Zap,
  synthesis: GitMerge,
};

export function InputCollapsible({ session, delay = 0 }: InputCollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      viewport={{ once: true }}
      className="rounded-xl border border-slate-700/50 overflow-hidden"
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-800/50 flex items-center gap-2 hover:bg-slate-800/70 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
        <Info className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-400">Input Sent to Tool</span>
        <span className="ml-auto text-[10px] text-slate-500">
          {session.personas.length} personas • {session.contributions.length} contributions •{" "}
          {session.disagreements.length} disagreements
        </span>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-slate-900/30">
              {/* Session Metadata */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  Session Metadata
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <MetadataItem icon={Hash} label="sessionId" value={session.sessionId} />
                  <MetadataItem icon={Layers} label="stage" value={session.stage} />
                  <MetadataItem icon={RotateCw} label="iteration" value={String(session.iteration)} />
                  <MetadataItem icon={User} label="activePersonaId" value={session.activePersonaId} />
                </div>
              </div>

              {/* Topic */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Topic
                </div>
                <div className="text-sm text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg">
                  &ldquo;{session.topic}&rdquo;
                </div>
              </div>

              {/* Personas */}
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  <Users className="w-3 h-3" />
                  Personas ({session.personas.length})
                </div>
                <div className="space-y-2">
                  {session.personas.map((persona, index) => (
                    <motion.div
                      key={persona.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {/* Avatar - Profile photo or fallback letter */}
                        {persona.imageUrl ? (
                          <img
                            src={persona.imageUrl}
                            alt={persona.name}
                            className="w-6 h-6 rounded-full object-cover"
                            style={{
                              borderWidth: 2,
                              borderStyle: "solid",
                              borderColor: persona.color,
                            }}
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: persona.color.replace(")", " / 0.2)"),
                              color: persona.color,
                            }}
                          >
                            {persona.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium" style={{ color: persona.color }}>
                          {persona.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono ml-auto">
                          id: {persona.id}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">expertise:</span>{" "}
                          <span className="text-slate-300">{persona.expertise.join(", ")}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">communication:</span>{" "}
                          <span className="text-slate-300">
                            {persona.communication.style}, {persona.communication.tone}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Contributions */}
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  <MessageSquare className="w-3 h-3" />
                  Contributions ({session.contributions.length})
                </div>
                <div className="space-y-2">
                  {session.contributions.map((contribution, index) => {
                    const config = contributionTypeConfig[contribution.type];
                    const TypeIcon = typeIcons[contribution.type];
                    return (
                      <motion.div
                        key={`${contribution.personaId}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                            style={{
                              backgroundColor: config.color.replace(")", " / 0.15)"),
                              color: config.color,
                            }}
                          >
                            <TypeIcon className="w-3 h-3" />
                            <span>{config.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            personaId: {contribution.personaId}
                          </span>
                          <span className="ml-auto text-[10px] text-slate-400">
                            confidence: {Math.round(contribution.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          &ldquo;{contribution.content}&rdquo;
                        </p>
                        {contribution.referenceIds && contribution.referenceIds.length > 0 && (
                          <div className="mt-1 text-[10px] text-slate-500">
                            referenceIds: [{contribution.referenceIds.join(", ")}]
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Control Flags */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  Control Flags
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-slate-800/50 text-xs">
                    <span className="text-slate-500">nextContributionNeeded:</span>{" "}
                    <span
                      className={
                        session.nextContributionNeeded ? "text-amber-400" : "text-emerald-400"
                      }
                    >
                      {String(session.nextContributionNeeded)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/50 text-xs">
                    <span className="text-slate-500">nextPersonaId:</span>{" "}
                    <span className="text-slate-300">
                      {session.nextPersonaId || "undefined"}
                    </span>
                  </div>
                </div>
                {session.suggestedContributionTypes &&
                  session.suggestedContributionTypes.length > 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-800/50 text-xs">
                      <span className="text-slate-500">suggestedContributionTypes:</span>{" "}
                      <span className="text-slate-300">
                        [{session.suggestedContributionTypes.join(", ")}]
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper component for metadata items
function MetadataItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="p-2 rounded-lg bg-slate-800/50">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3 h-3 text-slate-500" />
        <span className="text-[10px] text-slate-500">{label}</span>
      </div>
      <div className="text-xs text-slate-300 font-mono truncate">{value}</div>
    </div>
  );
}

export default InputCollapsible;
