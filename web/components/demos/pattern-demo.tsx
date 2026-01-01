"use client";

import { motion } from "framer-motion";
import {
  Blocks,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  FileCode,
  ListChecks,
  Info,
  ArrowRight,
  AlertTriangle,
  Code2
} from "lucide-react";
import { useState } from "react";

// Interface matching actual MCP JSON response
interface PatternResponse {
  patternName: string;
  status: "success" | "failed";
  hasImplementation: boolean;
  hasCodeExample: boolean;
  error?: string;
}

// Interface for input that was sent to the tool
interface PatternInput {
  patternName: string;
  context: string;
  implementation?: string[];
  benefits?: string[];
  tradeoffs?: string[];
  codeExample?: string;
  languages?: string[];
}

// Demo: Full synthetic data for complete capability showcase
const patternInput: PatternInput = {
  patternName: "modular_architecture",
  context: "Choosing between microservices patterns for our scaling needs",
  implementation: [
    "Define service boundaries based on domain contexts",
    "Create API contracts between services",
    "Implement service discovery mechanism",
    "Set up inter-service communication (REST/gRPC)",
    "Deploy independent CI/CD pipelines per service"
  ],
  benefits: [
    "Independent scaling of services",
    "Technology flexibility per service",
    "Fault isolation prevents cascade failures",
    "Faster deployments with smaller codebases"
  ],
  tradeoffs: [
    "Increased operational complexity",
    "Network latency between services",
    "Data consistency challenges",
    "Requires mature DevOps practices"
  ],
  codeExample: `// Service Registry Pattern
const serviceRegistry = new ServiceRegistry();

// Register microservice
serviceRegistry.register({
  name: 'user-service',
  host: 'localhost',
  port: 3001,
  healthCheck: '/health'
});

// Discover and call service
const userService = await serviceRegistry.discover('user-service');
const users = await userService.get('/users');`,
  languages: ["TypeScript", "Node.js", "Docker", "Kubernetes"]
};

// Demo: Actual MCP response structure (with full input, booleans are true)
const patternResponse: PatternResponse = {
  patternName: "modular_architecture",
  status: "success",
  hasImplementation: true,
  hasCodeExample: true,
};

// Pattern name display mapping
const patternDisplayNames: Record<string, string> = {
  modular_architecture: "Modular Architecture",
  api_integration: "API Integration",
  state_management: "State Management",
  async_processing: "Async Processing",
  scalability: "Scalability",
  security: "Security",
  agentic_design: "Agentic Design",
};

export function PatternDemo() {
  const [inputExpanded, setInputExpanded] = useState(true);

  const displayName = patternDisplayNames[patternResponse.patternName] || patternResponse.patternName;

  return (
    <div className="space-y-4">
      {/* Header: Pattern Name + Status */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Blocks className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-purple-400">
              {displayName}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {patternResponse.patternName}
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 ${
            patternResponse.status === "success"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {patternResponse.status === "success" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {patternResponse.status}
          </div>
        </div>
      </motion.div>

      {/* Response Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Has Implementation */}
        <div className={`p-3 rounded-lg border ${
          patternResponse.hasImplementation
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-slate-700/50 bg-slate-800/30"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <ListChecks className={`w-3.5 h-3.5 ${
              patternResponse.hasImplementation ? "text-emerald-400" : "text-slate-500"
            }`} />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Implementation
            </span>
          </div>
          <div className="flex items-center gap-2">
            {patternResponse.hasImplementation ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Provided</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Not provided</span>
              </>
            )}
          </div>
        </div>

        {/* Has Code Example */}
        <div className={`p-3 rounded-lg border ${
          patternResponse.hasCodeExample
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-slate-700/50 bg-slate-800/30"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <FileCode className={`w-3.5 h-3.5 ${
              patternResponse.hasCodeExample ? "text-emerald-400" : "text-slate-500"
            }`} />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Code Example
            </span>
          </div>
          <div className="flex items-center gap-2">
            {patternResponse.hasCodeExample ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Provided</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Not provided</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Input Echo Section (Collapsible) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
        className="rounded-xl border border-slate-700/50 overflow-hidden"
      >
        <button
          onClick={() => setInputExpanded(!inputExpanded)}
          className="w-full px-4 py-3 bg-slate-800/50 flex items-center gap-2 hover:bg-slate-800/70 transition-colors"
        >
          {inputExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Input Sent to Tool</span>
          <span className="ml-auto text-[10px] text-slate-500">
            {patternInput.implementation?.length || 0} steps • {patternInput.benefits?.length || 0} benefits • {patternInput.tradeoffs?.length || 0} tradeoffs
          </span>
        </button>

        {inputExpanded && (
          <div className="p-4 space-y-4 bg-slate-900/30">
            {/* Context */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                Context
              </div>
              <div className="text-sm text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg">
                {patternInput.context}
              </div>
            </div>

            {/* Implementation Steps */}
            {patternInput.implementation && patternInput.implementation.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  <ArrowRight className="w-3 h-3" />
                  Implementation Steps ({patternInput.implementation.length})
                </div>
                <div className="space-y-2">
                  {patternInput.implementation.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/30"
                    >
                      <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 text-xs font-medium flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-300">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits & Tradeoffs Grid */}
            {((patternInput.benefits && patternInput.benefits.length > 0) ||
              (patternInput.tradeoffs && patternInput.tradeoffs.length > 0)) && (
              <div className="grid grid-cols-2 gap-3">
                {/* Benefits */}
                {patternInput.benefits && patternInput.benefits.length > 0 && (
                  <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Benefits ({patternInput.benefits.length})</span>
                    </div>
                    <ul className="space-y-1.5">
                      {patternInput.benefits.map((b, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">+</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tradeoffs */}
                {patternInput.tradeoffs && patternInput.tradeoffs.length > 0 && (
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Tradeoffs ({patternInput.tradeoffs.length})</span>
                    </div>
                    <ul className="space-y-1.5">
                      {patternInput.tradeoffs.map((t, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">~</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Code Example */}
            {patternInput.codeExample && (
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500">Code Example</span>
                </div>
                <pre className="p-3 text-xs text-slate-300 bg-slate-900/50 overflow-x-auto">
                  <code>{patternInput.codeExample}</code>
                </pre>
              </div>
            )}

            {/* Languages */}
            {patternInput.languages && patternInput.languages.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                  Languages & Technologies
                </div>
                <div className="flex flex-wrap gap-2">
                  {patternInput.languages.map((lang) => (
                    <span
                      key={lang}
                      className="text-[10px] px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Blocks className="w-3.5 h-3.5" />
        <span>Design Pattern Analysis</span>
      </div>
    </div>
  );
}

export default PatternDemo;
