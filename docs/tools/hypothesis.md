# Hypothesis - Scientific Method for Problem Solving

## What It Does

Hypothesis applies the scientific method to questions and problems. By structuring observations into testable hypotheses with explicit variables and predictions, you move from guessing to systematic investigation.

**Key Value**: Stop guessing and start testing. Hypothesis forces you to make falsifiable predictions, design experiments, and update beliefs based on evidence.

## When to Use This Tool

- **Product decisions** - Test assumptions before building features
- **Performance issues** - Form hypotheses about bottlenecks
- **A/B testing design** - Structure experiments properly
- **Root cause analysis** - Investigate systematically
- **Market research** - Test assumptions about user behavior
- **Technical investigations** - Diagnose complex system issues

## How It Works

Hypothesis guides you through the scientific method:

```
Observation → Question → Hypothesis → Experiment → Analysis → Conclusion
```

### Scientific Stages

| Stage | Purpose |
|-------|---------|
| `observation` | Notice something interesting or problematic |
| `question` | Formulate what you want to understand |
| `hypothesis` | Propose an explanation with testable predictions |
| `experiment` | Design and run the test |
| `analysis` | Evaluate results against predictions |
| `conclusion` | Update understanding based on evidence |
| `iteration` | Refine hypothesis based on findings |

### Variable Types

| Type | What It Means |
|------|---------------|
| `independent` | What you manipulate/change |
| `dependent` | What you measure |
| `controlled` | What you keep constant |
| `confounding` | What might skew results |

## Interactive Examples

### Scenario 1: Investigating Conversion Drop

**Context**: Checkout conversion rate dropped from 3.2% to 2.1% after a website redesign.

**Input**:
```json
{
  "stage": "hypothesis",
  "inquiryId": "conversion-rate-study",
  "iteration": 1,
  "nextStageNeeded": true,
  "observation": "Our checkout conversion rate dropped from 3.2% to 2.1% after the website redesign last month",
  "question": "What specific design changes are causing users to abandon checkout?",
  "hypothesis": {
    "statement": "The new multi-step checkout process increases cognitive load and causes abandonment compared to the previous single-page checkout",
    "variables": [
      {"name": "checkout_steps", "type": "independent", "operationalization": "Number of pages in checkout flow (1 vs 4)"},
      {"name": "conversion_rate", "type": "dependent", "operationalization": "Percentage of cart additions that complete purchase"},
      {"name": "device_type", "type": "controlled", "operationalization": "Desktop vs mobile users analyzed separately"}
    ],
    "assumptions": [
      "Users prefer fewer steps",
      "The product mix hasn't changed significantly"
    ],
    "hypothesisId": "H1-checkout-steps",
    "confidence": 0.75,
    "domain": "UX/Conversion Optimization",
    "iteration": 1,
    "status": "proposed"
  }
}
```

**Output**:
```json
{
  "stage": "hypothesis",
  "inquiryId": "conversion-rate-study",
  "iteration": 1,
  "nextStageNeeded": true,
  "status": "success"
}
```

**What This Means**: You've formulated a testable hypothesis with:
- **Clear statement**: Multi-step checkout → lower conversion
- **Variables defined**: Steps (independent), conversion (dependent), device (controlled)
- **Assumptions stated**: Preferences about steps, stable product mix
- **Confidence calibrated**: 75% - you believe this but aren't certain

---

### Scenario 2: Designing the Experiment

**Context**: Moving from hypothesis to experiment design.

**Input**:
```json
{
  "stage": "experiment",
  "inquiryId": "conversion-rate-study",
  "iteration": 2,
  "nextStageNeeded": true,
  "hypothesis": {
    "statement": "The new multi-step checkout process increases cognitive load and causes abandonment",
    "hypothesisId": "H1-checkout-steps",
    "status": "testing"
  },
  "experiment": {
    "design": "A/B test with 50/50 traffic split between old single-page and new multi-step checkout",
    "methodology": "Randomized controlled trial with 2-week duration",
    "predictions": [
      {"if": "Multi-step checkout has higher abandonment", "then": "Conversion rate will be 30%+ lower in multi-step group", "else": "The issue is elsewhere in the redesign"},
      {"if": "Cognitive load is the cause", "then": "Time-on-page before abandonment will be higher in multi-step", "else": "Users are abandoning for other reasons"}
    ],
    "experimentId": "exp-checkout-001",
    "hypothesisId": "H1-checkout-steps",
    "controlMeasures": [
      "Exclude users who arrived via specific promotional campaigns",
      "Run during non-holiday period",
      "Ensure equal distribution across device types"
    ]
  }
}
```

**What This Means**: Your experiment is designed with:
- **Clear methodology**: Randomized A/B test
- **Explicit predictions**: If-then-else structure forces falsifiability
- **Control measures**: Reduce confounding factors
- **Success criteria**: 30% difference threshold is specific and measurable

---

### Scenario 3: Analyzing Results and Concluding

**Context**: Experiment complete, analyzing results.

**Input**:
```json
{
  "stage": "conclusion",
  "inquiryId": "conversion-rate-study",
  "iteration": 3,
  "nextStageNeeded": false,
  "experiment": {
    "experimentId": "exp-checkout-001",
    "hypothesisId": "H1-checkout-steps",
    "results": "Single-page conversion: 3.1%, Multi-step conversion: 2.0%. Difference: 35%. Time-on-page before abandonment: 45s (single) vs 89s (multi).",
    "outcomeMatched": true,
    "unexpectedObservations": [
      "Mobile users showed even larger difference (40% lower conversion)",
      "Abandonment peaked at step 2 (shipping details) not payment"
    ],
    "limitations": [
      "Could not control for user acquisition source changes",
      "2-week period may miss weekly patterns"
    ],
    "nextSteps": [
      "Focus optimization on shipping details step",
      "Consider progressive disclosure for mobile users"
    ]
  },
  "analysis": "Results support the hypothesis. The 35% conversion difference exceeds our 30% threshold. Extended time-on-page suggests cognitive load as the mechanism.",
  "conclusion": "Multi-step checkout is causing the conversion drop. The shipping details step is the primary friction point. Recommend reverting to single-page or simplifying the multi-step flow, with priority on mobile experience."
}
```

**What This Means**: Your investigation reached a clear conclusion:
- **Hypothesis supported**: 35% difference confirmed the prediction
- **Mechanism identified**: Time-on-page data supports cognitive load theory
- **Unexpected findings**: Mobile worse, shipping step is the culprit
- **Actionable next steps**: Specific improvements recommended

## User Experience

Hypothesis produces rigorous investigation records:

| Field | What It Tells You |
|-------|-------------------|
| `stage` | Current phase of scientific inquiry |
| `inquiryId` | Unique identifier for this investigation |
| `iteration` | How many cycles of refinement |
| `nextStageNeeded` | Whether to continue investigating |
| `hypothesis` | Proposed explanation with variables |
| `experiment` | Test design with predictions |
| `analysis` | Evaluation of results |
| `conclusion` | Final understanding and recommendations |

**Investigation Flow**:
```
Observation → Question → Hypothesis → Experiment → Analysis → Conclusion
                              ↑                          ↓
                              └──── Iteration (refine) ──┘
```

## Integration Tips

- **Make hypotheses falsifiable** - If nothing could disprove it, it's not scientific
- **Define success criteria upfront** - Avoid post-hoc rationalization
- **Document unexpected findings** - Often more valuable than expected results
- **List limitations honestly** - Helps others evaluate your conclusions
- **Chain with Reflect** - Assess confidence in your hypothesis
- **Chain with Debug** - Use debugging approaches to find observations

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stage` | enum | Yes | observation, question, hypothesis, experiment, analysis, conclusion, iteration |
| `inquiryId` | string | Yes | Unique identifier for this inquiry |
| `iteration` | number | Yes | Current iteration count |
| `nextStageNeeded` | boolean | Yes | Whether to continue |
| `observation` | string | No | What you noticed |
| `question` | string | No | What you want to understand |
| `hypothesis` | object | No | Statement, variables, assumptions, confidence, status |
| `experiment` | object | No | Design, methodology, predictions, control measures, results |
| `analysis` | string | No | Evaluation of results |
| `conclusion` | string | No | Final understanding |
