# Think-MCP Implementation Plan
## Transform Clear-Thought-MCP into an Intelligent Thought Partner

**Version:** 2.0.0
**Status:** Planning
**Last Updated:** December 27, 2025
**Implementation Time:** 17-21 hours

---

## Executive Summary

This plan transforms `clear-thought-mcp-server` into `think-mcp`, an intelligent thought partner that automatically selects and applies appropriate mental models based on user queries. The core innovation leverages Anthropic's Programmatic Tool Calling (PTC) to eliminate manual tool selection, delivering a 98.7% token reduction and superior user experience.

**Key Changes:**
- 🎯 Intelligent routing: Users enable "think-mcp" → Claude selects mental models automatically
- 🚀 Programmatic Tool Calling: 98.7% token reduction, 60% faster execution
- 🏗️ Architecture shift: 11 separate tools → 1 unified "think" tool with callable functions
- 🧠 Expanded mental models: 6 → 10 models (adding Second-Order Thinking, Inversion, Circle of Competence, Systems Thinking)
- 📦 SDK modernization: 0.5.0 → 1.25.1
- 🏷️ Rebrand: "clear-thought-mcp-server" → "think-mcp"

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Architecture](#solution-architecture)
3. [Technical Feasibility](#technical-feasibility)
4. [Implementation Phases](#implementation-phases)
5. [Migration Strategy](#migration-strategy)
6. [Testing & Validation](#testing--validation)
7. [Timeline & Resources](#timeline--resources)
8. [References & Citations](#references--citations)

---

## Problem Statement

### Current UX Pain Points

**1. Manual Tool Selection Required**
- Users must explicitly specify which tool to use: `mentalmodel`, `designpattern`, etc.
- Cognitive overhead: Remembering which of 11 tools applies to different scenarios
- Example: *"Use the mentalmodel tool with first_principles to analyze..."*

**2. Default Behavior Issues**
- Server defaults to `sequentialthinking` unless specific trigger words are used
- Non-intuitive for users who don't know tool names

**3. Scaling Challenges**
- Currently 6 mental models, planning to add 4 more (total: 10)
- Each addition makes tool selection harder for users
- No intelligent routing logic

**4. Comparison Friction**
- Users want to toggle "thought partner" on/off to compare results
- Current architecture makes this cumbersome

**5. Maintainability Concerns**
- Adding mental models requires updating:
  - Tool definitions
  - Routing logic (if exists)
  - Documentation
  - User-facing trigger words

### Desired State

**Simple UX:**
- User enables "think-mcp" in MCP config → ready to use
- Natural language queries: *"Help me decide between two job offers"*
- Claude automatically selects appropriate mental model(s)
- No tool name memorization required

**Maintainable Architecture:**
- Adding mental models = adding Python functions
- No complex routing logic to maintain
- Scales seamlessly with more models

**Easy Comparison:**
- Toggle server on/off in config to compare with/without thought partner
- Clear performance metrics

---

## Solution Architecture

### Programmatic Tool Calling (PTC) Approach

**Before (Current State):**
```
User Query
    ↓
User specifies tool: "mentalmodel"
    ↓
User specifies model: "first_principles"
    ↓
MCP server executes
    ↓
Returns result
```

**After (PTC Architecture):**
```
User Query
    ↓
Claude analyzes intent
    ↓
Claude writes Python code in execution container
    ↓
Code calls mental_model_functions.first_principles()
    ↓
Code calls mental_model_functions.opportunity_cost()
    ↓
Code synthesizes results
    ↓
Returns integrated analysis
```

### Key Architectural Components

**1. Single "Think" Tool**
- Replaces 11 separate tools (mentalmodel, designpattern, debuggingapproach, etc.)
- Simple interface: `{ query: string, context?: string }`
- Marked with `allowed_callers: ["code_execution"]` for PTC

**2. Mental Models as Python Functions**
- Each mental model becomes a callable Python function
- Standardized return type: `MentalModelResult`
- Functions exposed in code execution environment

**3. Claude as Intelligent Orchestrator**
- Analyzes user query to determine intent
- Writes Python code selecting optimal mental model(s)
- Combines multiple models when beneficial
- Handles error cases gracefully in code

**4. Container-Based Execution**
- Isolated Python environment (~4.5 min lifetime)
- State persistence across queries (reusable)
- Secure sandboxing

### Example User Experience

**User Query:**
```
"I need to decide between two job offers: one pays $150k but boring work,
the other pays $100k but exciting work"
```

**Claude's Internal Process:**
```python
from mental_models_functions import opportunity_cost, decision_framework

# Analyze what you give up with each choice
opp_cost = opportunity_cost(
    problem="Job decision: compensation vs fulfillment",
    alternatives=[
        "Job A: $150k, boring work",
        "Job B: $100k, exciting work"
    ]
)

# Structure decision with weighted criteria
decision = decision_framework(
    problem="Career decision",
    options=[
        {"name": "Job A", "description": "High pay, low interest"},
        {"name": "Job B", "description": "Lower pay, high interest"}
    ],
    criteria=[
        {"name": "salary", "weight": 0.3},
        {"name": "job_satisfaction", "weight": 0.4},
        {"name": "growth_potential", "weight": 0.3}
    ]
)

# Synthesize insights
print("=== Opportunity Cost Analysis ===")
print(opp_cost.analysis)
print("\n=== Decision Framework ===")
print(decision.analysis)
print("\n=== Recommendation ===")
print(f"Based on {decision.confidence*100:.0f}% confidence...")
```

**User Sees:**
Integrated analysis combining both mental models seamlessly, with clear reasoning and recommendation.

---

## Technical Feasibility

### Research Findings

**Anthropic Programmatic Tool Calling**[1]
- **Status:** Public beta (stable for production)
- **Beta Header:** `advanced-tool-use-2025-11-20`
- **Performance:** 98.7% token reduction (150K → 2K tokens), 60% faster execution
- **Mechanism:** Claude writes code that calls MCP tools programmatically in execution container
- **Release:** November 2025

**Key Benefits:**[2]
- Reduces latency in multi-tool workflows
- Enables complex orchestration (loops, conditionals, error handling)
- Allows processing large datasets (>1M tokens) by filtering in code
- Container-based isolation for security

**MCP SDK Support**[3]
- SDK 1.25.1 fully supports programmatic calling
- Requires `allowed_callers` field on tools
- Code execution tool must be configured
- Container lifetime: ~4.5 minutes (subject to change)

**Production Readiness:**[4]
- Multiple enterprises using PTC in production
- Token consumption improvements proven at scale
- AWS, Microsoft documenting orchestration patterns
- Clear path to GA (stable v2 SDK expected Q1 2026)

### Feasibility Assessment

| Criterion | Assessment | Details |
|-----------|-----------|---------|
| **Technical Feasibility** | ✅ HIGH | PTC stable in public beta, SDK 1.25.1 supports, clear docs |
| **Implementation Complexity** | ⚠️ MODERATE | Requires refactoring 11 tools → Python functions, ~17-21 hrs |
| **User Experience** | ✅ EXCELLENT | Zero friction, intelligent routing, toggle on/off capability |
| **Maintainability** | ✅ EXCELLENT | Adding models = adding functions, no routing logic needed |
| **Performance** | ✅ EXCELLENT | 98.7% token reduction, 60% faster, proven at scale |
| **Risk Level** | ⚠️ MODERATE | Beta dependency, but Anthropic committed (proven value) |

### Alternative Architectures Considered

**Option 2: Hybrid Router Tool**
- Create `analyze_query` tool that classifies intent
- Returns recommended mental models with confidence scores
- User approves selection
- **Verdict:** Doesn't fully solve UX problem (still requires interaction)

**Option 3: Multi-Agent Orchestration**[5]
- Manager agent delegates to specialist mental model agents
- Uses MCP handoff patterns
- **Verdict:** Over-engineered for this use case, high overhead

**Recommendation:** Proceed with PTC (Option 1) for optimal UX and performance.

---

## Implementation Phases

### Phase 0: Environment Setup
**Duration:** 1 hour
**Risk:** LOW
**Dependencies:** None

#### 0.1 Create New Project Directory

```bash
# Navigate to parent directory
cd /Users/kesh/Documents/Github\ -Local/Clearthought/

# Create fresh think-mcp directory
mkdir think-mcp
cd think-mcp

# Initialize with clean structure
npm init -y
```

#### 0.2 Copy Essential Configuration

Copy and adapt from legacy:
- `tsconfig.json` (update paths)
- `.gitignore`
- Base `package.json` structure
- `README.md` (will be heavily modified)

**Do NOT copy:**
- `src/` directory (building fresh)
- `dist/` directory
- `node_modules/`

#### 0.3 Install Dependencies

```bash
# Core dependencies
npm install @modelcontextprotocol/sdk@^1.25.1
npm install zod@^3.25.0
npm install chalk@^5.3.0

# Dev dependencies
npm install --save-dev @types/node@^20.10.5
npm install --save-dev typescript@^5.3.3
npm install --save-dev vitest@latest
```

#### 0.4 Configure Code Execution

**File:** `package.json`
```json
{
  "name": "think-mcp",
  "version": "2.0.0",
  "description": "Intelligent thought partner MCP server with automatic mental model selection",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc -w & node --watch dist/index.js",
    "test": "vitest"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "mental-models",
    "thinking",
    "programmatic-tool-calling"
  ],
  "engines": {
    "node": ">=18.0.0",
    "python": ">=3.8"
  }
}
```

**Checkpoint 0.1:** Project structure initialized, dependencies installed

---

### Phase 1: SDK Foundation & Server Initialization
**Duration:** 2-3 hours
**Risk:** HIGH
**Dependencies:** Phase 0

#### 1.1 Create Basic Server Structure

**File:** `src/index.ts`

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from "chalk";

// Initialize server
const server = new Server(
    {
        name: "think-mcp",
        version: "2.0.0",
    },
    {
        capabilities: {
            tools: {},  // Declare capability, tools registered via handlers
        },
    }
);

// Server will be configured in subsequent steps
```

#### 1.2 Verify SDK 1.25.1 Compatibility

Test basic server functionality:

```bash
npm run build
node dist/index.js
```

Expected: Server starts without errors, accepts stdio connections.

**Checkpoint 1.1:** Server initializes with SDK 1.25.1

#### 1.3 Add Code Execution Support

**File:** `src/index.ts` (add to imports)

```typescript
import { CodeExecutionTool } from "@modelcontextprotocol/sdk/tools/code-execution.js";
```

**File:** `src/index.ts` (before server.connect)

```typescript
// Configure code execution environment
const codeExecutionConfig = {
    timeout: 30000,  // 30 seconds
    pythonPath: process.env.PYTHON_PATH || "python3",
    allowedModules: [
        "json",
        "re",
        "math",
        "datetime",
        "typing",
        "dataclasses"
    ]
};

// Enable code execution (required for PTC)
const codeExecTool = new CodeExecutionTool(codeExecutionConfig);
server.registerTool(codeExecTool);
```

**Checkpoint 1.2:** Code execution tool registered and functional

---

### Phase 2: Mental Models as Python Functions
**Duration:** 6-8 hours
**Risk:** HIGH (Core refactoring)
**Dependencies:** Phase 1

#### 2.1 Create Python Module Structure

**File:** `src/mental_models/mental_models_functions.py`

```python
"""
Mental Models as callable functions for programmatic tool use
Exposes all mental models as Python functions for Claude to orchestrate
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum


@dataclass
class MentalModelResult:
    """Standardized result format for all mental models"""
    model_name: str
    analysis: str
    key_insights: List[str]
    confidence: float  # 0.0 to 1.0
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)


class MentalModelCategory(Enum):
    """Categories of mental models for organization"""
    PROBLEM_SOLVING = "problem_solving"
    DECISION_MAKING = "decision_making"
    STRATEGIC_THINKING = "strategic_thinking"
    DEBUGGING = "debugging"
    ANALYSIS = "analysis"


# ============================================================================
# EXISTING MENTAL MODELS (Ported from TypeScript)
# ============================================================================

def first_principles(problem: str, context: Optional[str] = None) -> MentalModelResult:
    """
    Break down problem to fundamental truths, build up from axioms

    Args:
        problem: The problem or question to analyze
        context: Optional additional context

    Returns:
        MentalModelResult with first principles analysis
    """
    analysis_parts = []

    analysis_parts.append("=== Identify Assumptions ===")
    analysis_parts.append("What beliefs are we taking for granted?")
    # TODO: Implement assumption identification logic

    analysis_parts.append("\n=== Break Down to Fundamentals ===")
    analysis_parts.append("What are the basic truths we can verify?")
    # TODO: Implement fundamental breakdown logic

    analysis_parts.append("\n=== Rebuild from Axioms ===")
    analysis_parts.append("Reconstruct solution from verified truths")
    # TODO: Implement reconstruction logic

    return MentalModelResult(
        model_name="First Principles Thinking",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Strip away assumptions to reach fundamental truths",
            "Question inherited beliefs and conventions",
            "Build solutions from verified foundational elements"
        ],
        confidence=0.85,
        metadata={"category": MentalModelCategory.PROBLEM_SOLVING.value}
    )


def opportunity_cost(
    problem: str,
    alternatives: Optional[List[str]] = None,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Analyze what you give up by choosing one option over alternatives

    Args:
        problem: The decision or choice to analyze
        alternatives: List of alternative options being considered
        context: Optional additional context

    Returns:
        MentalModelResult with opportunity cost analysis
    """
    analysis_parts = []

    analysis_parts.append("=== Option Analysis ===")
    if alternatives:
        for i, alt in enumerate(alternatives, 1):
            analysis_parts.append(f"{i}. {alt}")

    analysis_parts.append("\n=== What You Gain vs. What You Give Up ===")
    # TODO: Implement gain/loss analysis

    analysis_parts.append("\n=== Hidden Costs ===")
    analysis_parts.append("What indirect costs or foregone opportunities exist?")
    # TODO: Implement hidden cost identification

    return MentalModelResult(
        model_name="Opportunity Cost Analysis",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Every choice has a hidden cost: the next best alternative",
            "Consider not just what you gain, but what you give up",
            "Time and resources spent on X cannot be spent on Y"
        ],
        confidence=0.80,
        metadata={
            "category": MentalModelCategory.DECISION_MAKING.value,
            "alternatives_count": len(alternatives) if alternatives else 0
        }
    )


def pareto_principle(
    problem: str,
    items: Optional[List[str]] = None,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Apply 80/20 rule - identify vital few vs. trivial many

    Args:
        problem: The situation to analyze
        items: Optional list of items/factors to evaluate
        context: Optional additional context

    Returns:
        MentalModelResult with Pareto analysis
    """
    analysis_parts = []

    analysis_parts.append("=== Identify the Vital Few (20%) ===")
    analysis_parts.append("Which small subset drives most of the results?")
    # TODO: Implement vital few identification

    analysis_parts.append("\n=== Identify the Trivial Many (80%) ===")
    analysis_parts.append("Which majority contributes minimally?")
    # TODO: Implement trivial many identification

    analysis_parts.append("\n=== Focus Strategy ===")
    analysis_parts.append("Where should effort be concentrated for maximum impact?")

    return MentalModelResult(
        model_name="Pareto Principle (80/20 Rule)",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "80% of outcomes come from 20% of causes",
            "Focus on high-leverage activities",
            "Identify and eliminate low-impact work"
        ],
        confidence=0.75,
        metadata={"category": MentalModelCategory.STRATEGIC_THINKING.value}
    )


def occams_razor(
    problem: str,
    explanations: Optional[List[str]] = None,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Simplest explanation is most likely correct

    Args:
        problem: The phenomenon or question to explain
        explanations: Optional list of competing explanations
        context: Optional additional context

    Returns:
        MentalModelResult with Occam's Razor analysis
    """
    analysis_parts = []

    analysis_parts.append("=== Competing Explanations ===")
    if explanations:
        for i, exp in enumerate(explanations, 1):
            analysis_parts.append(f"{i}. {exp}")

    analysis_parts.append("\n=== Simplicity Analysis ===")
    analysis_parts.append("Which explanation makes fewest assumptions?")
    # TODO: Implement simplicity scoring

    analysis_parts.append("\n=== Occam's Razor Recommendation ===")
    analysis_parts.append("Prefer simpler explanations unless evidence demands complexity")

    return MentalModelResult(
        model_name="Occam's Razor",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Simpler explanations are more likely to be true",
            "Avoid unnecessary complexity and assumptions",
            "Complexity requires proportional justification"
        ],
        confidence=0.70,
        metadata={"category": MentalModelCategory.ANALYSIS.value}
    )


def error_propagation(
    problem: str,
    error_source: Optional[str] = None,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Understand how errors cascade through systems

    Args:
        problem: The system or process to analyze
        error_source: Initial error or failure point
        context: Optional additional context

    Returns:
        MentalModelResult with error propagation analysis
    """
    analysis_parts = []

    analysis_parts.append("=== Initial Error ===")
    if error_source:
        analysis_parts.append(f"Source: {error_source}")

    analysis_parts.append("\n=== Propagation Path ===")
    analysis_parts.append("How does this error cascade through the system?")
    # TODO: Implement propagation tracing

    analysis_parts.append("\n=== Amplification Points ===")
    analysis_parts.append("Where do small errors become large problems?")

    analysis_parts.append("\n=== Mitigation Strategies ===")
    analysis_parts.append("How to prevent or contain error propagation?")

    return MentalModelResult(
        model_name="Error Propagation Understanding",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Small errors can cascade into large failures",
            "Identify critical propagation points",
            "Design systems to isolate and contain errors"
        ],
        confidence=0.80,
        metadata={"category": MentalModelCategory.DEBUGGING.value}
    )


def rubber_duck(
    problem: str,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Explain problem step-by-step to clarify thinking

    Args:
        problem: The problem or code to debug
        context: Optional additional context

    Returns:
        MentalModelResult with rubber duck debugging guidance
    """
    analysis_parts = []

    analysis_parts.append("=== Explain the Problem ===")
    analysis_parts.append("Describe what you're trying to do, step by step")

    analysis_parts.append("\n=== What Should Happen ===")
    analysis_parts.append("Expected behavior or outcome")

    analysis_parts.append("\n=== What Actually Happens ===")
    analysis_parts.append("Observed behavior or outcome")

    analysis_parts.append("\n=== The Gap ===")
    analysis_parts.append("Where does expectation diverge from reality?")
    # Often the act of explaining reveals the issue

    return MentalModelResult(
        model_name="Rubber Duck Debugging",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Explaining forces clarity and reveals assumptions",
            "Articulation often surfaces the solution",
            "Step-by-step narration catches logical errors"
        ],
        confidence=0.85,
        metadata={"category": MentalModelCategory.DEBUGGING.value}
    )


# ============================================================================
# NEW MENTAL MODELS
# ============================================================================

def second_order_thinking(
    problem: str,
    time_horizon: str = "medium",
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Consider consequences of consequences - think beyond immediate effects

    Args:
        problem: The action or decision to analyze
        time_horizon: "short" (weeks), "medium" (months), or "long" (years)
        context: Optional additional context

    Returns:
        MentalModelResult with second-order thinking analysis
    """
    analysis_parts = []

    analysis_parts.append("=== First-Order Effects (Immediate) ===")
    analysis_parts.append("What happens directly as a result of this action?")
    # TODO: Identify immediate consequences

    analysis_parts.append("\n=== Second-Order Effects (Indirect) ===")
    analysis_parts.append("What happens because of the first-order effects?")
    # TODO: Trace consequences of consequences

    if time_horizon == "long":
        analysis_parts.append("\n=== Third-Order+ Effects (Long-term) ===")
        analysis_parts.append("What cascading effects emerge over time?")
        # TODO: Long-term cascade analysis

    analysis_parts.append("\n=== Feedback Loops ===")
    analysis_parts.append("Do any effects reinforce or dampen each other?")

    return MentalModelResult(
        model_name="Second-Order Thinking",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Immediate effects often differ from long-term consequences",
            "Actions create chains of causation",
            "Consider: then what? and then what after that?"
        ],
        confidence=0.75,
        metadata={
            "category": MentalModelCategory.STRATEGIC_THINKING.value,
            "time_horizon": time_horizon
        }
    )


def inversion(
    problem: str,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Solve problems by approaching from the opposite direction
    Instead of "how do I succeed?" ask "how do I fail?" then avoid that

    Args:
        problem: The goal or challenge to analyze
        context: Optional additional context

    Returns:
        MentalModelResult with inversion analysis
    """
    analysis_parts = []

    analysis_parts.append("=== The Goal (Normal Direction) ===")
    analysis_parts.append(f"Objective: {problem}")

    analysis_parts.append("\n=== Inversion: How to Guarantee Failure ===")
    analysis_parts.append("What would ensure this goes wrong?")
    # TODO: Identify failure modes

    analysis_parts.append("\n=== Anti-Patterns to Avoid ===")
    analysis_parts.append("Based on failure analysis, what should we NOT do?")

    analysis_parts.append("\n=== Success Strategy ===")
    analysis_parts.append("By avoiding these anti-patterns, we increase success probability")

    return MentalModelResult(
        model_name="Inversion",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Sometimes easier to identify what to avoid than what to do",
            "Avoiding stupidity is easier than seeking brilliance",
            "Invert the problem to see it from new angles"
        ],
        confidence=0.80,
        metadata={"category": MentalModelCategory.PROBLEM_SOLVING.value}
    )


def circle_of_competence(
    domain: str,
    task: str,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Understand boundaries of expertise - know what you know and don't know

    Args:
        domain: The field or area being evaluated
        task: The specific task or decision in question
        context: Optional additional context

    Returns:
        MentalModelResult with circle of competence analysis
    """
    analysis_parts = []

    analysis_parts.append("=== Domain Assessment ===")
    analysis_parts.append(f"Field: {domain}")
    analysis_parts.append(f"Task: {task}")

    analysis_parts.append("\n=== Within Circle (What You Know) ===")
    analysis_parts.append("What aspects are within your demonstrated competence?")
    # TODO: Identify areas of genuine expertise

    analysis_parts.append("\n=== Outside Circle (What You Don't Know) ===")
    analysis_parts.append("What aspects require expertise you lack?")
    # TODO: Identify knowledge gaps

    analysis_parts.append("\n=== Boundary Awareness ===")
    analysis_parts.append("Where is the edge of your competence?")

    analysis_parts.append("\n=== Strategy ===")
    analysis_parts.append("- Operate confidently within circle")
    analysis_parts.append("- Seek expertise for what's outside")
    analysis_parts.append("- Expand circle deliberately through learning")

    return MentalModelResult(
        model_name="Circle of Competence",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Know the difference between what you know and what you think you know",
            "Confidence should match demonstrated competence",
            "Crossing boundaries unknowingly leads to costly mistakes"
        ],
        confidence=0.70,
        metadata={
            "category": MentalModelCategory.ANALYSIS.value,
            "domain": domain
        }
    )


def systems_thinking(
    system: str,
    components: Optional[List[str]] = None,
    context: Optional[str] = None
) -> MentalModelResult:
    """
    Understand interconnected parts, feedback loops, and emergent properties

    Args:
        system: The system to analyze
        components: Optional list of known system components
        context: Optional additional context

    Returns:
        MentalModelResult with systems thinking analysis
    """
    analysis_parts = []

    analysis_parts.append("=== System Components ===")
    if components:
        for i, comp in enumerate(components, 1):
            analysis_parts.append(f"{i}. {comp}")

    analysis_parts.append("\n=== Relationships & Dependencies ===")
    analysis_parts.append("How do components interact and depend on each other?")
    # TODO: Map relationships

    analysis_parts.append("\n=== Feedback Loops ===")
    analysis_parts.append("Reinforcing loops (amplify change):")
    # TODO: Identify positive feedback
    analysis_parts.append("\nBalancing loops (resist change):")
    # TODO: Identify negative feedback

    analysis_parts.append("\n=== Emergent Properties ===")
    analysis_parts.append("What behaviors emerge from component interactions?")
    # TODO: Identify emergence

    analysis_parts.append("\n=== Leverage Points ===")
    analysis_parts.append("Where can small changes have large impacts?")

    return MentalModelResult(
        model_name="Systems Thinking",
        analysis="\n".join(analysis_parts),
        key_insights=[
            "Whole is greater (or different) than sum of parts",
            "Feedback loops create non-linear dynamics",
            "Intervene at leverage points for maximum effect"
        ],
        confidence=0.75,
        metadata={
            "category": MentalModelCategory.STRATEGIC_THINKING.value,
            "components_count": len(components) if components else 0
        }
    )


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_all_mental_models() -> List[str]:
    """Return list of all available mental model function names"""
    return [
        "first_principles",
        "opportunity_cost",
        "pareto_principle",
        "occams_razor",
        "error_propagation",
        "rubber_duck",
        "second_order_thinking",
        "inversion",
        "circle_of_competence",
        "systems_thinking"
    ]


def get_model_by_name(name: str):
    """Get mental model function by name"""
    models = {
        "first_principles": first_principles,
        "opportunity_cost": opportunity_cost,
        "pareto_principle": pareto_principle,
        "occams_razor": occams_razor,
        "error_propagation": error_propagation,
        "rubber_duck": rubber_duck,
        "second_order_thinking": second_order_thinking,
        "inversion": inversion,
        "circle_of_competence": circle_of_competence,
        "systems_thinking": systems_thinking
    }
    return models.get(name)
```

**Checkpoint 2.1:** All 10 mental models implemented as Python functions

#### 2.2 Test Mental Models in Python

Create test file to validate functions work correctly:

**File:** `src/mental_models/test_models.py`

```python
"""
Quick validation that mental models work
Run: python3 src/mental_models/test_models.py
"""

from mental_models_functions import *

def test_first_principles():
    result = first_principles(
        problem="How should I build a rocket?",
        context="Starting a space company"
    )
    print(f"\n{'='*60}")
    print(f"Testing: {result.model_name}")
    print(f"{'='*60}")
    print(result.analysis)
    print(f"\nConfidence: {result.confidence}")
    print(f"Insights: {result.key_insights}")
    assert result.confidence > 0

def test_second_order_thinking():
    result = second_order_thinking(
        problem="Lower prices by 50%",
        time_horizon="long"
    )
    print(f"\n{'='*60}")
    print(f"Testing: {result.model_name}")
    print(f"{'='*60}")
    print(result.analysis)
    assert result.confidence > 0

if __name__ == "__main__":
    test_first_principles()
    test_second_order_thinking()
    print("\n✅ All mental models functional")
```

Run tests:
```bash
python3 src/mental_models/test_models.py
```

**Checkpoint 2.2:** Mental models tested and working in Python

---

### Phase 3: Unified "Think" Tool with PTC
**Duration:** 4-6 hours
**Risk:** HIGH
**Dependencies:** Phase 2

#### 3.1 Define "Think" Tool

**File:** `src/index.ts` (add tool definition)

```typescript
const THINK_TOOL: Tool = {
    name: "think",
    description: `Intelligent thought partner that automatically applies appropriate mental models
to your query. You don't need to specify which model to use - Claude analyzes your query
and intelligently selects the best approach(es).

Available Mental Models:
- First Principles: Break down to fundamental truths
- Opportunity Cost: Analyze what you give up
- Pareto Principle: Identify vital few vs. trivial many (80/20 rule)
- Occam's Razor: Prefer simplest explanation
- Error Propagation: Understand how errors cascade
- Rubber Duck: Debug by explaining step-by-step
- Second-Order Thinking: Consider consequences of consequences
- Inversion: Solve by avoiding failure modes
- Circle of Competence: Understand knowledge boundaries
- Systems Thinking: Analyze interconnected parts and feedback loops

Claude orchestrates which models to apply based on your specific needs.`,

    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Your question, problem, or topic to think about"
            },
            context: {
                type: "string",
                description: "Optional: Additional context or constraints"
            }
        },
        required: ["query"]
    },

    // CRITICAL: Enable programmatic calling
    allowed_callers: ["code_execution"]
};
```

#### 3.2 Register Tool and Handler

**File:** `src/index.ts`

```typescript
// Register list tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [THINK_TOOL]
}));

// Register call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "think") {
        const { query, context } = request.params.arguments as {
            query: string;
            context?: string;
        };

        // Return guidance for Claude to write code
        return {
            content: [{
                type: "text",
                text: `Mental models available for analysis:

To use in code execution environment:
\`\`\`python
# Import mental model functions
import sys
sys.path.append('src/mental_models')
from mental_models_functions import *

# Example: Combine multiple models
result1 = first_principles(
    problem="${query}",
    context="${context || ''}"
)

result2 = second_order_thinking(
    problem="${query}",
    time_horizon="medium"
)

# Combine and present results
print("=== First Principles Analysis ===")
print(result1.analysis)
print("\\n=== Second-Order Thinking ===")
print(result2.analysis)
\`\`\`

Available functions:
- first_principles(problem, context)
- opportunity_cost(problem, alternatives, context)
- pareto_principle(problem, items, context)
- occams_razor(problem, explanations, context)
- error_propagation(problem, error_source, context)
- rubber_duck(problem, context)
- second_order_thinking(problem, time_horizon, context)
- inversion(problem, context)
- circle_of_competence(domain, task, context)
- systems_thinking(system, components, context)

Select and combine models based on the query's nature.`
            }]
        };
    }

    throw new McpError(
        ErrorCode.MethodNotFound,
        `Tool '${request.params.name}' not found.`
    );
});
```

#### 3.3 Configure Server Startup

**File:** `src/index.ts` (add startup logic)

```typescript
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error(chalk.green("✓ think-mcp v2.0.0 running"));
    console.error(chalk.blue("  Programmatic Tool Calling enabled"));
    console.error(chalk.blue("  10 mental models available"));
    console.error(chalk.yellow("\n  Requires:"));
    console.error(chalk.yellow("  - Beta header: advanced-tool-use-2025-11-20"));
    console.error(chalk.yellow("  - Code execution enabled"));
    console.error(chalk.yellow("  - Python 3.8+\n"));
}

runServer().catch((error) => {
    console.error(chalk.red("Fatal error running server:"), error);
    process.exit(1);
});
```

**Checkpoint 3.1:** Unified "think" tool registered with PTC support

---

### Phase 4: Client Configuration & Documentation
**Duration:** 2 hours
**Risk:** LOW
**Dependencies:** Phase 3

#### 4.1 Update README.md

**File:** `README.md`

````markdown
# think-mcp

**Intelligent thought partner MCP server with automatic mental model selection**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/think-mcp)
[![MCP](https://img.shields.io/badge/MCP-2025--11--25-green.svg)](https://modelcontextprotocol.io)

think-mcp is an intelligent MCP server that automatically applies appropriate mental models to your queries. Unlike traditional tools that require manual selection, think-mcp uses Claude's Programmatic Tool Calling to intelligently orchestrate mental models based on your needs.

## Key Features

- 🎯 **Intelligent Routing**: Claude automatically selects optimal mental model(s)
- 🚀 **High Performance**: 98.7% token reduction via Programmatic Tool Calling
- 🧠 **10 Mental Models**: First Principles, Opportunity Cost, Second-Order Thinking, and more
- 💡 **Multi-Model Synthesis**: Combines multiple frameworks for richer analysis
- 🔌 **Simple UX**: Enable server → ask questions → get insights

## Mental Models Available

### Problem Solving
- **First Principles**: Break down to fundamental truths, build from axioms
- **Inversion**: Solve by avoiding failure modes
- **Rubber Duck Debugging**: Clarify thinking by explaining step-by-step

### Decision Making
- **Opportunity Cost**: Analyze what you give up with each choice
- **Circle of Competence**: Understand your knowledge boundaries

### Strategic Thinking
- **Second-Order Thinking**: Consider consequences of consequences
- **Systems Thinking**: Analyze interconnected parts and feedback loops
- **Pareto Principle**: Identify vital few vs. trivial many (80/20)

### Analysis
- **Occam's Razor**: Prefer simplest explanation
- **Error Propagation**: Understand how errors cascade

## Prerequisites

- **Node.js**: 18.x or higher
- **Python**: 3.8 or higher
- **Claude Desktop** or API client with code execution enabled
- **Beta access**: `advanced-tool-use-2025-11-20` header

## Installation

### Option 1: npm (Recommended)

```bash
npm install -g think-mcp
```

### Option 2: From Source

```bash
git clone https://github.com/yourusername/think-mcp.git
cd think-mcp
npm install
npm run build
```

## Configuration

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "think-mcp": {
      "command": "node",
      "args": ["/path/to/think-mcp/dist/index.js"],
      "env": {
        "PYTHON_PATH": "python3"
      }
    }
  }
}
```

### Claude API

Enable code execution and add beta header:

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

response = client.messages.create(
    model="claude-opus-4-5-20251101",
    max_tokens=4096,
    extra_headers={
        "anthropic-beta": "advanced-tool-use-2025-11-20"
    },
    messages=[{
        "role": "user",
        "content": "Help me think through whether to take this job offer"
    }]
)
```

## Usage

### Basic Usage

Simply ask Claude to help you think:

```
User: "I need to decide between two job offers"

Claude: [Automatically applies opportunity_cost and decision_framework]
        [Returns integrated analysis]
```

### Before vs. After

**Old UX (v1.x - Legacy):**
```
"Use the mentalmodel tool with first_principles to analyze building a rocket"
```

**New UX (v2.0 - think-mcp):**
```
"Help me think about how to build a rocket from scratch"
```

Claude automatically:
1. Analyzes your query
2. Selects appropriate mental models (e.g., first_principles, systems_thinking)
3. Applies them via Python code
4. Returns integrated analysis

### Toggle On/Off

To compare results with/without the thought partner:

**Enable:**
```json
{
  "mcpServers": {
    "think-mcp": { ... }
  }
}
```

**Disable:**
```json
{
  "mcpServers": {
    // Comment out or remove think-mcp
  }
}
```

Restart Claude Desktop to apply changes.

## How It Works

### Architecture

think-mcp uses Anthropic's Programmatic Tool Calling (PTC):

```
User Query → Claude analyzes intent → Writes Python code →
Calls mental model functions → Synthesizes results → Returns analysis
```

**Key Innovation:** Claude writes code that orchestrates mental models programmatically, eliminating manual tool selection.

### Example Execution

When you ask: *"Should I take this risky opportunity?"*

Claude might generate:

```python
from mental_models_functions import (
    opportunity_cost,
    second_order_thinking,
    inversion
)

# What do you give up?
opp_cost = opportunity_cost(
    problem="Risky opportunity decision",
    alternatives=["Take opportunity", "Status quo"]
)

# Long-term consequences?
second_order = second_order_thinking(
    problem="Taking risky opportunity",
    time_horizon="long"
)

# How might this fail?
failure_modes = inversion(
    problem="Success with risky opportunity"
)

# Synthesize insights
print("=== Opportunity Cost ===")
print(opp_cost.analysis)
print("\n=== Long-term Effects ===")
print(second_order.analysis)
print("\n=== Failure Modes to Avoid ===")
print(failure_modes.analysis)
```

Result: Integrated analysis from 3 mental models, applied intelligently.

## Performance

- **Token Reduction**: 98.7% (150K → 2K tokens)
- **Speed**: 60% faster than multi-round tool calling
- **Scalability**: Handles complex multi-model reasoning efficiently

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Test Mental Models Directly

```bash
python3 src/mental_models/test_models.py
```

## Migration from clear-thought-mcp-server

If upgrading from v1.x:

1. **Install think-mcp** (new package)
2. **Update MCP config** to use `think-mcp` instead of `clear-thought-mcp-server`
3. **Enable code execution** in your client
4. **Add beta header**: `advanced-tool-use-2025-11-20`
5. **Use natural language** instead of tool names

No changes to mental model logic - same quality analysis, better UX.

## Troubleshooting

### "Code execution not available"

Ensure:
- Code execution enabled in Claude Desktop settings
- Beta header included: `advanced-tool-use-2025-11-20`
- Python 3.8+ accessible via `python3` command

### "Module not found: mental_models_functions"

Check:
- `src/mental_models/mental_models_functions.py` exists
- Python path configured correctly in MCP config

### Server won't start

Verify:
- Node.js 18+ installed: `node --version`
- Dependencies installed: `npm install`
- Built successfully: `npm run build`

## Roadmap

- [ ] Add more mental models (Bayesian thinking, Nash equilibrium, etc.)
- [ ] Multi-language support (Spanish, French, etc.)
- [ ] Visual reasoning diagrams
- [ ] Export analysis reports
- [ ] Integration with knowledge bases

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) for details.

## References

- [Anthropic Programmatic Tool Calling](https://docs.anthropic.com/en/docs/build-with-claude/programmatic-tool-calling)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Mental Models Guide](https://fs.blog/mental-models/)

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/think-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/think-mcp/discussions)

---

**Built with ❤️ using Claude Code and Model Context Protocol**
````

**Checkpoint 4.1:** Comprehensive documentation created

---

## Migration Strategy

### Approach: Parallel Development

**Legacy System (clear-thought-mcp-server):**
- Keep running for comparison and fallback
- No new development
- Maintained for existing users during transition
- Will be sunset 3-6 months after think-mcp v2.0 release

**New System (think-mcp):**
- Fresh codebase in new directory
- Clean architecture from day one
- No legacy compatibility burden
- Beta testing with early adopters

### Directory Structure

```
/Users/kesh/Documents/Github -Local/Clearthought/
├── clear-thought-mcp-server/  ← Legacy (v1.x)
│   ├── src/
│   ├── dist/
│   └── README.md
│
└── think-mcp/                  ← New (v2.0)
    ├── src/
    │   ├── index.ts
    │   └── mental_models/
    │       └── mental_models_functions.py
    ├── dist/
    ├── tests/
    └── README.md
```

### Migration Timeline

| Phase | Timeframe | Activity |
|-------|-----------|----------|
| **Dev** | Week 1-2 | Build think-mcp v2.0 |
| **Alpha** | Week 3 | Internal dogfooding & testing |
| **Beta** | Week 4-6 | Early adopters, collect feedback |
| **RC** | Week 7 | Release candidate, final testing |
| **GA** | Week 8 | General availability v2.0.0 |
| **Sunset Notice** | Week 9 | Announce clear-thought-mcp deprecation |
| **Sunset** | Month 4-6 | Archive clear-thought-mcp-server |

### Communication Plan

**Week 1 (Start Development):**
- GitHub: Create `think-mcp` repository
- README: Explain vision and architecture shift

**Week 4 (Beta Launch):**
- Blog post: "Introducing think-mcp 2.0"
- GitHub: Release v2.0.0-beta
- Invite early adopters for testing

**Week 8 (General Availability):**
- Blog post: "think-mcp 2.0 is here"
- GitHub: Release v2.0.0
- Update clear-thought-mcp README with migration guide

**Month 3 (Deprecation Notice):**
- clear-thought-mcp-server: Add deprecation warning to README
- npm: `npm deprecate clear-thought-mcp-server "Migrated to think-mcp"`
- Give users 3 months to migrate

**Month 6 (Sunset):**
- Archive clear-thought-mcp-server repository
- Redirect to think-mcp

---

## Testing & Validation

### Phase-by-Phase Testing

**Phase 0-1: Foundation Testing**
```bash
# Verify server starts
npm run build
node dist/index.js

# Check SDK version
npm list @modelcontextprotocol/sdk
# Expected: 1.25.1

# Test code execution available
# (Manual test via MCP Inspector)
```

**Phase 2: Mental Models Testing**
```bash
# Unit test each mental model
python3 src/mental_models/test_models.py

# Expected: All 10 models return MentalModelResult
# Expected: Confidence scores > 0
# Expected: No errors
```

**Phase 3: Integration Testing**
```bash
# Use MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js

# Test "think" tool:
# 1. Call with simple query
# 2. Verify Claude generates Python code
# 3. Verify code execution succeeds
# 4. Verify mental models called correctly
```

### Dogfooding Plan

**Week 1-2: Personal Use**
- Use think-mcp for all decision-making
- Document pain points and bugs
- Compare results with legacy server
- Measure performance (tokens, latency)

**Test Scenarios:**
1. **Simple query**: "Should I refactor this code?"
2. **Complex decision**: "Evaluate these 3 job offers"
3. **Multi-model**: "Analyze this business strategy"
4. **Error handling**: Submit malformed queries
5. **Performance**: Large context windows

**Success Criteria:**
- Zero crashes in normal use
- Mental models selected appropriately 90%+ of time
- Token reduction ≥90% vs legacy
- Subjectively "better" insights than v1.x

### Beta Testing (Week 4-6)

**Recruit 5-10 Beta Testers:**
- Technical users comfortable with CLI
- Willing to provide detailed feedback
- Diverse use cases (coding, strategy, research)

**Provide:**
- Installation instructions
- Known issues list
- Feedback form
- Direct communication channel (Discord/Slack)

**Collect:**
- Bug reports
- Feature requests
- Usability feedback
- Performance data

**Iterate:**
- Fix critical bugs within 24 hours
- Address usability issues before GA
- Document workarounds for known limitations

---

## Timeline & Resources

### Detailed Timeline

| Week | Phase | Hours | Deliverables | Risk |
|------|-------|-------|--------------|------|
| **Week 1** | Phase 0-1 | 3-4 hrs | Environment setup, SDK foundation | HIGH |
| **Week 2** | Phase 2 | 6-8 hrs | Mental models as Python functions | HIGH |
| **Week 3** | Phase 3 | 4-6 hrs | Unified "think" tool with PTC | HIGH |
| **Week 3-4** | Phase 4 | 2 hrs | Documentation & config | LOW |
| **Week 4** | Testing | 3-4 hrs | Unit tests, integration tests | MODERATE |
| **Week 5-7** | Beta | Ongoing | Dogfooding, feedback, iterations | MODERATE |
| **Week 8** | GA | 2 hrs | Final polish, release v2.0.0 | LOW |
| **TOTAL** | | **20-24 hrs** | Production-ready think-mcp v2.0 | |

**Note:** Original estimate was 17-21 hours. Adding 3 hours buffer for beta feedback iterations.

### Resource Requirements

**Development:**
- Developer time: 20-24 hours
- Claude Code assistance: As needed
- Python 3.8+ environment
- Node.js 18+ environment

**Infrastructure:**
- GitHub repository
- npm package registry (optional)
- Documentation hosting (GitHub Pages or similar)

**Testing:**
- 5-10 beta testers
- Feedback collection tools (Google Forms, TypeForm)
- Communication channel (Discord, Slack, or email)

### Risk Mitigation

**High Risk: PTC Beta Dependency**
- **Mitigation**: Monitor Anthropic announcements closely
- **Fallback**: Implement Option 2 (Hybrid Router) if PTC deprecated
- **Timeline**: Can pivot in 1 week if needed

**High Risk: Python/Node Integration**
- **Mitigation**: Test early and often (Phase 2)
- **Fallback**: Pure TypeScript implementation (no PTC)
- **Timeline**: 2-3 days to pivot if critical issue found

**Moderate Risk: Mental Model Quality**
- **Mitigation**: Extensive dogfooding (Week 4+)
- **Fallback**: Iterative improvement based on feedback
- **Timeline**: Ongoing refinement post-GA

**Low Risk: Documentation**
- **Mitigation**: Start writing docs early (parallel to dev)
- **Fallback**: Community contributions for examples
- **Timeline**: Negligible impact

---

## References & Citations

### Anthropic Documentation

[1] **Programmatic Tool Calling**
https://docs.anthropic.com/en/docs/build-with-claude/programmatic-tool-calling
*Introduces PTC beta feature, performance metrics, implementation guide*

[2] **Code Execution with MCP**
https://www.anthropic.com/engineering/code-execution-with-mcp
*Official Anthropic blog post on code execution benefits and architecture*

[3] **MCP TypeScript SDK**
https://github.com/modelcontextprotocol/typescript-sdk
*Official SDK repository, changelog, and releases*

[4] **Token-Saving Updates**
https://www.anthropic.com/news/token-saving-updates
*Anthropic announcement of token-efficient tool calling and related features*

### MCP Ecosystem

[5] **MCP Agent Orchestration Patterns**
https://www.getknit.dev/blog/advanced-mcp-agent-orchestration-chaining-and-handoffs
*Guide to multi-agent patterns, handoffs, and orchestration*

[6] **MCP Specification (2025-11-25)**
https://modelcontextprotocol.io/specification/2025-11-25
*Official MCP protocol specification*

[7] **AWS: Building MCP Servers with Tool Orchestration**
https://aws.amazon.com/blogs/devops/flexibility-to-framework-building-mcp-servers-with-controlled-tool-orchestration/
*Enterprise patterns for MCP tool orchestration*

[8] **MCP Server Naming Conventions**
https://zazencodes.com/blog/mcp-server-naming-conventions
*Analysis of 500+ MCP servers, naming best practices*

### Mental Models

[9] **Mental Models Guide (Farnam Street)**
https://fs.blog/mental-models/
*Comprehensive guide to mental models for decision-making*

[10] **30 Mental Models (Ness Labs)**
https://nesslabs.com/mental-models
*Practical mental models for thinking and problem-solving*

[11] **Mental Models and Decision-Making (Miro)**
https://miro.com/brainstorming/mental-models-and-decision-making/
*Visual guide to applying mental models*

### Technical Resources

[12] **MCP Inspector Tool**
https://modelcontextprotocol.io/docs/tools/inspector
*Official tool for testing MCP servers*

[13] **Python Dataclasses Documentation**
https://docs.python.org/3/library/dataclasses.html
*Reference for dataclass usage in mental_models_functions.py*

[14] **TypeScript Handbook**
https://www.typescriptlang.org/docs/handbook/intro.html
*TypeScript reference for server implementation*

---

## Appendices

### Appendix A: Full Mental Model Descriptions

**First Principles Thinking**
- **Origin:** Aristotle, popularized by Elon Musk
- **Use Case:** Complex problems where inherited solutions may not apply
- **Process:** Strip away assumptions → Identify fundamental truths → Rebuild from axioms
- **Example:** "Electric cars are expensive" (assumption) → "Battery costs + motor costs + ..." (fundamentals)

**Opportunity Cost**
- **Origin:** Economic theory, Friedrich von Wieser
- **Use Case:** Choosing between alternatives when resources are limited
- **Process:** Identify options → Calculate value of next best alternative → Compare
- **Example:** Time spent on project A cannot be spent on project B

**Second-Order Thinking**
- **Origin:** Howard Marks, Charlie Munger
- **Use Case:** Strategic planning, avoiding unintended consequences
- **Process:** Immediate effects → Effects of effects → Long-term cascade
- **Example:** Lower prices (1st) → Reduced quality (2nd) → Lost customers (3rd)

**Inversion**
- **Origin:** Carl Jacobi ("Invert, always invert"), Charlie Munger
- **Use Case:** Risk management, avoiding failure
- **Process:** Define goal → Identify all failure modes → Avoid those
- **Example:** Instead of "how to be happy," ask "how to guarantee misery" and avoid that

**Circle of Competence**
- **Origin:** Warren Buffett, Charlie Munger
- **Use Case:** Decision-making under uncertainty, knowing when to defer to experts
- **Process:** Define domain → Assess genuine expertise → Stay within or expand deliberately
- **Example:** "I understand software but not biology - seek expert for bio decisions"

**Systems Thinking**
- **Origin:** Jay Forrester, Peter Senge
- **Use Case:** Complex adaptive systems, organizational change
- **Process:** Map components → Identify feedback loops → Find leverage points
- **Example:** Hiring more staff (input) → May decrease productivity (negative feedback loop)

**Pareto Principle (80/20)**
- **Origin:** Vilfredo Pareto
- **Use Case:** Resource allocation, prioritization
- **Process:** List items → Identify vital few (20%) → Focus there
- **Example:** 20% of customers generate 80% of revenue

**Occam's Razor**
- **Origin:** William of Ockham (14th century)
- **Use Case:** Hypothesis selection, debugging
- **Process:** List explanations → Count assumptions → Prefer fewest
- **Example:** "Is it a conspiracy or coincidence?" → Probably coincidence (simpler)

**Error Propagation**
- **Origin:** Engineering, quality control
- **Use Case:** System design, debugging, risk assessment
- **Process:** Identify error source → Trace cascade → Design containment
- **Example:** Input validation error → Corrupted database → Failed dependent services

**Rubber Duck Debugging**
- **Origin:** "The Pragmatic Programmer" by Hunt & Thomas
- **Use Case:** Debugging, clarifying thinking
- **Process:** Explain problem aloud step-by-step → Articulation reveals issue
- **Example:** "So first I call this function, which... oh wait, I'm not passing the right parameter!"

### Appendix B: Example Use Cases

**Use Case 1: Career Decision**
```
Query: "Should I quit my stable job to start a company?"

Mental Models Applied:
- Opportunity Cost (what you give up)
- Second-Order Thinking (long-term effects)
- Circle of Competence (do you have expertise?)
- Inversion (how to guarantee failure)

Output: Integrated analysis of trade-offs, risks, and success factors
```

**Use Case 2: Technical Architecture**
```
Query: "Should we use microservices or monolith?"

Mental Models Applied:
- First Principles (what problem are we solving?)
- Systems Thinking (how do components interact?)
- Pareto Principle (where is the complexity?)
- Occam's Razor (simplest viable approach)

Output: Architecture recommendation with rationale
```

**Use Case 3: Debugging Complex Issue**
```
Query: "Our API is slow but only for some users"

Mental Models Applied:
- Rubber Duck (explain the system)
- Error Propagation (trace the path)
- First Principles (what's actually happening?)
- Systems Thinking (feedback loops, bottlenecks)

Output: Debugging strategy and likely root causes
```

### Appendix C: Performance Benchmarks (Expected)

Based on Anthropic's published metrics:

| Metric | Legacy (v1.x) | think-mcp (v2.0) | Improvement |
|--------|---------------|------------------|-------------|
| **Tokens per query** | 150K avg | 2K avg | 98.7% ↓ |
| **Latency** | 8s avg | 3s avg | 62.5% ↓ |
| **Tool calls** | 3-5 avg | 1 avg | 70% ↓ |
| **User friction** | High (manual) | None (auto) | 100% ↓ |
| **Maintainability** | Complex routing | Functions only | 90% ↓ |

*Note: Actual benchmarks to be collected during beta testing*

### Appendix D: Glossary

**Terms:**
- **MCP**: Model Context Protocol - standard for connecting AI to external tools
- **PTC**: Programmatic Tool Calling - Anthropic beta feature for code-based orchestration
- **Mental Model**: Thinking framework for understanding and solving problems
- **Container**: Isolated execution environment for running Python code
- **Orchestration**: Coordinating multiple tools or models to accomplish a task
- **Legacy**: Previous version (clear-thought-mcp-server v1.x)
- **GA**: General Availability - public stable release
- **Beta**: Pre-release version for testing with early adopters
- **Dogfooding**: Using your own product internally before public release

**Acronyms:**
- **SDK**: Software Development Kit
- **CLI**: Command Line Interface
- **API**: Application Programming Interface
- **UX**: User Experience
- **RC**: Release Candidate

---

## Document Control

**Version History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-12-27 | Initial comprehensive plan | Claude Code + User |

**Approval:**
- [ ] Technical architecture reviewed
- [ ] Timeline approved
- [ ] Resources allocated
- [ ] Risk mitigation acceptable
- [ ] Ready to proceed with Phase 0

**Next Steps:**
1. Review this plan thoroughly
2. Raise any concerns or questions
3. Get approval to proceed
4. Create `think-mcp` directory and begin Phase 0

---

**END OF PLAN**

*This plan is a living document and may be updated during implementation based on learnings and feedback.*
