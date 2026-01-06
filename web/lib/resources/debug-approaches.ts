/**
 * Debugging Approaches Resource Catalog
 *
 * Exposes the 11 debugging approaches available in think-mcp
 * as a browsable MCP resource.
 */

import { ResourceCatalog, ResourceCatalogItem, ReadResourceResult } from './types';

/**
 * Debugging approach definitions
 */
const DEBUGGING_APPROACHES: ResourceCatalogItem[] = [
  {
    name: 'binary_search',
    title: 'Binary Search Debugging',
    description: 'Narrow down the problem by systematically halving the search space.',
    useCases: [
      'Finding regression points in commits',
      'Isolating faulty components',
      'Performance bottleneck identification',
      'Configuration troubleshooting',
    ],
    steps: [
      'Define the boundaries of the problem space',
      'Test the midpoint to determine which half contains the issue',
      'Repeat on the problematic half',
      'Continue until the root cause is isolated',
    ],
  },
  {
    name: 'reverse_engineering',
    title: 'Reverse Engineering',
    description: 'Work backwards from observed behavior to understand underlying causes.',
    useCases: [
      'Understanding undocumented systems',
      'Debugging third-party integrations',
      'Analyzing unexpected behavior',
      'Security vulnerability analysis',
    ],
    steps: [
      'Document the observed behavior',
      'Form hypotheses about internal mechanisms',
      'Test hypotheses through controlled experiments',
      'Build a mental model of the system',
    ],
  },
  {
    name: 'divide_conquer',
    title: 'Divide and Conquer',
    description: 'Break complex problems into smaller, manageable sub-problems.',
    useCases: [
      'Debugging complex systems',
      'Multi-component failures',
      'Distributed system issues',
      'Integration problems',
    ],
    steps: [
      'Decompose the system into logical components',
      'Test each component in isolation',
      'Identify which components are functioning correctly',
      'Focus debugging on problematic components',
    ],
  },
  {
    name: 'backtracking',
    title: 'Backtracking',
    description: 'Trace execution paths backwards from the error to find the source.',
    useCases: [
      'Stack trace analysis',
      'Data corruption tracking',
      'State machine debugging',
      'Event chain analysis',
    ],
    steps: [
      'Start at the point of failure',
      'Trace the execution path backwards',
      'Identify decision points and state changes',
      'Find where behavior diverged from expected',
    ],
  },
  {
    name: 'cause_elimination',
    title: 'Cause Elimination',
    description: 'Systematically eliminate potential causes until the root cause remains.',
    useCases: [
      'Intermittent bugs',
      'Environment-specific issues',
      'Multi-factor problems',
      'Timing-related bugs',
    ],
    steps: [
      'List all potential causes',
      'Design tests to eliminate each cause',
      'Remove eliminated causes from consideration',
      'Continue until root cause is identified',
    ],
  },
  {
    name: 'program_slicing',
    title: 'Program Slicing',
    description: 'Extract the subset of code that affects a specific variable or output.',
    useCases: [
      'Understanding variable flow',
      'Identifying unexpected dependencies',
      'Code impact analysis',
      'Debugging data transformations',
    ],
    steps: [
      'Identify the variable or output of interest',
      'Trace all statements that affect it',
      'Create a minimal program slice',
      'Debug within the reduced scope',
    ],
  },
  {
    name: 'wolf_fence',
    title: 'Wolf Fence Algorithm',
    description: 'Use binary isolation to systematically narrow down the location of a bug.',
    useCases: [
      'Isolating intermittent bugs',
      'Finding bugs in large codebases',
      'Debugging when exact location is unknown',
      'Performance regression hunting',
    ],
    steps: [
      'Place checkpoints at strategic boundaries',
      'Test to determine which section contains the bug',
      'Subdivide the problematic section',
      'Repeat until the bug location is isolated',
    ],
  },
  {
    name: 'rubber_duck',
    title: 'Rubber Duck Debugging',
    description: 'Explain code and problem step-by-step to reveal overlooked assumptions.',
    useCases: [
      'Understanding complex logic',
      'Finding assumption errors',
      'Debugging as a novice',
      'Clarifying problem statements',
    ],
    steps: [
      'Explain what the code should do',
      'Walk through what it actually does',
      'Articulate assumptions and expectations',
      'Identify discrepancies revealed through explanation',
    ],
  },
  {
    name: 'delta_debugging',
    title: 'Delta Debugging',
    description: 'Systematically minimize test cases to find the minimal failing scenario.',
    useCases: [
      'Simplifying complex bug reports',
      'Identifying minimal reproduction steps',
      'Reducing test case complexity',
      'Isolating specific failure conditions',
    ],
    steps: [
      'Start with a failing test case',
      'Remove portions while keeping failure',
      'Binary search to find minimal set',
      'Verify the minimal case still reproduces the bug',
    ],
  },
  {
    name: 'fault_tree',
    title: 'Fault Tree Analysis',
    description: 'Map all possible failure paths to systematically analyze root causes.',
    useCases: [
      'Complex system failures',
      'Multi-factor bug analysis',
      'Risk assessment in debugging',
      'Understanding cascading failures',
    ],
    steps: [
      'Identify the top-level failure event',
      'Map all possible contributing causes',
      'Analyze logical relationships (AND/OR)',
      'Trace paths to find root causes',
    ],
  },
  {
    name: 'time_travel',
    title: 'Time Travel Debugging',
    description: 'Record execution state to step backward and forward through program history.',
    useCases: [
      'Understanding state transitions',
      'Debugging race conditions',
      'Analyzing event sequences',
      'Reproducing hard-to-catch bugs',
    ],
    steps: [
      'Record program execution with snapshots',
      'Navigate backward to before the bug',
      'Step forward observing state changes',
      'Identify the exact point where state corrupts',
    ],
  },
];

/**
 * Build the debugging approaches catalog
 */
export function getDebugApproachesCatalog(): ResourceCatalog {
  return {
    type: 'debugging-approaches',
    version: '2.0.0',
    count: DEBUGGING_APPROACHES.length,
    items: DEBUGGING_APPROACHES,
  };
}

/**
 * Handle resource read for debugging approaches
 */
export async function handleDebugApproachesRead(uri: URL): Promise<ReadResourceResult> {
  const catalog = getDebugApproachesCatalog();

  return {
    contents: [
      {
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(catalog, null, 2),
      },
    ],
  };
}
