import { z } from 'zod';

const communicationSchema = z.object({
  style: z.string(),
  tone: z.string(),
});

const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  expertise: z.array(z.string()),
  background: z.string(),
  perspective: z.string(),
  biases: z.array(z.string()),
  communication: communicationSchema,
});

const contributionTypeEnum = z.enum([
  'observation',
  'question',
  'insight',
  'concern',
  'suggestion',
  'challenge',
  'synthesis',
]);

const contributionSchema = z.object({
  personaId: z.string(),
  content: z.string(),
  type: contributionTypeEnum,
  confidence: z.number().min(0).max(1),
  referenceIds: z.array(z.string()).optional(),
});

const positionSchema = z.object({
  personaId: z.string(),
  position: z.string(),
  arguments: z.array(z.string()),
});

const disagreementSchema = z.object({
  topic: z.string(),
  positions: z.array(positionSchema),
});

export const councilSchema = {
  topic: z.string(),
  personas: z.array(personaSchema),
  contributions: z.array(contributionSchema),
  stage: z.enum([
    'problem-definition',
    'ideation',
    'critique',
    'integration',
    'decision',
    'reflection',
  ]),
  activePersonaId: z.string(),
  nextPersonaId: z.string().optional(),
  consensusPoints: z.array(z.string()).optional(),
  disagreements: z.array(disagreementSchema).optional(),
  keyInsights: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
  finalRecommendation: z.string().optional(),
  sessionId: z.string(),
  iteration: z.number().min(0),
  suggestedContributionTypes: z.array(contributionTypeEnum).optional(),
  nextContributionNeeded: z.boolean(),
};

interface CouncilInput {
  topic: string;
  personas: Array<{
    id: string;
    name: string;
    expertise: string[];
    background: string;
    perspective: string;
    biases: string[];
    communication: { style: string; tone: string };
  }>;
  contributions: Array<{
    personaId: string;
    content: string;
    type: string;
    confidence: number;
    referenceIds?: string[];
  }>;
  stage: string;
  activePersonaId: string;
  nextPersonaId?: string;
  consensusPoints?: string[];
  disagreements?: Array<{
    topic: string;
    positions: Array<{
      personaId: string;
      position: string;
      arguments: string[];
    }>;
  }>;
  keyInsights?: string[];
  openQuestions?: string[];
  finalRecommendation?: string;
  sessionId: string;
  iteration: number;
  suggestedContributionTypes?: string[];
  nextContributionNeeded: boolean;
}

export async function handleCouncil(args: CouncilInput) {
  const {
    topic,
    personas,
    contributions,
    stage,
    activePersonaId,
    nextPersonaId,
    consensusPoints = [],
    disagreements = [],
    keyInsights = [],
    openQuestions = [],
    finalRecommendation = '',
    sessionId,
    iteration,
    suggestedContributionTypes = [],
    nextContributionNeeded,
  } = args;

  return {
    topic,
    stage,
    activePersonaId,
    nextPersonaId,
    sessionId,
    iteration,
    nextContributionNeeded,
    personaCount: personas.length,
    contributionCount: contributions.length,
    consensusPointCount: consensusPoints.length,
    disagreementCount: disagreements.length,
    keyInsightCount: keyInsights.length,
    openQuestionCount: openQuestions.length,
    hasFinalRecommendation: !!finalRecommendation,
    suggestedContributionTypes,
    status: 'success',
  };
}
