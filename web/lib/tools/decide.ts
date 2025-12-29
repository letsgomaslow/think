import { z } from 'zod';

const optionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
});

const criteriaSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  weight: z.number().min(0).max(1),
});

const outcomeSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  probability: z.number().min(0).max(1),
  value: z.number(),
  optionId: z.string(),
  confidenceInEstimate: z.number().min(0).max(1),
});

export const decideSchema = {
  decisionStatement: z.string(),
  options: z.array(optionSchema),
  criteria: z.array(criteriaSchema).optional(),
  analysisType: z.enum([
    'pros-cons',
    'weighted-criteria',
    'decision-tree',
    'expected-value',
    'scenario-analysis',
  ]),
  stage: z.enum([
    'problem-definition',
    'options-generation',
    'criteria-definition',
    'evaluation',
    'sensitivity-analysis',
    'decision',
  ]),
  stakeholders: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  timeHorizon: z.string().optional(),
  riskTolerance: z.enum(['risk-averse', 'risk-neutral', 'risk-seeking']).optional(),
  possibleOutcomes: z.array(outcomeSchema).optional(),
  recommendation: z.string().optional(),
  rationale: z.string().optional(),
  decisionId: z.string(),
  iteration: z.number().min(0),
  nextStageNeeded: z.boolean(),
};

interface DecideInput {
  decisionStatement: string;
  options: Array<{ id?: string; name: string; description: string }>;
  criteria?: Array<{ id?: string; name: string; description: string; weight: number }>;
  analysisType: string;
  stage: string;
  stakeholders?: string[];
  constraints?: string[];
  timeHorizon?: string;
  riskTolerance?: string;
  possibleOutcomes?: Array<{
    id?: string;
    description: string;
    probability: number;
    value: number;
    optionId: string;
    confidenceInEstimate: number;
  }>;
  recommendation?: string;
  rationale?: string;
  decisionId: string;
  iteration: number;
  nextStageNeeded: boolean;
}

export async function handleDecide(args: DecideInput) {
  const {
    decisionStatement,
    options,
    criteria = [],
    analysisType,
    stage,
    stakeholders = [],
    constraints = [],
    timeHorizon = '',
    riskTolerance = '',
    possibleOutcomes = [],
    recommendation = '',
    rationale = '',
    decisionId,
    iteration,
    nextStageNeeded,
  } = args;

  return {
    decisionStatement,
    analysisType,
    stage,
    decisionId,
    iteration,
    nextStageNeeded,
    optionCount: options.length,
    criteriaCount: criteria.length,
    stakeholderCount: stakeholders.length,
    constraintCount: constraints.length,
    outcomeCount: possibleOutcomes.length,
    hasTimeHorizon: !!timeHorizon,
    hasRiskTolerance: !!riskTolerance,
    hasRecommendation: !!recommendation,
    hasRationale: !!rationale,
    status: 'success',
  };
}
