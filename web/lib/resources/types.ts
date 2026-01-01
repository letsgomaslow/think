/**
 * Resource Types for think-mcp MCP Resources
 *
 * Defines catalog structures for exposing mental models,
 * design patterns, paradigms, and debugging approaches.
 */

/**
 * Individual item in a resource catalog
 */
export interface ResourceCatalogItem {
  /** Unique identifier (e.g., 'first_principles') */
  name: string;

  /** Human-readable title */
  title: string;

  /** Brief description of the item */
  description: string;

  /** When to use this model/pattern */
  useCases?: string[];

  /** Key steps or components */
  steps?: string[];
}

/**
 * Resource catalog structure
 */
export interface ResourceCatalog {
  /** Catalog type (e.g., 'mental-models', 'design-patterns') */
  type: string;

  /** Catalog version */
  version: string;

  /** Total count of items */
  count: number;

  /** Catalog items */
  items: ResourceCatalogItem[];
}

/**
 * Result structure for MCP resource read operations
 */
export interface ReadResourceResult {
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
}
