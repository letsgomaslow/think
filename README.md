# think-mcp

Structured thinking tools for AI assistants. Provides mental models, debugging approaches, decision frameworks, and more via the Model Context Protocol.

## Quick Start

### Installation

```bash
npm install -g think-mcp
```

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "think-mcp": {
      "command": "npx",
      "args": ["think-mcp"]
    }
  }
}
```

## Tools

| Tool | Description | Use When |
|------|-------------|----------|
| `trace` | Step-by-step thought tracing | Breaking down complex problems |
| `model` | Mental models (first principles, pareto, etc.) | Applying structured thinking frameworks |
| `pattern` | Software design patterns | Architectural decisions |
| `paradigm` | Programming paradigms | Choosing coding approaches |
| `debug` | Debugging approaches | Systematic troubleshooting |
| `council` | Multi-persona deliberation | Getting diverse perspectives |
| `decide` | Decision analysis frameworks | Making important choices |
| `reflect` | Metacognitive monitoring | Assessing knowledge boundaries |
| `hypothesis` | Scientific method | Testing ideas systematically |
| `debate` | Dialectical reasoning | Exploring arguments |
| `map` | Visual/spatial reasoning | Diagramming concepts |

## Examples

### Using `trace` for complex problem-solving

```
"Use the trace tool to think through how to refactor this authentication system"
```

### Using `model` with first principles

```
"Apply first_principles thinking using the model tool to analyze why our build is slow"
```

### Using `council` for multiple perspectives

```
"Use council to get security expert, performance engineer, and UX designer perspectives on this API design"
```

### Using `debug` for systematic troubleshooting

```
"Use the debug tool with binary_search approach to find the source of this memory leak"
```

### Using `decide` for structured decisions

```
"Use decide with weighted-criteria analysis to choose between PostgreSQL and MongoDB"
```

## Tool Details

### trace (Sequential Thinking)
Dynamic problem-solving through structured thoughts with revision and branching support.
- Break down complex problems into steps
- Revise previous thoughts as understanding evolves
- Branch into alternative approaches
- Track progress across multiple reasoning steps

### model (Mental Models)
Apply proven mental models to problems:
- `first_principles` - Break down to fundamentals
- `opportunity_cost` - Analyze trade-offs
- `error_propagation` - Understand error chains
- `rubber_duck` - Explain to clarify
- `pareto_principle` - Focus on high-impact factors
- `occams_razor` - Prefer simpler explanations

### pattern (Design Patterns)
Software architecture patterns:
- `modular_architecture` - Component separation
- `api_integration` - External service patterns
- `state_management` - State handling approaches
- `async_processing` - Asynchronous patterns
- `scalability` - Growth considerations
- `security` - Security best practices
- `agentic_design` - AI agent patterns

### paradigm (Programming Paradigms)
Programming approach selection:
- `imperative`, `procedural`, `object_oriented`
- `functional`, `declarative`, `logic`
- `event_driven`, `aspect_oriented`
- `concurrent`, `reactive`

### debug (Debugging Approaches)
Systematic debugging methods:
- `binary_search` - Divide and narrow
- `reverse_engineering` - Work backwards
- `divide_conquer` - Isolate components
- `backtracking` - Trace execution
- `cause_elimination` - Rule out causes
- `program_slicing` - Focus on relevant code

### council (Collaborative Reasoning)
Multi-persona problem-solving with diverse expertise, structured debate, and consensus building.

### decide (Decision Framework)
Structured decision analysis:
- `pros-cons` - Simple comparison
- `weighted-criteria` - Multi-factor scoring
- `decision-tree` - Branching outcomes
- `expected-value` - Probability-weighted
- `scenario-analysis` - Future scenarios

### reflect (Metacognitive Monitoring)
Self-awareness about knowledge boundaries, claim certainty, and reasoning biases.

### hypothesis (Scientific Method)
Formal scientific reasoning with hypothesis testing, variable identification, and evidence evaluation.

### debate (Structured Argumentation)
Dialectical reasoning with thesis-antithesis-synthesis and argument strength analysis.

### map (Visual Reasoning)
Visual thinking with diagrams, graphs, flowcharts, concept maps, and state diagrams.

## Migration from clear-thought-mcp-server v1.x

Tool names have been simplified for easier use:

| Old Name | New Name |
|----------|----------|
| `sequentialthinking` | `trace` |
| `mentalmodel` | `model` |
| `designpattern` | `pattern` |
| `programmingparadigm` | `paradigm` |
| `debuggingapproach` | `debug` |
| `collaborativereasoning` | `council` |
| `decisionframework` | `decide` |
| `metacognitivemonitoring` | `reflect` |
| `scientificmethod` | `hypothesis` |
| `structuredargumentation` | `debate` |
| `visualreasoning` | `map` |

Update your MCP config to use `think-mcp` instead of `clear-thought-mcp-server` and update any tool name references in your prompts.

## Development

```bash
# Clone the repository
git clone https://github.com/chirag127/think-mcp.git
cd think-mcp

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode (watch)
npm run dev
```

## Project Structure

```
think-mcp/
├── dist/               # Compiled JavaScript files
├── src/
│   ├── models/         # Data interfaces
│   ├── tools/          # Tool implementations
│   │   ├── traceServer.ts
│   │   ├── modelServer.ts
│   │   ├── patternServer.ts
│   │   ├── paradigmServer.ts
│   │   ├── debugServer.ts
│   │   ├── councilServer.ts
│   │   ├── decideServer.ts
│   │   ├── reflectServer.ts
│   │   ├── hypothesisServer.ts
│   │   ├── debateServer.ts
│   │   └── mapServer.ts
│   ├── toolNames.ts    # Tool name constants
│   └── index.ts        # Main server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Tech Stack

- TypeScript
- Node.js 18+
- Model Context Protocol SDK 1.25.1
- Zod 3.25+ (validation)
- Vitest (testing)

## Author

Chirag Singhal ([@chirag127](https://github.com/chirag127))

## License

MIT
