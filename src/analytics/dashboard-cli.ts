/**
 * Analytics Dashboard CLI
 *
 * Provides a command-line dashboard for viewing analytics insights:
 * - Tool usage summary with popularity ranking
 * - Error rates per tool with severity indicators
 * - Usage trends with directional arrows
 * - Time range filtering support
 *
 * Uses chalk for colored terminal output.
 *
 * Usage:
 * ```bash
 * think-mcp analytics dashboard
 * think-mcp analytics dashboard --days 7
 * think-mcp analytics dashboard --days 30 --no-color
 * ```
 */

import chalk from 'chalk';
import { ToolName } from '../toolNames.js';
import { getConsentStatus } from './consent.js';
import { getConfigManager } from './config.js';
import { getAggregator } from './aggregator.js';
import {
  getInsightsGenerator,
  InsightsSummary,
} from './insights.js';
import {
  getErrorTracker,
  ProblematicTool,
} from './errors.js';
import {
  UsageStats,
  TrendDirection,
  AnalyticsInsight,
} from './types.js';

// =============================================================================
// CLI Result Type (defined here to avoid circular imports)
// =============================================================================

/**
 * Result of a CLI command execution.
 */
interface CliResult {
  /**
   * Whether the command succeeded.
   */
  success: boolean;

  /**
   * Output message to display to user.
   */
  message: string;

  /**
   * Exit code for the command (0 for success, non-zero for failure).
   */
  exitCode: number;

  /**
   * Optional data payload for programmatic use.
   */
  data?: Record<string, unknown>;
}

// =============================================================================
// Types
// =============================================================================

/**
 * Options for the dashboard command.
 */
export interface DashboardOptions {
  /**
   * Number of days to look back for analytics.
   * @default 30
   */
  days?: number;

  /**
   * Whether to disable colored output.
   * @default false
   */
  noColor?: boolean;

  /**
   * Whether to show detailed insights.
   * @default false
   */
  detailed?: boolean;
}

/**
 * Dashboard rendering context with color support.
 */
interface DashboardContext {
  /**
   * Chalk instance (may be disabled).
   */
  chalk: typeof chalk;

  /**
   * Start date for the analysis period.
   */
  startDate: string;

  /**
   * End date for the analysis period.
   */
  endDate: string;

  /**
   * Number of days in the analysis period.
   */
  days: number;

  /**
   * Whether to show detailed output.
   */
  detailed: boolean;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default number of days for dashboard analysis.
 */
const DEFAULT_DAYS = 30;

/**
 * Box drawing characters for terminal UI.
 */
const BOX = {
  topLeft: '\u250C',
  topRight: '\u2510',
  bottomLeft: '\u2514',
  bottomRight: '\u2518',
  horizontal: '\u2500',
  vertical: '\u2502',
  teeRight: '\u251C',
  teeLeft: '\u2524',
  teeDown: '\u252C',
  teeUp: '\u2534',
  cross: '\u253C',
};

/**
 * Trend arrows for directional indicators.
 */
const TREND_ARROWS: Record<TrendDirection, string> = {
  increasing: '\u2191', // Up arrow
  decreasing: '\u2193', // Down arrow
  stable: '\u2192',     // Right arrow (stable)
};

/**
 * Severity icons for error rate indicators.
 */
const SEVERITY_ICONS = {
  critical: '\u274C',  // X mark
  warning: '\u26A0\uFE0F',   // Warning
  info: '\u2139\uFE0F',      // Info
  healthy: '\u2705',   // Check mark
};

// =============================================================================
// Formatting Helpers
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
 * Pads a string to a specified width.
 */
function padEnd(str: string, width: number): string {
  const stripped = stripAnsi(str);
  const padding = Math.max(0, width - stripped.length);
  return str + ' '.repeat(padding);
}

/**
 * Pads a string to a specified width (right-aligned).
 */
function padStart(str: string, width: number): string {
  const stripped = stripAnsi(str);
  const padding = Math.max(0, width - stripped.length);
  return ' '.repeat(padding) + str;
}

/**
 * Centers a string within a specified width.
 */
function center(str: string, width: number): string {
  const stripped = stripAnsi(str);
  const padding = Math.max(0, width - stripped.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
}

/**
 * Strips ANSI escape codes from a string.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * Formats a percentage for display.
 */
function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with thousands separators.
 */
function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Formats duration in milliseconds for display.
 */
function formatDuration(ms: number): string {
  if (ms < 1) {
    return '<1ms';
  }
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Creates a horizontal line.
 */
function horizontalLine(width: number, char: string = BOX.horizontal): string {
  return char.repeat(width);
}

/**
 * Creates a table row with borders.
 */
function tableRow(
  cells: string[],
  widths: number[],
  ctx: DashboardContext
): string {
  const paddedCells = cells.map((cell, i) => padEnd(cell, widths[i]));
  return `${BOX.vertical} ${paddedCells.join(' ' + BOX.vertical + ' ')} ${BOX.vertical}`;
}

/**
 * Creates a table header separator.
 */
function tableHeaderSeparator(widths: number[]): string {
  const cells = widths.map((w) => horizontalLine(w));
  return `${BOX.teeRight}${horizontalLine(1)}${cells.join(horizontalLine(1) + BOX.cross + horizontalLine(1))}${horizontalLine(1)}${BOX.teeLeft}`;
}

/**
 * Creates a table top border.
 */
function tableTop(widths: number[]): string {
  const cells = widths.map((w) => horizontalLine(w));
  return `${BOX.topLeft}${horizontalLine(1)}${cells.join(horizontalLine(1) + BOX.teeDown + horizontalLine(1))}${horizontalLine(1)}${BOX.topRight}`;
}

/**
 * Creates a table bottom border.
 */
function tableBottom(widths: number[]): string {
  const cells = widths.map((w) => horizontalLine(w));
  return `${BOX.bottomLeft}${horizontalLine(1)}${cells.join(horizontalLine(1) + BOX.teeUp + horizontalLine(1))}${horizontalLine(1)}${BOX.bottomRight}`;
}

/**
 * Gets colored trend arrow based on direction.
 */
function getTrendArrow(
  trend: TrendDirection,
  ctx: DashboardContext
): string {
  const arrow = TREND_ARROWS[trend];
  switch (trend) {
    case 'increasing':
      return ctx.chalk.green(arrow);
    case 'decreasing':
      return ctx.chalk.red(arrow);
    case 'stable':
    default:
      return ctx.chalk.gray(arrow);
  }
}

/**
 * Gets colored error rate based on severity.
 */
function getColoredErrorRate(
  errorRate: number,
  ctx: DashboardContext
): string {
  const formatted = formatPercentage(errorRate);
  if (errorRate >= 25) {
    return ctx.chalk.red.bold(formatted);
  }
  if (errorRate >= 10) {
    return ctx.chalk.yellow(formatted);
  }
  if (errorRate >= 5) {
    return ctx.chalk.cyan(formatted);
  }
  return ctx.chalk.green(formatted);
}

/**
 * Gets health status icon based on error rate.
 */
function getHealthIcon(errorRate: number): string {
  if (errorRate >= 25) {
    return SEVERITY_ICONS.critical;
  }
  if (errorRate >= 10) {
    return SEVERITY_ICONS.warning;
  }
  if (errorRate >= 5) {
    return SEVERITY_ICONS.info;
  }
  return SEVERITY_ICONS.healthy;
}

// =============================================================================
// Dashboard Sections
// =============================================================================

/**
 * Renders the dashboard header.
 */
function renderHeader(ctx: DashboardContext): string[] {
  const lines: string[] = [];
  const title = 'ANALYTICS DASHBOARD';
  const width = 70;

  lines.push('');
  lines.push(ctx.chalk.bold.cyan(horizontalLine(width, '=')));
  lines.push(ctx.chalk.bold.cyan(center(title, width)));
  lines.push(ctx.chalk.bold.cyan(horizontalLine(width, '=')));
  lines.push('');
  lines.push(ctx.chalk.gray(`  Period: ${ctx.startDate} to ${ctx.endDate} (${ctx.days} days)`));
  lines.push(ctx.chalk.gray(`  Generated: ${new Date().toLocaleString()}`));
  lines.push('');

  return lines;
}

/**
 * Renders the summary section.
 */
function renderSummary(
  stats: UsageStats,
  summary: InsightsSummary,
  ctx: DashboardContext
): string[] {
  const lines: string[] = [];

  lines.push(ctx.chalk.bold.white('  SUMMARY'));
  lines.push(ctx.chalk.gray('  ' + horizontalLine(66, '-')));
  lines.push('');

  // Health status with icon
  const healthIcon = summary.healthStatus === 'healthy'
    ? SEVERITY_ICONS.healthy
    : summary.healthStatus === 'critical'
      ? SEVERITY_ICONS.critical
      : SEVERITY_ICONS.warning;

  const healthColor = summary.healthStatus === 'healthy'
    ? ctx.chalk.green
    : summary.healthStatus === 'critical'
      ? ctx.chalk.red
      : ctx.chalk.yellow;

  lines.push(`  ${healthIcon}  ${healthColor.bold(summary.healthStatus.toUpperCase())}: ${summary.oneLiner}`);
  lines.push('');

  // Stats grid
  const statsGrid = [
    ['Total Invocations', formatNumber(stats.totalInvocations)],
    ['Unique Sessions', formatNumber(stats.uniqueSessions)],
    ['Success Rate', formatPercentage(100 - stats.overallErrorRate)],
    ['Error Rate', formatPercentage(stats.overallErrorRate)],
  ];

  for (const [label, value] of statsGrid) {
    lines.push(`  ${ctx.chalk.gray(padEnd(label + ':', 22))} ${ctx.chalk.white(value)}`);
  }

  lines.push('');

  // Insight counts
  if (summary.totalInsights > 0) {
    const counts: string[] = [];
    if (summary.criticalCount > 0) {
      counts.push(ctx.chalk.red(`${summary.criticalCount} critical`));
    }
    if (summary.warningCount > 0) {
      counts.push(ctx.chalk.yellow(`${summary.warningCount} warnings`));
    }
    if (summary.infoCount > 0) {
      counts.push(ctx.chalk.cyan(`${summary.infoCount} info`));
    }
    lines.push(`  ${ctx.chalk.gray('Insights:')}         ${counts.join(', ')}`);
    lines.push('');
  }

  return lines;
}

/**
 * Renders the tool usage table.
 */
function renderToolUsageTable(
  stats: UsageStats,
  trends: Map<ToolName, TrendDirection>,
  ctx: DashboardContext
): string[] {
  const lines: string[] = [];

  lines.push(ctx.chalk.bold.white('  TOOL USAGE'));
  lines.push(ctx.chalk.gray('  ' + horizontalLine(66, '-')));
  lines.push('');

  if (stats.toolMetrics.length === 0) {
    lines.push(ctx.chalk.gray('  No tool usage data available.'));
    lines.push('');
    return lines;
  }

  // Sort by invocation count
  const sortedTools = [...stats.toolMetrics].sort(
    (a, b) => b.invocationCount - a.invocationCount
  );

  // Table column widths
  const widths = [12, 10, 10, 10, 10, 6];
  const headers = ['Tool', 'Uses', 'Success', 'Errors', 'Avg Time', 'Trend'];

  // Render table
  lines.push('  ' + tableTop(widths));
  lines.push(
    '  ' +
      tableRow(
        headers.map((h) => ctx.chalk.bold(h)),
        widths,
        ctx
      )
  );
  lines.push('  ' + tableHeaderSeparator(widths));

  for (const tool of sortedTools) {
    const trend = trends.get(tool.toolName) ?? 'stable';
    const cells = [
      tool.toolName,
      formatNumber(tool.invocationCount),
      ctx.chalk.green(formatNumber(tool.successCount)),
      tool.errorCount > 0
        ? ctx.chalk.red(formatNumber(tool.errorCount))
        : ctx.chalk.gray('0'),
      formatDuration(tool.avgDurationMs),
      getTrendArrow(trend, ctx),
    ];
    lines.push('  ' + tableRow(cells, widths, ctx));
  }

  lines.push('  ' + tableBottom(widths));
  lines.push('');

  return lines;
}

/**
 * Renders the error rates table.
 */
function renderErrorRatesTable(
  stats: UsageStats,
  problematicTools: ProblematicTool[],
  ctx: DashboardContext
): string[] {
  const lines: string[] = [];

  lines.push(ctx.chalk.bold.white('  ERROR RATES'));
  lines.push(ctx.chalk.gray('  ' + horizontalLine(66, '-')));
  lines.push('');

  // Filter tools with invocations
  const toolsWithData = stats.toolMetrics.filter((m) => m.invocationCount > 0);

  if (toolsWithData.length === 0) {
    lines.push(ctx.chalk.gray('  No error data available.'));
    lines.push('');
    return lines;
  }

  // Sort by error rate
  const sortedByErrorRate = [...toolsWithData].sort(
    (a, b) => b.errorRate - a.errorRate
  );

  // Table column widths
  const widths = [12, 12, 8, 8, 16];
  const headers = ['Tool', 'Error Rate', 'Errors', 'Total', 'Status'];

  // Render table
  lines.push('  ' + tableTop(widths));
  lines.push(
    '  ' +
      tableRow(
        headers.map((h) => ctx.chalk.bold(h)),
        widths,
        ctx
      )
  );
  lines.push('  ' + tableHeaderSeparator(widths));

  for (const tool of sortedByErrorRate) {
    const healthIcon = getHealthIcon(tool.errorRate);
    const statusText =
      tool.errorRate >= 25
        ? 'Critical'
        : tool.errorRate >= 10
          ? 'Warning'
          : tool.errorRate >= 5
            ? 'Monitor'
            : 'Healthy';

    const cells = [
      tool.toolName,
      getColoredErrorRate(tool.errorRate, ctx),
      tool.errorCount > 0
        ? ctx.chalk.red(formatNumber(tool.errorCount))
        : ctx.chalk.gray('0'),
      formatNumber(tool.invocationCount),
      `${healthIcon} ${statusText}`,
    ];
    lines.push('  ' + tableRow(cells, widths, ctx));
  }

  lines.push('  ' + tableBottom(widths));
  lines.push('');

  return lines;
}

/**
 * Renders the insights section.
 */
function renderInsights(
  insights: AnalyticsInsight[],
  ctx: DashboardContext
): string[] {
  const lines: string[] = [];

  lines.push(ctx.chalk.bold.white('  INSIGHTS'));
  lines.push(ctx.chalk.gray('  ' + horizontalLine(66, '-')));
  lines.push('');

  if (insights.length === 0) {
    lines.push(ctx.chalk.gray('  No insights available. Continue using the tools to generate insights.'));
    lines.push('');
    return lines;
  }

  // Show top insights (limit to 5 unless detailed mode)
  const maxInsights = ctx.detailed ? insights.length : 5;
  const displayedInsights = insights.slice(0, maxInsights);

  for (const insight of displayedInsights) {
    // Icon based on severity
    let icon: string;
    let severityColor: typeof ctx.chalk;
    switch (insight.severity) {
      case 'critical':
        icon = SEVERITY_ICONS.critical;
        severityColor = ctx.chalk.red;
        break;
      case 'warning':
        icon = SEVERITY_ICONS.warning;
        severityColor = ctx.chalk.yellow;
        break;
      default:
        icon = SEVERITY_ICONS.info;
        severityColor = ctx.chalk.cyan;
    }

    lines.push(`  ${icon}  ${severityColor.bold(insight.title)}`);
    lines.push(`      ${ctx.chalk.white(insight.description)}`);
    if (insight.recommendation && ctx.detailed) {
      lines.push(`      ${ctx.chalk.gray('Recommendation:')} ${insight.recommendation}`);
    }
    lines.push('');
  }

  if (insights.length > maxInsights) {
    lines.push(ctx.chalk.gray(`  ... and ${insights.length - maxInsights} more insights. Use --detailed to see all.`));
    lines.push('');
  }

  return lines;
}

/**
 * Renders the trends section.
 */
function renderTrends(
  stats: UsageStats,
  ctx: DashboardContext
): string[] {
  const lines: string[] = [];

  lines.push(ctx.chalk.bold.white('  USAGE TRENDS'));
  lines.push(ctx.chalk.gray('  ' + horizontalLine(66, '-')));
  lines.push('');

  const trends = stats.trends;
  if (trends.length === 0) {
    lines.push(ctx.chalk.gray('  Not enough data for trend analysis.'));
    lines.push('');
    return lines;
  }

  // Group trends by direction
  const increasing = trends.filter((t) => t.trend === 'increasing');
  const decreasing = trends.filter((t) => t.trend === 'decreasing');
  const stable = trends.filter((t) => t.trend === 'stable');

  // Show trending up
  if (increasing.length > 0) {
    const items = increasing
      .sort((a, b) => b.changePercentage - a.changePercentage)
      .slice(0, 3)
      .map((t) => `${t.toolName} (+${t.changePercentage.toFixed(0)}%)`)
      .join(', ');
    lines.push(`  ${ctx.chalk.green(TREND_ARROWS.increasing)} ${ctx.chalk.green.bold('Growing:')}    ${items}`);
  }

  // Show trending down
  if (decreasing.length > 0) {
    const items = decreasing
      .sort((a, b) => a.changePercentage - b.changePercentage)
      .slice(0, 3)
      .map((t) => `${t.toolName} (${t.changePercentage.toFixed(0)}%)`)
      .join(', ');
    lines.push(`  ${ctx.chalk.red(TREND_ARROWS.decreasing)} ${ctx.chalk.red.bold('Declining:')}  ${items}`);
  }

  // Show stable
  if (stable.length > 0) {
    const items = stable.slice(0, 3).map((t) => t.toolName).join(', ');
    lines.push(`  ${ctx.chalk.gray(TREND_ARROWS.stable)} ${ctx.chalk.gray.bold('Stable:')}     ${items}`);
  }

  lines.push('');

  return lines;
}

/**
 * Renders the footer with commands reference.
 */
function renderFooter(ctx: DashboardContext): string[] {
  const lines: string[] = [];

  lines.push(ctx.chalk.gray('  ' + horizontalLine(66, '-')));
  lines.push(ctx.chalk.gray('  Commands:'));
  lines.push(ctx.chalk.gray('    think-mcp analytics status    - View analytics settings'));
  lines.push(ctx.chalk.gray('    think-mcp analytics export    - Export raw data'));
  lines.push(ctx.chalk.gray('    think-mcp analytics dashboard --days N  - Change time period'));
  lines.push('');

  return lines;
}

// =============================================================================
// Main Dashboard Command
// =============================================================================

/**
 * Displays the analytics dashboard.
 *
 * @param options - Dashboard options
 * @returns CLI result
 */
export async function showDashboard(
  options: DashboardOptions = {}
): Promise<CliResult> {
  const { days = DEFAULT_DAYS, noColor = false, detailed = false } = options;

  try {
    // Check if analytics is enabled
    const config = getConfigManager().getConfig();
    const consentStatus = getConsentStatus();

    if (!config.enabled || !consentStatus.hasConsented) {
      const message = [
        '',
        'Analytics is currently disabled.',
        '',
        'To enable analytics and start collecting usage data:',
        '  think-mcp analytics enable',
        '',
        'Your privacy is respected - only tool usage metadata is collected.',
        'No content or personal information is ever captured.',
        '',
      ].join('\n');

      return {
        success: true,
        message,
        exitCode: 0,
      };
    }

    // Create context
    const endDate = getTodayDateString();
    const startDate = getDaysAgoDateString(days);
    const ctx: DashboardContext = {
      chalk: noColor ? new chalk.Instance({ level: 0 }) : chalk,
      startDate,
      endDate,
      days,
      detailed,
    };

    // Fetch data
    const aggregator = getAggregator();
    const insightsGenerator = getInsightsGenerator();
    const errorTracker = getErrorTracker();

    const [stats, insightsSummary, report, problematicTools] = await Promise.all([
      aggregator.getUsageStats(startDate, endDate),
      insightsGenerator.getSummary(startDate, endDate),
      insightsGenerator.generateReport(startDate, endDate),
      errorTracker.getProblematicTools(0.05, startDate, endDate),
    ]);

    // Build trend map
    const trends = new Map<ToolName, TrendDirection>();
    for (const trend of stats.trends) {
      trends.set(trend.toolName, trend.trend);
    }

    // Render dashboard sections
    const sections: string[][] = [];
    sections.push(renderHeader(ctx));
    sections.push(renderSummary(stats, insightsSummary, ctx));
    sections.push(renderToolUsageTable(stats, trends, ctx));
    sections.push(renderErrorRatesTable(stats, problematicTools, ctx));
    sections.push(renderTrends(stats, ctx));
    sections.push(renderInsights(report.insights, ctx));
    sections.push(renderFooter(ctx));

    // Combine all sections
    const output = sections.flat().join('\n');

    return {
      success: true,
      message: output,
      exitCode: 0,
      data: {
        stats,
        insights: report.insights,
        summary: insightsSummary,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to generate dashboard: ${message}`,
      exitCode: 1,
    };
  }
}

// =============================================================================
// CLI Argument Parsing
// =============================================================================

/**
 * Parsed dashboard arguments.
 */
export interface ParsedDashboardArgs {
  /**
   * Number of days to analyze.
   */
  days: number;

  /**
   * Whether to disable colors.
   */
  noColor: boolean;

  /**
   * Whether to show detailed output.
   */
  detailed: boolean;

  /**
   * Whether help was requested.
   */
  showHelp: boolean;
}

/**
 * Parses dashboard command arguments.
 *
 * @param args - Command-line arguments
 * @returns Parsed arguments
 */
export function parseDashboardArgs(args: string[]): ParsedDashboardArgs {
  const result: ParsedDashboardArgs = {
    days: DEFAULT_DAYS,
    noColor: false,
    detailed: false,
    showHelp: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.showHelp = true;
    } else if (arg === '--days' || arg === '-d') {
      const value = args[i + 1];
      if (value && !value.startsWith('-')) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed > 0) {
          result.days = parsed;
        }
        i++;
      }
    } else if (arg === '--no-color') {
      result.noColor = true;
    } else if (arg === '--detailed' || arg === '--verbose' || arg === '-v') {
      result.detailed = true;
    }
  }

  return result;
}

/**
 * Gets help text for the dashboard command.
 */
export function getDashboardHelpText(): string {
  return `
think-mcp analytics dashboard - View analytics insights

USAGE:
  think-mcp analytics dashboard [options]

OPTIONS:
  --days, -d <n>    Number of days to analyze (default: 30)
  --detailed, -v    Show detailed insights and recommendations
  --no-color        Disable colored output
  --help, -h        Show this help message

EXAMPLES:
  think-mcp analytics dashboard
  think-mcp analytics dashboard --days 7
  think-mcp analytics dashboard --detailed
  think-mcp analytics dashboard --days 14 --no-color

SECTIONS:
  Summary        Overall health status and key metrics
  Tool Usage     Usage counts per tool with trends
  Error Rates    Error rates per tool with severity
  Usage Trends   Trending up/down/stable tools
  Insights       Actionable insights and recommendations
`.trim();
}

/**
 * Runs the dashboard command with arguments.
 *
 * @param args - Command-line arguments
 * @returns CLI result
 */
export async function runDashboardCommand(args: string[]): Promise<CliResult> {
  const parsed = parseDashboardArgs(args);

  if (parsed.showHelp) {
    return {
      success: true,
      message: getDashboardHelpText(),
      exitCode: 0,
    };
  }

  return showDashboard({
    days: parsed.days,
    noColor: parsed.noColor,
    detailed: parsed.detailed,
  });
}

// =============================================================================
// Exports
// =============================================================================

export {
  DEFAULT_DAYS,
  TREND_ARROWS,
  SEVERITY_ICONS,
};
