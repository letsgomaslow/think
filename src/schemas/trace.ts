import { z } from 'zod';
import { nonEmptyStringSchema, positiveNumberSchema, idSchema } from './common.js';

// ============================================================================
// ThoughtData Schema (trace tool)
// ============================================================================

/**
 * Zod schema for validating ThoughtData
 * Matches the ThoughtData interface from src/models/interfaces.ts
 */
export const thoughtDataSchema = z.object({
  // Required fields
  thought: nonEmptyStringSchema.describe('The content of the thought'),
  thoughtNumber: positiveNumberSchema.int().describe('Current thought number (1-indexed)'),
  totalThoughts: positiveNumberSchema.int().describe('Total expected thoughts'),
  nextThoughtNeeded: z.boolean().describe('Whether another thought is needed'),

  // Optional fields
  isRevision: z.boolean().optional().describe('Whether this thought revises a previous one'),
  revisesThought: positiveNumberSchema.int().optional().describe('Thought number being revised'),
  branchFromThought: positiveNumberSchema.int().optional().describe('Thought number this branches from'),
  branchId: idSchema.optional().describe('Branch identifier for alternate reasoning paths'),
  needsMoreThoughts: z.boolean().optional().describe('Whether more thoughts are needed than estimated')
});

export type ThoughtData = z.infer<typeof thoughtDataSchema>;
