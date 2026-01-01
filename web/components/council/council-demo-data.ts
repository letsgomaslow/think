// Crafted example data showcasing full council JSON richness
// Hand-tuned to demonstrate all visualization features
// Updated to match MCP CollaborativeReasoningData schema

// All 7 contribution types from MCP schema
export type ContributionType =
  | "observation"
  | "question"
  | "insight"
  | "concern"
  | "suggestion"
  | "challenge"
  | "synthesis";

// All 6 stage types from MCP schema
export type StageType =
  | "problem-definition"
  | "ideation"
  | "critique"
  | "integration"
  | "decision"
  | "reflection";

export interface Persona {
  id: string;
  name: string;
  expertise: string[];
  background: string;
  perspective: string;
  biases: string[];
  communication: {
    style: string;
    tone: string;
  };
  color: string;
  imageUrl?: string; // Optional profile picture URL (e.g., from randomuser.me)
}

export interface Contribution {
  // Note: Real tool does NOT generate contribution IDs
  // referenceIds use format: personaId-sequence (e.g., "ops-director-1")
  personaId: string;
  content: string;
  type: ContributionType;
  confidence: number;
  referenceIds?: string[];
}

export interface Disagreement {
  topic: string;
  positions: {
    personaId: string;
    position: string;
    arguments: string[];
  }[];
}

export interface Synthesis {
  consensusPoints: string[];
  keyInsights: string[];
  openQuestions: string[];
  finalRecommendation: string;
}

export interface CouncilSession {
  topic: string;
  sessionId: string;
  stage: StageType;
  personas: Persona[];
  contributions: Contribution[];
  disagreements: Disagreement[];
  synthesis: Synthesis;
  // MCP Required Fields
  activePersonaId: string;
  iteration: number;
  nextContributionNeeded: boolean;
  // MCP Optional Fields
  nextPersonaId?: string;
  suggestedContributionTypes?: ContributionType[];
}

// Company context for the demo scenario
export interface CompanyProfile {
  name: string;
  industry: string;
  founded: string;
  headquarters: string;
  employees: string;
  currentMarkets: string;
}

export interface QuarterlyMetrics {
  quarter: string;
  gmv: number;      // Gross Merchandise Value in millions
  orders: number;   // Thousands of orders
  customers: number; // Active customers in thousands
  revenue: number;  // Revenue in millions
}

export const councilDemoData: CouncilSession = {
  topic: "Should I quit my job to start a startup?",
  sessionId: "demo-session",
  stage: "decision",
  // MCP Required Fields
  activePersonaId: "risk-analyst",
  iteration: 3,
  nextContributionNeeded: false,
  // MCP Optional Fields
  suggestedContributionTypes: ["synthesis", "suggestion"],

  personas: [
    {
      id: "financial-advisor",
      name: "Financial Advisor",
      expertise: ["personal finance", "risk management", "runway calculation"],
      background: "20 years advising professionals on major financial transitions",
      perspective: "Financial security enables risk-taking. Calculate before you leap.",
      biases: ["conservative on timing", "emphasizes emergency funds"],
      communication: { style: "quantitative", tone: "measured" },
      color: "hsl(var(--brand-primary))",
      imageUrl: "https://randomuser.me/api/portraits/men/52.jpg",
    },
    {
      id: "startup-founder",
      name: "Startup Founder",
      expertise: ["product-market fit", "fundraising", "founder psychology"],
      background: "3x founder, 1 exit, 2 failures",
      perspective: "Validation trumps preparation. Revenue beats runway.",
      biases: ["survivorship bias", "underestimates risk"],
      communication: { style: "narrative", tone: "energetic" },
      color: "hsl(var(--brand-accent))",
      imageUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: "career-coach",
      name: "Career Coach",
      expertise: ["career transitions", "motivation psychology", "burnout prevention"],
      background: "Helped 500+ professionals navigate major career changes",
      perspective: "Understand what you're running from vs. toward.",
      biases: ["favors introspection", "may slow action"],
      communication: { style: "questioning", tone: "empathetic" },
      color: "hsl(159 43% 70%)",
      imageUrl: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    {
      id: "risk-analyst",
      name: "Risk Analyst",
      expertise: ["opportunity cost", "decision modeling", "scenario planning"],
      background: "Former quant, now advises on major life decisions",
      perspective: "Your true cost isn't just salary. Calculate everything.",
      biases: ["over-quantifies emotions", "analysis paralysis"],
      communication: { style: "analytical", tone: "precise" },
      color: "hsl(330 72% 80%)",
      imageUrl: "https://randomuser.me/api/portraits/men/86.jpg",
    },
  ],

  contributions: [
    {
      personaId: "financial-advisor",
      content:
        "Don't quit until you have 18 months of runway saved. Your burn rate matters more than your excitement.",
      type: "observation",
      confidence: 0.85,
    },
    {
      personaId: "startup-founder",
      content:
        "I quit too early and regretted it. Build nights and weekends first. Validate with paying customers before you leap.",
      type: "challenge",
      confidence: 0.9,
      referenceIds: ["financial-advisor-1"],
    },
    {
      personaId: "career-coach",
      content:
        "What are you running FROM vs. running TOWARD? If it's escape, fix that first. Startups amplify your problems.",
      type: "question",
      confidence: 0.78,
    },
    {
      personaId: "risk-analyst",
      content:
        "Your opportunity cost isn't just salary—it's 401k matching, healthcare, career momentum, and optionality. The real number is 2-3x your salary.",
      type: "insight",
      confidence: 0.88,
      referenceIds: ["financial-advisor-1", "career-coach-1"],
    },
  ],

  disagreements: [
    {
      topic: "How much runway is enough?",
      positions: [
        {
          personaId: "financial-advisor",
          position: "18-24 months minimum",
          arguments: [
            "Covers unexpected costs",
            "Reduces desperation decisions",
            "Allows proper product iteration",
          ],
        },
        {
          personaId: "startup-founder",
          position: "Revenue > runway",
          arguments: [
            "Paying customers prove demand",
            "Runway without traction is just delayed failure",
            "Constraints breed creativity",
          ],
        },
      ],
    },
  ],

  synthesis: {
    consensusPoints: [
      "Validation before quitting is essential",
      "Understand your motivations clearly",
      "Calculate true opportunity cost, not just salary",
    ],
    keyInsights: [
      "Revenue validation > pure runway savings",
      "Running from something ≠ running toward something",
      "Opportunity cost is 2-3x visible salary",
    ],
    openQuestions: [
      "What's the specific startup idea?",
      "What's your current runway?",
      "Have you tested demand with real customers?",
    ],
    finalRecommendation:
      "Don't quit yet. Instead: (1) Build nights and weekends for 3 months, (2) Get 3 paying customers, (3) Save 12 months runway, (4) Then make the leap with evidence.",
  },
};

// Helper to get contribution type styling - all 7 MCP schema types
export const contributionTypeConfig = {
  observation: {
    icon: "Eye",
    label: "Observation",
    color: "hsl(var(--brand-primary))",
  },
  question: {
    icon: "HelpCircle",
    label: "Question",
    color: "hsl(45 93% 60%)",
  },
  insight: {
    icon: "Lightbulb",
    label: "Insight",
    color: "hsl(159 43% 70%)",
  },
  concern: {
    icon: "AlertCircle",
    label: "Concern",
    color: "hsl(0 72% 65%)",
  },
  suggestion: {
    icon: "MessageSquarePlus",
    label: "Suggestion",
    color: "hsl(200 80% 60%)",
  },
  challenge: {
    icon: "Zap",
    label: "Challenge",
    color: "hsl(var(--brand-accent))",
  },
  synthesis: {
    icon: "GitMerge",
    label: "Synthesis",
    color: "hsl(280 60% 70%)",
  },
} as const;

// Helper to find persona by id
export function getPersonaById(id: string): Persona | undefined {
  return councilDemoData.personas.find((p) => p.id === id);
}
