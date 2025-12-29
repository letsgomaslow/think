import { z } from 'zod';

const argumentTypeEnum = z.enum([
  'thesis',
  'antithesis',
  'synthesis',
  'objection',
  'rebuttal',
]);

export const debateSchema = {
  claim: z.string(),
  premises: z.array(z.string()),
  conclusion: z.string(),
  argumentId: z.string().optional(),
  argumentType: argumentTypeEnum,
  confidence: z.number().min(0).max(1),
  respondsTo: z.string().optional(),
  supports: z.array(z.string()).optional(),
  contradicts: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  nextArgumentNeeded: z.boolean(),
  suggestedNextTypes: z.array(argumentTypeEnum).optional(),
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
