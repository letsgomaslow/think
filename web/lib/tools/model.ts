import { z } from 'zod';

export const modelSchema = {
  modelName: z.enum([
    'first_principles',
    'opportunity_cost',
    'error_propagation',
    'rubber_duck',
    'pareto_principle',
    'occams_razor',
  ]),
  problem: z.string(),
  steps: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
  conclusion: z.string().optional(),
};

interface ModelInput {
  modelName: string;
  problem: string;
  steps?: string[];
  reasoning?: string;
  conclusion?: string;
}

export async function handleModel(args: ModelInput) {
  const { modelName, problem, steps = [], reasoning = '', conclusion = '' } = args;

  return {
    modelName,
    problem,
    steps,
    reasoning,
    conclusion,
    status: 'success',
    hasSteps: steps.length > 0,
    hasConclusion: !!conclusion,
  };
}
