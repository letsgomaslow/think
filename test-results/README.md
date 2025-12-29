# Test Results Directory

This directory contains evaluation artifacts for think-mcp.

## Current Test Results

### Evaluation Results
| File | Purpose |
|------|---------|
| `think-mcp-eval-results.jsonl` | Core evaluation results (47 tests) |
| `think-mcp-eval-results-semantic.jsonl` | Semantic quality evaluation with LLM-as-Judge |
| `tool-accuracy-scenarios.jsonl` | 33 tool selection accuracy scenarios |
| `tool-accuracy-results.jsonl` | Tool accuracy test results |

### Reports
| File | Purpose |
|------|---------|
| `think-mcp-eval-report.md` | Comprehensive evaluation report |
| `comprehensive-evaluation-summary.md` | Summary of semantic and accuracy analysis |

## Test Coverage

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

## Evaluation Framework

### 5-Layer Evaluation Architecture

1. **Schema Validation** - Output structure correctness
2. **Semantic Quality** - LLM-as-Judge coherence/usefulness scoring
3. **Tool Accuracy** - Correct tool selection from natural language
4. **Regression Testing** - Behavior consistency across versions
5. **Performance** - Response time benchmarking

### Quality Thresholds

```
EXCELLENT:
├── Schema Quality: >= 95%
├── Semantic Score: >= 0.85
├── Tool Accuracy (F1): >= 0.90
├── Regressions: 0
└── Performance: < 500ms avg

GOOD:
├── Schema Quality: >= 85%
├── Semantic Score: >= 0.70
├── Tool Accuracy (F1): >= 0.80
└── Regressions: 0
```

## Running Tests

### Using think-mcp-tester Agent

```bash
# Launch tester agent to run full eval suite
claude code --agent think-mcp-tester
```

### Using think-mcp-reporter Agent

```bash
# Generate comprehensive report from results
claude code --agent think-mcp-reporter
```

## Result Format

Each test result in JSONL format:

```json
{
  "testId": "trace-basic-001",
  "tool": "trace",
  "testType": "basic",
  "status": "success",
  "durationMs": 185,
  "qualityScore": {
    "structure": true,
    "completeness": true,
    "coherence": true
  },
  "semanticEval": {
    "coherenceScore": 0.90,
    "usefulnessScore": 0.87,
    "factualEquivalence": "equivalent"
  },
  "performanceFlag": "normal"
}
```
