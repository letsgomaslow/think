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
  'eisenhower-matrix',
  'cost-benefit',
  'risk-assessment',
  'reversibility',
  'regret-minimization',
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

/**
 * Schema for Eisenhower Matrix classification
 */
const eisenhowerClassificationSchema = z.object({
  optionId: z.string()
    .min(1, 'Option ID cannot be empty')
    .describe('ID of the option being classified'),
  urgency: z.number()
    .min(1, 'Urgency must be at least 1')
    .max(5, 'Urgency must be at most 5')
    .describe('Urgency rating from 1 (low) to 5 (high)'),
  importance: z.number()
    .min(1, 'Importance must be at least 1')
    .max(5, 'Importance must be at most 5')
    .describe('Importance rating from 1 (low) to 5 (high)'),
});

/**
 * Schema for cost or benefit items
 */
const costBenefitItemSchema = z.object({
  optionId: z.string()
    .min(1, 'Option ID cannot be empty')
    .describe('ID of the option this cost/benefit belongs to'),
  description: z.string()
    .min(1, 'Description cannot be empty')
    .describe('Description of the cost or benefit'),
  amount: z.number()
    .describe('Monetary value or quantified amount'),
  type: z.enum(['monetary', 'non-monetary'])
    .describe('Type of cost or benefit'),
  category: z.string()
    .optional()
    .describe('Optional category for grouping'),
  timeframe: z.string()
    .optional()
    .describe('Optional time period'),
});

/**
 * Schema for cost-benefit analysis
 */
const costBenefitAnalysisSchema = z.object({
  optionId: z.string()
    .min(1, 'Option ID cannot be empty')
    .describe('ID of the option being analyzed'),
  costs: z.array(costBenefitItemSchema)
    .describe('Array of cost items'),
  benefits: z.array(costBenefitItemSchema)
    .describe('Array of benefit items'),
  netValue: z.number()
    .describe('Net value (benefits - costs)'),
  benefitCostRatio: z.number()
    .optional()
    .describe('Ratio of benefits to costs'),
  roi: z.number()
    .optional()
    .describe('Return on investment as a percentage'),
  discountRate: z.number()
    .optional()
    .describe('Discount rate for NPV calculation'),
  timePeriodYears: z.number()
    .optional()
    .describe('Time period in years for analysis'),
  npv: z.number()
    .optional()
    .describe('Net present value'),
});

/**
 * Schema for risk assessment items
 */
const riskAssessmentSchema = z.object({
  optionId: z.string()
    .min(1, 'Option ID cannot be empty')
    .describe('ID of the option being assessed'),
  description: z.string()
    .min(1, 'Description cannot be empty')
    .describe('Description of the risk'),
  probability: z.number()
    .min(0, 'Probability must be at least 0')
    .max(1, 'Probability must be at most 1')
    .describe('Probability of the risk occurring (0.0 to 1.0)'),
  impact: z.number()
    .min(1, 'Impact must be at least 1')
    .max(10, 'Impact must be at most 10')
    .describe('Impact severity if risk occurs (1 to 10 scale)'),
  riskScore: z.number()
    .describe('Risk score calculated as probability × impact'),
  category: z.string()
    .optional()
    .describe('Optional category for grouping risks'),
  mitigation: z.array(z.string())
    .optional()
    .describe('Optional array of mitigation strategies'),
});

/**
 * Schema for reversibility analysis
 */
const reversibilityAnalysisSchema = z.object({
  optionId: z.string()
    .min(1, 'Option ID cannot be empty')
    .describe('ID of the option being analyzed'),
  reversibilityScore: z.number()
    .min(0, 'Reversibility score must be at least 0')
    .max(1, 'Reversibility score must be at most 1')
    .describe('Reversibility score from 0.0 (irreversible) to 1.0 (easily reversible)'),
  undoCost: z.number()
    .describe('Estimated cost to reverse the decision (in monetary units)'),
  timeToReverse: z.number()
    .describe('Estimated time to reverse the decision (in days)'),
  doorType: z.enum(['one-way', 'two-way'])
    .describe('Type of door: one-way for irreversible/hard-to-reverse decisions, two-way for easily reversible decisions'),
  undoComplexity: z.string()
    .optional()
    .describe('Optional description of the complexity involved in reversing the decision'),
  reversibilityNotes: z.string()
    .optional()
    .describe('Optional notes about reversibility considerations'),
});

/**
 * Schema for time horizon regrets (10/10/10 framework)
 */
const timeHorizonRegretSchema = z.object({
  tenMinutes: z.string()
    .min(1, 'Ten minutes perspective cannot be empty')
    .describe('How will you feel about this decision in 10 minutes?'),
  tenMonths: z.string()
    .min(1, 'Ten months perspective cannot be empty')
    .describe('How will you feel about this decision in 10 months?'),
  tenYears: z.string()
    .min(1, 'Ten years perspective cannot be empty')
    .describe('How will you feel about this decision in 10 years?'),
});

/**
 * Schema for regret minimization analysis
 */
const regretMinimizationAnalysisSchema = z.object({
  optionId: z.string()
    .min(1, 'Option ID cannot be empty')
    .describe('ID of the option being analyzed'),
  futureSelfPerspective: z.string()
    .min(1, 'Future self perspective cannot be empty')
    .describe('Analysis from the perspective of your future self looking back at this decision'),
  potentialRegrets: timeHorizonRegretSchema
    .describe('Potential regrets at different time horizons (10 minutes, 10 months, 10 years)'),
  regretScore: z.number()
    .min(0, 'Regret score must be at least 0')
    .max(10, 'Regret score must be at most 10')
    .optional()
    .describe('Optional overall regret score from 0 (no regret) to 10 (maximum regret)'),
  timeHorizonAnalysis: z.string()
    .optional()
    .describe('Optional analysis of how the decision looks across different time horizons'),
});

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
  eisenhowerClassification: z.array(eisenhowerClassificationSchema)
    .optional()
    .describe('Urgency and importance ratings for Eisenhower Matrix analysis'),
  costBenefitAnalysis: z.array(costBenefitAnalysisSchema)
    .optional()
    .describe('Cost-benefit analysis data with quantified costs, benefits, and financial metrics'),
  riskAssessment: z.array(riskAssessmentSchema)
    .optional()
    .describe('Risk assessment data with probability, impact, and mitigation strategies for each risk'),
  reversibilityAnalysis: z.array(reversibilityAnalysisSchema)
    .optional()
    .describe('Reversibility analysis for Bezos\'s Two-Way Door Framework - evaluates how easily a decision can be reversed'),
  regretMinimizationAnalysis: z.array(regretMinimizationAnalysisSchema)
    .optional()
    .describe('Regret minimization analysis using the 10/10/10 Framework - evaluates decisions from future self perspective across multiple time horizons'),
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
  eisenhowerClassification?: Array<{
    optionId: string;
    urgency: number;
    importance: number;
  }>;
  costBenefitAnalysis?: Array<{
    optionId: string;
    costs: Array<{
      optionId: string;
      description: string;
      amount: number;
      type: 'monetary' | 'non-monetary';
      category?: string;
      timeframe?: string;
    }>;
    benefits: Array<{
      optionId: string;
      description: string;
      amount: number;
      type: 'monetary' | 'non-monetary';
      category?: string;
      timeframe?: string;
    }>;
    netValue: number;
    benefitCostRatio?: number;
    roi?: number;
    discountRate?: number;
    timePeriodYears?: number;
    npv?: number;
  }>;
  riskAssessment?: Array<{
    optionId: string;
    description: string;
    probability: number;
    impact: number;
    riskScore: number;
    category?: string;
    mitigation?: string[];
  }>;
  reversibilityAnalysis?: Array<{
    optionId: string;
    reversibilityScore: number;
    undoCost: number;
    timeToReverse: number;
    doorType: 'one-way' | 'two-way';
    undoComplexity?: string;
    reversibilityNotes?: string;
  }>;
  regretMinimizationAnalysis?: Array<{
    optionId: string;
    futureSelfPerspective: string;
    potentialRegrets: {
      tenMinutes: string;
      tenMonths: string;
      tenYears: string;
    };
    regretScore?: number;
    timeHorizonAnalysis?: string;
  }>;
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
    eisenhowerClassification = [],
    costBenefitAnalysis = [],
    riskAssessment = [],
    reversibilityAnalysis = [],
    regretMinimizationAnalysis = [],
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
    eisenhowerClassificationCount: eisenhowerClassification.length,
    costBenefitAnalysisCount: costBenefitAnalysis.length,
    riskAssessmentCount: riskAssessment.length,
    reversibilityAnalysisCount: reversibilityAnalysis.length,
    regretMinimizationAnalysisCount: regretMinimizationAnalysis.length,
    status: 'success',
  };
}
