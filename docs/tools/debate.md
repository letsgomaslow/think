# Debate - Dialectical Reasoning and Argumentation

## What It Does

Debate structures formal arguments through thesis, antithesis, and synthesis. By explicitly constructing and critiquing arguments, you stress-test ideas and reach more robust conclusions.

**Key Value**: Make your reasoning explicit and challenge it systematically. Debate helps you find weaknesses in arguments before someone else does.

## When to Use This Tool

- **Strategic decisions** - Test the strength of a proposed direction
- **Controversial topics** - Explore multiple viewpoints fairly
- **Technical debates** - Evaluate competing approaches
- **Policy discussions** - Analyze arguments for and against
- **Investment decisions** - Play devil's advocate
- **Interview prep** - Anticipate counterarguments

## How It Works

Debate structures arguments through dialectical reasoning:

```
Thesis → Antithesis → Synthesis (→ Objection → Rebuttal → ...)
```

### Argument Types

| Type | Purpose | When to Use |
|------|---------|-------------|
| `thesis` | Initial position | Starting a debate |
| `antithesis` | Opposing position | Challenging the thesis |
| `synthesis` | Reconciliation | Integrating both perspectives |
| `objection` | Specific criticism | Attacking one part of an argument |
| `rebuttal` | Defense | Responding to objections |

### Argument Structure

Each argument contains:
- **Claim**: The main assertion
- **Premises**: Supporting reasons
- **Conclusion**: What follows from the premises
- **Strengths/Weaknesses**: Honest assessment

## Interactive Examples

### Scenario 1: Thesis - Remote Work is Superior

**Context**: Starting a debate about remote work policies.

**Input**:
```json
{
  "claim": "Remote-first companies outperform hybrid companies in employee productivity and retention",
  "premises": [
    "Studies show remote workers report 13% higher productivity",
    "Remote companies have access to global talent pool",
    "Employees save 2+ hours daily on commute",
    "Remote work enables deep work without office interruptions"
  ],
  "conclusion": "Companies should adopt remote-first policies to maximize productivity and retain top talent",
  "argumentType": "thesis",
  "confidence": 0.75,
  "nextArgumentNeeded": true,
  "argumentId": "remote-thesis-001",
  "strengths": [
    "Backed by multiple productivity studies",
    "Cost savings on office space",
    "Proven by successful companies like GitLab, Zapier"
  ],
  "weaknesses": [
    "May not apply to all industries",
    "Collaboration challenges",
    "Junior employee mentorship concerns"
  ]
}
```

**Output**:
```json
{
  "argumentType": "thesis",
  "claim": "Remote-first companies outperform hybrid companies in employee productivity and retention",
  "confidence": 0.75,
  "nextArgumentNeeded": true,
  "argumentId": "remote-thesis-001",
  "status": "success"
}
```

**What This Means**: A thesis is established with 75% confidence. Importantly, you've honestly listed weaknesses - this makes the argument stronger by acknowledging limitations upfront. The debate needs an antithesis.

---

### Scenario 2: Antithesis - Hybrid Work is Better

**Context**: Challenging the thesis with an opposing viewpoint.

**Input**:
```json
{
  "claim": "Hybrid work provides better outcomes than fully remote by balancing collaboration with flexibility",
  "premises": [
    "In-person collaboration sparks spontaneous innovation",
    "New employees need face-to-face mentorship",
    "Company culture is harder to maintain remotely",
    "Some roles require physical presence"
  ],
  "conclusion": "A structured hybrid model (3 days office, 2 days remote) optimizes for both productivity and collaboration",
  "argumentType": "antithesis",
  "confidence": 0.7,
  "nextArgumentNeeded": true,
  "argumentId": "hybrid-antithesis-001",
  "respondsTo": "remote-thesis-001",
  "contradicts": ["remote-thesis-001"],
  "strengths": [
    "Addresses collaboration concerns",
    "Maintains company culture",
    "Supports junior employee growth"
  ],
  "weaknesses": [
    "Still requires expensive office space",
    "Commute time not eliminated",
    "Scheduling complexity"
  ]
}
```

**Output**:
```json
{
  "argumentType": "antithesis",
  "claim": "Hybrid work provides better outcomes than fully remote by balancing collaboration with flexibility",
  "confidence": 0.7,
  "nextArgumentNeeded": true,
  "argumentId": "hybrid-antithesis-001",
  "status": "success"
}
```

**What This Means**: The antithesis directly contradicts the thesis (linked via `respondsTo` and `contradicts`). Both positions now have clear claims, premises, and acknowledged weaknesses. The debate is ready for synthesis.

---

### Scenario 3: Synthesis - Context-Dependent Model

**Context**: Integrating both perspectives into a nuanced conclusion.

**Input**:
```json
{
  "claim": "The optimal work model depends on company stage, industry, and team composition - there is no universal answer",
  "premises": [
    "Startups benefit from intense in-person collaboration",
    "Established companies can leverage remote for talent access",
    "Engineering teams may thrive remotely while sales needs in-person",
    "Generational preferences vary significantly"
  ],
  "conclusion": "Companies should adopt flexible policies that allow teams to choose their optimal work model based on function and goals",
  "argumentType": "synthesis",
  "confidence": 0.85,
  "nextArgumentNeeded": false,
  "argumentId": "flexible-synthesis-001",
  "respondsTo": "hybrid-antithesis-001",
  "supports": ["remote-thesis-001", "hybrid-antithesis-001"],
  "strengths": [
    "Acknowledges complexity",
    "Empowers teams",
    "Adaptable to change"
  ],
  "weaknesses": [
    "Harder to implement consistently",
    "May create inequity between teams"
  ],
  "suggestedNextTypes": ["objection", "rebuttal"]
}
```

**Output**:
```json
{
  "argumentType": "synthesis",
  "claim": "The optimal work model depends on company stage, industry, and team composition - there is no universal answer",
  "confidence": 0.85,
  "nextArgumentNeeded": false,
  "argumentId": "flexible-synthesis-001",
  "status": "success"
}
```

**What This Means**: The synthesis integrates valid points from both thesis and antithesis (via `supports`). Note the higher confidence (0.85) - synthesis that acknowledges context is often more robust than absolute positions. The debate can conclude or continue with objections.

## User Experience

Debate produces structured argument records:

| Field | What It Tells You |
|-------|-------------------|
| `claim` | Main assertion being made |
| `premises` | Supporting reasons |
| `conclusion` | What follows from premises |
| `argumentType` | Role in the dialectic |
| `confidence` | 0-1 belief in the argument |
| `argumentId` | Unique identifier |
| `respondsTo` | Which argument this addresses |
| `supports` / `contradicts` | Relationships to other arguments |
| `strengths` / `weaknesses` | Honest assessment |
| `nextArgumentNeeded` | Whether debate should continue |
| `suggestedNextTypes` | What types of arguments would be valuable next |

**Dialectical Flow**:
```
        Thesis                    Antithesis
           │                          │
           └──────────┬───────────────┘
                      ▼
                  Synthesis
                      │
         ┌───────────┴───────────┐
         ▼                       ▼
     Objection               Rebuttal
```

## Integration Tips

- **Be honest about weaknesses** - Steelmanning improves your argument
- **Track argument relationships** - `supports` and `contradicts` create a map of reasoning
- **Calibrate confidence** - Overconfident arguments are easier to attack
- **Use synthesis actively** - Don't just pick a side; integrate the best of both
- **Chain with Council** - Have personas debate each other
- **Chain with Decide** - After debate, use Decide for formal decision analysis

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `claim` | string | Yes | Main assertion |
| `premises` | string[] | Yes | Supporting reasons |
| `conclusion` | string | Yes | What follows from premises |
| `argumentType` | enum | Yes | thesis, antithesis, synthesis, objection, rebuttal |
| `confidence` | number | Yes | 0-1 belief level |
| `nextArgumentNeeded` | boolean | Yes | Whether debate should continue |
| `argumentId` | string | No | Unique identifier |
| `respondsTo` | string | No | ID of argument being addressed |
| `supports` | string[] | No | IDs of arguments this supports |
| `contradicts` | string[] | No | IDs of arguments this opposes |
| `strengths` | string[] | No | Strong points |
| `weaknesses` | string[] | No | Weak points |
| `suggestedNextTypes` | enum[] | No | Suggested next argument types |
