#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from "chalk";

// Import server classes
import { TraceServer } from "./tools/traceServer.js";
import { ModelServer } from "./tools/modelServer.js";
import { PatternServer } from "./tools/patternServer.js";
import { ParadigmServer } from "./tools/paradigmServer.js";
import { DebugServer } from "./tools/debugServer.js";
import { CouncilServer } from "./tools/councilServer.js";
import { DecideServer } from "./tools/decideServer.js";
import { ReflectServer } from "./tools/reflectServer.js";
import { HypothesisServer } from "./tools/hypothesisServer.js";
import { DebateServer } from "./tools/debateServer.js";
import { MapServer } from "./tools/mapServer.js";

import { TOOL_NAMES } from "./toolNames.js";

// Tool Definitions
const MODEL_TOOL: Tool = {
    name: TOOL_NAMES.MODEL,
    description: `A tool for applying structured mental models to problem-solving.
Supports various mental models including:
- First Principles Thinking
- Opportunity Cost Analysis
- Error Propagation Understanding
- Rubber Duck Debugging
- Pareto Principle
- Occam's Razor

Each model provides a systematic approach to breaking down and solving problems.`,
    inputSchema: {
        type: "object",
        properties: {
            modelName: {
                type: "string",
                enum: [
                    "first_principles",
                    "opportunity_cost",
                    "error_propagation",
                    "rubber_duck",
                    "pareto_principle",
                    "occams_razor",
                ],
            },
            problem: { type: "string" },
            steps: {
                type: "array",
                items: { type: "string" },
            },
            reasoning: { type: "string" },
            conclusion: { type: "string" },
        },
        required: ["modelName", "problem"],
    },
};

const PATTERN_TOOL: Tool = {
    name: TOOL_NAMES.PATTERN,
    description: `A tool for applying design patterns to software architecture and implementation.
Supports various design patterns including:
- Modular Architecture
- API Integration Patterns
- State Management
- Asynchronous Processing
- Scalability Considerations
- Security Best Practices
- Agentic Design Patterns

Each pattern provides a structured approach to solving common design challenges.`,
    inputSchema: {
        type: "object",
        properties: {
            patternName: {
                type: "string",
                enum: [
                    "modular_architecture",
                    "api_integration",
                    "state_management",
                    "async_processing",
                    "scalability",
                    "security",
                    "agentic_design",
                ],
            },
            context: { type: "string" },
            implementation: {
                type: "array",
                items: { type: "string" },
            },
            benefits: {
                type: "array",
                items: { type: "string" },
            },
            tradeoffs: {
                type: "array",
                items: { type: "string" },
            },
            codeExample: { type: "string" },
            languages: {
                type: "array",
                items: { type: "string" },
            },
        },
        required: ["patternName", "context"],
    },
};

const PARADIGM_TOOL: Tool = {
    name: TOOL_NAMES.PARADIGM,
    description: `A tool for applying different programming paradigms to solve problems.
Supports various programming paradigms including:
- Imperative Programming
- Procedural Programming
- Object-Oriented Programming
- Functional Programming
- Declarative Programming
- Logic Programming
- Event-Driven Programming
- Aspect-Oriented Programming
- Concurrent Programming
- Reactive Programming

Each paradigm provides a different approach to structuring and executing code.`,
    inputSchema: {
        type: "object",
        properties: {
            paradigmName: {
                type: "string",
                enum: [
                    "imperative",
                    "procedural",
                    "object_oriented",
                    "functional",
                    "declarative",
                    "logic",
                    "event_driven",
                    "aspect_oriented",
                    "concurrent",
                    "reactive",
                ],
            },
            problem: { type: "string" },
            approach: {
                type: "array",
                items: { type: "string" },
            },
            benefits: {
                type: "array",
                items: { type: "string" },
            },
            limitations: {
                type: "array",
                items: { type: "string" },
            },
            codeExample: { type: "string" },
            languages: {
                type: "array",
                items: { type: "string" },
            },
        },
        required: ["paradigmName", "problem"],
    },
};

const DEBUG_TOOL: Tool = {
    name: TOOL_NAMES.DEBUG,
    description: `A tool for applying systematic debugging approaches to solve technical issues.
Supports various debugging methods including:
- Binary Search
- Reverse Engineering
- Divide and Conquer
- Backtracking
- Cause Elimination
- Program Slicing
- Wolf Fence
- Rubber Duck
- Delta Debugging
- Fault Tree
- Time Travel

Each approach provides a structured method for identifying and resolving issues.`,
    inputSchema: {
        type: "object",
        properties: {
            approachName: {
                type: "string",
                enum: [
                    "binary_search",
                    "reverse_engineering",
                    "divide_conquer",
                    "backtracking",
                    "cause_elimination",
                    "program_slicing",
                    "wolf_fence",
                    "rubber_duck",
                    "delta_debugging",
                    "fault_tree",
                    "time_travel",
                ],
            },
            issue: { type: "string" },
            steps: {
                type: "array",
                items: { type: "string" },
            },
            findings: { type: "string" },
            resolution: { type: "string" },
        },
        required: ["approachName", "issue"],
    },
};

const TRACE_TOOL: Tool = {
    name: TOOL_NAMES.TRACE,
    description: `A detailed tool for dynamic and reflective problem-solving through thoughts.
This tool helps analyze problems through a flexible thinking process that can adapt and evolve.
Each thought can build on, question, or revise previous insights as understanding deepens.

When to use this tool:
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Problems that require a multi-step solution
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

You should:
1. Start with an initial estimate of needed thoughts, but be ready to adjust
2. Feel free to question or revise previous thoughts
3. Don't hesitate to add more thoughts if needed, even at the "end"
4. Express uncertainty when present
5. Mark thoughts that revise previous thinking or branch into new paths
6. Ignore information that is irrelevant to the current step
7. Generate a solution hypothesis when appropriate
8. Verify the hypothesis based on the Chain of Thought steps
9. Repeat the process until satisfied with the solution
10. Provide a single, ideally correct answer as the final output
11. Only set next_thought_needed to false when truly done and a satisfactory answer is reached`,
    inputSchema: {
        type: "object",
        properties: {
            thought: { type: "string" },
            thoughtNumber: { type: "number", minimum: 1 },
            totalThoughts: { type: "number", minimum: 1 },
            nextThoughtNeeded: { type: "boolean" },
            isRevision: { type: "boolean" },
            revisesThought: { type: "number", minimum: 1 },
            branchFromThought: { type: "number", minimum: 1 },
            branchId: { type: "string" },
            needsMoreThoughts: { type: "boolean" },
        },
        required: [
            "thought",
            "thoughtNumber",
            "totalThoughts",
            "nextThoughtNeeded",
        ],
    },
};

const COUNCIL_TOOL: Tool = {
    name: TOOL_NAMES.COUNCIL,
    description: `A detailed tool for simulating expert collaboration with diverse perspectives.
This tool helps models tackle complex problems by coordinating multiple viewpoints.
It provides a framework for structured collaborative reasoning and perspective integration.

The council tool supports both custom personas and predefined personas from the persona library.
You can use 'predefinedPersonas' to easily select expert personas by ID, or 'personaCategory' to get personas from a specific domain.`,
    inputSchema: {
        type: "object",
        properties: {
            topic: { type: "string" },
            personaCategory: {
                type: "string",
                enum: ["technical", "business", "creative", "general"],
                description: "Optional: Select personas from a specific category (technical, business, creative, general)",
            },
            predefinedPersonas: {
                type: "array",
                items: { type: "string" },
                description: "Optional: Array of predefined persona IDs to use (e.g., ['security-specialist', 'performance-engineer'])",
            },
            personas: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        expertise: { type: "array", items: { type: "string" } },
                        background: { type: "string" },
                        perspective: { type: "string" },
                        biases: { type: "array", items: { type: "string" } },
                        communication: {
                            type: "object",
                            properties: {
                                style: { type: "string" },
                                tone: { type: "string" },
                            },
                            required: ["style", "tone"],
                        },
                    },
                    required: [
                        "id",
                        "name",
                        "expertise",
                        "background",
                        "perspective",
                        "biases",
                        "communication",
                    ],
                },
            },
            contributions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        personaId: { type: "string" },
                        content: { type: "string" },
                        type: {
                            type: "string",
                            enum: [
                                "observation",
                                "question",
                                "insight",
                                "concern",
                                "suggestion",
                                "challenge",
                                "synthesis",
                            ],
                        },
                        confidence: { type: "number", minimum: 0, maximum: 1 },
                        referenceIds: {
                            type: "array",
                            items: { type: "string" },
                        },
                    },
                    required: ["personaId", "content", "type", "confidence"],
                },
            },
            stage: {
                type: "string",
                enum: [
                    "problem-definition",
                    "ideation",
                    "critique",
                    "integration",
                    "decision",
                    "reflection",
                ],
            },
            activePersonaId: { type: "string" },
            nextPersonaId: { type: "string" },
            consensusPoints: { type: "array", items: { type: "string" } },
            disagreements: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        topic: { type: "string" },
                        positions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    personaId: { type: "string" },
                                    position: { type: "string" },
                                    arguments: {
                                        type: "array",
                                        items: { type: "string" },
                                    },
                                },
                                required: [
                                    "personaId",
                                    "position",
                                    "arguments",
                                ],
                            },
                        },
                    },
                    required: ["topic", "positions"],
                },
            },
            keyInsights: { type: "array", items: { type: "string" } },
            openQuestions: { type: "array", items: { type: "string" } },
            finalRecommendation: { type: "string" },
            sessionId: {
                type: "string",
                description: "Unique identifier for this collaboration session",
            },
            iteration: {
                type: "number",
                minimum: 0,
                description: "Current iteration of the collaboration",
            },
            suggestedContributionTypes: {
                type: "array",
                items: {
                    type: "string",
                    enum: [
                        "observation",
                        "question",
                        "insight",
                        "concern",
                        "suggestion",
                        "challenge",
                        "synthesis",
                    ],
                },
            },
            nextContributionNeeded: {
                type: "boolean",
                description: "Whether another contribution is needed",
            },
        },
        required: [
            "topic",
            "personas",
            "contributions",
            "stage",
            "activePersonaId",
            "sessionId",
            "iteration",
            "nextContributionNeeded",
        ],
    },
};