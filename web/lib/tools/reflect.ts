import { z } from 'zod';

/**
 * Valid knowledge levels for domain assessment
 */
export const knowledgeLevelEnum = z.enum([
  'expert',
  'proficient',
  'familiar',
  'basic',
  'minimal',
  'none',
]);

/**
 * Valid claim statuses for epistemic classification
 */
export const claimStatusEnum = z.enum([
  'fact',
  'inference',
  'speculation',
  'uncertain',
]);

/**
 * Valid stages in the metacognitive monitoring process
 */
export const reflectStageEnum = z.enum([
  'knowledge-assessment',
  'planning',
  'execution',
  'monitoring',
  'evaluation',
  'reflection',
]);

/**
 * Valid assessment types for self-monitoring
 */
export const assessmentTypeEnum = z.enum([
  'knowledge',
  'claim',
  'reasoning',
  'overall',
]);

/**
 * Schema for knowledge domain assessment
 */
const knowledgeAssessmentSchema = z.object({
  domain: z.string()
    .min(1, 'Domain cannot be empty')
    .describe('The knowledge domain being assessed (e.g., "machine learning", "React hooks")'),
  knowledgeLevel: knowledgeLevelEnum
    .describe('Self-assessed knowledge level: expert (deep mastery), proficient (strong working knowledge), familiar (conceptual understanding), basic (introductory), minimal (vague awareness), none (no knowledge)'),
  confidenceScore: z.number()
    .min(0, 'Confidence must be at least 0')
    .max(1, 'Confidence must be at most 1')
    .describe('Confidence in the knowledge level assessment (0.0 to 1.0)'),
  supportingEvidence: z.string()
    .min(1, 'Supporting evidence cannot be empty')
    .describe('Evidence supporting the knowledge level claim'),
  knownLimitations: z.array(
    z.string().min(1, 'Limitation cannot be empty')
  )
    .describe('Known gaps or limitations in domain knowledge'),
  relevantTrainingCutoff: z.string()
    .min(1, 'Training cutoff cannot be empty')
    .optional()
    .describe('Relevant training data cutoff date if applicable'),
});

/**
 * Schema for an epistemic claim assessment
 */
const claimSchema = z.object({
  claim: z.string()
    .min(1, 'Claim cannot be empty')
    .describe('The specific claim being assessed'),
  status: claimStatusEnum
    .describe('Epistemic status: fact (verified), inference (reasoned conclusion), speculation (educated guess), uncertain (unknown reliability)'),
  confidenceScore: z.number()
    .min(0, 'Confidence must be at least 0')
    .max(1, 'Confidence must be at most 1')
    .describe('Confidence in this claim (0.0 to 1.0)'),
  evidenceBasis: z.string()
    .min(1, 'Evidence basis cannot be empty')
    .describe('The evidence or reasoning supporting this claim'),
  falsifiabilityCriteria: z.string()
    .min(1, 'Falsifiability criteria cannot be empty')
    .optional()
    .describe('Conditions that would disprove this claim'),
  alternativeInterpretations: z.array(
    z.string().min(1, 'Alternative interpretation cannot be empty')
  )
    .optional()
    .describe('Other plausible interpretations of the evidence'),
});

/**
 * Schema for a reasoning step assessment
 */
const reasoningStepSchema = z.object({
  step: z.string()
    .min(1, 'Reasoning step cannot be empty')
    .describe('Description of this reasoning step'),
  potentialBiases: z.array(
    z.string().min(1, 'Bias cannot be empty')
  )
    .describe('Cognitive biases that may affect this step'),
  assumptions: z.array(
    z.string().min(1, 'Assumption cannot be empty')
  )
    .describe('Assumptions underlying this reasoning step'),
  logicalValidity: z.number()
    .min(0, 'Logical validity must be at least 0')
    .max(1, 'Logical validity must be at most 1')
    .describe('Assessment of logical validity (0.0 to 1.0)'),
  inferenceStrength: z.number()
    .min(0, 'Inference strength must be at least 0')
    .max(1, 'Inference strength must be at most 1')
    .describe('Strength of the inference (0.0 to 1.0)'),
});

export const reflectSchema = {
  task: z.string()
    .min(1, 'Task cannot be empty')
    .describe('The task or problem being monitored'),
  stage: reflectStageEnum
    .describe('Current stage: knowledge-assessment (domain expertise), planning (approach design), execution (doing the work), monitoring (tracking progress), evaluation (assessing quality), reflection (meta-analysis)'),
  knowledgeAssessment: knowledgeAssessmentSchema
    .optional()
    .describe('Assessment of domain knowledge relevant to the task'),
  claims: z.array(claimSchema)
    .optional()
    .describe('List of claims made during reasoning with epistemic assessment'),
  reasoningSteps: z.array(reasoningStepSchema)
    .optional()
    .describe('Assessment of individual reasoning steps'),
  overallConfidence: z.number()
    .min(0, 'Overall confidence must be at least 0')
    .max(1, 'Overall confidence must be at most 1')
    .describe('Overall confidence in the current analysis (0.0 to 1.0)'),
  uncertaintyAreas: z.array(
    z.string().min(1, 'Uncertainty area cannot be empty')
  )
    .describe('Areas of uncertainty that affect the analysis'),
  recommendedApproach: z.string()
    .min(1, 'Recommended approach cannot be empty')
    .describe('Suggested approach based on metacognitive assessment'),
  monitoringId: z.string()
    .min(1, 'Monitoring ID cannot be empty')
    .describe('Unique identifier for this monitoring session'),
  iteration: z.number()
    .int('Iteration must be an integer')
    .min(0, 'Iteration must be at least 0')
    .describe('Current iteration of the monitoring process'),
  suggestedAssessments: z.array(assessmentTypeEnum)
    .optional()
    .describe('Suggested next assessments: knowledge (domain check), claim (verify claims), reasoning (logic check), overall (holistic review)'),
  nextAssessmentNeeded: z.boolean()
    .describe('Whether further metacognitive assessment is needed'),
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
