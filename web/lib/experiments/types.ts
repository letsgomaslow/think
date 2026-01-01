/**
 * A/B Testing Types for think-mcp
 *
 * Defines experiment configuration and tracking event types for
 * runtime variant switching via Vercel Edge Config.
 */

// Prompt variant types
export type PromptVariant = 'A' | 'B';

// Progress notification granularity
export type ProgressGranularity = 'none' | 'phase' | 'detailed';

// Resource disclosure levels
export type ResourceDisclosure = 'minimal' | 'standard' | 'extended';

/**
 * Experiment configuration stored in Vercel Edge Config
 */
export interface ExperimentConfig {
  // Prompt variants
  promptVariant: PromptVariant;

  // Progress notification granularity
  // - 'none': No progress notifications
  // - 'phase': High-level phase updates only
  // - 'detailed': Detailed per-step updates with persona names, etc.
  progressGranularity: ProgressGranularity;

  // Resource disclosure level
  // - 'minimal': Basic catalog only
  // - 'standard': Catalog with descriptions
  // - 'extended': Full details with examples
  resourceDisclosure: ResourceDisclosure;

  // Feature flags
  features: {
    enablePrompts: boolean;
    enableResources: boolean;
    enableProgress: boolean;
    enableTracking: boolean;
  };

  // Version for config migrations
  version: string;
}

/**
 * Experiment event types for tracking
 */
export type ExperimentEventType =
  | 'exposure'      // User exposed to a variant
  | 'completion'    // User completed a tool flow
  | 'error'         // Error occurred during tool execution
  | 'retention'     // User returned to use tool again
  | 'conversion';   // User achieved a goal (e.g., completed full analysis)

/**
 * Experiment tracking event
 */
export interface ExperimentEvent {
  // Event type
  type: ExperimentEventType;

  // Which tool was used
  tool: string;

  // Which variant was active
  variant: PromptVariant;

  // Session identifier (from MCP client)
  sessionId?: string;

  // Additional metadata
  metadata?: Record<string, unknown>;

  // Timestamp
  timestamp: string;
}

/**
 * Default experiment configuration (fallback when Edge Config unavailable)
 */
export const DEFAULT_EXPERIMENT_CONFIG: ExperimentConfig = {
  promptVariant: 'A',
  progressGranularity: 'detailed',
  resourceDisclosure: 'standard',
  features: {
    enablePrompts: true,
    enableResources: true,
    enableProgress: true,
    enableTracking: true,
  },
  version: '1.0.0',
};
