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

## Remote Access (Vercel Deployment)

Think-MCP can be deployed to Vercel for remote access from Claude Desktop and ChatGPT without local installation.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chirag127/think-mcp)

Or deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Connect Claude Desktop (Remote)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "think-mcp": {
      "command": "npx",
      "args": ["mcp-remote", "https://your-deployment.vercel.app/api/mcp"]
    }
  }
}
```

### Connect ChatGPT

1. Go to Settings → Connectors → Advanced → Developer Mode
2. Add the URL: `https://your-deployment.vercel.app/api/mcp`

## Analytics (Opt-In)

think-mcp includes **optional, privacy-respecting usage analytics** to help understand tool adoption and improve the project. Analytics are **disabled by default** and require explicit opt-in.

### What is Collected

When you opt in, only **metadata** is collected:

| Data Point | Description | Example |
|------------|-------------|---------|
| Tool Name | Which tool was invoked | `trace`, `model`, `council` |
| Timestamp | When the invocation occurred | `2024-01-15T10:30:00.000Z` |
| Success Status | Whether the tool completed successfully | `true` or `false` |
| Duration | How long the tool took | `150` (milliseconds) |
| Error Category | If failed, the type (not message) | `validation`, `runtime`, `timeout` |
| Session ID | Random identifier (not tied to user) | `a1b2c3d4e5f67890` |

**What is NOT collected:** Tool arguments, input content, error messages, PII, file paths, environment variables.

### Enabling Analytics

```bash
# Enable analytics (records consent)
think-mcp analytics enable

# Or via environment variable
export THINK_MCP_ANALYTICS_ENABLED=true

# Or via config file (~/.think-mcp/analytics.json)
{
  "enabled": true
}
```

### Viewing the Dashboard

```bash
# View usage insights in terminal
think-mcp analytics dashboard

# Analyze specific time period
think-mcp analytics dashboard --days 7

# Detailed insights with recommendations
think-mcp analytics dashboard --detailed
```

The dashboard shows:
- Tool popularity ranking
- Usage trends (increasing/decreasing/stable)
- Error rates by tool with severity indicators
- Actionable insights and recommendations

### Managing Your Data

```bash
# View current status and settings
think-mcp analytics status

# View detailed information
think-mcp analytics status --verbose

# Export your data
think-mcp analytics export --format json
think-mcp analytics export --format csv --start 2024-01-01 --end 2024-01-31

# Delete all collected data
think-mcp analytics clear

# Disable analytics
think-mcp analytics disable

# Disable and delete all data
think-mcp analytics disable --delete-data
```

### Privacy Information

- **Storage:** All data stored locally in `~/.think-mcp/analytics/`
- **No Network:** Data is never transmitted externally
- **Retention:** 90 days by default (configurable)
- **Full Control:** View, export, and delete your data at any time

For complete privacy details, see [docs/PRIVACY.md](docs/PRIVACY.md).

### CLI Command Reference

| Command | Description |
|---------|-------------|
| `analytics enable` | Opt in to analytics collection |
| `analytics disable` | Opt out (add `--delete-data` to clear data) |
| `analytics status` | View current settings (add `--verbose` for details) |
| `analytics dashboard` | View usage insights (add `--days N`, `--detailed`) |
| `analytics export` | Export data (`--format json\|csv`, `--start`, `--end`) |
| `analytics clear` | Delete all collected data |
| `analytics privacy` | Show privacy notice |

### Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `THINK_MCP_ANALYTICS_ENABLED` | Enable/disable analytics | `false` |
| `THINK_MCP_ANALYTICS_RETENTION_DAYS` | Days to retain data | `90` |
| `THINK_MCP_ANALYTICS_STORAGE_PATH` | Custom storage directory | `~/.think-mcp/analytics` |

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

# Web development (Vercel)
cd web && npm install
npm run dev:web
```

## Project Structure

```
think-mcp/
├── dist/               # Compiled JavaScript files (npm package)
├── docs/
│   └── PRIVACY.md      # Analytics privacy policy
├── src/                # STDIO server source (for npx/local usage)
│   ├── analytics/      # Privacy-respecting usage analytics
│   │   ├── types.ts        # Analytics interfaces and types
│   │   ├── config.ts       # Configuration management
│   │   ├── storage.ts      # Local file storage adapter
│   │   ├── collector.ts    # Event collection service
│   │   ├── tracker.ts      # Tool invocation tracking
│   │   ├── consent.ts      # User consent management
│   │   ├── aggregator.ts   # Data aggregation engine
│   │   ├── insights.ts     # Insights generator
│   │   ├── cli.ts          # CLI commands
│   │   ├── dashboard-cli.ts # Dashboard command
│   │   └── index.ts        # Public API exports
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
├── web/                # Next.js app for Vercel deployment
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx    # Landing page
│   │   ├── analytics/  # Web analytics dashboard
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── [transport]/
│   │           └── route.ts  # MCP endpoint
│   └── lib/
│       ├── mcp-tools.ts      # Tool registration
│       └── tools/            # Tool definitions
├── vercel.json         # Vercel deployment config
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
