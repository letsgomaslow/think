/**
 * Retention Policy Enforcer
 *
 * Automatically removes analytics data older than the configured retention period.
 * Features:
 * - Configurable retention period (default 90 days from config)
 * - Runs cleanup on startup via initialize()
 * - Removes files older than retention period
 * - Logs cleanup actions via callbacks
 * - Provides manual trigger option via runCleanup()
 * - Scheduled periodic cleanup support
 *
 * Usage:
 * ```typescript
 * import { getRetentionEnforcer } from './retention.js';
 *
 * const enforcer = getRetentionEnforcer();
 * await enforcer.initialize(); // Run on startup
 *
 * // Manual trigger
 * const result = await enforcer.runCleanup();
 * ```
 */

import { getConfigManager, AnalyticsConfigManager } from './config.js';
import {
  getStorageAdapter,
  AnalyticsStorageAdapter,
  CleanupResult,
} from './storage.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Cleanup action log entry.
 */
export interface CleanupLogEntry {
  /**
   * ISO 8601 timestamp when the cleanup occurred.
   */
  timestamp: string;

  /**
   * Type of cleanup action.
   */
  action: 'cleanup_started' | 'cleanup_completed' | 'cleanup_failed' | 'file_deleted' | 'dry_run';

  /**
   * Result details.
   */
  details: {
    /**
     * Number of files deleted.
     */
    filesDeleted?: number;

    /**
     * Number of events deleted.
     */
    eventsDeleted?: number;

    /**
     * Retention period in days.
     */
    retentionDays?: number;

    /**
     * Error message if cleanup failed.
     */
    error?: string;

    /**
     * Whether this was a dry run.
     */
    dryRun?: boolean;

    /**
     * Cutoff date used for cleanup.
     */
    cutoffDate?: string;
  };
}

/**
 * Logger callback function type.
 * Called with log entries during cleanup operations.
 */
export type CleanupLogger = (entry: CleanupLogEntry) => void;

/**
 * Options for the retention policy enforcer.
 */
export interface RetentionEnforcerOptions {
  /**
   * Custom logger callback.
   * If not provided, logs are stored internally and available via getCleanupLogs().
   */
  logger?: CleanupLogger;

  /**
   * Whether to automatically run cleanup when initialized.
   * @default true
   */
  autoCleanupOnInit?: boolean;

  /**
   * Custom configuration manager.
   */
  configManager?: AnalyticsConfigManager;

  /**
   * Custom storage adapter.
   */
  storageAdapter?: AnalyticsStorageAdapter;
}

/**
 * Extended cleanup result with additional metadata.
 */
export interface ExtendedCleanupResult extends CleanupResult {
  /**
   * Retention period used for cleanup.
   */
  retentionDays: number;

  /**
   * Cutoff date used for determining old files.
   */
  cutoffDate: string;

  /**
   * Duration of cleanup operation in milliseconds.
   */
  durationMs: number;

  /**
   * Whether this was a dry run.
   */
  dryRun: boolean;
}

/**
 * Statistics about retention enforcement.
 */
export interface RetentionStats {
  /**
   * Whether the enforcer has been initialized.
   */
  initialized: boolean;

  /**
   * Number of cleanups performed.
   */
  totalCleanups: number;

  /**
   * Total files deleted across all cleanups.
   */
  totalFilesDeleted: number;

  /**
   * Total events deleted across all cleanups.
   */
  totalEventsDeleted: number;

  /**
   * Last cleanup timestamp, or null if never run.
   */
  lastCleanupAt: string | null;

  /**
   * Last cleanup result, or null if never run.
   */
  lastCleanupResult: ExtendedCleanupResult | null;

  /**
   * Current retention period from config.
   */
  currentRetentionDays: number;

  /**
   * Whether scheduled cleanup is active.
   */
  scheduledCleanupActive: boolean;
}

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Formats a date as YYYY-MM-DD.
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the date that is N days ago from today.
 * @param days - Number of days ago
 * @returns Date object representing N days ago
 */
function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// =============================================================================
// Retention Policy Enforcer Class
// =============================================================================

/**
 * Default interval for scheduled cleanups (24 hours in milliseconds).
 */
const DEFAULT_SCHEDULED_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * Maximum number of log entries to keep in memory.
 */
const MAX_LOG_ENTRIES = 100;

/**
 * Retention Policy Enforcer
 *
 * Manages automatic cleanup of analytics data based on the configured
 * retention period. Provides both automatic (scheduled) and manual
 * cleanup capabilities with comprehensive logging.
 */
export class RetentionPolicyEnforcer {
  private configManager: AnalyticsConfigManager;
  private storageAdapter: AnalyticsStorageAdapter;
  private logger: CleanupLogger | null;
  private autoCleanupOnInit: boolean;
  private initialized: boolean = false;
  private scheduledTimer: ReturnType<typeof setInterval> | null = null;

  // Internal log storage
  private logEntries: CleanupLogEntry[] = [];

  // Statistics
  private totalCleanups: number = 0;
  private totalFilesDeleted: number = 0;
  private totalEventsDeleted: number = 0;
  private lastCleanupAt: string | null = null;
  private lastCleanupResult: ExtendedCleanupResult | null = null;

  /**
   * Creates a new retention policy enforcer.
   *
   * @param options - Enforcer options
   */
  constructor(options: RetentionEnforcerOptions = {}) {
    this.configManager = options.configManager ?? getConfigManager();
    this.storageAdapter = options.storageAdapter ?? getStorageAdapter();
    this.logger = options.logger ?? null;
    this.autoCleanupOnInit = options.autoCleanupOnInit ?? true;
  }

  /**
   * Initializes the retention policy enforcer.
   *
   * If autoCleanupOnInit is true (default), runs cleanup immediately.
   * This should be called when the application starts.
   *
   * @returns Cleanup result if auto-cleanup was run, null otherwise
   */
  async initialize(): Promise<ExtendedCleanupResult | null> {
    if (this.initialized) {
      return null;
    }

    this.initialized = true;

    // Run initial cleanup if enabled
    if (this.autoCleanupOnInit) {
      return this.runCleanup();
    }

    return null;
  }

  /**
   * Runs a cleanup operation to remove old analytics data.
   *
   * Removes all analytics files older than the configured retention period.
   * Logs all actions via the configured logger.
   *
   * @param dryRun - If true, only reports what would be deleted without actually deleting
   * @returns Extended cleanup result with metadata
   */
  async runCleanup(dryRun: boolean = false): Promise<ExtendedCleanupResult> {
    const startTime = Date.now();
    const config = this.configManager.getConfig();
    const retentionDays = config.retentionDays;
    const cutoffDate = formatDateString(getDaysAgo(retentionDays));

    // Log cleanup start
    this.log({
      timestamp: new Date().toISOString(),
      action: dryRun ? 'dry_run' : 'cleanup_started',
      details: {
        retentionDays,
        cutoffDate,
        dryRun,
      },
    });

    try {
      // Run the actual cleanup via storage adapter
      const result = await this.storageAdapter.runCleanup(dryRun);
      const durationMs = Date.now() - startTime;

      // Build extended result
      const extendedResult: ExtendedCleanupResult = {
        ...result,
        retentionDays,
        cutoffDate,
        durationMs,
        dryRun,
      };

      // Update statistics
      if (!dryRun && result.success) {
        this.totalCleanups++;
        this.totalFilesDeleted += result.filesDeleted;
        this.totalEventsDeleted += result.eventsDeleted;
        this.lastCleanupAt = new Date().toISOString();
        this.lastCleanupResult = extendedResult;
      }

      // Log completion
      this.log({
        timestamp: new Date().toISOString(),
        action: result.success ? 'cleanup_completed' : 'cleanup_failed',
        details: {
          filesDeleted: result.filesDeleted,
          eventsDeleted: result.eventsDeleted,
          retentionDays,
          cutoffDate,
          dryRun,
          error: result.error,
        },
      });

      return extendedResult;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during cleanup';

      // Log failure
      this.log({
        timestamp: new Date().toISOString(),
        action: 'cleanup_failed',
        details: {
          retentionDays,
          cutoffDate,
          dryRun,
          error: errorMessage,
        },
      });

      return {
        success: false,
        filesDeleted: 0,
        eventsDeleted: 0,
        error: errorMessage,
        retentionDays,
        cutoffDate,
        durationMs,
        dryRun,
      };
    }
  }

  /**
   * Starts scheduled periodic cleanup.
   *
   * Runs cleanup at the specified interval. Default is every 24 hours.
   *
   * @param intervalMs - Interval between cleanups in milliseconds (default: 24 hours)
   */
  startScheduledCleanup(intervalMs: number = DEFAULT_SCHEDULED_INTERVAL_MS): void {
    // Stop any existing scheduled cleanup
    this.stopScheduledCleanup();

    // Start new interval
    this.scheduledTimer = setInterval(async () => {
      await this.runCleanup();
    }, intervalMs);

    // Don't block Node.js exit on this timer
    if (this.scheduledTimer.unref) {
      this.scheduledTimer.unref();
    }
  }

  /**
   * Stops scheduled periodic cleanup.
   */
  stopScheduledCleanup(): void {
    if (this.scheduledTimer) {
      clearInterval(this.scheduledTimer);
      this.scheduledTimer = null;
    }
  }

  /**
   * Checks if scheduled cleanup is active.
   *
   * @returns true if scheduled cleanup is running
   */
  isScheduledCleanupActive(): boolean {
    return this.scheduledTimer !== null;
  }

  /**
   * Gets the current retention period from configuration.
   *
   * @returns Retention period in days
   */
  getRetentionDays(): number {
    return this.configManager.getConfig().retentionDays;
  }

  /**
   * Gets statistics about retention enforcement.
   *
   * @returns Retention statistics
   */
  getStats(): RetentionStats {
    return {
      initialized: this.initialized,
      totalCleanups: this.totalCleanups,
      totalFilesDeleted: this.totalFilesDeleted,
      totalEventsDeleted: this.totalEventsDeleted,
      lastCleanupAt: this.lastCleanupAt,
      lastCleanupResult: this.lastCleanupResult,
      currentRetentionDays: this.getRetentionDays(),
      scheduledCleanupActive: this.isScheduledCleanupActive(),
    };
  }

  /**
   * Gets cleanup log entries.
   *
   * Returns internally stored log entries. Note that if a custom logger
   * was provided, these logs may not be complete as entries were
   * forwarded to the custom logger.
   *
   * @returns Array of cleanup log entries
   */
  getCleanupLogs(): CleanupLogEntry[] {
    return [...this.logEntries];
  }

  /**
   * Clears stored cleanup logs.
   */
  clearCleanupLogs(): void {
    this.logEntries = [];
  }

  /**
   * Sets a custom logger.
   *
   * @param logger - Logger callback, or null to disable custom logging
   */
  setLogger(logger: CleanupLogger | null): void {
    this.logger = logger;
  }

  /**
   * Resets the enforcer state.
   * Useful for testing.
   */
  reset(): void {
    this.stopScheduledCleanup();
    this.initialized = false;
    this.logEntries = [];
    this.totalCleanups = 0;
    this.totalFilesDeleted = 0;
    this.totalEventsDeleted = 0;
    this.lastCleanupAt = null;
    this.lastCleanupResult = null;
  }

  /**
   * Shuts down the enforcer gracefully.
   *
   * Stops scheduled cleanup and runs a final cleanup.
   *
   * @returns Final cleanup result
   */
  async shutdown(): Promise<ExtendedCleanupResult> {
    this.stopScheduledCleanup();
    return this.runCleanup();
  }

  /**
   * Internal method to log a cleanup action.
   *
   * @param entry - Log entry to record
   */
  private log(entry: CleanupLogEntry): void {
    // Store internally
    this.logEntries.push(entry);

    // Trim if too many entries
    if (this.logEntries.length > MAX_LOG_ENTRIES) {
      this.logEntries = this.logEntries.slice(-MAX_LOG_ENTRIES);
    }

    // Forward to custom logger if configured
    if (this.logger) {
      try {
        this.logger(entry);
      } catch {
        // Ignore logger errors - they shouldn't affect cleanup
      }
    }
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the retention policy enforcer.
 */
let defaultEnforcer: RetentionPolicyEnforcer | null = null;

/**
 * Gets the default retention policy enforcer instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default retention policy enforcer
 */
export function getRetentionEnforcer(): RetentionPolicyEnforcer {
  if (defaultEnforcer === null) {
    defaultEnforcer = new RetentionPolicyEnforcer();
  }
  return defaultEnforcer;
}

/**
 * Resets the default retention policy enforcer.
 * Useful for testing.
 */
export function resetRetentionEnforcer(): void {
  if (defaultEnforcer) {
    defaultEnforcer.reset();
  }
  defaultEnforcer = null;
}

/**
 * Creates a new retention policy enforcer with custom options.
 * Does not affect the default singleton.
 *
 * @param options - Enforcer options
 * @returns New retention policy enforcer instance
 */
export function createRetentionEnforcer(
  options?: RetentionEnforcerOptions
): RetentionPolicyEnforcer {
  return new RetentionPolicyEnforcer(options);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Initializes the retention policy enforcer.
 * Convenience wrapper for getRetentionEnforcer().initialize().
 *
 * @returns Cleanup result if auto-cleanup was run
 */
export async function initializeRetention(): Promise<ExtendedCleanupResult | null> {
  return getRetentionEnforcer().initialize();
}

/**
 * Runs a retention cleanup using the default enforcer.
 * Convenience wrapper for getRetentionEnforcer().runCleanup().
 *
 * @param dryRun - If true, only reports what would be deleted
 * @returns Extended cleanup result
 */
export async function runRetentionCleanup(dryRun: boolean = false): Promise<ExtendedCleanupResult> {
  return getRetentionEnforcer().runCleanup(dryRun);
}

/**
 * Starts scheduled cleanup using the default enforcer.
 * Convenience wrapper for getRetentionEnforcer().startScheduledCleanup().
 *
 * @param intervalMs - Interval between cleanups in milliseconds
 */
export function startScheduledRetentionCleanup(intervalMs?: number): void {
  getRetentionEnforcer().startScheduledCleanup(intervalMs);
}

/**
 * Stops scheduled cleanup using the default enforcer.
 * Convenience wrapper for getRetentionEnforcer().stopScheduledCleanup().
 */
export function stopScheduledRetentionCleanup(): void {
  getRetentionEnforcer().stopScheduledCleanup();
}

/**
 * Gets retention statistics using the default enforcer.
 * Convenience wrapper for getRetentionEnforcer().getStats().
 *
 * @returns Retention statistics
 */
export function getRetentionStats(): RetentionStats {
  return getRetentionEnforcer().getStats();
}

/**
 * Gets the current retention period.
 * Convenience wrapper for getRetentionEnforcer().getRetentionDays().
 *
 * @returns Retention period in days
 */
export function getRetentionDays(): number {
  return getRetentionEnforcer().getRetentionDays();
}

/**
 * Gets cleanup logs using the default enforcer.
 * Convenience wrapper for getRetentionEnforcer().getCleanupLogs().
 *
 * @returns Array of cleanup log entries
 */
export function getCleanupLogs(): CleanupLogEntry[] {
  return getRetentionEnforcer().getCleanupLogs();
}
