/**
 * Analyze Problem Prompt
 *
 * Guides users through structured problem analysis using think-mcp tools.
 * Supports A/B variants for testing different levels of guidance detail.
 */

import { PromptDefinition } from './types';

/**
 * Analyze Problem prompt definition
 */
export const analyzeProblePrompt: PromptDefinition = {
  name: 'analyze-problem',
  description: 'Analyze a complex problem using structured thinking tools. Guides you through breaking down the problem, identifying root causes, and developing solutions.',
  arguments: [
    {
      name: 'problem',
      description: 'The problem you want to analyze',
      required: true,
    },
    {
      name: 'context',
      description: 'Additional context or constraints',
      required: false,
    },
  ],
  variants: {
    // Variant A: Detailed with examples and step-by-step guidance
    A: {
      systemContext: `I'll help you analyze this problem systematically using think-mcp's structured thinking tools. This approach helps ensure we don't miss important aspects and develop well-reasoned solutions.`,
      template: `# Problem Analysis Request

## Problem Statement
{problem}

## Additional Context
{context}

---

I'll guide you through a structured analysis using the following approach:

### Phase 1: Problem Decomposition
First, we'll break down the problem using the **trace** tool to capture our thinking step by step. This helps us:
- Identify all components of the problem
- Surface hidden assumptions
- Track our reasoning for later review

### Phase 2: Mental Model Application
Based on the problem type, we'll apply appropriate mental models using the **model** tool:
- **First Principles**: If we need to challenge assumptions
- **Opportunity Cost**: If we're choosing between options
- **Pareto Principle**: If we need to prioritize

### Phase 3: Multi-Perspective Analysis
For complex problems, we'll use the **council** tool to simulate expert perspectives:
- Different stakeholder viewpoints
- Potential blind spots
- Diverse solution approaches

### Phase 4: Decision Framework
If the problem requires a decision, we'll use the **decide** tool to:
- Evaluate options systematically
- Apply consistent criteria
- Document our rationale

Let's begin with Phase 1. Please confirm this approach or suggest modifications.`,
      toolGuidance: [
        'Use **trace** to document initial problem decomposition',
        'Apply **model** with appropriate mental model based on problem type',
        'Use **council** for multi-stakeholder analysis if needed',
        'Apply **decide** if problem requires choosing between options',
        'Use **reflect** to verify our reasoning quality',
      ],
    },

    // Variant B: Minimal/concise guidance
    B: {
      template: `# Analyze: {problem}

Context: {context}

I'll help you analyze this problem systematically.

**Approach:**
1. Break down the problem components
2. Apply relevant mental models
3. Consider multiple perspectives
4. Develop actionable solutions

Which aspect would you like to start with?`,
      toolGuidance: [
        'trace → model → council → decide',
      ],
    },
  },
};

export default analyzeProblePrompt;
