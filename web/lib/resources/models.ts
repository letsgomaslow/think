/**
 * Mental Models Resource Catalog
 *
 * Exposes the 6 mental models available in think-mcp
 * as a browsable MCP resource.
 */

import { ResourceCatalog, ResourceCatalogItem, ReadResourceResult } from './types';

/**
 * Mental model definitions
 */
const MENTAL_MODELS: ResourceCatalogItem[] = [
  {
    name: 'first_principles',
    title: 'First Principles Thinking',
    description: 'Break down complex problems to their fundamental truths and build up from there.',
    useCases: [
      'Solving novel problems without existing solutions',
      'Challenging assumptions in established processes',
      'Innovation and creative problem-solving',
      'Understanding root causes',
    ],
    steps: [
      'Identify and question assumptions',
      'Break down the problem to fundamental truths',
      'Rebuild solutions from the ground up',
      'Validate against core principles',
    ],
  },
  {
    name: 'opportunity_cost',
    title: 'Opportunity Cost Analysis',
    description: 'Evaluate trade-offs by considering what you give up when choosing one option over another.',
    useCases: [
      'Resource allocation decisions',
      'Time management prioritization',
      'Investment and financial choices',
      'Strategic planning',
    ],
    steps: [
      'Identify all available options',
      'Determine the value of each option',
      'Calculate what you lose by not choosing alternatives',
      'Make informed trade-off decisions',
    ],
  },
  {
    name: 'error_propagation',
    title: 'Error Propagation Understanding',
    description: 'Track how errors compound and spread through a system to identify critical failure points.',
    useCases: [
      'System reliability analysis',
      'Debugging cascading failures',
      'Risk assessment in complex systems',
      'Quality control processes',
    ],
    steps: [
      'Map the system components and dependencies',
      'Identify potential error sources',
      'Trace how errors propagate through the system',
      'Prioritize fixes based on impact',
    ],
  },
  {
    name: 'rubber_duck',
    title: 'Rubber Duck Debugging',
    description: 'Explain your problem step-by-step to gain clarity and discover solutions.',
    useCases: [
      'Debugging code issues',
      'Clarifying complex thoughts',
      'Preparing presentations',
      'Teaching and knowledge transfer',
    ],
    steps: [
      'State the problem clearly',
      'Explain your code/logic line by line',
      'Notice where explanations become difficult',
      'Identify gaps in understanding',
    ],
  },
  {
    name: 'pareto_principle',
    title: 'Pareto Principle (80/20 Rule)',
    description: 'Focus on the 20% of efforts that produce 80% of results.',
    useCases: [
      'Productivity optimization',
      'Business prioritization',
      'Bug triage and fixing',
      'Feature prioritization',
    ],
    steps: [
      'Identify all contributing factors',
      'Measure impact of each factor',
      'Rank by contribution to results',
      'Focus efforts on high-impact items',
    ],
  },
  {
    name: 'occams_razor',
    title: "Occam's Razor",
    description: 'Prefer the simplest explanation that fits the evidence.',
    useCases: [
      'Hypothesis evaluation',
      'Debugging and troubleshooting',
      'System design decisions',
      'Scientific reasoning',
    ],
    steps: [
      'List all possible explanations',
      'Evaluate complexity of each',
      'Check which fit the evidence',
      'Prefer simpler explanations',
    ],
  },
];

/**
 * Build the mental models catalog
 */
export function getModelsCatalog(): ResourceCatalog {
  return {
    type: 'mental-models',
    version: '2.0.0',
    count: MENTAL_MODELS.length,
    items: MENTAL_MODELS,
  };
}

/**
 * Handle resource read for mental models
 */
export async function handleModelsRead(uri: URL): Promise<ReadResourceResult> {
  const catalog = getModelsCatalog();

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
