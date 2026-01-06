import { z } from 'zod';
import { createCouncilProgress, ProgressNotification } from '../progress';

/**
 * Communication style configuration for a persona
 */
const communicationSchema = z.object({
  style: z.string()
    .min(1, 'Communication style cannot be empty')
    .describe('The communication style of this persona (e.g., analytical, empathetic, direct)'),
  tone: z.string()
    .min(1, 'Communication tone cannot be empty')
    .describe('The typical tone of this persona (e.g., formal, casual, assertive)'),
});

/**
 * Schema for an expert persona participating in the council
 */
const personaSchema = z.object({
  id: z.string()
    .min(1, 'Persona ID cannot be empty')
    .describe('Unique identifier for this persona'),
  name: z.string()
    .min(1, 'Persona name cannot be empty')
    .describe('Display name for the persona'),
  expertise: z.array(
    z.string().min(1, 'Expertise item cannot be empty')
  )
    .min(1, 'At least one area of expertise is required')
    .describe('List of domains where this persona has expertise'),
  background: z.string()
    .min(1, 'Background cannot be empty')
    .describe('Professional or academic background of the persona'),
  perspective: z.string()
    .min(1, 'Perspective cannot be empty')
    .describe('The unique viewpoint this persona brings to discussions'),
  biases: z.array(
    z.string().min(1, 'Bias item cannot be empty')
  )
    .describe('Known biases or blind spots of this persona'),
  communication: communicationSchema
    .describe('Communication preferences for this persona'),
});

/**
 * Valid contribution types in council discussions
 */
export const contributionTypeEnum = z.enum([
  'observation',
  'question',
  'insight',
  'concern',
  'suggestion',
  'challenge',
  'synthesis',
]);

/**
 * Schema for a contribution made by a persona
 */
const contributionSchema = z.object({
  personaId: z.string()
    .min(1, 'Persona ID cannot be empty')
    .describe('ID of the persona making this contribution'),
  content: z.string()
    .min(1, 'Contribution content cannot be empty')
    .describe('The actual content of the contribution'),
  type: contributionTypeEnum
    .describe('Type of contribution: observation (factual), question (inquiry), insight (analysis), concern (risk), suggestion (proposal), challenge (critique), synthesis (integration)'),
  confidence: z.number()
    .min(0, 'Confidence must be at least 0')
    .max(1, 'Confidence must be at most 1')
    .describe('Confidence level in this contribution (0.0 to 1.0)'),
  referenceIds: z.array(
    z.string().min(1, 'Reference ID cannot be empty')
  )
    .optional()
    .describe('IDs of previous contributions this references'),
});

/**
 * Schema for a position in a disagreement
 */
const positionSchema = z.object({
  personaId: z.string()
    .min(1, 'Persona ID cannot be empty')
    .describe('ID of the persona holding this position'),
  position: z.string()
    .min(1, 'Position cannot be empty')
    .describe('Summary of this personas stance'),
  arguments: z.array(
    z.string().min(1, 'Argument cannot be empty')
  )
    .min(1, 'At least one argument is required')
    .describe('List of arguments supporting this position'),
});

/**
 * Schema for a disagreement between personas
 */
const disagreementSchema = z.object({
  topic: z.string()
    .min(1, 'Disagreement topic cannot be empty')
    .describe('The topic of disagreement'),
  positions: z.array(positionSchema)
    .min(2, 'At least two positions are required for a disagreement')
    .describe('The different positions held on this topic'),
});

/**
 * Valid stages in the council collaboration process
 */
export const councilStageEnum = z.enum([
  'problem-definition',
  'ideation',
  'critique',
  'integration',
  'decision',
  'reflection',
]);

export const councilSchema = {
  topic: z.string()
    .min(1, 'Topic cannot be empty')
    .describe('The main topic or problem the council is addressing'),
  personaCategory: z.enum(['technical', 'business', 'creative', 'general'])
    .optional()
    .describe('Optional: Select personas from a specific category (technical, business, creative, general)'),
  predefinedPersonas: z.array(z.string())
    .optional()
    .describe('Optional: Array of predefined persona IDs to use from the persona library (e.g., ["security-specialist", "performance-engineer"])'),
  personas: z.array(personaSchema)
    .min(2, 'At least two personas are required for a council')
    .describe('List of expert personas participating in the council'),
  contributions: z.array(contributionSchema)
    .describe('All contributions made during this council session'),
  stage: councilStageEnum
    .describe('Current stage: problem-definition (framing), ideation (generating ideas), critique (evaluating), integration (combining), decision (choosing), reflection (reviewing)'),
  activePersonaId: z.string()
    .min(1, 'Active persona ID cannot be empty')
    .describe('ID of the persona currently contributing'),
  nextPersonaId: z.string()
    .min(1, 'Next persona ID cannot be empty')
    .optional()
    .describe('ID of the persona suggested to contribute next'),
  consensusPoints: z.array(
    z.string().min(1, 'Consensus point cannot be empty')
  )
    .optional()
    .describe('Points where all personas agree'),
  disagreements: z.array(disagreementSchema)
    .optional()
    .describe('Active disagreements between personas'),
  keyInsights: z.array(
    z.string().min(1, 'Key insight cannot be empty')
  )
    .optional()
    .describe('Important insights discovered during discussion'),
  openQuestions: z.array(
    z.string().min(1, 'Open question cannot be empty')
  )
    .optional()
    .describe('Questions that remain unanswered'),
  finalRecommendation: z.string()
    .min(1, 'Final recommendation cannot be empty')
    .optional()
    .describe('The councils final recommendation if reached'),
  sessionId: z.string()
    .min(1, 'Session ID cannot be empty')
    .describe('Unique identifier for this council session'),
  iteration: z.number()
    .int('Iteration must be an integer')
    .min(0, 'Iteration must be at least 0')
    .describe('Current iteration number of the council process'),
  suggestedContributionTypes: z.array(contributionTypeEnum)
    .optional()
    .describe('Suggested contribution types for the next turn'),
  nextContributionNeeded: z.boolean()
    .describe('Whether another contribution is needed to continue'),
};

interface CouncilInput {
  topic: string;
  personaCategory?: 'technical' | 'business' | 'creative' | 'general';
  predefinedPersonas?: string[];
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
    personaCategory,
    predefinedPersonas,
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

  // Initialize progress tracking
  const progress = await createCouncilProgress(personas.length);

  // Find active persona for progress context
  const activePersona = personas.find((p) => p.id === activePersonaId);
  const activePersonaName = activePersona?.name || activePersonaId;

  // Emit progress for current stage
  progress.emitPhase(stage as any, activePersonaName);

  // Emit progress for latest contribution if any
  if (contributions.length > 0) {
    const latestContribution = contributions[contributions.length - 1];
    const contributorPersona = personas.find((p) => p.id === latestContribution.personaId);
    const contributorName = contributorPersona?.name || latestContribution.personaId;
    progress.emitContribution(contributorName, latestContribution.type);
  }

  // Collect progress notifications
  const progressNotifications: ProgressNotification[] = progress.getNotifications();

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
    progress: progressNotifications,
    status: 'success',
  };
}
