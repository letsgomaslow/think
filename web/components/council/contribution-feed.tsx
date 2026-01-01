"use client";

import { motion } from "framer-motion";
import {
  Eye,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  MessageSquarePlus,
  Zap,
  GitMerge,
  CornerDownRight,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { FlowConnector } from "./flow-connector";
import type { Persona, Contribution, ContributionType } from "./council-demo-data";
import { contributionTypeConfig } from "./council-demo-data";

interface ContributionFeedProps {
  contributions: Contribution[];
  personas: Persona[];
  onPersonaClick: (persona: Persona) => void;
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

export function ContributionFeed({
  contributions,
  personas,
  onPersonaClick,
  delay = 0,
}: ContributionFeedProps) {
  // Helper to find persona by id
  const getPersonaById = (id: string): Persona | undefined => {
    return personas.find((p) => p.id === id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="space-y-3"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Discussion Flow
        </h3>
        <span className="text-xs text-slate-500">
          {contributions.length} contributions
        </span>
      </div>

      {/* Contribution Cards with Flow Connectors */}
      <div className="space-y-0">
        {contributions.map((contribution, index) => {
          const persona = getPersonaById(contribution.personaId);
          if (!persona) return null;

          const TypeIcon = typeIcons[contribution.type];
          const typeConfig = contributionTypeConfig[contribution.type];

          // Get next persona for flow connector (if not last item)
          const nextContribution = contributions[index + 1];
          const nextPersona = nextContribution
            ? getPersonaById(nextContribution.personaId)
            : null;

          return (
            <div key={`${contribution.personaId}-${index}`}>
              <motion.article
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 + index * 0.08, duration: 0.4 }}
              viewport={{ once: true }}
              className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 hover:border-slate-600/50 transition-colors"
            >
              {/* Main Row: Content Left + Circular Progress Right */}
              <div className="flex gap-4">
                {/* Left Section: Avatar + Content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Clickable Avatar */}
                  <button
                    onClick={() => onPersonaClick(persona)}
                    className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))] rounded-full"
                    aria-label={`View ${persona.name}'s profile`}
                  >
                    <Avatar
                      className="h-9 w-9 ring-2 ring-offset-1 ring-offset-slate-800 cursor-pointer hover:scale-105 transition-transform"
                      style={{
                        ["--tw-ring-color" as string]: persona.color,
                      }}
                    >
                      {persona.imageUrl && (
                        <AvatarImage src={persona.imageUrl} alt={persona.name} />
                      )}
                      <AvatarFallback
                        className="text-xs font-bold"
                        style={{
                          backgroundColor: persona.color.replace(")", " / 0.2)").replace("hsl", "hsla"),
                          color: persona.color,
                        }}
                      >
                        {getInitials(persona.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    {/* Name + Type Badge Row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <button
                        onClick={() => onPersonaClick(persona)}
                        className="font-semibold text-white hover:underline cursor-pointer text-sm"
                      >
                        {persona.name}
                      </button>
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                        style={{
                          backgroundColor: typeConfig.color.replace(")", " / 0.15)").replace("hsl", "hsla"),
                          color: typeConfig.color,
                        }}
                      >
                        <TypeIcon className="w-3 h-3" />
                        <span>{typeConfig.label}</span>
                      </div>
                      {/* Reference Indicator */}
                      {contribution.referenceIds && contribution.referenceIds.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <CornerDownRight className="w-3 h-3" />
                          <span>refs</span>
                          {contribution.referenceIds.map((refId) => (
                            <span
                              key={refId}
                              className="px-1 py-0.5 rounded bg-slate-700/50 font-mono text-slate-400"
                            >
                              #{refId.split("-").pop()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contribution Content */}
                    <p className="text-sm text-slate-300 leading-relaxed">
                      &ldquo;{contribution.content}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right Section: Circular Confidence Gauge */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center">
                  <AnimatedCircularProgressBar
                    value={Math.round(contribution.confidence * 100)}
                    gaugePrimaryColor={persona.color}
                    gaugeSecondaryColor="rgba(51, 65, 85, 0.5)"
                    className="size-20 text-sm font-medium"
                  />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
                    Confidence
                  </span>
                </div>
              </div>
            </motion.article>

              {/* Flow connector to next contribution */}
              {nextPersona && (
                <FlowConnector
                  fromColor={persona.color}
                  toColor={nextPersona.color}
                  delay={delay + 0.15 + index * 0.08}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default ContributionFeed;
