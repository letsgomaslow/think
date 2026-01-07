/**
 * Analytics Middleware
 *
 * Provides a clean middleware-like pattern for wrapping tool calls
 * with analytics tracking. Designed for:
 *
 * - Zero overhead when analytics disabled
 * - Non-blocking tracking (never affects tool execution)
 * - Clean separation from business logic
 * - Safe error handling (tracking errors never propagate)
 *
 * Usage:
 * ```typescript
 * import { withAnalytics } from './analytics/middleware.js';
 *
 * // Wrap a tool handler
 * const result = await withAnalytics('trace', async () => {
 *   return await traceServer.processThought(args);
 * });
 * ```
 */

import { ToolName } from '../toolNames.js';
import {
  getTracker,
  ToolInvocationTracker,
  TrackedInvocation,
} from './tracker.js';
import { ErrorCategory } from './types.js';

// =============================================================================
// Types
// =============================================================================

/**
 * A tool handler function that returns a result.
 */
export type ToolHandler<T> = () => T;

/**
 * A tool handler function that returns a promise.
 */
export type AsyncToolHandler<T> = () => Promise<T>;

/**
 * Options for middleware configuration.
 */
export interface MiddlewareOptions {
  /**
   * Custom tracker instance (defaults to singleton).
   */
  tracker?: ToolInvocationTracker;
}

// =============================================================================
// Error Categorization
// =============================================================================

/**
 * Categorizes an error for analytics without capturing the message.
 * This is a privacy-safe operation - only the category is recorded.
 *
 * @param error - The error to categorize
 * @returns Error category
 */
function categorizeError(error: unknown): ErrorCategory {
  if (error === null || error === undefined) {
    return 'unknown';
  }

  if (error instanceof Error) {
    const errorName = error.name.toLowerCase();

    // Validation errors
    if (
      errorName.includes('validation') ||
      errorName.includes('schema') ||
      errorName.includes('type') ||
      errorName.includes('argument') ||
      errorName.includes('invalid')
    ) {
      return 'validation';
    }

    // Timeout errors
    if (
      errorName.includes('timeout') ||
      errorName.includes('timedout') ||
      errorName.includes('etimedout')
    ) {
      return 'timeout';
    }

    // Runtime errors (general Error instances)
    return 'runtime';
  }

  return 'unknown';
}

// =============================================================================
// Middleware Functions
// =============================================================================

/**
 * Wraps an async tool handler with analytics tracking.
 *
 * This is the primary middleware function for MCP tool handlers.
 * Features:
 * - Starts tracking before execution
 * - Completes tracking after success or failure
 * - Re-throws any errors from the handler
 * - Never lets tracking errors affect the tool execution
 * - Zero overhead when analytics disabled
 *
 * @param toolName - Name of the tool being invoked
 * @param handler - The async tool handler function
 * @param options - Optional middleware configuration
 * @returns The result from the handler
 * @throws Re-throws any error from the handler
 *
 * @example
 * ```typescript
 * const result = await withAnalytics('trace', async () => {
 *   return traceServer.processThought(args);
 * });
 * ```
 */
export async function withAnalytics<T>(
  toolName: ToolName,
  handler: AsyncToolHandler<T>,
  options?: MiddlewareOptions
): Promise<T> {
  const tracker = options?.tracker ?? getTracker();

  // Start tracking - returns no-op when disabled
  let invocation: TrackedInvocation;
  try {
    invocation = tracker.startInvocation(toolName);
  } catch {
    // If tracking setup fails, just run the handler without tracking
    return handler();
  }

  try {
    // Execute the tool handler
    const result = await handler();

    // Complete tracking as success
    try {
      invocation.complete(true);
    } catch {
      // Silently ignore tracking errors
    }

    return result;
  } catch (error) {
    // Complete tracking as failure
    try {
      const errorCategory = categorizeError(error);
      invocation.complete(false, errorCategory);
    } catch {
      // Silently ignore tracking errors
    }

    // Re-throw the original error
    throw error;
  }
}

/**
 * Wraps a synchronous tool handler with analytics tracking.
 *
 * Similar to withAnalytics but for synchronous handlers.
 *
 * @param toolName - Name of the tool being invoked
 * @param handler - The synchronous tool handler function
 * @param options - Optional middleware configuration
 * @returns The result from the handler
 * @throws Re-throws any error from the handler
 *
 * @example
 * ```typescript
 * const result = withAnalyticsSync('model', () => {
 *   return modelServer.processModel(args);
 * });
 * ```
 */
export function withAnalyticsSync<T>(
  toolName: ToolName,
  handler: ToolHandler<T>,
  options?: MiddlewareOptions
): T {
  const tracker = options?.tracker ?? getTracker();

  // Start tracking - returns no-op when disabled
  let invocation: TrackedInvocation;
  try {
    invocation = tracker.startInvocation(toolName);
  } catch {
    // If tracking setup fails, just run the handler without tracking
    return handler();
  }

  try {
    // Execute the tool handler
    const result = handler();

    // Complete tracking as success
    try {
      invocation.complete(true);
    } catch {
      // Silently ignore tracking errors
    }

    return result;
  } catch (error) {
    // Complete tracking as failure
    try {
      const errorCategory = categorizeError(error);
      invocation.complete(false, errorCategory);
    } catch {
      // Silently ignore tracking errors
    }

    // Re-throw the original error
    throw error;
  }
}

/**
 * Creates a bound middleware function for a specific tool.
 *
 * This is useful when you want to create a reusable wrapper
 * for a specific tool without passing the name each time.
 *
 * @param toolName - Name of the tool
 * @param options - Optional middleware configuration
 * @returns A middleware function bound to the tool name
 *
 * @example
 * ```typescript
 * const traceMiddleware = createToolMiddleware('trace');
 *
 * // Use it multiple times
 * const result1 = await traceMiddleware(async () => processThought1());
 * const result2 = await traceMiddleware(async () => processThought2());
 * ```
 */
export function createToolMiddleware(
  toolName: ToolName,
  options?: MiddlewareOptions
): <T>(handler: AsyncToolHandler<T>) => Promise<T> {
  return <T>(handler: AsyncToolHandler<T>) =>
    withAnalytics(toolName, handler, options);
}

/**
 * Creates a bound synchronous middleware function for a specific tool.
 *
 * @param toolName - Name of the tool
 * @param options - Optional middleware configuration
 * @returns A synchronous middleware function bound to the tool name
 */
export function createToolMiddlewareSync(
  toolName: ToolName,
  options?: MiddlewareOptions
): <T>(handler: ToolHandler<T>) => T {
  return <T>(handler: ToolHandler<T>) =>
    withAnalyticsSync(toolName, handler, options);
}

// =============================================================================
// Utility Exports
// =============================================================================

/**
 * Re-export tracker utilities for convenience.
 */
export {
  getTracker,
  resetTracker,
  isTrackingEnabled,
  getTrackerStats,
} from './tracker.js';

/**
 * Re-export collector utilities for lifecycle management.
 */
export {
  shutdownCollector,
  flushEvents,
} from './collector.js';
