/**
 * Error Tracking Module
 *
 * Provides privacy-safe error tracking and aggregation for analytics.
 * Tracks error types and frequencies without capturing error messages
 * that might contain user data.
 *
 * Privacy guarantees:
 * - Only error categories are tracked (validation, runtime, timeout, unknown)
 * - Error messages are NEVER captured or stored
 * - Only metadata is recorded: tool name, error category, timestamp
 *
 * Features:
 * - Error counts by tool and category
 * - Error rate calculations
 * - Identification of problematic tools
 * - Trend analysis for error patterns
 *
 * Usage:
 * ```typescript
 * import { getErrorTracker } from './errors.js';
 *
 * const tracker = getErrorTracker();
 *
 * // Get error statistics
 * const stats = await tracker.getErrorStats();
 *
 * // Get problematic tools (high error rates)
 * const problematicTools = await tracker.getProblematicTools(0.1); // 10% threshold
 *
 * // Get error breakdown for a specific tool
 * const toolErrors = await tracker.getToolErrorBreakdown('trace');
 * ```
 */

import { ToolName, TOOL_NAMES } from '../toolNames.js';
import { ErrorCategory, AnalyticsEvent } from './types.js';
import { getStorageAdapter, AnalyticsStorageAdapter } from './storage.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Error count by category for a single tool.
 */
export interface ToolErrorBreakdown {
  /**
   * Name of the tool.
   */
  toolName: ToolName;

  /**
   * Total number of invocations for this tool.
   */
  totalInvocations: number;

  /**
   * Total number of errors for this tool.
   */
  totalErrors: number;

  /**
   * Error rate as a decimal (0-1).
   */
  errorRate: number;

  /**
   * Error counts by category.
   */
  errorsByCategory: Record<ErrorCategory, number>;

  /**
   * Most common error category for this tool.
   */
  mostCommonErrorCategory: ErrorCategory | null;
}

/**
 * Overall error statistics across all tools.
 */
export interface ErrorStats {
  /**
   * Total number of invocations across all tools.
   */
  totalInvocations: number;

  /**
   * Total number of errors across all tools.
   */
  totalErrors: number;

  /**
   * Overall error rate as a decimal (0-1).
   */
  overallErrorRate: number;

  /**
   * Error breakdown per tool.
   */
  byTool: ToolErrorBreakdown[];

  /**
   * Error counts aggregated by category across all tools.
   */
  byCategory: Record<ErrorCategory, number>;

  /**
   * Tools sorted by error rate (highest first).
   */
  toolsByErrorRate: ToolName[];

  /**
   * Tools sorted by error count (highest first).
   */
  toolsByErrorCount: ToolName[];

  /**
   * Start of the analysis period (ISO 8601).
   */
  periodStart: string;

  /**
   * End of the analysis period (ISO 8601).
   */
  periodEnd: string;

  /**
   * When these statistics were generated (ISO 8601).
   */
  generatedAt: string;
}

/**
 * A tool identified as problematic based on error rate.
 */
export interface ProblematicTool {
  /**
   * Name of the tool.
   */
  toolName: ToolName;

  /**
   * Error rate as a decimal (0-1).
   */
  errorRate: number;

  /**
   * Total number of errors.
   */
  errorCount: number;

  /**
   * Total number of invocations.
   */
  invocationCount: number;

  /**
   * Most common error category.
   */
  mostCommonErrorCategory: ErrorCategory | null;

  /**
   * Severity level based on error rate.
   * - critical: >= 25% error rate
   * - warning: >= 10% error rate
   * - info: >= 5% error rate
   */
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Error frequency data point for trend analysis.
 */
export interface ErrorFrequencyDataPoint {
  /**
   * Date in YYYY-MM-DD format.
   */
  date: string;

  /**
   * Total invocations on this date.
   */
  totalInvocations: number;

  /**
   * Total errors on this date.
   */
  totalErrors: number;

  /**
   * Error rate on this date (0-1).
   */
  errorRate: number;

  /**
   * Errors by category on this date.
   */
  byCategory: Record<ErrorCategory, number>;
}

/**
 * Error trend analysis result.
 */
export interface ErrorTrend {
  /**
   * Time series data points.
   */
  dataPoints: ErrorFrequencyDataPoint[];

  /**
   * Trend direction.
   */
  trend: 'increasing' | 'decreasing' | 'stable';

  /**
   * Percentage change over the period.
   */
  changePercentage: number;

  /**
   * Average error rate over the period.
   */
  averageErrorRate: number;
}

/**
 * Options for error tracker configuration.
 */
export interface ErrorTrackerOptions {
  /**
   * Custom storage adapter (defaults to singleton).
   */
  storageAdapter?: AnalyticsStorageAdapter;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * All error categories for iteration.
 */
const ALL_ERROR_CATEGORIES: ErrorCategory[] = [
  'validation',
  'runtime',
  'timeout',
  'unknown',
];

/**
 * Default error rate thresholds for severity levels.
 */
const ERROR_RATE_THRESHOLDS = {
  critical: 0.25, // 25% or higher
  warning: 0.10,  // 10% or higher
  info: 0.05,     // 5% or higher
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Creates an empty error category count record.
 */
function createEmptyErrorCounts(): Record<ErrorCategory, number> {
  return {
    validation: 0,
    runtime: 0,
    timeout: 0,
    unknown: 0,
  };
}

/**
 * Gets the most common error category from a count record.
 * Returns null if there are no errors.
 */
function getMostCommonCategory(
  counts: Record<ErrorCategory, number>
): ErrorCategory | null {
  let maxCount = 0;
  let maxCategory: ErrorCategory | null = null;

  for (const category of ALL_ERROR_CATEGORIES) {
    if (counts[category] > maxCount) {
      maxCount = counts[category];
      maxCategory = category;
    }
  }

  return maxCategory;
}

/**
 * Calculates error rate safely (handles division by zero).
 */
function calculateErrorRate(errors: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return errors / total;
}

/**
 * Determines severity level from error rate.
 */
function getSeverityFromErrorRate(
  errorRate: number
): 'critical' | 'warning' | 'info' {
  if (errorRate >= ERROR_RATE_THRESHOLDS.critical) {
    return 'critical';
  }
  if (errorRate >= ERROR_RATE_THRESHOLDS.warning) {
    return 'warning';
  }
  return 'info';
}

/**
 * Extracts date from ISO timestamp.
 */
function extractDateFromTimestamp(timestamp: string): string {
  return timestamp.slice(0, 10);
}

/**
 * Calculates trend from data points.
 */
function calculateTrend(
  dataPoints: ErrorFrequencyDataPoint[]
): { trend: 'increasing' | 'decreasing' | 'stable'; changePercentage: number } {
  if (dataPoints.length < 2) {
    return { trend: 'stable', changePercentage: 0 };
  }

  // Compare first half average to second half average
  const midpoint = Math.floor(dataPoints.length / 2);
  const firstHalf = dataPoints.slice(0, midpoint);
  const secondHalf = dataPoints.slice(midpoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, dp) => sum + dp.errorRate, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, dp) => sum + dp.errorRate, 0) / secondHalf.length;

  // Calculate percentage change
  let changePercentage = 0;
  if (firstHalfAvg > 0) {
    changePercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  } else if (secondHalfAvg > 0) {
    changePercentage = 100; // Went from 0 to something
  }

  // Determine trend (using 10% threshold for significance)
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (changePercentage > 10) {
    trend = 'increasing';
  } else if (changePercentage < -10) {
    trend = 'decreasing';
  }

  return { trend, changePercentage };
}

// =============================================================================
// Error Tracker Class
// =============================================================================

/**
 * Error Tracker
 *
 * Analyzes error patterns from analytics events.
 * Provides statistics, problematic tool identification, and trend analysis.
 *
 * Privacy-safe: Only works with error categories, never error messages.
 */
export class ErrorTracker {
  private storageAdapter: AnalyticsStorageAdapter;

  /**
   * Creates a new error tracker.
   *
   * @param options - Tracker options
   */
  constructor(options?: ErrorTrackerOptions) {
    this.storageAdapter = options?.storageAdapter ?? getStorageAdapter();
  }

  /**
   * Gets error statistics for a date range.
   *
   * @param startDate - Start date (YYYY-MM-DD), defaults to last 30 days
   * @param endDate - End date (YYYY-MM-DD), defaults to today
   * @returns Error statistics
   */
  async getErrorStats(
    startDate?: string,
    endDate?: string
  ): Promise<ErrorStats> {
    // Default to last 30 days
    const end = endDate ?? new Date().toISOString().slice(0, 10);
    const start =
      startDate ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Read events from storage
    const result = await this.storageAdapter.readEvents(start, end);
    const events = result.success ? result.events : [];

    // Aggregate by tool
    const toolData = new Map<
      ToolName,
      {
        total: number;
        errors: number;
        byCategory: Record<ErrorCategory, number>;
      }
    >();

    // Initialize all tools with zero counts
    for (const toolName of Object.values(TOOL_NAMES)) {
      toolData.set(toolName, {
        total: 0,
        errors: 0,
        byCategory: createEmptyErrorCounts(),
      });
    }

    // Process events
    let totalInvocations = 0;
    let totalErrors = 0;
    const overallByCategory = createEmptyErrorCounts();

    for (const event of events) {
      const tool = toolData.get(event.toolName);
      if (tool) {
        tool.total++;
        totalInvocations++;

        if (!event.success) {
          tool.errors++;
          totalErrors++;
          const category = event.errorCategory ?? 'unknown';
          tool.byCategory[category]++;
          overallByCategory[category]++;
        }
      }
    }

    // Build tool breakdown
    const byTool: ToolErrorBreakdown[] = [];
    for (const [toolName, data] of toolData) {
      if (data.total > 0) {
        byTool.push({
          toolName,
          totalInvocations: data.total,
          totalErrors: data.errors,
          errorRate: calculateErrorRate(data.errors, data.total),
          errorsByCategory: data.byCategory,
          mostCommonErrorCategory: getMostCommonCategory(data.byCategory),
        });
      }
    }

    // Sort for rankings
    const toolsByErrorRate = byTool
      .slice()
      .sort((a, b) => b.errorRate - a.errorRate)
      .map((t) => t.toolName);

    const toolsByErrorCount = byTool
      .slice()
      .sort((a, b) => b.totalErrors - a.totalErrors)
      .map((t) => t.toolName);

    return {
      totalInvocations,
      totalErrors,
      overallErrorRate: calculateErrorRate(totalErrors, totalInvocations),
      byTool,
      byCategory: overallByCategory,
      toolsByErrorRate,
      toolsByErrorCount,
      periodStart: start,
      periodEnd: end,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Gets error breakdown for a specific tool.
   *
   * @param toolName - Name of the tool
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Tool error breakdown, or null if no data
   */
  async getToolErrorBreakdown(
    toolName: ToolName,
    startDate?: string,
    endDate?: string
  ): Promise<ToolErrorBreakdown | null> {
    const stats = await this.getErrorStats(startDate, endDate);
    return stats.byTool.find((t) => t.toolName === toolName) ?? null;
  }

  /**
   * Gets tools with error rates above a threshold.
   *
   * @param threshold - Error rate threshold as decimal (0-1), defaults to 0.05 (5%)
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Problematic tools sorted by severity
   */
  async getProblematicTools(
    threshold: number = 0.05,
    startDate?: string,
    endDate?: string
  ): Promise<ProblematicTool[]> {
    const stats = await this.getErrorStats(startDate, endDate);

    const problematicTools: ProblematicTool[] = [];

    for (const tool of stats.byTool) {
      if (tool.errorRate >= threshold && tool.totalErrors > 0) {
        problematicTools.push({
          toolName: tool.toolName,
          errorRate: tool.errorRate,
          errorCount: tool.totalErrors,
          invocationCount: tool.totalInvocations,
          mostCommonErrorCategory: tool.mostCommonErrorCategory,
          severity: getSeverityFromErrorRate(tool.errorRate),
        });
      }
    }

    // Sort by severity (critical first), then by error rate
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    problematicTools.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) {
        return severityDiff;
      }
      return b.errorRate - a.errorRate;
    });

    return problematicTools;
  }

  /**
   * Gets error frequency trend over time.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param toolName - Optional tool name to filter by
   * @returns Error trend analysis
   */
  async getErrorTrend(
    startDate?: string,
    endDate?: string,
    toolName?: ToolName
  ): Promise<ErrorTrend> {
    // Default to last 30 days
    const end = endDate ?? new Date().toISOString().slice(0, 10);
    const start =
      startDate ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Read events from storage
    const result = await this.storageAdapter.readEvents(start, end);
    const events = result.success ? result.events : [];

    // Group events by date
    const dateData = new Map<
      string,
      { total: number; errors: number; byCategory: Record<ErrorCategory, number> }
    >();

    for (const event of events) {
      // Filter by tool if specified
      if (toolName && event.toolName !== toolName) {
        continue;
      }

      const date = extractDateFromTimestamp(event.timestamp);
      let data = dateData.get(date);
      if (!data) {
        data = { total: 0, errors: 0, byCategory: createEmptyErrorCounts() };
        dateData.set(date, data);
      }

      data.total++;
      if (!event.success) {
        data.errors++;
        const category = event.errorCategory ?? 'unknown';
        data.byCategory[category]++;
      }
    }

    // Convert to sorted data points
    const dataPoints: ErrorFrequencyDataPoint[] = [];
    for (const [date, data] of dateData) {
      dataPoints.push({
        date,
        totalInvocations: data.total,
        totalErrors: data.errors,
        errorRate: calculateErrorRate(data.errors, data.total),
        byCategory: data.byCategory,
      });
    }
    dataPoints.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate trend
    const { trend, changePercentage } = calculateTrend(dataPoints);

    // Calculate average error rate
    const totalErrors = dataPoints.reduce((sum, dp) => sum + dp.totalErrors, 0);
    const totalInvocations = dataPoints.reduce(
      (sum, dp) => sum + dp.totalInvocations,
      0
    );
    const averageErrorRate = calculateErrorRate(totalErrors, totalInvocations);

    return {
      dataPoints,
      trend,
      changePercentage,
      averageErrorRate,
    };
  }

  /**
   * Gets error counts by category.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Error counts by category
   */
  async getErrorsByCategory(
    startDate?: string,
    endDate?: string
  ): Promise<Record<ErrorCategory, number>> {
    const stats = await this.getErrorStats(startDate, endDate);
    return stats.byCategory;
  }

  /**
   * Checks if a tool has a high error rate.
   *
   * @param toolName - Name of the tool
   * @param threshold - Error rate threshold (default 0.1 = 10%)
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns true if error rate exceeds threshold
   */
  async hasHighErrorRate(
    toolName: ToolName,
    threshold: number = 0.1,
    startDate?: string,
    endDate?: string
  ): Promise<boolean> {
    const breakdown = await this.getToolErrorBreakdown(
      toolName,
      startDate,
      endDate
    );
    if (!breakdown) {
      return false;
    }
    return breakdown.errorRate >= threshold;
  }

  /**
   * Gets a summary of error metrics for display.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Human-readable summary object
   */
  async getSummary(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalErrors: number;
    overallErrorRate: string;
    mostProblematicTool: string | null;
    mostCommonErrorType: string | null;
    trend: string;
  }> {
    const stats = await this.getErrorStats(startDate, endDate);
    const errorTrend = await this.getErrorTrend(startDate, endDate);

    // Find most problematic tool
    const mostProblematicTool =
      stats.byTool.length > 0 &&
      stats.byTool[0].totalErrors > 0
        ? stats.toolsByErrorRate[0]
        : null;

    // Find most common error type
    const mostCommonErrorType = getMostCommonCategory(stats.byCategory);

    return {
      totalErrors: stats.totalErrors,
      overallErrorRate: `${(stats.overallErrorRate * 100).toFixed(1)}%`,
      mostProblematicTool,
      mostCommonErrorType,
      trend: errorTrend.trend,
    };
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the error tracker.
 */
let defaultErrorTracker: ErrorTracker | null = null;

/**
 * Gets the default error tracker instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default error tracker
 */
export function getErrorTracker(): ErrorTracker {
  if (defaultErrorTracker === null) {
    defaultErrorTracker = new ErrorTracker();
  }
  return defaultErrorTracker;
}

/**
 * Resets the default error tracker.
 * Useful for testing.
 */
export function resetErrorTracker(): void {
  defaultErrorTracker = null;
}

/**
 * Creates a new error tracker with custom options.
 * Does not affect the default singleton.
 *
 * @param options - Tracker options
 * @returns New error tracker instance
 */
export function createErrorTracker(
  options?: ErrorTrackerOptions
): ErrorTracker {
  return new ErrorTracker(options);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Gets error statistics using the default tracker.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Error statistics
 */
export async function getErrorStats(
  startDate?: string,
  endDate?: string
): Promise<ErrorStats> {
  return getErrorTracker().getErrorStats(startDate, endDate);
}

/**
 * Gets problematic tools using the default tracker.
 *
 * @param threshold - Error rate threshold (0-1)
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Problematic tools
 */
export async function getProblematicTools(
  threshold?: number,
  startDate?: string,
  endDate?: string
): Promise<ProblematicTool[]> {
  return getErrorTracker().getProblematicTools(threshold, startDate, endDate);
}

/**
 * Gets error breakdown for a tool using the default tracker.
 *
 * @param toolName - Name of the tool
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Tool error breakdown
 */
export async function getToolErrorBreakdown(
  toolName: ToolName,
  startDate?: string,
  endDate?: string
): Promise<ToolErrorBreakdown | null> {
  return getErrorTracker().getToolErrorBreakdown(toolName, startDate, endDate);
}

/**
 * Gets error trend using the default tracker.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param toolName - Optional tool name filter
 * @returns Error trend
 */
export async function getErrorTrend(
  startDate?: string,
  endDate?: string,
  toolName?: ToolName
): Promise<ErrorTrend> {
  return getErrorTracker().getErrorTrend(startDate, endDate, toolName);
}

/**
 * Gets errors by category using the default tracker.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Error counts by category
 */
export async function getErrorsByCategory(
  startDate?: string,
  endDate?: string
): Promise<Record<ErrorCategory, number>> {
  return getErrorTracker().getErrorsByCategory(startDate, endDate);
}

/**
 * Checks if a tool has a high error rate using the default tracker.
 *
 * @param toolName - Name of the tool
 * @param threshold - Error rate threshold (default 0.1)
 * @returns true if error rate is high
 */
export async function hasHighErrorRate(
  toolName: ToolName,
  threshold?: number
): Promise<boolean> {
  return getErrorTracker().hasHighErrorRate(toolName, threshold);
}

/**
 * Gets error summary using the default tracker.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Error summary
 */
export async function getErrorSummary(
  startDate?: string,
  endDate?: string
): Promise<{
  totalErrors: number;
  overallErrorRate: string;
  mostProblematicTool: string | null;
  mostCommonErrorType: string | null;
  trend: string;
}> {
  return getErrorTracker().getSummary(startDate, endDate);
}
