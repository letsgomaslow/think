/**
 * Analytics JSON Export Module
 *
 * Provides comprehensive JSON exports of analytics data for:
 * - External visualization tools (Grafana, DataDog, etc.)
 * - Web dashboard consumption
 * - Data analysis and reporting
 * - Backup and migration
 *
 * Export includes:
 * - Usage statistics (tool metrics, trends, popularity rankings)
 * - Insights report with actionable recommendations
 * - Error statistics and problematic tool identification
 * - Raw events (optional, for detailed analysis)
 *
 * Privacy guarantees:
 * - All exported data follows privacy-first design
 * - No user content or PII is ever included
 * - Only anonymized metadata is exported
 *
 * Usage:
 * ```typescript
 * import { getExporter, exportDashboardData } from './export.js';
 *
 * // Quick export with defaults
 * const jsonExport = await exportDashboardData();
 *
 * // Custom export with options
 * const exporter = getExporter();
 * const data = await exporter.exportForDashboard({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   includeRawEvents: true,
 *   includeInsights: true,
 * });
 *
 * // Write to file
 * await exporter.exportToFile('/path/to/export.json');
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AnalyticsEvent,
  AnalyticsInsightsReport,
  ExportOptions,
  UsageStats,
  ToolMetrics,
  UsageTrend,
} from './types.js';
import {
  AnalyticsAggregator,
  getAggregator,
  AggregationSummary,
  ToolPeriodCounts,
} from './aggregator.js';
import {
  InsightsGenerator,
  getInsightsGenerator,
  InsightsSummary,
} from './insights.js';
import {
  ErrorTracker,
  getErrorTracker,
  ErrorStats,
  ProblematicTool,
  ErrorTrend,
} from './errors.js';
import { getStorageAdapter, AnalyticsStorageAdapter, StorageInfo } from './storage.js';
import { getConfigManager } from './config.js';
import { getConsentStatus } from './consent.js';
import { PRIVACY_NOTICE_VERSION } from './PRIVACY_NOTICE.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Metadata about the export.
 */
export interface ExportMetadata {
  /**
   * Version of the export format.
   */
  version: string;

  /**
   * When this export was generated (ISO 8601).
   */
  generatedAt: string;

  /**
   * Start of the analysis period (YYYY-MM-DD).
   */
  periodStart: string;

  /**
   * End of the analysis period (YYYY-MM-DD).
   */
  periodEnd: string;

  /**
   * Number of days in the analysis period.
   */
  periodDays: number;

  /**
   * Privacy notice version the data complies with.
   */
  privacyVersion: string;

  /**
   * Whether analytics was enabled when export was created.
   */
  analyticsEnabled: boolean;

  /**
   * Export options used.
   */
  options: {
    includeRawEvents: boolean;
    includeStats: boolean;
    includeInsights: boolean;
    includeErrors: boolean;
    includeTrends: boolean;
  };
}

/**
 * Summary statistics for quick overview.
 */
export interface ExportSummary {
  /**
   * Total number of tool invocations.
   */
  totalInvocations: number;

  /**
   * Total number of unique sessions.
   */
  uniqueSessions: number;

  /**
   * Overall success rate as percentage (0-100).
   */
  successRate: number;

  /**
   * Overall error rate as percentage (0-100).
   */
  errorRate: number;

  /**
   * Most popular tool by invocation count.
   */
  mostPopularTool: string | null;

  /**
   * Tool with highest error rate.
   */
  highestErrorRateTool: string | null;

  /**
   * Overall health status.
   */
  healthStatus: 'healthy' | 'needs-attention' | 'critical';

  /**
   * Number of tools used.
   */
  toolsUsed: number;

  /**
   * Number of insights generated.
   */
  insightsCount: number;

  /**
   * Number of critical issues.
   */
  criticalIssuesCount: number;

  /**
   * Number of warnings.
   */
  warningsCount: number;
}

/**
 * Complete dashboard export data structure.
 * Machine-readable JSON format for external tools.
 */
export interface DashboardExportData {
  /**
   * Export metadata.
   */
  metadata: ExportMetadata;

  /**
   * Quick summary for overview.
   */
  summary: ExportSummary;

  /**
   * Usage statistics (included when includeStats: true).
   */
  usageStats?: UsageStats;

  /**
   * Per-tool metrics (included when includeStats: true).
   */
  toolMetrics?: ToolMetrics[];

  /**
   * Popularity ranking (included when includeStats: true).
   */
  popularityRanking?: Array<{
    toolName: string;
    count: number;
    percentage: number;
    rank: number;
  }>;

  /**
   * Daily usage counts (included when includeTrends: true).
   */
  dailyCounts?: ToolPeriodCounts[];

  /**
   * Weekly usage counts (included when includeTrends: true).
   */
  weeklyCounts?: ToolPeriodCounts[];

  /**
   * Monthly usage counts (included when includeTrends: true).
   */
  monthlyCounts?: ToolPeriodCounts[];

  /**
   * Usage trends per tool (included when includeTrends: true).
   */
  trends?: UsageTrend[];

  /**
   * Error statistics (included when includeErrors: true).
   */
  errorStats?: ErrorStats;

  /**
   * Problematic tools identified (included when includeErrors: true).
   */
  problematicTools?: ProblematicTool[];

  /**
   * Error trend over time (included when includeErrors: true).
   */
  errorTrend?: ErrorTrend;

  /**
   * Insights report (included when includeInsights: true).
   */
  insightsReport?: AnalyticsInsightsReport;

  /**
   * Insights summary (included when includeInsights: true).
   */
  insightsSummary?: InsightsSummary;

  /**
   * Raw events (included when includeRawEvents: true).
   */
  rawEvents?: AnalyticsEvent[];

  /**
   * Storage information.
   */
  storageInfo?: StorageInfo;
}

/**
 * Options for dashboard export.
 */
export interface DashboardExportOptions {
  /**
   * Start date for export (YYYY-MM-DD).
   * Defaults to 30 days ago.
   */
  startDate?: string;

  /**
   * End date for export (YYYY-MM-DD).
   * Defaults to today.
   */
  endDate?: string;

  /**
   * Whether to include raw events.
   * Warning: Can result in large export files.
   * @default false
   */
  includeRawEvents?: boolean;

  /**
   * Whether to include aggregated statistics.
   * @default true
   */
  includeStats?: boolean;

  /**
   * Whether to include insights.
   * @default true
   */
  includeInsights?: boolean;

  /**
   * Whether to include error statistics.
   * @default true
   */
  includeErrors?: boolean;

  /**
   * Whether to include trend data.
   * @default true
   */
  includeTrends?: boolean;

  /**
   * Whether to pretty-print JSON output.
   * @default true
   */
  prettyPrint?: boolean;
}

/**
 * Options for the exporter.
 */
export interface ExporterOptions {
  /**
   * Custom aggregator instance.
   */
  aggregator?: AnalyticsAggregator;

  /**
   * Custom insights generator instance.
   */
  insightsGenerator?: InsightsGenerator;

  /**
   * Custom error tracker instance.
   */
  errorTracker?: ErrorTracker;

  /**
   * Custom storage adapter instance.
   */
  storageAdapter?: AnalyticsStorageAdapter;
}

/**
 * Result of an export operation.
 */
export interface ExportResult {
  /**
   * Whether the export was successful.
   */
  success: boolean;

  /**
   * Export data (if successful).
   */
  data?: DashboardExportData;

  /**
   * JSON string output (if successful).
   */
  json?: string;

  /**
   * Error message (if failed).
   */
  error?: string;

  /**
   * File path (if exported to file).
   */
  filePath?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Current export format version.
 * Increment when making breaking changes to the export structure.
 */
export const EXPORT_FORMAT_VERSION = '1.0.0';

/**
 * Default number of days for export period.
 */
const DEFAULT_EXPORT_DAYS = 30;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Gets date string for N days ago.
 */
function getDaysAgoDateString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

/**
 * Gets today's date string.
 */
function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calculates the number of days between two dates.
 */
function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines health status from insight counts.
 */
function determineHealthStatus(
  criticalCount: number,
  warningCount: number
): 'healthy' | 'needs-attention' | 'critical' {
  if (criticalCount > 0) {
    return 'critical';
  }
  if (warningCount > 0) {
    return 'needs-attention';
  }
  return 'healthy';
}

// =============================================================================
// Analytics Exporter Class
// =============================================================================

/**
 * Analytics Exporter
 *
 * Generates comprehensive JSON exports of analytics data for
 * external visualization tools and dashboards.
 */
export class AnalyticsExporter {
  private aggregator: AnalyticsAggregator;
  private insightsGenerator: InsightsGenerator;
  private errorTracker: ErrorTracker;
  private storageAdapter: AnalyticsStorageAdapter;

  /**
   * Creates a new exporter.
   *
   * @param options - Exporter options
   */
  constructor(options?: ExporterOptions) {
    this.aggregator = options?.aggregator ?? getAggregator();
    this.insightsGenerator = options?.insightsGenerator ?? getInsightsGenerator();
    this.errorTracker = options?.errorTracker ?? getErrorTracker();
    this.storageAdapter = options?.storageAdapter ?? getStorageAdapter();
  }

  /**
   * Exports analytics data for dashboard consumption.
   *
   * @param options - Export options
   * @returns Export result with data and JSON
   */
  async exportForDashboard(
    options: DashboardExportOptions = {}
  ): Promise<ExportResult> {
    const {
      startDate,
      endDate,
      includeRawEvents = false,
      includeStats = true,
      includeInsights = true,
      includeErrors = true,
      includeTrends = true,
      prettyPrint = true,
    } = options;

    try {
      // Determine date range
      const end = endDate ?? getTodayDateString();
      const start = startDate ?? getDaysAgoDateString(DEFAULT_EXPORT_DAYS);
      const periodDays = daysBetween(start, end);

      // Check if analytics is enabled
      const config = getConfigManager().getConfig();
      const consentStatus = getConsentStatus();
      const analyticsEnabled = config.enabled && consentStatus.hasConsented;

      // Build metadata
      const metadata: ExportMetadata = {
        version: EXPORT_FORMAT_VERSION,
        generatedAt: new Date().toISOString(),
        periodStart: start,
        periodEnd: end,
        periodDays,
        privacyVersion: PRIVACY_NOTICE_VERSION,
        analyticsEnabled,
        options: {
          includeRawEvents,
          includeStats,
          includeInsights,
          includeErrors,
          includeTrends,
        },
      };

      // Collect data in parallel where possible
      const [
        usageStats,
        insightsReport,
        insightsSummary,
        errorStats,
        problematicTools,
        errorTrend,
        dailyCounts,
        weeklyCounts,
        monthlyCounts,
        storageInfo,
      ] = await Promise.all([
        includeStats ? this.aggregator.getUsageStats(start, end) : null,
        includeInsights ? this.insightsGenerator.generateReport(start, end) : null,
        includeInsights ? this.insightsGenerator.getSummary(start, end) : null,
        includeErrors ? this.errorTracker.getErrorStats(start, end) : null,
        includeErrors ? this.errorTracker.getProblematicTools(0.05, start, end) : null,
        includeErrors ? this.errorTracker.getErrorTrend(start, end) : null,
        includeTrends ? this.aggregator.getDailyCounts(undefined, start, end) : null,
        includeTrends ? this.aggregator.getWeeklyCounts(undefined, start, end) : null,
        includeTrends ? this.aggregator.getMonthlyCounts(undefined, start, end) : null,
        Promise.resolve(this.storageAdapter.getStorageInfo()),
      ]);

      // Get raw events if requested
      let rawEvents: AnalyticsEvent[] | undefined;
      if (includeRawEvents) {
        const readResult = await this.storageAdapter.readEvents(start, end);
        if (readResult.success) {
          rawEvents = readResult.events;
        }
      }

      // Build summary
      const summary: ExportSummary = this.buildSummary(
        usageStats,
        insightsReport,
        insightsSummary
      );

      // Build popularity ranking
      let popularityRanking: DashboardExportData['popularityRanking'];
      if (usageStats && includeStats) {
        popularityRanking = usageStats.toolMetrics
          .sort((a, b) => b.invocationCount - a.invocationCount)
          .map((m, index) => ({
            toolName: m.toolName,
            count: m.invocationCount,
            percentage:
              usageStats.totalInvocations > 0
                ? (m.invocationCount / usageStats.totalInvocations) * 100
                : 0,
            rank: index + 1,
          }));
      }

      // Build export data
      const data: DashboardExportData = {
        metadata,
        summary,
        ...(includeStats && usageStats && {
          usageStats,
          toolMetrics: usageStats.toolMetrics,
          popularityRanking,
        }),
        ...(includeTrends && {
          dailyCounts: dailyCounts ?? undefined,
          weeklyCounts: weeklyCounts ?? undefined,
          monthlyCounts: monthlyCounts ?? undefined,
          trends: usageStats?.trends,
        }),
        ...(includeErrors && {
          errorStats: errorStats ?? undefined,
          problematicTools: problematicTools ?? undefined,
          errorTrend: errorTrend ?? undefined,
        }),
        ...(includeInsights && {
          insightsReport: insightsReport ?? undefined,
          insightsSummary: insightsSummary ?? undefined,
        }),
        ...(includeRawEvents && { rawEvents }),
        storageInfo,
      };

      // Generate JSON
      const json = prettyPrint
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

      return {
        success: true,
        data,
        json,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during export',
      };
    }
  }

  /**
   * Exports analytics data to a JSON file.
   *
   * @param filePath - Path to the output file
   * @param options - Export options
   * @returns Export result
   */
  async exportToFile(
    filePath: string,
    options: DashboardExportOptions = {}
  ): Promise<ExportResult> {
    const result = await this.exportForDashboard(options);

    if (!result.success || !result.json) {
      return result;
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filePath, result.json, 'utf-8');

      return {
        ...result,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error
          ? `Failed to write file: ${error.message}`
          : 'Failed to write export file',
      };
    }
  }

  /**
   * Gets a minimal export for quick API responses.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Minimal export result
   */
  async exportMinimal(
    startDate?: string,
    endDate?: string
  ): Promise<ExportResult> {
    return this.exportForDashboard({
      startDate,
      endDate,
      includeRawEvents: false,
      includeStats: true,
      includeInsights: false,
      includeErrors: false,
      includeTrends: false,
    });
  }

  /**
   * Gets a full export with all data.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Full export result
   */
  async exportFull(
    startDate?: string,
    endDate?: string
  ): Promise<ExportResult> {
    return this.exportForDashboard({
      startDate,
      endDate,
      includeRawEvents: true,
      includeStats: true,
      includeInsights: true,
      includeErrors: true,
      includeTrends: true,
    });
  }

  /**
   * Builds the summary section from collected data.
   */
  private buildSummary(
    usageStats: UsageStats | null,
    insightsReport: AnalyticsInsightsReport | null,
    insightsSummary: InsightsSummary | null
  ): ExportSummary {
    const totalInvocations = usageStats?.totalInvocations ?? 0;
    const totalErrors = usageStats?.totalErrors ?? 0;
    const errorRate = usageStats?.overallErrorRate ?? 0;

    // Get health status
    const criticalCount = insightsReport?.summary.criticalCount ?? 0;
    const warningCount = insightsReport?.summary.warningCount ?? 0;
    const healthStatus = determineHealthStatus(criticalCount, warningCount);

    // Find most popular tool
    const mostPopularTool =
      usageStats && usageStats.popularityRanking.length > 0
        ? usageStats.popularityRanking[0]
        : null;

    // Find highest error rate tool
    const toolsWithErrors = usageStats?.toolMetrics.filter(m => m.errorCount > 0) ?? [];
    const highestErrorRateTool =
      toolsWithErrors.length > 0
        ? toolsWithErrors.sort((a, b) => b.errorRate - a.errorRate)[0].toolName
        : null;

    return {
      totalInvocations,
      uniqueSessions: usageStats?.uniqueSessions ?? 0,
      successRate: totalInvocations > 0 ? 100 - errorRate : 100,
      errorRate,
      mostPopularTool,
      highestErrorRateTool,
      healthStatus,
      toolsUsed: usageStats?.toolMetrics.length ?? 0,
      insightsCount: insightsReport?.insights.length ?? 0,
      criticalIssuesCount: criticalCount,
      warningsCount: warningCount,
    };
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the exporter.
 */
let defaultExporter: AnalyticsExporter | null = null;

/**
 * Gets the default exporter instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default exporter
 */
export function getExporter(): AnalyticsExporter {
  if (defaultExporter === null) {
    defaultExporter = new AnalyticsExporter();
  }
  return defaultExporter;
}

/**
 * Resets the default exporter.
 * Useful for testing.
 */
export function resetExporter(): void {
  defaultExporter = null;
}

/**
 * Creates a new exporter with custom options.
 * Does not affect the default singleton.
 *
 * @param options - Exporter options
 * @returns New exporter instance
 */
export function createExporter(options?: ExporterOptions): AnalyticsExporter {
  return new AnalyticsExporter(options);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Exports dashboard data using the default exporter.
 *
 * @param options - Export options
 * @returns Export result
 */
export async function exportDashboardData(
  options?: DashboardExportOptions
): Promise<ExportResult> {
  return getExporter().exportForDashboard(options);
}

/**
 * Exports dashboard data to a file using the default exporter.
 *
 * @param filePath - Path to the output file
 * @param options - Export options
 * @returns Export result
 */
export async function exportToFile(
  filePath: string,
  options?: DashboardExportOptions
): Promise<ExportResult> {
  return getExporter().exportToFile(filePath, options);
}

/**
 * Gets a minimal export using the default exporter.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Minimal export result
 */
export async function exportMinimal(
  startDate?: string,
  endDate?: string
): Promise<ExportResult> {
  return getExporter().exportMinimal(startDate, endDate);
}

/**
 * Gets a full export using the default exporter.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Full export result
 */
export async function exportFull(
  startDate?: string,
  endDate?: string
): Promise<ExportResult> {
  return getExporter().exportFull(startDate, endDate);
}

/**
 * Gets export data as a JSON string.
 *
 * @param options - Export options
 * @returns JSON string or null if export fails
 */
export async function getExportJson(
  options?: DashboardExportOptions
): Promise<string | null> {
  const result = await exportDashboardData(options);
  return result.success ? result.json ?? null : null;
}

/**
 * Gets export data as an object.
 *
 * @param options - Export options
 * @returns Export data or null if export fails
 */
export async function getExportData(
  options?: DashboardExportOptions
): Promise<DashboardExportData | null> {
  const result = await exportDashboardData(options);
  return result.success ? result.data ?? null : null;
}
