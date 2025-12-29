# Think-MCP Test Index

Complete reference of test coverage for all 11 think-mcp tools.

---

## Test Distribution

| Tool | Basic | Edge | Error | Total |
|------|-------|------|-------|-------|
| trace | 1 | 2 | 2 | 5 |
| model | 1 | 4 | 1 | 6 |
| pattern | 1 | 4 | 1 | 6 |
| paradigm | 1 | 4 | 1 | 6 |
| debug | 1 | 4 | 1 | 6 |
| council | 1 | 1 | 0 | 2 |
| decide | 1 | 1 | 1 | 3 |
| reflect | 1 | 1 | 1 | 3 |
| hypothesis | 1 | 1 | 1 | 3 |
| debate | 1 | 2 | 1 | 4 |
| map | 1 | 1 | 1 | 3 |
| **TOTAL** | **11** | **25** | **11** | **47** |

---

## Tools Overview

### 1. trace (Sequential Thinking)
Tests step-by-step reasoning with revision and branching support.

### 2. model (Mental Models)
Tests application of mental models: first_principles, opportunity_cost, rubber_duck, pareto_principle, occams_razor, error_propagation.

### 3. pattern (Design Patterns)
Tests design pattern guidance: modular_architecture, api_integration, state_management, async_processing, scalability, security, agentic_design.

### 4. paradigm (Programming Paradigms)
Tests paradigm selection: functional, object_oriented, reactive, event_driven, concurrent, declarative, procedural, logic, aspect_oriented, imperative.

### 5. debug (Debugging Approaches)
Tests systematic debugging: binary_search, reverse_engineering, divide_conquer, backtracking, cause_elimination, program_slicing.

### 6. council (Collaborative Reasoning)
Tests multi-persona expert deliberation with consensus building.

### 7. decide (Decision Framework)
Tests structured decision analysis: pros-cons, weighted-criteria, decision-tree, expected-value, scenario-analysis.

### 8. reflect (Metacognitive Monitoring)
Tests knowledge assessment and reasoning quality evaluation.

### 9. hypothesis (Scientific Method)
Tests structured hypothesis testing through observation, question, hypothesis, experiment, analysis, conclusion stages.

### 10. debate (Structured Argumentation)
Tests dialectical reasoning: thesis, antithesis, synthesis, objection, rebuttal.

### 11. map (Visual Reasoning)
Tests diagram creation and analysis: graph, flowchart, stateDiagram, conceptMap, treeDiagram.

---

## Validation Coverage

### Type Validation
- Enum value validation for tool-specific types
- Number range validation (confidence 0-1, iteration >= 0)

### Required Field Validation
- Missing required fields properly rejected
- Clear error messages returned

### Boundary Validation
- Confidence boundaries (0.0, 1.0, >1.0)
- Negative iteration values

---

## Test Complexity Levels

**Basic Tests (11)**: Single-step scenarios with required fields only

**Edge Tests (25)**: Multi-step workflows, optional fields, complex nested structures

**Error Tests (11)**: Invalid inputs, type errors, boundary violations

---

## File Locations

- Results: `think-mcp-eval-results.jsonl`
- Semantic Eval: `think-mcp-eval-results-semantic.jsonl`
- Accuracy Scenarios: `tool-accuracy-scenarios.jsonl`
- Accuracy Results: `tool-accuracy-results.jsonl`
