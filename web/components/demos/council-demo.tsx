"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TeamRoster } from "@/components/council/team-roster";
import { ContributionFeed } from "@/components/council/contribution-feed";
import { PersonaSheet } from "@/components/council/persona-sheet";
import { SynthesisPanel } from "@/components/council/synthesis-panel";
import { CompanyContext } from "@/components/council/company-context";
import { ResponseMetadata } from "@/components/council/response-metadata";
import { DisagreementsPanel } from "@/components/council/disagreements-panel";
import { InputCollapsible } from "@/components/council/input-collapsible";
import { CouncilOutput } from "@/components/council/council-output";
import type { Persona, CouncilSession } from "@/components/council/council-demo-data";

// Business Strategist scenario: European market expansion
// Full MCP CollaborativeReasoningData schema compliance
const councilDemoSession: CouncilSession = {
  topic: "Should we enter the European market this quarter?",
  sessionId: "eu-expansion-demo-2024",
  stage: "decision",

  // MCP Required Fields
  activePersonaId: "finance-partner",
  iteration: 4,
  nextContributionNeeded: false,

  // MCP Optional Fields
  nextPersonaId: undefined,
  suggestedContributionTypes: ["synthesis", "suggestion"],

  personas: [
    {
      id: "market-analyst",
      name: "Maya Chen",
      expertise: ["market research", "competitive analysis", "TAM/SAM/SOM modeling", "industry trends"],
      background: "Former McKinsey consultant, 10 years in DTC/beauty sector analysis",
      perspective: "Data-driven, opportunity-focused, skeptical of hype",
      biases: ["May overweight market size vs execution risk", "Tends to favor expansion"],
      communication: { style: "analytical", tone: "confident" },
      color: "hsl(var(--brand-primary))",
      imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: "ops-director",
      name: "Thomas Weber",
      expertise: ["GDPR compliance", "localization", "supply chain", "support operations"],
      background: "Led EU operations for 2 DTC brands, German national with EU regulatory expertise",
      perspective: "Risk-aware, process-oriented, knows operational reality",
      biases: ["May overweight compliance complexity", "Conservative on timelines"],
      communication: { style: "methodical", tone: "cautious" },
      color: "hsl(var(--brand-accent))",
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "growth-lead",
      name: "Sarah Martinez",
      expertise: ["go-to-market strategy", "channel partnerships", "revenue acceleration", "brand positioning"],
      background: "Scaled 3 DTC brands internationally, ex-Glossier growth team",
      perspective: "Aggressive on timing, focused on competitive moats",
      biases: ["May underestimate operational drag", "Urgency bias from competitive pressure"],
      communication: { style: "direct", tone: "energetic" },
      color: "hsl(45 93% 60%)",
      imageUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: "finance-partner",
      name: "James Liu",
      expertise: ["unit economics", "FX risk", "investment timing", "cash flow modeling"],
      background: "CFO background, led finance for Series B-D stage companies",
      perspective: "ROI-focused, runway-conscious, timing-sensitive",
      biases: ["May overweight short-term costs vs long-term value", "Risk-averse on cash deployment"],
      communication: { style: "precise", tone: "measured" },
      color: "hsl(280 60% 70%)",
      imageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ],

  contributions: [
    {
      personaId: "market-analyst",
      content:
        "The core question isn't just 'should we enter' but 'should we enter THIS quarter.' EU DTC market at 18% YoY growth is solid. Three competitors raising Series B creates urgency but also validates the market.",
      type: "observation",
      confidence: 0.85,
    },
    {
      personaId: "ops-director",
      content:
        "I need to flag a critical timeline issue. 'This quarter' is operationally impossible for a compliant launch. GDPR compliance alone requires 3-4 months of engineering work. Realistic minimum: 6 months to genuine market entry. The question should be reframed: 'Should we commit resources THIS quarter to launch in Q2-Q3 2025?'",
      type: "concern",
      confidence: 0.92,
      referenceIds: ["market-analyst-1"],
    },
    {
      personaId: "growth-lead",
      content:
        "Thomas is right on timeline, but I want to challenge the framing. Two top-10 customers ALREADY requesting EU data centers - that's existing revenue at risk. Three competitors just raised Series B. We should commit THIS quarter to an aggressive 5-month UK-first launch.",
      type: "suggestion",
      confidence: 0.78,
      referenceIds: ["ops-director-1"],
    },
    {
      personaId: "finance-partner",
      content:
        "Let me put numbers to this. $2M expansion cost against $29.6M quarterly revenue - that's ~7% of one quarter's revenue. The real question is opportunity cost of diverting ~20% engineering capacity from 41% YoY US growth.",
      type: "insight",
      confidence: 0.88,
      referenceIds: ["growth-lead-1", "ops-director-1"],
    },
    {
      personaId: "market-analyst",
      content:
        "Synthesizing the positions: UK-first approach resolves most tensions - lower localization burden, protects enterprise customer revenue, creates beachhead before Series B competitors scale. The real risk isn't $2M - it's whether we can hire EU-focused talent fast enough.",
      type: "synthesis",
      confidence: 0.82,
      referenceIds: ["ops-director-1", "growth-lead-1", "finance-partner-1"],
    },
  ],

  disagreements: [
    {
      topic: "Launch timing",
      positions: [
        {
          personaId: "growth-lead",
          position: "Launch this quarter",
          arguments: [
            "Customer demand is urgent",
            "Competitors are circling",
            "Perfect is the enemy of good",
          ],
        },
        {
          personaId: "ops-director",
          position: "Launch Q2 next year",
          arguments: [
            "GDPR compliance takes time",
            "Support infrastructure needed",
            "One chance at first impression",
          ],
        },
      ],
    },
  ],

  synthesis: {
    consensusPoints: [
      "EU market opportunity is significant and growing",
      "Customer demand validates the expansion thesis",
      "Compliance and operational readiness are non-negotiable",
    ],
    keyInsights: [
      "Existing customer requests reduce go-to-market risk",
      "Phased rollout (UK first) could balance speed and compliance",
      "200 customers in 18 months is achievable with current pipeline",
    ],
    openQuestions: [
      "Can we fast-track GDPR compliance with an EU partner?",
      "Would a UK-first soft launch satisfy urgent customer needs?",
      "What's the competitive window before market leaders react?",
    ],
    finalRecommendation:
      "Don't launch broadly this quarter. Instead: (1) Announce EU commitment publicly now, (2) Soft-launch UK-only in 8 weeks with top 3 customers, (3) Full EU rollout Q1 next year with proper compliance.",
  },
};

export function CouncilDemo() {
  // State for persona sheet
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Handler for persona click (from roster or feed)
  const handlePersonaClick = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 1. Company Context */}
      <CompanyContext />

      {/* 2. Response Metadata */}
      <ResponseMetadata session={councilDemoSession} delay={0.1} />

      {/* 3. Team Roster - NEW */}
      <TeamRoster
        personas={councilDemoSession.personas}
        onPersonaClick={handlePersonaClick}
        delay={0.15}
      />

      {/* 4. Contribution Feed - NEW (replaces ExpertCard grid) */}
      <ContributionFeed
        contributions={councilDemoSession.contributions}
        personas={councilDemoSession.personas}
        onPersonaClick={handlePersonaClick}
        delay={0.25}
      />

      {/* 5. Disagreements Panel */}
      <DisagreementsPanel
        disagreements={councilDemoSession.disagreements}
        personas={councilDemoSession.personas}
        delay={0.5}
      />

      {/* 6. Synthesis Panel */}
      <SynthesisPanel
        synthesis={councilDemoSession.synthesis}
        nextContributionNeeded={councilDemoSession.nextContributionNeeded}
        suggestedContributionTypes={councilDemoSession.suggestedContributionTypes}
        delay={0.6}
      />

      {/* 7. LLM Output - AI Analysis after tool calls */}
      <CouncilOutput delay={0.65} />

      {/* 8. Input Sent to Tool (Collapsible - Technical Detail) */}
      <InputCollapsible session={councilDemoSession} delay={0.7} />

      {/* Persona Sheet (Drawer) - triggered by clicking any persona */}
      <PersonaSheet
        persona={selectedPersona}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}

export default CouncilDemo;
