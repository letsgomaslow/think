/**
 * Analytics Aggregation Engine
 *
 * Processes raw analytics events into summary statistics including:
 * - Tool invocation counts aggregated by tool name
 * - Daily, weekly, and monthly usage counts
 * - Error rates per tool
 * - Usage trends (growth/decline identification)
 * - Average response times (including p95 percentile)
 *
 * Privacy guarantees:
 * - Only aggregates metadata, never content
 * - No PII in any computed statistics
 * - Works entirely with anonymized event data
 *
 * Usage:
 * ```typescript
 * import { getAggregator } from './aggregator.js';
 *
 * const aggregator = getAggregator();
 *
 * // Get full usage statistics
 * const stats = await aggregator.getUsageStats();
 *
 * // Get daily counts for a tool
 * const dailyCounts = await aggregator.getDailyCounts('trace');
 *
 * // Get usage trends
 * const trends = await aggregator.getUsageTrends();
 * ```
 */

import { ToolName, TOOL_NAMES } from '../toolNames.js';
import {
  AnalyticsEvent,
  ErrorCategory,
  ToolMetrics,
  UsageStats,
  UsageTrend,
  TimeSeriesDataPoint,
  TrendDirection,
} from './types.js';
import { getStorageAdapter, AnalyticsStorageAdapter } from './storage.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Time period for aggregation.
 */
export type AggregationPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Count data point for a time period.
 */
export interface PeriodCount {
  /**
   * Period identifier.
   * - Daily: YYYY-MM-DD
   * - Weekly: YYYY-Www (ISO week)
   * - Monthly: YYYY-MM
   */
  period: string;

  /**
   * Total number of invocations in this period.
   */
  totalCount: number;

  /**
   * Number of successful invocations.
   */
  successCount: number;

  /**
   * Number of failed invocations.
   */
  errorCount: number;

  /**
   * Error rate for this period (0-1).
   */
  errorRate: number;

  /**
   * Average duration in milliseconds.
   */
  avgDurationMs: number;
}

/**
 * Tool-specific period counts.
 */
export interface ToolPeriodCounts {
  /**
   * Name of the tool.
   */
  toolName: ToolName;

  /**
   * Aggregation period type.
   */
  periodType: AggregationPeriod;

  /**
   * Count data for each period.
   */
  periods: PeriodCount[];

  /**
   * Overall trend direction.
   */
  trend: TrendDirection;

  /**
   * Percentage change from first to last period.
   */
  changePercentage: number;
}

/**
 * Summary statistics for a specific time range.
 */
export interface AggregationSummary {
  /**
   * Total invocations across all tools.
   */
  totalInvocations: number;

  /**
   * Total successful invocations.
   */
  totalSuccesses: number;

  /**
   * Total failed invocations.
   */
  totalErrors: number;

  /**
   * Overall error rate (0-1).
   */
  overallErrorRate: number;

  /**
   * Overall average duration in milliseconds.
   */
  overallAvgDurationMs: number;

  /**
   * Number of unique sessions.
   */
  uniqueSessions: number;

  /**
   * Average invocations per session.
   */
  avgInvocationsPerSession: number;

  /**
   * Most popular tool by invocation count.
   */
  mostPopularTool: ToolName | null;

  /**
   * Tool with highest error rate (if any errors).
   */
  highestErrorRateTool: ToolName | null;

  /**
   * Slowest tool by average duration.
   */
  slowestTool: ToolName | null;
}

/**
 * Options for aggregator configuration.
 */
export interface AggregatorOptions {
  /**
   * Custom storage adapter (defaults to singleton).
   */
  storageAdapter?: AnalyticsStorageAdapter;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default number of days to look back for statistics.
 */
const DEFAULT_LOOKBACK_DAYS = 30;

/**
 * Threshold for considering a trend significant (percentage change).
 */
const TREND_SIGNIFICANCE_THRESHOLD = 10;

/**
 * Minimum number of data points needed to calculate a trend.
 */
const MIN_TREND_DATA_POINTS = 2;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Formats a date as YYYY-MM-DD.
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date string.
 */
function getTodayDateString(): string {
  return formatDateString(new Date());
}

/**
 * Gets a date N days ago.
 */
function getDaysAgoDateString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateString(date);
}

/**
 * Extracts the date (YYYY-MM-DD) from an ISO timestamp.
 */
function extractDateFromTimestamp(timestamp: string): string {
  return timestamp.slice(0, 10);
}

/**
 * Extracts the week identifier (YYYY-Www) from a date string.
 * Uses ISO week numbering.
 */
function getWeekIdentifier(dateString: string): string {
  const date = new Date(dateString);
  // Get Thursday of the week (ISO week definition)
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);

  // Get first Thursday of the year
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Calculate week number
  const weekNumber = Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${thursday.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Extracts the month identifier (YYYY-MM) from a date string.
 */
function getMonthIdentifier(dateString: string): string {
  return dateString.slice(0, 7);
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
 * Calculates average safely (handles division by zero).
 */
function calculateAverage(sum: number, count: number): number {
  if (count === 0) {
    return 0;
  }
  return sum / count;
}

/**
 * Calculates the P95 (95th percentile) from an array of numbers.
 */
function calculateP95(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Determines trend direction from data points.
 */
function calculateTrendDirection(
  dataPoints: { count: number }[]
): { trend: TrendDirection; changePercentage: number } {
  if (dataPoints.length < MIN_TREND_DATA_POINTS) {
    return { trend: 'stable', changePercentage: 0 };
  }

  // Compare first half average to second half average
  const midpoint = Math.floor(dataPoints.length / 2);
  const firstHalf = dataPoints.slice(0, midpoint);
  const secondHalf = dataPoints.slice(midpoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, dp) => sum + dp.count, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, dp) => sum + dp.count, 0) / secondHalf.length;

  // Calculate percentage change
  let changePercentage = 0;
  if (firstHalfAvg > 0) {
    changePercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  } else if (secondHalfAvg > 0) {
    changePercentage = 100; // Went from 0 to something
  }

  // Determine trend direction
  let trend: TrendDirection = 'stable';
  if (changePercentage > TREND_SIGNIFICANCE_THRESHOLD) {
    trend = 'increasing';
  } else if (changePercentage < -TREND_SIGNIFICANCE_THRESHOLD) {
    trend = 'decreasing';
  }

  return { trend, changePercentage };
}

/**
 * Creates empty error category counts.
 */
function createEmptyErrorCounts(): Record<ErrorCategory, number> {
  return {
    validation: 0,
    runtime: 0,
    timeout: 0,
    unknown: 0,
  };
}

// =============================================================================
// Aggregation Engine Class
// =============================================================================

/**
 * Analytics Aggregation Engine
 *
 * Processes raw analytics events into meaningful statistics and trends.
 * Provides methods for different aggregation granularities and metrics.
 */
export class AnalyticsAggregator {
  private storageAdapter: AnalyticsStorageAdapter;

  /**
   * Creates a new aggregation engine.
   *
   * @param options - Aggregator options
   */
  constructor(options?: AggregatorOptions) {
    this.storageAdapter = options?.storageAdapter ?? getStorageAdapter();
  }

  /**
   * Gets comprehensive usage statistics for a date range.
   *
   * @param startDate - Start date (YYYY-MM-DD), defaults to 30 days ago
   * @param endDate - End date (YYYY-MM-DD), defaults to today
   * @returns Complete usage statistics
   */
  async getUsageStats(startDate?: string, endDate?: string): Promise<UsageStats> {
    const end = endDate ?? getTodayDateString();
    const start = startDate ?? getDaysAgoDateString(DEFAULT_LOOKBACK_DAYS);

    // Read events from storage
    const result = await this.storageAdapter.readEvents(start, end);
    const events = result.success ? result.events : [];

    // Aggregate data
    const toolData = new Map<
      ToolName,
      {
        invocations: number;
        successes: number;
        errors: number;
        durations: number[];
        errorsByCategory: Record<ErrorCategory, number>;
        firstTimestamp: string;
        lastTimestamp: string;
      }
    >();

    const sessions = new Set<string>();
    let totalInvocations = 0;
    let totalSuccesses = 0;
    let totalErrors = 0;

    // Process events
    for (const event of events) {
      sessions.add(event.sessionId);
      totalInvocations++;

      if (event.success) {
        totalSuccesses++;
      } else {
        totalErrors++;
      }

      // Update tool data
      let tool = toolData.get(event.toolName);
      if (!tool) {
        tool = {
          invocations: 0,
          successes: 0,
          errors: 0,
          durations: [],
          errorsByCategory: createEmptyErrorCounts(),
          firstTimestamp: event.timestamp,
          lastTimestamp: event.timestamp,
        };
        toolData.set(event.toolName, tool);
      }

      tool.invocations++;
      tool.durations.push(event.durationMs);

      if (event.success) {
        tool.successes++;
      } else {
        tool.errors++;
        const category = event.errorCategory ?? 'unknown';
        tool.errorsByCategory[category]++;
      }

      // Update timestamps
      if (event.timestamp < tool.firstTimestamp) {
        tool.firstTimestamp = event.timestamp;
      }
      if (event.timestamp > tool.lastTimestamp) {
        tool.lastTimestamp = event.timestamp;
      }
    }

    // Build tool metrics
    const toolMetrics: ToolMetrics[] = [];
    for (const [toolName, data] of toolData) {
      const sortedDurations = [...data.durations].sort((a, b) => a - b);
      const avgDuration = calculateAverage(
        data.durations.reduce((sum, d) => sum + d, 0),
        data.durations.length
      );

      toolMetrics.push({
        toolName,
        invocationCount: data.invocations,
        successCount: data.successes,
        errorCount: data.errors,
        errorRate: calculateErrorRate(data.errors, data.invocations) * 100, // As percentage
        avgDurationMs: avgDuration,
        minDurationMs: sortedDurations.length > 0 ? sortedDurations[0] : 0,
        maxDurationMs: sortedDurations.length > 0 ? sortedDurations[sortedDurations.length - 1] : 0,
        p95DurationMs: calculateP95(data.durations),
        errorsByCategory: data.errorsByCategory,
        firstInvocation: data.firstTimestamp,
        lastInvocation: data.lastTimestamp,
      });
    }

    // Sort by invocation count for popularity ranking
    const sortedByPopularity = [...toolMetrics].sort(
      (a, b) => b.invocationCount - a.invocationCount
    );
    const popularityRanking = sortedByPopularity.map((m) => m.toolName);

    // Identify tools needing attention (error rate > 10%)
    const toolsNeedingAttention = toolMetrics
      .filter((m) => m.errorRate > 10)
      .sort((a, b) => b.errorRate - a.errorRate)
      .map((m) => m.toolName);

    // Get usage trends
    const trends = await this.getUsageTrends(start, end);

    return {
      totalInvocations,
      totalSuccesses,
      totalErrors,
      overallErrorRate: calculateErrorRate(totalErrors, totalInvocations) * 100,
      toolMetrics,
      popularityRanking,
      toolsNeedingAttention,
      trends,
      uniqueSessions: sessions.size,
      avgInvocationsPerSession: calculateAverage(totalInvocations, sessions.size),
      periodStart: start,
      periodEnd: end,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Gets usage trends for all tools.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Usage trends per tool
   */
  async getUsageTrends(
    startDate?: string,
    endDate?: string
  ): Promise<UsageTrend[]> {
    const end = endDate ?? getTodayDateString();
    const start = startDate ?? getDaysAgoDateString(DEFAULT_LOOKBACK_DAYS);

    // Read events
    const result = await this.storageAdapter.readEvents(start, end);
    const events = result.success ? result.events : [];

    // Group events by tool and date
    const toolDateData = new Map<
      ToolName,
      Map<string, { count: number; successes: number; errors: number }>
    >();

    for (const event of events) {
      const date = extractDateFromTimestamp(event.timestamp);

      let toolDates = toolDateData.get(event.toolName);
      if (!toolDates) {
        toolDates = new Map();
        toolDateData.set(event.toolName, toolDates);
      }

      let dateData = toolDates.get(date);
      if (!dateData) {
        dateData = { count: 0, successes: 0, errors: 0 };
        toolDates.set(date, dateData);
      }

      dateData.count++;
      if (event.success) {
        dateData.successes++;
      } else {
        dateData.errors++;
      }
    }

    // Build trends
    const trends: UsageTrend[] = [];
    for (const [toolName, dateMap] of toolDateData) {
      const dataPoints: TimeSeriesDataPoint[] = [];

      for (const [date, data] of dateMap) {
        dataPoints.push({
          date,
          count: data.count,
          successCount: data.successes,
          errorCount: data.errors,
        });
      }

      // Sort by date
      dataPoints.sort((a, b) => a.date.localeCompare(b.date));

      // Calculate trend
      const { trend, changePercentage } = calculateTrendDirection(dataPoints);

      trends.push({
        toolName,
        dataPoints,
        trend,
        changePercentage,
      });
    }

    return trends;
  }

  /**
   * Gets daily counts for a specific tool or all tools.
   *
   * @param toolName - Optional tool name filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Daily count data
   */
  async getDailyCounts(
    toolName?: ToolName,
    startDate?: string,
    endDate?: string
  ): Promise<ToolPeriodCounts[]> {
    return this.getPeriodCounts('daily', toolName, startDate, endDate);
  }

  /**
   * Gets weekly counts for a specific tool or all tools.
   *
   * @param toolName - Optional tool name filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Weekly count data
   */
  async getWeeklyCounts(
    toolName?: ToolName,
    startDate?: string,
    endDate?: string
  ): Promise<ToolPeriodCounts[]> {
    return this.getPeriodCounts('weekly', toolName, startDate, endDate);
  }

  /**
   * Gets monthly counts for a specific tool or all tools.
   *
   * @param toolName - Optional tool name filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Monthly count data
   */
  async getMonthlyCounts(
    toolName?: ToolName,
    startDate?: string,
    endDate?: string
  ): Promise<ToolPeriodCounts[]> {
    return this.getPeriodCounts('monthly', toolName, startDate, endDate);
  }

  /**
   * Gets period-based counts with configurable granularity.
   *
   * @param periodType - Aggregation period type
   * @param toolName - Optional tool name filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Period count data per tool
   */
  async getPeriodCounts(
    periodType: AggregationPeriod,
    toolName?: ToolName,
    startDate?: string,
    endDate?: string
  ): Promise<ToolPeriodCounts[]> {
    const end = endDate ?? getTodayDateString();
    const start = startDate ?? getDaysAgoDateString(DEFAULT_LOOKBACK_DAYS);

    // Read events
    const result = await this.storageAdapter.readEvents(start, end);
    const events = result.success ? result.events : [];

    // Get period identifier function
    const getPeriodId = (date: string): string => {
      switch (periodType) {
        case 'daily':
          return date;
        case 'weekly':
          return getWeekIdentifier(date);
        case 'monthly':
          return getMonthIdentifier(date);
      }
    };

    // Group events by tool and period
    const toolPeriodData = new Map<
      ToolName,
      Map<
        string,
        { total: number; successes: number; errors: number; durations: number[] }
      >
    >();

    for (const event of events) {
      // Filter by tool if specified
      if (toolName && event.toolName !== toolName) {
        continue;
      }

      const date = extractDateFromTimestamp(event.timestamp);
      const periodId = getPeriodId(date);

      let toolPeriods = toolPeriodData.get(event.toolName);
      if (!toolPeriods) {
        toolPeriods = new Map();
        toolPeriodData.set(event.toolName, toolPeriods);
      }

      let periodData = toolPeriods.get(periodId);
      if (!periodData) {
        periodData = { total: 0, successes: 0, errors: 0, durations: [] };
        toolPeriods.set(periodId, periodData);
      }

      periodData.total++;
      periodData.durations.push(event.durationMs);
      if (event.success) {
        periodData.successes++;
      } else {
        periodData.errors++;
      }
    }

    // Build results
    const results: ToolPeriodCounts[] = [];
    for (const [tool, periodMap] of toolPeriodData) {
      const periods: PeriodCount[] = [];

      for (const [period, data] of periodMap) {
        const avgDuration = calculateAverage(
          data.durations.reduce((sum, d) => sum + d, 0),
          data.durations.length
        );

        periods.push({
          period,
          totalCount: data.total,
          successCount: data.successes,
          errorCount: data.errors,
          errorRate: calculateErrorRate(data.errors, data.total),
          avgDurationMs: avgDuration,
        });
      }

      // Sort periods chronologically
      periods.sort((a, b) => a.period.localeCompare(b.period));

      // Calculate trend
      const { trend, changePercentage } = calculateTrendDirection(
        periods.map((p) => ({ count: p.totalCount }))
      );

      results.push({
        toolName: tool,
        periodType,
        periods,
        trend,
        changePercentage,
      });
    }

    return results;
  }

  /**
   * Gets a summary of aggregation statistics.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Aggregation summary
   */
  async getSummary(
    startDate?: string,
    endDate?: string
  ): Promise<AggregationSummary> {
    const stats = await this.getUsageStats(startDate, endDate);

    // Find most popular tool
    const mostPopularTool =
      stats.popularityRanking.length > 0 ? stats.popularityRanking[0] : null;

    // Find highest error rate tool (with at least 1 error)
    const toolsWithErrors = stats.toolMetrics.filter((m) => m.errorCount > 0);
    const highestErrorRateTool =
      toolsWithErrors.length > 0
        ? toolsWithErrors.sort((a, b) => b.errorRate - a.errorRate)[0].toolName
        : null;

    // Find slowest tool
    const toolsWithDuration = stats.toolMetrics.filter((m) => m.invocationCount > 0);
    const slowestTool =
      toolsWithDuration.length > 0
        ? toolsWithDuration.sort((a, b) => b.avgDurationMs - a.avgDurationMs)[0].toolName
        : null;

    // Calculate overall average duration
    const totalDuration = stats.toolMetrics.reduce(
      (sum, m) => sum + m.avgDurationMs * m.invocationCount,
      0
    );
    const overallAvgDurationMs = calculateAverage(totalDuration, stats.totalInvocations);

    return {
      totalInvocations: stats.totalInvocations,
      totalSuccesses: stats.totalSuccesses,
      totalErrors: stats.totalErrors,
      overallErrorRate: stats.overallErrorRate / 100, // As decimal
      overallAvgDurationMs,
      uniqueSessions: stats.uniqueSessions,
      avgInvocationsPerSession: stats.avgInvocationsPerSession,
      mostPopularTool,
      highestErrorRateTool,
      slowestTool,
    };
  }

  /**
   * Gets tool metrics for a specific tool.
   *
   * @param toolName - Name of the tool
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Tool metrics, or null if no data
   */
  async getToolMetrics(
    toolName: ToolName,
    startDate?: string,
    endDate?: string
  ): Promise<ToolMetrics | null> {
    const stats = await this.getUsageStats(startDate, endDate);
    return stats.toolMetrics.find((m) => m.toolName === toolName) ?? null;
  }

  /**
   * Gets popularity ranking of tools.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param limit - Maximum number of tools to return
   * @returns Ranked list of tools with counts
   */
  async getPopularityRanking(
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<{ toolName: ToolName; count: number; percentage: number }[]> {
    const stats = await this.getUsageStats(startDate, endDate);

    const ranking = stats.toolMetrics
      .sort((a, b) => b.invocationCount - a.invocationCount)
      .map((m) => ({
        toolName: m.toolName,
        count: m.invocationCount,
        percentage:
          stats.totalInvocations > 0
            ? (m.invocationCount / stats.totalInvocations) * 100
            : 0,
      }));

    return limit ? ranking.slice(0, limit) : ranking;
  }

  /**
   * Gets error rates for all tools.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Error rates per tool
   */
  async getErrorRates(
    startDate?: string,
    endDate?: string
  ): Promise<{ toolName: ToolName; errorRate: number; errorCount: number }[]> {
    const stats = await this.getUsageStats(startDate, endDate);

    return stats.toolMetrics
      .map((m) => ({
        toolName: m.toolName,
        errorRate: m.errorRate,
        errorCount: m.errorCount,
      }))
      .sort((a, b) => b.errorRate - a.errorRate);
  }

  /**
   * Gets average response times for all tools.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Response times per tool
   */
  async getResponseTimes(
    startDate?: string,
    endDate?: string
  ): Promise<
    {
      toolName: ToolName;
      avgDurationMs: number;
      minDurationMs: number;
      maxDurationMs: number;
      p95DurationMs: number;
    }[]
  > {
    const stats = await this.getUsageStats(startDate, endDate);

    return stats.toolMetrics
      .map((m) => ({
        toolName: m.toolName,
        avgDurationMs: m.avgDurationMs,
        minDurationMs: m.minDurationMs,
        maxDurationMs: m.maxDurationMs,
        p95DurationMs: m.p95DurationMs,
      }))
      .sort((a, b) => b.avgDurationMs - a.avgDurationMs);
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the aggregator.
 */
let defaultAggregator: AnalyticsAggregator | null = null;

/**
 * Gets the default aggregator instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default aggregator
 */
export function getAggregator(): AnalyticsAggregator {
  if (defaultAggregator === null) {
    defaultAggregator = new AnalyticsAggregator();
  }
  return defaultAggregator;
}

/**
 * Resets the default aggregator.
 * Useful for testing.
 */
export function resetAggregator(): void {
  defaultAggregator = null;
}

/**
 * Creates a new aggregator with custom options.
 * Does not affect the default singleton.
 *
 * @param options - Aggregator options
 * @returns New aggregator instance
 */
export function createAggregator(
  options?: AggregatorOptions
): AnalyticsAggregator {
  return new AnalyticsAggregator(options);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Gets usage statistics using the default aggregator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Usage statistics
 */
export async function getUsageStats(
  startDate?: string,
  endDate?: string
): Promise<UsageStats> {
  return getAggregator().getUsageStats(startDate, endDate);
}

/**
 * Gets usage trends using the default aggregator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Usage trends
 */
export async function getUsageTrends(
  startDate?: string,
  endDate?: string
): Promise<UsageTrend[]> {
  return getAggregator().getUsageTrends(startDate, endDate);
}

/**
 * Gets daily counts using the default aggregator.
 *
 * @param toolName - Optional tool name filter
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Daily counts
 */
export async function getDailyCounts(
  toolName?: ToolName,
  startDate?: string,
  endDate?: string
): Promise<ToolPeriodCounts[]> {
  return getAggregator().getDailyCounts(toolName, startDate, endDate);
}

/**
 * Gets weekly counts using the default aggregator.
 *
 * @param toolName - Optional tool name filter
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Weekly counts
 */
export async function getWeeklyCounts(
  toolName?: ToolName,
  startDate?: string,
  endDate?: string
): Promise<ToolPeriodCounts[]> {
  return getAggregator().getWeeklyCounts(toolName, startDate, endDate);
}

/**
 * Gets monthly counts using the default aggregator.
 *
 * @param toolName - Optional tool name filter
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Monthly counts
 */
export async function getMonthlyCounts(
  toolName?: ToolName,
  startDate?: string,
  endDate?: string
): Promise<ToolPeriodCounts[]> {
  return getAggregator().getMonthlyCounts(toolName, startDate, endDate);
}

/**
 * Gets aggregation summary using the default aggregator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Aggregation summary
 */
export async function getAggregationSummary(
  startDate?: string,
  endDate?: string
): Promise<AggregationSummary> {
  return getAggregator().getSummary(startDate, endDate);
}

/**
 * Gets tool metrics using the default aggregator.
 *
 * @param toolName - Name of the tool
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Tool metrics
 */
export async function getToolMetrics(
  toolName: ToolName,
  startDate?: string,
  endDate?: string
): Promise<ToolMetrics | null> {
  return getAggregator().getToolMetrics(toolName, startDate, endDate);
}

/**
 * Gets popularity ranking using the default aggregator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param limit - Maximum number of tools to return
 * @returns Popularity ranking
 */
export async function getPopularityRanking(
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<{ toolName: ToolName; count: number; percentage: number }[]> {
  return getAggregator().getPopularityRanking(startDate, endDate, limit);
}

/**
 * Gets error rates using the default aggregator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Error rates per tool
 */
export async function getErrorRates(
  startDate?: string,
  endDate?: string
): Promise<{ toolName: ToolName; errorRate: number; errorCount: number }[]> {
  return getAggregator().getErrorRates(startDate, endDate);
}

/**
 * Gets response times using the default aggregator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Response times per tool
 */
export async function getResponseTimes(
  startDate?: string,
  endDate?: string
): Promise<
  {
    toolName: ToolName;
    avgDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    p95DurationMs: number;
  }[]
> {
  return getAggregator().getResponseTimes(startDate, endDate);
}
