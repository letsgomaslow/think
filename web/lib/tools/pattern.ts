import { z } from 'zod';

/**
 * Valid design pattern types for software architecture
 */
export const patternNameEnum = z.enum([
  'modular_architecture',
  'api_integration',
  'state_management',
  'async_processing',
  'scalability',
  'security',
  'agentic_design',
]);

export const patternSchema = {
  patternName: patternNameEnum
    .describe('The design pattern to apply: modular_architecture (component separation), api_integration (external service patterns), state_management (data flow control), async_processing (non-blocking operations), scalability (growth handling), security (protection patterns), agentic_design (AI agent patterns)'),
  context: z.string()
    .min(1, 'Context cannot be empty')
    .describe('Description of the problem context or architectural challenge'),
  implementation: z.array(
    z.string().min(1, 'Implementation step cannot be empty')
  )
    .optional()
    .describe('Ordered list of implementation steps for the pattern'),
  benefits: z.array(
    z.string().min(1, 'Benefit cannot be empty')
  )
    .optional()
    .describe('List of advantages gained from applying this pattern'),
  tradeoffs: z.array(
    z.string().min(1, 'Tradeoff cannot be empty')
  )
    .optional()
    .describe('List of costs, complexities, or downsides to consider'),
  codeExample: z.string()
    .min(1, 'Code example cannot be empty')
    .optional()
    .describe('Illustrative code snippet demonstrating the pattern'),
  languages: z.array(
    z.string().min(1, 'Language cannot be empty')
  )
    .optional()
    .describe('Programming languages relevant to this pattern implementation'),
};

interface PatternInput {
  patternName: string;
  context: string;
  implementation?: string[];
  benefits?: string[];
  tradeoffs?: string[];
  codeExample?: string;
  languages?: string[];
}

export async function handlePattern(args: PatternInput) {
  const {
    patternName,
    context,
    implementation = [],
    benefits = [],
    tradeoffs = [],
    codeExample = '',
    languages = [],
  } = args;

  return {
    patternName,
    context,
    implementation,
    benefits,
    tradeoffs,
    codeExample,
    languages,
    status: 'success',
    hasImplementation: implementation.length > 0,
    hasBenefits: benefits.length > 0,
    hasTradeoffs: tradeoffs.length > 0,
  };
}
