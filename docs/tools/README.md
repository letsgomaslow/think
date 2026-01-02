# Think-MCP Tools Reference

A comprehensive guide to all 11 thinking tools available in Think-MCP. Each tool provides structured approaches to different aspects of reasoning, decision-making, and problem-solving.

## Tool Categories

### Reasoning & Analysis
Tools for structured thinking and problem breakdown.

| Tool | Description | Best For |
|------|-------------|----------|
| [**Trace**](./trace.md) | Dynamic chain-of-thought reasoning | Step-by-step problem analysis with revision and branching |
| [**Model**](./model.md) | Mental models for structured thinking | Applying proven frameworks (First Principles, Pareto, etc.) |
| [**Reflect**](./reflect.md) | Metacognitive self-monitoring | Assessing confidence and knowledge boundaries |

### Software Development
Tools for architecture, debugging, and code design.

| Tool | Description | Best For |
|------|-------------|----------|
| [**Pattern**](./pattern.md) | Software design patterns | Architecture decisions, integration strategies |
| [**Paradigm**](./paradigm.md) | Programming paradigms | Choosing the right coding approach for your problem |
| [**Debug**](./debug.md) | Systematic debugging | Finding bugs efficiently with structured methodologies |

### Decision Making
Tools for evaluating options and reaching conclusions.

| Tool | Description | Best For |
|------|-------------|----------|
| [**Decide**](./decide.md) | Structured decision analysis | Complex choices with weighted criteria and risk assessment |
| [**Council**](./council.md) | Multi-expert collaboration | Simulating diverse expert perspectives |

### Scientific Method
Tools for hypothesis-driven investigation.

| Tool | Description | Best For |
|------|-------------|----------|
| [**Hypothesis**](./hypothesis.md) | Scientific reasoning | Formulating and testing hypotheses |
| [**Debate**](./debate.md) | Dialectical argumentation | Thesis-antithesis-synthesis reasoning |

### Visualization
Tools for visual thinking and diagram creation.

| Tool | Description | Best For |
|------|-------------|----------|
| [**Map**](./map.md) | Visual diagram creation | Flowcharts, concept maps, system architecture |

---

## Quick Selection Guide

### "I need to..."

| Need | Recommended Tool(s) |
|------|---------------------|
| Break down a complex problem | [Trace](./trace.md) → [Model](./model.md) |
| Debug an issue | [Debug](./debug.md) |
| Design a system | [Pattern](./pattern.md) → [Map](./map.md) |
| Make a big decision | [Council](./council.md) → [Decide](./decide.md) |
| Test an assumption | [Hypothesis](./hypothesis.md) |
| Evaluate competing options | [Debate](./debate.md) → [Decide](./decide.md) |
| Assess my confidence | [Reflect](./reflect.md) |
| Choose a coding approach | [Paradigm](./paradigm.md) |
| Visualize relationships | [Map](./map.md) |

---

## Common Tool Chains

Combine tools for more powerful workflows:

### Problem Solving Chain
```
Trace → Model → Decide
```
1. Use **Trace** to explore the problem space
2. Apply **Model** (e.g., First Principles) to structure your analysis
3. Use **Decide** to make a formal decision

### Architecture Design Chain
```
Council → Pattern → Paradigm → Map
```
1. Use **Council** to gather diverse expert perspectives
2. Apply **Pattern** to select architectural approaches
3. Choose **Paradigm** for implementation style
4. Create visual documentation with **Map**

### Investigation Chain
```
Hypothesis → Debug → Reflect
```
1. Form a **Hypothesis** about the issue
2. Apply **Debug** methodology to test it
3. Use **Reflect** to assess confidence in your findings

### Decision Making Chain
```
Council → Debate → Decide → Reflect
```
1. Gather perspectives with **Council**
2. Stress-test with **Debate** (thesis/antithesis/synthesis)
3. Formalize with **Decide** (weighted criteria)
4. Assess confidence with **Reflect**

---

## Understanding Tool Outputs

All tools return JSON responses. Here's how to interpret common fields:

### Progression Indicators
| Field | Meaning |
|-------|---------|
| `nextThoughtNeeded` | Continue thinking (Trace) |
| `nextContributionNeeded` | Continue collaboration (Council) |
| `nextStageNeeded` | Continue analysis (Decide, Hypothesis) |
| `nextArgumentNeeded` | Continue debate (Debate) |
| `nextOperationNeeded` | Continue building (Map) |
| `nextAssessmentNeeded` | Continue reflection (Reflect) |

### Status Indicators
| Field | Meaning |
|-------|---------|
| `status: "success"` | Operation completed successfully |
| `iteration` | Current cycle count |
| `stage` | Current phase of multi-stage process |
| `confidence` | 0-1 belief level |

### Relationship Tracking
| Field | Meaning |
|-------|---------|
| `revisesThought` | Links to earlier thought being revised (Trace) |
| `branchId` | Labels alternative exploration paths (Trace) |
| `respondsTo` | Links to argument being addressed (Debate) |
| `supports` / `contradicts` | Argument relationships (Debate) |

---

## Getting Started

1. **New to Think-MCP?** Start with [Trace](./trace.md) - it's the most flexible tool
2. **Building software?** Check [Pattern](./pattern.md) and [Debug](./debug.md)
3. **Making decisions?** Use [Decide](./decide.md) with [Council](./council.md)
4. **Testing assumptions?** Apply [Hypothesis](./hypothesis.md)

Each tool page includes:
- **What It Does** - Quick overview
- **When to Use** - Decision guidance
- **How It Works** - Conceptual explanation
- **Interactive Examples** - 3 real scenarios with JSON I/O
- **User Experience** - What to expect during processing
- **Integration Tips** - Best practices
- **Quick Reference** - Parameter table

---

## JSON Response Format

All tools return responses in this format:

```json
{
  "content": [{
    "type": "text",
    "text": "{ ... structured result ... }"
  }]
}
```

The inner `text` field contains the tool-specific JSON output. Refer to each tool's documentation for the exact structure.
