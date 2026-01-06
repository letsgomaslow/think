import { z } from 'zod';
import { nonEmptyStringSchema, requiredStringArraySchema } from './common.js';

// ============================================================================
// DebuggingApproachData Schema (debug tool)
// ============================================================================

/**
 * Zod schema for validating DebuggingApproachData
 * Matches the DebuggingApproachData interface from src/models/interfaces.ts
 */
export const debuggingApproachDataSchema = z.object({
  // Required fields
  approachName: nonEmptyStringSchema.describe('The name of the debugging approach being used'),
  issue: nonEmptyStringSchema.describe('Description of the issue or bug being debugged'),
  steps: requiredStringArraySchema.describe('Steps taken to debug and diagnose the issue (at least one required)'),
  findings: nonEmptyStringSchema.describe('Key findings and observations from the debugging process'),
  resolution: nonEmptyStringSchema.describe('The resolution or solution to the issue')
});

export type DebuggingApproachData = z.infer<typeof debuggingApproachDataSchema>;
