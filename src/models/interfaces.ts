// Data Interfaces for think-mcp Server

// trace tool
export interface ThoughtData {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    isRevision?: boolean;
    revisesThought?: number;
    branchFromThought?: number;
    branchId?: string;
    needsMoreThoughts?: boolean;
    nextThoughtNeeded: boolean;
}

// model tool
export interface MentalModelData {
    modelName: string;
    problem: string;
    steps: string[];
    reasoning: string;
    conclusion: string;
}

// pattern tool
export interface DesignPatternData {
    patternName: string;
    context: string;
    implementation: string[];
    benefits: string[];
    tradeoffs: string[];
    codeExample?: string;
    languages?: string[];
}

// paradigm tool
export interface ProgrammingParadigmData {
    paradigmName: string;
    problem: string;
    approach: string[];
    benefits: string[];
    limitations: string[];
    codeExample?: string;
    languages?: string[];
}

// debug tool
export interface DebuggingApproachData {
    approachName: string;
    issue: string;
    steps: string[];
    findings: string;
    resolution: string;
}

// council tool
export interface PersonaData {
    id: string;
    name: string;
    expertise: string[];
    background: string;
    perspective: string;
    biases: string[];
    communication: {
        style: string;
        tone: string;
    };
    /**
     * Optional category for predefined personas from the persona library
     */
    category?: 'technical' | 'business' | 'creative' | 'general';
    /**
     * Optional tags for discovery and search (from persona library)
     */
    tags?: string[];
    /**
     * Optional typical concerns this persona raises (from persona library)
     */
    concerns?: string[];
    /**
     * Optional example questions this persona typically asks (from persona library)
     */
    typicalQuestions?: string[];
}

export interface ContributionData {
    personaId: string;
    content: string;
    type:
        | "observation"
        | "question"
        | "insight"
        | "concern"
        | "suggestion"
        | "challenge"
        | "synthesis";
    confidence: number;
    referenceIds?: string[];
}

export interface DisagreementData {
    topic: string;
    positions: {
        personaId: string;
        position: string;
        arguments: string[];
    }[];
}

export interface CollaborativeReasoningData {
    topic: string;
    personas: PersonaData[];
    contributions: ContributionData[];
    stage:
        | "problem-definition"
        | "ideation"
        | "critique"
        | "integration"
        | "decision"
        | "reflection";
    activePersonaId: string;
    nextPersonaId?: string;
    consensusPoints?: string[];
    disagreements?: DisagreementData[];
    keyInsights?: string[];
    openQuestions?: string[];
    finalRecommendation?: string;
    sessionId: string;
    iteration: number;
    suggestedContributionTypes?: (
        | "observation"
        | "question"
        | "insight"
        | "concern"
        | "suggestion"
        | "challenge"
        | "synthesis"
    )[];
    nextContributionNeeded: boolean;
}

// decide tool
export interface OptionData {
    id: string;
    name: string;
    description: string;
}

export interface CriterionData {
    id: string;
    name: string;
    description: string;
    weight: number;
}

export interface OutcomeData {
    id: string;
    description: string;
    probability: number;
    value: number;
    optionId: string;
    confidenceInEstimate: number;
}

export interface DecisionFrameworkData {
    decisionStatement: string;
    options: OptionData[];
    criteria?: CriterionData[];
    analysisType:
        | "pros-cons"
        | "weighted-criteria"
        | "decision-tree"
        | "expected-value"
        | "scenario-analysis"
        | "eisenhower-matrix"
        | "cost-benefit"
        | "risk-assessment"
        | "reversibility"
        | "regret-minimization";
    stage:
        | "problem-definition"
        | "options-generation"
        | "criteria-definition"
        | "evaluation"
        | "sensitivity-analysis"
        | "decision";
    stakeholders?: string[];
    constraints?: string[];
    timeHorizon?: string;
    riskTolerance?: "risk-averse" | "risk-neutral" | "risk-seeking";
    possibleOutcomes?: OutcomeData[];
    recommendation?: string;
    rationale?: string;
    decisionId: string;
    iteration: number;
    nextStageNeeded: boolean;
    eisenhowerClassification?: EisenhowerClassification[];
    costBenefitAnalysis?: CostBenefitAnalysis[];
    riskAssessment?: RiskItem[];
    reversibilityAnalysis?: ReversibilityData[];
    regretMinimizationAnalysis?: RegretMinimizationData[];
}

// Eisenhower Matrix types
export type EisenhowerQuadrant =
    | "do-first"
    | "schedule"
    | "delegate"
    | "eliminate";

export interface EisenhowerClassification {
    optionId: string;
    urgency: number;
    importance: number;
    quadrant: EisenhowerQuadrant;
}

// Cost-Benefit Analysis types
export type CostBenefitType = "monetary" | "non-monetary";

export interface CostBenefitItem {
    optionId: string;
    description: string;
    amount: number;
    type: CostBenefitType;
    category?: string;
    timeframe?: string;
}

export interface CostBenefitAnalysis {
    optionId: string;
    costs: CostBenefitItem[];
    benefits: CostBenefitItem[];
    netValue: number;
    benefitCostRatio?: number;
    roi?: number;
    discountRate?: number;
    timePeriodYears?: number;
    npv?: number;
}

// Risk Assessment Matrix types
export interface RiskItem {
    optionId: string;
    description: string;
    probability: number;
    impact: number;
    riskScore: number;
    category?: string;
    mitigation?: string[];
}

// Reversibility Analysis types
export type DoorType = "one-way" | "two-way";

export interface ReversibilityData {
    optionId: string;
    reversibilityScore: number;
    undoCost: number;
    timeToReverse: number;
    doorType: DoorType;
    undoComplexity?: string;
    reversibilityNotes?: string;
}

// Regret Minimization Framework types
export interface TimeHorizonRegret {
    tenMinutes: string;
    tenMonths: string;
    tenYears: string;
}

export interface RegretMinimizationData {
    optionId: string;
    futureSelfPerspective: string;
    potentialRegrets: TimeHorizonRegret;
    regretScore?: number;
    timeHorizonAnalysis?: string;
}

// reflect tool
export interface KnowledgeAssessment {
    domain: string;
    knowledgeLevel:
        | "expert"
        | "proficient"
        | "familiar"
        | "basic"
        | "minimal"
        | "none";
    confidenceScore: number;
    supportingEvidence: string;
    knownLimitations: string[];
    relevantTrainingCutoff?: string;
}

export interface ClaimAssessment {
    claim: string;
    status: "fact" | "inference" | "speculation" | "uncertain";
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
    stage:
        | "knowledge-assessment"
        | "planning"
        | "execution"
        | "monitoring"
        | "evaluation"
        | "reflection";
    knowledgeAssessment?: KnowledgeAssessment;
    claims?: ClaimAssessment[];
    reasoningSteps?: ReasoningAssessment[];
    overallConfidence: number;
    uncertaintyAreas: string[];
    recommendedApproach: string;
    monitoringId: string;
    iteration: number;
    suggestedAssessments?: ("knowledge" | "claim" | "reasoning" | "overall")[];
    nextAssessmentNeeded: boolean;
}

// hypothesis tool
export interface Variable {
    name: string;
    type: "independent" | "dependent" | "controlled" | "confounding";
    operationalization?: string;
}

export interface HypothesisData {
    statement: string;
    variables: Variable[];
    assumptions: string[];
    hypothesisId: string;
    confidence: number;
    domain: string;
    iteration: number;
    alternativeTo?: string[];
    refinementOf?: string;
    status: "proposed" | "testing" | "supported" | "refuted" | "refined";
}

export interface Prediction {
    if: string;
    then: string;
    else?: string;
}

export interface ExperimentData {
    design: string;
    methodology: string;
    predictions: Prediction[];
    experimentId: string;
    hypothesisId: string;
    controlMeasures: string[];
    results?: string;
    outcomeMatched?: boolean;
    unexpectedObservations?: string[];
    limitations?: string[];
    nextSteps?: string[];
}

export interface ScientificInquiryData {
    stage:
        | "observation"
        | "question"
        | "hypothesis"
        | "experiment"
        | "analysis"
        | "conclusion"
        | "iteration";
    observation?: string;
    question?: string;
    hypothesis?: HypothesisData;
    experiment?: ExperimentData;
    analysis?: string;
    conclusion?: string;
    inquiryId: string;
    iteration: number;
    nextStageNeeded: boolean;
}

// debate tool
export interface ArgumentData {
    claim: string;
    premises: string[];
    conclusion: string;
    argumentId?: string;
    argumentType:
        | "thesis"
        | "antithesis"
        | "synthesis"
        | "objection"
        | "rebuttal";
    confidence: number;
    respondsTo?: string;
    supports?: string[];
    contradicts?: string[];
    strengths?: string[];
    weaknesses?: string[];
    nextArgumentNeeded: boolean;
    suggestedNextTypes?: (
        | "thesis"
        | "antithesis"
        | "synthesis"
        | "objection"
        | "rebuttal"
    )[];
}

// map tool
export interface VisualElement {
    id: string;
    type: "node" | "edge" | "container" | "annotation";
    label?: string;
    properties: Record<string, any>;
    source?: string;
    target?: string;
    contains?: string[];
}

export interface VisualOperationData {
    operation: "create" | "update" | "delete" | "transform" | "observe";
    elements?: VisualElement[];
    transformationType?: "rotate" | "move" | "resize" | "recolor" | "regroup";
    diagramId: string;
    diagramType:
        | "graph"
        | "flowchart"
        | "stateDiagram"
        | "conceptMap"
        | "treeDiagram"
        | "custom";
    iteration: number;
    observation?: string;
    insight?: string;
    hypothesis?: string;
    nextOperationNeeded: boolean;
}

// feedback tool
/**
 * Type of feedback that can be submitted
 * - thumbs-up: Positive rating for a tool output
 * - thumbs-down: Negative rating for a tool output
 * - issue-report: Report a specific issue or bug
 */
export type FeedbackType = "thumbs-up" | "thumbs-down" | "issue-report";

/**
 * Input data for submitting feedback
 * This is the structure expected when a user submits feedback
 */
export interface FeedbackData {
    /** The type of feedback being submitted */
    rating: FeedbackType;
    /** Optional text comment with detailed feedback or suggestions */
    comment?: string;
    /** Name of the tool this feedback is for */
    toolName: string;
    /** Optional unique identifier for the specific tool invocation */
    invocationId?: string;
}

/**
 * Complete feedback entry as stored in the system
 * Extends FeedbackData with system-generated fields
 */
export interface FeedbackEntry {
    /** Unique identifier for this feedback entry */
    id: string;
    /** The type of feedback */
    rating: FeedbackType;
    /** Optional text comment with detailed feedback */
    comment?: string;
    /** Name of the tool this feedback is for */
    toolName: string;
    /** ISO 8601 timestamp when feedback was submitted */
    timestamp: string;
    /** Unique identifier for the specific tool invocation */
    invocationId: string;
    /** Optional tool output context for reference */
    toolContext?: {
        /** The input parameters that were passed to the tool */
        input?: Record<string, unknown>;
        /** Summary or excerpt of the tool output */
        outputSummary?: string;
    };
}
