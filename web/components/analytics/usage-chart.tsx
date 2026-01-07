"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Data point for the usage chart.
 */
export interface UsageDataPoint {
  /**
   * Label for the data point (e.g., tool name).
   */
  label: string;

  /**
   * Value (count or percentage).
   */
  value: number;

  /**
   * Display value (formatted string).
   */
  displayValue?: string;

  /**
   * Optional trend indicator: increasing, decreasing, or stable.
   */
  trend?: "increasing" | "decreasing" | "stable";
}

/**
 * Props for the UsageChart component.
 */
export interface UsageChartProps {
  /**
   * Chart title.
   */
  title: string;

  /**
   * Data points to display.
   */
  data: UsageDataPoint[];

  /**
   * Maximum value for normalization.
   * If not provided, will use the max value from data.
   */
  maxValue?: number;

  /**
   * Whether to show trend indicators.
   * @default false
   */
  showTrends?: boolean;

  /**
   * Whether to show values.
   * @default true
   */
  showValues?: boolean;

  /**
   * Custom class name.
   */
  className?: string;

  /**
   * Bar color variant.
   * @default "primary"
   */
  variant?: "primary" | "success" | "warning" | "danger";
}

/**
 * Trend icon component.
 */
function TrendIcon({ trend }: { trend: "increasing" | "decreasing" | "stable" }) {
  if (trend === "increasing") {
    return (
      <svg
        className="w-4 h-4 text-emerald-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="Increasing trend"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    );
  }

  if (trend === "decreasing") {
    return (
      <svg
        className="w-4 h-4 text-rose-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="Decreasing trend"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-label="Stable trend"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  );
}

/**
 * Get bar color based on variant.
 */
function getBarColor(variant: UsageChartProps["variant"]): string {
  switch (variant) {
    case "success":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    case "danger":
      return "bg-rose-500";
    default:
      return "bg-[hsl(var(--brand-primary))]";
  }
}

/**
 * UsageChart Component
 *
 * A simple horizontal bar chart for displaying tool usage statistics.
 * Uses CSS for rendering, no charting library required.
 */
export function UsageChart({
  title,
  data,
  maxValue,
  showTrends = false,
  showValues = true,
  className,
  variant = "primary",
}: UsageChartProps) {
  // Calculate max value for normalization
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  // Get bar color
  const barColor = getBarColor(variant);

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-lg font-semibold text-white mb-4 font-[family-name:var(--font-manrope)]">
        {title}
      </h3>

      {data.length === 0 ? (
        <p className="text-slate-400 text-sm">No data available</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100;

            return (
              <div key={item.label} className="space-y-1">
                {/* Label row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    {showTrends && item.trend && <TrendIcon trend={item.trend} />}
                  </div>
                  {showValues && (
                    <span className="text-slate-400 tabular-nums">
                      {item.displayValue ?? item.value.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Bar */}
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", barColor)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    role="progressbar"
                    aria-valuenow={item.value}
                    aria-valuemax={max}
                    aria-label={`${item.label}: ${item.displayValue ?? item.value}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Props for the MiniBarChart component.
 */
export interface MiniBarChartProps {
  /**
   * Data values (will be normalized to percentages).
   */
  values: number[];

  /**
   * Bar color.
   * @default "primary"
   */
  color?: "primary" | "success" | "warning" | "danger";

  /**
   * Height of the chart.
   * @default 40
   */
  height?: number;

  /**
   * Custom class name.
   */
  className?: string;
}

/**
 * MiniBarChart Component
 *
 * A small vertical bar chart for inline trend visualization.
 */
export function MiniBarChart({
  values,
  color = "primary",
  height = 40,
  className,
}: MiniBarChartProps) {
  if (values.length === 0) {
    return null;
  }

  const max = Math.max(...values, 1);
  const barColor = getBarColor(color);

  return (
    <div
      className={cn("flex items-end gap-0.5", className)}
      style={{ height }}
      role="img"
      aria-label="Mini bar chart showing trend"
    >
      {values.map((value, index) => {
        const percentage = (value / max) * 100;

        return (
          <motion.div
            key={index}
            className={cn("flex-1 rounded-t", barColor)}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{
              duration: 0.3,
              delay: index * 0.02,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

export default UsageChart;
