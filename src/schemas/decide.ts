import { z } from 'zod';
import {
  nonEmptyStringSchema,
  idSchema,
  optionalStringArraySchema,
  decisionFrameworkStageSchema,
  analysisTypeSchema,
  eisenhowerQuadrantSchema,
  costBenefitTypeSchema,
  doorTypeSchema,
  riskToleranceSchema,
  confidenceScoreSchema,
  weightSchema,
  probabilitySchema,
  scoreSchema,
  nonNegativeNumberSchema,
  positiveNumberSchema
} from './common.js';

// ============================================================================
// OptionData Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating OptionData
 * Matches the OptionData interface from src/models/interfaces.ts
 */
export const optionDataSchema = z.object({
  id: idSchema.describe('Unique identifier for the option'),
  name: nonEmptyStringSchema.describe('Name of the option'),
  description: nonEmptyStringSchema.describe('Description of the option')
});

export type OptionData = z.infer<typeof optionDataSchema>;

// ============================================================================
// CriterionData Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating CriterionData
 * Matches the CriterionData interface from src/models/interfaces.ts
 */
export const criterionDataSchema = z.object({
  id: idSchema.describe('Unique identifier for the criterion'),
  name: nonEmptyStringSchema.describe('Name of the criterion'),
  description: nonEmptyStringSchema.describe('Description of the criterion'),
  weight: weightSchema.describe('Weight of the criterion (0 or higher)')
});

export type CriterionData = z.infer<typeof criterionDataSchema>;

// ============================================================================
// OutcomeData Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating OutcomeData
 * Matches the OutcomeData interface from src/models/interfaces.ts
 */
export const outcomeDataSchema = z.object({
  id: idSchema.describe('Unique identifier for the outcome'),
  description: nonEmptyStringSchema.describe('Description of the outcome'),
  probability: probabilitySchema.describe('Probability of the outcome (0-1)'),
  value: z.number().describe('Value or utility of the outcome'),
  optionId: idSchema.describe('ID of the associated option'),
  confidenceInEstimate: confidenceScoreSchema.describe('Confidence in the estimate (0-1)')
});

export type OutcomeData = z.infer<typeof outcomeDataSchema>;

// ============================================================================
// EisenhowerClassification Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating EisenhowerClassification
 * Matches the EisenhowerClassification interface from src/models/interfaces.ts
 */
export const eisenhowerClassificationSchema = z.object({
  optionId: idSchema.describe('ID of the option being classified'),
  urgency: scoreSchema.describe('Urgency score (0-10)'),
  importance: scoreSchema.describe('Importance score (0-10)'),
  quadrant: eisenhowerQuadrantSchema.describe('Eisenhower quadrant classification')
});

export type EisenhowerClassification = z.infer<typeof eisenhowerClassificationSchema>;

// ============================================================================
// CostBenefitItem Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating CostBenefitItem
 * Matches the CostBenefitItem interface from src/models/interfaces.ts
 */
export const costBenefitItemSchema = z.object({
  optionId: idSchema.describe('ID of the option'),
  description: nonEmptyStringSchema.describe('Description of the cost or benefit'),
  amount: z.number().describe('Amount of the cost or benefit'),
  type: costBenefitTypeSchema.describe('Type of cost/benefit (monetary or non-monetary)'),
  category: z.string().optional().describe('Optional category'),
  timeframe: z.string().optional().describe('Optional timeframe')
});

export type CostBenefitItem = z.infer<typeof costBenefitItemSchema>;

// ============================================================================
// CostBenefitAnalysis Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating CostBenefitAnalysis
 * Matches the CostBenefitAnalysis interface from src/models/interfaces.ts
 */
export const costBenefitAnalysisSchema = z.object({
  // Required fields
  optionId: idSchema.describe('ID of the option being analyzed'),
  costs: z.array(costBenefitItemSchema).describe('Array of costs'),
  benefits: z.array(costBenefitItemSchema).describe('Array of benefits'),
  netValue: z.number().describe('Net value (benefits - costs)'),

  // Optional fields
  benefitCostRatio: z.number().optional().describe('Benefit-cost ratio'),
  roi: z.number().optional().describe('Return on investment'),
  discountRate: z.number().optional().describe('Discount rate for NPV calculation'),
  timePeriodYears: z.number().optional().describe('Time period in years'),
  npv: z.number().optional().describe('Net present value')
});

export type CostBenefitAnalysis = z.infer<typeof costBenefitAnalysisSchema>;

// ============================================================================
// RiskItem Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating RiskItem
 * Matches the RiskItem interface from src/models/interfaces.ts
 */
export const riskItemSchema = z.object({
  // Required fields
  optionId: idSchema.describe('ID of the option'),
  description: nonEmptyStringSchema.describe('Description of the risk'),
  probability: probabilitySchema.describe('Probability of the risk (0-1)'),
  impact: scoreSchema.describe('Impact score (0-10)'),
  riskScore: nonNegativeNumberSchema.describe('Overall risk score'),

  // Optional fields
  category: z.string().optional().describe('Optional risk category'),
  mitigation: optionalStringArraySchema.describe('Optional mitigation strategies')
});

export type RiskItem = z.infer<typeof riskItemSchema>;

// ============================================================================
// ReversibilityData Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating ReversibilityData
 * Matches the ReversibilityData interface from src/models/interfaces.ts
 */
export const reversibilityDataSchema = z.object({
  // Required fields
  optionId: idSchema.describe('ID of the option'),
  reversibilityScore: scoreSchema.describe('Reversibility score (0-10)'),
  undoCost: nonNegativeNumberSchema.describe('Cost to undo the decision'),
  timeToReverse: nonNegativeNumberSchema.describe('Time required to reverse'),
  doorType: doorTypeSchema.describe('Type of door (one-way or two-way)'),

  // Optional fields
  undoComplexity: z.string().optional().describe('Optional description of undo complexity'),
  reversibilityNotes: z.string().optional().describe('Optional notes about reversibility')
});

export type ReversibilityData = z.infer<typeof reversibilityDataSchema>;

// ============================================================================
// TimeHorizonRegret Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating TimeHorizonRegret
 * Matches the TimeHorizonRegret interface from src/models/interfaces.ts
 */
export const timeHorizonRegretSchema = z.object({
  tenMinutes: z.string().describe('Regret perspective in 10 minutes'),
  tenMonths: z.string().describe('Regret perspective in 10 months'),
  tenYears: z.string().describe('Regret perspective in 10 years')
});

export type TimeHorizonRegret = z.infer<typeof timeHorizonRegretSchema>;

// ============================================================================
// RegretMinimizationData Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating RegretMinimizationData
 * Matches the RegretMinimizationData interface from src/models/interfaces.ts
 */
export const regretMinimizationDataSchema = z.object({
  // Required fields
  optionId: idSchema.describe('ID of the option'),
  futureSelfPerspective: nonEmptyStringSchema.describe('Perspective from future self'),
  potentialRegrets: timeHorizonRegretSchema.describe('Regrets across time horizons'),

  // Optional fields
  regretScore: scoreSchema.optional().describe('Optional overall regret score (0-10)'),
  timeHorizonAnalysis: z.string().optional().describe('Optional analysis of time horizons')
});

export type RegretMinimizationData = z.infer<typeof regretMinimizationDataSchema>;

// ============================================================================
// DecisionFrameworkData Schema (decide tool)
// ============================================================================

/**
 * Zod schema for validating DecisionFrameworkData
 * Matches the DecisionFrameworkData interface from src/models/interfaces.ts
 */
export const decisionFrameworkDataSchema = z.object({
  // Required fields
  decisionStatement: nonEmptyStringSchema.describe('Statement of the decision to be made'),
  options: z.array(optionDataSchema).describe('Available options'),
  analysisType: analysisTypeSchema.describe('Type of analysis being performed'),
  stage: decisionFrameworkStageSchema.describe('Current stage of the decision process'),
  decisionId: idSchema.describe('Unique identifier for this decision'),
  iteration: positiveNumberSchema.int().describe('Current iteration number'),
  nextStageNeeded: z.boolean().describe('Whether another stage is needed'),

  // Optional fields
  criteria: z.array(criterionDataSchema).optional().describe('Decision criteria'),
  stakeholders: optionalStringArraySchema.describe('Stakeholders involved in the decision'),
  constraints: optionalStringArraySchema.describe('Constraints on the decision'),
  timeHorizon: z.string().optional().describe('Time horizon for the decision'),
  riskTolerance: riskToleranceSchema.optional().describe('Risk tolerance level'),
  possibleOutcomes: z.array(outcomeDataSchema).optional().describe('Possible outcomes'),
  recommendation: z.string().optional().describe('Final recommendation'),
  rationale: z.string().optional().describe('Rationale for the recommendation'),
  eisenhowerClassification: z.array(eisenhowerClassificationSchema).optional().describe('Eisenhower matrix classifications'),
  costBenefitAnalysis: z.array(costBenefitAnalysisSchema).optional().describe('Cost-benefit analyses'),
  riskAssessment: z.array(riskItemSchema).optional().describe('Risk assessments'),
  reversibilityAnalysis: z.array(reversibilityDataSchema).optional().describe('Reversibility analyses'),
  regretMinimizationAnalysis: z.array(regretMinimizationDataSchema).optional().describe('Regret minimization analyses')
});

export type DecisionFrameworkData = z.infer<typeof decisionFrameworkDataSchema>;
