# Decide - Structured Decision Analysis

## What It Does

Decide provides formal frameworks for making complex decisions. From simple pros-cons lists to sophisticated expected value calculations, this tool structures your decision process so you can justify choices and reduce cognitive bias.

**Key Value**: Transform gut feelings into defensible decisions. Decide creates an audit trail of your reasoning that you can share with stakeholders and revisit when outcomes become clear.

## When to Use This Tool

- **High-stakes choices** - When the decision has significant consequences
- **Multiple options** - When choosing between 3+ alternatives
- **Team decisions** - When you need to build consensus
- **Vendor selection** - When comparing products or services
- **Investment decisions** - When allocating resources
- **Risk assessment** - When outcomes are uncertain

## How It Works

Select an analysis method, define options and criteria, then systematically evaluate:

```
Decision Statement → Options → Criteria → Evaluation → Recommendation
```

### Analysis Types

| Type | Best For | How It Works |
|------|----------|--------------|
| **pros-cons** | Quick comparisons | List advantages and disadvantages |
| **weighted-criteria** | Multi-factor decisions | Score options against weighted criteria |
| **decision-tree** | Sequential choices | Map decision paths and outcomes |
| **expected-value** | Uncertain outcomes | Probability × Value calculations |
| **scenario-analysis** | Strategic planning | Evaluate under different futures |

### Decision Stages

| Stage | Purpose |
|-------|---------|
| `problem-definition` | Clarify what you're deciding |
| `options-generation` | Identify alternatives |
| `criteria-definition` | Define evaluation factors |
| `evaluation` | Score options systematically |
| `sensitivity-analysis` | Test how robust the decision is |
| `decision` | Make and document the choice |

## Interactive Examples

### Scenario 1: Cloud Provider Selection with Weighted Criteria

**Context**: Choosing a cloud provider for a new AI/ML platform.

**Input**:
```json
{
  "decisionStatement": "Which cloud provider should we choose for our new AI/ML platform?",
  "options": [
    {"name": "AWS", "description": "Market leader with SageMaker, Bedrock, and comprehensive ML services"},
    {"name": "Google Cloud", "description": "Strong in AI/ML with Vertex AI, TPUs, and TensorFlow integration"},
    {"name": "Azure", "description": "Enterprise-friendly with Azure ML, OpenAI partnership, and hybrid capabilities"}
  ],
  "analysisType": "weighted-criteria",
  "stage": "criteria-definition",
  "decisionId": "cloud-provider-2024",
  "iteration": 1,
  "nextStageNeeded": true,
  "criteria": [
    {"name": "ML/AI Capabilities", "description": "Breadth and depth of machine learning tools", "weight": 0.30},
    {"name": "Cost Efficiency", "description": "Total cost of ownership", "weight": 0.25},
    {"name": "Team Expertise", "description": "Current team experience and learning curve", "weight": 0.20},
    {"name": "Enterprise Support", "description": "SLA, security certifications, support quality", "weight": 0.15},
    {"name": "Vendor Lock-in Risk", "description": "Portability and use of open standards", "weight": 0.10}
  ],
  "stakeholders": ["Engineering Team", "Finance", "Security", "Product"],
  "riskTolerance": "risk-neutral"
}
```

**Output**:
```json
{
  "decisionStatement": "Which cloud provider should we choose for our new AI/ML platform?",
  "options": [
    {"name": "AWS", "description": "Market leader with SageMaker, Bedrock, and comprehensive ML services"},
    {"name": "Google Cloud", "description": "Strong in AI/ML with Vertex AI, TPUs, and TensorFlow integration"},
    {"name": "Azure", "description": "Enterprise-friendly with Azure ML, OpenAI partnership, and hybrid capabilities"}
  ],
  "analysisType": "weighted-criteria",
  "stage": "criteria-definition",
  "decisionId": "cloud-provider-2024",
  "iteration": 1,
  "nextStageNeeded": true,
  "criteria": [...],
  "stakeholders": ["Engineering Team", "Finance", "Security", "Product"],
  "riskTolerance": "risk-neutral"
}
```

**What This Means**: You've defined 5 weighted criteria totaling 100%. ML capabilities carry the most weight (30%), reflecting your AI/ML focus. The next stage will score each provider against these criteria.

---

### Scenario 2: Expected Value for Uncertain Investment

**Context**: Deciding whether to invest in a new feature with uncertain market reception.

**Input**:
```json
{
  "decisionStatement": "Should we invest $500K in building the enterprise dashboard feature?",
  "options": [
    {"name": "Build Full Feature", "description": "Complete enterprise dashboard with all planned capabilities"},
    {"name": "Build MVP", "description": "Minimal dashboard to test market response"},
    {"name": "Don't Build", "description": "Focus resources on existing product improvements"}
  ],
  "analysisType": "expected-value",
  "stage": "evaluation",
  "decisionId": "enterprise-dashboard-decision",
  "iteration": 2,
  "nextStageNeeded": true,
  "possibleOutcomes": [
    {"optionId": "full", "description": "High adoption", "probability": 0.3, "value": 2000000, "confidenceInEstimate": 0.6},
    {"optionId": "full", "description": "Medium adoption", "probability": 0.5, "value": 800000, "confidenceInEstimate": 0.7},
    {"optionId": "full", "description": "Low adoption", "probability": 0.2, "value": -200000, "confidenceInEstimate": 0.8},
    {"optionId": "mvp", "description": "Validates demand", "probability": 0.6, "value": 300000, "confidenceInEstimate": 0.75},
    {"optionId": "mvp", "description": "No demand signal", "probability": 0.4, "value": -50000, "confidenceInEstimate": 0.8}
  ],
  "riskTolerance": "risk-averse"
}
```

**What This Means**: Each option has probability-weighted outcomes. For "Build Full Feature": EV = (0.3 × $2M) + (0.5 × $800K) + (0.2 × -$200K) = $960K. The confidence scores help you understand which estimates are most uncertain.

---

### Scenario 3: Final Decision with Rationale

**Context**: Reaching the final decision stage with recommendation.

**Input**:
```json
{
  "decisionStatement": "Which cloud provider should we choose for our new AI/ML platform?",
  "analysisType": "weighted-criteria",
  "stage": "decision",
  "decisionId": "cloud-provider-2024",
  "iteration": 4,
  "nextStageNeeded": false,
  "recommendation": "Google Cloud Platform",
  "rationale": "GCP scored highest on ML/AI capabilities (our top-weighted criterion) and offers the best cost efficiency for our scale. While our team has more AWS experience, the 3-month learning curve is offset by GCP's stronger ML tooling. Azure's enterprise features were compelling but less relevant for our startup context."
}
```

**What This Means**: The decision is complete with a clear recommendation and documented rationale. This output serves as an architectural decision record (ADR) that you can reference when onboarding team members or evaluating the decision later.

## User Experience

Decide produces structured outputs that track your analysis:

| Field | What It Tells You |
|-------|-------------------|
| `decisionStatement` | What you're deciding |
| `options` | Available choices |
| `analysisType` | Method being used |
| `stage` | Current phase of analysis |
| `iteration` | How many passes through the process |
| `nextStageNeeded` | Whether more analysis is needed |
| `criteria` | Evaluation factors (for weighted-criteria) |
| `possibleOutcomes` | Probability × value estimates (for expected-value) |
| `recommendation` | Final choice |
| `rationale` | Justification for the decision |

**Progression Flow**:
```
problem-definition → options-generation → criteria-definition → evaluation → sensitivity-analysis → decision
```

## Integration Tips

- **Be explicit about weights** - Forces you to acknowledge what matters most
- **Include confidence levels** - Acknowledge uncertainty in your estimates
- **Document stakeholders** - Ensures relevant perspectives are considered
- **State risk tolerance** - Affects how you weight uncertain outcomes
- **Chain with Council** - Use Council to gather perspectives before Decide for analysis
- **Review sensitivity** - Check if small changes in weights flip the decision

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decisionStatement` | string | Yes | What you're deciding |
| `options` | array | Yes | Options with name and description |
| `analysisType` | enum | Yes | pros-cons, weighted-criteria, decision-tree, expected-value, scenario-analysis |
| `stage` | enum | Yes | problem-definition, options-generation, criteria-definition, evaluation, sensitivity-analysis, decision |
| `decisionId` | string | Yes | Unique identifier |
| `iteration` | number | Yes | Current iteration |
| `nextStageNeeded` | boolean | Yes | Whether to continue |
| `criteria` | array | No | Criteria with name, description, weight (0-1) |
| `stakeholders` | string[] | No | Affected parties |
| `riskTolerance` | enum | No | risk-averse, risk-neutral, risk-seeking |
| `possibleOutcomes` | array | No | Outcomes with probability, value, confidence |
| `recommendation` | string | No | Final decision |
| `rationale` | string | No | Justification |
