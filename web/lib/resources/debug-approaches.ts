/**
 * Debugging Approaches Resource Catalog
 *
 * Exposes the 6 debugging approaches available in think-mcp
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
