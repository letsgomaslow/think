/**
 * Progress Notification Types
 *
 * Defines interfaces for progress tracking during long-running tool operations.
 * Supports A/B variant switching via experiment configuration.
 */

/**
 * Progress granularity levels for A/B testing
 * - 'none': No progress notifications
 * - 'phase': High-level phase updates only (maps to minimal behavior)
 * - 'detailed': Detailed per-step updates with context
 */
export type ProgressGranularity = 'none' | 'phase' | 'detailed';

/**
 * Progress notification payload
 */
export interface ProgressNotification {
  /** Tool being executed */
  tool: string;
  /** Progress value 0-100 */
  progress: number;
  /** Total expected steps */
  total: number;
  /** Human-readable description */
  message: string;
  /** Current phase/stage name */
  phase?: string;
  /** Additional context (for detailed variant) */
  context?: Record<string, unknown>;
}

/**
 * Progress configuration from experiment config
 */
export interface ProgressConfig {
  /** Whether progress notifications are enabled */
  enabled: boolean;
  /** Granularity level: 'detailed' or 'minimal' */
  granularity: ProgressGranularity;
}

/**
 * Default progress configuration
 */
export const DEFAULT_PROGRESS_CONFIG: ProgressConfig = {
  enabled: true,
  granularity: 'detailed',
};

/**
 * Progress callback function type
 */
export type ProgressCallback = (notification: ProgressNotification) => void;

/**
 * Tool-specific progress phases
 */
export const COUNCIL_PHASES = [
  'problem-definition',
  'ideation',
  'critique',
  'integration',
  'decision',
  'reflection',
] as const;

export const HYPOTHESIS_PHASES = [
  'observation',
  'question',
  'hypothesis',
  'experiment',
  'analysis',
  'conclusion',
  'iteration',
] as const;

export type CouncilPhase = typeof COUNCIL_PHASES[number];
export type HypothesisPhase = typeof HYPOTHESIS_PHASES[number];
