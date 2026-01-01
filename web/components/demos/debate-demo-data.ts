// Schema-aligned demo data for Debate Tool
// Matches ArgumentData interface from src/models/interfaces.ts

export type ArgumentType =
  | "thesis"
  | "antithesis"
  | "synthesis"
  | "objection"
  | "rebuttal";

export interface Argument {
  argumentId: string;
  argumentType: ArgumentType;
  claim: string;
  premises: string[];
  conclusion: string;
  confidence: number;
  respondsTo?: string;
  supports?: string[];
  contradicts?: string[];
  strengths: string[];
  weaknesses: string[];
  nextArgumentNeeded: boolean;
  suggestedNextTypes?: ArgumentType[];
}

export interface DebateData {
  topic: string;
  arguments: Argument[];
  currentStage: "thesis" | "antithesis" | "synthesis" | "objection-rebuttal" | "resolution";
  finalVerdict?: string;
}

// Build vs Buy: Full dialectical debate with all 5 argument types
export const debateData: DebateData = {
  topic: "Should we build our own authentication system or buy an existing solution?",
  currentStage: "resolution",
  arguments: [
    // THESIS: Build in-house
    {
      argumentId: "arg-001",
      argumentType: "thesis",
      claim: "We should build authentication in-house for complete control and long-term cost savings",
      premises: [
        "Full control over security implementation and data ownership",
        "No vendor lock-in or recurring licensing costs at scale",
        "Can be customized exactly to our unique workflow needs",
        "Engineering team gains deep security expertise valuable for future projects",
      ],
      conclusion: "Building provides long-term strategic advantage and complete ownership of critical infrastructure.",
      confidence: 0.72,
      strengths: [
        "Complete customization freedom",
        "No external dependencies or vendor risk",
        "One-time development cost amortizes over time",
      ],
      weaknesses: [
        "6-12 month development timeline",
        "Requires security expertise we may lack",
        "Ongoing maintenance burden on engineering",
      ],
      nextArgumentNeeded: true,
      suggestedNextTypes: ["antithesis"],
    },

    // ANTITHESIS: Buy solution
    {
      argumentId: "arg-002",
      argumentType: "antithesis",
      claim: "We should buy a proven auth solution (Auth0, Okta) for faster time-to-market and enterprise security",
      premises: [
        "Battle-tested security by dedicated specialists with 24/7 monitoring",
        "Immediate deployment in days vs months of development",
        "Compliance certifications already in place (SOC2, HIPAA, GDPR)",
        "Professional support team and automatic security updates",
      ],
      conclusion: "Buying delivers faster time-to-market with enterprise-grade security we cannot match internally.",
      confidence: 0.78,
      respondsTo: "arg-001",
      contradicts: ["arg-001"],
      strengths: [
        "Production-ready in days not months",
        "Proven at massive scale (millions of users)",
        "Compliance certifications included",
      ],
      weaknesses: [
        "$50K-150K annual cost at enterprise scale",
        "Limited customization options",
        "Vendor dependency and lock-in risk",
      ],
      nextArgumentNeeded: true,
      suggestedNextTypes: ["synthesis", "objection"],
    },

    // OBJECTION to antithesis: Vendor risk concern
    {
      argumentId: "arg-003",
      argumentType: "objection",
      claim: "The vendor dependency creates unacceptable strategic risk for our authentication infrastructure",
      premises: [
        "Auth0 was acquired by Okta, causing pricing and policy changes for existing customers",
        "Vendor outages directly impact our user authentication with no control",
        "API changes force reactive engineering work on vendor timelines",
        "Data residency and privacy concerns with third-party data processing",
      ],
      conclusion: "External dependencies for authentication create strategic vulnerabilities that outweigh convenience benefits.",
      confidence: 0.65,
      respondsTo: "arg-002",
      contradicts: ["arg-002"],
      supports: ["arg-001"],
      strengths: [
        "Based on real acquisition scenarios and vendor outages",
        "Addresses often-overlooked strategic concerns",
        "Highlights data sovereignty issues",
      ],
      weaknesses: [
        "May overweight rare catastrophic events",
        "Ignores vendor SLA guarantees and redundancy",
      ],
      nextArgumentNeeded: true,
      suggestedNextTypes: ["rebuttal"],
    },

    // REBUTTAL to objection: Defending vendor approach
    {
      argumentId: "arg-004",
      argumentType: "rebuttal",
      claim: "Modern abstraction patterns and multi-vendor strategies effectively mitigate vendor risk concerns",
      premises: [
        "Facade patterns and anti-corruption layers isolate vendor dependencies",
        "Multi-cloud and multi-vendor strategies provide redundancy options",
        "Contract testing ensures API compatibility across vendor updates",
        "Enterprise agreements include SLAs, data residency, and migration support",
      ],
      conclusion: "Vendor risk is a solvable engineering challenge, not a fundamental barrier to the buy approach.",
      confidence: 0.70,
      respondsTo: "arg-003",
      contradicts: ["arg-003"],
      supports: ["arg-002"],
      strengths: [
        "Addresses technical concerns with proven patterns",
        "Backed by industry best practices",
        "Offers practical mitigation strategies",
      ],
      weaknesses: [
        "Requires engineering maturity to implement well",
        "Adds architectural complexity upfront",
      ],
      nextArgumentNeeded: true,
      suggestedNextTypes: ["synthesis"],
    },

    // SYNTHESIS: Hybrid approach
    {
      argumentId: "arg-005",
      argumentType: "synthesis",
      claim: "A hybrid approach—buying core auth while building an abstraction layer—maximizes benefits and minimizes risks",
      premises: [
        "Use Auth0/Okta for core identity, MFA, and compliance-heavy features",
        "Build thin wrapper with custom business logic for our unique workflows",
        "Maintain abstraction layer enabling vendor switch if needed",
        "Focus internal engineering resources on product differentiation, not infrastructure",
      ],
      conclusion: "The hybrid approach captures enterprise security and speed-to-market while preserving strategic flexibility.",
      confidence: 0.85,
      respondsTo: "arg-004",
      supports: ["arg-001", "arg-002"],
      strengths: [
        "Best of both worlds: security + flexibility",
        "Fast initial launch with customization path",
        "Manageable vendor dependency with exit strategy",
      ],
      weaknesses: [
        "Slightly more upfront architectural complexity",
        "Some vendor cost still present",
      ],
      nextArgumentNeeded: false,
      suggestedNextTypes: [],
    },
  ],
  finalVerdict: "Adopt hybrid approach: Start with Auth0 for core auth (2-week launch), build abstraction layer in month 2, add custom flows as needed. Revisit full build-vs-buy at 10K MAU threshold when we have more data on our specific needs.",
};

// Argument type styling configuration
export const argumentTypeStyles: Record<ArgumentType, {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  beamColor: string;
}> = {
  thesis: {
    icon: "ThumbsUp",
    label: "Thesis",
    color: "hsl(200 70% 55%)",
    bgColor: "hsl(200 70% 55% / 0.1)",
    borderColor: "hsl(200 70% 55% / 0.3)",
    beamColor: "#3b82f6", // blue
  },
  antithesis: {
    icon: "ThumbsDown",
    label: "Antithesis",
    color: "hsl(var(--brand-accent))",
    bgColor: "hsl(var(--brand-accent) / 0.1)",
    borderColor: "hsl(var(--brand-accent) / 0.3)",
    beamColor: "#f43f5e", // rose
  },
  synthesis: {
    icon: "GitMerge",
    label: "Synthesis",
    color: "hsl(var(--brand-primary))",
    bgColor: "hsl(var(--brand-primary) / 0.1)",
    borderColor: "hsl(var(--brand-primary) / 0.3)",
    beamColor: "#a855f7", // purple
  },
  objection: {
    icon: "AlertTriangle",
    label: "Objection",
    color: "hsl(38 92% 50%)",
    bgColor: "hsl(38 92% 50% / 0.1)",
    borderColor: "hsl(38 92% 50% / 0.3)",
    beamColor: "#f59e0b", // amber
  },
  rebuttal: {
    icon: "Shield",
    label: "Rebuttal",
    color: "hsl(142 71% 45%)",
    bgColor: "hsl(142 71% 45% / 0.1)",
    borderColor: "hsl(142 71% 45% / 0.3)",
    beamColor: "#10b981", // emerald
  },
};

// Helper to get relationship color
export function getRelationshipColor(type: "supports" | "contradicts"): string {
  return type === "supports" ? "#10b981" : "#f43f5e"; // emerald vs rose
}

// Helper to find argument by ID
export function findArgumentById(id: string): Argument | undefined {
  return debateData.arguments.find(arg => arg.argumentId === id);
}
