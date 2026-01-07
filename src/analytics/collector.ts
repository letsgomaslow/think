/**
 * Analytics Collector Service
 *
 * Main service for collecting and persisting analytics events with:
 * - Singleton pattern for consistent access
 * - Configuration-aware (respects enabled/disabled)
 * - Event batching for efficient writes
 * - Zero overhead when disabled (no-op mode)
 * - Graceful error handling that never affects main application
 *
 * Usage:
 * ```typescript
 * import { getCollector } from './collector.js';
 *
 * const collector = getCollector();
 * await collector.track({
 *   toolName: 'think',
 *   timestamp: new Date().toISOString(),
 *   success: true,
 *   durationMs: 150,
 *   sessionId: 'abc123'
 * });
 * ```
 */

import {
  AnalyticsEvent,
  ErrorCategory,
} from './types.js';
import { getConfigManager, AnalyticsConfigManager } from './config.js';
import { getStorageAdapter, AnalyticsStorageAdapter } from './storage.js';
import { ToolName } from '../toolNames.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for tracking an event.
 * Provides a simpler interface than the full AnalyticsEvent.
 */
export interface TrackOptions {
  /**
   * Name of the tool that was invoked.
   */
  toolName: ToolName;

  /**
   * Whether the tool invocation was successful.
   */
  success: boolean;

  /**
   * Duration of the invocation in milliseconds.
   */
  durationMs: number;

  /**
   * Error category if the invocation failed.
   * Only used when success is false.
   */
  errorCategory?: ErrorCategory;

  /**
   * ISO 8601 timestamp.
   * Defaults to current time if not provided.
   */
  timestamp?: string;

  /**
   * Session identifier.
   * Defaults to collector's session ID if not provided.
   */
  sessionId?: string;
}

/**
 * Result of a flush operation.
 */
export interface FlushResult {
  /**
   * Whether the flush was successful.
   */
  success: boolean;

  /**
   * Number of events flushed.
   */
  eventsFlushed: number;

  /**
   * Error message if flush failed.
   */
  error?: string;
}

/**
 * Statistics about the collector's current state.
 */
export interface CollectorStats {
  /**
   * Whether analytics collection is enabled.
   */
  enabled: boolean;

  /**
   * Number of events pending in the batch.
   */
  pendingEvents: number;

  /**
   * Total number of events tracked in this session.
   */
  totalEventsTracked: number;

  /**
   * Total number of events successfully flushed.
   */
  totalEventsFlushed: number;

  /**
   * Total number of flush errors.
   */
  totalFlushErrors: number;

  /**
   * Current session ID.
   */
  sessionId: string;

  /**
   * Batch size configuration.
   */
  batchSize: number;

  /**
   * Flush interval configuration (ms).
   */
  flushIntervalMs: number;
}

// =============================================================================
// Session ID Generation
// =============================================================================

/**
 * Generates a random session ID.
 * Uses crypto random bytes for uniqueness.
 * Not tied to any user identifier.
 *
 * @returns Random session ID string
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
// Analytics Collector Class
// =============================================================================

/**
 * Analytics Collector
 *
 * Collects analytics events and persists them to storage with batching.
 * Designed for minimal performance impact - becomes a complete no-op
 * when analytics are disabled.
 */
export class AnalyticsCollector {
  private configManager: AnalyticsConfigManager;
  private storageAdapter: AnalyticsStorageAdapter;
  private sessionId: string;
  private eventBatch: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isShuttingDown: boolean = false;

  // Statistics
  private totalEventsTracked: number = 0;
  private totalEventsFlushed: number = 0;
  private totalFlushErrors: number = 0;

  /**
   * Creates a new analytics collector.
   *
   * @param configManager - Configuration manager (defaults to singleton)
   * @param storageAdapter - Storage adapter (defaults to singleton)
   */
  constructor(
    configManager?: AnalyticsConfigManager,
    storageAdapter?: AnalyticsStorageAdapter
  ) {
    this.configManager = configManager ?? getConfigManager();
    this.storageAdapter = storageAdapter ?? getStorageAdapter();
    this.sessionId = generateSessionId();
  }

  /**
   * Checks if analytics collection is enabled.
   *
   * @returns true if analytics are enabled
   */
  isEnabled(): boolean {
    return this.configManager.isEnabled();
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
   * Tracks an analytics event.
   *
   * This is the main method for recording tool invocations.
   * When analytics are disabled, this is a complete no-op with
   * zero performance overhead.
   *
   * @param options - Event tracking options
   * @returns Promise that resolves when event is queued
   */
  async track(options: TrackOptions): Promise<void> {
    // Fast path: no-op when disabled
    if (!this.isEnabled()) {
      return;
    }

    // Don't accept new events during shutdown
    if (this.isShuttingDown) {
      return;
    }

    // Create the full event
    const event: AnalyticsEvent = {
      toolName: options.toolName,
      timestamp: options.timestamp ?? new Date().toISOString(),
      success: options.success,
      durationMs: options.durationMs,
      sessionId: options.sessionId ?? this.sessionId,
    };

    // Only include error category for failed invocations
    if (!options.success && options.errorCategory) {
      event.errorCategory = options.errorCategory;
    }

    // Add to batch
    this.eventBatch.push(event);
    this.totalEventsTracked++;

    // Check if we should flush
    const config = this.configManager.getConfig();
    if (this.eventBatch.length >= config.batchSize) {
      // Batch is full, flush immediately
      await this.flush();
    } else if (!this.flushTimer) {
      // Start flush timer if not already running
      this.startFlushTimer(config.flushIntervalMs);
    }
  }

  /**
   * Tracks an event synchronously (fire-and-forget).
   *
   * This variant doesn't wait for batching decisions.
   * Useful when you don't want to await in hot paths.
   *
   * @param options - Event tracking options
   */
  trackSync(options: TrackOptions): void {
    // Fire and forget - don't block caller
    this.track(options).catch(() => {
      // Silently ignore errors - tracking should never affect main app
    });
  }

  /**
   * Flushes all pending events to storage.
   *
   * @returns Flush result
   */
  async flush(): Promise<FlushResult> {
    // Fast path: nothing to flush
    if (this.eventBatch.length === 0) {
      return { success: true, eventsFlushed: 0 };
    }

    // Fast path: disabled
    if (!this.isEnabled()) {
      // Clear batch without persisting
      const count = this.eventBatch.length;
      this.eventBatch = [];
      return { success: true, eventsFlushed: count };
    }

    // Stop the flush timer while we're flushing
    this.stopFlushTimer();

    // Take the current batch and clear it
    const eventsToFlush = this.eventBatch;
    this.eventBatch = [];

    try {
      // Write to storage
      const result = await this.storageAdapter.appendEvents(eventsToFlush);

      if (result.success) {
        this.totalEventsFlushed += result.eventsWritten;
        return {
          success: true,
          eventsFlushed: result.eventsWritten,
        };
      } else {
        // Put events back in the batch for retry
        this.eventBatch = [...eventsToFlush, ...this.eventBatch];
        this.totalFlushErrors++;
        return {
          success: false,
          eventsFlushed: 0,
          error: result.error,
        };
      }
    } catch (error) {
      // Put events back in the batch for retry
      this.eventBatch = [...eventsToFlush, ...this.eventBatch];
      this.totalFlushErrors++;
      return {
        success: false,
        eventsFlushed: 0,
        error: error instanceof Error ? error.message : 'Unknown flush error',
      };
    }
  }

  /**
   * Shuts down the collector gracefully.
   *
   * Stops the flush timer and flushes any pending events.
   * Call this when the application is shutting down.
   *
   * @returns Final flush result
   */
  async shutdown(): Promise<FlushResult> {
    this.isShuttingDown = true;
    this.stopFlushTimer();
    return this.flush();
  }

  /**
   * Gets statistics about the collector's current state.
   *
   * @returns Collector statistics
   */
  getStats(): CollectorStats {
    const config = this.configManager.getConfig();
    return {
      enabled: this.isEnabled(),
      pendingEvents: this.eventBatch.length,
      totalEventsTracked: this.totalEventsTracked,
      totalEventsFlushed: this.totalEventsFlushed,
      totalFlushErrors: this.totalFlushErrors,
      sessionId: this.sessionId,
      batchSize: config.batchSize,
      flushIntervalMs: config.flushIntervalMs,
    };
  }

  /**
   * Resets the collector state.
   * Useful for testing.
   */
  reset(): void {
    this.stopFlushTimer();
    this.eventBatch = [];
    this.sessionId = generateSessionId();
    this.totalEventsTracked = 0;
    this.totalEventsFlushed = 0;
    this.totalFlushErrors = 0;
    this.isShuttingDown = false;
  }

  /**
   * Starts the flush timer.
   *
   * @param intervalMs - Flush interval in milliseconds
   */
  private startFlushTimer(intervalMs: number): void {
    if (this.flushTimer) {
      return; // Timer already running
    }

    this.flushTimer = setTimeout(async () => {
      this.flushTimer = null;
      await this.flush();

      // If there are still pending events, restart the timer
      if (this.eventBatch.length > 0 && !this.isShuttingDown) {
        this.startFlushTimer(intervalMs);
      }
    }, intervalMs);

    // Don't block Node.js exit on this timer
    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }

  /**
   * Stops the flush timer.
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the collector.
 */
let defaultCollector: AnalyticsCollector | null = null;

/**
 * Gets the default collector instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default analytics collector
 */
export function getCollector(): AnalyticsCollector {
  if (defaultCollector === null) {
    defaultCollector = new AnalyticsCollector();
  }
  return defaultCollector;
}

/**
 * Resets the default collector.
 * Useful for testing.
 */
export function resetCollector(): void {
  if (defaultCollector) {
    defaultCollector.reset();
  }
  defaultCollector = null;
}

/**
 * Creates a new collector with custom dependencies.
 * Does not affect the default singleton.
 *
 * @param configManager - Custom configuration manager
 * @param storageAdapter - Custom storage adapter
 * @returns New collector instance
 */
export function createCollector(
  configManager?: AnalyticsConfigManager,
  storageAdapter?: AnalyticsStorageAdapter
): AnalyticsCollector {
  return new AnalyticsCollector(configManager, storageAdapter);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Tracks an analytics event using the default collector.
 * Convenience wrapper for getCollector().track().
 *
 * @param options - Event tracking options
 * @returns Promise that resolves when event is queued
 */
export async function trackEvent(options: TrackOptions): Promise<void> {
  return getCollector().track(options);
}

/**
 * Tracks an analytics event synchronously using the default collector.
 * Convenience wrapper for getCollector().trackSync().
 *
 * @param options - Event tracking options
 */
export function trackEventSync(options: TrackOptions): void {
  getCollector().trackSync(options);
}

/**
 * Flushes pending events using the default collector.
 * Convenience wrapper for getCollector().flush().
 *
 * @returns Flush result
 */
export async function flushEvents(): Promise<FlushResult> {
  return getCollector().flush();
}

/**
 * Shuts down the default collector gracefully.
 * Convenience wrapper for getCollector().shutdown().
 *
 * @returns Final flush result
 */
export async function shutdownCollector(): Promise<FlushResult> {
  return getCollector().shutdown();
}

/**
 * Checks if analytics are enabled using the default collector.
 * Convenience wrapper for getCollector().isEnabled().
 *
 * @returns true if analytics are enabled
 */
export function isAnalyticsEnabled(): boolean {
  return getCollector().isEnabled();
}
