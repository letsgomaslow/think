import { z } from 'zod';

// Tool name constants
export const TOOL_NAMES = {
  TRACE: 'trace',
  MODEL: 'model',
  PATTERN: 'pattern',
  PARADIGM: 'paradigm',
  DEBUG: 'debug',
  COUNCIL: 'council',
  DECIDE: 'decide',
  REFLECT: 'reflect',
  HYPOTHESIS: 'hypothesis',
  DEBATE: 'debate',
  MAP: 'map',
} as const;

// Import tool handlers
import { traceSchema, handleTrace } from './tools/trace';
import { modelSchema, handleModel } from './tools/model';
import { patternSchema, handlePattern } from './tools/pattern';
import { paradigmSchema, handleParadigm } from './tools/paradigm';
import { debugSchema, handleDebug } from './tools/debug';
import { councilSchema, handleCouncil } from './tools/council';
import { decideSchema, handleDecide } from './tools/decide';
import { reflectSchema, handleReflect } from './tools/reflect';
import { hypothesisSchema, handleHypothesis } from './tools/hypothesis';
import { debateSchema, handleDebate } from './tools/debate';
import { mapSchema, handleMap } from './tools/map';

// Tool descriptions
const TOOL_DESCRIPTIONS = {
  [TOOL_NAMES.TRACE]: `A detailed tool for dynamic and reflective problem-solving through thoughts.
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

  [TOOL_NAMES.MODEL]: `A tool for applying structured mental models to problem-solving.
Supports various mental models including:
- First Principles Thinking
- Opportunity Cost Analysis
- Error Propagation Understanding
- Rubber Duck Debugging
- Pareto Principle
- Occam's Razor

Each model provides a systematic approach to breaking down and solving problems.`,

  [TOOL_NAMES.PATTERN]: `A tool for applying design patterns to software architecture and implementation.
Supports various design patterns including:
- Modular Architecture
- API Integration Patterns
- State Management
- Asynchronous Processing
- Scalability Considerations
- Security Best Practices
- Agentic Design Patterns

Each pattern provides a structured approach to solving common design challenges.`,

  [TOOL_NAMES.PARADIGM]: `A tool for applying different programming paradigms to solve problems.
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

  [TOOL_NAMES.DEBUG]: `A tool for applying systematic debugging approaches to solve technical issues.
Supports various debugging methods including:
- Binary Search
- Reverse Engineering
- Divide and Conquer
- Backtracking
- Cause Elimination
- Program Slicing

Each approach provides a structured method for identifying and resolving issues.`,

  [TOOL_NAMES.COUNCIL]: `A detailed tool for simulating expert collaboration with diverse perspectives.
This tool helps models tackle complex problems by coordinating multiple viewpoints.
It provides a framework for structured collaborative reasoning and perspective integration.`,

  [TOOL_NAMES.DECIDE]: `A detailed tool for structured decision analysis and rational choice.
This tool helps models systematically evaluate options, criteria, and outcomes.
It supports multiple decision frameworks, probability estimates, and value judgments.`,

  [TOOL_NAMES.REFLECT]: `A detailed tool for systematic self-monitoring of knowledge and reasoning quality.
This tool helps models track knowledge boundaries, claim certainty, and reasoning biases.
It provides a framework for metacognitive assessment across various domains and reasoning tasks.`,

  [TOOL_NAMES.HYPOTHESIS]: `A detailed tool for applying formal scientific reasoning to questions and problems.
This tool guides models through the scientific method with structured hypothesis testing.
It enforces explicit variable identification, prediction making, and evidence evaluation.`,

  [TOOL_NAMES.DEBATE]: `A detailed tool for systematic dialectical reasoning and argument analysis.
This tool helps analyze complex questions through formal argumentation structures.
It facilitates the creation, critique, and synthesis of competing arguments.`,

  [TOOL_NAMES.MAP]: `A tool for visual thinking, problem-solving, and communication.
This tool enables models to create, manipulate, and interpret diagrams, graphs, and other visual representations.
It supports various visual elements and operations to facilitate insight generation and hypothesis testing.`,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerAllTools(server: any) {
  // Register trace tool
  server.tool(
    TOOL_NAMES.TRACE,
    TOOL_DESCRIPTIONS[TOOL_NAMES.TRACE],
    traceSchema,
    handleTrace
  );

  // Register model tool
  server.tool(
    TOOL_NAMES.MODEL,
    TOOL_DESCRIPTIONS[TOOL_NAMES.MODEL],
    modelSchema,
    handleModel
  );

  // Register pattern tool
  server.tool(
    TOOL_NAMES.PATTERN,
    TOOL_DESCRIPTIONS[TOOL_NAMES.PATTERN],
    patternSchema,
    handlePattern
  );

  // Register paradigm tool
  server.tool(
    TOOL_NAMES.PARADIGM,
    TOOL_DESCRIPTIONS[TOOL_NAMES.PARADIGM],
    paradigmSchema,
    handleParadigm
  );

  // Register debug tool
  server.tool(
    TOOL_NAMES.DEBUG,
    TOOL_DESCRIPTIONS[TOOL_NAMES.DEBUG],
    debugSchema,
    handleDebug
  );

  // Register council tool
  server.tool(
    TOOL_NAMES.COUNCIL,
    TOOL_DESCRIPTIONS[TOOL_NAMES.COUNCIL],
    councilSchema,
    handleCouncil
  );

  // Register decide tool
  server.tool(
    TOOL_NAMES.DECIDE,
    TOOL_DESCRIPTIONS[TOOL_NAMES.DECIDE],
    decideSchema,
    handleDecide
  );

  // Register reflect tool
  server.tool(
    TOOL_NAMES.REFLECT,
    TOOL_DESCRIPTIONS[TOOL_NAMES.REFLECT],
    reflectSchema,
    handleReflect
  );

  // Register hypothesis tool
  server.tool(
    TOOL_NAMES.HYPOTHESIS,
    TOOL_DESCRIPTIONS[TOOL_NAMES.HYPOTHESIS],
    hypothesisSchema,
    handleHypothesis
  );

  // Register debate tool
  server.tool(
    TOOL_NAMES.DEBATE,
    TOOL_DESCRIPTIONS[TOOL_NAMES.DEBATE],
    debateSchema,
    handleDebate
  );

  // Register map tool
  server.tool(
    TOOL_NAMES.MAP,
    TOOL_DESCRIPTIONS[TOOL_NAMES.MAP],
    mapSchema,
    handleMap
  );
}
