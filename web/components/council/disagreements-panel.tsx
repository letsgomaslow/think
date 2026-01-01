"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ChevronDown, Swords } from "lucide-react";
import type { Disagreement, Persona } from "./council-demo-data";

interface DisagreementsPanelProps {
  disagreements: Disagreement[];
  personas: Persona[];
  delay?: number;
}

export function DisagreementsPanel({ disagreements, personas, delay = 0 }: DisagreementsPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!disagreements || disagreements.length === 0) {
    return null;
  }

  // Helper to find persona by id
  const getPersona = (id: string) => personas.find((p) => p.id === id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="rounded-xl border border-amber-700/30 bg-slate-800/30 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-amber-900/10 border-b border-amber-700/30">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-amber-400">
            Points of Disagreement
          </h4>
          <span className="ml-auto text-xs text-amber-500/70">
            {disagreements.length} {disagreements.length === 1 ? "topic" : "topics"}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {disagreements.map((disagreement, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <motion.div
              key={disagreement.topic}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden"
            >
              {/* Disagreement Topic Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-white">{disagreement.topic}</span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </motion.div>
              </button>

              {/* Expanded Positions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-700/50 overflow-hidden"
                  >
                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      {disagreement.positions.map((position, posIndex) => {
                        const persona = getPersona(position.personaId);
                        const isFirstPosition = posIndex === 0;

                        return (
                          <motion.div
                            key={position.personaId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: posIndex * 0.1 }}
                            className="p-3 rounded-lg border"
                            style={{
                              borderColor: persona?.color
                                ? persona.color.replace(")", " / 0.3)")
                                : "hsl(var(--slate-700) / 0.5)",
                              backgroundColor: persona?.color
                                ? persona.color.replace(")", " / 0.05)")
                                : "transparent",
                            }}
                          >
                            {/* Position Header */}
                            <div className="flex items-center gap-2 mb-2">
                              {/* Avatar - Profile photo or fallback letter */}
                              {persona?.imageUrl ? (
                                <img
                                  src={persona.imageUrl}
                                  alt={persona.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                  style={{
                                    borderWidth: 2,
                                    borderStyle: "solid",
                                    borderColor: persona.color || "transparent",
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{
                                    backgroundColor: persona?.color
                                      ? persona.color.replace(")", " / 0.2)")
                                      : "hsl(var(--slate-600))",
                                    color: persona?.color || "white",
                                  }}
                                >
                                  {persona?.name.charAt(0) || "?"}
                                </div>
                              )}
                              <span
                                className="text-sm font-medium"
                                style={{ color: persona?.color || "white" }}
                              >
                                {persona?.name || position.personaId}
                              </span>
                              {isFirstPosition && (
                                <span className="ml-auto text-[10px] uppercase tracking-wider text-amber-400 px-1.5 py-0.5 rounded bg-amber-900/20">
                                  Advocates
                                </span>
                              )}
                            </div>

                            {/* Position Statement */}
                            <p className="text-sm font-semibold text-white mb-2">
                              &ldquo;{position.position}&rdquo;
                            </p>

                            {/* Arguments */}
                            <div className="space-y-1">
                              {position.arguments.map((arg, argIndex) => (
                                <motion.div
                                  key={arg}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + argIndex * 0.05 }}
                                  className="flex items-start gap-2 text-xs text-slate-400"
                                >
                                  <span
                                    style={{ color: persona?.color || "hsl(var(--slate-400))" }}
                                  >
                                    •
                                  </span>
                                  {arg}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default DisagreementsPanel;
