/**
 * Analytics Module - Public API
 *
 * This module provides opt-in, privacy-first usage analytics for think-mcp.
 * All data is stored locally and never transmitted externally.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { getTracker, trackToolInvocation, createAnalyticsMiddleware } from './analytics/index.js';
 *
 * // Track a tool invocation manually
 * await trackToolInvocation('trace', true, 150);
 *
 * // Or use middleware for automatic tracking
 * const middleware = createAnalyticsMiddleware();
 * ```
 *
 * ## Key Features
 *
 * - **Consent Management**: Opt-in by default with clear privacy notices
 * - **Local Storage**: All data stored in ~/.think-mcp/analytics/
 * - **Automatic Retention**: Data older than retention period is auto-cleaned
 * - **Insights Generation**: Automatic pattern detection and recommendations
 * - **CLI Interface**: Full control via command-line tools
 * - **Export Capabilities**: JSON export for external analysis
 *
 * ## Privacy
 *
 * This module collects only metadata (tool names, timestamps, success/error status).
 * It does NOT collect:
 * - User input or arguments
 * - Error messages or stack traces
 * - Personal information
 *
 * See PRIVACY_NOTICE.ts for full details.
 *
 * @module analytics
 */

// =============================================================================
// Core Types
// =============================================================================

export type {
  // Event types
  AnalyticsEvent,
  ErrorCategory,

  // Metrics and statistics
  ToolMetrics,
  UsageStats,
  UsageTrend,
  TrendDirection,

  // Insights
  AnalyticsInsight,
  InsightType,
  InsightSeverity,

  // Configuration
  ExportOptions,
  ExportFormat,
} from './types.js';

// =============================================================================
// Configuration
// =============================================================================

export type { AnalyticsConfig } from './config.js';

export {
  // Config manager singleton
  getConfigManager,
  resetConfigManager,

  // Config class (for advanced usage)
  AnalyticsConfigManager,

  // Default configuration
  DEFAULT_ANALYTICS_CONFIG,
} from './config.js';

// =============================================================================
// Consent Management
// =============================================================================

export type { ConsentStatus, ConsentResult, ConsentData } from './consent.js';

export {
  // Consent operations
  getConsentStatus,
  grantConsent,
  withdrawConsent,
  needsConsent,

  // Consent manager (for advanced usage)
  ConsentManager,
  getConsentManager,
  resetConsentManager,
  createConsentManager,

  // File operations
  deleteConsentFile,

  // Constants
  CURRENT_POLICY_VERSION,
} from './consent.js';

// =============================================================================
// Event Collection
// =============================================================================

export type { CollectorStats } from './collector.js';

export {
  // Collector singleton
  getCollector,
  resetCollector,

  // Collector class (for advanced usage)
  AnalyticsCollector,
} from './collector.js';

// =============================================================================
// Tool Tracking
// =============================================================================

export {
  // Primary tracking function
  trackToolInvocation,

  // Tracker singleton
  getTracker,
  resetTracker,

  // Tracker class (for advanced usage)
  ToolInvocationTracker,
} from './tracker.js';

// =============================================================================
// MCP Middleware Integration
// =============================================================================

export { createAnalyticsMiddleware } from './middleware.js';

// =============================================================================
// Error Tracking
// =============================================================================

export type { ErrorStats, ProblematicTool, ErrorTrend } from './errors.js';

export {
  // Error tracker singleton
  getErrorTracker,
  resetErrorTracker,

  // Error tracker class (for advanced usage)
  ErrorTracker,
} from './errors.js';

// =============================================================================
// Analytics Aggregation
// =============================================================================

export type { AggregationSummary, ToolPeriodCounts } from './aggregator.js';

export {
  // Aggregator singleton
  getAggregator,
  resetAggregator,

  // Aggregator class (for advanced usage)
  AnalyticsAggregator,
} from './aggregator.js';

// =============================================================================
// Insights Generation
// =============================================================================

export type { InsightsSummary } from './insights.js';

export {
  // Insights generator singleton
  getInsightsGenerator,
  resetInsightsGenerator,

  // Insights generator class (for advanced usage)
  InsightsGenerator,
} from './insights.js';

// =============================================================================
// Storage
// =============================================================================

export type { StorageInfo, CleanupResult } from './storage.js';

export {
  // Storage adapter singleton
  getStorageAdapter,
  resetStorageAdapter,

  // Storage adapter class (for advanced usage)
  AnalyticsStorageAdapter,
} from './storage.js';

// =============================================================================
// Data Export
// =============================================================================

export type { DashboardExportData, ExportResult } from './export.js';

export {
  // Convenience functions
  exportDashboardData,
  exportToFile,

  // Exporter singleton
  getExporter,
  resetExporter,

  // Exporter class (for advanced usage)
  AnalyticsExporter,
} from './export.js';

// =============================================================================
// Data Retention
// =============================================================================

export type {
  ExtendedCleanupResult,
  RetentionStats,
  CleanupLogEntry,
  CleanupLogger,
  RetentionEnforcerOptions,
} from './retention.js';

export {
  // Convenience functions
  initializeRetention,
  runRetentionCleanup,
  startScheduledRetentionCleanup,
  stopScheduledRetentionCleanup,
  getRetentionStats,
  getRetentionDays,
  getCleanupLogs,

  // Retention enforcer singleton
  getRetentionEnforcer,
  resetRetentionEnforcer,
  createRetentionEnforcer,

  // Retention enforcer class (for advanced usage)
  RetentionPolicyEnforcer,
} from './retention.js';

// =============================================================================
// Data Deletion
// =============================================================================

export type { DeletionResult, DeletionStats, DeletionScope } from './deletion.js';

export {
  // Convenience function
  deleteAllAnalyticsData,

  // Deletion manager singleton
  getDeletionManager,
  resetDeletionManager,

  // Deletion manager class (for advanced usage)
  DataDeletionManager,
} from './deletion.js';

// =============================================================================
// CLI Interface
// =============================================================================

export type { CliResult, ParsedArgs } from './cli.js';

export {
  // Main CLI entry point
  runCli,

  // Individual CLI commands
  enableAnalytics,
  disableAnalytics,
  showStatus,
  exportData,
  clearData,
  showPrivacyNotice,
} from './cli.js';

// =============================================================================
// Dashboard
// =============================================================================

export type { DashboardOptions } from './dashboard-cli.js';

export {
  // Dashboard display
  showDashboard,
  runDashboardCommand,
} from './dashboard-cli.js';

// =============================================================================
// Privacy Notices
// =============================================================================

export {
  // Privacy notice bundle
  PrivacyNotice,

  // Individual notices
  PRIVACY_NOTICE_VERSION,
  PRIVACY_SUMMARY,
  PRIVACY_NOTICE_BRIEF,
  PRIVACY_NOTICE_FULL,
  CONSENT_PROMPT,
  RECONSENT_PROMPT,
  ANALYTICS_ENABLED_MESSAGE,
  ANALYTICS_DISABLED_MESSAGE,
  ANALYTICS_DISABLED_WITH_DATA_DELETED_MESSAGE,
  DATA_COLLECTION_TABLE,
  CLI_QUICK_REFERENCE,
} from './PRIVACY_NOTICE.js';

// =============================================================================
// Convenience Re-exports for Common Use Cases
// =============================================================================

/**
 * Initialize the analytics system.
 *
 * This should be called at application startup. It will:
 * 1. Check consent status
 * 2. Initialize retention policy (runs cleanup if needed)
 * 3. Return whether analytics are enabled
 *
 * @returns Promise resolving to whether analytics are enabled
 *
 * @example
 * ```typescript
 * import { initializeAnalytics } from './analytics/index.js';
 *
 * const enabled = await initializeAnalytics();
 * console.log(`Analytics ${enabled ? 'enabled' : 'disabled'}`);
 * ```
 */
export async function initializeAnalytics(): Promise<boolean> {
  const { getConsentStatus } = await import('./consent.js');
  const { initializeRetention } = await import('./retention.js');

  const status = await getConsentStatus();

  if (status.hasConsented) {
    // Run retention cleanup on startup
    await initializeRetention();
  }

  return status.hasConsented;
}

/**
 * Shutdown the analytics system gracefully.
 *
 * This should be called when the application is shutting down.
 * It will flush any pending data and stop scheduled tasks.
 *
 * @example
 * ```typescript
 * import { shutdownAnalytics } from './analytics/index.js';
 *
 * process.on('SIGTERM', async () => {
 *   await shutdownAnalytics();
 *   process.exit(0);
 * });
 * ```
 */
export async function shutdownAnalytics(): Promise<void> {
  const { getRetentionEnforcer } = await import('./retention.js');
  const { getCollector } = await import('./collector.js');

  // Stop scheduled cleanup
  getRetentionEnforcer().stopScheduledCleanup();

  // Flush any pending events
  await getCollector().flush();
}

/**
 * Get a quick summary of analytics status.
 *
 * Useful for displaying in status bars or health checks.
 *
 * @returns Summary object with key analytics information
 *
 * @example
 * ```typescript
 * import { getAnalyticsSummary } from './analytics/index.js';
 *
 * const summary = await getAnalyticsSummary();
 * console.log(`Analytics: ${summary.enabled ? 'ON' : 'OFF'}, Events: ${summary.totalEvents}`);
 * ```
 */
export async function getAnalyticsSummary(): Promise<{
  enabled: boolean;
  totalEvents: number;
  oldestEventDate: string | null;
  newestEventDate: string | null;
  retentionDays: number;
  storageLocation: string;
}> {
  const { getConsentStatus } = await import('./consent.js');
  const { getStorageAdapter } = await import('./storage.js');
  const { getConfigManager } = await import('./config.js');

  const status = await getConsentStatus();
  const storage = getStorageAdapter();
  const config = getConfigManager().getConfig();

  const storageInfo = await storage.getStorageInfo();

  return {
    enabled: status.hasConsented,
    totalEvents: storageInfo.totalEvents,
    oldestEventDate: storageInfo.oldestEventDate,
    newestEventDate: storageInfo.newestEventDate,
    retentionDays: config.retentionDays,
    storageLocation: config.storagePath,
  };
}

/**
 * Reset all analytics singletons.
 *
 * Primarily useful for testing. Resets all singleton instances
 * to their initial state.
 *
 * @example
 * ```typescript
 * import { resetAllAnalytics } from './analytics/index.js';
 *
 * beforeEach(() => {
 *   resetAllAnalytics();
 * });
 * ```
 */
export function resetAllAnalytics(): void {
  // Import synchronously to avoid async complexity in reset
  // These are all synchronous reset functions
  resetConfigManager();
  resetStorageAdapter();
  resetCollector();
  resetTracker();
  resetErrorTracker();
  resetAggregator();
  resetInsightsGenerator();
  resetRetentionEnforcer();
  resetDeletionManager();
  resetConsentManager();
}
