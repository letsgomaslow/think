import { z } from 'zod';

const knowledgeAssessmentSchema = z.object({
  domain: z.string(),
  knowledgeLevel: z.enum([
    'expert',
    'proficient',
    'familiar',
    'basic',
    'minimal',
    'none',
  ]),
  confidenceScore: z.number().min(0).max(1),
  supportingEvidence: z.string(),
  knownLimitations: z.array(z.string()),
  relevantTrainingCutoff: z.string().optional(),
});

const claimSchema = z.object({
  claim: z.string(),
  status: z.enum(['fact', 'inference', 'speculation', 'uncertain']),
  confidenceScore: z.number().min(0).max(1),
  evidenceBasis: z.string(),
  falsifiabilityCriteria: z.string().optional(),
  alternativeInterpretations: z.array(z.string()).optional(),
});

const reasoningStepSchema = z.object({
  step: z.string(),
  potentialBiases: z.array(z.string()),
  assumptions: z.array(z.string()),
  logicalValidity: z.number().min(0).max(1),
  inferenceStrength: z.number().min(0).max(1),
});

export const reflectSchema = {
  task: z.string(),
  stage: z.enum([
    'knowledge-assessment',
    'planning',
    'execution',
    'monitoring',
    'evaluation',
    'reflection',
  ]),
  knowledgeAssessment: knowledgeAssessmentSchema.optional(),
  claims: z.array(claimSchema).optional(),
  reasoningSteps: z.array(reasoningStepSchema).optional(),
  overallConfidence: z.number().min(0).max(1),
  uncertaintyAreas: z.array(z.string()),
  recommendedApproach: z.string(),
  monitoringId: z.string(),
  iteration: z.number().min(0),
  suggestedAssessments: z.array(z.enum(['knowledge', 'claim', 'reasoning', 'overall'])).optional(),
  nextAssessmentNeeded: z.boolean(),
};

interface ReflectInput {
  task: string;
  stage: string;
  knowledgeAssessment?: {
    domain: string;
    knowledgeLevel: string;
    confidenceScore: number;
    supportingEvidence: string;
    knownLimitations: string[];
    relevantTrainingCutoff?: string;
  };
  claims?: Array<{
    claim: string;
    status: string;
    confidenceScore: number;
    evidenceBasis: string;
    falsifiabilityCriteria?: string;
    alternativeInterpretations?: string[];
  }>;
  reasoningSteps?: Array<{
    step: string;
    potentialBiases: string[];
    assumptions: string[];
    logicalValidity: number;
    inferenceStrength: number;
  }>;
  overallConfidence: number;
  uncertaintyAreas: string[];
  recommendedApproach: string;
  monitoringId: string;
  iteration: number;
  suggestedAssessments?: string[];
  nextAssessmentNeeded: boolean;
}

export async function handleReflect(args: ReflectInput) {
  const {
    task,
    stage,
    knowledgeAssessment,
    claims = [],
    reasoningSteps = [],
    overallConfidence,
    uncertaintyAreas,
    recommendedApproach,
    monitoringId,
    iteration,
    suggestedAssessments = [],
    nextAssessmentNeeded,
  } = args;

  return {
    task,
    stage,
    monitoringId,
    iteration,
    nextAssessmentNeeded,
    overallConfidence,
    uncertaintyAreaCount: uncertaintyAreas.length,
    hasKnowledgeAssessment: !!knowledgeAssessment,
    claimCount: claims.length,
    reasoningStepCount: reasoningSteps.length,
    suggestedAssessments,
    recommendedApproach,
    status: 'success',
  };
}
