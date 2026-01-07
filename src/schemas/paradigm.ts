import { z } from 'zod';
import { nonEmptyStringSchema, requiredStringArraySchema, optionalStringArraySchema } from './common.js';

// ============================================================================
// ProgrammingParadigmData Schema (paradigm tool)
// ============================================================================

/**
 * Zod schema for validating ProgrammingParadigmData
 * Matches the ProgrammingParadigmData interface from src/models/interfaces.ts
 */
export const programmingParadigmDataSchema = z.object({
  // Required fields
  paradigmName: nonEmptyStringSchema.describe('The name of the programming paradigm'),
  problem: nonEmptyStringSchema.describe('The problem or situation being addressed'),
  approach: requiredStringArraySchema.describe('Steps or characteristics of the paradigm approach (at least one required)'),
  benefits: requiredStringArraySchema.describe('Benefits of using this paradigm (at least one required)'),
  limitations: requiredStringArraySchema.describe('Limitations or constraints of this paradigm (at least one required)'),

  // Optional fields
  codeExample: z.string().optional().describe('Optional code example demonstrating the paradigm'),
  languages: optionalStringArraySchema.describe('Optional list of programming languages that support this paradigm')
});

export type ProgrammingParadigmData = z.infer<typeof programmingParadigmDataSchema>;
