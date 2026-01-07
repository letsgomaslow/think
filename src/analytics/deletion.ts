/**
 * Data Deletion Module
 *
 * Provides capability to completely delete all analytics data on user request.
 * Features:
 * - Deletes all analytics files
 * - Resets aggregated statistics and singleton state
 * - Provides confirmation prompt utilities
 * - Logs deletion for audit trail
 *
 * Privacy-first design: Users have full control over their data and can
 * request complete deletion at any time.
 *
 * Usage:
 * ```typescript
 * import { getDeletionManager, deleteAllAnalyticsData } from './deletion.js';
 *
 * // Quick deletion with default options
 * const result = await deleteAllAnalyticsData();
 *
 * // Or with more control
 * const manager = getDeletionManager();
 * await manager.deleteAllData({ resetSingletons: true });
 * ```
 */

import { getStorageAdapter, AnalyticsStorageAdapter, CleanupResult } from './storage.js';
import { getConfigManager, AnalyticsConfigManager } from './config.js';
import { resetCollector, getCollector } from './collector.js';
import { resetConsentManager, deleteConsentFile } from './consent.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Deletion action log entry for audit trail.
 */
export interface DeletionLogEntry {
  /**
   * ISO 8601 timestamp when the deletion occurred.
   */
  timestamp: string;

  /**
   * Type of deletion action.
   */
  action: 'deletion_requested' | 'deletion_started' | 'deletion_completed' | 'deletion_failed' | 'singletons_reset';

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
     * Whether singletons were reset.
     */
    singletonsReset?: boolean;

    /**
     * Whether consent record was deleted.
     */
    consentDeleted?: boolean;

    /**
     * Error message if deletion failed.
     */
    error?: string;

    /**
     * Duration of the operation in milliseconds.
     */
    durationMs?: number;

    /**
     * Reason provided for deletion.
     */
    reason?: string;
  };
}

/**
 * Logger callback function type for deletion operations.
 */
export type DeletionLogger = (entry: DeletionLogEntry) => void;

/**
 * Options for data deletion.
 */
export interface DeletionOptions {
  /**
   * Whether to reset all analytics singletons after deletion.
   * This clears in-memory state including pending batches.
   * @default true
   */
  resetSingletons?: boolean;

  /**
   * Whether to also delete the consent record.
   * If true, the user will need to opt-in again.
   * @default false
   */
  deleteConsent?: boolean;

  /**
   * Optional reason for the deletion (for audit logging).
   */
  reason?: string;

  /**
   * Custom logger callback for audit trail.
   */
  logger?: DeletionLogger;
}

/**
 * Extended deletion result with metadata.
 */
export interface DeletionResult extends CleanupResult {
  /**
   * Whether singletons were reset.
   */
  singletonsReset: boolean;

  /**
   * Whether consent record was deleted.
   */
  consentDeleted: boolean;

  /**
   * Duration of the deletion operation in milliseconds.
   */
  durationMs: number;

  /**
   * ISO 8601 timestamp when deletion completed.
   */
  completedAt: string;
}

/**
 * Confirmation prompt content for user-facing deletion requests.
 */
export interface ConfirmationPrompt {
  /**
   * Short title for the confirmation dialog.
   */
  title: string;

  /**
   * Detailed message explaining the consequences.
   */
  message: string;

  /**
   * Warning text for emphasis.
   */
  warning: string;

  /**
   * Text for the confirm button/action.
   */
  confirmText: string;

  /**
   * Text for the cancel button/action.
   */
  cancelText: string;
}

/**
 * Statistics about deletion operations.
 */
export interface DeletionStats {
  /**
   * Total number of deletion operations performed.
   */
  totalDeletions: number;

  /**
   * Total files deleted across all operations.
   */
  totalFilesDeleted: number;

  /**
   * Total events deleted across all operations.
   */
  totalEventsDeleted: number;

  /**
   * Last deletion timestamp, or null if never performed.
   */
  lastDeletionAt: string | null;

  /**
   * Last deletion result, or null if never performed.
   */
  lastDeletionResult: DeletionResult | null;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Maximum number of log entries to keep in memory.
 */
const MAX_LOG_ENTRIES = 50;

/**
 * Confirmation prompt content for data deletion.
 */
export const DELETION_CONFIRMATION_PROMPT: ConfirmationPrompt = {
  title: 'Delete All Analytics Data',
  message: `This will permanently delete all collected analytics data including:
  - All tool invocation records
  - Usage statistics and trends
  - Error tracking data
  - Session information

This action cannot be undone.`,
  warning: 'All historical analytics data will be permanently lost.',
  confirmText: 'Delete All Data',
  cancelText: 'Cancel',
};

/**
 * Brief confirmation message for CLI use.
 */
export const DELETION_CONFIRMATION_BRIEF =
  'Are you sure you want to delete all analytics data? This cannot be undone.';

/**
 * Success message after deletion.
 */
export const DELETION_SUCCESS_MESSAGE = `
All analytics data has been successfully deleted.

Your analytics collection preference has been preserved.
To re-enable data collection, run: think-mcp analytics enable
`;

/**
 * Success message with consent deletion.
 */
export const DELETION_SUCCESS_WITH_CONSENT_MESSAGE = `
All analytics data and consent record have been deleted.

You will need to opt-in again to enable analytics collection.
Run: think-mcp analytics enable
`;

// =============================================================================
// Deletion Manager Class
// =============================================================================

/**
 * Analytics Data Deletion Manager
 *
 * Manages complete deletion of analytics data with audit logging
 * and proper cleanup of all related state.
 */
export class DataDeletionManager {
  private configManager: AnalyticsConfigManager;
  private storageAdapter: AnalyticsStorageAdapter;
  private logger: DeletionLogger | null;

  // Internal log storage for audit trail
  private logEntries: DeletionLogEntry[] = [];

  // Statistics
  private totalDeletions: number = 0;
  private totalFilesDeleted: number = 0;
  private totalEventsDeleted: number = 0;
  private lastDeletionAt: string | null = null;
  private lastDeletionResult: DeletionResult | null = null;

  /**
   * Creates a new data deletion manager.
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
    this.logger = null;
  }

  /**
   * Deletes all analytics data.
   *
   * This is the main method for complete data deletion.
   * It performs the following steps:
   * 1. Logs the deletion request for audit
   * 2. Flushes any pending events (then discards them)
   * 3. Deletes all analytics files from storage
   * 4. Optionally resets all singletons
   * 5. Optionally deletes consent record
   * 6. Logs the completion status
   *
   * @param options - Deletion options
   * @returns Deletion result with full metadata
   */
  async deleteAllData(options: DeletionOptions = {}): Promise<DeletionResult> {
    const {
      resetSingletons = true,
      deleteConsent = false,
      reason,
      logger,
    } = options;

    // Set up logger if provided
    if (logger) {
      this.logger = logger;
    }

    const startTime = Date.now();

    // Log deletion request
    this.log({
      timestamp: new Date().toISOString(),
      action: 'deletion_requested',
      details: {
        singletonsReset: resetSingletons,
        consentDeleted: deleteConsent,
        reason,
      },
    });

    try {
      // Log deletion start
      this.log({
        timestamp: new Date().toISOString(),
        action: 'deletion_started',
        details: {},
      });

      // First, flush and discard any pending events in the collector
      // This ensures we don't lose track of what was pending
      const collector = getCollector();
      const pendingCount = collector.getStats().pendingEvents;

      // Now delete all stored data
      const storageResult = await this.storageAdapter.deleteAllData();

      if (!storageResult.success) {
        const durationMs = Date.now() - startTime;
        const result: DeletionResult = {
          ...storageResult,
          singletonsReset: false,
          consentDeleted: false,
          durationMs,
          completedAt: new Date().toISOString(),
        };

        this.log({
          timestamp: new Date().toISOString(),
          action: 'deletion_failed',
          details: {
            error: storageResult.error,
            durationMs,
          },
        });

        return result;
      }

      // Add pending events to the count (they were effectively deleted)
      const totalEventsDeleted = storageResult.eventsDeleted + pendingCount;

      // Reset singletons if requested
      let singletonsReset = false;
      if (resetSingletons) {
        await this.resetAllSingletons();
        singletonsReset = true;

        this.log({
          timestamp: new Date().toISOString(),
          action: 'singletons_reset',
          details: { singletonsReset: true },
        });
      }

      // Delete consent if requested
      let consentDeleted = false;
      if (deleteConsent) {
        consentDeleted = deleteConsentFile();
        resetConsentManager();
      }

      const durationMs = Date.now() - startTime;
      const completedAt = new Date().toISOString();

      // Build result
      const result: DeletionResult = {
        success: true,
        filesDeleted: storageResult.filesDeleted,
        eventsDeleted: totalEventsDeleted,
        singletonsReset,
        consentDeleted,
        durationMs,
        completedAt,
      };

      // Update statistics
      this.totalDeletions++;
      this.totalFilesDeleted += storageResult.filesDeleted;
      this.totalEventsDeleted += totalEventsDeleted;
      this.lastDeletionAt = completedAt;
      this.lastDeletionResult = result;

      // Log completion
      this.log({
        timestamp: completedAt,
        action: 'deletion_completed',
        details: {
          filesDeleted: storageResult.filesDeleted,
          eventsDeleted: totalEventsDeleted,
          singletonsReset,
          consentDeleted,
          durationMs,
          reason,
        },
      });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown deletion error';

      this.log({
        timestamp: new Date().toISOString(),
        action: 'deletion_failed',
        details: {
          error: errorMessage,
          durationMs,
        },
      });

      return {
        success: false,
        filesDeleted: 0,
        eventsDeleted: 0,
        error: errorMessage,
        singletonsReset: false,
        consentDeleted: false,
        durationMs,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Gets the confirmation prompt for deletion.
   *
   * Use this to display a confirmation dialog before deletion.
   *
   * @param includeConsent - Whether consent deletion will be included
   * @returns Confirmation prompt content
   */
  getConfirmationPrompt(includeConsent: boolean = false): ConfirmationPrompt {
    if (includeConsent) {
      return {
        ...DELETION_CONFIRMATION_PROMPT,
        message: `${DELETION_CONFIRMATION_PROMPT.message}

Additionally, your consent record will be deleted and you will need to opt-in again.`,
        warning: 'All data and consent will be permanently deleted.',
      };
    }
    return { ...DELETION_CONFIRMATION_PROMPT };
  }

  /**
   * Gets the brief confirmation message.
   *
   * @returns Brief confirmation text for CLI use
   */
  getBriefConfirmation(): string {
    return DELETION_CONFIRMATION_BRIEF;
  }

  /**
   * Gets the success message after deletion.
   *
   * @param consentDeleted - Whether consent was also deleted
   * @returns Success message
   */
  getSuccessMessage(consentDeleted: boolean = false): string {
    return consentDeleted
      ? DELETION_SUCCESS_WITH_CONSENT_MESSAGE
      : DELETION_SUCCESS_MESSAGE;
  }

  /**
   * Gets statistics about deletion operations.
   *
   * @returns Deletion statistics
   */
  getStats(): DeletionStats {
    return {
      totalDeletions: this.totalDeletions,
      totalFilesDeleted: this.totalFilesDeleted,
      totalEventsDeleted: this.totalEventsDeleted,
      lastDeletionAt: this.lastDeletionAt,
      lastDeletionResult: this.lastDeletionResult,
    };
  }

  /**
   * Gets deletion log entries for audit.
   *
   * @returns Array of deletion log entries
   */
  getDeletionLogs(): DeletionLogEntry[] {
    return [...this.logEntries];
  }

  /**
   * Clears stored deletion logs.
   */
  clearDeletionLogs(): void {
    this.logEntries = [];
  }

  /**
   * Sets a custom logger.
   *
   * @param logger - Logger callback, or null to disable custom logging
   */
  setLogger(logger: DeletionLogger | null): void {
    this.logger = logger;
  }

  /**
   * Resets the deletion manager state.
   * Useful for testing.
   */
  reset(): void {
    this.logEntries = [];
    this.totalDeletions = 0;
    this.totalFilesDeleted = 0;
    this.totalEventsDeleted = 0;
    this.lastDeletionAt = null;
    this.lastDeletionResult = null;
    this.logger = null;
  }

  /**
   * Resets all analytics singletons.
   *
   * This clears all in-memory state including:
   * - Collector (pending events, session)
   * - Aggregator (cached statistics)
   * - Error tracker (cached error data)
   * - Insights generator (cached insights)
   * - Exporter (cached export data)
   */
  private async resetAllSingletons(): Promise<void> {
    // Reset collector (clears pending events and generates new session ID)
    resetCollector();

    // Reset other singletons - they will re-initialize on next use
    // We use dynamic imports to avoid circular dependencies
    try {
      const aggregatorModule = await import('./aggregator.js');
      if (aggregatorModule.resetAggregator) {
        aggregatorModule.resetAggregator();
      }
    } catch {
      // Module not available, nothing to reset
    }

    try {
      const errorModule = await import('./errors.js');
      if (errorModule.resetErrorTracker) {
        errorModule.resetErrorTracker();
      }
    } catch {
      // Module not available, nothing to reset
    }

    try {
      const insightsModule = await import('./insights.js');
      if (insightsModule.resetInsightsGenerator) {
        insightsModule.resetInsightsGenerator();
      }
    } catch {
      // Module not available, nothing to reset
    }

    try {
      const exportModule = await import('./export.js');
      if (exportModule.resetExporter) {
        exportModule.resetExporter();
      }
    } catch {
      // Module not available, nothing to reset
    }

    try {
      const trackerModule = await import('./tracker.js');
      if (trackerModule.resetTracker) {
        trackerModule.resetTracker();
      }
    } catch {
      // Module not available, nothing to reset
    }
  }

  /**
   * Internal method to log a deletion action.
   *
   * @param entry - Log entry to record
   */
  private log(entry: DeletionLogEntry): void {
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
        // Ignore logger errors - they shouldn't affect deletion
      }
    }
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the deletion manager.
 */
let defaultManager: DataDeletionManager | null = null;

/**
 * Gets the default deletion manager instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default deletion manager
 */
export function getDeletionManager(): DataDeletionManager {
  if (defaultManager === null) {
    defaultManager = new DataDeletionManager();
  }
  return defaultManager;
}

/**
 * Resets the default deletion manager.
 * Useful for testing.
 */
export function resetDeletionManager(): void {
  if (defaultManager) {
    defaultManager.reset();
  }
  defaultManager = null;
}

/**
 * Creates a new deletion manager with custom dependencies.
 * Does not affect the default singleton.
 *
 * @param configManager - Custom configuration manager
 * @param storageAdapter - Custom storage adapter
 * @returns New deletion manager instance
 */
export function createDeletionManager(
  configManager?: AnalyticsConfigManager,
  storageAdapter?: AnalyticsStorageAdapter
): DataDeletionManager {
  return new DataDeletionManager(configManager, storageAdapter);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Deletes all analytics data using the default manager.
 * Convenience wrapper for getDeletionManager().deleteAllData().
 *
 * @param options - Deletion options
 * @returns Deletion result
 */
export async function deleteAllAnalyticsData(
  options?: DeletionOptions
): Promise<DeletionResult> {
  return getDeletionManager().deleteAllData(options);
}

/**
 * Gets the confirmation prompt for deletion.
 * Convenience wrapper for getDeletionManager().getConfirmationPrompt().
 *
 * @param includeConsent - Whether consent deletion will be included
 * @returns Confirmation prompt content
 */
export function getConfirmationPrompt(includeConsent?: boolean): ConfirmationPrompt {
  return getDeletionManager().getConfirmationPrompt(includeConsent);
}

/**
 * Gets the brief confirmation message.
 * Convenience wrapper for getDeletionManager().getBriefConfirmation().
 *
 * @returns Brief confirmation text
 */
export function getBriefConfirmation(): string {
  return getDeletionManager().getBriefConfirmation();
}

/**
 * Gets the success message after deletion.
 * Convenience wrapper for getDeletionManager().getSuccessMessage().
 *
 * @param consentDeleted - Whether consent was also deleted
 * @returns Success message
 */
export function getSuccessMessage(consentDeleted?: boolean): string {
  return getDeletionManager().getSuccessMessage(consentDeleted);
}

/**
 * Gets deletion statistics using the default manager.
 * Convenience wrapper for getDeletionManager().getStats().
 *
 * @returns Deletion statistics
 */
export function getDeletionStats(): DeletionStats {
  return getDeletionManager().getStats();
}

/**
 * Gets deletion logs using the default manager.
 * Convenience wrapper for getDeletionManager().getDeletionLogs().
 *
 * @returns Array of deletion log entries
 */
export function getDeletionLogs(): DeletionLogEntry[] {
  return getDeletionManager().getDeletionLogs();
}

/**
 * Formats a deletion result for display.
 *
 * @param result - Deletion result to format
 * @returns Formatted string for display
 */
export function formatDeletionResult(result: DeletionResult): string {
  const lines: string[] = [];

  if (result.success) {
    lines.push('Deletion completed successfully.');
    lines.push('');
    lines.push(`  Files deleted:     ${result.filesDeleted}`);
    lines.push(`  Events deleted:    ${result.eventsDeleted}`);
    lines.push(`  Singletons reset:  ${result.singletonsReset ? 'Yes' : 'No'}`);
    lines.push(`  Consent deleted:   ${result.consentDeleted ? 'Yes' : 'No'}`);
    lines.push(`  Duration:          ${result.durationMs}ms`);
  } else {
    lines.push('Deletion failed.');
    lines.push('');
    lines.push(`  Error: ${result.error}`);
  }

  return lines.join('\n');
}
