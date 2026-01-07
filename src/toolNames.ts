// Tool name constants - single source of truth
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
  FEEDBACK: 'feedback',
} as const;

export type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];
