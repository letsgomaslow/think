/**
 * Analytics API Route
 *
 * Provides analytics data for the web dashboard.
 * This endpoint requires local file system access to read analytics data.
 *
 * GET /api/analytics?days=30
 *
 * Query parameters:
 * - days: Number of days to include in the analysis (default: 30)
 *
 * Returns:
 * - 200: Analytics data as JSON
 * - 404: No analytics data available (disabled or no data)
 * - 500: Server error
 */

import { NextRequest, NextResponse } from "next/server";

// Import from analytics module (server-side only)
// Note: These imports will only work when the analytics module is available
// in the server environment. For production, you may need to adjust paths.
let exportModule: typeof import("../../../lib/analytics-export") | null = null;

async function getExportModule() {
  if (exportModule) {
    return exportModule;
  }
  try {
    // Dynamic import to handle cases where module might not be available
    exportModule = await import("../../../lib/analytics-export");
    return exportModule;
  } catch {
    return null;
  }
}

/**
 * Generate mock data for development/demo when analytics module is unavailable.
 */
function generateMockData(days: number) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const tools = [
    "think",
    "reflect",
    "map",
    "trace",
    "debug",
    "decide",
    "council",
    "debate",
    "hypothesis",
    "pattern",
    "model",
    "paradigm",
  ];

  // Generate random but realistic-looking metrics
  const toolMetrics = tools.map((tool, index) => {
    const invocationCount = Math.floor(Math.random() * 500) + 50;
    const errorCount = Math.floor(invocationCount * (Math.random() * 0.15));
    return {
      toolName: tool,
      invocationCount,
      successCount: invocationCount - errorCount,
      errorCount,
      errorRate: (errorCount / invocationCount) * 100,
      avgDurationMs: Math.floor(Math.random() * 500) + 100,
    };
  });

  const totalInvocations = toolMetrics.reduce((sum, m) => sum + m.invocationCount, 0);
  const totalErrors = toolMetrics.reduce((sum, m) => sum + m.errorCount, 0);

  const popularityRanking = toolMetrics
    .sort((a, b) => b.invocationCount - a.invocationCount)
    .map((m, index) => ({
      toolName: m.toolName,
      count: m.invocationCount,
      percentage: (m.invocationCount / totalInvocations) * 100,
      rank: index + 1,
    }));

  const trends: Array<{
    toolName: string;
    trend: "increasing" | "decreasing" | "stable";
    percentageChange: number;
  }> = tools.map((tool) => ({
    toolName: tool,
    trend: ["increasing", "decreasing", "stable"][Math.floor(Math.random() * 3)] as
      | "increasing"
      | "decreasing"
      | "stable",
    percentageChange: Math.floor(Math.random() * 40) - 20,
  }));

  // Generate daily counts for trend chart
  const dailyCounts = tools.map((tool) => {
    const periods = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      periods.push({
        date: date.toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 30) + 5,
      });
    }
    return {
      toolName: tool,
      periods,
      trend: trends.find((t) => t.toolName === tool)?.trend ?? "stable",
    };
  });

  // Find problematic tools
  const problematicTools = toolMetrics
    .filter((m) => m.errorRate >= 5)
    .sort((a, b) => b.errorRate - a.errorRate)
    .map((m) => ({
      toolName: m.toolName,
      errorRate: m.errorRate,
      errorCount: m.errorCount,
      invocationCount: m.invocationCount,
      severity:
        m.errorRate >= 25 ? "critical" : m.errorRate >= 10 ? "warning" : ("info" as const),
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
      message: `${popularityRanking[0].toolName} is the most popular tool with ${popularityRanking[0].percentage.toFixed(1)}% of all usage.`,
      recommendation: "Consider highlighting this tool in documentation.",
      affectedTools: [popularityRanking[0].toolName],
    });
  }

  // Add error insights for problematic tools
  problematicTools.slice(0, 2).forEach((tool, index) => {
    insights.push({
      id: `err-${index}`,
      category: "reliability",
      severity: tool.severity,
      message: `${tool.toolName} has a ${tool.errorRate.toFixed(1)}% error rate.`,
      recommendation: "Investigate error patterns and consider improvements.",
      affectedTools: [tool.toolName],
    });
  });

  // Add trend insight
  const growingTools = trends.filter((t) => t.trend === "increasing");
  if (growingTools.length > 0) {
    insights.push({
      id: "trend-1",
      category: "trend",
      severity: "info",
      message: `${growingTools.length} tool${growingTools.length > 1 ? "s" : ""} showing increased usage.`,
      affectedTools: growingTools.map((t) => t.toolName),
    });
  }

  const criticalCount = insights.filter((i) => i.severity === "critical").length;
  const warningCount = insights.filter((i) => i.severity === "warning").length;
  const infoCount = insights.filter((i) => i.severity === "info").length;

  return {
    metadata: {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      periodStart: startDate.toISOString().slice(0, 10),
      periodEnd: endDate.toISOString().slice(0, 10),
      periodDays: days,
      analyticsEnabled: true,
    },
    summary: {
      totalInvocations,
      uniqueSessions: Math.floor(totalInvocations / 10),
      successRate: ((totalInvocations - totalErrors) / totalInvocations) * 100,
      errorRate: (totalErrors / totalInvocations) * 100,
      mostPopularTool: popularityRanking[0]?.toolName ?? null,
      highestErrorRateTool: problematicTools[0]?.toolName ?? null,
      healthStatus:
        criticalCount > 0
          ? "critical"
          : warningCount > 0
            ? "needs-attention"
            : ("healthy" as const),
      toolsUsed: tools.length,
      insightsCount: insights.length,
      criticalIssuesCount: criticalCount,
      warningsCount: warningCount,
    },
    toolMetrics,
    popularityRanking,
    dailyCounts,
    trends,
    problematicTools,
    insightsReport: {
      summary: {
        totalInsights: insights.length,
        criticalCount,
        warningCount,
        infoCount,
      },
      insights,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = Math.min(Math.max(parseInt(searchParams.get("days") ?? "30", 10), 1), 365);

    // Try to get real analytics data
    const module = await getExportModule();

    if (module && typeof module.exportDashboardData === "function") {
      // Use real analytics export
      const result = await module.exportDashboardData({
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        includeRawEvents: false,
        includeStats: true,
        includeInsights: true,
        includeErrors: true,
        includeTrends: true,
      });

      if (!result.success || !result.data) {
        // No data available
        return NextResponse.json(
          {
            error: "No analytics data available",
            message: result.error ?? "Analytics may not be enabled",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(result.data, {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      });
    }

    // Fall back to mock data for development/demo
    const mockData = generateMockData(days);

    return NextResponse.json(mockData, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Data-Source": "mock", // Indicate this is mock data
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
