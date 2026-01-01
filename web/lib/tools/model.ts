import { z } from 'zod';

/**
 * Valid mental model types for structured problem-solving
 */
export const modelNameEnum = z.enum([
  'first_principles',
  'opportunity_cost',
  'error_propagation',
  'rubber_duck',
  'pareto_principle',
  'occams_razor',
]);

export const modelSchema = {
  modelName: modelNameEnum
    .describe('The mental model to apply: first_principles (break down to fundamentals), opportunity_cost (evaluate alternatives), error_propagation (trace error sources), rubber_duck (explain to find issues), pareto_principle (80/20 analysis), occams_razor (simplest explanation)'),
  problem: z.string()
    .min(1, 'Problem description cannot be empty')
    .describe('Clear description of the problem to analyze using the mental model'),
  steps: z.array(
    z.string().min(1, 'Step cannot be empty')
  )
    .optional()
    .describe('Ordered list of reasoning steps taken to apply the model'),
  reasoning: z.string()
    .min(1, 'Reasoning cannot be empty')
    .optional()
    .describe('Detailed explanation of how the mental model was applied'),
  conclusion: z.string()
    .min(1, 'Conclusion cannot be empty')
    .optional()
    .describe('Final insight or solution derived from applying the model'),
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
