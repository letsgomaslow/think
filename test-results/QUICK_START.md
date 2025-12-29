# Quick Start: Think-MCP Testing

Get from zero to evaluated in 5 minutes.

---

## Prerequisites

- think-mcp server installed (`npm install think-mcp`)
- Claude Code with MCP configured

---

## Step 1: Verify MCP Connection

Open Claude Code and check:

```
Show me all available MCP tools
```

You should see:
- `mcp__think-mcp__trace`
- `mcp__think-mcp__model`
- `mcp__think-mcp__pattern`
- ... (11 total)

---

## Step 2: Quick Smoke Test

Test one tool:

```
Use mcp__think-mcp__trace with:
{
  "thought": "Testing the MCP connection",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false
}
```

If this works, you're ready!

---

## Step 3: Run Full Evaluation

### Option A: Using Tester Agent

```bash
claude code --agent think-mcp-tester
```

This runs:
- 47 schema validation tests
- LLM-as-Judge semantic evaluation
- 33 tool accuracy scenarios

### Option B: Manual Testing

For individual tool testing:

```javascript
// trace tool
mcp__think-mcp__trace({
  thought: "Step-by-step analysis",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
})

// model tool
mcp__think-mcp__model({
  modelName: "first_principles",
  problem: "Why does our build take 15 minutes?"
})

// pattern tool
mcp__think-mcp__pattern({
  patternName: "api_integration",
  context: "Integrating multiple payment providers"
})
```

---

## Step 4: Generate Report

```bash
claude code --agent think-mcp-reporter
```

Creates `think-mcp-eval-report.md` with:
- Executive summary
- Schema quality analysis
- Semantic quality scores
- Tool accuracy metrics
- Recommendations

---

## Expected Results

| Metric | Target | Actual |
|--------|--------|--------|
| Schema Quality | >= 95% | 100% |
| Semantic Score | >= 0.85 | 0.89 |
| Tool Accuracy F1 | >= 0.90 | 0.97 |
| Avg Response | < 500ms | 199ms |

---

## Troubleshooting

### "Tool not found"

1. Check think-mcp server is running
2. Verify Claude Code MCP config
3. Restart Claude Code

### "Type validation error"

Ensure inputs match expected schema:

```javascript
// Wrong
{ thought: 123 }

// Correct
{ thought: "Test", thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false }
```

---

## Files Reference

```
test-results/
├── think-mcp-eval-results.jsonl       # Test results
├── think-mcp-eval-results-semantic.jsonl  # Semantic scores
├── tool-accuracy-scenarios.jsonl      # Accuracy test cases
├── tool-accuracy-results.jsonl        # Accuracy results
└── think-mcp-eval-report.md           # Comprehensive report
```

---

## Summary Checklist

- [ ] MCP server verified
- [ ] Smoke test passed
- [ ] Full evaluation run
- [ ] Report generated
- [ ] Results reviewed
