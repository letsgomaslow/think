"use client";

import { AlertTriangle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Persona } from "./council-demo-data";

interface PersonaSheetProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonaSheet({ persona, open, onOpenChange }: PersonaSheetProps) {
  if (!persona) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-900 border-slate-700">
        <SheetHeader className="pb-4">
          {/* Avatar + Name Header */}
          <div className="flex items-center gap-4">
            <Avatar
              className="h-16 w-16 ring-2 ring-offset-2 ring-offset-slate-900"
              style={{
                ["--tw-ring-color" as string]: persona.color,
              }}
            >
              {persona.imageUrl && (
                <AvatarImage src={persona.imageUrl} alt={persona.name} />
              )}
              <AvatarFallback
                className="text-xl font-bold"
                style={{
                  backgroundColor: persona.color.replace(")", " / 0.2)").replace("hsl", "hsla"),
                  color: persona.color,
                }}
              >
                {getInitials(persona.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl text-white">{persona.name}</SheetTitle>
              <SheetDescription className="text-sm" style={{ color: persona.color }}>
                {formatTitle(persona.id)}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-4">
          {/* Expertise Tags */}
          <section>
            <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {persona.expertise.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-700/50 text-slate-300 border border-slate-600/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Background */}
          <section>
            <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Background
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {persona.background}
            </p>
          </section>

          {/* Core Perspective */}
          <section>
            <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Core Perspective
            </h4>
            <blockquote
              className="text-sm italic border-l-2 pl-4 py-2"
              style={{
                borderColor: persona.color,
                color: persona.color,
              }}
            >
              &ldquo;{persona.perspective}&rdquo;
            </blockquote>
          </section>

          {/* Known Biases Warning */}
          <section className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs uppercase tracking-wider text-amber-500 font-medium">
                Known Biases
              </h4>
            </div>
            <ul className="space-y-2">
              {persona.biases.map((bias, index) => (
                <li
                  key={index}
                  className="text-sm text-amber-300/80 flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{bias}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Communication Style Details */}
          <section className="border-t border-slate-700/50 pt-4">
            <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
              Communication Style
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                  Style
                </span>
                <span
                  className="text-sm font-medium capitalize"
                  style={{ color: persona.color }}
                >
                  {persona.communication.style}
                </span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                  Tone
                </span>
                <span
                  className="text-sm font-medium capitalize"
                  style={{ color: persona.color }}
                >
                  {persona.communication.tone}
                </span>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
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

export default PersonaSheet;
