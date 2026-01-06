/**
 * Mental Models Resource Catalog
 *
 * Exposes the 7 mental models available in think-mcp
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
  {
    name: 'swot_analysis',
    title: 'SWOT Analysis',
    description: 'Evaluate Strengths, Weaknesses, Opportunities, and Threats to make strategic decisions.',
    useCases: [
      'Strategic planning and business evaluation',
      'Competitive analysis and market positioning',
      'Project planning and risk assessment',
      'Personal development and career planning',
    ],
    steps: [
      'Identify internal Strengths (positive attributes and resources)',
      'Identify internal Weaknesses (limitations and areas for improvement)',
      'Identify external Opportunities (favorable conditions and trends)',
      'Identify external Threats (risks and competitive challenges)',
    ],
  },
  {
    name: 'six_thinking_hats',
    title: 'Six Thinking Hats (De Bono)',
    description: 'Explore problems from six distinct perspectives: White (facts), Red (emotions), Black (caution), Yellow (optimism), Green (creativity), and Blue (process control).',
    useCases: [
      'Group problem-solving and team discussions',
      'Decision-making with multiple perspectives',
      'Creative brainstorming and innovation',
      'Conflict resolution and balanced analysis',
    ],
    steps: [
      'White Hat: Gather facts, data, and objective information',
      'Red Hat: Express emotions, intuitions, and gut feelings',
      'Black Hat: Identify risks, weaknesses, and potential problems',
      'Yellow Hat: Explore benefits, optimism, and positive outcomes',
      'Green Hat: Generate creative ideas, alternatives, and possibilities',
      'Blue Hat: Manage the thinking process, summarize, and decide next steps',
    ],
  },
  {
    name: 'mece',
    title: 'MECE (Mutually Exclusive Collectively Exhaustive)',
    description: 'Structure analysis to ensure categories are Mutually Exclusive (no overlap) and Collectively Exhaustive (complete coverage).',
    useCases: [
      'Structuring complex problem analysis and frameworks',
      'Organizing data and information into clear categories',
      'Creating comprehensive business strategies',
      'Ensuring complete coverage in research and analysis',
    ],
    steps: [
      'Define the problem or domain to analyze',
      'Create categories that cover all possibilities (Collectively Exhaustive)',
      'Ensure no overlap between categories (Mutually Exclusive)',
      'Validate completeness and test for gaps or duplications',
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
