/**
 * Analytics CLI Commands
 *
 * Provides command-line interface for managing analytics:
 * - enable: Opt in to analytics collection
 * - disable: Opt out of analytics collection
 * - status: View current analytics settings and data
 * - export: Export collected analytics data
 * - clear: Delete all collected analytics data
 *
 * All commands respect user privacy and follow opt-in principles.
 */

import {
  getConsentStatus,
  grantConsent,
  withdrawConsent,
} from './consent.js';
import { getConfigManager } from './config.js';
import { getStorageAdapter, StorageInfo } from './storage.js';
import {
  PRIVACY_NOTICE_BRIEF,
  PRIVACY_NOTICE_FULL,
  ANALYTICS_ENABLED_MESSAGE,
  ANALYTICS_DISABLED_MESSAGE,
  ANALYTICS_DISABLED_WITH_DATA_DELETED_MESSAGE,
  DATA_COLLECTION_TABLE,
  CLI_QUICK_REFERENCE,
  PRIVACY_NOTICE_VERSION,
} from './PRIVACY_NOTICE.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of a CLI command execution.
 */
export interface CliResult {
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

/**
 * Options for the disable command.
 */
export interface DisableOptions {
  /**
   * Whether to delete all collected data when disabling.
   * @default false
   */
  deleteData?: boolean;
}

/**
 * Options for the export command.
 */
export interface ExportOptions {
  /**
   * Export format (json or csv).
   * @default 'json'
   */
  format?: 'json' | 'csv';

  /**
   * Start date for export (YYYY-MM-DD).
   */
  startDate?: string;

  /**
   * End date for export (YYYY-MM-DD).
   */
  endDate?: string;

  /**
   * Output file path. If not provided, outputs to stdout.
   */
  outputPath?: string;
}

/**
 * Options for the status command.
 */
export interface StatusOptions {
  /**
   * Whether to include detailed information.
   * @default false
   */
  verbose?: boolean;
}

/**
 * Analytics status information for display.
 */
export interface AnalyticsStatus {
  /**
   * Whether analytics are currently enabled.
   */
  enabled: boolean;

  /**
   * Whether consent has been given.
   */
  hasConsented: boolean;

  /**
   * When consent was given (if ever).
   */
  consentedAt?: string;

  /**
   * When consent was withdrawn (if ever).
   */
  withdrawnAt?: string;

  /**
   * Policy version consented to.
   */
  policyVersion: string;

  /**
   * Current policy version.
   */
  currentPolicyVersion: string;

  /**
   * Whether re-consent is needed.
   */
  needsReConsent: boolean;

  /**
   * Data retention period in days.
   */
  retentionDays: number;

  /**
   * Storage path.
   */
  storagePath: string;

  /**
   * Storage information.
   */
  storage: StorageInfo;
}

// =============================================================================
// Formatting Helpers
// =============================================================================

/**
 * Formats a date string for display.
 * @param dateStr - ISO 8601 date string
 * @returns Formatted date string
 */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) {
    return 'Never';
  }
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch {
    return dateStr;
  }
}

/**
 * Formats bytes to human-readable size.
 * @param bytes - Number of bytes
 * @returns Formatted size string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Creates a success result.
 * @param message - Success message
 * @param data - Optional data payload
 * @returns CLI result
 */
function success(message: string, data?: Record<string, unknown>): CliResult {
  return { success: true, message, exitCode: 0, data };
}

/**
 * Creates an error result.
 * @param message - Error message
 * @param exitCode - Exit code (default 1)
 * @returns CLI result
 */
function error(message: string, exitCode: number = 1): CliResult {
  return { success: false, message, exitCode };
}

// =============================================================================
// CLI Commands
// =============================================================================

/**
 * Enables analytics collection.
 *
 * This command:
 * 1. Records user consent
 * 2. Enables analytics in configuration
 * 3. Displays confirmation message
 *
 * @returns CLI result
 */
export async function enableAnalytics(): Promise<CliResult> {
  try {
    const result = await grantConsent({ enableAnalytics: true });

    if (!result.success) {
      return error(`Failed to enable analytics: ${result.error}`);
    }

    return success(ANALYTICS_ENABLED_MESSAGE);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return error(`Failed to enable analytics: ${message}`);
  }
}

/**
 * Disables analytics collection.
 *
 * This command:
 * 1. Records consent withdrawal
 * 2. Disables analytics in configuration
 * 3. Optionally deletes all collected data
 * 4. Displays confirmation message
 *
 * @param options - Disable options
 * @returns CLI result
 */
export async function disableAnalytics(options: DisableOptions = {}): Promise<CliResult> {
  const { deleteData = false } = options;

  try {
    const result = await withdrawConsent({
      disableAnalytics: true,
      deleteData,
    });

    if (!result.success) {
      return error(`Failed to disable analytics: ${result.error}`);
    }

    const message = deleteData
      ? ANALYTICS_DISABLED_WITH_DATA_DELETED_MESSAGE
      : ANALYTICS_DISABLED_MESSAGE;

    return success(message);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return error(`Failed to disable analytics: ${message}`);
  }
}

/**
 * Shows current analytics status.
 *
 * Displays:
 * - Enabled/disabled state
 * - Consent status and timestamp
 * - Data retention settings
 * - Storage statistics
 *
 * @param options - Status options
 * @returns CLI result with status information
 */
export async function showStatus(options: StatusOptions = {}): Promise<CliResult> {
  const { verbose = false } = options;

  try {
    const consentStatus = getConsentStatus();
    const config = getConfigManager().getConfig();
    const storage = getStorageAdapter();
    const storageInfo = storage.getStorageInfo();

    const status: AnalyticsStatus = {
      enabled: config.enabled,
      hasConsented: consentStatus.hasConsented,
      consentedAt: consentStatus.consentedAt,
      withdrawnAt: consentStatus.withdrawnAt,
      policyVersion: consentStatus.policyVersion,
      currentPolicyVersion: PRIVACY_NOTICE_VERSION,
      needsReConsent: consentStatus.needsReConsent,
      retentionDays: config.retentionDays,
      storagePath: config.storagePath,
      storage: storageInfo,
    };

    // Build status message
    const lines: string[] = [];
    lines.push('');
    lines.push('================================================================================');
    lines.push('                         ANALYTICS STATUS');
    lines.push('================================================================================');
    lines.push('');

    // Main status
    lines.push(`  Status:          ${status.enabled ? 'ENABLED' : 'DISABLED'}`);
    lines.push(`  Consent Given:   ${status.hasConsented ? 'Yes' : 'No'}`);

    if (status.hasConsented) {
      lines.push(`  Consented At:    ${formatDate(status.consentedAt)}`);
    }

    if (status.withdrawnAt) {
      lines.push(`  Withdrawn At:    ${formatDate(status.withdrawnAt)}`);
    }

    lines.push(`  Policy Version:  ${status.policyVersion}`);

    if (status.needsReConsent) {
      lines.push('');
      lines.push('  ⚠️  Re-consent needed due to policy update');
      lines.push(`      Current policy version: ${status.currentPolicyVersion}`);
    }

    lines.push('');
    lines.push('  STORAGE');
    lines.push('  -------');
    lines.push(`  Path:            ${status.storagePath}`);
    lines.push(`  Total Files:     ${status.storage.totalFiles}`);
    lines.push(`  Total Events:    ${status.storage.totalEvents}`);
    lines.push(`  Total Size:      ${formatBytes(status.storage.totalBytes)}`);

    if (status.storage.oldestDate) {
      lines.push(`  Date Range:      ${status.storage.oldestDate} to ${status.storage.newestDate}`);
    }

    lines.push(`  Retention:       ${status.retentionDays} days`);

    if (verbose) {
      lines.push('');
      lines.push('  CONFIGURATION');
      lines.push('  -------------');
      lines.push(`  Batch Size:      ${config.batchSize} events`);
      lines.push(`  Flush Interval:  ${config.flushIntervalMs / 1000} seconds`);
      lines.push('');
      lines.push('  PRIVACY');
      lines.push('  -------');
      lines.push(DATA_COLLECTION_TABLE);
    }

    lines.push('');
    lines.push('  COMMANDS');
    lines.push('  --------');
    lines.push(CLI_QUICK_REFERENCE);
    lines.push('');
    lines.push('================================================================================');
    lines.push('');

    return success(lines.join('\n'), { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return error(`Failed to get analytics status: ${message}`);
  }
}

/**
 * Exports analytics data.
 *
 * Exports collected analytics data in the specified format.
 * Supports date range filtering.
 *
 * @param options - Export options
 * @returns CLI result with exported data
 */
export async function exportData(options: ExportOptions = {}): Promise<CliResult> {
  const { format = 'json', startDate, endDate } = options;

  try {
    const storage = getStorageAdapter();
    const readResult = await storage.readEvents(startDate, endDate);

    if (!readResult.success) {
      return error(`Failed to read analytics data: ${readResult.error}`);
    }

    const { events, dateRange } = readResult;

    if (events.length === 0) {
      return success('No analytics data found for the specified date range.', {
        events: [],
        dateRange,
      });
    }

    // Build export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange,
      eventCount: events.length,
      events,
    };

    let output: string;

    if (format === 'csv') {
      // Generate CSV output
      const headers = ['timestamp', 'toolName', 'success', 'durationMs', 'errorCategory', 'sessionId'];
      const rows = events.map(event => [
        event.timestamp,
        event.toolName,
        String(event.success),
        String(event.durationMs),
        event.errorCategory || '',
        event.sessionId,
      ]);

      output = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
    } else {
      // JSON output
      output = JSON.stringify(exportData, null, 2);
    }

    const message = [
      '',
      `Analytics Export (${format.toUpperCase()})`,
      `Date Range: ${dateRange.start} to ${dateRange.end}`,
      `Events: ${events.length}`,
      '',
      output,
    ].join('\n');

    return success(message, exportData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return error(`Failed to export analytics data: ${message}`);
  }
}

/**
 * Clears all analytics data.
 *
 * Permanently deletes all collected analytics data.
 * This action cannot be undone.
 *
 * @returns CLI result
 */
export async function clearData(): Promise<CliResult> {
  try {
    const storage = getStorageAdapter();
    const result = await storage.deleteAllData();

    if (!result.success) {
      return error(`Failed to clear analytics data: ${result.error}`);
    }

    const message = [
      '',
      'All analytics data has been deleted.',
      '',
      `  Files deleted:  ${result.filesDeleted}`,
      `  Events deleted: ${result.eventsDeleted}`,
      '',
    ].join('\n');

    return success(message, {
      filesDeleted: result.filesDeleted,
      eventsDeleted: result.eventsDeleted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return error(`Failed to clear analytics data: ${message}`);
  }
}

/**
 * Shows privacy notice.
 *
 * Displays the full privacy notice explaining what data is collected
 * and how it's used.
 *
 * @param brief - Whether to show brief version
 * @returns CLI result with privacy notice
 */
export async function showPrivacyNotice(brief: boolean = false): Promise<CliResult> {
  const notice = brief ? PRIVACY_NOTICE_BRIEF : PRIVACY_NOTICE_FULL;
  return success(notice);
}

// =============================================================================
// CLI Argument Parsing
// =============================================================================

/**
 * Parses command-line arguments for the analytics CLI.
 *
 * @param args - Command-line arguments (without 'node' and script name)
 * @returns Parsed command and options
 */
export interface ParsedArgs {
  /**
   * The command to execute.
   */
  command: 'enable' | 'disable' | 'status' | 'export' | 'clear' | 'privacy' | 'help' | 'unknown';

  /**
   * Command options.
   */
  options: {
    deleteData?: boolean;
    verbose?: boolean;
    format?: 'json' | 'csv';
    startDate?: string;
    endDate?: string;
    outputPath?: string;
    brief?: boolean;
  };

  /**
   * Unknown argument if command is 'unknown'.
   */
  unknownArg?: string;
}

/**
 * Parses CLI arguments.
 * @param args - Command-line arguments
 * @returns Parsed arguments
 */
export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: 'help',
    options: {},
  };

  if (args.length === 0) {
    return result;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case 'enable':
      result.command = 'enable';
      break;

    case 'disable':
      result.command = 'disable';
      // Check for --delete-data flag
      if (args.includes('--delete-data') || args.includes('-d')) {
        result.options.deleteData = true;
      }
      break;

    case 'status':
      result.command = 'status';
      // Check for --verbose flag
      if (args.includes('--verbose') || args.includes('-v')) {
        result.options.verbose = true;
      }
      break;

    case 'export':
      result.command = 'export';
      // Parse format option
      const formatIndex = args.findIndex(a => a === '--format' || a === '-f');
      if (formatIndex !== -1 && args[formatIndex + 1]) {
        const formatArg = args[formatIndex + 1].toLowerCase();
        if (formatArg === 'csv' || formatArg === 'json') {
          result.options.format = formatArg;
        }
      }
      // Parse start date
      const startIndex = args.findIndex(a => a === '--start' || a === '-s');
      if (startIndex !== -1 && args[startIndex + 1]) {
        result.options.startDate = args[startIndex + 1];
      }
      // Parse end date
      const endIndex = args.findIndex(a => a === '--end' || a === '-e');
      if (endIndex !== -1 && args[endIndex + 1]) {
        result.options.endDate = args[endIndex + 1];
      }
      // Parse output path
      const outputIndex = args.findIndex(a => a === '--output' || a === '-o');
      if (outputIndex !== -1 && args[outputIndex + 1]) {
        result.options.outputPath = args[outputIndex + 1];
      }
      break;

    case 'clear':
      result.command = 'clear';
      break;

    case 'privacy':
      result.command = 'privacy';
      // Check for --brief flag
      if (args.includes('--brief') || args.includes('-b')) {
        result.options.brief = true;
      }
      break;

    case 'help':
    case '--help':
    case '-h':
      result.command = 'help';
      break;

    default:
      result.command = 'unknown';
      result.unknownArg = command;
  }

  return result;
}

/**
 * Generates help text for the analytics CLI.
 * @returns Help text
 */
export function getHelpText(): string {
  return `
think-mcp analytics - Privacy-respecting usage analytics

USAGE:
  think-mcp analytics <command> [options]

COMMANDS:
  enable           Opt in to analytics collection
  disable          Opt out of analytics collection
    --delete-data, -d    Also delete all collected data

  status           View current analytics settings
    --verbose, -v        Show detailed information

  export           Export collected analytics data
    --format, -f <fmt>   Export format: json (default) or csv
    --start, -s <date>   Start date (YYYY-MM-DD)
    --end, -e <date>     End date (YYYY-MM-DD)
    --output, -o <path>  Output file path (default: stdout)

  clear            Delete all collected analytics data

  privacy          Show privacy notice
    --brief, -b          Show brief version

  help             Show this help message

EXAMPLES:
  think-mcp analytics enable
  think-mcp analytics disable --delete-data
  think-mcp analytics status --verbose
  think-mcp analytics export --format csv --start 2024-01-01
  think-mcp analytics clear
  think-mcp analytics privacy

PRIVACY:
  ${PRIVACY_NOTICE_BRIEF.split('\n').slice(0, 5).join('\n  ')}
  ...

  For full privacy policy: think-mcp analytics privacy
  Or see: docs/PRIVACY.md
`.trim();
}

// =============================================================================
// Main CLI Entry Point
// =============================================================================

/**
 * Main CLI entry point.
 *
 * Parses arguments and executes the appropriate command.
 *
 * @param args - Command-line arguments (without 'node' and script name)
 * @returns CLI result
 */
export async function runCli(args: string[]): Promise<CliResult> {
  const parsed = parseArgs(args);

  switch (parsed.command) {
    case 'enable':
      return enableAnalytics();

    case 'disable':
      return disableAnalytics({ deleteData: parsed.options.deleteData });

    case 'status':
      return showStatus({ verbose: parsed.options.verbose });

    case 'export':
      return exportData({
        format: parsed.options.format,
        startDate: parsed.options.startDate,
        endDate: parsed.options.endDate,
        outputPath: parsed.options.outputPath,
      });

    case 'clear':
      return clearData();

    case 'privacy':
      return showPrivacyNotice(parsed.options.brief);

    case 'help':
      return success(getHelpText());

    case 'unknown':
      return error(
        `Unknown command: ${parsed.unknownArg}\n\nRun 'think-mcp analytics help' for usage.`,
        1
      );

    default:
      return success(getHelpText());
  }
}

// =============================================================================
// Exports
// =============================================================================

export {
  // Re-export for convenience
  PRIVACY_NOTICE_BRIEF,
  PRIVACY_NOTICE_FULL,
  ANALYTICS_ENABLED_MESSAGE,
  ANALYTICS_DISABLED_MESSAGE,
  CLI_QUICK_REFERENCE,
};
