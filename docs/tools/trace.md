# Trace - Dynamic Chain-of-Thought Reasoning

## What It Does

Trace helps you think through complex problems step-by-step, with the unique ability to **revise earlier thoughts** and **branch into alternative paths** when your understanding evolves. Unlike linear thinking, Trace captures the messy, iterative nature of real problem-solving.

**Key Value**: Never lose a good idea because you went down the wrong path. Trace lets you backtrack, revise, and explore alternatives while keeping your full reasoning history.

## When to Use This Tool

- **Breaking down complex problems** - When you need to analyze something step-by-step
- **Exploring multiple approaches** - When you want to branch and compare different solutions
- **Course-correcting** - When you realize an earlier assumption was wrong
- **Documenting reasoning** - When you need an audit trail of how you reached a conclusion
- **Problems with unclear scope** - When you don't know how many steps you'll need

## How It Works

Trace operates like a smart notebook that tracks your thinking:

1. **Start with an estimate** - Guess how many thoughts you'll need
2. **Think progressively** - Each thought builds on previous ones
3. **Revise when needed** - Mark thoughts that correct earlier thinking
4. **Branch to explore** - Create parallel thought paths for alternatives
5. **Extend as needed** - Add more thoughts if you underestimated

```
Thought 1 ──→ Thought 2 ──→ Thought 3
                  │
                  └──→ [Branch: Alternative approach]
                           └──→ Thought 2b ──→ Thought 3b
```

## Interactive Examples

### Scenario 1: Basic Problem Analysis

**Context**: You're analyzing why customer onboarding has a 40% drop-off rate.

**Input**:
```json
{
  "thought": "Let me analyze how to improve customer onboarding. The current process has a 40% drop-off rate which suggests friction in the user journey.",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true
}
```

**Output**:
```json
{
  "thought": "Let me analyze how to improve customer onboarding. The current process has a 40% drop-off rate which suggests friction in the user journey.",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true
}
```

**What This Means**: The tool confirms your thought is recorded and signals you should continue to thought 2. The `nextThoughtNeeded: true` indicates more analysis is expected.

---

### Scenario 2: Revising Earlier Thinking

**Context**: After more analysis, you realize your initial assumption was wrong.

**Input**:
```json
{
  "thought": "Actually, I need to reconsider my earlier assumption. The drop-off might not be due to friction but rather unclear value proposition at the start.",
  "thoughtNumber": 2,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "isRevision": true,
  "revisesThought": 1
}
```

**Output**:
```json
{
  "thought": "Actually, I need to reconsider my earlier assumption. The drop-off might not be due to friction but rather unclear value proposition at the start.",
  "thoughtNumber": 2,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "isRevision": true,
  "revisesThought": 1
}
```

**What This Means**: This thought explicitly revises thought #1. The reasoning trail now shows you changed your hypothesis - valuable for understanding how conclusions evolved.

---

### Scenario 3: Branching to Explore Alternatives

**Context**: You want to explore a completely different solution path without abandoning your current analysis.

**Input**:
```json
{
  "thought": "What if we explore a completely different approach? Instead of fixing onboarding, what if we pre-qualify users before they even start?",
  "thoughtNumber": 2,
  "totalThoughts": 4,
  "nextThoughtNeeded": true,
  "branchFromThought": 1,
  "branchId": "prequalify-branch"
}
```

**Output**:
```json
{
  "thought": "What if we explore a completely different approach? Instead of fixing onboarding, what if we pre-qualify users before they even start?",
  "thoughtNumber": 2,
  "totalThoughts": 4,
  "nextThoughtNeeded": true,
  "branchFromThought": 1,
  "branchId": "prequalify-branch"
}
```

**What This Means**: You've created a parallel branch from thought #1. This new path ("prequalify-branch") can be developed independently. Notice `totalThoughts` increased to 4 - you can adjust estimates as complexity reveals itself.

## User Experience

When you invoke Trace, you'll see a JSON response that:

| Field | What It Tells You |
|-------|-------------------|
| `thoughtNumber` | Where you are in the sequence |
| `totalThoughts` | Your current estimate (adjustable) |
| `nextThoughtNeeded` | Whether to continue (true) or conclude (false) |
| `isRevision` | If this corrects earlier thinking |
| `revisesThought` | Which thought number is being revised |
| `branchFromThought` | Starting point for alternative path |
| `branchId` | Label for tracking parallel explorations |

**Progression Flow**:
```
Start → Thought 1 → Thought 2 → ... → Final Thought (nextThoughtNeeded: false)
                ↓
        [Optional: Revise or Branch]
```

## Integration Tips

- **Start with an underestimate** - It's easier to add thoughts than to feel constrained
- **Use revisions liberally** - They create valuable reasoning documentation
- **Name branches meaningfully** - `branchId: "cost-focused"` is better than `branchId: "b1"`
- **Set `nextThoughtNeeded: false`** only when you've reached a genuine conclusion
- **Chain with other tools** - Use Trace to structure thinking, then feed conclusions to `decide` or `hypothesis`

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thought` | string | Yes | The content of your current thought |
| `thoughtNumber` | number | Yes | Current position (starts at 1) |
| `totalThoughts` | number | Yes | Estimated total thoughts needed |
| `nextThoughtNeeded` | boolean | Yes | Continue (true) or conclude (false) |
| `isRevision` | boolean | No | Marks this as revising earlier thinking |
| `revisesThought` | number | No | Which thought number this revises |
| `branchFromThought` | number | No | Create branch from this thought |
| `branchId` | string | No | Label for the branch |
| `needsMoreThoughts` | boolean | No | Signal that estimate was too low |
