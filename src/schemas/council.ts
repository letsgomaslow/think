import { z } from 'zod';
import {
  nonEmptyStringSchema,
  idSchema,
  optionalStringArraySchema,
  contributionTypeSchema,
  confidenceScoreSchema,
  collaborativeReasoningStageSchema,
  personaCategorySchema,
  nonNegativeNumberSchema
} from './common.js';

// ============================================================================
// PersonaData Schema (council tool)
// ============================================================================

/**
 * Zod schema for validating PersonaData
 * Matches the PersonaData interface from src/models/interfaces.ts
 */
export const personaDataSchema = z.object({
  // Required fields
  id: idSchema.describe('Unique identifier for the persona'),
  name: nonEmptyStringSchema.describe('Name of the persona'),
  expertise: z.array(z.string()).describe('Areas of expertise'),
  background: nonEmptyStringSchema.describe('Background information about the persona'),
  perspective: nonEmptyStringSchema.describe('Unique perspective this persona brings'),
  biases: z.array(z.string()).describe('Known biases or tendencies'),
  communication: z.object({
    style: z.string().describe('Communication style'),
    tone: z.string().describe('Communication tone')
  }).describe('Communication preferences'),

  // Optional fields (from persona library)
  category: personaCategorySchema.optional().describe('Optional category for predefined personas'),
  tags: optionalStringArraySchema.describe('Optional tags for discovery and search'),
  concerns: optionalStringArraySchema.describe('Optional typical concerns this persona raises'),
  typicalQuestions: optionalStringArraySchema.describe('Optional example questions this persona typically asks')
});

export type PersonaData = z.infer<typeof personaDataSchema>;

// ============================================================================
// ContributionData Schema (council tool)
// ============================================================================

/**
 * Zod schema for validating ContributionData
 * Matches the ContributionData interface from src/models/interfaces.ts
 */
export const contributionDataSchema = z.object({
  // Required fields
  personaId: idSchema.describe('ID of the persona making the contribution'),
  content: nonEmptyStringSchema.describe('Content of the contribution'),
  type: contributionTypeSchema.describe('Type of contribution'),
  confidence: confidenceScoreSchema.describe('Confidence level (0-1)'),

  // Optional fields
  referenceIds: optionalStringArraySchema.describe('Optional references to other contributions')
});

export type ContributionData = z.infer<typeof contributionDataSchema>;

// ============================================================================
// DisagreementData Schema (council tool)
// ============================================================================

/**
 * Zod schema for validating DisagreementData
 * Matches the DisagreementData interface from src/models/interfaces.ts
 */
export const disagreementDataSchema = z.object({
  topic: nonEmptyStringSchema.describe('Topic of disagreement'),
  positions: z.array(
    z.object({
      personaId: idSchema.describe('ID of the persona with this position'),
      position: z.string().describe('The position or stance'),
      arguments: z.array(z.string()).describe('Supporting arguments')
    })
  ).describe('Array of positions from different personas')
});

export type DisagreementData = z.infer<typeof disagreementDataSchema>;

// ============================================================================
// CollaborativeReasoningData Schema (council tool)
// ============================================================================

/**
 * Zod schema for validating CollaborativeReasoningData
 * Matches the CollaborativeReasoningData interface from src/models/interfaces.ts
 */
export const collaborativeReasoningDataSchema = z.object({
  // Required fields
  topic: nonEmptyStringSchema.describe('The topic being discussed'),
  personas: z.array(personaDataSchema).describe('Personas participating in the discussion'),
  contributions: z.array(contributionDataSchema).describe('Contributions made during the discussion'),
  stage: collaborativeReasoningStageSchema.describe('Current stage of the collaborative reasoning'),
  activePersonaId: idSchema.describe('ID of the currently active persona'),
  sessionId: idSchema.describe('Unique identifier for this reasoning session'),
  iteration: nonNegativeNumberSchema.int().describe('Current iteration number'),
  nextContributionNeeded: z.boolean().describe('Whether another contribution is needed'),

  // Optional fields
  nextPersonaId: idSchema.optional().describe('ID of the next persona to contribute'),
  consensusPoints: optionalStringArraySchema.describe('Points of consensus reached'),
  disagreements: z.array(disagreementDataSchema).optional().describe('Areas of disagreement'),
  keyInsights: optionalStringArraySchema.describe('Key insights discovered'),
  openQuestions: optionalStringArraySchema.describe('Questions that remain open'),
  finalRecommendation: z.string().optional().describe('Final recommendation if decision stage completed'),
  suggestedContributionTypes: z.array(contributionTypeSchema).optional().describe('Suggested types for next contribution')
});

export type CollaborativeReasoningData = z.infer<typeof collaborativeReasoningDataSchema>;
