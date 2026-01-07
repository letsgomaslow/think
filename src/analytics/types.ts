/**
 * Analytics Types for think-mcp
 *
 * Privacy-first analytics interfaces that track tool usage patterns
 * without capturing any user content or personally identifiable information.
 *
 * Design principles:
 * - No content capture: Only metadata about tool invocations
 * - No PII: No user identifiers, IP addresses, or identifying data
 * - Opt-in only: Analytics disabled by default
 * - Minimal data: Only what's necessary for usage insights
 */

import { ToolName } from '../toolNames.js';

// =============================================================================
// Core Event Types
// =============================================================================

/**
 * Error categories for analytics tracking.
 * Only the category is tracked, never the error message content.
 */
export type ErrorCategory =
  | 'validation'    // Input validation errors
  | 'runtime'       // Runtime execution errors
  | 'timeout'       // Operation timeout errors
  | 'unknown';      // Uncategorized errors

/**
 * A single analytics event capturing tool invocation metadata.
 *
 * Privacy guarantees:
 * - No tool arguments or parameters are captured
 * - No error messages are captured (only category)
 * - No user content or PII
 * - Session ID is randomly generated, not tied to any user
 */
export interface AnalyticsEvent {
  /**
   * Name of the tool that was invoked
   * Uses the ToolName type from toolNames.ts for type safety
   */
  toolName: ToolName;

  /**
   * ISO 8601 timestamp when the invocation occurred
   * @example "2024-01-15T10:30:00.000Z"
   */
  timestamp: string;

  /**
   * Whether the tool invocation completed successfully
   */
  success: boolean;

  /**
   * Duration of the tool invocation in milliseconds
   * Useful for identifying performance issues
   */
  durationMs: number;

  /**
   * Error category if the invocation failed
   * Only present when success is false
   * Never contains the actual error message
   */
  errorCategory?: ErrorCategory;

  /**
   * Anonymous session identifier
   * Randomly generated per session, not tied to any user
   * Used only to group invocations within a single session
   */
  sessionId: string;
}

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Analytics configuration options.
 * All analytics are disabled by default (opt-in required).
 */
export interface AnalyticsConfig {
  /**
   * Whether analytics collection is enabled
   * Must be explicitly set to true by the user
   * @default false
   */
  enabled: boolean;

  /**
   * Number of days to retain analytics data
   * Data older than this is automatically deleted
   * @default 90
   */
  retentionDays: number;

  /**
   * Path to the analytics storage directory
   * @default "~/.think-mcp/analytics"
   */
  storagePath: string;

  /**
   * Maximum number of events to batch before writing to disk
   * Higher values reduce I/O but increase memory usage
   * @default 50
   */
  batchSize: number;

  /**
   * Maximum time in milliseconds to hold events before flushing
   * Ensures data is persisted even with low activity
   * @default 30000 (30 seconds)
   */
  flushIntervalMs: number;
}

/**
 * Default analytics configuration values.
 * Analytics are disabled by default to respect user privacy.
 */
export const DEFAULT_ANALYTICS_CONFIG: Readonly<AnalyticsConfig> = {
  enabled: false,
  retentionDays: 90,
  storagePath: '~/.think-mcp/analytics',
  batchSize: 50,
  flushIntervalMs: 30000,
};

// =============================================================================
// Consent Types
// =============================================================================

/**
 * User consent status and metadata.
 * Tracks when and how consent was given/withdrawn.
 */
export interface ConsentRecord {
  /**
   * Whether the user has given consent for analytics
   */
  hasConsented: boolean;

  /**
   * ISO 8601 timestamp when consent was given
   * Undefined if consent has never been given
   */
  consentedAt?: string;

  /**
   * ISO 8601 timestamp when consent was withdrawn
   * Undefined if consent has not been withdrawn
   */
  withdrawnAt?: string;

  /**
   * Version of the privacy policy the user consented to
   * Allows tracking consent against policy changes
   */
  policyVersion: string;
}

// =============================================================================
// Aggregated Statistics Types
// =============================================================================

/**
 * Usage statistics for a single tool.
 * Aggregated from raw events for efficient querying.
 */
export interface ToolMetrics {
  /**
   * Name of the tool these metrics are for
   */
  toolName: ToolName;

  /**
   * Total number of invocations
   */
  invocationCount: number;

  /**
   * Number of successful invocations
   */
  successCount: number;

  /**
   * Number of failed invocations
   */
  errorCount: number;

  /**
   * Error rate as a percentage (0-100)
   */
  errorRate: number;

  /**
   * Average duration in milliseconds
   */
  avgDurationMs: number;

  /**
   * Minimum duration in milliseconds
   */
  minDurationMs: number;

  /**
   * Maximum duration in milliseconds
   */
  maxDurationMs: number;

  /**
   * P95 duration in milliseconds (95th percentile)
   * Useful for identifying outlier performance issues
   */
  p95DurationMs: number;

  /**
   * Breakdown of error counts by category
   */
  errorsByCategory: Record<ErrorCategory, number>;

  /**
   * ISO 8601 timestamp of the first recorded invocation
   */
  firstInvocation: string;

  /**
   * ISO 8601 timestamp of the most recent invocation
   */
  lastInvocation: string;
}

/**
 * Time-series data point for trend analysis.
 */
export interface TimeSeriesDataPoint {
  /**
   * ISO 8601 date string (YYYY-MM-DD format)
   */
  date: string;

  /**
   * Number of invocations on this date
   */
  count: number;

  /**
   * Number of successful invocations
   */
  successCount: number;

  /**
   * Number of failed invocations
   */
  errorCount: number;
}

/**
 * Trend direction indicator.
 */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

/**
 * Usage trend for a tool over time.
 */
export interface UsageTrend {
  /**
   * Name of the tool
   */
  toolName: ToolName;

  /**
   * Time-series data points
   */
  dataPoints: TimeSeriesDataPoint[];

  /**
   * Overall trend direction
   */
  trend: TrendDirection;

  /**
   * Percentage change over the period
   * Positive for growth, negative for decline
   */
  changePercentage: number;
}

/**
 * Aggregated usage statistics across all tools.
 */
export interface UsageStats {
  /**
   * Total number of tool invocations across all tools
   */
  totalInvocations: number;

  /**
   * Total number of successful invocations
   */
  totalSuccesses: number;

  /**
   * Total number of failed invocations
   */
  totalErrors: number;

  /**
   * Overall error rate as a percentage (0-100)
   */
  overallErrorRate: number;

  /**
   * Per-tool metrics
   */
  toolMetrics: ToolMetrics[];

  /**
   * Tools ranked by invocation count (most popular first)
   */
  popularityRanking: ToolName[];

  /**
   * Tools with error rates above threshold (needs attention)
   */
  toolsNeedingAttention: ToolName[];

  /**
   * Usage trends per tool
   */
  trends: UsageTrend[];

  /**
   * Number of unique sessions
   */
  uniqueSessions: number;

  /**
   * Average invocations per session
   */
  avgInvocationsPerSession: number;

  /**
   * Start of the statistics period (ISO 8601)
   */
  periodStart: string;

  /**
   * End of the statistics period (ISO 8601)
   */
  periodEnd: string;

  /**
   * When these statistics were generated (ISO 8601)
   */
  generatedAt: string;
}

// =============================================================================
// Storage Types
// =============================================================================

/**
 * Format for storing daily analytics data.
 * One file per day for efficient rotation and cleanup.
 */
export interface DailyAnalyticsFile {
  /**
   * Schema version for forward compatibility
   */
  schemaVersion: string;

  /**
   * Date this file covers (YYYY-MM-DD format)
   */
  date: string;

  /**
   * Array of analytics events for this day
   */
  events: AnalyticsEvent[];

  /**
   * When this file was last modified (ISO 8601)
   */
  lastModified: string;
}

/**
 * Current schema version for analytics files.
 * Increment when making breaking changes to the file format.
 */
export const ANALYTICS_SCHEMA_VERSION = '1.0.0';

// =============================================================================
// Insights Types
// =============================================================================

/**
 * Severity level for insights and recommendations.
 */
export type InsightSeverity = 'info' | 'warning' | 'critical';

/**
 * Category of insight.
 */
export type InsightCategory =
  | 'popularity'      // Tool usage patterns
  | 'performance'     // Response time insights
  | 'reliability'     // Error rate insights
  | 'trend';          // Usage trend insights

/**
 * A single actionable insight derived from analytics data.
 */
export interface AnalyticsInsight {
  /**
   * Unique identifier for this insight
   */
  id: string;

  /**
   * Category of the insight
   */
  category: InsightCategory;

  /**
   * Severity level
   */
  severity: InsightSeverity;

  /**
   * Human-readable title
   * @example "High Error Rate Detected"
   */
  title: string;

  /**
   * Detailed description of the insight
   * @example "The 'trace' tool has a 15% error rate, which is above the 5% threshold."
   */
  description: string;

  /**
   * Actionable recommendation
   * @example "Review recent changes to the trace tool implementation."
   */
  recommendation?: string;

  /**
   * Tools related to this insight
   */
  affectedTools: ToolName[];

  /**
   * Relevant metrics supporting this insight
   */
  metrics: Record<string, number | string>;

  /**
   * When this insight was generated (ISO 8601)
   */
  generatedAt: string;
}

/**
 * Collection of insights from analytics analysis.
 */
export interface AnalyticsInsightsReport {
  /**
   * All generated insights
   */
  insights: AnalyticsInsight[];

  /**
   * Summary statistics
   */
  summary: {
    totalInsights: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };

  /**
   * Time period covered by these insights
   */
  periodStart: string;
  periodEnd: string;

  /**
   * When this report was generated (ISO 8601)
   */
  generatedAt: string;
}

// =============================================================================
// Export Types
// =============================================================================

/**
 * Format options for exporting analytics data.
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Options for data export.
 */
export interface ExportOptions {
  /**
   * Export format
   */
  format: ExportFormat;

  /**
   * Start date for export (ISO 8601 date string)
   */
  startDate?: string;

  /**
   * End date for export (ISO 8601 date string)
   */
  endDate?: string;

  /**
   * Whether to include raw events
   * @default false
   */
  includeRawEvents?: boolean;

  /**
   * Whether to include aggregated statistics
   * @default true
   */
  includeStats?: boolean;

  /**
   * Whether to include insights
   * @default true
   */
  includeInsights?: boolean;
}
