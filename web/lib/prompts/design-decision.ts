/**
 * Design Decision Prompt
 *
 * Guides users through structured design/architecture decisions using think-mcp tools.
 * Supports A/B variants for testing different levels of guidance detail.
 */

import { PromptDefinition } from './types';

/**
 * Design Decision prompt definition
 */
export const designDecisionPrompt: PromptDefinition = {
  name: 'design-decision',
  description: 'Make a design or architecture decision systematically. Helps evaluate options, consider trade-offs, and document rationale.',
  arguments: [
    {
      name: 'decision',
      description: 'The design decision you need to make',
      required: true,
    },
    {
      name: 'options',
      description: 'Known options to consider (comma-separated)',
      required: false,
    },
    {
      name: 'constraints',
      description: 'Constraints or requirements to consider',
      required: false,
    },
  ],
  variants: {
    // Variant A: Detailed with comprehensive decision framework
    A: {
      systemContext: `I'll help you make this design decision systematically using think-mcp's decision tools. A structured approach ensures we consider all important factors and document our reasoning.`,
      template: `# Design Decision

## Decision Statement
{decision}

## Known Options
{options}

## Constraints & Requirements
{constraints}

---

I'll guide you through a structured decision-making process:

### Phase 1: Decision Framing
First, we'll use the **trace** tool to:
- Clarify exactly what we're deciding
- Identify stakeholders affected
- Define success criteria
- Understand the timeline and reversibility

### Phase 2: Option Generation
We'll expand our options using the **council** tool:
- Technical Architect perspective
- Product Manager perspective
- Operations/SRE perspective
- Security perspective

This helps ensure we haven't missed viable alternatives.

### Phase 3: Criteria Definition
We'll identify weighted evaluation criteria:
| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| Performance | ? | How critical is speed? |
| Maintainability | ? | Long-term team considerations |
| Cost | ? | Budget constraints |
| Time to implement | ? | Timeline pressures |
| Risk | ? | Failure consequences |

### Phase 4: Option Evaluation
Using the **decide** tool, we'll:
- Score each option against criteria
- Identify trade-offs explicitly
- Consider second-order effects

### Phase 5: Decision Documentation
We'll document:
- Final decision and rationale
- Rejected alternatives and why
- Risks and mitigations
- Success metrics

Let's start with Phase 1. What are the key stakeholders and success criteria?`,
      toolGuidance: [
        'Use **trace** to document decision context and constraints',
        'Apply **council** to gather multi-perspective insights on options',
        'Use **pattern** if architectural patterns are relevant',
        'Apply **decide** with weighted criteria for final evaluation',
        'Use **trace** to document final decision and rationale',
      ],
    },

    // Variant B: Minimal/concise guidance
    B: {
      template: `# Decision: {decision}

**Options:** {options}
**Constraints:** {constraints}

I'll help you evaluate this decision systematically.

**Quick assessment:**
1. What's the timeline for this decision?
2. How reversible is it?
3. Who are the key stakeholders?

Let's define our evaluation criteria.`,
      toolGuidance: [
        'trace → council → decide → document',
      ],
    },
  },
};

export default designDecisionPrompt;
