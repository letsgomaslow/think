import { z } from 'zod';
import {
  nonEmptyStringSchema,
  idSchema,
  optionalStringArraySchema,
  knowledgeLevelSchema,
  claimStatusSchema,
  metacognitiveMonitoringStageSchema,
  assessmentTypeSchema,
  confidenceScoreSchema,
  scoreSchema,
  nonNegativeNumberSchema
} from './common.js';

// ============================================================================
// KnowledgeAssessment Schema (reflect tool)
// ============================================================================

/**
 * Zod schema for validating KnowledgeAssessment
 * Matches the KnowledgeAssessment interface from src/models/interfaces.ts
 */
export const knowledgeAssessmentSchema = z.object({
  // Required fields
  domain: nonEmptyStringSchema.describe('Domain of knowledge being assessed'),
  knowledgeLevel: knowledgeLevelSchema.describe('Level of knowledge (expert, proficient, familiar, basic, minimal, none)'),
  confidenceScore: confidenceScoreSchema.describe('Confidence in the assessment (0-1)'),
  supportingEvidence: nonEmptyStringSchema.describe('Evidence supporting the knowledge assessment'),
  knownLimitations: z.array(z.string()).describe('Known limitations in this domain'),

  // Optional fields
  relevantTrainingCutoff: z.string().optional().describe('Optional relevant training cutoff date')
});

export type KnowledgeAssessment = z.infer<typeof knowledgeAssessmentSchema>;

// ============================================================================
// ClaimAssessment Schema (reflect tool)
// ============================================================================

/**
 * Zod schema for validating ClaimAssessment
 * Matches the ClaimAssessment interface from src/models/interfaces.ts
 */
export const claimAssessmentSchema = z.object({
  // Required fields
  claim: nonEmptyStringSchema.describe('The claim being assessed'),
  status: claimStatusSchema.describe('Status of the claim (fact, inference, speculation, uncertain)'),
  confidenceScore: confidenceScoreSchema.describe('Confidence in the claim (0-1)'),
  evidenceBasis: nonEmptyStringSchema.describe('Basis of evidence for the claim'),

  // Optional fields
  falsifiabilityCriteria: z.string().optional().describe('Optional criteria for falsifiability'),
  alternativeInterpretations: optionalStringArraySchema.describe('Optional alternative interpretations')
});

export type ClaimAssessment = z.infer<typeof claimAssessmentSchema>;

// ============================================================================
// ReasoningAssessment Schema (reflect tool)
// ============================================================================

/**
 * Zod schema for validating ReasoningAssessment
 * Matches the ReasoningAssessment interface from src/models/interfaces.ts
 */
export const reasoningAssessmentSchema = z.object({
  // Required fields
  step: nonEmptyStringSchema.describe('The reasoning step being assessed'),
  potentialBiases: z.array(z.string()).describe('Potential biases in this step'),
  assumptions: z.array(z.string()).describe('Assumptions made in this step'),
  logicalValidity: scoreSchema.describe('Logical validity score (0-10)'),
  inferenceStrength: scoreSchema.describe('Inference strength score (0-10)')
});

export type ReasoningAssessment = z.infer<typeof reasoningAssessmentSchema>;

// ============================================================================
// MetacognitiveMonitoringData Schema (reflect tool)
// ============================================================================

/**
 * Zod schema for validating MetacognitiveMonitoringData
 * Matches the MetacognitiveMonitoringData interface from src/models/interfaces.ts
 */
export const metacognitiveMonitoringDataSchema = z.object({
  // Required fields
  task: nonEmptyStringSchema.describe('The task being monitored'),
  stage: metacognitiveMonitoringStageSchema.describe('Current stage of metacognitive monitoring'),
  overallConfidence: confidenceScoreSchema.describe('Overall confidence score (0-1)'),
  uncertaintyAreas: z.array(z.string()).describe('Areas of uncertainty'),
  recommendedApproach: nonEmptyStringSchema.describe('Recommended approach for the task'),
  monitoringId: idSchema.describe('Unique identifier for this monitoring session'),
  iteration: nonNegativeNumberSchema.int().describe('Current iteration number'),
  nextAssessmentNeeded: z.boolean().describe('Whether another assessment is needed'),

  // Optional fields
  knowledgeAssessment: knowledgeAssessmentSchema.optional().describe('Optional knowledge assessment'),
  claims: z.array(claimAssessmentSchema).optional().describe('Optional array of claim assessments'),
  reasoningSteps: z.array(reasoningAssessmentSchema).optional().describe('Optional array of reasoning assessments'),
  suggestedAssessments: z.array(assessmentTypeSchema).optional().describe('Optional suggested assessment types')
});

export type MetacognitiveMonitoringData = z.infer<typeof metacognitiveMonitoringDataSchema>;
