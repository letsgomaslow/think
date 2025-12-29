import { z } from 'zod';

export const debugSchema = {
  approachName: z.enum([
    'binary_search',
    'reverse_engineering',
    'divide_conquer',
    'backtracking',
    'cause_elimination',
    'program_slicing',
  ]),
  issue: z.string(),
  steps: z.array(z.string()).optional(),
  findings: z.string().optional(),
  resolution: z.string().optional(),
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
