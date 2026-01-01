/**
 * Programming Paradigms Resource Catalog
 *
 * Exposes the 10 programming paradigms available in think-mcp
 * as a browsable MCP resource.
 */

import { ResourceCatalog, ResourceCatalogItem, ReadResourceResult } from './types';

/**
 * Programming paradigm definitions
 */
const PROGRAMMING_PARADIGMS: ResourceCatalogItem[] = [
  {
    name: 'imperative',
    title: 'Imperative Programming',
    description: 'Execute sequences of commands that change program state step by step.',
    useCases: [
      'System programming',
      'Performance-critical code',
      'Hardware interaction',
      'Sequential algorithms',
    ],
    steps: [
      'Define program state variables',
      'Write sequential instructions',
      'Use control flow statements',
      'Mutate state explicitly',
    ],
  },
  {
    name: 'procedural',
    title: 'Procedural Programming',
    description: 'Organize code into reusable procedures that operate on data.',
    useCases: [
      'Script development',
      'Data processing pipelines',
      'System utilities',
      'Structured programming',
    ],
    steps: [
      'Identify reusable operations',
      'Create procedures/functions',
      'Pass data as parameters',
      'Compose procedures for complex tasks',
    ],
  },
  {
    name: 'object_oriented',
    title: 'Object-Oriented Programming',
    description: 'Model systems using objects that encapsulate state and behavior.',
    useCases: [
      'Large-scale applications',
      'GUI frameworks',
      'Game development',
      'Domain modeling',
    ],
    steps: [
      'Identify domain entities',
      'Define classes with properties and methods',
      'Use inheritance and polymorphism',
      'Encapsulate implementation details',
    ],
  },
  {
    name: 'functional',
    title: 'Functional Programming',
    description: 'Build programs by composing pure functions without side effects.',
    useCases: [
      'Data transformation',
      'Concurrent programming',
      'Mathematical computations',
      'Predictable state management',
    ],
    steps: [
      'Write pure functions',
      'Avoid mutable state',
      'Use function composition',
      'Leverage higher-order functions',
    ],
  },
  {
    name: 'declarative',
    title: 'Declarative Programming',
    description: 'Describe what the program should accomplish without specifying how.',
    useCases: [
      'Database queries (SQL)',
      'UI component definitions',
      'Configuration management',
      'Build systems',
    ],
    steps: [
      'Define desired outcomes',
      'Specify constraints and rules',
      'Let runtime determine execution',
      'Focus on relationships over procedures',
    ],
  },
  {
    name: 'logic',
    title: 'Logic Programming',
    description: 'Express computation as logical relations and queries.',
    useCases: [
      'Expert systems',
      'Constraint satisfaction',
      'Natural language processing',
      'Knowledge representation',
    ],
    steps: [
      'Define facts and rules',
      'Express queries as goals',
      'Use unification for matching',
      'Apply backtracking for solutions',
    ],
  },
  {
    name: 'event_driven',
    title: 'Event-Driven Programming',
    description: 'Structure programs around events and their handlers.',
    useCases: [
      'User interface development',
      'Real-time systems',
      'IoT applications',
      'Message-based architectures',
    ],
    steps: [
      'Define event types',
      'Register event handlers',
      'Emit events when state changes',
      'Process events asynchronously',
    ],
  },
  {
    name: 'aspect_oriented',
    title: 'Aspect-Oriented Programming',
    description: 'Separate cross-cutting concerns from core business logic.',
    useCases: [
      'Logging and monitoring',
      'Security and authorization',
      'Transaction management',
      'Caching strategies',
    ],
    steps: [
      'Identify cross-cutting concerns',
      'Define aspects with pointcuts',
      'Implement advice (before/after/around)',
      'Weave aspects into target code',
    ],
  },
  {
    name: 'concurrent',
    title: 'Concurrent Programming',
    description: 'Execute multiple computations simultaneously for improved throughput.',
    useCases: [
      'Multi-core utilization',
      'Server applications',
      'Background processing',
      'Parallel algorithms',
    ],
    steps: [
      'Identify independent tasks',
      'Choose synchronization primitives',
      'Handle shared state carefully',
      'Avoid deadlocks and race conditions',
    ],
  },
  {
    name: 'reactive',
    title: 'Reactive Programming',
    description: 'Build systems that react to data streams and propagate changes.',
    useCases: [
      'Real-time data dashboards',
      'Streaming data processing',
      'Interactive applications',
      'Event sourcing systems',
    ],
    steps: [
      'Define data streams',
      'Apply stream operators',
      'Subscribe to changes',
      'Handle backpressure',
    ],
  },
];

/**
 * Build the programming paradigms catalog
 */
export function getParadigmsCatalog(): ResourceCatalog {
  return {
    type: 'programming-paradigms',
    version: '2.0.0',
    count: PROGRAMMING_PARADIGMS.length,
    items: PROGRAMMING_PARADIGMS,
  };
}

/**
 * Handle resource read for programming paradigms
 */
export async function handleParadigmsRead(uri: URL): Promise<ReadResourceResult> {
  const catalog = getParadigmsCatalog();

  return {
    contents: [
      {
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify(catalog, null, 2),
      },
    ],
  };
}
