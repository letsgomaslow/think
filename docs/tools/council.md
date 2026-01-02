# Council - Multi-Expert Collaborative Reasoning

## What It Does

Council simulates a panel of experts with diverse perspectives discussing your problem. By giving voice to different viewpoints - the architect, the skeptic, the business strategist - you surface blind spots and build more robust solutions.

**Key Value**: Get the benefit of a diverse advisory board without scheduling meetings. Council forces you to consider perspectives you might naturally overlook.

## When to Use This Tool

- **Complex decisions** - When the choice affects multiple stakeholders
- **Architecture reviews** - When you need to stress-test a design
- **Strategy discussions** - When business and technical concerns intersect
- **Risk assessment** - When you need devil's advocate perspectives
- **Team alignment** - When you need to understand different viewpoints
- **Innovation sessions** - When brainstorming needs diverse input

## How It Works

Council creates a structured dialogue between expert personas:

```
Topic → Define Personas → Iterate Contributions → Reach Consensus/Decision
```

### Collaboration Stages

| Stage | Purpose |
|-------|---------|
| **problem-definition** | Clarify what we're solving |
| **ideation** | Generate diverse ideas and perspectives |
| **critique** | Challenge assumptions and proposals |
| **integration** | Synthesize different viewpoints |
| **decision** | Reach actionable conclusion |
| **reflection** | Review process and learnings |

### Contribution Types

| Type | When to Use |
|------|-------------|
| `observation` | Sharing facts or data |
| `question` | Probing for clarity |
| `insight` | Connecting dots |
| `concern` | Raising risks |
| `suggestion` | Proposing solutions |
| `challenge` | Questioning assumptions |
| `synthesis` | Combining viewpoints |

## Interactive Examples

### Scenario 1: Architecture Decision with Diverse Experts

**Context**: Deciding whether to migrate from a monolith to microservices.

**Input**:
```json
{
  "topic": "Should we migrate our monolith to microservices?",
  "personas": [
    {
      "id": "arch",
      "name": "Sofia Chen",
      "expertise": ["System Architecture", "Distributed Systems"],
      "background": "15 years building large-scale systems at Netflix and Amazon",
      "perspective": "Focus on scalability and team autonomy",
      "biases": ["Prefers modern solutions"],
      "communication": {"style": "Direct and technical", "tone": "Pragmatic"}
    },
    {
      "id": "ops",
      "name": "Marcus Johnson",
      "expertise": ["DevOps", "Infrastructure"],
      "background": "10 years managing production systems",
      "perspective": "Operational complexity and reliability",
      "biases": ["Risk-averse"],
      "communication": {"style": "Detail-oriented", "tone": "Cautious"}
    },
    {
      "id": "bus",
      "name": "Priya Sharma",
      "expertise": ["Product Strategy", "Business Analysis"],
      "background": "MBA, former startup founder",
      "perspective": "Business value and time-to-market",
      "biases": ["ROI-focused"],
      "communication": {"style": "Business-oriented", "tone": "Results-driven"}
    }
  ],
  "contributions": [
    {
      "personaId": "arch",
      "content": "Microservices would allow independent scaling of our payment and inventory services which currently bottleneck the monolith",
      "type": "observation",
      "confidence": 0.85
    }
  ],
  "stage": "ideation",
  "activePersonaId": "arch",
  "sessionId": "migration-decision-001",
  "iteration": 1,
  "nextContributionNeeded": true
}
```

**Output**:
```json
{
  "topic": "Should we migrate our monolith to microservices?",
  "personas": [...],
  "contributions": [
    {
      "personaId": "arch",
      "content": "Microservices would allow independent scaling of our payment and inventory services which currently bottleneck the monolith",
      "type": "observation",
      "confidence": 0.85
    }
  ],
  "stage": "ideation",
  "activePersonaId": "arch",
  "sessionId": "migration-decision-001",
  "iteration": 1,
  "nextContributionNeeded": true
}
```

**What This Means**: The council is in the ideation stage. The architect has made the first observation about scaling benefits. Next, the DevOps expert (Marcus) might raise operational concerns, and the business analyst (Priya) might question the ROI.

---

### Scenario 2: Continuing the Discussion

**Context**: After the architect's observation, the DevOps expert responds with concerns.

**Input** (next iteration):
```json
{
  "topic": "Should we migrate our monolith to microservices?",
  "personas": [...],
  "contributions": [
    {
      "personaId": "arch",
      "content": "Microservices would allow independent scaling...",
      "type": "observation",
      "confidence": 0.85
    },
    {
      "personaId": "ops",
      "content": "Independent scaling sounds great, but we'll need service mesh, distributed tracing, and 10x more deployment pipelines. Our team of 3 DevOps engineers is already stretched thin.",
      "type": "concern",
      "confidence": 0.9
    }
  ],
  "stage": "critique",
  "activePersonaId": "ops",
  "sessionId": "migration-decision-001",
  "iteration": 2,
  "nextContributionNeeded": true
}
```

**What This Means**: The council has moved to the critique stage. Marcus's concern (with 90% confidence) raises a practical staffing constraint that could derail the migration. This is exactly the kind of blind spot Council is designed to surface.

---

### Scenario 3: Reaching Synthesis

**Context**: After critique, the council synthesizes a recommendation.

**Input** (synthesis stage):
```json
{
  "topic": "Should we migrate our monolith to microservices?",
  "stage": "decision",
  "sessionId": "migration-decision-001",
  "iteration": 5,
  "nextContributionNeeded": false,
  "consensusPoints": [
    "Scaling is a real problem that needs addressing",
    "Full microservices migration is too risky given team size",
    "Extracting 2-3 high-impact services is a viable middle ground"
  ],
  "disagreements": [],
  "keyInsights": [
    "The strangler fig pattern reduces migration risk",
    "Start with payment service - highest scaling need, clearest boundaries"
  ],
  "finalRecommendation": "Adopt a gradual strangler fig approach, extracting the payment service first, with a 6-month evaluation before expanding further."
}
```

**What This Means**: The council reached consensus on a pragmatic middle path. By considering all perspectives (scalability, operations, business value), the recommendation balances ambition with reality.

## User Experience

Council sessions produce rich, evolving outputs:

| Field | What It Tells You |
|-------|-------------------|
| `stage` | Current phase of the discussion |
| `activePersonaId` | Who is currently contributing |
| `iteration` | How many rounds of discussion |
| `nextContributionNeeded` | Whether to continue or conclude |
| `consensusPoints` | Where experts agree |
| `disagreements` | Where perspectives conflict |
| `keyInsights` | Most valuable realizations |
| `finalRecommendation` | Actionable conclusion |

**Progression Flow**:
```
problem-definition → ideation → critique → integration → decision → reflection
     (multiple contributions at each stage, rotating personas)
```

## Integration Tips

- **Design diverse personas** - Include perspectives that naturally conflict
- **Acknowledge biases** - Explicitly stating biases makes them useful rather than hidden
- **Iterate thoroughly** - Real insights emerge after several rounds of back-and-forth
- **Track disagreements** - Unresolved disagreements are signals, not failures
- **Chain with Decide** - After Council consensus, use Decide for formal decision analysis

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | What the council is discussing |
| `personas` | array | Yes | Expert personas with id, name, expertise, background, perspective, biases, communication |
| `contributions` | array | Yes | Array of contributions with personaId, content, type, confidence |
| `stage` | enum | Yes | problem-definition, ideation, critique, integration, decision, reflection |
| `activePersonaId` | string | Yes | Currently active persona |
| `sessionId` | string | Yes | Unique identifier for this session |
| `iteration` | number | Yes | Current iteration count |
| `nextContributionNeeded` | boolean | Yes | Whether to continue |
| `consensusPoints` | string[] | No | Points of agreement |
| `disagreements` | array | No | Structured disagreements |
| `keyInsights` | string[] | No | Key insights discovered |
| `finalRecommendation` | string | No | Council's recommendation |
