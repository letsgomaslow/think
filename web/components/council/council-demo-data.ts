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
  topic: "Should we build an AI-powered content generation feature for our SaaS product?",
  sessionId: "demo-session-predefined-personas",
  stage: "decision",
  // MCP Required Fields
  activePersonaId: "devils-advocate",
  iteration: 4,
  nextContributionNeeded: false,
  // MCP Optional Fields
  suggestedContributionTypes: ["synthesis", "suggestion"],

  personas: [
    {
      id: "security-specialist",
      name: "Security Specialist",
      expertise: [
        "Threat modeling and risk assessment",
        "Compliance and regulatory requirements (GDPR, SOC2, HIPAA)",
        "Data protection and privacy",
        "Authentication and authorization systems",
      ],
      background: "A seasoned security professional with 15+ years of experience in cybersecurity, including roles as a penetration tester, security architect, and CISO.",
      perspective: "Security is not an afterthought—it must be designed in from the beginning. Every feature represents a potential attack surface. Defense in depth is essential.",
      biases: [
        "May be overly cautious and risk-averse",
        "Can focus too much on unlikely attack scenarios",
        "May underestimate user experience impacts of security measures",
      ],
      communication: {
        style: "Direct and methodical, using precise security terminology while explaining threats in concrete terms",
        tone: "Serious and vigilant, but not alarmist"
      },
      color: "hsl(0 72% 65%)",
      imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: "product-manager",
      name: "Product Manager",
      expertise: [
        "Product roadmapping and strategic planning",
        "Prioritization frameworks (RICE, MoSCoW)",
        "Product-market fit assessment",
        "Metrics definition and KPI tracking (OKRs, AARRR)",
      ],
      background: "An experienced product leader with 10+ years in product management across B2B and B2C products. Has launched multiple successful products from 0-to-1 and scaled to millions of users.",
      perspective: "Great products solve real customer problems in ways that are valuable, usable, feasible, and viable. Success is measured by outcomes, not outputs.",
      biases: [
        "May over-index on customer requests at expense of technical debt",
        "Can be too focused on shipping features versus ensuring quality",
        "May underestimate technical complexity",
      ],
      communication: {
        style: "Strategic and outcome-oriented, using frameworks, data/metrics, and user stories",
        tone: "Collaborative and diplomatic, focused on alignment"
      },
      color: "hsl(200 80% 60%)",
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "design-thinker",
      name: "Design Thinker",
      expertise: [
        "Design thinking methodology (Empathize, Define, Ideate, Prototype, Test)",
        "Human-centered design and empathy building",
        "Rapid prototyping and iterative design",
        "Problem reframing and lateral thinking",
      ],
      background: "A design innovation specialist with 12+ years applying design thinking to complex challenges across healthcare, education, technology, and social innovation.",
      perspective: "Every problem is an opportunity to create something meaningful for humans. The best solutions come from truly understanding people's needs, emotions, and contexts.",
      biases: [
        "May over-prioritize novelty and creativity at expense of feasibility",
        "Can be overly focused on ideation phase",
        "May undervalue analytical approaches in favor of qualitative insights",
      ],
      communication: {
        style: "Visual and experiential, asks open-ended 'How might we...?' questions",
        tone: "Enthusiastic and possibility-oriented, with deep empathy"
      },
      color: "hsl(280 60% 70%)",
      imageUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: "devils-advocate",
      name: "Devil's Advocate",
      expertise: [
        "Critical thinking and logical reasoning",
        "Risk analysis and threat modeling",
        "Assumption identification and validation",
        "Pre-mortem analysis and failure mode prediction",
      ],
      background: "A strategic advisor and critical thinker with 12+ years of experience in risk assessment and strategy consulting. Has led pre-mortem sessions and red team exercises for Fortune 500 companies.",
      perspective: "The most dangerous assumptions are the ones we don't know we're making. Agreement is comfortable but often leads to groupthink. The goal isn't to be negative—it's to make ideas stronger.",
      biases: [
        "May over-emphasize risks and obstacles at expense of opportunities",
        "Can be perceived as overly negative or pessimistic",
        "May challenge ideas so thoroughly that progress is slowed",
      ],
      communication: {
        style: "Analytical and probing, using Socratic questioning and pre-mortem frameworks",
        tone: "Respectfully challenging and intellectually curious"
      },
      color: "hsl(45 93% 60%)",
      imageUrl: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ],

  contributions: [
    {
      personaId: "product-manager",
      content:
        "Before we dive into implementation, let's validate the customer problem. What evidence do we have that users actually want AI content generation? Have we talked to customers? What's the expected impact on our North Star metrics—activation, engagement, retention?",
      type: "question",
      confidence: 0.85,
    },
    {
      personaId: "design-thinker",
      content:
        "How might we empower users to create content that truly resonates with their audience, rather than just automating content creation? I'm concerned we might be solving for speed without understanding the deeper need. Can we prototype a minimal version and test it with 5 users this week to validate the emotional response and actual value?",
      type: "concern",
      confidence: 0.78,
      referenceIds: ["product-manager-1"],
    },
    {
      personaId: "security-specialist",
      content:
        "This opens up serious attack vectors. We need to consider: (1) Prompt injection attacks where users trick the AI into revealing training data or generating malicious content, (2) Data privacy—are we sending customer data to third-party AI models? GDPR/CCPA implications? (3) Content liability—who's responsible if the AI generates defamatory, biased, or copyrighted content? We need threat modeling before we write a single line of code.",
      type: "concern",
      confidence: 0.92,
    },
    {
      personaId: "devils-advocate",
      content:
        "Let's do a pre-mortem. Assume it's 6 months from now and this feature has failed spectacularly. What happened? My hypothesis: users tried it once, found the output generic and off-brand, and never came back. We invested 3 months of engineering time in a feature with 5% adoption. What assumptions are we making about AI quality and user willingness to use AI-generated content? Have we tested those assumptions?",
      type: "challenge",
      confidence: 0.83,
      referenceIds: ["design-thinker-1", "product-manager-1"],
    },
    {
      personaId: "product-manager",
      content:
        "Fair challenges. Here's what we know: (1) Customer interviews with 15 users—12 said content creation is their #1 time sink, (2) Competitor analysis shows 3 of 5 competitors have shipped this, (3) Early prototype tested with 5 beta users showed 40% would use it weekly IF it matches their brand voice. The 'IF' is critical—that's the product challenge. I propose we build an MVP focused on brand voice customization, not generic AI content.",
      type: "insight",
      confidence: 0.87,
      referenceIds: ["devils-advocate-1", "design-thinker-1"],
    },
    {
      personaId: "design-thinker",
      content:
        "Love the focus on brand voice! Here's how we could approach this: Two-week design sprint. Week 1: Co-create with 3 power users to understand their mental model for 'good content' and build a brand voice calibration flow. Week 2: Rapid prototype with 3 variations of the UI, test with 10 users, iterate based on feedback. We need to make the AI feel like a creative partner, not a robot.",
      type: "suggestion",
      confidence: 0.80,
      referenceIds: ["product-manager-2"],
    },
    {
      personaId: "security-specialist",
      content:
        "On the implementation side, we must: (1) Use a zero-data-retention agreement with the AI provider—customer inputs can't be used for training, (2) Implement input sanitization to prevent prompt injection, (3) Add content filtering to block generation of harmful content, (4) Create audit logs for compliance, (5) Get legal review on content liability and terms of service updates. Security and compliance are non-negotiable here.",
      type: "suggestion",
      confidence: 0.91,
      referenceIds: ["product-manager-2"],
    },
    {
      personaId: "devils-advocate",
      content:
        "What happens if the AI provider has an outage or changes pricing 10x? We're building a core feature on someone else's infrastructure. What's our dependency management strategy? Also, brand voice customization sounds great in theory, but how do we prevent the 'uncanny valley' effect where AI content is almost-but-not-quite right, which is worse than obviously robotic content?",
      type: "challenge",
      confidence: 0.79,
      referenceIds: ["design-thinker-2", "security-specialist-2"],
    },
    {
      personaId: "product-manager",
      content:
        "Valid concerns. Here's the decision framework: We build this as an experiment with a 3-month evaluation period. Success metrics: (1) 25%+ of active users try it, (2) 40%+ of those who try it use it weekly, (3) NPS for the feature is >30, (4) No security incidents or compliance issues. If we don't hit those metrics, we sunset it. We also negotiate a price cap with the AI provider and build provider-switching capability from day 1 to reduce vendor lock-in.",
      type: "synthesis",
      confidence: 0.86,
      referenceIds: ["devils-advocate-3", "security-specialist-2"],
    },
  ],

  disagreements: [
    {
      topic: "Should we build this feature now or wait for better AI models?",
      positions: [
        {
          personaId: "product-manager",
          position: "Build now with current models",
          arguments: [
            "Competitors are already shipping—waiting means falling behind",
            "Current models are 'good enough' with proper brand voice tuning",
            "We can iterate and improve as AI models evolve",
            "Customer pain is real today, not in 6 months",
          ],
        },
        {
          personaId: "devils-advocate",
          position: "Wait for next-generation models",
          arguments: [
            "Current AI output quality is inconsistent and may damage brand trust",
            "Better models in 6 months will require less engineering effort",
            "Shipping mediocre AI is worse than not shipping at all",
            "We risk setting negative first impressions that are hard to overcome",
          ],
        },
      ],
    },
    {
      topic: "How much control should users have over AI generation?",
      positions: [
        {
          personaId: "design-thinker",
          position: "High user control and transparency",
          arguments: [
            "Users need to understand how the AI works to trust it",
            "Creative control is essential for professional users",
            "Iteration and refinement are core to the creative process",
            "Transparency builds trust and adoption",
          ],
        },
        {
          personaId: "product-manager",
          position: "Simple interface, minimal options",
          arguments: [
            "Too many options create decision paralysis",
            "Most users want 'magic'—just make it work",
            "Complexity reduces adoption and increases support costs",
            "We can add advanced controls later based on power user feedback",
          ],
        },
      ],
    },
  ],

  synthesis: {
    consensusPoints: [
      "Brand voice customization is critical—generic AI content isn't valuable",
      "Security and compliance (data privacy, content filtering, audit logs) are non-negotiable",
      "Must validate with real users through rapid prototyping before full implementation",
      "Need clear success metrics and willingness to sunset the feature if it doesn't deliver value",
      "Vendor lock-in risk requires provider-switching capability from day 1",
    ],
    keyInsights: [
      "The real product challenge isn't 'can we build AI content generation'—it's 'can we make AI-generated content feel authentically on-brand'",
      "Security risks (prompt injection, data privacy, content liability) are significant and require upfront investment in safeguards",
      "Pre-mortem analysis reveals the primary failure mode: users try it once, find output generic, and abandon the feature",
      "Competitive pressure is real, but shipping mediocre AI content could be worse than not shipping at all",
    ],
    openQuestions: [
      "What is the minimum viable brand voice calibration that makes AI content feel authentic?",
      "How do we measure 'brand voice match' quantitatively to track improvement?",
      "What's our AI provider negotiation strategy for pricing caps and data retention?",
      "Can we run a closed beta with 20 users for 2 weeks before broader launch?",
    ],
    finalRecommendation:
      "Conditional YES—proceed with AI content generation, but with significant guardrails: (1) Start with a 2-week design sprint to co-create brand voice calibration with users, (2) Build MVP with focus on brand voice customization, input sanitization, zero-data-retention, and provider-switching capability, (3) Run closed beta with 20 users for 2 weeks with intensive feedback loops, (4) Set a 3-month evaluation period with clear success metrics (25% trial rate, 40% weekly usage, NPS >30, zero security incidents), (5) Be willing to sunset the feature if metrics aren't hit. The opportunity is real, but only if we solve for brand voice authenticity and security from day 1.",
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
