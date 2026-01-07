import { z } from 'zod';
import {
  nonEmptyStringSchema,
  idSchema,
  optionalStringArraySchema,
  requiredStringArraySchema,
  argumentTypeSchema,
  confidenceScoreSchema
} from './common.js';

// ============================================================================
// ArgumentData Schema (debate tool)
// ============================================================================

/**
 * Zod schema for validating ArgumentData
 * Matches the ArgumentData interface from src/models/interfaces.ts
 */
export const argumentDataSchema = z.object({
  // Required fields
  claim: nonEmptyStringSchema.describe('The main claim being made'),
  premises: requiredStringArraySchema.describe('Array of premises supporting the claim'),
  conclusion: nonEmptyStringSchema.describe('The conclusion drawn from the premises'),
  argumentType: argumentTypeSchema.describe('Type of argument (thesis, antithesis, synthesis, objection, rebuttal)'),
  confidence: confidenceScoreSchema.describe('Confidence level (0-1)'),
  nextArgumentNeeded: z.boolean().describe('Whether another argument is needed'),

  // Optional fields
  argumentId: idSchema.optional().describe('Optional unique identifier for the argument'),
  respondsTo: idSchema.optional().describe('Optional ID of the argument this responds to'),
  supports: optionalStringArraySchema.describe('Optional IDs of arguments this supports'),
  contradicts: optionalStringArraySchema.describe('Optional IDs of arguments this contradicts'),
  strengths: optionalStringArraySchema.describe('Optional list of strengths in this argument'),
  weaknesses: optionalStringArraySchema.describe('Optional list of weaknesses in this argument'),
  suggestedNextTypes: z.array(argumentTypeSchema).optional().describe('Optional suggested types for next argument')
});

export type ArgumentData = z.infer<typeof argumentDataSchema>;
