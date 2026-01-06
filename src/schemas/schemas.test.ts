import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';

// Import common schemas
import {
  contributionTypeSchema,
  argumentTypeSchema,
  variableTypeSchema,
  visualElementTypeSchema,
  visualOperationTypeSchema,
  visualTransformationTypeSchema,
  diagramTypeSchema,
  collaborativeReasoningStageSchema,
  decisionFrameworkStageSchema,
  metacognitiveMonitoringStageSchema,
  scientificInquiryStageSchema,
  analysisTypeSchema,
  eisenhowerQuadrantSchema,
  costBenefitTypeSchema,
  doorTypeSchema,
  riskToleranceSchema,
  knowledgeLevelSchema,
  claimStatusSchema,
  hypothesisStatusSchema,
  personaCategorySchema,
  assessmentTypeSchema,
  confidenceScoreSchema,
  weightSchema,
  probabilitySchema,
  scoreSchema,
  nonNegativeNumberSchema,
  positiveNumberSchema,
  nonEmptyStringSchema,
  idSchema,
  optionalStringArraySchema,
  requiredStringArraySchema,
} from './common.js';

// Import tool schemas
import { thoughtDataSchema } from './trace.js';
import { mentalModelDataSchema } from './model.js';
import { debuggingApproachDataSchema } from './debug.js';
import { designPatternDataSchema } from './pattern.js';
import { programmingParadigmDataSchema } from './paradigm.js';
import {
  personaDataSchema,
  contributionDataSchema,
  disagreementDataSchema,
  collaborativeReasoningDataSchema,
} from './council.js';
import {
  optionDataSchema,
  criterionDataSchema,
  outcomeDataSchema,
  eisenhowerClassificationSchema,
  costBenefitItemSchema,
  costBenefitAnalysisSchema,
  riskItemSchema,
  reversibilityDataSchema,
  timeHorizonRegretSchema,
  regretMinimizationDataSchema,
  decisionFrameworkDataSchema,
} from './decide.js';
import { argumentDataSchema } from './debate.js';
import {
  knowledgeAssessmentSchema,
  claimAssessmentSchema,
  reasoningAssessmentSchema,
  metacognitiveMonitoringDataSchema,
} from './reflect.js';
import {
  variableSchema,
  predictionSchema,
  hypothesisDataSchema,
  experimentDataSchema,
  scientificInquiryDataSchema,
} from './hypothesis.js';
import { visualElementSchema, visualOperationDataSchema } from './map.js';

// ============================================================================
// Common Schemas Tests
// ============================================================================

describe('Common Schemas', () => {
  describe('Enum Schemas', () => {
    it('should validate valid contribution types', () => {
      expect(() => contributionTypeSchema.parse('observation')).not.toThrow();
      expect(() => contributionTypeSchema.parse('synthesis')).not.toThrow();
    });

    it('should reject invalid contribution types', () => {
      expect(() => contributionTypeSchema.parse('invalid')).toThrow(ZodError);
    });

    it('should validate valid argument types', () => {
      expect(() => argumentTypeSchema.parse('thesis')).not.toThrow();
      expect(() => argumentTypeSchema.parse('rebuttal')).not.toThrow();
    });

    it('should reject invalid argument types', () => {
      expect(() => argumentTypeSchema.parse('invalid')).toThrow(ZodError);
    });

    it('should validate valid stage types', () => {
      expect(() => collaborativeReasoningStageSchema.parse('ideation')).not.toThrow();
      expect(() => decisionFrameworkStageSchema.parse('evaluation')).not.toThrow();
      expect(() => metacognitiveMonitoringStageSchema.parse('planning')).not.toThrow();
      expect(() => scientificInquiryStageSchema.parse('hypothesis')).not.toThrow();
    });

    it('should validate valid analysis types', () => {
      expect(() => analysisTypeSchema.parse('pros-cons')).not.toThrow();
      expect(() => analysisTypeSchema.parse('eisenhower-matrix')).not.toThrow();
    });

    it('should validate valid knowledge levels', () => {
      expect(() => knowledgeLevelSchema.parse('expert')).not.toThrow();
      expect(() => knowledgeLevelSchema.parse('none')).not.toThrow();
    });
  });

  describe('Numeric Constraint Schemas', () => {
    it('should validate confidence scores (0-1)', () => {
      expect(() => confidenceScoreSchema.parse(0)).not.toThrow();
      expect(() => confidenceScoreSchema.parse(0.5)).not.toThrow();
      expect(() => confidenceScoreSchema.parse(1)).not.toThrow();
    });

    it('should reject out-of-range confidence scores', () => {
      expect(() => confidenceScoreSchema.parse(-0.1)).toThrow(ZodError);
      expect(() => confidenceScoreSchema.parse(1.1)).toThrow(ZodError);
    });

    it('should validate probability (0-1)', () => {
      expect(() => probabilitySchema.parse(0)).not.toThrow();
      expect(() => probabilitySchema.parse(0.75)).not.toThrow();
      expect(() => probabilitySchema.parse(1)).not.toThrow();
    });

    it('should reject out-of-range probabilities', () => {
      expect(() => probabilitySchema.parse(-0.1)).toThrow(ZodError);
      expect(() => probabilitySchema.parse(1.5)).toThrow(ZodError);
    });

    it('should validate score (0-10)', () => {
      expect(() => scoreSchema.parse(0)).not.toThrow();
      expect(() => scoreSchema.parse(5)).not.toThrow();
      expect(() => scoreSchema.parse(10)).not.toThrow();
    });

    it('should reject out-of-range scores', () => {
      expect(() => scoreSchema.parse(-1)).toThrow(ZodError);
      expect(() => scoreSchema.parse(11)).toThrow(ZodError);
    });

    it('should validate weight (0 or higher)', () => {
      expect(() => weightSchema.parse(0)).not.toThrow();
      expect(() => weightSchema.parse(1.5)).not.toThrow();
    });

    it('should reject negative weights', () => {
      expect(() => weightSchema.parse(-0.1)).toThrow(ZodError);
    });

    it('should validate positive numbers', () => {
      expect(() => positiveNumberSchema.parse(1)).not.toThrow();
      expect(() => positiveNumberSchema.parse(100.5)).not.toThrow();
    });

    it('should reject zero and negative numbers for positive schema', () => {
      expect(() => positiveNumberSchema.parse(0)).toThrow(ZodError);
      expect(() => positiveNumberSchema.parse(-1)).toThrow(ZodError);
    });

    it('should validate non-negative numbers', () => {
      expect(() => nonNegativeNumberSchema.parse(0)).not.toThrow();
      expect(() => nonNegativeNumberSchema.parse(5)).not.toThrow();
    });

    it('should reject negative numbers for non-negative schema', () => {
      expect(() => nonNegativeNumberSchema.parse(-1)).toThrow(ZodError);
    });
  });

  describe('String Pattern Schemas', () => {
    it('should validate non-empty strings', () => {
      expect(() => nonEmptyStringSchema.parse('test')).not.toThrow();
      expect(() => nonEmptyStringSchema.parse('a')).not.toThrow();
    });

    it('should reject empty strings', () => {
      expect(() => nonEmptyStringSchema.parse('')).toThrow(ZodError);
    });

    it('should validate IDs', () => {
      expect(() => idSchema.parse('id-123')).not.toThrow();
      expect(() => idSchema.parse('abc')).not.toThrow();
    });

    it('should reject empty IDs', () => {
      expect(() => idSchema.parse('')).toThrow(ZodError);
    });

    it('should validate required string arrays', () => {
      expect(() => requiredStringArraySchema.parse(['item1'])).not.toThrow();
      expect(() => requiredStringArraySchema.parse(['item1', 'item2'])).not.toThrow();
    });

    it('should reject empty required string arrays', () => {
      expect(() => requiredStringArraySchema.parse([])).toThrow(ZodError);
    });

    it('should validate optional string arrays', () => {
      expect(() => optionalStringArraySchema.parse(['item'])).not.toThrow();
      expect(() => optionalStringArraySchema.parse(undefined)).not.toThrow();
    });
  });
});

// ============================================================================
// Trace Tool Schema Tests
// ============================================================================

describe('ThoughtData Schema', () => {
  const validThought = {
    thought: 'This is a valid thought',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
  };

  it('should validate valid thought data', () => {
    expect(() => thoughtDataSchema.parse(validThought)).not.toThrow();
  });

  it('should validate thought with optional fields', () => {
    const thoughtWithOptional = {
      ...validThought,
      isRevision: true,
      revisesThought: 1,
      branchFromThought: 2,
      branchId: 'branch-a',
      needsMoreThoughts: true,
    };
    expect(() => thoughtDataSchema.parse(thoughtWithOptional)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => thoughtDataSchema.parse({ thought: 'test' })).toThrow(ZodError);
    expect(() => thoughtDataSchema.parse({ thoughtNumber: 1 })).toThrow(ZodError);
  });

  it('should reject invalid thought number types', () => {
    expect(() =>
      thoughtDataSchema.parse({ ...validThought, thoughtNumber: 'one' })
    ).toThrow(ZodError);
  });

  it('should reject empty thought string', () => {
    expect(() =>
      thoughtDataSchema.parse({ ...validThought, thought: '' })
    ).toThrow(ZodError);
  });

  it('should reject non-integer thought numbers', () => {
    expect(() =>
      thoughtDataSchema.parse({ ...validThought, thoughtNumber: 1.5 })
    ).toThrow(ZodError);
  });

  it('should reject zero or negative thought numbers', () => {
    expect(() =>
      thoughtDataSchema.parse({ ...validThought, thoughtNumber: 0 })
    ).toThrow(ZodError);
    expect(() =>
      thoughtDataSchema.parse({ ...validThought, thoughtNumber: -1 })
    ).toThrow(ZodError);
  });
});

// ============================================================================
// Model Tool Schema Tests
// ============================================================================

describe('MentalModelData Schema', () => {
  const validModel = {
    modelName: 'First Principles Thinking',
    problem: 'How to solve this complex issue',
    steps: ['Break down assumptions', 'Question each part', 'Rebuild from basics'],
    reasoning: 'By breaking down the problem...',
    conclusion: 'The core issue is...',
  };

  it('should validate valid mental model data', () => {
    expect(() => mentalModelDataSchema.parse(validModel)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() =>
      mentalModelDataSchema.parse({ modelName: 'test' })
    ).toThrow(ZodError);
  });

  it('should reject empty model name', () => {
    expect(() =>
      mentalModelDataSchema.parse({ ...validModel, modelName: '' })
    ).toThrow(ZodError);
  });

  it('should reject empty steps array', () => {
    expect(() =>
      mentalModelDataSchema.parse({ ...validModel, steps: [] })
    ).toThrow(ZodError);
  });

  it('should reject empty strings in required fields', () => {
    expect(() =>
      mentalModelDataSchema.parse({ ...validModel, problem: '' })
    ).toThrow(ZodError);
    expect(() =>
      mentalModelDataSchema.parse({ ...validModel, reasoning: '' })
    ).toThrow(ZodError);
    expect(() =>
      mentalModelDataSchema.parse({ ...validModel, conclusion: '' })
    ).toThrow(ZodError);
  });
});

// ============================================================================
// Debug Tool Schema Tests
// ============================================================================

describe('DebuggingApproachData Schema', () => {
  const validApproach = {
    approachName: 'Binary Search',
    issue: 'Application crashes on startup',
    steps: ['Check logs', 'Isolate the component', 'Test fix'],
    findings: 'The issue was in the initialization',
    resolution: 'Fixed by reordering initialization',
  };

  it('should validate valid debugging approach data', () => {
    expect(() => debuggingApproachDataSchema.parse(validApproach)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() =>
      debuggingApproachDataSchema.parse({ approachName: 'test' })
    ).toThrow(ZodError);
  });

  it('should reject empty steps array', () => {
    expect(() =>
      debuggingApproachDataSchema.parse({ ...validApproach, steps: [] })
    ).toThrow(ZodError);
  });

  it('should reject empty strings in required fields', () => {
    expect(() =>
      debuggingApproachDataSchema.parse({ ...validApproach, approachName: '' })
    ).toThrow(ZodError);
  });
});

// ============================================================================
// Pattern Tool Schema Tests
// ============================================================================

describe('DesignPatternData Schema', () => {
  const validPattern = {
    patternName: 'Observer Pattern',
    context: 'When you need to notify multiple objects',
    implementation: 'Create subject and observer interfaces...',
    benefits: ['Loose coupling', 'Flexible communication'],
    tradeoffs: ['Complexity', 'Performance overhead'],
  };

  it('should validate valid design pattern data', () => {
    expect(() => designPatternDataSchema.parse(validPattern)).not.toThrow();
  });

  it('should validate pattern with optional fields', () => {
    const patternWithOptional = {
      ...validPattern,
      codeExample: 'class Subject {...}',
      languages: ['JavaScript', 'TypeScript'],
    };
    expect(() => designPatternDataSchema.parse(patternWithOptional)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() =>
      designPatternDataSchema.parse({ patternName: 'test' })
    ).toThrow(ZodError);
  });

  it('should reject empty arrays for required array fields', () => {
    expect(() =>
      designPatternDataSchema.parse({ ...validPattern, benefits: [] })
    ).toThrow(ZodError);
    expect(() =>
      designPatternDataSchema.parse({ ...validPattern, tradeoffs: [] })
    ).toThrow(ZodError);
  });
});

// ============================================================================
// Paradigm Tool Schema Tests
// ============================================================================

describe('ProgrammingParadigmData Schema', () => {
  const validParadigm = {
    paradigmName: 'Functional Programming',
    problem: 'Managing state in complex applications',
    approach: 'Use pure functions and immutable data',
    benefits: ['Predictability', 'Testability', 'Concurrency'],
    limitations: ['Learning curve', 'Performance in some cases'],
  };

  it('should validate valid programming paradigm data', () => {
    expect(() => programmingParadigmDataSchema.parse(validParadigm)).not.toThrow();
  });

  it('should validate paradigm with optional fields', () => {
    const paradigmWithOptional = {
      ...validParadigm,
      codeExample: 'const add = (a, b) => a + b',
      languages: ['Haskell', 'JavaScript'],
    };
    expect(() => programmingParadigmDataSchema.parse(paradigmWithOptional)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() =>
      programmingParadigmDataSchema.parse({ paradigmName: 'test' })
    ).toThrow(ZodError);
  });

  it('should reject empty arrays for required array fields', () => {
    expect(() =>
      programmingParadigmDataSchema.parse({ ...validParadigm, benefits: [] })
    ).toThrow(ZodError);
    expect(() =>
      programmingParadigmDataSchema.parse({ ...validParadigm, limitations: [] })
    ).toThrow(ZodError);
  });
});

// ============================================================================
// Council Tool Schema Tests
// ============================================================================

describe('Council Tool Schemas', () => {
  const validPersona = {
    id: 'persona-1',
    name: 'Technical Expert',
    expertise: ['Software Architecture', 'Security'],
    background: 'Senior engineer with 10 years experience',
    perspective: 'Focus on technical feasibility and best practices',
    biases: ['Tendency to over-engineer'],
    communication: {
      style: 'Direct and technical',
      tone: 'Professional',
    },
  };

  const validContribution = {
    personaId: 'persona-1',
    content: 'We should consider security implications',
    type: 'concern' as const,
    confidence: 0.8,
  };

  const validDisagreement = {
    topic: 'Best technology choice',
    positions: [
      {
        personaId: 'persona-1',
        position: 'Use React',
        arguments: ['Large ecosystem', 'Team familiarity'],
      },
    ],
  };

  describe('PersonaData Schema', () => {
    it('should validate valid persona data', () => {
      expect(() => personaDataSchema.parse(validPersona)).not.toThrow();
    });

    it('should validate persona with optional fields', () => {
      const personaWithOptional = {
        ...validPersona,
        category: 'technical' as const,
        tags: ['architecture', 'security'],
        concerns: ['Performance', 'Scalability'],
        typicalQuestions: ['Have you considered edge cases?'],
      };
      expect(() => personaDataSchema.parse(personaWithOptional)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      expect(() => personaDataSchema.parse({ id: 'test' })).toThrow(ZodError);
    });

    it('should reject invalid communication object', () => {
      expect(() =>
        personaDataSchema.parse({ ...validPersona, communication: {} })
      ).toThrow(ZodError);
    });
  });

  describe('ContributionData Schema', () => {
    it('should validate valid contribution data', () => {
      expect(() => contributionDataSchema.parse(validContribution)).not.toThrow();
    });

    it('should validate contribution with optional fields', () => {
      const contributionWithOptional = {
        ...validContribution,
        referenceIds: ['contrib-1', 'contrib-2'],
      };
      expect(() =>
        contributionDataSchema.parse(contributionWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid contribution type', () => {
      expect(() =>
        contributionDataSchema.parse({ ...validContribution, type: 'invalid' })
      ).toThrow(ZodError);
    });

    it('should reject out-of-range confidence', () => {
      expect(() =>
        contributionDataSchema.parse({ ...validContribution, confidence: 1.5 })
      ).toThrow(ZodError);
    });
  });

  describe('DisagreementData Schema', () => {
    it('should validate valid disagreement data', () => {
      expect(() => disagreementDataSchema.parse(validDisagreement)).not.toThrow();
    });

    it('should reject missing topic', () => {
      expect(() =>
        disagreementDataSchema.parse({ positions: [] })
      ).toThrow(ZodError);
    });
  });

  describe('CollaborativeReasoningData Schema', () => {
    const validReasoning = {
      topic: 'System architecture review',
      personas: [validPersona],
      contributions: [validContribution],
      stage: 'ideation' as const,
      activePersonaId: 'persona-1',
      sessionId: 'session-123',
      iteration: 1,
      nextContributionNeeded: true,
    };

    it('should validate valid collaborative reasoning data', () => {
      expect(() =>
        collaborativeReasoningDataSchema.parse(validReasoning)
      ).not.toThrow();
    });

    it('should validate reasoning with optional fields', () => {
      const reasoningWithOptional = {
        ...validReasoning,
        nextPersonaId: 'persona-2',
        consensusPoints: ['Point 1'],
        disagreements: [validDisagreement],
        keyInsights: ['Insight 1'],
        openQuestions: ['Question 1'],
        finalRecommendation: 'Proceed with option A',
        suggestedContributionTypes: ['observation', 'question'],
      };
      expect(() =>
        collaborativeReasoningDataSchema.parse(reasoningWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid stage', () => {
      expect(() =>
        collaborativeReasoningDataSchema.parse({
          ...validReasoning,
          stage: 'invalid',
        })
      ).toThrow(ZodError);
    });
  });
});

// ============================================================================
// Decide Tool Schema Tests
// ============================================================================

describe('Decide Tool Schemas', () => {
  const validOption = {
    id: 'option-1',
    name: 'Option A',
    description: 'First option to consider',
  };

  const validCriterion = {
    id: 'criterion-1',
    name: 'Cost',
    description: 'Total cost of implementation',
    weight: 0.8,
  };

  const validOutcome = {
    id: 'outcome-1',
    description: 'High success scenario',
    probability: 0.7,
    value: 100,
    optionId: 'option-1',
    confidenceInEstimate: 0.8,
  };

  describe('OptionData Schema', () => {
    it('should validate valid option data', () => {
      expect(() => optionDataSchema.parse(validOption)).not.toThrow();
    });

    it('should reject missing fields', () => {
      expect(() => optionDataSchema.parse({ id: 'test' })).toThrow(ZodError);
    });
  });

  describe('CriterionData Schema', () => {
    it('should validate valid criterion data', () => {
      expect(() => criterionDataSchema.parse(validCriterion)).not.toThrow();
    });

    it('should reject negative weight', () => {
      expect(() =>
        criterionDataSchema.parse({ ...validCriterion, weight: -1 })
      ).toThrow(ZodError);
    });
  });

  describe('OutcomeData Schema', () => {
    it('should validate valid outcome data', () => {
      expect(() => outcomeDataSchema.parse(validOutcome)).not.toThrow();
    });

    it('should reject out-of-range probability', () => {
      expect(() =>
        outcomeDataSchema.parse({ ...validOutcome, probability: 1.5 })
      ).toThrow(ZodError);
    });
  });

  describe('EisenhowerClassification Schema', () => {
    const validClassification = {
      optionId: 'option-1',
      urgency: 8,
      importance: 9,
      quadrant: 'do-first' as const,
    };

    it('should validate valid classification', () => {
      expect(() =>
        eisenhowerClassificationSchema.parse(validClassification)
      ).not.toThrow();
    });

    it('should reject invalid quadrant', () => {
      expect(() =>
        eisenhowerClassificationSchema.parse({
          ...validClassification,
          quadrant: 'invalid',
        })
      ).toThrow(ZodError);
    });

    it('should reject out-of-range scores', () => {
      expect(() =>
        eisenhowerClassificationSchema.parse({
          ...validClassification,
          urgency: 11,
        })
      ).toThrow(ZodError);
    });
  });

  describe('CostBenefitAnalysis Schema', () => {
    const validAnalysis = {
      optionId: 'option-1',
      costs: [
        {
          optionId: 'option-1',
          description: 'Development cost',
          amount: 50000,
          type: 'monetary' as const,
        },
      ],
      benefits: [
        {
          optionId: 'option-1',
          description: 'Revenue increase',
          amount: 100000,
          type: 'monetary' as const,
        },
      ],
      netValue: 50000,
    };

    it('should validate valid cost-benefit analysis', () => {
      expect(() => costBenefitAnalysisSchema.parse(validAnalysis)).not.toThrow();
    });

    it('should validate analysis with optional financial metrics', () => {
      const analysisWithMetrics = {
        ...validAnalysis,
        benefitCostRatio: 2.0,
        roi: 1.0,
        discountRate: 0.05,
        timePeriodYears: 5,
        npv: 45000,
      };
      expect(() =>
        costBenefitAnalysisSchema.parse(analysisWithMetrics)
      ).not.toThrow();
    });
  });

  describe('RiskItem Schema', () => {
    const validRisk = {
      optionId: 'option-1',
      description: 'Technical failure',
      probability: 0.2,
      impact: 8,
      riskScore: 1.6,
    };

    it('should validate valid risk item', () => {
      expect(() => riskItemSchema.parse(validRisk)).not.toThrow();
    });

    it('should validate risk with optional fields', () => {
      const riskWithOptional = {
        ...validRisk,
        category: 'technical',
        mitigation: 'Implement backup systems',
      };
      expect(() => riskItemSchema.parse(riskWithOptional)).not.toThrow();
    });
  });

  describe('ReversibilityData Schema', () => {
    const validReversibility = {
      optionId: 'option-1',
      reversibilityScore: 7,
      undoCost: 10000,
      timeToReverse: '2 weeks',
      doorType: 'two-way' as const,
    };

    it('should validate valid reversibility data', () => {
      expect(() =>
        reversibilityDataSchema.parse(validReversibility)
      ).not.toThrow();
    });

    it('should reject invalid door type', () => {
      expect(() =>
        reversibilityDataSchema.parse({ ...validReversibility, doorType: 'invalid' })
      ).toThrow(ZodError);
    });
  });

  describe('RegretMinimizationData Schema', () => {
    const validRegret = {
      optionId: 'option-1',
      futureSelfPerspective: 'Looking back, I would be proud of this choice',
      potentialRegrets: ['Might miss other opportunities'],
    };

    it('should validate valid regret minimization data', () => {
      expect(() => regretMinimizationDataSchema.parse(validRegret)).not.toThrow();
    });

    it('should validate regret with optional fields', () => {
      const regretWithOptional = {
        ...validRegret,
        regretScore: 3,
        timeHorizonAnalysis: {
          tenMinutes: 'No regret',
          tenMonths: 'Slight concern',
          tenYears: 'Confident in choice',
        },
      };
      expect(() =>
        regretMinimizationDataSchema.parse(regretWithOptional)
      ).not.toThrow();
    });
  });

  describe('DecisionFrameworkData Schema', () => {
    const validDecision = {
      decisionStatement: 'Choose the best cloud provider',
      options: [validOption],
      analysisType: 'weighted-criteria' as const,
      stage: 'evaluation' as const,
      decisionId: 'decision-123',
      iteration: 1,
      nextStageNeeded: true,
    };

    it('should validate valid decision framework data', () => {
      expect(() =>
        decisionFrameworkDataSchema.parse(validDecision)
      ).not.toThrow();
    });

    it('should reject invalid analysis type', () => {
      expect(() =>
        decisionFrameworkDataSchema.parse({
          ...validDecision,
          analysisType: 'invalid',
        })
      ).toThrow(ZodError);
    });

    it('should reject invalid stage', () => {
      expect(() =>
        decisionFrameworkDataSchema.parse({ ...validDecision, stage: 'invalid' })
      ).toThrow(ZodError);
    });
  });
});

// ============================================================================
// Debate Tool Schema Tests
// ============================================================================

describe('ArgumentData Schema', () => {
  const validArgument = {
    claim: 'AI will transform software development',
    premises: [
      'AI can automate repetitive tasks',
      'AI improves code quality through analysis',
    ],
    conclusion: 'Therefore, developers should learn to work with AI',
    argumentType: 'thesis' as const,
    confidence: 0.8,
    nextArgumentNeeded: true,
  };

  it('should validate valid argument data', () => {
    expect(() => argumentDataSchema.parse(validArgument)).not.toThrow();
  });

  it('should validate argument with optional fields', () => {
    const argumentWithOptional = {
      ...validArgument,
      argumentId: 'arg-1',
      respondsTo: 'arg-0',
      supports: ['arg-2'],
      contradicts: ['arg-3'],
      strengths: ['Well-reasoned', 'Evidence-based'],
      weaknesses: ['Limited scope'],
      suggestedNextTypes: ['objection', 'rebuttal'],
    };
    expect(() => argumentDataSchema.parse(argumentWithOptional)).not.toThrow();
  });

  it('should reject invalid argument type', () => {
    expect(() =>
      argumentDataSchema.parse({ ...validArgument, argumentType: 'invalid' })
    ).toThrow(ZodError);
  });

  it('should reject empty premises array', () => {
    expect(() =>
      argumentDataSchema.parse({ ...validArgument, premises: [] })
    ).toThrow(ZodError);
  });

  it('should reject out-of-range confidence', () => {
    expect(() =>
      argumentDataSchema.parse({ ...validArgument, confidence: 1.5 })
    ).toThrow(ZodError);
  });
});

// ============================================================================
// Reflect Tool Schema Tests
// ============================================================================

describe('Reflect Tool Schemas', () => {
  const validKnowledgeAssessment = {
    domain: 'Machine Learning',
    knowledgeLevel: 'proficient' as const,
    confidenceScore: 0.75,
    supportingEvidence: [
      'Completed ML course',
      'Built several projects',
    ],
    knownLimitations: [
      'Limited experience with deep learning',
      'Unfamiliar with latest frameworks',
    ],
  };

  const validClaimAssessment = {
    claim: 'Neural networks are effective for image classification',
    status: 'fact' as const,
    confidenceScore: 0.95,
    evidenceBasis: [
      'Peer-reviewed research',
      'Industry adoption',
    ],
  };

  const validReasoningAssessment = {
    step: 'If we increase training data, accuracy will improve',
    potentialBiases: ['Confirmation bias'],
    assumptions: ['Data quality is consistent'],
    logicalValidity: 0.85,
    inferenceStrength: 0.8,
  };

  describe('KnowledgeAssessment Schema', () => {
    it('should validate valid knowledge assessment', () => {
      expect(() =>
        knowledgeAssessmentSchema.parse(validKnowledgeAssessment)
      ).not.toThrow();
    });

    it('should validate assessment with optional fields', () => {
      const assessmentWithOptional = {
        ...validKnowledgeAssessment,
        relevantTrainingCutoff: '2023-04-01',
      };
      expect(() =>
        knowledgeAssessmentSchema.parse(assessmentWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid knowledge level', () => {
      expect(() =>
        knowledgeAssessmentSchema.parse({
          ...validKnowledgeAssessment,
          knowledgeLevel: 'invalid',
        })
      ).toThrow(ZodError);
    });
  });

  describe('ClaimAssessment Schema', () => {
    it('should validate valid claim assessment', () => {
      expect(() => claimAssessmentSchema.parse(validClaimAssessment)).not.toThrow();
    });

    it('should validate assessment with optional fields', () => {
      const assessmentWithOptional = {
        ...validClaimAssessment,
        falsifiabilityCriteria: 'Can be tested through controlled experiments',
        alternativeInterpretations: ['Could be due to other factors'],
      };
      expect(() =>
        claimAssessmentSchema.parse(assessmentWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid claim status', () => {
      expect(() =>
        claimAssessmentSchema.parse({ ...validClaimAssessment, status: 'invalid' })
      ).toThrow(ZodError);
    });
  });

  describe('ReasoningAssessment Schema', () => {
    it('should validate valid reasoning assessment', () => {
      expect(() =>
        reasoningAssessmentSchema.parse(validReasoningAssessment)
      ).not.toThrow();
    });

    it('should reject out-of-range validity score', () => {
      expect(() =>
        reasoningAssessmentSchema.parse({
          ...validReasoningAssessment,
          logicalValidity: 1.5,
        })
      ).toThrow(ZodError);
    });
  });

  describe('MetacognitiveMonitoringData Schema', () => {
    const validMonitoring = {
      task: 'Evaluate the feasibility of the new feature',
      stage: 'evaluation' as const,
      overallConfidence: 0.8,
      uncertaintyAreas: ['Time estimation', 'Resource availability'],
      recommendedApproach: 'Start with a prototype',
      monitoringId: 'monitor-123',
      iteration: 1,
      nextAssessmentNeeded: true,
    };

    it('should validate valid metacognitive monitoring data', () => {
      expect(() =>
        metacognitiveMonitoringDataSchema.parse(validMonitoring)
      ).not.toThrow();
    });

    it('should validate monitoring with optional fields', () => {
      const monitoringWithOptional = {
        ...validMonitoring,
        knowledgeAssessment: [validKnowledgeAssessment],
        claims: [validClaimAssessment],
        reasoningSteps: [validReasoningAssessment],
        suggestedAssessments: ['knowledge', 'claim'],
      };
      expect(() =>
        metacognitiveMonitoringDataSchema.parse(monitoringWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid stage', () => {
      expect(() =>
        metacognitiveMonitoringDataSchema.parse({
          ...validMonitoring,
          stage: 'invalid',
        })
      ).toThrow(ZodError);
    });
  });
});

// ============================================================================
// Hypothesis Tool Schema Tests
// ============================================================================

describe('Hypothesis Tool Schemas', () => {
  const validVariable = {
    name: 'Temperature',
    type: 'independent' as const,
  };

  const validPrediction = {
    if: 'temperature increases',
    then: 'reaction rate will increase',
  };

  const validHypothesis = {
    statement: 'Higher temperatures increase reaction rates',
    variables: [validVariable],
    assumptions: ['Constant pressure', 'Pure reactants'],
    hypothesisId: 'hyp-1',
    confidence: 0.8,
    domain: 'Chemistry',
    iteration: 1,
    status: 'proposed' as const,
  };

  const validExperiment = {
    design: 'Control temperature while measuring reaction rate',
    methodology: 'Use thermometer and stopwatch',
    predictions: [validPrediction],
    experimentId: 'exp-1',
    hypothesisId: 'hyp-1',
    controlMeasures: ['Constant pressure', 'Same reactants'],
  };

  describe('Variable Schema', () => {
    it('should validate valid variable', () => {
      expect(() => variableSchema.parse(validVariable)).not.toThrow();
    });

    it('should validate variable with optional fields', () => {
      const variableWithOptional = {
        ...validVariable,
        operationalization: 'Measured in Celsius',
      };
      expect(() => variableSchema.parse(variableWithOptional)).not.toThrow();
    });

    it('should reject invalid variable type', () => {
      expect(() =>
        variableSchema.parse({ ...validVariable, type: 'invalid' })
      ).toThrow(ZodError);
    });
  });

  describe('Prediction Schema', () => {
    it('should validate valid prediction', () => {
      expect(() => predictionSchema.parse(validPrediction)).not.toThrow();
    });

    it('should validate prediction with else clause', () => {
      const predictionWithElse = {
        ...validPrediction,
        else: 'reaction rate will decrease',
      };
      expect(() => predictionSchema.parse(predictionWithElse)).not.toThrow();
    });

    it('should reject missing if/then', () => {
      expect(() => predictionSchema.parse({ if: 'test' })).toThrow(ZodError);
    });
  });

  describe('HypothesisData Schema', () => {
    it('should validate valid hypothesis data', () => {
      expect(() => hypothesisDataSchema.parse(validHypothesis)).not.toThrow();
    });

    it('should validate hypothesis with optional fields', () => {
      const hypothesisWithOptional = {
        ...validHypothesis,
        alternativeTo: 'hyp-0',
        refinementOf: 'hyp-base',
      };
      expect(() =>
        hypothesisDataSchema.parse(hypothesisWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid status', () => {
      expect(() =>
        hypothesisDataSchema.parse({ ...validHypothesis, status: 'invalid' })
      ).toThrow(ZodError);
    });
  });

  describe('ExperimentData Schema', () => {
    it('should validate valid experiment data', () => {
      expect(() => experimentDataSchema.parse(validExperiment)).not.toThrow();
    });

    it('should validate experiment with optional fields', () => {
      const experimentWithOptional = {
        ...validExperiment,
        results: 'Confirmed hypothesis',
        outcomeMatched: true,
        unexpectedObservations: ['Color change observed'],
        limitations: ['Small sample size'],
        nextSteps: ['Repeat with larger sample'],
      };
      expect(() =>
        experimentDataSchema.parse(experimentWithOptional)
      ).not.toThrow();
    });

    it('should reject empty predictions', () => {
      expect(() =>
        experimentDataSchema.parse({ ...validExperiment, predictions: [] })
      ).toThrow(ZodError);
    });
  });

  describe('ScientificInquiryData Schema', () => {
    const validInquiry = {
      stage: 'hypothesis' as const,
      inquiryId: 'inquiry-1',
      iteration: 1,
      nextStageNeeded: true,
    };

    it('should validate valid scientific inquiry data', () => {
      expect(() =>
        scientificInquiryDataSchema.parse(validInquiry)
      ).not.toThrow();
    });

    it('should validate inquiry with optional stage fields', () => {
      const inquiryWithOptional = {
        ...validInquiry,
        observation: 'Water boils at different temperatures',
        question: 'Why does this happen?',
        hypothesis: validHypothesis,
        experiment: validExperiment,
        analysis: 'Data supports hypothesis',
        conclusion: 'Hypothesis confirmed',
      };
      expect(() =>
        scientificInquiryDataSchema.parse(inquiryWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid stage', () => {
      expect(() =>
        scientificInquiryDataSchema.parse({ ...validInquiry, stage: 'invalid' })
      ).toThrow(ZodError);
    });
  });
});

// ============================================================================
// Map Tool Schema Tests
// ============================================================================

describe('Map Tool Schemas', () => {
  const validElement = {
    id: 'node-1',
    type: 'node' as const,
    properties: { label: 'Start', x: 100, y: 200 },
  };

  describe('VisualElement Schema', () => {
    it('should validate valid visual element', () => {
      expect(() => visualElementSchema.parse(validElement)).not.toThrow();
    });

    it('should validate element with optional fields', () => {
      const elementWithOptional = {
        ...validElement,
        label: 'Start Node',
        source: 'node-0',
        target: 'node-2',
        contains: ['node-3', 'node-4'],
      };
      expect(() => visualElementSchema.parse(elementWithOptional)).not.toThrow();
    });

    it('should reject invalid element type', () => {
      expect(() =>
        visualElementSchema.parse({ ...validElement, type: 'invalid' })
      ).toThrow(ZodError);
    });

    it('should reject missing properties', () => {
      expect(() =>
        visualElementSchema.parse({ id: 'test', type: 'node' })
      ).toThrow(ZodError);
    });
  });

  describe('VisualOperationData Schema', () => {
    const validOperation = {
      operation: 'create' as const,
      diagramId: 'diagram-1',
      diagramType: 'flowchart' as const,
      iteration: 1,
      nextOperationNeeded: true,
    };

    it('should validate valid visual operation data', () => {
      expect(() =>
        visualOperationDataSchema.parse(validOperation)
      ).not.toThrow();
    });

    it('should validate operation with optional fields', () => {
      const operationWithOptional = {
        ...validOperation,
        elements: [validElement],
        transformationType: 'rotate' as const,
        observation: 'Pattern emerges',
        insight: 'Cycles detected',
        hypothesis: 'System has feedback loops',
      };
      expect(() =>
        visualOperationDataSchema.parse(operationWithOptional)
      ).not.toThrow();
    });

    it('should reject invalid operation type', () => {
      expect(() =>
        visualOperationDataSchema.parse({ ...validOperation, operation: 'invalid' })
      ).toThrow(ZodError);
    });

    it('should reject invalid diagram type', () => {
      expect(() =>
        visualOperationDataSchema.parse({
          ...validOperation,
          diagramType: 'invalid',
        })
      ).toThrow(ZodError);
    });
  });
});
