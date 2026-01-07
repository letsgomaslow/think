// ============================================================================
// Schema Index - Central Export Point for All Zod Schemas
// ============================================================================

// ============================================================================
// Common Schemas and Types
// ============================================================================
export {
  // Contribution Types (council tool)
  contributionTypeSchema,
  type ContributionType,

  // Argument Types (debate tool)
  argumentTypeSchema,
  type ArgumentType,

  // Variable Types (hypothesis tool)
  variableTypeSchema,
  type VariableType,

  // Visual Element Types (map tool)
  visualElementTypeSchema,
  type VisualElementType,

  // Visual Operation Types (map tool)
  visualOperationTypeSchema,
  type VisualOperationType,

  // Visual Transformation Types (map tool)
  visualTransformationTypeSchema,
  type VisualTransformationType,

  // Diagram Types (map tool)
  diagramTypeSchema,
  type DiagramType,

  // Stage Types
  collaborativeReasoningStageSchema,
  type CollaborativeReasoningStage,
  decisionFrameworkStageSchema,
  type DecisionFrameworkStage,
  metacognitiveMonitoringStageSchema,
  type MetacognitiveMonitoringStage,
  scientificInquiryStageSchema,
  type ScientificInquiryStage,

  // Analysis Types (decide tool)
  analysisTypeSchema,
  type AnalysisType,

  // Eisenhower Matrix Types (decide tool)
  eisenhowerQuadrantSchema,
  type EisenhowerQuadrant,

  // Cost-Benefit Types (decide tool)
  costBenefitTypeSchema,
  type CostBenefitType,

  // Reversibility Types (decide tool)
  doorTypeSchema,
  type DoorType,

  // Risk Tolerance (decide tool)
  riskToleranceSchema,
  type RiskTolerance,

  // Knowledge Level (reflect tool)
  knowledgeLevelSchema,
  type KnowledgeLevel,

  // Claim Status (reflect tool)
  claimStatusSchema,
  type ClaimStatus,

  // Hypothesis Status (hypothesis tool)
  hypothesisStatusSchema,
  type HypothesisStatus,

  // Persona Category (council tool)
  personaCategorySchema,
  type PersonaCategory,

  // Assessment Types (reflect tool)
  assessmentTypeSchema,
  type AssessmentType,

  // Common Numeric Constraints
  confidenceScoreSchema,
  weightSchema,
  probabilitySchema,
  scoreSchema,
  nonNegativeNumberSchema,
  positiveNumberSchema,

  // Common String Patterns
  nonEmptyStringSchema,
  idSchema,
  optionalStringArraySchema,
  requiredStringArraySchema,
} from './common.js';

// ============================================================================
// Trace Tool Schemas
// ============================================================================
export {
  thoughtDataSchema,
  type ThoughtData,
} from './trace.js';

// ============================================================================
// Model Tool Schemas
// ============================================================================
export {
  mentalModelDataSchema,
  type MentalModelData,
} from './model.js';

// ============================================================================
// Debug Tool Schemas
// ============================================================================
export {
  debuggingApproachDataSchema,
  type DebuggingApproachData,
} from './debug.js';

// ============================================================================
// Pattern Tool Schemas
// ============================================================================
export {
  designPatternDataSchema,
  type DesignPatternData,
} from './pattern.js';

// ============================================================================
// Paradigm Tool Schemas
// ============================================================================
export {
  programmingParadigmDataSchema,
  type ProgrammingParadigmData,
} from './paradigm.js';

// ============================================================================
// Council Tool Schemas
// ============================================================================
export {
  personaDataSchema,
  type PersonaData,
  contributionDataSchema,
  type ContributionData,
  disagreementDataSchema,
  type DisagreementData,
  collaborativeReasoningDataSchema,
  type CollaborativeReasoningData,
} from './council.js';

// ============================================================================
// Decide Tool Schemas
// ============================================================================
export {
  optionDataSchema,
  type OptionData,
  criterionDataSchema,
  type CriterionData,
  outcomeDataSchema,
  type OutcomeData,
  eisenhowerClassificationSchema,
  type EisenhowerClassification,
  costBenefitItemSchema,
  type CostBenefitItem,
  costBenefitAnalysisSchema,
  type CostBenefitAnalysis,
  riskItemSchema,
  type RiskItem,
  reversibilityDataSchema,
  type ReversibilityData,
  timeHorizonRegretSchema,
  type TimeHorizonRegret,
  regretMinimizationDataSchema,
  type RegretMinimizationData,
  decisionFrameworkDataSchema,
  type DecisionFrameworkData,
} from './decide.js';

// ============================================================================
// Debate Tool Schemas
// ============================================================================
export {
  argumentDataSchema,
  type ArgumentData,
} from './debate.js';

// ============================================================================
// Reflect Tool Schemas
// ============================================================================
export {
  knowledgeAssessmentSchema,
  type KnowledgeAssessment,
  claimAssessmentSchema,
  type ClaimAssessment,
  reasoningAssessmentSchema,
  type ReasoningAssessment,
  metacognitiveMonitoringDataSchema,
  type MetacognitiveMonitoringData,
} from './reflect.js';

// ============================================================================
// Hypothesis Tool Schemas
// ============================================================================
export {
  variableSchema,
  type Variable,
  predictionSchema,
  type Prediction,
  hypothesisDataSchema,
  type HypothesisData,
  experimentDataSchema,
  type ExperimentData,
  scientificInquiryDataSchema,
  type ScientificInquiryData,
} from './hypothesis.js';

// ============================================================================
// Map Tool Schemas
// ============================================================================
export {
  visualElementSchema,
  type VisualElement,
  visualOperationDataSchema,
  type VisualOperationData,
} from './map.js';
