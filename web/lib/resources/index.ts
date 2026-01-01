/**
 * MCP Resources Registration
 *
 * Registers all think-mcp resources with the MCP server.
 * Following the same pattern as mcp-tools.ts for consistency.
 */

import { handleModelsRead, getModelsCatalog } from './models';
import { handlePatternsRead, getPatternsCatalog } from './patterns';
import { handleParadigmsRead, getParadigmsCatalog } from './paradigms';
import { handleDebugApproachesRead, getDebugApproachesCatalog } from './debug-approaches';

// Extended resources (detailed views with examples)
import { handleExtendedModelRead, getExtendedModelNames } from './extended/models';
import { handleExtendedPatternRead, getExtendedPatternNames } from './extended/patterns';
import { handleExtendedParadigmRead, getExtendedParadigmNames } from './extended/paradigms';
import { handleExtendedDebugApproachRead, getExtendedDebugApproachNames } from './extended/debug';

/**
 * Resource URIs
 */
export const RESOURCE_URIS = {
  // Base catalogs
  MODELS: 'think://models',
  PATTERNS: 'think://patterns',
  PARADIGMS: 'think://paradigms',
  DEBUG_APPROACHES: 'think://debug-approaches',
  // Extended (drill-down) resources - use template patterns
  MODEL_DETAIL: 'think://models/{name}',
  PATTERN_DETAIL: 'think://patterns/{name}',
  PARADIGM_DETAIL: 'think://paradigms/{name}',
  DEBUG_APPROACH_DETAIL: 'think://debug-approaches/{name}',
} as const;

/**
 * Resource metadata
 */
const RESOURCE_METADATA = {
  [RESOURCE_URIS.MODELS]: {
    name: 'mental-models',
    title: 'Mental Models Catalog',
    description: 'Browse the 6 mental models available in think-mcp: first principles, opportunity cost, error propagation, rubber duck, pareto principle, and occams razor.',
    mimeType: 'application/json',
  },
  [RESOURCE_URIS.PATTERNS]: {
    name: 'design-patterns',
    title: 'Design Patterns Catalog',
    description: 'Browse the 7 design patterns available in think-mcp: modular architecture, API integration, state management, async processing, scalability, security, and agentic design.',
    mimeType: 'application/json',
  },
  [RESOURCE_URIS.PARADIGMS]: {
    name: 'programming-paradigms',
    title: 'Programming Paradigms Catalog',
    description: 'Browse the 10 programming paradigms available in think-mcp: imperative, procedural, object-oriented, functional, declarative, logic, event-driven, aspect-oriented, concurrent, and reactive.',
    mimeType: 'application/json',
  },
  [RESOURCE_URIS.DEBUG_APPROACHES]: {
    name: 'debugging-approaches',
    title: 'Debugging Approaches Catalog',
    description: 'Browse the 6 debugging approaches available in think-mcp: binary search, reverse engineering, divide and conquer, backtracking, cause elimination, and program slicing.',
    mimeType: 'application/json',
  },
};

/**
 * Register all resources with the MCP server
 *
 * @param server - The MCP server instance
 */
export function registerAllResources(server: any) {
  // Register mental models resource
  server.resource(
    RESOURCE_METADATA[RESOURCE_URIS.MODELS].name,
    RESOURCE_URIS.MODELS,
    {
      title: RESOURCE_METADATA[RESOURCE_URIS.MODELS].title,
      description: RESOURCE_METADATA[RESOURCE_URIS.MODELS].description,
      mimeType: RESOURCE_METADATA[RESOURCE_URIS.MODELS].mimeType,
    },
    handleModelsRead
  );

  // Register design patterns resource
  server.resource(
    RESOURCE_METADATA[RESOURCE_URIS.PATTERNS].name,
    RESOURCE_URIS.PATTERNS,
    {
      title: RESOURCE_METADATA[RESOURCE_URIS.PATTERNS].title,
      description: RESOURCE_METADATA[RESOURCE_URIS.PATTERNS].description,
      mimeType: RESOURCE_METADATA[RESOURCE_URIS.PATTERNS].mimeType,
    },
    handlePatternsRead
  );

  // Register programming paradigms resource
  server.resource(
    RESOURCE_METADATA[RESOURCE_URIS.PARADIGMS].name,
    RESOURCE_URIS.PARADIGMS,
    {
      title: RESOURCE_METADATA[RESOURCE_URIS.PARADIGMS].title,
      description: RESOURCE_METADATA[RESOURCE_URIS.PARADIGMS].description,
      mimeType: RESOURCE_METADATA[RESOURCE_URIS.PARADIGMS].mimeType,
    },
    handleParadigmsRead
  );

  // Register debugging approaches resource
  server.resource(
    RESOURCE_METADATA[RESOURCE_URIS.DEBUG_APPROACHES].name,
    RESOURCE_URIS.DEBUG_APPROACHES,
    {
      title: RESOURCE_METADATA[RESOURCE_URIS.DEBUG_APPROACHES].title,
      description: RESOURCE_METADATA[RESOURCE_URIS.DEBUG_APPROACHES].description,
      mimeType: RESOURCE_METADATA[RESOURCE_URIS.DEBUG_APPROACHES].mimeType,
    },
    handleDebugApproachesRead
  );

  // === EXTENDED RESOURCES (Progressive Disclosure) ===
  // These provide detailed views with examples for individual items

  // Register extended mental model resources (one per model)
  for (const modelName of getExtendedModelNames()) {
    server.resource(
      `model-${modelName}`,
      `think://models/${modelName}`,
      {
        title: `Mental Model: ${modelName.replace(/_/g, ' ')}`,
        description: `Detailed view of the ${modelName.replace(/_/g, ' ')} mental model with examples and usage guidance.`,
        mimeType: 'application/json',
      },
      handleExtendedModelRead
    );
  }

  // Register extended design pattern resources (one per pattern)
  for (const patternName of getExtendedPatternNames()) {
    server.resource(
      `pattern-${patternName}`,
      `think://patterns/${patternName}`,
      {
        title: `Pattern: ${patternName.replace(/_/g, ' ')}`,
        description: `Detailed view of the ${patternName.replace(/_/g, ' ')} design pattern with implementation examples.`,
        mimeType: 'application/json',
      },
      handleExtendedPatternRead
    );
  }

  // Register extended paradigm resources (one per paradigm)
  for (const paradigmName of getExtendedParadigmNames()) {
    server.resource(
      `paradigm-${paradigmName}`,
      `think://paradigms/${paradigmName}`,
      {
        title: `Paradigm: ${paradigmName.replace(/_/g, ' ')}`,
        description: `Detailed view of ${paradigmName.replace(/_/g, ' ')} programming with code examples.`,
        mimeType: 'application/json',
      },
      handleExtendedParadigmRead
    );
  }

  // Register extended debug approach resources (one per approach)
  for (const approachName of getExtendedDebugApproachNames()) {
    server.resource(
      `debug-${approachName}`,
      `think://debug-approaches/${approachName}`,
      {
        title: `Debug: ${approachName.replace(/_/g, ' ')}`,
        description: `Detailed walkthrough of the ${approachName.replace(/_/g, ' ')} debugging approach.`,
        mimeType: 'application/json',
      },
      handleExtendedDebugApproachRead
    );
  }
}

// Re-export catalog getters for testing/direct access
export { getModelsCatalog, getPatternsCatalog, getParadigmsCatalog, getDebugApproachesCatalog };
