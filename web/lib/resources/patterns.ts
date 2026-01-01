/**
 * Design Patterns Resource Catalog
 *
 * Exposes the 7 design patterns available in think-mcp
 * as a browsable MCP resource.
 */

import { ResourceCatalog, ResourceCatalogItem, ReadResourceResult } from './types';

/**
 * Design pattern definitions
 */
const DESIGN_PATTERNS: ResourceCatalogItem[] = [
  {
    name: 'modular_architecture',
    title: 'Modular Architecture',
    description: 'Design systems with independent, interchangeable modules for better maintainability and scalability.',
    useCases: [
      'Large-scale application design',
      'Microservices architecture',
      'Plugin systems',
      'Code organization',
    ],
    steps: [
      'Identify distinct functional areas',
      'Define clear module boundaries',
      'Establish module interfaces',
      'Minimize inter-module dependencies',
    ],
  },
  {
    name: 'api_integration',
    title: 'API Integration Patterns',
    description: 'Best practices for integrating with external APIs including error handling, caching, and resilience.',
    useCases: [
      'Third-party service integration',
      'Microservices communication',
      'Data synchronization',
      'External API consumption',
    ],
    steps: [
      'Design clear API contracts',
      'Implement error handling and retries',
      'Add caching layers where appropriate',
      'Monitor and log API interactions',
    ],
  },
  {
    name: 'state_management',
    title: 'State Management',
    description: 'Patterns for managing application state predictably across components and services.',
    useCases: [
      'Frontend application state',
      'Distributed system state',
      'Session management',
      'Real-time data synchronization',
    ],
    steps: [
      'Define state shape and types',
      'Centralize state mutations',
      'Implement predictable state transitions',
      'Handle side effects separately',
    ],
  },
  {
    name: 'async_processing',
    title: 'Asynchronous Processing',
    description: 'Handle long-running operations, background jobs, and concurrent tasks effectively.',
    useCases: [
      'Background job processing',
      'Event-driven architectures',
      'Real-time data pipelines',
      'Concurrent operations',
    ],
    steps: [
      'Identify async boundaries',
      'Implement message queues or event buses',
      'Handle failures and retries',
      'Monitor async operation health',
    ],
  },
  {
    name: 'scalability',
    title: 'Scalability Considerations',
    description: 'Design systems that can handle growth in users, data, and traffic.',
    useCases: [
      'High-traffic applications',
      'Data-intensive systems',
      'Growing user bases',
      'Global deployments',
    ],
    steps: [
      'Identify bottlenecks and constraints',
      'Design for horizontal scaling',
      'Implement caching strategies',
      'Use load balancing and distribution',
    ],
  },
  {
    name: 'security',
    title: 'Security Best Practices',
    description: 'Implement defense-in-depth security measures throughout your application.',
    useCases: [
      'Authentication and authorization',
      'Data protection',
      'API security',
      'Compliance requirements',
    ],
    steps: [
      'Identify security requirements',
      'Implement authentication/authorization',
      'Encrypt sensitive data',
      'Audit and monitor security events',
    ],
  },
  {
    name: 'agentic_design',
    title: 'Agentic Design Patterns',
    description: 'Design patterns for building AI agents that can reason, plan, and take actions autonomously.',
    useCases: [
      'AI assistant development',
      'Autonomous agent systems',
      'Multi-agent coordination',
      'Human-AI collaboration',
    ],
    steps: [
      'Define agent goals and constraints',
      'Implement reasoning and planning',
      'Design action spaces and tools',
      'Handle feedback and iteration',
    ],
  },
];

/**
 * Build the design patterns catalog
 */
export function getPatternsCatalog(): ResourceCatalog {
  return {
    type: 'design-patterns',
    version: '2.0.0',
    count: DESIGN_PATTERNS.length,
    items: DESIGN_PATTERNS,
  };
}

/**
 * Handle resource read for design patterns
 */
export async function handlePatternsRead(uri: URL): Promise<ReadResourceResult> {
  const catalog = getPatternsCatalog();

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
