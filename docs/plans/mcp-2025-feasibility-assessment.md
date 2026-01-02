# think-mcp Enhancement Plan: Feasibility Assessment

> **Created:** December 31, 2025
> **Scope:** Quick wins that work TODAY on Vercel
> **Methodology:** Grounded in actual MCP 2025-11-25 specification
> **Related:** [Original Enhancement Plan](./mcp-2025-enhancement-plan.md)

---

## Executive Summary

After rigorous analysis of the MCP 2025-11-25 specification against the proposed enhancement plan, this document identifies **what actually works** with your current Vercel deployment.

**Bottom Line:** Focus on **Resources** and **Prompts** - real MCP primitives that add immediate value without infrastructure changes.

### Quick Stats

| Category | Count | Assessment |
|----------|-------|------------|
| ✅ **Feasible Now** | 6 features | Works on Vercel today |
| 🟡 **Deferred** | 9 features | Needs infrastructure |
| 🔴 **Removed** | 9 features | Not real MCP features |

---

## Section 1: Current Setup

### Your Architecture
```
AI Platform (Claude/ChatGPT)
       ↓ MCP URL
Vercel Serverless Function
  • /api/[transport]
  • MCP SDK v1.25.1
  • 60s timeout (Pro) / 10s (Standard)
  • Stateless (ephemeral)
       ↓
think-mcp v2.0.0
  • 11 tools (tools capability only)
  • No resources/prompts exposed
```

### What You CAN Do on Vercel
- ✅ Tool calls completing in <60s
- ✅ Resources (static data exposure)
- ✅ Prompts (template exposure)
- ✅ Progress notifications (within timeout)
- ✅ Elicitation (structured user input)
- ✅ Session IDs (client tracking)

### What You CANNOT Do on Vercel
- ❌ Tasks running >60 seconds
- ❌ Persistent state across requests
- ❌ WebSocket connections
- ❌ Background processing

---

## Section 2: What Actually Exists in MCP

### Real MCP Features (2025-11-25)

| Feature | Methods | Status |
|---------|---------|--------|
| **Tools** | `tools/list`, `tools/call` | ✅ Stable |
| **Resources** | `resources/list`, `resources/read` | ✅ Stable |
| **Prompts** | `prompts/list`, `prompts/get` | ✅ Stable |
| **Progress** | `notifications/progress` | ✅ Stable |
| **Elicitation** | `elicitation/create` | ✅ Stable |
| **Tasks** | `tasks/get`, `tasks/result`, etc. | 🟡 Experimental |

### Features NOT in MCP (Removed from Plan)

The following were in the original plan but **do not exist in MCP**:
- Tool chaining / orchestration
- Web search integration
- Agentic sampling loops
- Webhook notifications
- Analytics tracking
- Workflow engine
- Agent loops

These would require 100% custom implementation and are **out of scope** for quick wins.

---

## Section 3: Quick Wins Implementation Plan

### 3.1 Add Resources Capability

**What:** Expose static data as queryable MCP resources
**Value:** Clients can browse model/pattern catalogs without tool calls
**Effort:** 3-4 days

**Resources to Expose:**

| URI | Content | Description |
|-----|---------|-------------|
| `think://models` | Mental model catalog | All 6 models with descriptions |
| `think://patterns` | Design pattern catalog | All 7 patterns with examples |
| `think://paradigms` | Programming paradigms | All 10 paradigms |
| `think://debug-approaches` | Debugging methods | All 6 approaches |

**Implementation:**

```typescript
// web/app/api/[transport]/route.ts

const server = new McpServer({
  name: 'think-mcp',
  version: '2.0.0',
  capabilities: {
    tools: {},
    resources: { listChanged: true }  // ADD THIS
  }
});

// Resource handler
server.resource('think://models', 'Mental Models Catalog', async () => ({
  contents: [{
    uri: 'think://models',
    mimeType: 'application/json',
    text: JSON.stringify({
      models: [
        { name: 'first_principles', description: 'Break down to fundamentals' },
        { name: 'opportunity_cost', description: 'Evaluate trade-offs' },
        { name: 'error_propagation', description: 'Track error chains' },
        { name: 'rubber_duck', description: 'Explain to understand' },
        { name: 'pareto_principle', description: '80/20 analysis' },
        { name: 'occams_razor', description: 'Simplest explanation' }
      ]
    })
  }]
}));
```

**Files to Create/Modify:**
- `web/lib/resources/models.ts` - Model catalog data
- `web/lib/resources/patterns.ts` - Pattern catalog data
- `web/lib/resources/index.ts` - Resource registration
- `web/app/api/[transport]/route.ts` - Add capabilities

---

### 3.2 Add Prompts Capability

**What:** Expose prompt templates for common workflows
**Value:** Clients get guided starting points for analysis
**Effort:** 2-3 days

**Prompts to Expose:**

| Name | Arguments | Purpose |
|------|-----------|---------|
| `analyze-problem` | `problem: string` | Guided problem breakdown |
| `design-decision` | `options: string[]` | Decision framework starter |
| `debug-issue` | `issue: string, context?: string` | Debugging approach selector |
| `review-architecture` | `system: string` | Architecture analysis template |

**Implementation:**

```typescript
// web/lib/prompts/analyze-problem.ts

export const analyzeProblemPrompt = {
  name: 'analyze-problem',
  description: 'Structured problem analysis using mental models',
  arguments: [
    { name: 'problem', description: 'The problem to analyze', required: true }
  ]
};

export function getAnalyzeProblem(args: { problem: string }) {
  return {
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Analyze this problem using structured thinking:

Problem: ${args.problem}

Recommended approach:
1. Use 'trace' tool to break down the problem step by step
2. Apply 'model' tool with first_principles to identify fundamentals
3. Use 'reflect' tool to assess confidence in conclusions

Start with the trace tool for initial analysis.`
      }
    }]
  };
}
```

**Files to Create/Modify:**
- `web/lib/prompts/analyze-problem.ts`
- `web/lib/prompts/design-decision.ts`
- `web/lib/prompts/debug-issue.ts`
- `web/lib/prompts/index.ts` - Prompt registration
- `web/app/api/[transport]/route.ts` - Add prompts capability

---

### 3.3 Improve Tool Validation with Zod

**What:** Add comprehensive input validation to all tools
**Value:** Better error messages, type safety, documentation
**Effort:** 3-4 days

**Current State:** Partial Zod in web/, inconsistent across tools

**Target State:**

```typescript
// web/lib/tools/trace.ts

import { z } from 'zod';

export const traceSchema = z.object({
  thought: z.string()
    .min(1, 'Thought cannot be empty')
    .describe('The current thinking step'),
  thoughtNumber: z.number()
    .int()
    .min(1, 'Must be at least 1')
    .describe('Current thought number in sequence'),
  totalThoughts: z.number()
    .int()
    .min(1)
    .describe('Estimated total thoughts needed'),
  nextThoughtNeeded: z.boolean()
    .describe('Whether more thinking is required'),
  isRevision: z.boolean()
    .optional()
    .describe('Whether this revises a previous thought'),
  revisesThought: z.number()
    .int()
    .min(1)
    .optional()
    .describe('Which thought number this revises'),
  branchFromThought: z.number()
    .int()
    .min(1)
    .optional()
    .describe('Create new branch from this thought'),
  branchId: z.string()
    .optional()
    .describe('Identifier for this branch'),
  needsMoreThoughts: z.boolean()
    .optional()
    .describe('Signal that estimate was too low')
});

export type TraceInput = z.infer<typeof traceSchema>;
```

**Files to Modify:**
- `web/lib/tools/trace.ts` - Full Zod schema
- `web/lib/tools/model.ts` - Full Zod schema
- `web/lib/tools/pattern.ts` - Full Zod schema
- `web/lib/tools/paradigm.ts` - Full Zod schema
- `web/lib/tools/debug.ts` - Full Zod schema
- `web/lib/tools/council.ts` - Full Zod schema
- `web/lib/tools/decide.ts` - Full Zod schema
- `web/lib/tools/reflect.ts` - Full Zod schema
- `web/lib/tools/hypothesis.ts` - Full Zod schema
- `web/lib/tools/debate.ts` - Full Zod schema
- `web/lib/tools/map.ts` - Full Zod schema

---

### 3.4 Add Progress Notifications

**What:** Send progress updates during tool execution
**Value:** Better UX for longer operations
**Effort:** 2 days

**Implementation:**

```typescript
// web/lib/tools/council.ts

export async function handleCouncil(
  args: CouncilInput,
  context: { sendProgress: (progress: number, message: string) => void }
) {
  context.sendProgress(10, 'Analyzing topic and personas');

  // Process personas
  const processedPersonas = args.personas.map((p, i) => {
    context.sendProgress(20 + (i * 10), `Processing ${p.name}'s perspective`);
    return processPersona(p, args.topic);
  });

  context.sendProgress(80, 'Synthesizing contributions');

  // ... rest of processing

  context.sendProgress(100, 'Council deliberation complete');
  return result;
}
```

**Note:** Progress only useful for tools taking >2-3 seconds

---

### 3.5 Standardize Response Format

**What:** Consistent JSON structure across all tools
**Value:** Predictable client parsing, better documentation
**Effort:** 2 days

**Standard Response Structure:**

```typescript
interface ToolResponse<T> {
  success: boolean;
  tool: string;
  data: T;
  metadata: {
    processingTime: number;
    version: string;
  };
}

// Example
{
  "success": true,
  "tool": "trace",
  "data": {
    "thought": "...",
    "thoughtNumber": 1,
    "totalThoughts": 5,
    "nextThoughtNeeded": true,
    "status": "in-progress"
  },
  "metadata": {
    "processingTime": 45,
    "version": "2.0.0"
  }
}
```

---

### 3.6 Add Tool Icons (SEP-973)

**What:** Visual icons for tools in client UIs
**Value:** Better discoverability in Claude/ChatGPT interfaces
**Effort:** 0.5 days

**Implementation:**

```typescript
const TRACE_TOOL = {
  name: 'trace',
  description: 'Sequential chain-of-thought reasoning',
  icon: 'https://think-mcp.vercel.app/icons/trace.svg',  // ADD
  inputSchema: { ... }
};
```

---

## Section 4: Implementation Timeline

### Week 1: Resources
- Day 1-2: Create resource data files (models, patterns, paradigms, debug)
- Day 3: Implement resource handlers
- Day 4: Add capability to server, test with Claude

### Week 2: Prompts + Validation
- Day 1-2: Create prompt templates (4 prompts)
- Day 3: Add prompt capability to server
- Day 4-5: Upgrade Zod schemas for all 11 tools

### Week 3: Polish
- Day 1: Standardize response format
- Day 2: Add progress notifications to long-running tools
- Day 3: Add tool icons
- Day 4-5: Testing, documentation, deployment

**Total: ~15 days / 3 weeks**

---

## Section 5: Files to Modify

| File | Change |
|------|--------|
| `web/app/api/[transport]/route.ts` | Add resources + prompts capabilities |
| `web/lib/mcp-tools.ts` | Register resource and prompt handlers |
| `web/lib/tools/*.ts` (all 11) | Upgrade to full Zod schemas |
| NEW: `web/lib/resources/` | Resource data and handlers |
| NEW: `web/lib/prompts/` | Prompt templates |
| `web/package.json` | Ensure zod is properly versioned |

---

## Section 6: Success Criteria

| Metric | Target |
|--------|--------|
| Resources exposed | 4 catalogs (models, patterns, paradigms, debug) |
| Prompts available | 4 templates |
| Zod coverage | 100% of tools |
| Response consistency | Standard format across all tools |
| Test coverage | Resources and prompts tested |

---

## Section 7: What This Enables

With Resources + Prompts implemented:

1. **Discovery** - Clients can browse available models/patterns without guessing
2. **Guided Usage** - Prompt templates help users start workflows correctly
3. **Better Errors** - Zod validation provides helpful error messages
4. **Documentation** - JSON Schema serves as API documentation
5. **Future-Ready** - Clean foundation if you later add infrastructure

---

## Conclusion

This focused plan delivers real value in 3 weeks without:
- Infrastructure changes
- New external services
- Experimental MCP features
- Made-up capabilities

After completion, evaluate whether the added value justifies infrastructure investment for Tasks/Sessions/Long-running operations.

---

## Appendix A: Removed Features

The following were in the original enhancement plan but have been **removed** because they either don't exist in MCP or require infrastructure beyond Vercel:

| Feature | Reason Removed |
|---------|----------------|
| Tool chaining | Not an MCP feature |
| Agentic sampling loops | Requires human-in-loop, can't be autonomous |
| WebSearchAdapter | External API, not MCP |
| Tasks API (full) | Experimental + needs persistence |
| Webhooks | Needs background processing |
| Analytics | Custom implementation |
| AgentLoop | Made-up interface |
| 2-3 minute operations | Vercel 60s timeout |
| Session persistence | Serverless is stateless |

These can be revisited if you move to persistent infrastructure (Railway, Render, etc.).

---

## Appendix B: MCP 2025-11-25 Specification Sources

Research was conducted against the official MCP specification:

- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP Changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog)
- [MCP Sampling Documentation](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)
- [MCP Resources Documentation](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
- [MCP Prompts Documentation](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)
- [MCP Progress Documentation](https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/progress)
- [WorkOS MCP 2025-11-25 Analysis](https://workos.com/blog/mcp-2025-11-25-spec-update)

---

## Appendix C: Key Corrections to Original Plan

| Original Claim | Reality |
|----------------|---------|
| "Autonomous agentic sampling loops" | MCP sampling requires **human-in-the-loop** - servers cannot call models autonomously |
| "Native tool chaining" | Tool chaining is **NOT an MCP feature** - it's client-side or custom |
| "Tasks API for 2-3 minute operations" | Tasks API is **experimental** and Vercel has 60s timeout |
| "AgentLoop with runAgentLoop()" | This interface **does not exist** in MCP SDK |
| "WebSearchAdapter as MCP integration" | Web search is an **external API**, not part of MCP |
| "Elicitation for conversational questions" | Elicitation only supports **structured input** (string, number, boolean, enum) |
