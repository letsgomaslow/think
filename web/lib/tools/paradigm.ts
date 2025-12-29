import { z } from 'zod';

export const paradigmSchema = {
  paradigmName: z.enum([
    'imperative',
    'procedural',
    'object_oriented',
    'functional',
    'declarative',
    'logic',
    'event_driven',
    'aspect_oriented',
    'concurrent',
    'reactive',
  ]),
  problem: z.string(),
  approach: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  codeExample: z.string().optional(),
  languages: z.array(z.string()).optional(),
};

interface ParadigmInput {
  paradigmName: string;
  problem: string;
  approach?: string[];
  benefits?: string[];
  limitations?: string[];
  codeExample?: string;
  languages?: string[];
}

export async function handleParadigm(args: ParadigmInput) {
  const {
    paradigmName,
    problem,
    approach = [],
    benefits = [],
    limitations = [],
    codeExample = '',
    languages = [],
  } = args;

  return {
    paradigmName,
    problem,
    approach,
    benefits,
    limitations,
    codeExample,
    languages,
    status: 'success',
    hasApproach: approach.length > 0,
    hasBenefits: benefits.length > 0,
    hasLimitations: limitations.length > 0,
  };
}
