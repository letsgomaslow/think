// Tool name constants - single source of truth
export const TOOL_NAMES = {
  TRACE: 'trace',           // was: sequentialthinking
  MODEL: 'model',           // was: mentalmodel
  PATTERN: 'pattern',       // was: designpattern
  PARADIGM: 'paradigm',     // was: programmingparadigm
  DEBUG: 'debug',           // was: debuggingapproach
  COUNCIL: 'council',       // was: collaborativereasoning
  DECIDE: 'decide',         // was: decisionframework
  REFLECT: 'reflect',       // was: metacognitivemonitoring
  HYPOTHESIS: 'hypothesis', // was: scientificmethod
  DEBATE: 'debate',         // was: structuredargumentation
  MAP: 'map',               // was: visualreasoning
} as const;

export type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];
