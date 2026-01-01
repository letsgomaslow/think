/**
 * Reflect Demo Data - Schema-aligned with MCP MetacognitiveMonitoringData
 *
 * MCP Schema Reference: /src/models/interfaces.ts (MetacognitiveMonitoringData)
 *
 * Key differences from previous implementation:
 * - Single knowledgeAssessment (not array)
 * - Full reasoningSteps[] with biases, assumptions, validity scores
 * - Enhanced claims with falsifiabilityCriteria and alternativeInterpretations
 * - Session tracking: monitoringId, iteration, nextAssessmentNeeded
 * - Stage progression visualization
 */

// ============================================================================
// Type Definitions (mirrors MCP schema exactly)
// ============================================================================

export type Stage =
  | 'knowledge-assessment'
  | 'planning'
  | 'execution'
  | 'monitoring'
  | 'evaluation'
  | 'reflection';

export type KnowledgeLevel =
  | 'expert'
  | 'proficient'
  | 'familiar'
  | 'basic'
  | 'minimal'
  | 'none';

export type ClaimStatus = 'fact' | 'inference' | 'speculation' | 'uncertain';

export type AssessmentType = 'knowledge' | 'claim' | 'reasoning' | 'overall';

export interface KnowledgeAssessment {
  domain: string;
  knowledgeLevel: KnowledgeLevel;
  confidenceScore: number;
  supportingEvidence: string;
  knownLimitations: string[];
  relevantTrainingCutoff?: string;
}

export interface ClaimAssessment {
  claim: string;
  status: ClaimStatus;
  confidenceScore: number;
  evidenceBasis: string;
  falsifiabilityCriteria?: string;
  alternativeInterpretations?: string[];
}

export interface ReasoningAssessment {
  step: string;
  potentialBiases: string[];
  assumptions: string[];
  logicalValidity: number;
  inferenceStrength: number;
}

export interface MetacognitiveMonitoringData {
  task: string;
  stage: Stage;
  knowledgeAssessment?: KnowledgeAssessment;
  claims?: ClaimAssessment[];
  reasoningSteps?: ReasoningAssessment[];
  overallConfidence: number;
  uncertaintyAreas: string[];
  recommendedApproach: string;
  monitoringId: string;
  iteration: number;
  suggestedAssessments?: AssessmentType[];
  nextAssessmentNeeded: boolean;
}

// ============================================================================
// Stage Metadata
// ============================================================================

export const STAGES: { id: Stage; label: string; description: string }[] = [
  { id: 'knowledge-assessment', label: 'Knowledge', description: 'Assess what you know and don\'t know' },
  { id: 'planning', label: 'Planning', description: 'Plan your approach' },
  { id: 'execution', label: 'Execution', description: 'Execute the plan' },
  { id: 'monitoring', label: 'Monitoring', description: 'Monitor progress' },
  { id: 'evaluation', label: 'Evaluation', description: 'Evaluate results' },
  { id: 'reflection', label: 'Reflection', description: 'Reflect on learnings' },
];

// ============================================================================
// Styling Helpers
// ============================================================================

export const knowledgeLevelStyles: Record<KnowledgeLevel, { color: string; width: string }> = {
  expert: { color: 'hsl(var(--brand-primary))', width: '100%' },
  proficient: { color: 'hsl(142 70% 55%)', width: '80%' },
  familiar: { color: 'hsl(45 93% 60%)', width: '60%' },
  basic: { color: 'hsl(25 90% 55%)', width: '40%' },
  minimal: { color: 'hsl(0 70% 55%)', width: '20%' },
  none: { color: 'hsl(0 0% 50%)', width: '5%' },
};

export const claimStatusStyles: Record<ClaimStatus, { color: string; bgColor: string; label: string }> = {
  fact: {
    color: 'hsl(var(--brand-primary))',
    bgColor: 'hsl(var(--brand-primary) / 0.15)',
    label: 'Fact'
  },
  inference: {
    color: 'hsl(45 93% 60%)',
    bgColor: 'hsl(45 93% 60% / 0.15)',
    label: 'Inference'
  },
  speculation: {
    color: 'hsl(25 90% 55%)',
    bgColor: 'hsl(25 90% 55% / 0.15)',
    label: 'Speculation'
  },
  uncertain: {
    color: 'hsl(0 70% 55%)',
    bgColor: 'hsl(0 70% 55% / 0.15)',
    label: 'Uncertain'
  },
};

// ============================================================================
// Demo Data: Leadership Readiness Self-Assessment
// ============================================================================

export const reflectDemoData: MetacognitiveMonitoringData = {
  task: "Am I ready for this leadership role? What are my blind spots?",
  stage: 'reflection',
  monitoringId: 'leadership-readiness-001',
  iteration: 3,
  overallConfidence: 0.78,
  nextAssessmentNeeded: false,

  knowledgeAssessment: {
    domain: 'Leadership Readiness Self-Assessment',
    knowledgeLevel: 'proficient',
    confidenceScore: 0.75,
    supportingEvidence: 'Completed systematic analysis across leadership competency dimensions with identified gaps and development priorities',
    knownLimitations: [
      'Self-assessment inherently limited by blind spots',
      'Cannot predict performance under novel stress conditions',
      'Organizational culture fit remains uncertain',
    ],
    relevantTrainingCutoff: '2024-01',
  },

  claims: [
    {
      claim: 'Core technical competencies are strong enough to maintain credibility',
      status: 'fact',
      confidenceScore: 0.88,
      evidenceBasis: 'Track record of successful project deliveries and peer recognition',
      falsifiabilityCriteria: 'Would be falsified if technical decisions are frequently overruled or questioned by peers',
      alternativeInterpretations: [
        'Technical depth may not translate to leadership credibility',
        'Domain expertise could create delegation resistance',
      ],
    },
    {
      claim: 'People management skills need deliberate development',
      status: 'inference',
      confidenceScore: 0.72,
      evidenceBasis: 'Limited formal leadership experience, primarily peer-level collaboration',
      falsifiabilityCriteria: 'Would be falsified by successful team leadership outcomes in first 6 months',
      alternativeInterpretations: [
        'Natural interpersonal skills may compensate',
        'Role may not require heavy people management initially',
      ],
    },
    {
      claim: 'Strategic thinking capability is underestimated',
      status: 'speculation',
      confidenceScore: 0.55,
      evidenceBasis: 'Have contributed to strategic discussions but not led them',
      falsifiabilityCriteria: 'Strategic initiative outcomes in first year would confirm or deny',
      alternativeInterpretations: [
        'May have strategic aptitude that hasn\'t been tested',
        'Strategic skills may emerge with proper mentorship',
      ],
    },
    {
      claim: 'Stress management under leadership pressure is adequate',
      status: 'uncertain',
      confidenceScore: 0.45,
      evidenceBasis: 'No direct experience with leadership-level accountability stress',
      falsifiabilityCriteria: 'Observable behavior during first high-stakes crisis',
      alternativeInterpretations: [
        'Past resilience may transfer to new context',
        'Support systems may buffer initial stress',
      ],
    },
  ],

  reasoningSteps: [
    {
      step: 'Identify core leadership competency dimensions (strategic thinking, people management, communication, decision-making, emotional intelligence)',
      potentialBiases: [
        'Western-centric leadership models',
        'Corporate bias in competency frameworks',
      ],
      assumptions: [
        'Universal leadership competencies exist',
        'Self-assessment provides valid data',
      ],
      logicalValidity: 0.80,
      inferenceStrength: 0.75,
    },
    {
      step: 'Assess current proficiency against each dimension using evidence-based indicators',
      potentialBiases: [
        'Dunning-Kruger effect in self-assessment',
        'Recency bias in evaluating past performance',
      ],
      assumptions: [
        'Past behavior predicts future performance',
        'Competencies are measurable',
      ],
      logicalValidity: 0.85,
      inferenceStrength: 0.70,
    },
    {
      step: 'Synthesize assessment findings into actionable readiness determination with prioritized development areas',
      potentialBiases: [
        'Optimism bias toward readiness',
        'Sunk cost from career investment',
      ],
      assumptions: [
        'Development gaps are addressable with effort',
        'Organization provides learning runway',
      ],
      logicalValidity: 0.85,
      inferenceStrength: 0.80,
    },
  ],

  uncertaintyAreas: [
    'Unknown unknowns that external feedback would reveal',
    'How stress impacts leadership behaviors under pressure',
    'Adaptability to organizational politics and influence dynamics',
    'Team chemistry with unknown direct reports',
  ],

  recommendedApproach: 'Seek 360-degree feedback from trusted colleagues, identify a leadership mentor, practice delegation in low-stakes situations before the role begins, and develop a 90-day learning plan for the new position.',

  suggestedAssessments: ['overall'],
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getStageIndex(stage: Stage): number {
  return STAGES.findIndex(s => s.id === stage);
}

export function isStageComplete(currentStage: Stage, checkStage: Stage): boolean {
  return getStageIndex(currentStage) > getStageIndex(checkStage);
}

export function isCurrentStage(currentStage: Stage, checkStage: Stage): boolean {
  return currentStage === checkStage;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'hsl(var(--brand-primary))';
  if (confidence >= 0.6) return 'hsl(142 70% 55%)';
  if (confidence >= 0.4) return 'hsl(45 93% 60%)';
  if (confidence >= 0.2) return 'hsl(25 90% 55%)';
  return 'hsl(0 70% 55%)';
}
