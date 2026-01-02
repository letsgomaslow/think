# Model - Mental Models for Structured Thinking

## What It Does

Model applies proven mental frameworks to break down complex problems systematically. Instead of thinking in circles, you leverage battle-tested approaches like First Principles, Pareto Analysis, and Rubber Duck Debugging to reach clarity faster.

**Key Value**: Stop reinventing problem-solving approaches. Model gives you access to the same thinking frameworks used by top engineers, consultants, and decision-makers.

## When to Use This Tool

- **Stuck on a problem** - When you're going in circles and need a fresh perspective
- **Cost optimization** - Use First Principles to question every assumption
- **Prioritization decisions** - Use Pareto to focus on what matters most
- **Debugging mysteries** - Use Rubber Duck to explain your way to the answer
- **Risk assessment** - Use Opportunity Cost to see what you're giving up
- **Simplification** - Use Occam's Razor to cut through complexity

## How It Works

Choose a mental model, describe your problem, and the tool guides you through structured analysis:

```
Problem → Select Model → Apply Framework → Steps → Reasoning → Conclusion
```

### Available Mental Models

| Model | Best For | Core Idea |
|-------|----------|-----------|
| **First Principles** | Innovation, cost reduction | Break down to fundamentals, rebuild from scratch |
| **Pareto Principle** | Prioritization, efficiency | 80% of results come from 20% of causes |
| **Rubber Duck** | Debugging, clarity | Explain the problem out loud to find the answer |
| **Opportunity Cost** | Trade-offs, decisions | What are you giving up by choosing this? |
| **Error Propagation** | Risk analysis, quality | How do errors compound through a system? |
| **Occam's Razor** | Simplification | The simplest explanation is usually correct |

## Interactive Examples

### Scenario 1: First Principles Thinking

**Context**: You need to reduce cloud infrastructure costs by 50% without impacting performance.

**Input**:
```json
{
  "modelName": "first_principles",
  "problem": "How can we reduce cloud infrastructure costs by 50% without impacting performance?",
  "steps": [
    "Identify what we fundamentally need: compute, storage, network",
    "Question assumptions: Do we need 24/7 uptime for all services?",
    "Break down costs: 60% compute, 25% storage, 15% network",
    "Rebuild from ground up: spot instances, auto-scaling, data lifecycle policies"
  ],
  "reasoning": "By stripping away accumulated complexity and examining base requirements, we can identify over-provisioned resources and legacy architectural decisions that no longer serve current needs.",
  "conclusion": "Implement spot instances for non-critical workloads (30% savings), auto-scaling policies (15% savings), and tiered storage (10% savings) to exceed the 50% target."
}
```

**Output**:
```json
{
  "modelName": "first_principles",
  "status": "success",
  "hasSteps": true,
  "hasConclusion": true
}
```

**What This Means**: The analysis is complete. The model confirmed your first principles breakdown is valid, with clear steps and a concrete conclusion. Your 50%+ savings target is achievable through the identified strategies.

---

### Scenario 2: Pareto Principle (80/20 Rule)

**Context**: Your customer support team is overwhelmed with 500 tickets daily and needs to prioritize.

**Input**:
```json
{
  "modelName": "pareto_principle",
  "problem": "Our customer support team is overwhelmed with 500 tickets daily. How do we prioritize?",
  "steps": [
    "Analyze ticket categories and frequency",
    "Identify the 20% of issue types causing 80% of tickets",
    "Focus automation on high-frequency, low-complexity issues",
    "Measure impact on ticket volume and resolution time"
  ],
  "reasoning": "Password resets (35%), billing questions (25%), and basic how-to queries (20%) represent 80% of tickets - all can be automated or self-served.",
  "conclusion": "Implement self-service password reset, FAQ chatbot for billing, and in-app tutorials to reduce ticket volume by 60-70%."
}
```

**Output**:
```json
{
  "modelName": "pareto_principle",
  "status": "success",
  "hasSteps": true,
  "hasConclusion": true
}
```

**What This Means**: The 80/20 analysis identified that just 3 issue types (20% of categories) drive 80% of volume. Automating these specific areas will dramatically reduce ticket load.

---

### Scenario 3: Rubber Duck Debugging

**Context**: API response time suddenly increased from 50ms to 800ms after deployment, and you can't find the cause.

**Input**:
```json
{
  "modelName": "rubber_duck",
  "problem": "The API response time suddenly increased from 50ms to 800ms after the last deployment",
  "steps": [
    "Let me explain what the API does step by step...",
    "It receives a request, validates auth, queries the database, transforms data, returns response",
    "Wait - we added a new eager loading call in the ORM",
    "That new call is fetching related records without pagination!",
    "Found it - the N+1 query problem introduced in the user preferences feature"
  ],
  "reasoning": "By explaining the flow out loud, the issue became obvious at step 3 - the new eager loading was the only change in the request path.",
  "conclusion": "The N+1 query in user preferences eager loading is causing the slowdown. Add .limit() or lazy loading to fix."
}
```

**Output**:
```json
{
  "modelName": "rubber_duck",
  "status": "success",
  "hasSteps": true,
  "hasConclusion": true
}
```

**What This Means**: The step-by-step explanation revealed the bug at step 3. The act of explaining forced you to examine each component, exposing the N+1 query problem that wasn't obvious when just staring at the code.

## User Experience

When you invoke Model, you receive a confirmation response:

| Field | What It Tells You |
|-------|-------------------|
| `modelName` | Which mental model was applied |
| `status` | "success" if analysis completed |
| `hasSteps` | Whether structured steps were provided |
| `hasConclusion` | Whether a conclusion was reached |

**The real value is in your input** - the tool structures your thinking as you apply the model. The response confirms your analysis is complete and well-formed.

## Integration Tips

- **Match model to problem type** - Don't force Pareto on a debugging problem
- **Be thorough in steps** - The more explicit your reasoning, the better the insight
- **Include a conclusion** - Force yourself to synthesize the analysis
- **Chain with Trace** - Use Trace to explore, then Model to structure your conclusion
- **Chain with Decide** - After modeling, use Decide for formal decision analysis

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `modelName` | enum | Yes | first_principles, pareto_principle, rubber_duck, opportunity_cost, error_propagation, occams_razor |
| `problem` | string | Yes | The problem you're analyzing |
| `steps` | string[] | No | Your step-by-step breakdown |
| `reasoning` | string | No | Your reasoning process |
| `conclusion` | string | No | Your final conclusion |
