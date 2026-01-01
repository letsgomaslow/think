import {
  GitBranch,
  Users,
  Scale,
  Bug,
  Brain,
  Map,
  Lightbulb,
  MessageSquare,
  Compass,
  Code,
  FlaskConical,
  LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bestFor: string;
  // Enhanced fields for dedicated tool pages
  persona: string;
  demoScenario: string;
  whenToUse: string[];
  worksWellWith: string[];
}

export interface ToolCategory {
  id: string;
  title: string;
  subtitle: string;
  tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: "think-through",
    title: "Think It Through",
    subtitle: "Step-by-step reasoning and visualization",
    tools: [
      {
        id: "trace",
        name: "Trace",
        tagline: "Chain of Thought",
        description:
          "Dynamic reasoning that can revise, branch, and evolve. Perfect for exploring complex problems step-by-step.",
        icon: GitBranch,
        color: "hsl(var(--brand-primary))",
        bestFor: "Breaking down complex problems",
        persona: "Researcher",
        demoScenario: "Understanding quantum computing implications for cryptography",
        whenToUse: [
          "Breaking down complex multi-step problems",
          "Exploring ideas that might need revision",
          "Building understanding through progressive reasoning",
          "When you need to show your work",
          "Problems where the path forward isn't clear",
        ],
        worksWellWith: ["hypothesis", "map", "reflect"],
      },
      {
        id: "map",
        name: "Map",
        tagline: "Visual Thinking",
        description:
          "Create flowcharts, concept maps, and diagrams to visualize relationships and systems.",
        icon: Map,
        color: "hsl(159 43% 70%)",
        bestFor: "Visualizing relationships",
        persona: "Systems Thinker",
        demoScenario: "Mapping our customer journey touchpoints",
        whenToUse: [
          "Visualizing complex system relationships",
          "Understanding data flow and dependencies",
          "Creating process documentation",
          "Identifying bottlenecks and gaps",
          "Communicating architecture to stakeholders",
        ],
        worksWellWith: ["trace", "council", "pattern"],
      },
    ],
  },
  {
    id: "perspectives",
    title: "Get Perspectives",
    subtitle: "Multiple viewpoints and challenges",
    tools: [
      {
        id: "council",
        name: "Council",
        tagline: "Expert Collaboration",
        description:
          "Simulate a panel of experts with diverse backgrounds, biases, and perspectives debating your problem.",
        icon: Users,
        color: "hsl(var(--brand-accent))",
        bestFor: "Gathering diverse viewpoints",
        persona: "Business Strategist",
        demoScenario: "Should we enter the European market this quarter?",
        whenToUse: [
          "Decisions requiring multiple stakeholder perspectives",
          "Risk assessment and mitigation planning",
          "Strategic planning with competing priorities",
          "When you need devil's advocate viewpoints",
          "Complex decisions with no clear right answer",
        ],
        worksWellWith: ["debate", "decide", "reflect"],
      },
      {
        id: "debate",
        name: "Debate",
        tagline: "Dialectical Reasoning",
        description:
          "Thesis, antithesis, synthesis. Stress-test ideas through formal argumentation.",
        icon: MessageSquare,
        color: "hsl(45 93% 60%)",
        bestFor: "Challenging assumptions",
        persona: "Consultant",
        demoScenario: "Build vs Buy: Should we develop in-house or purchase a solution?",
        whenToUse: [
          "Testing the strength of your position",
          "Exploring opposing viewpoints systematically",
          "Preparing for stakeholder objections",
          "Finding weaknesses in proposals",
          "Reaching synthesis from conflicting ideas",
        ],
        worksWellWith: ["council", "decide", "hypothesis"],
      },
    ],
  },
  {
    id: "decide",
    title: "Make Decisions",
    subtitle: "Structured evaluation and confidence",
    tools: [
      {
        id: "decide",
        name: "Decide",
        tagline: "Decision Frameworks",
        description:
          "Weighted criteria, decision trees, expected value analysis for complex choices.",
        icon: Scale,
        color: "hsl(280 60% 70%)",
        bestFor: "Complex decisions",
        persona: "Executive / PM",
        demoScenario: "Which vendor should we choose for our cloud infrastructure?",
        whenToUse: [
          "Evaluating multiple options with different tradeoffs",
          "Making high-stakes decisions with clear criteria",
          "When stakeholders need transparent decision rationale",
          "Resource allocation and prioritization",
          "Vendor selection and procurement decisions",
        ],
        worksWellWith: ["council", "reflect", "debate"],
      },
      {
        id: "reflect",
        name: "Reflect",
        tagline: "Metacognitive Monitoring",
        description:
          "Track confidence levels and knowledge boundaries. Know what you know—and don't.",
        icon: Brain,
        color: "hsl(200 70% 60%)",
        bestFor: "Calibrating confidence",
        persona: "Self-Improvement Seeker",
        demoScenario: "Am I ready for this leadership role? What are my blind spots?",
        whenToUse: [
          "Calibrating confidence in your conclusions",
          "Identifying knowledge gaps before decisions",
          "Self-assessment and personal development",
          "Evaluating reasoning quality",
          "Understanding what you don't know",
        ],
        worksWellWith: ["decide", "council", "hypothesis"],
      },
    ],
  },
  {
    id: "debug",
    title: "Fix Problems",
    subtitle: "Systematic investigation and testing",
    tools: [
      {
        id: "debug",
        name: "Debug",
        tagline: "Systematic Debugging",
        description:
          "Binary search, divide and conquer, cause elimination—structured methodologies to find bugs.",
        icon: Bug,
        color: "hsl(0 70% 60%)",
        bestFor: "Finding bugs systematically",
        persona: "Problem Solver",
        demoScenario: "Why is user engagement dropping after the latest release?",
        whenToUse: [
          "Investigating production issues methodically",
          "Finding root causes of complex bugs",
          "When trial-and-error isn't working",
          "Performance bottleneck identification",
          "Regression debugging after updates",
        ],
        worksWellWith: ["trace", "hypothesis", "map"],
      },
      {
        id: "hypothesis",
        name: "Hypothesis",
        tagline: "Scientific Reasoning",
        description:
          "Formulate hypotheses, design experiments, analyze results. Apply the scientific method.",
        icon: FlaskConical,
        color: "hsl(120 50% 55%)",
        bestFor: "Testing assumptions",
        persona: "Scientist",
        demoScenario: "Do users actually prefer the new checkout flow? Let's test it.",
        whenToUse: [
          "Validating assumptions before building",
          "A/B testing strategy and analysis",
          "User behavior research",
          "Proving or disproving theories",
          "Data-driven decision making",
        ],
        worksWellWith: ["trace", "reflect", "debug"],
      },
    ],
  },
  {
    id: "approach",
    title: "Choose Approaches",
    subtitle: "Frameworks, patterns, and paradigms",
    tools: [
      {
        id: "model",
        name: "Model",
        tagline: "Mental Models",
        description:
          "Apply proven frameworks: First Principles, Pareto, Occam's Razor, and more.",
        icon: Lightbulb,
        color: "hsl(35 90% 55%)",
        bestFor: "Applying proven frameworks",
        persona: "Analyst",
        demoScenario: "Applying Pareto principle to prioritize our product roadmap",
        whenToUse: [
          "Breaking down problems to fundamentals",
          "Finding the 20% that delivers 80% of value",
          "Simplifying complex situations",
          "Strategic analysis and planning",
          "Avoiding overthinking with Occam's Razor",
        ],
        worksWellWith: ["decide", "council", "trace"],
      },
      {
        id: "pattern",
        name: "Pattern",
        tagline: "Design Patterns",
        description:
          "Software design patterns for architecture, API integration, state management.",
        icon: Code,
        color: "hsl(var(--brand-primary))",
        bestFor: "Architecture decisions",
        persona: "Architect",
        demoScenario: "Choosing between microservices patterns for our scaling needs",
        whenToUse: [
          "Designing system architecture",
          "API integration strategies",
          "State management decisions",
          "Scaling and performance patterns",
          "Security implementation approaches",
        ],
        worksWellWith: ["paradigm", "map", "decide"],
      },
      {
        id: "paradigm",
        name: "Paradigm",
        tagline: "Programming Paradigms",
        description:
          "Choose between functional, OOP, reactive, declarative—find the right approach.",
        icon: Compass,
        color: "hsl(var(--brand-accent))",
        bestFor: "Choosing coding approaches",
        persona: "Decision Maker",
        demoScenario: "Functional vs OOP: Which paradigm fits our data pipeline?",
        whenToUse: [
          "Choosing programming approaches for new projects",
          "Refactoring legacy code to modern patterns",
          "Evaluating technology stack decisions",
          "Team skill alignment discussions",
          "Performance vs maintainability tradeoffs",
        ],
        worksWellWith: ["pattern", "decide", "debate"],
      },
    ],
  },
];

// Flat list of all tools for easy access
export const allTools = toolCategories.flatMap((cat) => cat.tools);

// Get tool by id
export function getToolById(id: string): Tool | undefined {
  return allTools.find((t) => t.id === id);
}
