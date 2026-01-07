/**
 * Analytics Export Wrapper for Web Dashboard
 *
 * This module provides a bridge between the web dashboard and the analytics
 * export functionality from the main src/analytics module.
 *
 * In development, this will attempt to import from the built analytics module.
 * In production or when the module is unavailable, it returns null to trigger
 * the mock data fallback in the API route.
 *
 * Note: The actual analytics data is stored locally on the user's machine
 * at ~/.think-mcp/analytics/. This API is designed for local maintainer access.
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Dashboard export options.
 */
export interface DashboardExportOptions {
  startDate?: string;
  endDate?: string;
  includeRawEvents?: boolean;
  includeStats?: boolean;
  includeInsights?: boolean;
  includeErrors?: boolean;
  includeTrends?: boolean;
  prettyPrint?: boolean;
}

/**
 * Export result interface.
 */
export interface ExportResult {
  success: boolean;
  data?: Record<string, unknown>;
  json?: string;
  error?: string;
}

/**
 * Path to the analytics directory.
 */
const ANALYTICS_DIR = process.env.THINK_MCP_ANALYTICS_DIR
  ?? path.join(process.env.HOME ?? "~", ".think-mcp", "analytics");

/**
 * Checks if analytics data directory exists.
 */
function analyticsDirectoryExists(): boolean {
  try {
    return fs.existsSync(ANALYTICS_DIR);
  } catch {
    return false;
  }
}

/**
 * Reads analytics files from the local directory.
 */
function readAnalyticsFiles(startDate: string, endDate: string): unknown[] {
  if (!analyticsDirectoryExists()) {
    return [];
  }

  const events: unknown[] = [];
  const files = fs.readdirSync(ANALYTICS_DIR);

  for (const file of files) {
    // Only process analytics files
    if (!file.startsWith("analytics-") || !file.endsWith(".json")) {
      continue;
    }

    // Extract date from filename (analytics-YYYY-MM-DD.json)
    const dateMatch = file.match(/analytics-(\d{4}-\d{2}-\d{2})\.json/);
    if (!dateMatch) {
      continue;
    }

    const fileDate = dateMatch[1];
    if (fileDate < startDate || fileDate > endDate) {
      continue;
    }

    try {
      const filePath = path.join(ANALYTICS_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);

      if (data.events && Array.isArray(data.events)) {
        events.push(...data.events);
      }
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  return events;
}

/**
 * Aggregates events into tool metrics.
 */
function aggregateToolMetrics(events: Array<Record<string, unknown>>) {
  const metrics = new Map<
    string,
    {
      invocationCount: number;
      successCount: number;
      errorCount: number;
      totalDuration: number;
    }
  >();

  for (const event of events) {
    const toolName = (event.toolName as string) ?? "unknown";
    const success = event.success !== false;
    const duration = (event.durationMs as number) ?? 0;

    if (!metrics.has(toolName)) {
      metrics.set(toolName, {
        invocationCount: 0,
        successCount: 0,
        errorCount: 0,
        totalDuration: 0,
      });
    }

    const m = metrics.get(toolName)!;
    m.invocationCount++;
    if (success) {
      m.successCount++;
    } else {
      m.errorCount++;
    }
    m.totalDuration += duration;
  }

  return Array.from(metrics.entries()).map(([toolName, m]) => ({
    toolName,
    invocationCount: m.invocationCount,
    successCount: m.successCount,
    errorCount: m.errorCount,
    errorRate: m.invocationCount > 0 ? (m.errorCount / m.invocationCount) * 100 : 0,
    avgDurationMs: m.invocationCount > 0 ? m.totalDuration / m.invocationCount : 0,
  }));
}

/**
 * Attempts to export dashboard data from local analytics files.
 *
 * This is a simplified implementation that reads directly from the analytics
 * files when the full analytics module is not available.
 */
export async function exportDashboardData(
  options: DashboardExportOptions = {}
): Promise<ExportResult> {
  try {
    const endDate = options.endDate ?? new Date().toISOString().slice(0, 10);
    const startDate =
      options.startDate ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Check if analytics directory exists
    if (!analyticsDirectoryExists()) {
      return {
        success: false,
        error: "Analytics directory not found. Analytics may not be enabled.",
      };
    }

    // Read events
    const rawEvents = readAnalyticsFiles(startDate, endDate) as Array<Record<string, unknown>>;

    if (rawEvents.length === 0) {
      return {
        success: false,
        error: "No analytics events found for the specified period.",
      };
    }

    // Aggregate metrics
    const toolMetrics = aggregateToolMetrics(rawEvents);

    const totalInvocations = toolMetrics.reduce((sum, m) => sum + m.invocationCount, 0);
    const totalErrors = toolMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const errorRate = totalInvocations > 0 ? (totalErrors / totalInvocations) * 100 : 0;

    // Get unique sessions
    const sessions = new Set(rawEvents.map((e) => e.sessionId as string).filter(Boolean));

    // Create popularity ranking
    const popularityRanking = [...toolMetrics]
      .sort((a, b) => b.invocationCount - a.invocationCount)
      .map((m, index) => ({
        toolName: m.toolName,
        count: m.invocationCount,
        percentage: totalInvocations > 0 ? (m.invocationCount / totalInvocations) * 100 : 0,
        rank: index + 1,
      }));

    // Find problematic tools
    const problematicTools = toolMetrics
      .filter((m) => m.errorRate >= 5)
      .sort((a, b) => b.errorRate - a.errorRate)
      .map((m) => ({
        toolName: m.toolName,
        errorRate: m.errorRate,
        errorCount: m.errorCount,
        invocationCount: m.invocationCount,
        severity: m.errorRate >= 25 ? "critical" : m.errorRate >= 10 ? "warning" : ("info" as const),
      }));

    // Simple trends (would need more sophisticated analysis in full version)
    const trends = toolMetrics.map((m) => ({
      toolName: m.toolName,
      trend: "stable" as const,
      percentageChange: 0,
    }));

    // Generate insights
    const insights: Array<{
      id: string;
      category: string;
      severity: "critical" | "warning" | "info";
      message: string;
      recommendation?: string;
      affectedTools?: string[];
    }> = [];

    // Add popularity insight
    if (popularityRanking[0]) {
      insights.push({
        id: "pop-1",
        category: "popularity",
        severity: "info",
        message: `${popularityRanking[0].toolName} is the most used tool with ${popularityRanking[0].percentage.toFixed(1)}% of invocations.`,
        affectedTools: [popularityRanking[0].toolName],
      });
    }

    // Add error insights
    for (const tool of problematicTools.slice(0, 3)) {
      insights.push({
        id: `err-${tool.toolName}`,
        category: "reliability",
        severity: tool.severity,
        message: `${tool.toolName} has a ${tool.errorRate.toFixed(1)}% error rate (${tool.errorCount} errors).`,
        recommendation: "Review error logs and consider improvements.",
        affectedTools: [tool.toolName],
      });
    }

    const criticalCount = insights.filter((i) => i.severity === "critical").length;
    const warningCount = insights.filter((i) => i.severity === "warning").length;

    // Build response
    const data = {
      metadata: {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        periodStart: startDate,
        periodEnd: endDate,
        periodDays: Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000)
        ),
        analyticsEnabled: true,
      },
      summary: {
        totalInvocations,
        uniqueSessions: sessions.size,
        successRate: totalInvocations > 0 ? 100 - errorRate : 100,
        errorRate,
        mostPopularTool: popularityRanking[0]?.toolName ?? null,
        highestErrorRateTool: problematicTools[0]?.toolName ?? null,
        healthStatus:
          criticalCount > 0
            ? "critical"
            : warningCount > 0
              ? "needs-attention"
              : ("healthy" as const),
        toolsUsed: toolMetrics.length,
        insightsCount: insights.length,
        criticalIssuesCount: criticalCount,
        warningsCount: warningCount,
      },
      toolMetrics,
      popularityRanking,
      trends,
      problematicTools,
      insightsReport: {
        summary: {
          totalInsights: insights.length,
          criticalCount,
          warningCount,
          infoCount: insights.filter((i) => i.severity === "info").length,
        },
        insights,
      },
    };

    return {
      success: true,
      data,
      json: JSON.stringify(data, null, 2),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during export",
    };
  }
}
