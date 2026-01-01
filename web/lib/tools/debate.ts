import { z } from 'zod';

/**
 * Valid argument types in dialectical reasoning
 */
export const argumentTypeEnum = z.enum([
  'thesis',
  'antithesis',
  'synthesis',
  'objection',
  'rebuttal',
]);

export const debateSchema = {
  claim: z.string()
    .min(1, 'Claim cannot be empty')
    .describe('The main assertion or proposition being argued'),
  premises: z.array(
    z.string().min(1, 'Premise cannot be empty')
  )
    .min(1, 'At least one premise is required')
    .describe('List of supporting statements that lead to the conclusion'),
  conclusion: z.string()
    .min(1, 'Conclusion cannot be empty')
    .describe('The logical conclusion derived from the premises'),
  argumentId: z.string()
    .min(1, 'Argument ID cannot be empty')
    .optional()
    .describe('Unique identifier for this argument (auto-generated if not provided)'),
  argumentType: argumentTypeEnum
    .describe('Type of argument: thesis (initial position), antithesis (opposing view), synthesis (reconciliation), objection (specific critique), rebuttal (defense against objection)'),
  confidence: z.number()
    .min(0, 'Confidence must be at least 0')
    .max(1, 'Confidence must be at most 1')
    .describe('Confidence level in this argument (0.0 to 1.0)'),
  respondsTo: z.string()
    .min(1, 'RespondsTo ID cannot be empty')
    .optional()
    .describe('ID of the argument this directly responds to'),
  supports: z.array(
    z.string().min(1, 'Support ID cannot be empty')
  )
    .optional()
    .describe('IDs of arguments this supports or reinforces'),
  contradicts: z.array(
    z.string().min(1, 'Contradicts ID cannot be empty')
  )
    .optional()
    .describe('IDs of arguments this contradicts or opposes'),
  strengths: z.array(
    z.string().min(1, 'Strength cannot be empty')
  )
    .optional()
    .describe('Notable strong points of this argument'),
  weaknesses: z.array(
    z.string().min(1, 'Weakness cannot be empty')
  )
    .optional()
    .describe('Notable weak points or vulnerabilities of this argument'),
  nextArgumentNeeded: z.boolean()
    .describe('Whether another argument is needed in the dialectic'),
  suggestedNextTypes: z.array(argumentTypeEnum)
    .optional()
    .describe('Suggested argument types for the next turn in the debate'),
};

interface DebateInput {
  claim: string;
  premises: string[];
  conclusion: string;
  argumentId?: string;
  argumentType: string;
  confidence: number;
  respondsTo?: string;
  supports?: string[];
  contradicts?: string[];
  strengths?: string[];
  weaknesses?: string[];
  nextArgumentNeeded: boolean;
  suggestedNextTypes?: string[];
}

export async function handleDebate(args: DebateInput) {
  const {
    claim,
    premises,
    conclusion,
    argumentId,
    argumentType,
    confidence,
    respondsTo = '',
    supports = [],
    contradicts = [],
    strengths = [],
    weaknesses = [],
    nextArgumentNeeded,
    suggestedNextTypes = [],
  } = args;

  return {
    claim,
    argumentType,
    confidence,
    argumentId: argumentId || `arg-${Date.now()}`,
    nextArgumentNeeded,
    premiseCount: premises.length,
    hasConclusion: !!conclusion,
    respondsTo: respondsTo || null,
    supportCount: supports.length,
    contradictCount: contradicts.length,
    strengthCount: strengths.length,
    weaknessCount: weaknesses.length,
    suggestedNextTypes,
    status: 'success',
  };
}
