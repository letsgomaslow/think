/**
 * Analytics Insights Generator
 *
 * Produces human-readable insights from analytics data including:
 * - Most popular tools (by usage)
 * - Tools needing attention (high error rates, slow performance)
 * - Usage patterns and trends
 * - Actionable recommendations
 *
 * Privacy guarantees:
 * - All insights are derived from aggregated metadata only
 * - No user content or PII is ever included in insights
 * - Works entirely with anonymized event data
 *
 * Usage:
 * ```typescript
 * import { getInsightsGenerator } from './insights.js';
 *
 * const generator = getInsightsGenerator();
 *
 * // Get all insights
 * const report = await generator.generateReport();
 *
 * // Get specific insight types
 * const popularity = await generator.getPopularityInsights();
 * const reliability = await generator.getReliabilityInsights();
 * const trends = await generator.getTrendInsights();
 * ```
 */

import { ToolName, TOOL_NAMES } from '../toolNames.js';
import {
  AnalyticsInsight,
  AnalyticsInsightsReport,
  InsightCategory,
  InsightSeverity,
  ToolMetrics,
  UsageStats,
  UsageTrend,
  TrendDirection,
} from './types.js';
import {
  AnalyticsAggregator,
  getAggregator,
  AggregationSummary,
} from './aggregator.js';
import {
  ErrorTracker,
  getErrorTracker,
  ProblematicTool,
} from './errors.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for the insights generator.
 */
export interface InsightsGeneratorOptions {
  /**
   * Custom aggregator instance (defaults to singleton).
   */
  aggregator?: AnalyticsAggregator;

  /**
   * Custom error tracker instance (defaults to singleton).
   */
  errorTracker?: ErrorTracker;

  /**
   * Error rate threshold for generating reliability insights (default: 0.05 = 5%).
   */
  errorRateThreshold?: number;

  /**
   * Response time threshold in ms for performance insights (default: 1000ms).
   */
  slowResponseThreshold?: number;

  /**
   * Trend change threshold percentage for trend insights (default: 20%).
   */
  trendChangeThreshold?: number;

  /**
   * Minimum invocations required to generate insights for a tool (default: 10).
   */
  minInvocationsForInsight?: number;
}

/**
 * Formatted insight for display.
 */
export interface FormattedInsight {
  /**
   * Icon/emoji for visual representation.
   */
  icon: string;

  /**
   * Title of the insight.
   */
  title: string;

  /**
   * Detailed description.
   */
  description: string;

  /**
   * Optional recommendation.
   */
  recommendation?: string;

  /**
   * Severity level.
   */
  severity: InsightSeverity;

  /**
   * Category of insight.
   */
  category: InsightCategory;
}

/**
 * Quick summary of analytics insights.
 */
export interface InsightsSummary {
  /**
   * Total number of insights generated.
   */
  totalInsights: number;

  /**
   * Number of critical insights.
   */
  criticalCount: number;

  /**
   * Number of warning insights.
   */
  warningCount: number;

  /**
   * Number of info insights.
   */
  infoCount: number;

  /**
   * Most popular tool.
   */
  mostPopularTool: ToolName | null;

  /**
   * Tool needing most attention.
   */
  toolNeedingAttention: ToolName | null;

  /**
   * Overall health assessment.
   */
  healthStatus: 'healthy' | 'needs-attention' | 'critical';

  /**
   * One-line summary.
   */
  oneLiner: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default configuration values.
 */
const DEFAULT_OPTIONS: Required<Omit<InsightsGeneratorOptions, 'aggregator' | 'errorTracker'>> = {
  errorRateThreshold: 0.05,        // 5%
  slowResponseThreshold: 1000,     // 1 second
  trendChangeThreshold: 20,        // 20% change
  minInvocationsForInsight: 10,
};

/**
 * Icons for different insight types.
 */
const INSIGHT_ICONS: Record<InsightCategory, Record<InsightSeverity, string>> = {
  popularity: {
    info: '\u2B50',      // Star
    warning: '\u2B50',   // Star
    critical: '\u2B50',  // Star
  },
  performance: {
    info: '\u23F1\uFE0F',      // Stopwatch
    warning: '\u26A0\uFE0F',   // Warning
    critical: '\u{1F6A8}',     // Rotating light
  },
  reliability: {
    info: '\u2139\uFE0F',      // Info
    warning: '\u26A0\uFE0F',   // Warning
    critical: '\u274C',        // X mark
  },
  trend: {
    info: '\u{1F4C8}',         // Chart increasing
    warning: '\u{1F4C9}',      // Chart decreasing
    critical: '\u{1F4C9}',     // Chart decreasing
  },
};

/**
 * Human-readable tool name descriptions.
 */
const TOOL_DESCRIPTIONS: Record<ToolName, string> = {
  trace: 'Trace (structured problem breakdown)',
  model: 'Model (mental model application)',
  pattern: 'Pattern (pattern matching)',
  paradigm: 'Paradigm (paradigm exploration)',
  debug: 'Debug (systematic debugging)',
  council: 'Council (multi-perspective analysis)',
  decide: 'Decide (decision frameworks)',
  reflect: 'Reflect (reflection prompts)',
  hypothesis: 'Hypothesis (hypothesis generation)',
  debate: 'Debate (argument exploration)',
  map: 'Map (concept mapping)',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generates a unique insight ID.
 */
function generateInsightId(category: InsightCategory, toolName?: ToolName): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  const toolPart = toolName ? `-${toolName}` : '';
  return `${category}${toolPart}-${timestamp}-${random}`;
}

/**
 * Formats a percentage for display.
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Formats duration in milliseconds for display.
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Gets a human-readable tool name.
 */
function getToolDisplayName(toolName: ToolName): string {
  return TOOL_DESCRIPTIONS[toolName] || toolName;
}

/**
 * Creates an analytics insight object.
 */
function createInsight(
  category: InsightCategory,
  severity: InsightSeverity,
  title: string,
  description: string,
  affectedTools: ToolName[],
  metrics: Record<string, number | string>,
  recommendation?: string
): AnalyticsInsight {
  return {
    id: generateInsightId(category, affectedTools[0]),
    category,
    severity,
    title,
    description,
    recommendation,
    affectedTools,
    metrics,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Determines overall health status from insights.
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
// Insights Generator Class
// =============================================================================

/**
 * Analytics Insights Generator
 *
 * Analyzes usage statistics and generates human-readable insights
 * with actionable recommendations.
 */
export class InsightsGenerator {
  private aggregator: AnalyticsAggregator;
  private errorTracker: ErrorTracker;
  private options: Required<Omit<InsightsGeneratorOptions, 'aggregator' | 'errorTracker'>>;

  /**
   * Creates a new insights generator.
   *
   * @param options - Generator options
   */
  constructor(options?: InsightsGeneratorOptions) {
    this.aggregator = options?.aggregator ?? getAggregator();
    this.errorTracker = options?.errorTracker ?? getErrorTracker();
    this.options = {
      errorRateThreshold: options?.errorRateThreshold ?? DEFAULT_OPTIONS.errorRateThreshold,
      slowResponseThreshold: options?.slowResponseThreshold ?? DEFAULT_OPTIONS.slowResponseThreshold,
      trendChangeThreshold: options?.trendChangeThreshold ?? DEFAULT_OPTIONS.trendChangeThreshold,
      minInvocationsForInsight: options?.minInvocationsForInsight ?? DEFAULT_OPTIONS.minInvocationsForInsight,
    };
  }

  /**
   * Generates a complete insights report.
   *
   * @param startDate - Start date (YYYY-MM-DD), defaults to last 30 days
   * @param endDate - End date (YYYY-MM-DD), defaults to today
   * @returns Complete insights report
   */
  async generateReport(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsInsightsReport> {
    const [
      popularityInsights,
      reliabilityInsights,
      performanceInsights,
      trendInsights,
    ] = await Promise.all([
      this.getPopularityInsights(startDate, endDate),
      this.getReliabilityInsights(startDate, endDate),
      this.getPerformanceInsights(startDate, endDate),
      this.getTrendInsights(startDate, endDate),
    ]);

    const allInsights = [
      ...popularityInsights,
      ...reliabilityInsights,
      ...performanceInsights,
      ...trendInsights,
    ];

    // Sort by severity (critical first)
    const severityOrder: Record<InsightSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    allInsights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Count by severity
    const criticalCount = allInsights.filter((i) => i.severity === 'critical').length;
    const warningCount = allInsights.filter((i) => i.severity === 'warning').length;
    const infoCount = allInsights.filter((i) => i.severity === 'info').length;

    // Determine period
    const end = endDate ?? new Date().toISOString().slice(0, 10);
    const start = startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    return {
      insights: allInsights,
      summary: {
        totalInsights: allInsights.length,
        criticalCount,
        warningCount,
        infoCount,
      },
      periodStart: start,
      periodEnd: end,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Gets popularity-related insights.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Popularity insights
   */
  async getPopularityInsights(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsInsight[]> {
    const stats = await this.aggregator.getUsageStats(startDate, endDate);
    const insights: AnalyticsInsight[] = [];

    if (stats.totalInvocations === 0) {
      return insights;
    }

    // Filter tools with enough invocations
    const significantTools = stats.toolMetrics.filter(
      (m) => m.invocationCount >= this.options.minInvocationsForInsight
    );

    if (significantTools.length === 0) {
      // Not enough data yet
      insights.push(
        createInsight(
          'popularity',
          'info',
          'Collecting Usage Data',
          `Analytics has recorded ${stats.totalInvocations} tool invocations. Continue using the tools to generate more insights.`,
          [],
          {
            totalInvocations: stats.totalInvocations,
            toolsUsed: stats.toolMetrics.length,
          },
          'Use the thinking tools in your workflows to generate meaningful insights.'
        )
      );
      return insights;
    }

    // Most popular tool
    const sortedByPopularity = [...significantTools].sort(
      (a, b) => b.invocationCount - a.invocationCount
    );
    const topTool = sortedByPopularity[0];
    const topToolPercentage = (topTool.invocationCount / stats.totalInvocations) * 100;

    insights.push(
      createInsight(
        'popularity',
        'info',
        'Most Popular Tool',
        `${getToolDisplayName(topTool.toolName)} is your most-used tool, accounting for ${formatPercentage(topToolPercentage)} of all invocations (${topTool.invocationCount} uses).`,
        [topTool.toolName],
        {
          invocationCount: topTool.invocationCount,
          percentageOfTotal: topToolPercentage,
          totalInvocations: stats.totalInvocations,
        }
      )
    );

    // Least used tools (with at least 1 invocation)
    const usedTools = significantTools.filter((m) => m.invocationCount > 0);
    if (usedTools.length > 1) {
      const leastUsed = sortedByPopularity[sortedByPopularity.length - 1];
      const leastUsedPercentage = (leastUsed.invocationCount / stats.totalInvocations) * 100;

      if (leastUsedPercentage < 5) {
        insights.push(
          createInsight(
            'popularity',
            'info',
            'Underutilized Tool',
            `${getToolDisplayName(leastUsed.toolName)} is rarely used (${formatPercentage(leastUsedPercentage)} of invocations). It might offer valuable capabilities you're not leveraging.`,
            [leastUsed.toolName],
            {
              invocationCount: leastUsed.invocationCount,
              percentageOfTotal: leastUsedPercentage,
            },
            `Try using ${leastUsed.toolName} for ${getToolUsageSuggestion(leastUsed.toolName)}.`
          )
        );
      }
    }

    // Unused tools
    const unusedTools = Object.values(TOOL_NAMES).filter(
      (toolName) => !stats.toolMetrics.find((m) => m.toolName === toolName)
    );
    if (unusedTools.length > 0) {
      insights.push(
        createInsight(
          'popularity',
          'info',
          'Unexplored Tools',
          `${unusedTools.length} tools haven't been used yet: ${unusedTools.join(', ')}. Each offers unique thinking approaches.`,
          unusedTools,
          {
            unusedToolCount: unusedTools.length,
          },
          'Explore these tools to expand your analytical toolkit.'
        )
      );
    }

    // Usage distribution
    const usageDistribution = this.calculateUsageDistribution(stats.toolMetrics, stats.totalInvocations);
    if (usageDistribution.isConcentrated) {
      insights.push(
        createInsight(
          'popularity',
          'info',
          'Concentrated Usage Pattern',
          `${usageDistribution.topToolsCount} tools account for ${formatPercentage(usageDistribution.topToolsPercentage)} of all usage. Consider diversifying your approach.`,
          usageDistribution.topTools,
          {
            topToolsCount: usageDistribution.topToolsCount,
            topToolsPercentage: usageDistribution.topToolsPercentage,
          },
          'Different thinking tools are suited for different problem types. Try varying your approach.'
        )
      );
    }

    return insights;
  }

  /**
   * Gets reliability-related insights (error rates).
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Reliability insights
   */
  async getReliabilityInsights(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    const problematicTools = await this.errorTracker.getProblematicTools(
      this.options.errorRateThreshold,
      startDate,
      endDate
    );

    for (const tool of problematicTools) {
      // Skip tools with very few invocations (might be statistical noise)
      if (tool.invocationCount < this.options.minInvocationsForInsight) {
        continue;
      }

      const severity = tool.severity;
      const errorPercentage = tool.errorRate * 100;

      let title: string;
      let description: string;
      let recommendation: string;

      if (severity === 'critical') {
        title = 'Critical Error Rate';
        description = `${getToolDisplayName(tool.toolName)} has a ${formatPercentage(errorPercentage)} error rate (${tool.errorCount} errors out of ${tool.invocationCount} invocations). This significantly impacts reliability.`;
        recommendation = 'Investigate error patterns immediately. Check if there are issues with input validation or edge cases.';
      } else if (severity === 'warning') {
        title = 'Elevated Error Rate';
        description = `${getToolDisplayName(tool.toolName)} has a ${formatPercentage(errorPercentage)} error rate (${tool.errorCount} errors). This is above the recommended threshold.`;
        recommendation = 'Review recent error patterns to identify common causes.';
      } else {
        title = 'Error Rate Notice';
        description = `${getToolDisplayName(tool.toolName)} has a ${formatPercentage(errorPercentage)} error rate. While within acceptable limits, monitoring is recommended.`;
        recommendation = 'Keep an eye on this tool\'s error patterns.';
      }

      // Add error category context
      if (tool.mostCommonErrorCategory) {
        description += ` Most errors are ${tool.mostCommonErrorCategory} errors.`;
      }

      insights.push(
        createInsight(
          'reliability',
          severity,
          title,
          description,
          [tool.toolName],
          {
            errorRate: errorPercentage,
            errorCount: tool.errorCount,
            invocationCount: tool.invocationCount,
            mostCommonErrorCategory: tool.mostCommonErrorCategory || 'unknown',
          },
          recommendation
        )
      );
    }

    // If no problematic tools, add a healthy status insight
    const stats = await this.aggregator.getUsageStats(startDate, endDate);
    if (problematicTools.length === 0 && stats.totalInvocations >= this.options.minInvocationsForInsight) {
      insights.push(
        createInsight(
          'reliability',
          'info',
          'Healthy Error Rates',
          `All tools are operating within acceptable error rate thresholds (< ${formatPercentage(this.options.errorRateThreshold * 100)}). Overall error rate is ${formatPercentage(stats.overallErrorRate)}.`,
          [],
          {
            overallErrorRate: stats.overallErrorRate,
            threshold: this.options.errorRateThreshold * 100,
          }
        )
      );
    }

    return insights;
  }

  /**
   * Gets performance-related insights (response times).
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Performance insights
   */
  async getPerformanceInsights(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsInsight[]> {
    const stats = await this.aggregator.getUsageStats(startDate, endDate);
    const insights: AnalyticsInsight[] = [];

    if (stats.totalInvocations < this.options.minInvocationsForInsight) {
      return insights;
    }

    // Find slow tools
    const slowTools = stats.toolMetrics.filter(
      (m) =>
        m.avgDurationMs > this.options.slowResponseThreshold &&
        m.invocationCount >= this.options.minInvocationsForInsight
    );

    for (const tool of slowTools) {
      const severity: InsightSeverity =
        tool.avgDurationMs > this.options.slowResponseThreshold * 3
          ? 'warning'
          : 'info';

      insights.push(
        createInsight(
          'performance',
          severity,
          severity === 'warning' ? 'Slow Response Time' : 'Response Time Notice',
          `${getToolDisplayName(tool.toolName)} has an average response time of ${formatDuration(tool.avgDurationMs)} (P95: ${formatDuration(tool.p95DurationMs)}). This may impact user experience.`,
          [tool.toolName],
          {
            avgDurationMs: tool.avgDurationMs,
            p95DurationMs: tool.p95DurationMs,
            minDurationMs: tool.minDurationMs,
            maxDurationMs: tool.maxDurationMs,
          },
          'Complex mental models and multi-perspective tools naturally take longer. Consider this expected behavior for thorough analysis.'
        )
      );
    }

    // Fastest tool
    const fastestTool = stats.toolMetrics
      .filter((m) => m.invocationCount >= this.options.minInvocationsForInsight)
      .sort((a, b) => a.avgDurationMs - b.avgDurationMs)[0];

    if (fastestTool && fastestTool.avgDurationMs < 100) {
      insights.push(
        createInsight(
          'performance',
          'info',
          'Fastest Tool',
          `${getToolDisplayName(fastestTool.toolName)} is your fastest tool with an average response time of ${formatDuration(fastestTool.avgDurationMs)}.`,
          [fastestTool.toolName],
          {
            avgDurationMs: fastestTool.avgDurationMs,
          }
        )
      );
    }

    return insights;
  }

  /**
   * Gets trend-related insights (usage changes over time).
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Trend insights
   */
  async getTrendInsights(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsInsight[]> {
    const stats = await this.aggregator.getUsageStats(startDate, endDate);
    const insights: AnalyticsInsight[] = [];

    if (stats.totalInvocations < this.options.minInvocationsForInsight) {
      return insights;
    }

    // Analyze trends for each tool
    for (const trend of stats.trends) {
      // Need enough data points for meaningful trends
      if (trend.dataPoints.length < 3) {
        continue;
      }

      const totalInvocations = trend.dataPoints.reduce((sum, dp) => sum + dp.count, 0);
      if (totalInvocations < this.options.minInvocationsForInsight) {
        continue;
      }

      const absChange = Math.abs(trend.changePercentage);
      if (absChange < this.options.trendChangeThreshold) {
        continue; // Not significant enough
      }

      if (trend.trend === 'increasing') {
        insights.push(
          createInsight(
            'trend',
            'info',
            'Growing Tool Usage',
            `${getToolDisplayName(trend.toolName)} usage has increased by ${formatPercentage(trend.changePercentage)} over the analysis period. This tool is becoming more central to your workflow.`,
            [trend.toolName],
            {
              changePercentage: trend.changePercentage,
              trend: trend.trend,
              dataPoints: trend.dataPoints.length,
            }
          )
        );
      } else if (trend.trend === 'decreasing') {
        insights.push(
          createInsight(
            'trend',
            'info',
            'Declining Tool Usage',
            `${getToolDisplayName(trend.toolName)} usage has decreased by ${formatPercentage(Math.abs(trend.changePercentage))} over the analysis period. You might be shifting to other approaches.`,
            [trend.toolName],
            {
              changePercentage: trend.changePercentage,
              trend: trend.trend,
              dataPoints: trend.dataPoints.length,
            },
            'Consider if this tool still serves your needs or if you\'ve found better alternatives.'
          )
        );
      }
    }

    // Overall usage trend
    const errorTrend = await this.errorTracker.getErrorTrend(startDate, endDate);
    if (errorTrend.trend === 'increasing' && Math.abs(errorTrend.changePercentage) > this.options.trendChangeThreshold) {
      insights.push(
        createInsight(
          'trend',
          'warning',
          'Increasing Error Trend',
          `Error rates have increased by ${formatPercentage(errorTrend.changePercentage)} over the analysis period. This trend should be monitored.`,
          [],
          {
            changePercentage: errorTrend.changePercentage,
            averageErrorRate: errorTrend.averageErrorRate * 100,
            trend: errorTrend.trend,
          },
          'Review recent changes and error patterns to identify the cause.'
        )
      );
    } else if (errorTrend.trend === 'decreasing' && Math.abs(errorTrend.changePercentage) > this.options.trendChangeThreshold) {
      insights.push(
        createInsight(
          'trend',
          'info',
          'Improving Error Trend',
          `Error rates have decreased by ${formatPercentage(Math.abs(errorTrend.changePercentage))} over the analysis period. Great progress!`,
          [],
          {
            changePercentage: errorTrend.changePercentage,
            averageErrorRate: errorTrend.averageErrorRate * 100,
            trend: errorTrend.trend,
          }
        )
      );
    }

    return insights;
  }

  /**
   * Gets a quick summary of insights.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Insights summary
   */
  async getSummary(
    startDate?: string,
    endDate?: string
  ): Promise<InsightsSummary> {
    const report = await this.generateReport(startDate, endDate);
    const stats = await this.aggregator.getUsageStats(startDate, endDate);

    // Find most popular tool
    const mostPopularTool =
      stats.popularityRanking.length > 0 ? stats.popularityRanking[0] : null;

    // Find tool needing most attention (highest severity reliability insight)
    const reliabilityInsights = report.insights.filter((i) => i.category === 'reliability');
    const criticalReliability = reliabilityInsights.find((i) => i.severity === 'critical');
    const warningReliability = reliabilityInsights.find((i) => i.severity === 'warning');
    const toolNeedingAttention =
      criticalReliability?.affectedTools[0] ||
      warningReliability?.affectedTools[0] ||
      null;

    // Determine health status
    const healthStatus = determineHealthStatus(
      report.summary.criticalCount,
      report.summary.warningCount
    );

    // Generate one-liner
    let oneLiner: string;
    if (stats.totalInvocations === 0) {
      oneLiner = 'No analytics data collected yet. Start using the thinking tools!';
    } else if (healthStatus === 'critical') {
      oneLiner = `${report.summary.criticalCount} critical issue(s) detected. Immediate attention recommended.`;
    } else if (healthStatus === 'needs-attention') {
      oneLiner = `${report.summary.warningCount} warning(s) detected. Review recommended.`;
    } else {
      oneLiner = `All systems healthy. ${mostPopularTool ? `${mostPopularTool} is your most-used tool.` : ''}`;
    }

    return {
      totalInsights: report.summary.totalInsights,
      criticalCount: report.summary.criticalCount,
      warningCount: report.summary.warningCount,
      infoCount: report.summary.infoCount,
      mostPopularTool,
      toolNeedingAttention,
      healthStatus,
      oneLiner,
    };
  }

  /**
   * Formats insights for display.
   *
   * @param insights - Insights to format
   * @returns Formatted insights
   */
  formatInsights(insights: AnalyticsInsight[]): FormattedInsight[] {
    return insights.map((insight) => ({
      icon: INSIGHT_ICONS[insight.category][insight.severity],
      title: insight.title,
      description: insight.description,
      recommendation: insight.recommendation,
      severity: insight.severity,
      category: insight.category,
    }));
  }

  /**
   * Generates a formatted text report.
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Formatted text report
   */
  async generateTextReport(
    startDate?: string,
    endDate?: string
  ): Promise<string> {
    const report = await this.generateReport(startDate, endDate);
    const summary = await this.getSummary(startDate, endDate);
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('ANALYTICS INSIGHTS REPORT');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Period: ${report.periodStart} to ${report.periodEnd}`);
    lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
    lines.push('');
    lines.push(`Status: ${summary.healthStatus.toUpperCase()}`);
    lines.push(summary.oneLiner);
    lines.push('');

    // Summary counts
    lines.push('-'.repeat(60));
    lines.push('SUMMARY');
    lines.push('-'.repeat(60));
    lines.push(`Total Insights: ${report.summary.totalInsights}`);
    if (report.summary.criticalCount > 0) {
      lines.push(`  Critical: ${report.summary.criticalCount}`);
    }
    if (report.summary.warningCount > 0) {
      lines.push(`  Warnings: ${report.summary.warningCount}`);
    }
    lines.push(`  Info: ${report.summary.infoCount}`);
    lines.push('');

    // Group insights by category
    const categories: InsightCategory[] = ['reliability', 'performance', 'popularity', 'trend'];
    for (const category of categories) {
      const categoryInsights = report.insights.filter((i) => i.category === category);
      if (categoryInsights.length === 0) {
        continue;
      }

      lines.push('-'.repeat(60));
      lines.push(category.toUpperCase());
      lines.push('-'.repeat(60));

      for (const insight of categoryInsights) {
        const icon = INSIGHT_ICONS[insight.category][insight.severity];
        lines.push('');
        lines.push(`${icon} [${insight.severity.toUpperCase()}] ${insight.title}`);
        lines.push(`   ${insight.description}`);
        if (insight.recommendation) {
          lines.push(`   Recommendation: ${insight.recommendation}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Calculates usage distribution statistics.
   */
  private calculateUsageDistribution(
    toolMetrics: ToolMetrics[],
    totalInvocations: number
  ): {
    isConcentrated: boolean;
    topToolsCount: number;
    topToolsPercentage: number;
    topTools: ToolName[];
  } {
    if (toolMetrics.length <= 2 || totalInvocations === 0) {
      return {
        isConcentrated: false,
        topToolsCount: 0,
        topToolsPercentage: 0,
        topTools: [],
      };
    }

    // Sort by usage
    const sorted = [...toolMetrics].sort((a, b) => b.invocationCount - a.invocationCount);

    // Check if top 2 tools account for > 80% of usage
    const top2Count = sorted.slice(0, 2).reduce((sum, m) => sum + m.invocationCount, 0);
    const top2Percentage = (top2Count / totalInvocations) * 100;

    if (top2Percentage > 80) {
      return {
        isConcentrated: true,
        topToolsCount: 2,
        topToolsPercentage: top2Percentage,
        topTools: sorted.slice(0, 2).map((m) => m.toolName),
      };
    }

    return {
      isConcentrated: false,
      topToolsCount: 2,
      topToolsPercentage: top2Percentage,
      topTools: sorted.slice(0, 2).map((m) => m.toolName),
    };
  }
}

// =============================================================================
// Tool Usage Suggestions
// =============================================================================

/**
 * Gets a usage suggestion for a tool.
 */
function getToolUsageSuggestion(toolName: ToolName): string {
  const suggestions: Record<ToolName, string> = {
    trace: 'breaking down complex problems into manageable steps',
    model: 'applying mental models to understand situations',
    pattern: 'recognizing patterns in problems and solutions',
    paradigm: 'exploring different paradigms and perspectives',
    debug: 'systematically debugging issues',
    council: 'getting multiple perspectives on a problem',
    decide: 'making structured decisions with frameworks',
    reflect: 'reflecting on your thinking process',
    hypothesis: 'generating and testing hypotheses',
    debate: 'exploring arguments from multiple angles',
    map: 'mapping concepts and their relationships',
  };
  return suggestions[toolName] || 'exploring its unique capabilities';
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance.
 */
let defaultInsightsGenerator: InsightsGenerator | null = null;

/**
 * Gets the default insights generator instance.
 *
 * @returns The default insights generator
 */
export function getInsightsGenerator(): InsightsGenerator {
  if (defaultInsightsGenerator === null) {
    defaultInsightsGenerator = new InsightsGenerator();
  }
  return defaultInsightsGenerator;
}

/**
 * Resets the default insights generator.
 * Useful for testing.
 */
export function resetInsightsGenerator(): void {
  defaultInsightsGenerator = null;
}

/**
 * Creates a new insights generator with custom options.
 *
 * @param options - Generator options
 * @returns New insights generator instance
 */
export function createInsightsGenerator(
  options?: InsightsGeneratorOptions
): InsightsGenerator {
  return new InsightsGenerator(options);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Generates an insights report using the default generator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Insights report
 */
export async function generateInsightsReport(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsInsightsReport> {
  return getInsightsGenerator().generateReport(startDate, endDate);
}

/**
 * Gets popularity insights using the default generator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Popularity insights
 */
export async function getPopularityInsights(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsInsight[]> {
  return getInsightsGenerator().getPopularityInsights(startDate, endDate);
}

/**
 * Gets reliability insights using the default generator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Reliability insights
 */
export async function getReliabilityInsights(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsInsight[]> {
  return getInsightsGenerator().getReliabilityInsights(startDate, endDate);
}

/**
 * Gets performance insights using the default generator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Performance insights
 */
export async function getPerformanceInsights(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsInsight[]> {
  return getInsightsGenerator().getPerformanceInsights(startDate, endDate);
}

/**
 * Gets trend insights using the default generator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Trend insights
 */
export async function getTrendInsights(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsInsight[]> {
  return getInsightsGenerator().getTrendInsights(startDate, endDate);
}

/**
 * Gets an insights summary using the default generator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Insights summary
 */
export async function getInsightsSummary(
  startDate?: string,
  endDate?: string
): Promise<InsightsSummary> {
  return getInsightsGenerator().getSummary(startDate, endDate);
}

/**
 * Generates a text report using the default generator.
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Text report
 */
export async function generateTextReport(
  startDate?: string,
  endDate?: string
): Promise<string> {
  return getInsightsGenerator().generateTextReport(startDate, endDate);
}
