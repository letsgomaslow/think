import { z } from 'zod';
import { nonEmptyStringSchema, requiredStringArraySchema } from './common.js';

// ============================================================================
// MentalModelData Schema (model tool)
// ============================================================================

/**
 * Zod schema for validating MentalModelData
 * Matches the MentalModelData interface from src/models/interfaces.ts
 */
export const mentalModelDataSchema = z.object({
  // Required fields
  modelName: nonEmptyStringSchema.describe('The name of the mental model being applied'),
  problem: nonEmptyStringSchema.describe('The problem or scenario being analyzed'),
  steps: requiredStringArraySchema.describe('Steps for applying this mental model (at least one required)'),
  reasoning: nonEmptyStringSchema.describe('The reasoning process and analysis'),
  conclusion: nonEmptyStringSchema.describe('The conclusion or insight gained from applying the model')
});

export type MentalModelData = z.infer<typeof mentalModelDataSchema>;
