import { z } from 'zod';
import { createHypothesisProgress, ProgressNotification } from '../progress';

/**
 * Valid variable types in experimental design
 */
export const variableTypeEnum = z.enum([
  'independent',
  'dependent',
  'controlled',
  'confounding',
]);

/**
 * Valid hypothesis statuses in the scientific method
 */
export const hypothesisStatusEnum = z.enum([
  'proposed',
  'testing',
  'supported',
  'refuted',
  'refined',
]);

/**
 * Valid stages in the scientific method process
 */
export const scientificStageEnum = z.enum([
  'observation',
  'question',
  'hypothesis',
  'experiment',
  'analysis',
  'conclusion',
  'iteration',
]);

/**
 * Schema for a research variable
 */
const variableSchema = z.object({
  name: z.string()
    .min(1, 'Variable name cannot be empty')
    .describe('Name of the variable'),
  type: variableTypeEnum
    .describe('Variable type: independent (manipulated), dependent (measured), controlled (held constant), confounding (potentially interfering)'),
  operationalization: z.string()
    .min(1, 'Operationalization cannot be empty')
    .optional()
    .describe('How this variable will be measured or manipulated'),
});

/**
 * Schema for a hypothesis object
 */
const hypothesisObjSchema = z.object({
  statement: z.string()
    .min(1, 'Hypothesis statement cannot be empty')
    .describe('The formal hypothesis statement to be tested'),
  variables: z.array(variableSchema)
    .min(1, 'At least one variable is required')
    .describe('Variables involved in the hypothesis'),
  assumptions: z.array(
    z.string().min(1, 'Assumption cannot be empty')
  )
    .describe('Underlying assumptions of the hypothesis'),
  hypothesisId: z.string()
    .min(1, 'Hypothesis ID cannot be empty')
    .describe('Unique identifier for this hypothesis'),
  confidence: z.number()
    .min(0, 'Confidence must be at least 0')
    .max(1, 'Confidence must be at most 1')
    .describe('Confidence level in this hypothesis (0.0 to 1.0)'),
  domain: z.string()
    .min(1, 'Domain cannot be empty')
    .describe('The domain or field this hypothesis belongs to'),
  iteration: z.number()
    .int('Iteration must be an integer')
    .min(0, 'Iteration must be at least 0')
    .describe('Iteration number for hypothesis refinement'),
  alternativeTo: z.array(
    z.string().min(1, 'Alternative hypothesis ID cannot be empty')
  )
    .optional()
    .describe('IDs of alternative hypotheses this competes with'),
  refinementOf: z.string()
    .min(1, 'Refinement source ID cannot be empty')
    .optional()
    .describe('ID of the hypothesis this refines'),
  status: hypothesisStatusEnum
    .describe('Current status: proposed (initial), testing (being evaluated), supported (evidence for), refuted (evidence against), refined (modified based on results)'),
});

/**
 * Schema for a prediction (if-then-else statement)
 */
const predictionSchema = z.object({
  if: z.string()
    .min(1, 'Condition cannot be empty')
    .describe('The condition or setup of the prediction'),
  then: z.string()
    .min(1, 'Expected outcome cannot be empty')
    .describe('The expected outcome if hypothesis is correct'),
  else: z.string()
    .min(1, 'Alternative outcome cannot be empty')
    .optional()
    .describe('The expected outcome if hypothesis is incorrect'),
});

/**
 * Schema for an experiment
 */
const experimentSchema = z.object({
  design: z.string()
    .min(1, 'Experiment design cannot be empty')
    .describe('Description of the experimental design'),
  methodology: z.string()
    .min(1, 'Methodology cannot be empty')
    .describe('Detailed methodology for conducting the experiment'),
  predictions: z.array(predictionSchema)
    .min(1, 'At least one prediction is required')
    .describe('Predictions to be tested by this experiment'),
  experimentId: z.string()
    .min(1, 'Experiment ID cannot be empty')
    .describe('Unique identifier for this experiment'),
  hypothesisId: z.string()
    .min(1, 'Hypothesis ID cannot be empty')
    .describe('ID of the hypothesis being tested'),
  controlMeasures: z.array(
    z.string().min(1, 'Control measure cannot be empty')
  )
    .describe('Measures taken to control confounding variables'),
  results: z.string()
    .min(1, 'Results cannot be empty')
    .optional()
    .describe('Observed results from the experiment'),
  outcomeMatched: z.boolean()
    .optional()
    .describe('Whether the results matched predictions'),
  unexpectedObservations: z.array(
    z.string().min(1, 'Observation cannot be empty')
  )
    .optional()
    .describe('Unexpected observations during the experiment'),
  limitations: z.array(
    z.string().min(1, 'Limitation cannot be empty')
  )
    .optional()
    .describe('Known limitations of the experiment'),
  nextSteps: z.array(
    z.string().min(1, 'Next step cannot be empty')
  )
    .optional()
    .describe('Suggested follow-up experiments or actions'),
});

export const hypothesisSchema = {
  stage: scientificStageEnum
    .describe('Current stage: observation (initial data), question (research question), hypothesis (testable prediction), experiment (testing), analysis (interpreting results), conclusion (final assessment), iteration (refinement cycle)'),
  observation: z.string()
    .min(1, 'Observation cannot be empty')
    .optional()
    .describe('Initial observation that sparked the inquiry'),
  question: z.string()
    .min(1, 'Research question cannot be empty')
    .optional()
    .describe('The research question being investigated'),
  hypothesis: hypothesisObjSchema
    .optional()
    .describe('The formal hypothesis being tested'),
  experiment: experimentSchema
    .optional()
    .describe('The experiment designed to test the hypothesis'),
  analysis: z.string()
    .min(1, 'Analysis cannot be empty')
    .optional()
    .describe('Analysis of experimental results'),
  conclusion: z.string()
    .min(1, 'Conclusion cannot be empty')
    .optional()
    .describe('Conclusion drawn from the scientific inquiry'),
  inquiryId: z.string()
    .min(1, 'Inquiry ID cannot be empty')
    .describe('Unique identifier for this scientific inquiry'),
  iteration: z.number()
    .int('Iteration must be an integer')
    .min(0, 'Iteration must be at least 0')
    .describe('Current iteration of the scientific process'),
  nextStageNeeded: z.boolean()
    .describe('Whether another stage is needed in the process'),
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

  // Initialize progress tracking
  const progress = await createHypothesisProgress();

  // Generate stage detail based on current content
  let stageDetail: string | undefined;
  switch (stage) {
    case 'observation':
      stageDetail = observation ? `Observed: ${observation.slice(0, 50)}...` : undefined;
      break;
    case 'question':
      stageDetail = question ? `Investigating: ${question.slice(0, 50)}...` : undefined;
      break;
    case 'hypothesis':
      stageDetail = hypothesis ? `Testing: ${hypothesis.statement.slice(0, 50)}...` : undefined;
      break;
    case 'experiment':
      stageDetail = experiment ? `Running: ${experiment.design.slice(0, 50)}...` : undefined;
      break;
    case 'analysis':
      stageDetail = analysis ? `Analyzing results` : undefined;
      break;
    case 'conclusion':
      stageDetail = conclusion ? `Drawing conclusions` : undefined;
      break;
    case 'iteration':
      stageDetail = `Iteration ${iteration}`;
      break;
  }

  // Emit progress for current stage
  progress.emitStage(stage as any, stageDetail);

  // Collect progress notifications
  const progressNotifications: ProgressNotification[] = progress.getNotifications();

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
    progress: progressNotifications,
    status: 'success',
  };
}
