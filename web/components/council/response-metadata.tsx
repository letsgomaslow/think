"use client";

import { motion } from "framer-motion";
import { Layers, RotateCw, CheckCircle2, PlayCircle, Lightbulb, User } from "lucide-react";
import type { StageType, ContributionType, CouncilSession } from "./council-demo-data";
import { contributionTypeConfig } from "./council-demo-data";

interface ResponseMetadataProps {
  session: CouncilSession;
  delay?: number;
}

// Stage display configuration
const stageConfig: Record<StageType, { label: string; color: string }> = {
  "problem-definition": { label: "Problem Definition", color: "hsl(45 93% 60%)" },
  ideation: { label: "Ideation", color: "hsl(200 80% 60%)" },
  critique: { label: "Critique", color: "hsl(0 72% 65%)" },
  integration: { label: "Integration", color: "hsl(280 60% 70%)" },
  decision: { label: "Decision", color: "hsl(var(--brand-primary))" },
  reflection: { label: "Reflection", color: "hsl(159 43% 70%)" },
};

export function ResponseMetadata({ session, delay = 0 }: ResponseMetadataProps) {
  const stageInfo = stageConfig[session.stage];
  const activePersona = session.personas.find((p) => p.id === session.activePersonaId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2"
    >
      {/* Stage */}
      <MetadataCard
        icon={<Layers className="w-3.5 h-3.5" />}
        label="Stage"
        value={stageInfo.label}
        color={stageInfo.color}
        delay={delay}
      />

      {/* Iteration */}
      <MetadataCard
        icon={<RotateCw className="w-3.5 h-3.5" />}
        label="Iteration"
        value={`#${session.iteration}`}
        color="hsl(var(--brand-accent))"
        delay={delay + 0.05}
      />

      {/* Next Contribution Needed */}
      <MetadataCard
        icon={
          session.nextContributionNeeded ? (
            <PlayCircle className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )
        }
        label="Status"
        value={session.nextContributionNeeded ? "More needed" : "Complete"}
        color={session.nextContributionNeeded ? "hsl(45 93% 60%)" : "hsl(159 60% 50%)"}
        delay={delay + 0.1}
      />

      {/* Active Persona */}
      <MetadataCard
        icon={<User className="w-3.5 h-3.5" />}
        label="Active"
        value={activePersona?.name || session.activePersonaId}
        color={activePersona?.color || "hsl(var(--brand-primary))"}
        delay={delay + 0.15}
      />

      {/* Suggested Contribution Types (spans full width if present) */}
      {session.suggestedContributionTypes && session.suggestedContributionTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2, duration: 0.3 }}
          viewport={{ once: true }}
          className="col-span-2 md:col-span-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Suggested Next Contributions
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {session.suggestedContributionTypes.map((type) => {
              const config = contributionTypeConfig[type];
              return (
                <span
                  key={type}
                  className="px-2 py-1 rounded-full text-xs font-medium"
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
    </motion.div>
  );
}

// Helper component for metadata cards
function MetadataCard({
  icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      viewport={{ once: true }}
      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }} className="opacity-70">
          {icon}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div className="text-sm font-semibold" style={{ color }}>
        {value}
      </div>
    </motion.div>
  );
}

export default ResponseMetadata;
