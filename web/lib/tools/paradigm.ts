import { z } from 'zod';

/**
 * Valid programming paradigms for structured problem-solving
 */
export const paradigmNameEnum = z.enum([
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
]);

export const paradigmSchema = {
  paradigmName: paradigmNameEnum
    .describe('The programming paradigm to apply: imperative (step-by-step commands), procedural (procedure-based organization), object_oriented (objects with state and behavior), functional (pure functions and immutability), declarative (what not how), logic (rule-based inference), event_driven (event handlers and callbacks), aspect_oriented (cross-cutting concerns), concurrent (parallel execution), reactive (data streams and propagation)'),
  problem: z.string()
    .min(1, 'Problem description cannot be empty')
    .describe('Clear description of the problem to solve using this paradigm'),
  approach: z.array(
    z.string().min(1, 'Approach step cannot be empty')
  )
    .optional()
    .describe('Ordered list of steps describing how to apply the paradigm'),
  benefits: z.array(
    z.string().min(1, 'Benefit cannot be empty')
  )
    .optional()
    .describe('List of advantages of using this paradigm for the problem'),
  limitations: z.array(
    z.string().min(1, 'Limitation cannot be empty')
  )
    .optional()
    .describe('List of drawbacks or challenges of this paradigm'),
  codeExample: z.string()
    .min(1, 'Code example cannot be empty')
    .optional()
    .describe('Illustrative code snippet demonstrating the paradigm'),
  languages: z.array(
    z.string().min(1, 'Language cannot be empty')
  )
    .optional()
    .describe('Programming languages that excel at this paradigm'),
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
