"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Persona } from "./council-demo-data";

interface TeamRosterProps {
  personas: Persona[];
  onPersonaClick: (persona: Persona) => void;
  delay?: number;
}

export function TeamRoster({ personas, onPersonaClick, delay = 0 }: TeamRosterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
    >
      {/* Section Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Expert Council
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Click a team member to view their full profile
        </p>
      </div>

      {/* Avatar Row */}
      <div className="flex flex-wrap gap-4 justify-start">
        {personas.map((persona, index) => (
          <motion.button
            key={persona.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.1 + index * 0.1, duration: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPersonaClick(persona)}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label={`View ${persona.name}'s profile`}
          >
            {/* Avatar with color-coded border */}
            <Avatar
              className="h-14 w-14 ring-2 ring-offset-2 ring-offset-slate-800 cursor-pointer"
              style={{
                ["--tw-ring-color" as string]: persona.color,
              }}
            >
              {persona.imageUrl && (
                <AvatarImage src={persona.imageUrl} alt={persona.name} />
              )}
              <AvatarFallback
                className="text-lg font-bold"
                style={{
                  backgroundColor: persona.color.replace(")", " / 0.2)").replace("hsl", "hsla"),
                  color: persona.color,
                }}
              >
                {getInitials(persona.name)}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <span className="text-sm font-medium text-slate-200 whitespace-nowrap">
              {persona.name}
            </span>

            {/* Role/Title Badge */}
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: persona.color.replace(")", " / 0.15)").replace("hsl", "hsla"),
                color: persona.color,
              }}
            >
              {formatTitle(persona.id)}
            </span>
          </motion.button>
        ))}
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

// Helper to format kebab-case ID to Title Case
// e.g., "market-analyst" → "Market Analyst"
function formatTitle(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default TeamRoster;
