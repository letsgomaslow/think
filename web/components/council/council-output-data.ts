// LLM Output Data - What the AI generates AFTER the council tool calls complete
// Based on real-world test: docs/tests/council_post_toolcall_llm_output.md

export interface StageEvolution {
  stage: string;
  keyDevelopment: string;
}

export interface DisagreementResolved {
  topic: string;
  resolution: string;
}

export interface CouncilOutput {
  finalRecommendation: {
    headline: string;
    summary: string;
  };
  stageEvolution: StageEvolution[];
  keyInsights: string[];
  disagreementsResolved: DisagreementResolved[];
  recommendedActions: string[];
  openQuestionsForLeadership: string[];
}

// Synthetic data matching the real Bloom & Co. test output
export const councilOutputData: CouncilOutput = {
  finalRecommendation: {
    headline: "YES, with reframing",
    summary:
      "Commit resources THIS quarter to launch UK market in Q2 2025. The question itself was flawed—'enter this quarter' is operationally impossible, but delaying commitment creates real downside risk.",
  },

  stageEvolution: [
    {
      stage: "problem-definition",
      keyDevelopment:
        "Reframed the question from 'enter this quarter' to 'commit this quarter'",
    },
    {
      stage: "ideation",
      keyDevelopment:
        "UK-first strategy emerged as tension-resolver between speed and compliance",
    },
    {
      stage: "critique",
      keyDevelopment:
        "Finance challenged opportunity cost; Growth challenged delay risk",
    },
    {
      stage: "integration",
      keyDevelopment:
        "Consensus: dedicated EU hiring breaks the US/EU zero-sum tradeoff",
    },
    {
      stage: "decision",
      keyDevelopment:
        "Unanimous conditional YES with clear go/no-go checkpoints",
    },
  ],

  keyInsights: [
    "Wrong question reframed: 'Enter' ≠ 'Launch.' It's a commitment decision, not a launch decision.",
    "Downside floor exists: Two enterprise customers = $1-2M ARR at risk justifies investment.",
    "UK-first unlocks the path: English language, lower complexity, creates EU beachhead.",
    "The real constraint: EU hiring speed, not capital ($2M is <7% of quarterly revenue).",
    "Competitors moving: Series B rounds create a closing window.",
  ],

  disagreementsResolved: [
    {
      topic: "Timeline (5 vs 6+ months)",
      resolution: "Settled at 6 months UK-only with dedicated team",
    },
    {
      topic: "US vs EU resource priority",
      resolution: "Resolved by hiring EU-specific team (not diverting US)",
    },
  ],

  recommendedActions: [
    "Approve $2M EU budget with Q2 2025 UK target",
    "Begin EU hiring immediately (2-3 engineers, 1 ops lead)",
    "Start UK legal entity + payment partner negotiations NOW",
    "Communicate timeline to enterprise customers to lock retention",
    "Set Q1 2025 go/no-go checkpoint: hiring success + GDPR architecture scoped",
  ],

  openQuestionsForLeadership: [
    "Can you hire EU engineers in <90 days? (Critical path)",
    "What's the exact ARR from the two enterprise customers requesting EU?",
    "What's your intel on when Series B competitors will launch?",
  ],
};

// Stage label formatting
export const stageLabels: Record<string, string> = {
  "problem-definition": "Problem Definition",
  ideation: "Ideation",
  critique: "Critique",
  integration: "Integration",
  decision: "Decision",
  reflection: "Reflection",
};
