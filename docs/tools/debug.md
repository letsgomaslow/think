# Debug - Systematic Debugging Approaches

## What It Does

Debug provides structured methodologies to systematically find and fix bugs. Instead of randomly adding console.log statements, apply proven techniques like Binary Search, Divide and Conquer, or Cause Elimination to efficiently isolate problems.

**Key Value**: Turn debugging from guesswork into a systematic process. Debug helps you find bugs faster by applying the right search strategy for each type of problem.

## When to Use This Tool

- **Intermittent bugs** - When issues appear randomly and are hard to reproduce
- **Performance regressions** - When something got slower but you don't know what
- **Large codebases** - When the bug could be anywhere in millions of lines
- **Integration issues** - When problems appear at system boundaries
- **"It worked yesterday"** - When a recent change broke something

## How It Works

Select a debugging approach, describe your issue, and work through the methodology:

```
Issue → Select Approach → Apply Steps → Document Findings → Resolution
```

### Available Debugging Approaches

| Approach | Best For | Core Idea |
|----------|----------|-----------|
| **Binary Search** | Large search spaces | Divide data/code in half repeatedly |
| **Divide and Conquer** | Complex systems | Isolate subsystems to find the faulty one |
| **Cause Elimination** | Multiple possible causes | Systematically rule out each possibility |
| **Backtracking** | State-related bugs | Trace backward from failure to source |
| **Reverse Engineering** | Black box systems | Understand behavior by observation |
| **Program Slicing** | Data flow bugs | Follow variables through the code |

## Interactive Examples

### Scenario 1: Binary Search for Intermittent Errors

**Context**: Users report intermittent 500 errors but only on certain product pages - and you have 10,000 products.

**Input**:
```json
{
  "approachName": "binary_search",
  "issue": "Users report intermittent 500 errors but only on certain product pages - we have 10,000 products",
  "steps": [
    "Split products into two groups: IDs 1-5000 and 5001-10000",
    "Test both groups - errors only in second group",
    "Split again: 5001-7500 and 7501-10000",
    "Errors in 7501-10000 range",
    "Found: products with special characters in names cause template crash"
  ],
  "findings": "Products with emojis or special Unicode characters in names trigger a template rendering bug",
  "resolution": "Added HTML entity encoding for product names in templates, deployed fix to production"
}
```

**Output**:
```json
{
  "approachName": "binary_search",
  "status": "success",
  "hasSteps": true,
  "hasResolution": true
}
```

**What This Means**: Binary search reduced 10,000 potential products to the problematic subset in just 4 steps (instead of checking each one). The systematic halving quickly revealed the Unicode character issue.

---

### Scenario 2: Divide and Conquer for Memory Leak

**Context**: Application memory usage grows from 512MB to 4GB over 24 hours, then crashes.

**Input**:
```json
{
  "approachName": "divide_conquer",
  "issue": "Application memory usage grows from 512MB to 4GB over 24 hours, then crashes",
  "steps": [
    "Isolate major subsystems: API, cache, background jobs, logging",
    "Disable background jobs - memory still grows",
    "Disable cache - memory still grows",
    "Disable logging - memory stabilizes!",
    "Drill into logging: file rotation not releasing handles"
  ],
  "findings": "Winston logger file transport holding references to rotated log files without closing them",
  "resolution": "Upgraded winston-daily-rotate-file and added explicit stream closing on rotation"
}
```

**Output**:
```json
{
  "approachName": "divide_conquer",
  "status": "success",
  "hasSteps": true,
  "hasResolution": true
}
```

**What This Means**: By systematically disabling subsystems, you isolated the leak to logging in 4 steps. Without this approach, you might have spent days profiling the wrong components.

---

### Scenario 3: Cause Elimination for Flaky CI

**Context**: CI/CD pipeline randomly fails with 'connection refused' errors - happens about 20% of the time.

**Input**:
```json
{
  "approachName": "cause_elimination",
  "issue": "CI/CD pipeline randomly fails with 'connection refused' errors - happens 20% of the time",
  "steps": [
    "List all possible causes: network, database, service startup timing, resource limits",
    "Network: ping tests pass consistently - eliminated",
    "Database: connection pool checked - healthy - eliminated",
    "Service timing: startup logs show race condition!",
    "Container startup order not guaranteed in docker-compose"
  ],
  "findings": "Database container not ready when app container tries to connect - no health check dependency",
  "resolution": "Added depends_on with condition: service_healthy and proper health checks to docker-compose"
}
```

**Output**:
```json
{
  "approachName": "cause_elimination",
  "status": "success",
  "hasSteps": true,
  "hasResolution": true
}
```

**What This Means**: By listing and systematically eliminating each possible cause, you found the race condition. The 20% failure rate matched the random timing when DB took longer to start.

## User Experience

When you invoke Debug, you receive confirmation of your debugging session:

| Field | What It Tells You |
|-------|-------------------|
| `approachName` | Which debugging methodology was used |
| `status` | "success" if the process completed |
| `hasSteps` | Whether systematic steps were documented |
| `hasResolution` | Whether a resolution was found |

**The process is the product** - Debug forces you to work systematically, documenting each step. Even if you don't find the bug immediately, you've eliminated possibilities and documented the investigation.

## Integration Tips

- **Start with cause elimination** - List all possible causes before diving in
- **Match approach to problem size** - Binary search for large search spaces, divide and conquer for complex systems
- **Document as you go** - Your steps become valuable debugging documentation
- **Chain with Trace** - Use Trace to document your reasoning as you debug
- **Share with team** - Your debugging session becomes institutional knowledge

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `approachName` | enum | Yes | binary_search, divide_conquer, cause_elimination, backtracking, reverse_engineering, program_slicing |
| `issue` | string | Yes | Description of the bug or problem |
| `steps` | string[] | No | Your debugging steps |
| `findings` | string | No | What you discovered |
| `resolution` | string | No | How you fixed it |
