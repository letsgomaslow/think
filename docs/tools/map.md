# Map - Visual Thinking and Diagram Creation

## What It Does

Map enables visual thinking by creating and manipulating diagrams, flowcharts, concept maps, and other visual representations. By externalizing structure visually, you discover relationships and generate insights that text alone can't reveal.

**Key Value**: Think in pictures, not just words. Map helps you see patterns, relationships, and gaps that are invisible in linear text.

## When to Use This Tool

- **System design** - Visualize architecture and data flows
- **Process mapping** - Document workflows and procedures
- **Concept exploration** - Map relationships between ideas
- **State machines** - Model system states and transitions
- **Decision trees** - Visualize choice paths
- **Problem decomposition** - Break complex problems into visual structure

## How It Works

Map provides operations to build and transform visual representations:

```
Create → Add Elements → Connect → Transform → Observe Insights
```

### Operations

| Operation | Purpose |
|-----------|---------|
| `create` | Start a new diagram |
| `update` | Modify existing elements |
| `delete` | Remove elements |
| `transform` | Apply visual changes (rotate, move, resize, recolor, regroup) |
| `observe` | Record observations and insights from the visual |

### Diagram Types

| Type | Best For |
|------|----------|
| `flowchart` | Processes, algorithms, decision paths |
| `stateDiagram` | System states and transitions |
| `conceptMap` | Relationships between ideas |
| `treeDiagram` | Hierarchies and decomposition |
| `graph` | Networks and connections |
| `custom` | Anything else |

### Element Types

| Type | What It Represents |
|------|-------------------|
| `node` | A thing (concept, state, step) |
| `edge` | A relationship/connection |
| `container` | A grouping of elements |
| `annotation` | Notes or labels |

## Interactive Examples

### Scenario 1: Creating an Authentication Flowchart

**Context**: Mapping the user authentication flow to identify security checkpoints.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "user-auth-flow",
  "diagramType": "flowchart",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elements": [
    {"id": "start", "type": "node", "label": "User Visits Login Page", "properties": {"shape": "oval", "color": "green"}},
    {"id": "input", "type": "node", "label": "Enter Credentials", "properties": {"shape": "rectangle"}},
    {"id": "validate", "type": "node", "label": "Validate Credentials", "properties": {"shape": "diamond"}},
    {"id": "success", "type": "node", "label": "Redirect to Dashboard", "properties": {"shape": "rectangle", "color": "green"}},
    {"id": "failure", "type": "node", "label": "Show Error Message", "properties": {"shape": "rectangle", "color": "red"}},
    {"id": "edge1", "type": "edge", "source": "start", "target": "input", "properties": {}},
    {"id": "edge2", "type": "edge", "source": "input", "target": "validate", "properties": {}},
    {"id": "edge3", "type": "edge", "source": "validate", "target": "success", "label": "Valid", "properties": {}},
    {"id": "edge4", "type": "edge", "source": "validate", "target": "failure", "label": "Invalid", "properties": {}}
  ],
  "observation": "Mapping the authentication flow to identify security checkpoints"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "user-auth-flow",
  "diagramType": "flowchart",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elementCount": 9,
  "status": "success"
}
```

**What This Means**: A flowchart with 9 elements (5 nodes, 4 edges) has been created. The visual structure immediately shows:
- Linear flow from login to validation
- Decision point at validation (diamond shape)
- Two clear paths: success (green) and failure (red)

---

### Scenario 2: Creating a System Architecture Concept Map

**Context**: Visualizing microservices architecture to identify dependencies.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "system-architecture",
  "diagramType": "conceptMap",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elements": [
    {"id": "api", "type": "node", "label": "API Gateway", "properties": {"layer": "edge"}},
    {"id": "auth", "type": "node", "label": "Auth Service", "properties": {"layer": "services"}},
    {"id": "users", "type": "node", "label": "User Service", "properties": {"layer": "services"}},
    {"id": "db", "type": "node", "label": "PostgreSQL", "properties": {"layer": "data"}},
    {"id": "cache", "type": "node", "label": "Redis Cache", "properties": {"layer": "data"}},
    {"id": "e1", "type": "edge", "source": "api", "target": "auth", "label": "validates", "properties": {}},
    {"id": "e2", "type": "edge", "source": "api", "target": "users", "label": "routes to", "properties": {}},
    {"id": "e3", "type": "edge", "source": "users", "target": "db", "label": "persists", "properties": {}},
    {"id": "e4", "type": "edge", "source": "users", "target": "cache", "label": "caches", "properties": {}}
  ],
  "insight": "Visualizing the data flow reveals the cache as a potential single point of failure"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "system-architecture",
  "diagramType": "conceptMap",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elementCount": 9,
  "status": "success"
}
```

**What This Means**: The concept map shows:
- **Layers**: Edge (API), Services (Auth, Users), Data (DB, Cache)
- **Dependencies**: API → Auth and Users; Users → DB and Cache
- **Insight discovered**: Cache is a SPOF - this might not be obvious from code alone

---

### Scenario 3: Transforming and Observing

**Context**: Reorganizing the diagram to highlight a different perspective.

**Input**:
```json
{
  "operation": "transform",
  "diagramId": "system-architecture",
  "diagramType": "conceptMap",
  "iteration": 2,
  "nextOperationNeeded": false,
  "transformationType": "regroup",
  "elements": [
    {"id": "critical-path", "type": "container", "label": "Critical Path", "contains": ["api", "auth", "users", "db"], "properties": {"highlight": true}},
    {"id": "cache-optional", "type": "container", "label": "Optional/Degradable", "contains": ["cache"], "properties": {"highlight": false}}
  ],
  "observation": "Regrouping by criticality shows which services must be highly available",
  "insight": "The cache should be optional - system must function (slower) without it",
  "hypothesis": "Adding cache fallback logic will improve system resilience"
}
```

**What This Means**: By regrouping elements into containers ("Critical Path" vs "Optional/Degradable"), a new insight emerges: if the cache is truly optional, there should be fallback logic. This architectural insight came from visual reorganization.

## User Experience

Map produces visual structure records:

| Field | What It Tells You |
|-------|-------------------|
| `operation` | What action was performed |
| `diagramId` | Unique identifier for this diagram |
| `diagramType` | What kind of visualization |
| `iteration` | How many modifications |
| `nextOperationNeeded` | Whether to continue building |
| `elementCount` | Number of elements in the diagram |
| `elements` | Nodes, edges, containers, annotations |
| `observation` | What you notice from the visual |
| `insight` | New understanding gained |
| `hypothesis` | Testable idea emerging from the visual |

**Building Flow**:
```
Create → Add nodes/edges → Transform (regroup, recolor) → Observe insights → Iterate
```

## Integration Tips

- **Start simple** - Add elements iteratively rather than all at once
- **Use properties for meaning** - Colors, shapes, and layers encode information
- **Group related elements** - Containers reveal structure
- **Record observations** - The insight field captures what you learn
- **Transform to see differently** - Regrouping reveals hidden patterns
- **Chain with Trace** - Use Trace to reason about what the diagram shows
- **Chain with Hypothesis** - Visual insights become testable hypotheses

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | enum | Yes | create, update, delete, transform, observe |
| `diagramId` | string | Yes | Unique identifier |
| `diagramType` | enum | Yes | flowchart, stateDiagram, conceptMap, treeDiagram, graph, custom |
| `iteration` | number | Yes | Current iteration count |
| `nextOperationNeeded` | boolean | Yes | Whether to continue |
| `elements` | array | No | Nodes, edges, containers with id, type, label, properties |
| `transformationType` | enum | No | rotate, move, resize, recolor, regroup |
| `observation` | string | No | What you notice |
| `insight` | string | No | New understanding |
| `hypothesis` | string | No | Testable idea |
