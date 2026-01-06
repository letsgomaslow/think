/**
 * Debug Issue Prompt
 *
 * Guides users through systematic debugging using think-mcp tools.
 * Supports A/B variants for testing different levels of guidance detail.
 */

import { PromptDefinition } from './types';

/**
 * Debug Issue prompt definition
 */
export const debugIssuePrompt: PromptDefinition = {
  name: 'debug-issue',
  description: 'Debug a technical issue systematically using structured debugging approaches. Helps identify root causes and verify fixes.',
  arguments: [
    {
      name: 'issue',
      description: 'Description of the issue or bug',
      required: true,
    },
    {
      name: 'observed_behavior',
      description: 'What is actually happening',
      required: false,
    },
    {
      name: 'expected_behavior',
      description: 'What should be happening',
      required: false,
    },
  ],
  variants: {
    // Variant A: Detailed with examples and comprehensive guidance
    A: {
      systemContext: `I'll help you debug this issue systematically using think-mcp's debugging tools. A structured approach helps avoid common debugging pitfalls like fixing symptoms instead of causes.`,
      template: `# Debugging Session

## Issue Description
{issue}

## Observed Behavior
{observed_behavior}

## Expected Behavior
{expected_behavior}

---

I'll guide you through a systematic debugging process:

### Step 1: Issue Characterization
First, let's fully understand the issue using the **trace** tool:
- When does it occur? (always, sometimes, specific conditions)
- What changed recently? (code, config, environment)
- What have you already tried?

### Step 2: Select Debugging Approach
Based on the issue type, we'll use the **debug** tool with the most appropriate approach:

| Issue Type | Recommended Approach |
|------------|---------------------|
| Regression (worked before) | **binary_search** - Find the breaking change |
| Multi-component system | **divide_conquer** - Isolate the failing component |
| Wrong output/data | **backtracking** - Trace data flow backwards |
| Intermittent/flaky | **cause_elimination** - Systematically test hypotheses |
| Unknown system behavior | **reverse_engineering** - Build understanding |
| Specific variable wrong | **program_slicing** - Find all affecting code |
| Bug location unknown | **wolf_fence** - Binary isolation to narrow down |
| Stuck with no clear steps | **rubber_duck** - Explain step-by-step to find assumptions |
| Complex bug report/input | **delta_debugging** - Minimize to simplest failing case |
| Multi-factor system failure | **fault_tree** - Map all failure paths systematically |
| State corruption/race condition | **time_travel** - Record and replay execution states |

### Step 3: Apply Debugging Method
We'll apply the chosen approach step by step, documenting findings with **trace**.

### Step 4: Hypothesis Testing
Use the **hypothesis** tool to:
- Formulate testable hypotheses
- Design minimal experiments
- Verify the root cause

### Step 5: Solution Verification
After implementing a fix:
- Verify the original issue is resolved
- Check for regression in related functionality
- Document the root cause and fix

Let's start by characterizing the issue. What's the pattern of occurrence?`,
      toolGuidance: [
        'Use **trace** to document issue symptoms and reproduction steps',
        'Apply **debug** with appropriate approach from 11 methodologies (binary_search, divide_conquer, wolf_fence, rubber_duck, delta_debugging, fault_tree, time_travel, etc.)',
        'Use **hypothesis** to formulate and test theories about the cause',
        'Apply **debug** (rubber_duck) when stuck to explain the problem step by step',
        'Use **trace** to document the fix and verify it resolves the issue',
      ],
    },

    // Variant B: Minimal/concise guidance
    B: {
      template: `# Debug: {issue}

**Observed:** {observed_behavior}
**Expected:** {expected_behavior}

I'll help you debug this systematically.

**Quick diagnostic:**
1. When did this start?
2. What changed recently?
3. Is it reproducible?

Based on your answers, we'll select the best debugging approach.`,
      toolGuidance: [
        'trace → debug → hypothesis → verify',
      ],
    },
  },
};

export default debugIssuePrompt;
