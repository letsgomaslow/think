import { z } from 'zod';
import {
  nonEmptyStringSchema,
  idSchema,
  optionalStringArraySchema,
  variableTypeSchema,
  hypothesisStatusSchema,
  scientificInquiryStageSchema,
  confidenceScoreSchema,
  positiveNumberSchema
} from './common.js';

// ============================================================================
// Variable Schema (hypothesis tool)
// ============================================================================

/**
 * Zod schema for validating Variable
 * Matches the Variable interface from src/models/interfaces.ts
 */
export const variableSchema = z.object({
  // Required fields
  name: nonEmptyStringSchema.describe('Name of the variable'),
  type: variableTypeSchema.describe('Type of variable (independent, dependent, controlled, confounding)'),

  // Optional fields
  operationalization: z.string().optional().describe('Optional description of how the variable is operationalized')
});

export type Variable = z.infer<typeof variableSchema>;

// ============================================================================
// Prediction Schema (hypothesis tool)
// ============================================================================

/**
 * Zod schema for validating Prediction
 * Matches the Prediction interface from src/models/interfaces.ts
 */
export const predictionSchema = z.object({
  // Required fields
  if: nonEmptyStringSchema.describe('If condition for the prediction'),
  then: nonEmptyStringSchema.describe('Then consequence for the prediction'),

  // Optional fields
  else: z.string().optional().describe('Optional else consequence for alternative outcome')
});

export type Prediction = z.infer<typeof predictionSchema>;

// ============================================================================
// HypothesisData Schema (hypothesis tool)
// ============================================================================

/**
 * Zod schema for validating HypothesisData
 * Matches the HypothesisData interface from src/models/interfaces.ts
 */
export const hypothesisDataSchema = z.object({
  // Required fields
  statement: nonEmptyStringSchema.describe('The hypothesis statement'),
  variables: z.array(variableSchema).describe('Variables involved in the hypothesis'),
  assumptions: z.array(z.string()).describe('Underlying assumptions of the hypothesis'),
  hypothesisId: idSchema.describe('Unique identifier for this hypothesis'),
  confidence: confidenceScoreSchema.describe('Confidence in the hypothesis (0-1)'),
  domain: nonEmptyStringSchema.describe('Domain or field of the hypothesis'),
  iteration: positiveNumberSchema.int().describe('Current iteration number'),
  status: hypothesisStatusSchema.describe('Status of the hypothesis (proposed, testing, supported, refuted, refined)'),

  // Optional fields
  alternativeTo: optionalStringArraySchema.describe('Optional IDs of alternative hypotheses'),
  refinementOf: z.string().optional().describe('Optional ID of the hypothesis this refines')
});

export type HypothesisData = z.infer<typeof hypothesisDataSchema>;

// ============================================================================
// ExperimentData Schema (hypothesis tool)
// ============================================================================

/**
 * Zod schema for validating ExperimentData
 * Matches the ExperimentData interface from src/models/interfaces.ts
 */
export const experimentDataSchema = z.object({
  // Required fields
  design: nonEmptyStringSchema.describe('Experimental design description'),
  methodology: nonEmptyStringSchema.describe('Methodology to be followed'),
  predictions: z.array(predictionSchema).describe('Predictions about experiment outcomes'),
  experimentId: idSchema.describe('Unique identifier for this experiment'),
  hypothesisId: idSchema.describe('ID of the hypothesis being tested'),
  controlMeasures: z.array(z.string()).describe('Control measures in the experiment'),

  // Optional fields
  results: z.string().optional().describe('Optional experimental results'),
  outcomeMatched: z.boolean().optional().describe('Optional indicator if outcome matched prediction'),
  unexpectedObservations: optionalStringArraySchema.describe('Optional unexpected observations'),
  limitations: optionalStringArraySchema.describe('Optional limitations of the experiment'),
  nextSteps: optionalStringArraySchema.describe('Optional suggested next steps')
});

export type ExperimentData = z.infer<typeof experimentDataSchema>;

// ============================================================================
// ScientificInquiryData Schema (hypothesis tool)
// ============================================================================

/**
 * Zod schema for validating ScientificInquiryData
 * Matches the ScientificInquiryData interface from src/models/interfaces.ts
 */
export const scientificInquiryDataSchema = z.object({
  // Required fields
  stage: scientificInquiryStageSchema.describe('Current stage of scientific inquiry'),
  inquiryId: idSchema.describe('Unique identifier for this inquiry session'),
  iteration: positiveNumberSchema.int().describe('Current iteration number'),
  nextStageNeeded: z.boolean().describe('Whether another stage is needed'),

  // Optional fields
  observation: z.string().optional().describe('Optional observation for observation stage'),
  question: z.string().optional().describe('Optional research question for question stage'),
  hypothesis: hypothesisDataSchema.optional().describe('Optional hypothesis data for hypothesis stage'),
  experiment: experimentDataSchema.optional().describe('Optional experiment data for experiment stage'),
  analysis: z.string().optional().describe('Optional analysis for analysis stage'),
  conclusion: z.string().optional().describe('Optional conclusion for conclusion stage')
});

export type ScientificInquiryData = z.infer<typeof scientificInquiryDataSchema>;
