/**
 * Review Architecture Prompt
 *
 * Guides users through structured architecture review using think-mcp tools.
 * Supports A/B variants for testing different levels of guidance detail.
 */

import { PromptDefinition } from './types';

/**
 * Review Architecture prompt definition
 */
export const reviewArchitecturePrompt: PromptDefinition = {
  name: 'review-architecture',
  description: 'Review a system architecture systematically. Helps identify issues, evaluate quality attributes, and suggest improvements.',
  arguments: [
    {
      name: 'system',
      description: 'The system or component to review',
      required: true,
    },
    {
      name: 'focus_areas',
      description: 'Specific areas to focus on (e.g., scalability, security)',
      required: false,
    },
    {
      name: 'context',
      description: 'Current state, recent changes, or concerns',
      required: false,
    },
  ],
  variants: {
    // Variant A: Detailed with comprehensive review framework
    A: {
      systemContext: `I'll help you review this architecture systematically using think-mcp's analysis tools. A structured review helps identify issues early and ensures quality attributes are met.`,
      template: `# Architecture Review

## System Under Review
{system}

## Focus Areas
{focus_areas}

## Context
{context}

---

I'll guide you through a comprehensive architecture review:

### Phase 1: System Understanding
First, we'll build a shared mental model using the **map** tool:
- Component diagram
- Data flow
- Integration points
- Deployment topology

### Phase 2: Quality Attribute Analysis
We'll evaluate key architectural qualities using the **pattern** tool:

| Quality Attribute | Assessment Areas |
|-------------------|------------------|
| **Scalability** | Bottlenecks, scaling mechanisms, data partitioning |
| **Reliability** | Failure modes, redundancy, recovery procedures |
| **Security** | Attack surface, authentication, data protection |
| **Maintainability** | Coupling, cohesion, technical debt |
| **Performance** | Latency paths, resource usage, caching |

### Phase 3: Pattern Recognition
We'll identify architectural patterns and anti-patterns:
- Which design patterns are used effectively?
- Are there anti-patterns causing issues?
- Are patterns consistent across the system?

### Phase 4: Risk Assessment
Using the **council** tool with expert perspectives:
- Security Engineer: Vulnerabilities and threats
- SRE/DevOps: Operational concerns
- Developer: Implementation complexity
- Architect: Structural integrity

### Phase 5: Recommendations
We'll synthesize findings into:
- Critical issues (address immediately)
- Improvements (plan for future)
- Technical debt items
- Documentation gaps

Let's start with Phase 1. Can you describe the main components and how they interact?`,
      toolGuidance: [
        'Use **map** to visualize current architecture',
        'Apply **pattern** to identify architectural patterns in use',
        'Use **council** for multi-perspective risk assessment',
        'Apply **model** (error_propagation) to trace failure modes',
        'Use **trace** to document findings and recommendations',
      ],
    },

    // Variant B: Minimal/concise guidance
    B: {
      template: `# Architecture Review: {system}

**Focus:** {focus_areas}
**Context:** {context}

I'll help you review this architecture systematically.

**Quick overview questions:**
1. What are the main components?
2. What are your primary concerns?
3. Have there been recent issues?

Let's start mapping the system.`,
      toolGuidance: [
        'map → pattern → council → recommendations',
      ],
    },
  },
};

export default reviewArchitecturePrompt;
