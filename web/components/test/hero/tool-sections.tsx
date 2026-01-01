"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Lightbulb,
  Eye,
  Layers,
  Code,
  Bug,
  Scale,
  Users,
  FlaskConical,
  MessageSquare,
  Map,
  ChevronRight,
  Sparkles
} from "lucide-react";

// Brand colors from design system
const BRAND = {
  teal: "#6DC4AD",
  tealLight: "#7dd4bd",
  pink: "#EE7BB3",
  purple: "#401877",
  surfaceDark: "#121D35", // Dark mode background
  surfaceDarkCard: "#1A2847",
};

interface Tool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  icon: React.ReactNode;
  color: string;
}

interface ToolCategory {
  title: string;
  subtitle: string;
  tools: Tool[];
}

const categories: ToolCategory[] = [
  {
    title: "Reasoning & Analysis",
    subtitle: "Structured thinking and problem breakdown",
    tools: [
      {
        id: "trace",
        name: "Trace",
        tagline: "Chain of Thought",
        description: "Dynamic reasoning that can revise, branch, and evolve. Perfect for exploring complex problems step-by-step.",
        bestFor: "Step-by-step problem analysis",
        icon: <Brain className="w-6 h-6" />,
        color: BRAND.teal
      },
      {
        id: "model",
        name: "Model",
        tagline: "Mental Models",
        description: "Apply proven frameworks like First Principles, Pareto, Occam's Razor, and more to structure your analysis.",
        bestFor: "Applying proven frameworks",
        icon: <Lightbulb className="w-6 h-6" />,
        color: BRAND.tealLight
      },
      {
        id: "reflect",
        name: "Reflect",
        tagline: "Metacognitive Monitoring",
        description: "Assess your own confidence levels and knowledge boundaries. Know what you know—and what you don't.",
        bestFor: "Calibrating confidence",
        icon: <Eye className="w-6 h-6" />,
        color: BRAND.pink
      }
    ]
  },
  {
    title: "Software Development",
    subtitle: "Architecture, debugging, and code design",
    tools: [
      {
        id: "pattern",
        name: "Pattern",
        tagline: "Design Patterns",
        description: "Apply software design patterns for architecture decisions, API integration, state management, and scalability.",
        bestFor: "Architecture decisions",
        icon: <Layers className="w-6 h-6" />,
        color: BRAND.teal
      },
      {
        id: "paradigm",
        name: "Paradigm",
        tagline: "Programming Paradigms",
        description: "Choose between functional, OOP, reactive, declarative—find the right coding approach for your problem.",
        bestFor: "Choosing coding approaches",
        icon: <Code className="w-6 h-6" />,
        color: BRAND.tealLight
      },
      {
        id: "debug",
        name: "Debug",
        tagline: "Systematic Debugging",
        description: "Binary search, divide and conquer, cause elimination—structured methodologies to find bugs efficiently.",
        bestFor: "Finding bugs systematically",
        icon: <Bug className="w-6 h-6" />,
        color: BRAND.pink
      }
    ]
  },
  {
    title: "Decision Making",
    subtitle: "Evaluate options and reach conclusions",
    tools: [
      {
        id: "decide",
        name: "Decide",
        tagline: "Decision Frameworks",
        description: "Weighted criteria, decision trees, expected value analysis—structured approaches to complex choices.",
        bestFor: "Complex decisions",
        icon: <Scale className="w-6 h-6" />,
        color: BRAND.teal
      },
      {
        id: "council",
        name: "Council",
        tagline: "Multi-Expert Collaboration",
        description: "Simulate diverse expert perspectives. Get insights from UX designers, architects, security experts—all in one tool.",
        bestFor: "Gathering diverse perspectives",
        icon: <Users className="w-6 h-6" />,
        color: BRAND.pink
      }
    ]
  },
  {
    title: "Scientific Method",
    subtitle: "Hypothesis-driven investigation",
    tools: [
      {
        id: "hypothesis",
        name: "Hypothesis",
        tagline: "Scientific Reasoning",
        description: "Formulate hypotheses, design experiments, analyze results—apply the scientific method to any problem.",
        bestFor: "Testing assumptions",
        icon: <FlaskConical className="w-6 h-6" />,
        color: BRAND.teal
      },
      {
        id: "debate",
        name: "Debate",
        tagline: "Dialectical Reasoning",
        description: "Thesis, antithesis, synthesis. Stress-test ideas through formal argumentation and find the truth.",
        bestFor: "Evaluating competing options",
        icon: <MessageSquare className="w-6 h-6" />,
        color: BRAND.tealLight
      }
    ]
  },
  {
    title: "Visualization",
    subtitle: "Visual thinking and diagram creation",
    tools: [
      {
        id: "map",
        name: "Map",
        tagline: "Visual Thinking",
        description: "Create flowcharts, concept maps, state diagrams, and system architecture visuals to clarify complex relationships.",
        bestFor: "Visualizing relationships",
        icon: <Map className="w-6 h-6" />,
        color: BRAND.teal
      }
    ]
  }
];

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const accentColor = BRAND.teal;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group relative"
    >
      <div
        className="relative p-6 rounded-xl transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundColor: `${BRAND.surfaceDarkCard}cc`,
          borderWidth: 1,
          borderColor: `${accentColor}1a`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${accentColor}66`;
          e.currentTarget.style.boxShadow = `0 10px 25px ${accentColor}0d`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${accentColor}1a`;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to bottom right, ${accentColor}0d, transparent)` }}
        />

        <div className="relative">
          {/* Icon and Name */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="p-3 rounded-lg transition-colors duration-300"
              style={{ backgroundColor: `${tool.color}15` }}
            >
              <div style={{ color: tool.color }}>{tool.icon}</div>
            </div>
            <div>
              <h3
                className="text-xl font-bold transition-colors group-hover:brightness-110"
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  color: "#ffffff",
                }}
              >
                {tool.name}
              </h3>
              <p
                className="text-sm"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: accentColor,
                }}
              >
                {tool.tagline}
              </p>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-4"
            style={{
              fontFamily: "'Graphik', system-ui, sans-serif",
              color: "#a0aec0",
            }}
          >
            {tool.description}
          </p>

          {/* Best For */}
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "#718096" }}
          >
            <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
            <span>Best for: {tool.bestFor}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CategorySection({ category, index }: { category: ToolCategory; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const accentColor = BRAND.teal;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="py-16 last:border-b-0"
      style={{ borderBottomWidth: 1, borderBottomColor: `${accentColor}1a` }}
    >
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: accentColor }} />
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              color: "#ffffff",
            }}
          >
            {category.title}
          </h2>
        </div>
        <p
          className="ml-4 pl-3"
          style={{
            fontFamily: "'Graphik', system-ui, sans-serif",
            color: "#a0aec0",
          }}
        >
          {category.subtitle}
        </p>
      </motion.div>

      {/* Tools Grid */}
      <div className={`grid gap-6 ${
        category.tools.length === 1
          ? "md:grid-cols-1 max-w-md"
          : category.tools.length === 2
          ? "md:grid-cols-2"
          : "md:grid-cols-3"
      }`}>
        {category.tools.map((tool, toolIndex) => (
          <ToolCard key={tool.id} tool={tool} index={toolIndex} />
        ))}
      </div>
    </motion.section>
  );
}

export function ToolSections() {
  const containerRef = useRef(null);
  const accentColor = BRAND.teal;

  return (
    <div
      ref={containerRef}
      className="py-16"
      style={{ backgroundColor: BRAND.surfaceDark }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{
              backgroundColor: `${accentColor}1a`,
              borderWidth: 1,
              borderColor: `${accentColor}4d`,
              color: accentColor,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
            11 Reasoning Tools
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              color: "#ffffff",
            }}
          >
            Every Tool You Need to{" "}
            <span style={{ color: accentColor }}>Think Clearly</span>
          </h2>
          <p
            className="max-w-2xl mx-auto"
            style={{
              fontFamily: "'Graphik', system-ui, sans-serif",
              color: "#a0aec0",
            }}
          >
            From first principles analysis to multi-expert councils, each tool provides
            a structured approach to a different aspect of reasoning.
          </p>
        </motion.div>

        {/* Tool Categories */}
        {categories.map((category, index) => (
          <CategorySection key={category.title} category={category} index={index} />
        ))}

        {/* Tool Chain CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-flex flex-col items-center p-8 rounded-2xl"
            style={{
              background: `linear-gradient(to bottom, ${accentColor}1a, transparent)`,
              borderWidth: 1,
              borderColor: `${accentColor}33`,
            }}
          >
            <h3
              className="text-xl font-bold mb-2"
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                color: "#ffffff",
              }}
            >
              Chain Tools Together
            </h3>
            <p
              className="text-sm mb-4 max-w-md"
              style={{
                fontFamily: "'Graphik', system-ui, sans-serif",
                color: "#a0aec0",
              }}
            >
              Combine tools for powerful workflows: Trace → Model → Decide
            </p>
            <div className="flex items-center gap-2 font-mono text-sm" style={{ color: accentColor }}>
              <span className="px-3 py-1 rounded" style={{ backgroundColor: `${accentColor}1a` }}>Council</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-3 py-1 rounded" style={{ backgroundColor: `${accentColor}1a` }}>Debate</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-3 py-1 rounded" style={{ backgroundColor: `${accentColor}1a` }}>Decide</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-3 py-1 rounded" style={{ backgroundColor: `${accentColor}1a` }}>Reflect</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ToolSections;
