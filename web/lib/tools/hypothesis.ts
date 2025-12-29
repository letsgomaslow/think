import { z } from 'zod';

const variableSchema = z.object({
  name: z.string(),
  type: z.enum(['independent', 'dependent', 'controlled', 'confounding']),
  operationalization: z.string().optional(),
});

const hypothesisObjSchema = z.object({
  statement: z.string(),
  variables: z.array(variableSchema),
  assumptions: z.array(z.string()),
  hypothesisId: z.string(),
  confidence: z.number().min(0).max(1),
  domain: z.string(),
  iteration: z.number().min(0),
  alternativeTo: z.array(z.string()).optional(),
  refinementOf: z.string().optional(),
  status: z.enum(['proposed', 'testing', 'supported', 'refuted', 'refined']),
});

const predictionSchema = z.object({
  if: z.string(),
  then: z.string(),
  else: z.string().optional(),
});

const experimentSchema = z.object({
  design: z.string(),
  methodology: z.string(),
  predictions: z.array(predictionSchema),
  experimentId: z.string(),
  hypothesisId: z.string(),
  controlMeasures: z.array(z.string()),
  results: z.string().optional(),
  outcomeMatched: z.boolean().optional(),
  unexpectedObservations: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
});

export const hypothesisSchema = {
  stage: z.enum([
    'observation',
    'question',
    'hypothesis',
    'experiment',
    'analysis',
    'conclusion',
    'iteration',
  ]),
  observation: z.string().optional(),
  question: z.string().optional(),
  hypothesis: hypothesisObjSchema.optional(),
  experiment: experimentSchema.optional(),
  analysis: z.string().optional(),
  conclusion: z.string().optional(),
  inquiryId: z.string(),
  iteration: z.number().min(0),
  nextStageNeeded: z.boolean(),
};

interface HypothesisInput {
  stage: string;
  observation?: string;
  question?: string;
  hypothesis?: {
    statement: string;
    variables: Array<{
      name: string;
      type: string;
      operationalization?: string;
    }>;
    assumptions: string[];
    hypothesisId: string;
    confidence: number;
    domain: string;
    iteration: number;
    alternativeTo?: string[];
    refinementOf?: string;
    status: string;
  };
  experiment?: {
    design: string;
    methodology: string;
    predictions: Array<{
      if: string;
      then: string;
      else?: string;
    }>;
    experimentId: string;
    hypothesisId: string;
    controlMeasures: string[];
    results?: string;
    outcomeMatched?: boolean;
    unexpectedObservations?: string[];
    limitations?: string[];
    nextSteps?: string[];
  };
  analysis?: string;
  conclusion?: string;
  inquiryId: string;
  iteration: number;
  nextStageNeeded: boolean;
}

export async function handleHypothesis(args: HypothesisInput) {
  const {
    stage,
    observation = '',
    question = '',
    hypothesis,
    experiment,
    analysis = '',
    conclusion = '',
    inquiryId,
    iteration,
    nextStageNeeded,
  } = args;

  return {
    stage,
    inquiryId,
    iteration,
    nextStageNeeded,
    hasObservation: !!observation,
    hasQuestion: !!question,
    hasHypothesis: !!hypothesis,
    hypothesisStatus: hypothesis?.status || null,
    hasExperiment: !!experiment,
    experimentPredictionCount: experiment?.predictions?.length || 0,
    hasAnalysis: !!analysis,
    hasConclusion: !!conclusion,
    status: 'success',
  };
}
