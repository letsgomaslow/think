"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FeedbackSummaryResponse,
  type ToolBreakdown,
  type TrendDataPoint,
  type RatingCounts,
  calculateSatisfactionRate,
  formatDate,
} from "@/lib/feedback";

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the FeedbackStats component
 */
export interface FeedbackStatsProps {
  /** Summary data from the API */
  summary: FeedbackSummaryResponse | null;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Callback when a tool is clicked */
  onToolClick?: (toolName: string) => void;
  /** Maximum number of tools to show in breakdown */
  maxToolsToShow?: number;
  /** Whether to show the trend chart */
  showTrends?: boolean;
  /** Whether to use daily or weekly trends */
  trendType?: "daily" | "weekly";
  /** Custom class name */
  className?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Stat card component for displaying a single statistic
 */
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  colorScheme?: "default" | "green" | "red" | "yellow" | "blue";
}

function StatCard({ title, value, subtitle, colorScheme = "default" }: StatCardProps) {
  const colorClasses = {
    default: {
      border: "border-slate-700/50",
      bg: "bg-slate-800/30",
      title: "text-slate-400",
      value: "text-white",
      subtitle: "text-slate-500",
    },
    green: {
      border: "border-green-500/30",
      bg: "bg-green-500/5",
      title: "text-green-400",
      value: "text-green-400",
      subtitle: "text-green-500/70",
    },
    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      title: "text-red-400",
      value: "text-red-400",
      subtitle: "text-red-500/70",
    },
    yellow: {
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/5",
      title: "text-yellow-400",
      value: "text-yellow-400",
      subtitle: "text-yellow-500/70",
    },
    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      title: "text-blue-400",
      value: "text-blue-400",
      subtitle: "text-blue-500/70",
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <Card className={`${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium ${colors.title}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colors.value}`}>{value}</div>
        {subtitle && <p className={`text-xs mt-1 ${colors.subtitle}`}>{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for stat cards
 */
function StatCardSkeleton() {
  return (
    <Card className="border-slate-700/50 bg-slate-800/30">
      <CardContent className="p-6">
        <Skeleton className="w-24 h-4 mb-3" />
        <Skeleton className="w-16 h-8 mb-2" />
        <Skeleton className="w-20 h-3" />
      </CardContent>
    </Card>
  );
}

/**
 * Rating ratio bar visualization showing thumbs up/down distribution
 */
interface RatioBarProps {
  positive: number;
  negative: number;
  className?: string;
}

function RatioBar({ positive, negative, className = "" }: RatioBarProps) {
  const total = positive + negative;
  const positivePercent = total > 0 ? (positive / total) * 100 : 50;
  const negativePercent = total > 0 ? (negative / total) * 100 : 50;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-green-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {positive} ({positivePercent.toFixed(0)}%)
        </span>
        <span className="text-red-400 flex items-center gap-1">
          {negative} ({negativePercent.toFixed(0)}%)
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
          </svg>
        </span>
      </div>
      <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${positivePercent}%` }}
          aria-label={`${positivePercent.toFixed(0)}% positive feedback`}
        />
        <div
          className="bg-red-500 transition-all duration-500"
          style={{ width: `${negativePercent}%` }}
          aria-label={`${negativePercent.toFixed(0)}% negative feedback`}
        />
      </div>
    </div>
  );
}

/**
 * Tool breakdown horizontal bar chart
 */
interface ToolBreakdownChartProps {
  tools: ToolBreakdown[];
  maxTools?: number;
  onToolClick?: (toolName: string) => void;
}

function ToolBreakdownChart({ tools, maxTools = 5, onToolClick }: ToolBreakdownChartProps) {
  const displayTools = tools.slice(0, maxTools);
  const maxTotal = Math.max(...displayTools.map((t) => t.total), 1);

  if (displayTools.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No tool breakdown data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayTools.map((tool) => {
        const positiveWidth = (tool.ratings["thumbs-up"] / maxTotal) * 100;
        const negativeWidth = (tool.ratings["thumbs-down"] / maxTotal) * 100;
        const issueWidth = (tool.ratings["issue-report"] / maxTotal) * 100;

        return (
          <div
            key={tool.toolName}
            className={`group ${onToolClick ? "cursor-pointer" : ""}`}
            onClick={() => onToolClick?.(tool.toolName)}
            onKeyDown={(e) => {
              if (onToolClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onToolClick(tool.toolName);
              }
            }}
            tabIndex={onToolClick ? 0 : undefined}
            role={onToolClick ? "button" : undefined}
            aria-label={
              onToolClick ? `Filter by ${tool.toolName}: ${tool.total} total feedback` : undefined
            }
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-sm font-medium text-slate-300 ${
                  onToolClick ? "group-hover:text-white transition-colors" : ""
                }`}
              >
                {tool.toolName}
              </span>
              <span className="text-xs text-slate-500">{tool.total}</span>
            </div>
            <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${positiveWidth}%` }}
                title={`${tool.ratings["thumbs-up"]} positive`}
              />
              <div
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${negativeWidth}%` }}
                title={`${tool.ratings["thumbs-down"]} negative`}
              />
              <div
                className="bg-yellow-500 transition-all duration-300"
                style={{ width: `${issueWidth}%` }}
                title={`${tool.ratings["issue-report"]} issues`}
              />
            </div>
          </div>
        );
      })}
      {tools.length > maxTools && (
        <p className="text-xs text-slate-500 text-center pt-2">
          +{tools.length - maxTools} more tools
        </p>
      )}
    </div>
  );
}

/**
 * Trend mini chart showing feedback volume over time
 */
interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
}

function TrendChart({ data, height = 80 }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">No trend data available</div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.total), 1);
  const barWidth = 100 / data.length;

  // Calculate recent trend (last week vs previous week)
  const recentData = data.slice(-7);
  const previousData = data.slice(-14, -7);
  const recentTotal = recentData.reduce((sum, d) => sum + d.total, 0);
  const previousTotal = previousData.reduce((sum, d) => sum + d.total, 0);
  const trendPercent =
    previousTotal > 0 ? Math.round(((recentTotal - previousTotal) / previousTotal) * 100) : 0;
  const trendDirection = trendPercent > 0 ? "up" : trendPercent < 0 ? "down" : "flat";

  return (
    <div className="space-y-3">
      {/* Trend Indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Recent Activity</span>
        <div className="flex items-center gap-1">
          {trendDirection === "up" && (
            <>
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-sm text-green-400">+{trendPercent}%</span>
            </>
          )}
          {trendDirection === "down" && (
            <>
              <svg
                className="w-4 h-4 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
              <span className="text-sm text-red-400">{trendPercent}%</span>
            </>
          )}
          {trendDirection === "flat" && (
            <span className="text-sm text-slate-400">No change</span>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div
        className="relative flex items-end gap-px"
        style={{ height: `${height}px` }}
        role="img"
        aria-label="Feedback trend chart"
      >
        {data.map((point, index) => {
          const barHeight = (point.total / maxValue) * 100;
          const isRecent = index >= data.length - 7;

          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center group"
              title={`${formatDate(point.date)}: ${point.total} feedback`}
            >
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isRecent ? "bg-blue-500" : "bg-slate-600"
                } group-hover:opacity-80`}
                style={{ height: `${Math.max(barHeight, 2)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Date Labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>{data.length > 0 ? formatDate(data[0].date) : ""}</span>
        <span>{data.length > 0 ? formatDate(data[data.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

/**
 * Satisfaction rate gauge component
 */
interface SatisfactionGaugeProps {
  rate: number | null;
}

function SatisfactionGauge({ rate }: SatisfactionGaugeProps) {
  if (rate === null) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <span className="text-slate-500 text-sm">No rating data</span>
      </div>
    );
  }

  // Determine color based on rate
  const getColor = (r: number) => {
    if (r >= 80) return { text: "text-green-400", bg: "bg-green-500" };
    if (r >= 60) return { text: "text-yellow-400", bg: "bg-yellow-500" };
    return { text: "text-red-400", bg: "bg-red-500" };
  };

  const colors = getColor(rate);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={colors.bg}
            strokeDasharray={`${rate * 2.51} 251`}
            style={{ transition: "stroke-dasharray 0.5s ease-out" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${colors.text}`}>{rate}%</span>
        </div>
      </div>
      <span className="text-sm text-slate-400">Satisfaction Rate</span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Feedback statistics component with aggregated data display, charts, and trends.
 *
 * Features:
 * - Overview stat cards (total, positive, negative, issue reports)
 * - Satisfaction rate gauge
 * - Thumbs up/down ratio bar visualization
 * - Per-tool breakdown horizontal bar chart
 * - Recent trend chart with direction indicator
 * - Loading states with skeletons
 */
export function FeedbackStats({
  summary,
  isLoading = false,
  onToolClick,
  maxToolsToShow = 5,
  showTrends = true,
  trendType = "daily",
  className = "",
}: FeedbackStatsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        {/* Stats Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <Skeleton className="w-32 h-5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="w-full h-3" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-full h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <Skeleton className="w-32 h-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-20" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No data state
  if (!summary) {
    return (
      <div className={className}>
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">
              📊
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Statistics Available</h3>
            <p className="text-slate-400">
              Statistics will appear here once feedback has been submitted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const satisfactionRate = calculateSatisfactionRate(summary.ratingCounts);
  const trendData = trendType === "daily" ? summary.trends.daily : summary.trends.weekly;

  return (
    <div className={className}>
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Feedback"
          value={summary.totalFeedback}
          subtitle={`${summary.toolBreakdown.length} tools`}
          colorScheme="default"
        />
        <StatCard
          title="Positive"
          value={summary.ratingCounts["thumbs-up"]}
          subtitle={`${summary.ratingPercentages["thumbs-up"]}% of total`}
          colorScheme="green"
        />
        <StatCard
          title="Negative"
          value={summary.ratingCounts["thumbs-down"]}
          subtitle={`${summary.ratingPercentages["thumbs-down"]}% of total`}
          colorScheme="red"
        />
        <StatCard
          title="Issue Reports"
          value={summary.ratingCounts["issue-report"]}
          subtitle={`${summary.ratingPercentages["issue-report"]}% of total`}
          colorScheme="yellow"
        />
      </div>

      {/* Ratio Bar and Satisfaction Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-slate-700/50 bg-slate-800/30 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Positive vs Negative Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RatioBar
              positive={summary.ratingCounts["thumbs-up"]}
              negative={summary.ratingCounts["thumbs-down"]}
            />
          </CardContent>
        </Card>
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardContent className="p-6 flex items-center justify-center">
            <SatisfactionGauge rate={satisfactionRate} />
          </CardContent>
        </Card>
      </div>

      {/* Tool Breakdown and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Breakdown Chart */}
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400">
              Feedback by Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ToolBreakdownChart
              tools={summary.toolBreakdown}
              maxTools={maxToolsToShow}
              onToolClick={onToolClick}
            />
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-400">Positive</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-400">Negative</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-slate-400">Issues</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        {showTrends && (
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-400">
                {trendType === "daily" ? "Daily Feedback Trend" : "Weekly Feedback Trend"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={trendData} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Time Range Info */}
      {summary.timeRange.earliest && summary.timeRange.latest && (
        <div className="mt-6 text-center text-xs text-slate-500">
          Data from {formatDate(summary.timeRange.earliest)} to{" "}
          {formatDate(summary.timeRange.latest)}
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for the entire stats section
 */
export function FeedbackStatsSkeleton() {
  return (
    <FeedbackStats summary={null} isLoading={true} />
  );
}

// ============================================================================
// Exported Sub-components for Composition
// ============================================================================

export {
  StatCard,
  StatCardSkeleton,
  RatioBar,
  ToolBreakdownChart,
  TrendChart,
  SatisfactionGauge,
};
