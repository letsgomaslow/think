// Schema-aligned demo data for Decide tool visualization
// Based on actual MCP decide tool JSON response structure

export interface DecisionOption {
  id?: string;
  name: string;
  description: string;
}

export interface DecisionCriterion {
  id?: string;
  name: string;
  description: string;
  weight: number; // 0-1
}

export interface PossibleOutcome {
  id?: string;
  description: string;
  probability: number; // 0-1
  value: number;
  optionId: string;
  confidenceInEstimate: number; // 0-1
}

export type AnalysisType =
  | 'pros-cons'
  | 'weighted-criteria'
  | 'decision-tree'
  | 'expected-value'
  | 'scenario-analysis';

export type DecisionStage =
  | 'problem-definition'
  | 'options-generation'
  | 'criteria-definition'
  | 'evaluation'
  | 'sensitivity-analysis'
  | 'decision';

export type RiskTolerance = 'risk-averse' | 'risk-neutral' | 'risk-seeking';

export interface DecisionData {
  decisionStatement: string;
  options: DecisionOption[];
  analysisType: AnalysisType;
  stage: DecisionStage;
  decisionId: string;
  iteration: number;
  nextStageNeeded: boolean;
  criteria: DecisionCriterion[];
  stakeholders: string[];
  constraints: string[];
  timeHorizon: string;
  riskTolerance: RiskTolerance;
  possibleOutcomes: PossibleOutcome[];
  recommendation: string;
  rationale: string;
}

// Stage display configuration
export const DECISION_STAGES: { key: DecisionStage; label: string; shortLabel: string }[] = [
  { key: 'problem-definition', label: 'Problem Definition', shortLabel: 'Define' },
  { key: 'options-generation', label: 'Options Generation', shortLabel: 'Options' },
  { key: 'criteria-definition', label: 'Criteria Definition', shortLabel: 'Criteria' },
  { key: 'evaluation', label: 'Evaluation', shortLabel: 'Evaluate' },
  { key: 'sensitivity-analysis', label: 'Sensitivity Analysis', shortLabel: 'Analyze' },
  { key: 'decision', label: 'Decision', shortLabel: 'Decide' },
];

// Demo data: Cloud vendor selection for Executive/PM persona
export const decisionData: DecisionData = {
  decisionStatement: "Which vendor should we choose for our cloud infrastructure?",

  decisionId: "cloud-vendor-selection-001",
  iteration: 3,
  stage: "decision",
  nextStageNeeded: false,
  analysisType: "weighted-criteria",

  options: [
    {
      id: "aws",
      name: "AWS",
      description: "Amazon Web Services - market leader with broadest service portfolio and mature ecosystem"
    },
    {
      id: "azure",
      name: "Azure",
      description: "Microsoft Azure - strong enterprise integration, hybrid cloud capabilities, and Microsoft 365 synergy"
    },
    {
      id: "gcp",
      name: "GCP",
      description: "Google Cloud Platform - leading in AI/ML, data analytics, and Kubernetes-native architecture"
    },
  ],

  criteria: [
    {
      id: "cost",
      name: "Cost Efficiency",
      description: "Total cost of ownership including compute, storage, and egress",
      weight: 0.25
    },
    {
      id: "breadth",
      name: "Service Breadth",
      description: "Range of available services and features",
      weight: 0.20
    },
    {
      id: "enterprise",
      name: "Enterprise Integration",
      description: "Integration with existing enterprise tools and workflows",
      weight: 0.20
    },
    {
      id: "aiml",
      name: "AI/ML Capabilities",
      description: "Native AI/ML services and tooling",
      weight: 0.20
    },
    {
      id: "security",
      name: "Security & Compliance",
      description: "Security certifications and compliance frameworks",
      weight: 0.15
    },
  ],

  stakeholders: ["Engineering Team", "Finance", "DevOps", "Security", "Executive Leadership"],

  constraints: [
    "Must support multi-region deployment",
    "SOC 2 Type II and HIPAA compliance required",
    "Annual budget cap of $500,000",
    "Migration must complete within 6 months"
  ],

  timeHorizon: "3-5 years",
  riskTolerance: "risk-neutral",

  possibleOutcomes: [
    // AWS outcomes
    {
      id: "aws-cost",
      description: "Achieve 20% cost savings through Reserved Instances and Savings Plans",
      probability: 0.70,
      value: 8,
      optionId: "aws",
      confidenceInEstimate: 0.80,
    },
    {
      id: "aws-scale",
      description: "Leverage broadest global infrastructure for scalability",
      probability: 0.90,
      value: 9,
      optionId: "aws",
      confidenceInEstimate: 0.95,
    },
    // Azure outcomes
    {
      id: "azure-integration",
      description: "Seamless Microsoft 365 and Active Directory integration",
      probability: 0.95,
      value: 9,
      optionId: "azure",
      confidenceInEstimate: 0.90,
    },
    {
      id: "azure-hybrid",
      description: "Enable hybrid cloud architecture with Azure Arc",
      probability: 0.85,
      value: 8,
      optionId: "azure",
      confidenceInEstimate: 0.85,
    },
    // GCP outcomes
    {
      id: "gcp-aiml",
      description: "Access best-in-class BigQuery and Vertex AI for analytics",
      probability: 0.85,
      value: 9,
      optionId: "gcp",
      confidenceInEstimate: 0.90,
    },
    {
      id: "gcp-k8s",
      description: "Superior Kubernetes management with GKE autopilot",
      probability: 0.90,
      value: 8,
      optionId: "gcp",
      confidenceInEstimate: 0.92,
    },
  ],

  recommendation: "Azure",
  rationale: "Azure scores highest on weighted criteria with an expected value of 8.35, particularly excelling in enterprise integration (9.0) and migration ease (8.5) given your existing Microsoft ecosystem investment. The seamless Microsoft 365 integration addresses your primary workflow requirements, while Azure Arc provides a clear hybrid cloud path for future flexibility.",
};

// Helper function to get outcomes grouped by option
export function getOutcomesByOption(outcomes: PossibleOutcome[], optionId: string): PossibleOutcome[] {
  return outcomes.filter(o => o.optionId === optionId);
}

// Helper function to calculate expected value for an option
export function calculateExpectedValue(outcomes: PossibleOutcome[]): number {
  if (outcomes.length === 0) return 0;
  const total = outcomes.reduce((sum, o) => sum + (o.probability * o.value), 0);
  return total / outcomes.length;
}

// Helper function to get average confidence for an option
export function calculateAverageConfidence(outcomes: PossibleOutcome[]): number {
  if (outcomes.length === 0) return 0;
  const total = outcomes.reduce((sum, o) => sum + o.confidenceInEstimate, 0);
  return total / outcomes.length;
}

// Option colors for visualization
export const optionColors: Record<string, string> = {
  aws: "hsl(35 90% 55%)",      // Orange
  azure: "hsl(200 70% 55%)",    // Blue
  gcp: "hsl(142 70% 45%)",      // Green
};
