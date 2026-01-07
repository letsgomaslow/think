import { z } from 'zod';

// ============================================================================
// Contribution Types (council tool)
// ============================================================================

export const contributionTypeSchema = z.enum([
  "observation",
  "question",
  "insight",
  "concern",
  "suggestion",
  "challenge",
  "synthesis"
]);

export type ContributionType = z.infer<typeof contributionTypeSchema>;

// ============================================================================
// Argument Types (debate tool)
// ============================================================================

export const argumentTypeSchema = z.enum([
  "thesis",
  "antithesis",
  "synthesis",
  "objection",
  "rebuttal"
]);

export type ArgumentType = z.infer<typeof argumentTypeSchema>;

// ============================================================================
// Variable Types (hypothesis tool)
// ============================================================================

export const variableTypeSchema = z.enum([
  "independent",
  "dependent",
  "controlled",
  "confounding"
]);

export type VariableType = z.infer<typeof variableTypeSchema>;

// ============================================================================
// Visual Element Types (map tool)
// ============================================================================

export const visualElementTypeSchema = z.enum([
  "node",
  "edge",
  "container",
  "annotation"
]);

export type VisualElementType = z.infer<typeof visualElementTypeSchema>;

// ============================================================================
// Visual Operation Types (map tool)
// ============================================================================

export const visualOperationTypeSchema = z.enum([
  "create",
  "update",
  "delete",
  "transform",
  "observe"
]);

export type VisualOperationType = z.infer<typeof visualOperationTypeSchema>;

// ============================================================================
// Visual Transformation Types (map tool)
// ============================================================================

export const visualTransformationTypeSchema = z.enum([
  "rotate",
  "move",
  "resize",
  "recolor",
  "regroup"
]);

export type VisualTransformationType = z.infer<typeof visualTransformationTypeSchema>;

// ============================================================================
// Diagram Types (map tool)
// ============================================================================

export const diagramTypeSchema = z.enum([
  "graph",
  "flowchart",
  "stateDiagram",
  "conceptMap",
  "treeDiagram",
  "custom"
]);

export type DiagramType = z.infer<typeof diagramTypeSchema>;

// ============================================================================
// Stage Types
// ============================================================================

// Collaborative Reasoning Stages (council tool)
export const collaborativeReasoningStageSchema = z.enum([
  "problem-definition",
  "ideation",
  "critique",
  "integration",
  "decision",
  "reflection"
]);

export type CollaborativeReasoningStage = z.infer<typeof collaborativeReasoningStageSchema>;

// Decision Framework Stages (decide tool)
export const decisionFrameworkStageSchema = z.enum([
  "problem-definition",
  "options-generation",
  "criteria-definition",
  "evaluation",
  "sensitivity-analysis",
  "decision"
]);

export type DecisionFrameworkStage = z.infer<typeof decisionFrameworkStageSchema>;

// Metacognitive Monitoring Stages (reflect tool)
export const metacognitiveMonitoringStageSchema = z.enum([
  "knowledge-assessment",
  "planning",
  "execution",
  "monitoring",
  "evaluation",
  "reflection"
]);

export type MetacognitiveMonitoringStage = z.infer<typeof metacognitiveMonitoringStageSchema>;

// Scientific Inquiry Stages (hypothesis tool)
export const scientificInquiryStageSchema = z.enum([
  "observation",
  "question",
  "hypothesis",
  "experiment",
  "analysis",
  "conclusion",
  "iteration"
]);

export type ScientificInquiryStage = z.infer<typeof scientificInquiryStageSchema>;

// ============================================================================
// Analysis Types (decide tool)
// ============================================================================

export const analysisTypeSchema = z.enum([
  "pros-cons",
  "weighted-criteria",
  "decision-tree",
  "expected-value",
  "scenario-analysis",
  "eisenhower-matrix",
  "cost-benefit",
  "risk-assessment",
  "reversibility",
  "regret-minimization"
]);

export type AnalysisType = z.infer<typeof analysisTypeSchema>;

// ============================================================================
// Eisenhower Matrix Types (decide tool)
// ============================================================================

export const eisenhowerQuadrantSchema = z.enum([
  "do-first",
  "schedule",
  "delegate",
  "eliminate"
]);

export type EisenhowerQuadrant = z.infer<typeof eisenhowerQuadrantSchema>;

// ============================================================================
// Cost-Benefit Types (decide tool)
// ============================================================================

export const costBenefitTypeSchema = z.enum([
  "monetary",
  "non-monetary"
]);

export type CostBenefitType = z.infer<typeof costBenefitTypeSchema>;

// ============================================================================
// Reversibility Types (decide tool)
// ============================================================================

export const doorTypeSchema = z.enum([
  "one-way",
  "two-way"
]);

export type DoorType = z.infer<typeof doorTypeSchema>;

// ============================================================================
// Risk Tolerance (decide tool)
// ============================================================================

export const riskToleranceSchema = z.enum([
  "risk-averse",
  "risk-neutral",
  "risk-seeking"
]);

export type RiskTolerance = z.infer<typeof riskToleranceSchema>;

// ============================================================================
// Knowledge Level (reflect tool)
// ============================================================================

export const knowledgeLevelSchema = z.enum([
  "expert",
  "proficient",
  "familiar",
  "basic",
  "minimal",
  "none"
]);

export type KnowledgeLevel = z.infer<typeof knowledgeLevelSchema>;

// ============================================================================
// Claim Status (reflect tool)
// ============================================================================

export const claimStatusSchema = z.enum([
  "fact",
  "inference",
  "speculation",
  "uncertain"
]);

export type ClaimStatus = z.infer<typeof claimStatusSchema>;

// ============================================================================
// Hypothesis Status (hypothesis tool)
// ============================================================================

export const hypothesisStatusSchema = z.enum([
  "proposed",
  "testing",
  "supported",
  "refuted",
  "refined"
]);

export type HypothesisStatus = z.infer<typeof hypothesisStatusSchema>;

// ============================================================================
// Persona Category (council tool)
// ============================================================================

export const personaCategorySchema = z.enum([
  "technical",
  "business",
  "creative",
  "general"
]);

export type PersonaCategory = z.infer<typeof personaCategorySchema>;

// ============================================================================
// Assessment Types (reflect tool)
// ============================================================================

export const assessmentTypeSchema = z.enum([
  "knowledge",
  "claim",
  "reasoning",
  "overall"
]);

export type AssessmentType = z.infer<typeof assessmentTypeSchema>;

// ============================================================================
// Common Numeric Constraints
// ============================================================================

// Confidence score (0-1)
export const confidenceScoreSchema = z.number().min(0).max(1);

// Weight (typically 0-1 but can be higher in some cases)
export const weightSchema = z.number().min(0);

// Probability (0-1)
export const probabilitySchema = z.number().min(0).max(1);

// Score (0-10)
export const scoreSchema = z.number().min(0).max(10);

// Non-negative number
export const nonNegativeNumberSchema = z.number().min(0);

// Positive number
export const positiveNumberSchema = z.number().positive();

// ============================================================================
// Common String Patterns
// ============================================================================

// Non-empty string
export const nonEmptyStringSchema = z.string().min(1);

// ID pattern (non-empty string)
export const idSchema = z.string().min(1);

// Optional string array
export const optionalStringArraySchema = z.array(z.string()).optional();

// Required string array (at least one element)
export const requiredStringArraySchema = z.array(z.string()).min(1);
