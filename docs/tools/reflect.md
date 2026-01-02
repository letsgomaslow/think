# Reflect - Metacognitive Self-Monitoring

## What It Does

Reflect helps you assess the quality of your own thinking. By explicitly tracking knowledge boundaries, claim certainty, and potential biases, you calibrate your confidence and identify where more investigation is needed.

**Key Value**: Know what you don't know. Reflect surfaces overconfidence, blind spots, and unstated assumptions before they derail your project.

## When to Use This Tool

- **Before major decisions** - Calibrate confidence in your analysis
- **When feeling certain** - Challenge overconfidence with explicit assessment
- **Complex domains** - Acknowledge expertise limits
- **High-stakes situations** - Document uncertainty areas
- **Team knowledge gaps** - Identify where expertise is lacking
- **After failures** - Understand what you didn't know

## How It Works

Reflect guides you through structured self-assessment:

```
Task → Assess Knowledge → Evaluate Claims → Check Reasoning → Track Confidence
```

### Assessment Stages

| Stage | Purpose |
|-------|---------|
| `knowledge-assessment` | Evaluate domain expertise level |
| `planning` | Assess readiness for task |
| `execution` | Monitor reasoning during work |
| `monitoring` | Track confidence in real-time |
| `evaluation` | Judge outcome quality |
| `reflection` | Extract lessons learned |

### Knowledge Levels

| Level | What It Means |
|-------|---------------|
| `expert` | Deep, comprehensive understanding |
| `proficient` | Strong working knowledge |
| `familiar` | General understanding, gaps in details |
| `basic` | Surface-level awareness |
| `minimal` | Vague familiarity only |
| `none` | No relevant knowledge |

## Interactive Examples

### Scenario 1: Assessing Knowledge Before a Migration

**Context**: Evaluating your confidence in a proposed database schema migration plan.

**Input**:
```json
{
  "task": "Evaluate our confidence in the proposed database schema migration plan",
  "stage": "knowledge-assessment",
  "overallConfidence": 0.72,
  "uncertaintyAreas": [
    "Impact on existing queries performance",
    "Rollback procedure complexity",
    "Data integrity during migration window"
  ],
  "recommendedApproach": "Run shadow migrations on production replica before committing to the plan",
  "monitoringId": "schema-migration-review",
  "iteration": 1,
  "nextAssessmentNeeded": true,
  "knowledgeAssessment": {
    "domain": "PostgreSQL schema migrations",
    "knowledgeLevel": "proficient",
    "confidenceScore": 0.8,
    "supportingEvidence": "Team has completed 5 similar migrations in the past year",
    "knownLimitations": [
      "Limited experience with zero-downtime migrations",
      "New partitioning strategy is untested"
    ]
  }
}
```

**Output**:
```json
{
  "task": "Evaluate our confidence in the proposed database schema migration plan",
  "stage": "knowledge-assessment",
  "monitoringId": "schema-migration-review",
  "iteration": 1,
  "overallConfidence": 0.72,
  "nextAssessmentNeeded": true,
  "status": "success"
}
```

**What This Means**: Your 72% confidence is calibrated against specific uncertainty areas. The knowledge assessment shows "proficient" level but flags two key limitations: zero-downtime experience and untested partitioning. These are exactly where extra caution is needed.

---

### Scenario 2: Evaluating Claim Certainty

**Context**: Checking the quality of claims in a technical proposal.

**Input**:
```json
{
  "task": "Review claims in our performance optimization proposal",
  "stage": "monitoring",
  "overallConfidence": 0.65,
  "uncertaintyAreas": ["Scaling assumptions based on synthetic benchmarks"],
  "recommendedApproach": "Validate key claims with production traffic testing",
  "monitoringId": "perf-proposal-review",
  "iteration": 2,
  "nextAssessmentNeeded": true,
  "claims": [
    {
      "claim": "Redis caching will reduce database load by 60%",
      "status": "inference",
      "confidenceScore": 0.7,
      "evidenceBasis": "Based on query pattern analysis and cache hit ratio estimates",
      "alternativeInterpretations": ["Cache invalidation could reduce effectiveness", "Hot keys might cause uneven distribution"]
    },
    {
      "claim": "Response times will improve from 200ms to 50ms",
      "status": "speculation",
      "confidenceScore": 0.5,
      "evidenceBasis": "Extrapolation from similar systems at other companies",
      "falsifiabilityCriteria": "Measure p95 latency after 2 weeks in production"
    }
  ]
}
```

**What This Means**: Two claims are explicitly categorized - one is a reasonable inference (0.7 confidence) and one is speculation (0.5 confidence). The alternative interpretations and falsifiability criteria create accountability: you'll know if you were wrong.

---

### Scenario 3: Checking Reasoning Quality

**Context**: Evaluating the reasoning process in an architecture decision.

**Input**:
```json
{
  "task": "Assess reasoning quality in our microservices decision",
  "stage": "evaluation",
  "overallConfidence": 0.68,
  "uncertaintyAreas": ["Team capacity for distributed systems complexity"],
  "recommendedApproach": "Seek external review from someone with microservices migration experience",
  "monitoringId": "arch-decision-check",
  "iteration": 1,
  "nextAssessmentNeeded": false,
  "reasoningSteps": [
    {
      "step": "Identified scaling bottlenecks in monolith",
      "potentialBiases": ["Confirmation bias - looking for problems that justify desired solution"],
      "assumptions": ["Current traffic growth will continue", "Scaling issues can't be solved within monolith"],
      "logicalValidity": 0.8,
      "inferenceStrength": 0.75
    },
    {
      "step": "Compared microservices benefits vs. operational costs",
      "potentialBiases": ["Novelty bias - excitement about new architecture"],
      "assumptions": ["Team can learn distributed systems within project timeline"],
      "logicalValidity": 0.7,
      "inferenceStrength": 0.6
    }
  ]
}
```

**What This Means**: Each reasoning step is analyzed for biases and assumptions. Step 2 has lower logical validity (0.7) and inference strength (0.6) due to a risky assumption about learning speed. This is where external review would add most value.

## User Experience

Reflect produces calibrated self-assessments:

| Field | What It Tells You |
|-------|-------------------|
| `overallConfidence` | 0-1 score for overall certainty |
| `uncertaintyAreas` | Explicit list of what you're unsure about |
| `recommendedApproach` | What to do about the uncertainty |
| `knowledgeAssessment` | Evaluation of domain expertise |
| `claims` | Individual claims with status and confidence |
| `reasoningSteps` | Analysis of reasoning quality |
| `nextAssessmentNeeded` | Whether more reflection is needed |

**Confidence Scale**:
```
0.0-0.3: Low confidence - investigate before proceeding
0.3-0.6: Moderate confidence - proceed with monitoring
0.6-0.8: Good confidence - proceed with standard review
0.8-1.0: High confidence - proceed with normal caution
```

## Integration Tips

- **Be honest about uncertainty** - Overconfidence is the real risk
- **List specific unknowns** - Vague uncertainty isn't actionable
- **Include evidence basis** - What makes you believe your claims?
- **Acknowledge biases** - We all have them; naming them reduces their power
- **Chain with Hypothesis** - Use Reflect to assess, then Hypothesis to test claims
- **Revisit after outcomes** - Compare your confidence to actual results

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task` | string | Yes | What you're assessing |
| `stage` | enum | Yes | knowledge-assessment, planning, execution, monitoring, evaluation, reflection |
| `overallConfidence` | number | Yes | 0-1 confidence score |
| `uncertaintyAreas` | string[] | Yes | Specific areas of uncertainty |
| `recommendedApproach` | string | Yes | How to address uncertainty |
| `monitoringId` | string | Yes | Unique identifier |
| `iteration` | number | Yes | Current iteration |
| `nextAssessmentNeeded` | boolean | Yes | Whether to continue |
| `knowledgeAssessment` | object | No | Domain, level, evidence, limitations |
| `claims` | array | No | Claims with status, confidence, evidence |
| `reasoningSteps` | array | No | Steps with biases, assumptions, validity |
