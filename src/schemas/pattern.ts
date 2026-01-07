import { z } from 'zod';
import { nonEmptyStringSchema, requiredStringArraySchema, optionalStringArraySchema } from './common.js';

// ============================================================================
// DesignPatternData Schema (pattern tool)
// ============================================================================

/**
 * Zod schema for validating DesignPatternData
 * Matches the DesignPatternData interface from src/models/interfaces.ts
 */
export const designPatternDataSchema = z.object({
  // Required fields
  patternName: nonEmptyStringSchema.describe('The name of the design pattern'),
  context: nonEmptyStringSchema.describe('The context or problem where this pattern applies'),
  implementation: requiredStringArraySchema.describe('Steps or components for implementing the pattern (at least one required)'),
  benefits: requiredStringArraySchema.describe('Benefits of using this pattern (at least one required)'),
  tradeoffs: requiredStringArraySchema.describe('Tradeoffs or considerations when using this pattern (at least one required)'),

  // Optional fields
  codeExample: z.string().optional().describe('Optional code example demonstrating the pattern'),
  languages: optionalStringArraySchema.describe('Optional list of programming languages where this pattern applies')
});

export type DesignPatternData = z.infer<typeof designPatternDataSchema>;
