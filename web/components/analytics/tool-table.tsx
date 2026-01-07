"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

/**
 * Tool metrics data for the table.
 */
export interface ToolMetric {
  /**
   * Tool name.
   */
  name: string;

  /**
   * Total invocation count.
   */
  invocations: number;

  /**
   * Success count.
   */
  successes: number;

  /**
   * Error count.
   */
  errors: number;

  /**
   * Error rate as percentage (0-100).
   */
  errorRate: number;

  /**
   * Average response time in milliseconds.
   */
  avgResponseTime?: number;

  /**
   * Usage trend.
   */
  trend?: "increasing" | "decreasing" | "stable";
}

/**
 * Props for the ToolTable component.
 */
export interface ToolTableProps {
  /**
   * Table title.
   */
  title: string;

  /**
   * Tool metrics data.
   */
  data: ToolMetric[];

  /**
   * Custom class name.
   */
  className?: string;

  /**
   * Whether to show the response time column.
   * @default true
   */
  showResponseTime?: boolean;

  /**
   * Whether to animate rows.
   * @default true
   */
  animate?: boolean;
}

/**
 * Get severity badge props based on error rate.
 */
function getSeverityBadge(errorRate: number): {
  label: string;
  className: string;
} {
  if (errorRate >= 25) {
    return {
      label: "Critical",
      className: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    };
  }
  if (errorRate >= 10) {
    return {
      label: "Warning",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
  }
  if (errorRate >= 5) {
    return {
      label: "Monitor",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
  }
  return {
    label: "Healthy",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
}

/**
 * Trend indicator icon.
 */
function TrendIndicator({ trend }: { trend: "increasing" | "decreasing" | "stable" }) {
  if (trend === "increasing") {
    return (
      <span className="inline-flex items-center text-emerald-400" title="Increasing usage">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      </span>
    );
  }

  if (trend === "decreasing") {
    return (
      <span className="inline-flex items-center text-rose-400" title="Decreasing usage">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-slate-400" title="Stable usage">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    </span>
  );
}

/**
 * Format response time for display.
 */
function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * ToolTable Component
 *
 * A table component displaying tool metrics including invocation counts,
 * error rates, response times, and trends.
 */
export function ToolTable({
  title,
  data,
  className,
  showResponseTime = true,
  animate = true,
}: ToolTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-lg font-semibold text-white mb-4 font-[family-name:var(--font-manrope)]">
        {title}
      </h3>

      {data.length === 0 ? (
        <p className="text-slate-400 text-sm">No data available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 font-medium py-3 pr-4">Tool</th>
                <th className="text-right text-slate-400 font-medium py-3 px-4">Uses</th>
                <th className="text-right text-slate-400 font-medium py-3 px-4">Errors</th>
                <th className="text-right text-slate-400 font-medium py-3 px-4">Error Rate</th>
                {showResponseTime && (
                  <th className="text-right text-slate-400 font-medium py-3 px-4">Avg Time</th>
                )}
                <th className="text-center text-slate-400 font-medium py-3 pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tool, index) => {
                const severity = getSeverityBadge(tool.errorRate);

                const rowContent = (
                  <>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-medium">{tool.name}</span>
                        {tool.trend && <TrendIndicator trend={tool.trend} />}
                      </div>
                    </td>
                    <td className="text-right text-slate-300 py-3 px-4 tabular-nums">
                      {tool.invocations.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      <span className={cn(tool.errors > 0 ? "text-rose-400" : "text-slate-500")}>
                        {tool.errors.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      <span
                        className={cn(
                          tool.errorRate >= 25
                            ? "text-rose-400"
                            : tool.errorRate >= 10
                              ? "text-amber-400"
                              : tool.errorRate >= 5
                                ? "text-blue-400"
                                : "text-slate-400"
                        )}
                      >
                        {tool.errorRate.toFixed(1)}%
                      </span>
                    </td>
                    {showResponseTime && (
                      <td className="text-right text-slate-400 py-3 px-4 tabular-nums">
                        {tool.avgResponseTime !== undefined
                          ? formatResponseTime(tool.avgResponseTime)
                          : "-"}
                      </td>
                    )}
                    <td className="text-center py-3 pl-4">
                      <Badge className={cn("text-xs", severity.className)}>
                        {severity.label}
                      </Badge>
                    </td>
                  </>
                );

                if (animate) {
                  return (
                    <motion.tr
                      key={tool.name}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.03,
                      }}
                    >
                      {rowContent}
                    </motion.tr>
                  );
                }

                return (
                  <tr
                    key={tool.name}
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    {rowContent}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Props for the ErrorRateCard component.
 */
export interface ErrorRateCardProps {
  /**
   * Tool name.
   */
  toolName: string;

  /**
   * Error rate percentage.
   */
  errorRate: number;

  /**
   * Error count.
   */
  errorCount: number;

  /**
   * Total invocation count.
   */
  totalInvocations: number;

  /**
   * Custom class name.
   */
  className?: string;
}

/**
 * ErrorRateCard Component
 *
 * A compact card showing error rate for a single tool.
 * Useful for highlighting problematic tools.
 */
export function ErrorRateCard({
  toolName,
  errorRate,
  errorCount,
  totalInvocations,
  className,
}: ErrorRateCardProps) {
  const severity = getSeverityBadge(errorRate);

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-slate-800/50 border-slate-700/50",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-200 font-medium">{toolName}</span>
        <Badge className={cn("text-xs", severity.className)}>{severity.label}</Badge>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              errorRate >= 25
                ? "text-rose-400"
                : errorRate >= 10
                  ? "text-amber-400"
                  : errorRate >= 5
                    ? "text-blue-400"
                    : "text-emerald-400"
            )}
          >
            {errorRate.toFixed(1)}%
          </span>
          <span className="text-slate-500 text-sm ml-1">error rate</span>
        </div>

        <div className="text-right text-sm">
          <div className="text-slate-400">
            {errorCount.toLocaleString()} / {totalInvocations.toLocaleString()}
          </div>
          <div className="text-slate-500">errors / total</div>
        </div>
      </div>

      {/* Visual error bar */}
      <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            errorRate >= 25
              ? "bg-rose-500"
              : errorRate >= 10
                ? "bg-amber-500"
                : errorRate >= 5
                  ? "bg-blue-500"
                  : "bg-emerald-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(errorRate, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default ToolTable;
