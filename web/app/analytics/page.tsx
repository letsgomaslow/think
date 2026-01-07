"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsageChart, MiniBarChart, UsageDataPoint } from "@/components/analytics/usage-chart";
import { ToolTable, ToolMetric, ErrorRateCard } from "@/components/analytics/tool-table";
import { Footer } from "@/components/sections/footer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Dashboard data structure matching export.ts DashboardExportData.
 */
interface DashboardData {
  metadata: {
    version: string;
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
    periodDays: number;
    analyticsEnabled: boolean;
  };
  summary: {
    totalInvocations: number;
    uniqueSessions: number;
    successRate: number;
    errorRate: number;
    mostPopularTool: string | null;
    highestErrorRateTool: string | null;
    healthStatus: "healthy" | "needs-attention" | "critical";
    toolsUsed: number;
    insightsCount: number;
    criticalIssuesCount: number;
    warningsCount: number;
  };
  toolMetrics?: Array<{
    toolName: string;
    invocationCount: number;
    successCount: number;
    errorCount: number;
    errorRate: number;
    avgDurationMs: number;
  }>;
  popularityRanking?: Array<{
    toolName: string;
    count: number;
    percentage: number;
    rank: number;
  }>;
  dailyCounts?: Array<{
    toolName: string;
    periods: Array<{
      date: string;
      count: number;
    }>;
    trend: "increasing" | "decreasing" | "stable";
  }>;
  trends?: Array<{
    toolName: string;
    trend: "increasing" | "decreasing" | "stable";
    percentageChange: number;
  }>;
  insightsReport?: {
    summary: {
      totalInsights: number;
      criticalCount: number;
      warningCount: number;
      infoCount: number;
    };
    insights: Array<{
      id: string;
      category: string;
      severity: "critical" | "warning" | "info";
      message: string;
      recommendation?: string;
      affectedTools?: string[];
    }>;
  };
  problematicTools?: Array<{
    toolName: string;
    errorRate: number;
    errorCount: number;
    invocationCount: number;
    severity: "critical" | "warning" | "info";
  }>;
}

/**
 * Loading skeleton component.
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/50 rounded-xl border border-slate-700/50" />
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-800/50 rounded-xl border border-slate-700/50" />
        <div className="h-80 bg-slate-800/50 rounded-xl border border-slate-700/50" />
      </div>

      {/* Table skeleton */}
      <div className="h-96 bg-slate-800/50 rounded-xl border border-slate-700/50" />
    </div>
  );
}

/**
 * No data available component.
 */
function NoDataMessage({ message, suggestion }: { message: string; suggestion?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
      <div className="w-20 h-20 mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-manrope)]">
        {message}
      </h2>

      {suggestion && <p className="text-slate-400 max-w-md mb-6">{suggestion}</p>}

      <div className="space-y-3 text-sm text-slate-500">
        <p>To enable analytics, run in your terminal:</p>
        <code className="block bg-slate-800/50 text-slate-300 px-4 py-2 rounded-lg font-mono">
          think-mcp analytics enable
        </code>
      </div>
    </div>
  );
}

/**
 * Summary stat card component.
 */
function StatCard({
  title,
  value,
  description,
  variant = "default",
  icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
}) {
  const variantStyles = {
    default: "border-slate-700/50",
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    danger: "border-rose-500/30 bg-rose-500/5",
  };

  const valueStyles = {
    default: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-rose-400",
  };

  return (
    <Card className={cn("bg-slate-800/50", variantStyles[variant])}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-slate-400">{title}</CardDescription>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold tabular-nums", valueStyles[variant])}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Health status badge component.
 */
function HealthBadge({ status }: { status: "healthy" | "needs-attention" | "critical" }) {
  const styles = {
    healthy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "needs-attention": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };

  const labels = {
    healthy: "Healthy",
    "needs-attention": "Needs Attention",
    critical: "Critical",
  };

  return <Badge className={cn("text-xs", styles[status])}>{labels[status]}</Badge>;
}

/**
 * Insight card component.
 */
function InsightCard({
  insight,
}: {
  insight: {
    id: string;
    category: string;
    severity: "critical" | "warning" | "info";
    message: string;
    recommendation?: string;
    affectedTools?: string[];
  };
}) {
  const severityStyles = {
    critical: "border-l-rose-500 bg-rose-500/5",
    warning: "border-l-amber-500 bg-amber-500/5",
    info: "border-l-blue-500 bg-blue-500/5",
  };

  const severityIcons = {
    critical: (
      <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border border-slate-700/50 border-l-4",
        severityStyles[insight.severity]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{severityIcons[insight.severity]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-300 capitalize">
              {insight.category}
            </span>
          </div>
          <p className="text-slate-200 text-sm">{insight.message}</p>
          {insight.recommendation && (
            <p className="text-slate-400 text-sm mt-2">
              <span className="font-medium">Recommendation:</span> {insight.recommendation}
            </p>
          )}
          {insight.affectedTools && insight.affectedTools.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {insight.affectedTools.map((tool) => (
                <Badge
                  key={tool}
                  variant="outline"
                  className="text-xs bg-slate-700/50 text-slate-300"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics Dashboard Page
 *
 * Displays tool usage analytics including:
 * - Summary statistics
 * - Usage charts
 * - Error rate tables
 * - Trend indicators
 * - Insights and recommendations
 */
export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics?days=${days}`);

      if (!response.ok) {
        if (response.status === 404) {
          setData(null);
          setError("no-data");
          return;
        }
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform tool metrics to chart data
  const usageChartData: UsageDataPoint[] =
    data?.popularityRanking?.map((item) => {
      const trend = data.trends?.find((t) => t.toolName === item.toolName)?.trend;
      return {
        label: item.toolName,
        value: item.count,
        displayValue: `${item.count.toLocaleString()} (${item.percentage.toFixed(1)}%)`,
        trend,
      };
    }) ?? [];

  // Transform tool metrics to table data
  const tableData: ToolMetric[] =
    data?.toolMetrics?.map((metric) => {
      const trend = data.trends?.find((t) => t.toolName === metric.toolName)?.trend;
      return {
        name: metric.toolName,
        invocations: metric.invocationCount,
        successes: metric.successCount,
        errors: metric.errorCount,
        errorRate: metric.errorRate,
        avgResponseTime: metric.avgDurationMs,
        trend,
      };
    }) ?? [];

  // Get daily trend data for mini chart
  const getDailyTrendValues = (toolName: string): number[] => {
    const toolCounts = data?.dailyCounts?.find((d) => d.toolName === toolName);
    if (!toolCounts) return [];
    return toolCounts.periods.slice(-14).map((p) => p.count);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-dark))]">
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[hsl(var(--brand-primary))] hover:text-[hsl(var(--brand-primary)/0.8)] mb-4 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-manrope)]">
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-2">
                Tool usage insights and performance metrics
              </p>
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="days" className="text-sm text-slate-400">
                Period:
              </label>
              <select
                id="days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.5)]"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingSkeleton />
          ) : error === "no-data" || !data ? (
            <NoDataMessage
              message="No Analytics Data Available"
              suggestion="Analytics tracking is not enabled or no data has been collected yet. Enable analytics to start tracking tool usage."
            />
          ) : error ? (
            <NoDataMessage message="Error Loading Analytics" suggestion={error} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Period info */}
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>
                  {data.metadata.periodStart} to {data.metadata.periodEnd}
                </span>
                <span>({data.metadata.periodDays} days)</span>
                <HealthBadge status={data.summary.healthStatus} />
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Invocations"
                  value={data.summary.totalInvocations}
                  description={`${data.summary.toolsUsed} tools used`}
                  icon={
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  }
                />
                <StatCard
                  title="Success Rate"
                  value={`${data.summary.successRate.toFixed(1)}%`}
                  description={`${data.summary.uniqueSessions} sessions`}
                  variant={data.summary.successRate >= 95 ? "success" : data.summary.successRate >= 85 ? "warning" : "danger"}
                  icon={
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
                <StatCard
                  title="Error Rate"
                  value={`${data.summary.errorRate.toFixed(1)}%`}
                  description={data.summary.highestErrorRateTool ? `Highest: ${data.summary.highestErrorRateTool}` : undefined}
                  variant={data.summary.errorRate <= 5 ? "success" : data.summary.errorRate <= 15 ? "warning" : "danger"}
                  icon={
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
                <StatCard
                  title="Insights"
                  value={data.summary.insightsCount}
                  description={
                    data.summary.criticalIssuesCount > 0
                      ? `${data.summary.criticalIssuesCount} critical, ${data.summary.warningsCount} warnings`
                      : data.summary.warningsCount > 0
                        ? `${data.summary.warningsCount} warnings`
                        : "All systems normal"
                  }
                  variant={data.summary.criticalIssuesCount > 0 ? "danger" : data.summary.warningsCount > 0 ? "warning" : "success"}
                  icon={
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Charts section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage chart */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white font-[family-name:var(--font-manrope)]">
                      Tool Usage
                    </CardTitle>
                    <CardDescription>Invocations by tool</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UsageChart
                      title=""
                      data={usageChartData.slice(0, 10)}
                      showTrends={true}
                      className="mt-0"
                    />
                  </CardContent>
                </Card>

                {/* Problematic tools */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white font-[family-name:var(--font-manrope)]">
                      Tools Needing Attention
                    </CardTitle>
                    <CardDescription>Tools with high error rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.problematicTools && data.problematicTools.length > 0 ? (
                      <div className="space-y-3">
                        {data.problematicTools.slice(0, 4).map((tool) => (
                          <ErrorRateCard
                            key={tool.toolName}
                            toolName={tool.toolName}
                            errorRate={tool.errorRate}
                            errorCount={tool.errorCount}
                            totalInvocations={tool.invocationCount}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <svg
                          className="w-12 h-12 text-emerald-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-slate-300 font-medium">All tools healthy!</p>
                        <p className="text-slate-500 text-sm mt-1">
                          No tools with concerning error rates
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tool metrics table */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white font-[family-name:var(--font-manrope)]">
                    Tool Metrics
                  </CardTitle>
                  <CardDescription>Detailed performance by tool</CardDescription>
                </CardHeader>
                <CardContent>
                  <ToolTable title="" data={tableData} />
                </CardContent>
              </Card>

              {/* Insights section */}
              {data.insightsReport && data.insightsReport.insights.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white font-[family-name:var(--font-manrope)]">
                          Insights & Recommendations
                        </CardTitle>
                        <CardDescription>
                          {data.insightsReport.summary.totalInsights} insight
                          {data.insightsReport.summary.totalInsights !== 1 ? "s" : ""} generated
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {data.insightsReport.summary.criticalCount > 0 && (
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                            {data.insightsReport.summary.criticalCount} Critical
                          </Badge>
                        )}
                        {data.insightsReport.summary.warningCount > 0 && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {data.insightsReport.summary.warningCount} Warning
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.insightsReport.insights
                        .sort((a, b) => {
                          const severityOrder = { critical: 0, warning: 1, info: 2 };
                          return severityOrder[a.severity] - severityOrder[b.severity];
                        })
                        .slice(0, 8)
                        .map((insight) => (
                          <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Footer info */}
              <div className="text-center text-slate-500 text-sm pt-4">
                <p>
                  Data generated at{" "}
                  {new Date(data.metadata.generatedAt).toLocaleString()}
                </p>
                <p className="mt-1">
                  Export format v{data.metadata.version} | Privacy-respecting analytics
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
