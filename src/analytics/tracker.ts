/**
 * Tool Invocation Tracker
 *
 * Captures tool invocations with minimal metadata for analytics:
 * - Tool name (from TOOL_NAMES)
 * - Timestamp (ISO format)
 * - Success/error status
 * - Duration in milliseconds
 *
 * Privacy guarantees:
 * - No tool arguments are captured
 * - No response content is captured
 * - No error messages are captured (only category)
 * - Session ID is randomly generated, not tied to any user
 *
 * Usage:
 * ```typescript
 * import { getTracker } from './tracker.js';
 *
 * const tracker = getTracker();
 *
 * // Start tracking a tool invocation
 * const invocation = tracker.startInvocation('think');
 *
 * try {
 *   const result = await executeTool(args);
 *   invocation.complete(true);
 * } catch (error) {
 *   invocation.complete(false, 'runtime');
 * }
 *
 * // Or use the wrapper for simpler usage
 * const result = await tracker.trackInvocation('think', async () => {
 *   return await executeTool(args);
 * });
 * ```
 */

import { ToolName } from '../toolNames.js';
import { ErrorCategory } from './types.js';
import {
  getCollector,
  AnalyticsCollector,
  TrackOptions,
} from './collector.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Represents an active tool invocation being tracked.
 * Provides methods to complete the invocation with success or error status.
 */
export interface TrackedInvocation {
  /**
   * The tool name being tracked.
   */
  readonly toolName: ToolName;

  /**
   * The ISO timestamp when the invocation started.
   */
  readonly startTimestamp: string;

  /**
   * Completes the invocation tracking.
   *
   * @param success - Whether the invocation was successful
   * @param errorCategory - Error category if not successful
   */
  complete(success: boolean, errorCategory?: ErrorCategory): void;

  /**
   * Gets the duration since the invocation started.
   *
   * @returns Duration in milliseconds
   */
  getDuration(): number;
}

/**
 * Options for creating a tracker instance.
 */
export interface TrackerOptions {
  /**
   * Custom collector to use (defaults to singleton).
   */
  collector?: AnalyticsCollector;
}

/**
 * Statistics about the tracker's current state.
 */
export interface TrackerStats {
  /**
   * Whether analytics tracking is enabled.
   */
  enabled: boolean;

  /**
   * Current session ID.
   */
  sessionId: string;

  /**
   * Number of active (uncompleted) invocations.
   */
  activeInvocations: number;

  /**
   * Total invocations started in this session.
   */
  totalInvocationsStarted: number;

  /**
   * Total invocations completed in this session.
   */
  totalInvocationsCompleted: number;

  /**
   * Total successful invocations.
   */
  totalSuccesses: number;

  /**
   * Total failed invocations.
   */
  totalErrors: number;
}

/**
 * Internal representation of an active invocation.
 */
interface ActiveInvocation {
  toolName: ToolName;
  startTime: number;
  startTimestamp: string;
}

// =============================================================================
// Session ID Generation
// =============================================================================

/**
 * Generates a random session ID.
 * Uses crypto-safe randomness when available, falls back to Math.random.
 * Not tied to any user identifier.
 *
 * @returns Random session ID string (16 characters, alphanumeric)
 */
function generateSessionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// =============================================================================
// Tool Invocation Tracker Class
// =============================================================================

/**
 * Tool Invocation Tracker
 *
 * Tracks tool invocations with minimal metadata for analytics purposes.
 * Designed for zero overhead when analytics are disabled.
 */
export class ToolInvocationTracker {
  private collector: AnalyticsCollector;
  private sessionId: string;
  private activeInvocations: Map<string, ActiveInvocation> = new Map();
  private invocationCounter: number = 0;

  // Statistics
  private totalInvocationsStarted: number = 0;
  private totalInvocationsCompleted: number = 0;
  private totalSuccesses: number = 0;
  private totalErrors: number = 0;

  /**
   * Creates a new tool invocation tracker.
   *
   * @param options - Tracker options
   */
  constructor(options?: TrackerOptions) {
    this.collector = options?.collector ?? getCollector();
    this.sessionId = generateSessionId();
  }

  /**
   * Checks if analytics tracking is enabled.
   *
   * @returns true if tracking is enabled
   */
  isEnabled(): boolean {
    return this.collector.isEnabled();
  }

  /**
   * Gets the current session ID.
   *
   * @returns The session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Starts tracking a tool invocation.
   *
   * Returns a TrackedInvocation object that must be completed
   * with either success or error status.
   *
   * When analytics are disabled, returns a no-op invocation object
   * that has zero performance impact.
   *
   * @param toolName - The name of the tool being invoked
   * @returns TrackedInvocation object to complete the tracking
   */
  startInvocation(toolName: ToolName): TrackedInvocation {
    const startTime = Date.now();
    const startTimestamp = new Date(startTime).toISOString();

    // Fast path: return no-op when disabled
    if (!this.isEnabled()) {
      return this.createNoOpInvocation(toolName, startTimestamp, startTime);
    }

    // Create active invocation
    const invocationId = `${this.sessionId}-${++this.invocationCounter}`;
    const activeInvocation: ActiveInvocation = {
      toolName,
      startTime,
      startTimestamp,
    };
    this.activeInvocations.set(invocationId, activeInvocation);
    this.totalInvocationsStarted++;

    // Create tracked invocation object
    let completed = false;
    const tracker = this;

    return {
      toolName,
      startTimestamp,

      complete(success: boolean, errorCategory?: ErrorCategory): void {
        // Prevent double completion
        if (completed) {
          return;
        }
        completed = true;

        // Remove from active invocations
        tracker.activeInvocations.delete(invocationId);

        // Calculate duration
        const durationMs = Date.now() - startTime;

        // Update statistics
        tracker.totalInvocationsCompleted++;
        if (success) {
          tracker.totalSuccesses++;
        } else {
          tracker.totalErrors++;
        }

        // Track the event
        const trackOptions: TrackOptions = {
          toolName,
          success,
          durationMs,
          timestamp: startTimestamp,
          sessionId: tracker.sessionId,
        };

        if (!success && errorCategory) {
          trackOptions.errorCategory = errorCategory;
        }

        // Fire and forget - don't block the caller
        tracker.collector.trackSync(trackOptions);
      },

      getDuration(): number {
        return Date.now() - startTime;
      },
    };
  }

  /**
   * Creates a no-op invocation object for when analytics are disabled.
   * This is a pure object with no closures over tracker state.
   */
  private createNoOpInvocation(
    toolName: ToolName,
    startTimestamp: string,
    startTime: number
  ): TrackedInvocation {
    return {
      toolName,
      startTimestamp,
      complete: () => {
        // No-op
      },
      getDuration: () => Date.now() - startTime,
    };
  }

  /**
   * Tracks a tool invocation using a wrapper function.
   *
   * This is a convenience method that handles start/complete automatically.
   * Errors are caught and tracked, then re-thrown.
   *
   * @param toolName - The name of the tool being invoked
   * @param fn - The async function to execute
   * @returns The result of the function
   * @throws Re-throws any error from the function
   */
  async trackInvocation<T>(
    toolName: ToolName,
    fn: () => Promise<T>
  ): Promise<T> {
    const invocation = this.startInvocation(toolName);

    try {
      const result = await fn();
      invocation.complete(true);
      return result;
    } catch (error) {
      // Categorize the error without capturing the message
      const errorCategory = this.categorizeError(error);
      invocation.complete(false, errorCategory);
      throw error;
    }
  }

  /**
   * Tracks a synchronous tool invocation using a wrapper function.
   *
   * @param toolName - The name of the tool being invoked
   * @param fn - The synchronous function to execute
   * @returns The result of the function
   * @throws Re-throws any error from the function
   */
  trackInvocationSync<T>(
    toolName: ToolName,
    fn: () => T
  ): T {
    const invocation = this.startInvocation(toolName);

    try {
      const result = fn();
      invocation.complete(true);
      return result;
    } catch (error) {
      // Categorize the error without capturing the message
      const errorCategory = this.categorizeError(error);
      invocation.complete(false, errorCategory);
      throw error;
    }
  }

  /**
   * Categorizes an error into privacy-safe categories.
   * Only the category is recorded, never the error message.
   *
   * @param error - The error to categorize
   * @returns Error category
   */
  private categorizeError(error: unknown): ErrorCategory {
    if (error === null || error === undefined) {
      return 'unknown';
    }

    // Check for validation errors
    if (error instanceof Error) {
      const errorName = error.name.toLowerCase();
      const hasValidationKeyword = (
        errorName.includes('validation') ||
        errorName.includes('schema') ||
        errorName.includes('type') ||
        errorName.includes('argument')
      );

      if (hasValidationKeyword) {
        return 'validation';
      }

      // Check for timeout errors
      if (
        errorName.includes('timeout') ||
        errorName.includes('timedout') ||
        errorName.includes('etimedout')
      ) {
        return 'timeout';
      }

      // Default to runtime for other Error instances
      return 'runtime';
    }

    // Unknown error type
    return 'unknown';
  }

  /**
   * Gets statistics about the tracker's current state.
   *
   * @returns Tracker statistics
   */
  getStats(): TrackerStats {
    return {
      enabled: this.isEnabled(),
      sessionId: this.sessionId,
      activeInvocations: this.activeInvocations.size,
      totalInvocationsStarted: this.totalInvocationsStarted,
      totalInvocationsCompleted: this.totalInvocationsCompleted,
      totalSuccesses: this.totalSuccesses,
      totalErrors: this.totalErrors,
    };
  }

  /**
   * Resets the tracker state.
   * Useful for testing.
   */
  reset(): void {
    this.activeInvocations.clear();
    this.invocationCounter = 0;
    this.totalInvocationsStarted = 0;
    this.totalInvocationsCompleted = 0;
    this.totalSuccesses = 0;
    this.totalErrors = 0;
    this.sessionId = generateSessionId();
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the tracker.
 */
let defaultTracker: ToolInvocationTracker | null = null;

/**
 * Gets the default tracker instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default tool invocation tracker
 */
export function getTracker(): ToolInvocationTracker {
  if (defaultTracker === null) {
    defaultTracker = new ToolInvocationTracker();
  }
  return defaultTracker;
}

/**
 * Resets the default tracker.
 * Useful for testing.
 */
export function resetTracker(): void {
  if (defaultTracker) {
    defaultTracker.reset();
  }
  defaultTracker = null;
}

/**
 * Creates a new tracker with custom options.
 * Does not affect the default singleton.
 *
 * @param options - Tracker options
 * @returns New tracker instance
 */
export function createTracker(options?: TrackerOptions): ToolInvocationTracker {
  return new ToolInvocationTracker(options);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Starts tracking a tool invocation using the default tracker.
 * Convenience wrapper for getTracker().startInvocation().
 *
 * @param toolName - The name of the tool being invoked
 * @returns TrackedInvocation object to complete the tracking
 */
export function startInvocation(toolName: ToolName): TrackedInvocation {
  return getTracker().startInvocation(toolName);
}

/**
 * Tracks a tool invocation using the default tracker.
 * Convenience wrapper for getTracker().trackInvocation().
 *
 * @param toolName - The name of the tool being invoked
 * @param fn - The async function to execute
 * @returns The result of the function
 * @throws Re-throws any error from the function
 */
export async function trackInvocation<T>(
  toolName: ToolName,
  fn: () => Promise<T>
): Promise<T> {
  return getTracker().trackInvocation(toolName, fn);
}

/**
 * Tracks a synchronous tool invocation using the default tracker.
 * Convenience wrapper for getTracker().trackInvocationSync().
 *
 * @param toolName - The name of the tool being invoked
 * @param fn - The synchronous function to execute
 * @returns The result of the function
 * @throws Re-throws any error from the function
 */
export function trackInvocationSync<T>(
  toolName: ToolName,
  fn: () => T
): T {
  return getTracker().trackInvocationSync(toolName, fn);
}

/**
 * Checks if tracking is enabled using the default tracker.
 * Convenience wrapper for getTracker().isEnabled().
 *
 * @returns true if tracking is enabled
 */
export function isTrackingEnabled(): boolean {
  return getTracker().isEnabled();
}

/**
 * Gets tracker statistics using the default tracker.
 * Convenience wrapper for getTracker().getStats().
 *
 * @returns Tracker statistics
 */
export function getTrackerStats(): TrackerStats {
  return getTracker().getStats();
}
