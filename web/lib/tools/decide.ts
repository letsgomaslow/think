import { z } from 'zod';

/**
 * Schema for a decision option
 */
const optionSchema = z.object({
  id: z.string()
    .min(1, 'Option ID cannot be empty')
    .optional()
    .describe('Unique identifier for this option'),
  name: z.string()
    .min(1, 'Option name cannot be empty')
    .describe('Short name for the option'),
  description: z.string()
    .min(1, 'Option description cannot be empty')
    .describe('Detailed description of what this option entails'),
});

/**
 * Schema for evaluation criteria
 */
const criteriaSchema = z.object({
  id: z.string()
    .min(1, 'Criteria ID cannot be empty')
    .optional()
    .describe('Unique identifier for this criterion'),
  name: z.string()
    .min(1, 'Criteria name cannot be empty')
    .describe('Name of the evaluation criterion'),
  description: z.string()
    .min(1, 'Criteria description cannot be empty')
    .describe('What this criterion measures or evaluates'),
  weight: z.number()
    .min(0, 'Weight must be at least 0')
    .max(1, 'Weight must be at most 1')
    .describe('Importance weight of this criterion (0.0 to 1.0)'),
});

/**
 * Schema for a possible outcome
 */
const outcomeSchema = z.object({
  id: z.string()
    .min(1, 'Outcome ID cannot be empty')
    .optional()
    .describe('Unique identifier for this outcome'),
  description: z.string()
    .min(1, 'Outcome description cannot be empty')
    .describe('Description of this potential outcome'),
  probability: z.number()
    .min(0, 'Probability must be at least 0')
    .max(1, 'Probability must be at most 1')
    .describe('Estimated probability of this outcome (0.0 to 1.0)'),
  value: z.number()
    .describe('Expected value or utility of this outcome (can be negative)'),
  optionId: z.string()
    .min(1, 'Option ID cannot be empty')
    .describe('ID of the option this outcome belongs to'),
  confidenceInEstimate: z.number()
    .min(0, 'Confidence must be at least 0')
    .max(1, 'Confidence must be at most 1')
    .describe('Confidence in the probability and value estimates (0.0 to 1.0)'),
});

/**
 * Valid analysis types for decision frameworks
 */
export const analysisTypeEnum = z.enum([
  'pros-cons',
  'weighted-criteria',
  'decision-tree',
  'expected-value',
  'scenario-analysis',
]);

/**
 * Valid stages in the decision process
 */
export const decisionStageEnum = z.enum([
  'problem-definition',
  'options-generation',
  'criteria-definition',
  'evaluation',
  'sensitivity-analysis',
  'decision',
]);

/**
 * Valid risk tolerance levels
 */
export const riskToleranceEnum = z.enum([
  'risk-averse',
  'risk-neutral',
  'risk-seeking',
]);

export const decideSchema = {
  decisionStatement: z.string()
    .min(1, 'Decision statement cannot be empty')
    .describe('Clear statement of the decision to be made'),
  options: z.array(optionSchema)
    .min(2, 'At least two options are required for a decision')
    .describe('List of options being considered'),
  criteria: z.array(criteriaSchema)
    .optional()
    .describe('Criteria used to evaluate options (required for weighted-criteria analysis)'),
  analysisType: analysisTypeEnum
    .describe('Analysis framework: pros-cons (simple list), weighted-criteria (multi-attribute), decision-tree (sequential), expected-value (probabilistic), scenario-analysis (future states)'),
  stage: decisionStageEnum
    .describe('Current stage: problem-definition (framing), options-generation (alternatives), criteria-definition (evaluation factors), evaluation (scoring), sensitivity-analysis (robustness), decision (final choice)'),
  stakeholders: z.array(
    z.string().min(1, 'Stakeholder cannot be empty')
  )
    .optional()
    .describe('People or groups affected by this decision'),
  constraints: z.array(
    z.string().min(1, 'Constraint cannot be empty')
  )
    .optional()
    .describe('Limitations or requirements that must be satisfied'),
  timeHorizon: z.string()
    .min(1, 'Time horizon cannot be empty')
    .optional()
    .describe('Time frame for the decision and its consequences'),
  riskTolerance: riskToleranceEnum
    .optional()
    .describe('Decision makers risk preference: risk-averse (prefer certainty), risk-neutral (expected value), risk-seeking (prefer upside)'),
  possibleOutcomes: z.array(outcomeSchema)
    .optional()
    .describe('Potential outcomes for each option with probabilities'),
  recommendation: z.string()
    .min(1, 'Recommendation cannot be empty')
    .optional()
    .describe('The recommended option if a decision has been reached'),
  rationale: z.string()
    .min(1, 'Rationale cannot be empty')
    .optional()
    .describe('Explanation for why the recommendation was chosen'),
  decisionId: z.string()
    .min(1, 'Decision ID cannot be empty')
    .describe('Unique identifier for this decision analysis'),
  iteration: z.number()
    .int('Iteration must be an integer')
    .min(0, 'Iteration must be at least 0')
    .describe('Current iteration of the decision process'),
  nextStageNeeded: z.boolean()
    .describe('Whether another stage is needed in the analysis'),
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
