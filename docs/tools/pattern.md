# Pattern - Software Design Patterns for Architecture

## What It Does

Pattern helps you apply proven software architecture patterns to solve common design challenges. Instead of reinventing solutions, leverage established approaches for modularity, API integration, state management, and more.

**Key Value**: Build on decades of software engineering wisdom. Pattern guides you through implementation strategies with clear trade-offs, so you make informed architectural decisions.

## When to Use This Tool

- **System design** - When architecting new features or services
- **Integration challenges** - When connecting multiple systems or APIs
- **Scalability planning** - When preparing for growth
- **Security reviews** - When hardening your application
- **AI/Agent development** - When building autonomous AI systems
- **State management** - When handling complex application state

## How It Works

Select a pattern, describe your context, and receive a structured implementation plan:

```
Context → Select Pattern → Implementation Steps → Benefits → Trade-offs
```

### Available Patterns

| Pattern | Best For | Core Idea |
|---------|----------|-----------|
| **Modular Architecture** | Extensibility, maintainability | Isolate components behind well-defined interfaces |
| **API Integration** | Third-party services | Unified client interface with resilience patterns |
| **State Management** | Complex UI/data flows | Centralized, predictable state transitions |
| **Async Processing** | Background jobs, queues | Decouple work from request/response cycles |
| **Scalability** | Growth preparation | Design for horizontal scaling and load distribution |
| **Security** | Protection, compliance | Defense in depth, principle of least privilege |
| **Agentic Design** | AI systems, autonomy | Multi-agent coordination with specialized roles |

## Interactive Examples

### Scenario 1: Modular Architecture for Payment Providers

**Context**: Building a SaaS application that needs to support multiple payment providers (Stripe, PayPal, Square) with the ability to add more in the future.

**Input**:
```json
{
  "patternName": "modular_architecture",
  "context": "Building a SaaS application that needs to support multiple payment providers (Stripe, PayPal, Square) with the ability to add more in the future",
  "implementation": [
    "Define PaymentProvider interface with standard methods",
    "Create adapter classes for each provider",
    "Use dependency injection to swap providers",
    "Implement factory pattern for provider instantiation"
  ],
  "benefits": [
    "Easy to add new payment providers",
    "Isolated testing per provider",
    "No changes to core business logic when switching"
  ],
  "tradeoffs": [
    "Initial setup complexity",
    "More files to maintain",
    "Abstraction overhead"
  ],
  "languages": ["TypeScript", "Python", "Java"]
}
```

**Output**:
```json
{
  "patternName": "modular_architecture",
  "status": "success",
  "hasImplementation": true,
  "hasCodeExample": false
}
```

**What This Means**: Your modular approach is validated. The adapter pattern with dependency injection will allow you to add Square, Apple Pay, or any future provider without touching existing code.

---

### Scenario 2: Agentic Design for AI Assistant

**Context**: Creating an AI assistant that can research topics, write content, and fact-check its own work autonomously.

**Input**:
```json
{
  "patternName": "agentic_design",
  "context": "Creating an AI assistant that can research topics, write content, and fact-check its own work autonomously",
  "implementation": [
    "Design specialized agents: Researcher, Writer, FactChecker",
    "Create orchestrator to coordinate agent workflow",
    "Implement shared memory/context between agents",
    "Add feedback loops for self-correction"
  ],
  "benefits": [
    "Specialized expertise per agent",
    "Parallel processing capability",
    "Self-improving through feedback"
  ],
  "tradeoffs": [
    "Complex coordination logic",
    "Higher token usage",
    "Debugging multi-agent flows is challenging"
  ],
  "languages": ["Python", "TypeScript"]
}
```

**Output**:
```json
{
  "patternName": "agentic_design",
  "status": "success",
  "hasImplementation": true,
  "hasCodeExample": false
}
```

**What This Means**: Your multi-agent architecture follows established patterns. The orchestrator-specialist model enables parallel work and self-correction, though you'll need robust logging for debugging.

---

### Scenario 3: API Integration for Data Aggregation

**Context**: Integrating with 15 different third-party APIs for a data aggregation platform.

**Input**:
```json
{
  "patternName": "api_integration",
  "context": "Integrating with 15 different third-party APIs for a data aggregation platform",
  "implementation": [
    "Create unified API client interface",
    "Implement retry logic with exponential backoff",
    "Add circuit breaker pattern for failing services",
    "Use queue-based processing for rate limiting"
  ],
  "benefits": [
    "Consistent error handling",
    "Resilient to third-party failures",
    "Centralized monitoring"
  ],
  "tradeoffs": [
    "Complexity in unified interface design",
    "Some APIs may not fit the abstraction well"
  ],
  "languages": ["TypeScript", "Go", "Python"]
}
```

**Output**:
```json
{
  "patternName": "api_integration",
  "status": "success",
  "hasImplementation": true,
  "hasCodeExample": false
}
```

**What This Means**: Your integration strategy incorporates essential resilience patterns (retry, circuit breaker, rate limiting). With 15 APIs, centralized error handling will save significant debugging time.

## User Experience

When you invoke Pattern, you receive a confirmation of your design:

| Field | What It Tells You |
|-------|-------------------|
| `patternName` | Which pattern was applied |
| `status` | "success" if pattern application is valid |
| `hasImplementation` | Whether implementation steps were provided |
| `hasCodeExample` | Whether code samples were included |

**The value is in structured thinking** - Pattern forces you to articulate context, implementation, benefits, and trade-offs before building.

## Integration Tips

- **Start with context** - Be specific about your constraints and requirements
- **List trade-offs honestly** - Every pattern has costs; acknowledge them upfront
- **Include languages** - Different languages have different idiomatic implementations
- **Chain with Paradigm** - After selecting a pattern, use Paradigm to choose the right coding style
- **Document for team** - Pattern output serves as architectural decision records (ADRs)

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patternName` | enum | Yes | modular_architecture, api_integration, state_management, async_processing, scalability, security, agentic_design |
| `context` | string | Yes | Description of your specific situation |
| `implementation` | string[] | No | Step-by-step implementation plan |
| `benefits` | string[] | No | Advantages of this approach |
| `tradeoffs` | string[] | No | Costs and limitations |
| `codeExample` | string | No | Sample code demonstrating the pattern |
| `languages` | string[] | No | Applicable programming languages |
