import { z } from 'zod';

/**
 * Valid debugging approaches for systematic issue resolution
 */
export const approachNameEnum = z.enum([
  'binary_search',
  'reverse_engineering',
  'divide_conquer',
  'backtracking',
  'cause_elimination',
  'program_slicing',
]);

export const debugSchema = {
  approachName: approachNameEnum
    .describe('The debugging approach to use: binary_search (bisect to find cause), reverse_engineering (work backwards from symptom), divide_conquer (isolate subsystems), backtracking (trace execution path), cause_elimination (systematically rule out causes), program_slicing (focus on relevant code subset)'),
  issue: z.string()
    .min(1, 'Issue description cannot be empty')
    .describe('Clear description of the bug or issue to debug'),
  steps: z.array(
    z.string().min(1, 'Step cannot be empty')
  )
    .optional()
    .describe('Ordered list of debugging steps taken or planned'),
  findings: z.string()
    .min(1, 'Findings cannot be empty')
    .optional()
    .describe('Observations and discoveries made during debugging'),
  resolution: z.string()
    .min(1, 'Resolution cannot be empty')
    .optional()
    .describe('The fix or solution that resolved the issue'),
};

interface DebugInput {
  approachName: string;
  issue: string;
  steps?: string[];
  findings?: string;
  resolution?: string;
}

export async function handleDebug(args: DebugInput) {
  const {
    approachName,
    issue,
    steps = [],
    findings = '',
    resolution = '',
  } = args;

  return {
    approachName,
    issue,
    steps,
    findings,
    resolution,
    status: 'success',
    hasSteps: steps.length > 0,
    hasFindings: !!findings,
    hasResolution: !!resolution,
  };
}
