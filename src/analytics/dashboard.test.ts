/**
 * Tests for Dashboard CLI and JSON Export
 *
 * Tests for:
 * - CLI output formatting
 * - Time range filtering
 * - Handling of empty data
 * - JSON export format
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { TOOL_NAMES } from '../toolNames.js';
import { AnalyticsEvent } from './types.js';

// Dashboard CLI imports
import {
  showDashboard,
  runDashboardCommand,
  parseDashboardArgs,
  getDashboardHelpText,
  DEFAULT_DAYS,
  TREND_ARROWS,
  SEVERITY_ICONS,
} from './dashboard-cli.js';

// Export imports
import {
  AnalyticsExporter,
  createExporter,
  getExporter,
  resetExporter,
  exportDashboardData,
  exportToFile,
  exportMinimal,
  exportFull,
  getExportJson,
  getExportData,
  EXPORT_FORMAT_VERSION,
} from './export.js';

// Dependencies
import {
  createStorageAdapter,
  AnalyticsStorageAdapter,
  resetStorageAdapter,
} from './storage.js';
import {
  AnalyticsAggregator,
  createAggregator,
  resetAggregator,
} from './aggregator.js';
import {
  InsightsGenerator,
  createInsightsGenerator,
  resetInsightsGenerator,
} from './insights.js';
import {
  ErrorTracker,
  createErrorTracker,
  resetErrorTracker,
} from './errors.js';
import { resetConfigManager } from './config.js';
import { resetConsentManager, writeConsentFile, deleteConsentFile } from './consent.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(
    os.tmpdir(),
    `think-mcp-dashboard-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Removes a directory and all its contents recursively.
 */
function removeTempDir(dir: string): void {
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          removeTempDir(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }
      fs.rmdirSync(dir);
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Formats a date as YYYY-MM-DD.
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates a date N days ago.
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Creates a mock analytics event.
 */
function createMockEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    toolName: TOOL_NAMES.TRACE,
    timestamp: new Date().toISOString(),
    success: true,
    durationMs: 100,
    sessionId: 'test-session-123',
    ...overrides,
  };
}

/**
 * Test context containing all required test instances.
 */
interface TestContext {
  tempDir: string;
  exportTempDir: string;
  storageAdapter: AnalyticsStorageAdapter;
  aggregator: AnalyticsAggregator;
  errorTracker: ErrorTracker;
  insightsGenerator: InsightsGenerator;
  exporter: AnalyticsExporter;
}

/**
 * Creates a test context with isolated instances.
 */
async function createTestContext(): Promise<TestContext> {
  const tempDir = createTempDir();
  const exportTempDir = createTempDir();
  const storageAdapter = createStorageAdapter(tempDir, 90);
  await storageAdapter.initialize();

  const aggregator = createAggregator({ storageAdapter });
  const errorTracker = createErrorTracker({ storageAdapter });
  const insightsGenerator = createInsightsGenerator({
    aggregator,
    errorTracker,
    minInvocationsForInsight: 1,
  });

  const exporter = createExporter({
    aggregator,
    insightsGenerator,
    errorTracker,
    storageAdapter,
  });

  return {
    tempDir,
    exportTempDir,
    storageAdapter,
    aggregator,
    errorTracker,
    insightsGenerator,
    exporter,
  };
}

/**
 * Cleans up a test context.
 */
function cleanupTestContext(ctx: TestContext): void {
  removeTempDir(ctx.tempDir);
  removeTempDir(ctx.exportTempDir);
}

/**
 * Sets up consent for dashboard tests (analytics must be enabled).
 */
function setupConsent(): void {
  writeConsentFile({
    hasConsented: true,
    consentedAt: new Date().toISOString(),
    policyVersion: '1.0.0',
  });
}

/**
 * Cleans up consent file after tests.
 */
function cleanupConsent(): void {
  deleteConsentFile();
}

// =============================================================================
// Dashboard CLI Argument Parsing Tests
// =============================================================================

describe('Dashboard CLI Argument Parsing', () => {
  describe('parseDashboardArgs', () => {
    it('should return default values when no arguments provided', () => {
      const args = parseDashboardArgs([]);
      expect(args.days).toBe(DEFAULT_DAYS);
      expect(args.noColor).toBe(false);
      expect(args.detailed).toBe(false);
      expect(args.showHelp).toBe(false);
    });

    it('should parse --days flag with value', () => {
      const args = parseDashboardArgs(['--days', '7']);
      expect(args.days).toBe(7);
    });

    it('should parse -d short flag', () => {
      const args = parseDashboardArgs(['-d', '14']);
      expect(args.days).toBe(14);
    });

    it('should parse --no-color flag', () => {
      const args = parseDashboardArgs(['--no-color']);
      expect(args.noColor).toBe(true);
    });

    it('should parse --detailed flag', () => {
      const args = parseDashboardArgs(['--detailed']);
      expect(args.detailed).toBe(true);
    });

    it('should parse --verbose (-v) as detailed', () => {
      const args = parseDashboardArgs(['-v']);
      expect(args.detailed).toBe(true);
    });

    it('should parse --help flag', () => {
      const args = parseDashboardArgs(['--help']);
      expect(args.showHelp).toBe(true);
    });

    it('should parse -h short flag for help', () => {
      const args = parseDashboardArgs(['-h']);
      expect(args.showHelp).toBe(true);
    });

    it('should handle multiple flags together', () => {
      const args = parseDashboardArgs(['--days', '30', '--detailed', '--no-color']);
      expect(args.days).toBe(30);
      expect(args.detailed).toBe(true);
      expect(args.noColor).toBe(true);
    });

    it('should ignore invalid days value', () => {
      const args = parseDashboardArgs(['--days', 'invalid']);
      expect(args.days).toBe(DEFAULT_DAYS);
    });

    it('should ignore negative days value', () => {
      const args = parseDashboardArgs(['--days', '-5']);
      expect(args.days).toBe(DEFAULT_DAYS);
    });

    it('should handle missing days value gracefully', () => {
      const args = parseDashboardArgs(['--days']);
      expect(args.days).toBe(DEFAULT_DAYS);
    });
  });

  describe('getDashboardHelpText', () => {
    it('should return help text', () => {
      const helpText = getDashboardHelpText();
      expect(helpText).toContain('analytics dashboard');
      expect(helpText).toContain('--days');
      expect(helpText).toContain('--detailed');
      expect(helpText).toContain('--no-color');
      expect(helpText).toContain('--help');
    });

    it('should include usage examples', () => {
      const helpText = getDashboardHelpText();
      expect(helpText).toContain('EXAMPLES');
    });

    it('should include section descriptions', () => {
      const helpText = getDashboardHelpText();
      expect(helpText).toContain('SECTIONS');
      expect(helpText).toContain('Summary');
      expect(helpText).toContain('Tool Usage');
      expect(helpText).toContain('Error Rates');
    });
  });

  describe('Constants', () => {
    it('should have correct default days', () => {
      expect(DEFAULT_DAYS).toBe(30);
    });

    it('should have trend arrows defined', () => {
      expect(TREND_ARROWS.increasing).toBe('\u2191');
      expect(TREND_ARROWS.decreasing).toBe('\u2193');
      expect(TREND_ARROWS.stable).toBe('\u2192');
    });

    it('should have severity icons defined', () => {
      expect(SEVERITY_ICONS.critical).toBeDefined();
      expect(SEVERITY_ICONS.warning).toBeDefined();
      expect(SEVERITY_ICONS.info).toBeDefined();
      expect(SEVERITY_ICONS.healthy).toBeDefined();
    });
  });
});

// =============================================================================
// Dashboard CLI Command Tests
// =============================================================================

describe('Dashboard CLI Commands', () => {
  beforeEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupConsent();
  });

  describe('runDashboardCommand', () => {
    it('should return help text when --help is provided', async () => {
      const result = await runDashboardCommand(['--help']);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.message).toContain('analytics dashboard');
    });

    it('should show disabled message when analytics not enabled', async () => {
      const result = await runDashboardCommand([]);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Analytics is currently disabled');
    });
  });

  describe('showDashboard', () => {
    it('should show disabled message when analytics not enabled', async () => {
      const result = await showDashboard({});
      expect(result.success).toBe(true);
      expect(result.message).toContain('disabled');
    });

    it('should accept custom days option', async () => {
      const result = await showDashboard({ days: 7 });
      expect(result.success).toBe(true);
    });

    it('should accept noColor option', async () => {
      const result = await showDashboard({ noColor: true });
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// Dashboard CLI Output Formatting Tests
// =============================================================================

describe('Dashboard CLI Output Formatting', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();

    ctx = await createTestContext();
    setupConsent();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupTestContext(ctx);
    cleanupConsent();
  });

  // Note: Full dashboard output tests require analytics to be enabled
  // and proper integration with the config manager. These tests verify
  // the argument parsing and help text formatting.

  it('should handle request gracefully even with empty storage', async () => {
    // Dashboard should not crash with no data
    const result = await showDashboard({ noColor: true });
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Time Range Filtering Tests
// =============================================================================

describe('Time Range Filtering', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();

    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupTestContext(ctx);
  });

  it('should filter export data by date range', async () => {
    const today = new Date();
    const fiveDaysAgo = daysAgo(5);
    const tenDaysAgo = daysAgo(10);

    const events: AnalyticsEvent[] = [
      createMockEvent({ timestamp: tenDaysAgo.toISOString(), toolName: TOOL_NAMES.TRACE }),
      createMockEvent({ timestamp: fiveDaysAgo.toISOString(), toolName: TOOL_NAMES.MODEL }),
      createMockEvent({ timestamp: today.toISOString(), toolName: TOOL_NAMES.DEBUG }),
    ];

    await ctx.storageAdapter.appendEvents(events);

    // Export last 7 days
    const result = await ctx.exporter.exportForDashboard({
      startDate: formatDateString(daysAgo(7)),
      endDate: formatDateString(today),
      includeStats: true,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    // Should include only events from last 7 days (MODEL and DEBUG)
    expect(result.data?.summary.totalInvocations).toBe(2);
  });

  it('should default to 30 days when no date range specified', async () => {
    const result = await ctx.exporter.exportForDashboard({});

    expect(result.success).toBe(true);
    expect(result.data?.metadata.periodDays).toBe(30);
  });

  it('should handle custom date ranges', async () => {
    const result = await ctx.exporter.exportForDashboard({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    expect(result.data?.metadata.periodStart).toBe('2024-01-01');
    expect(result.data?.metadata.periodEnd).toBe('2024-01-31');
    expect(result.data?.metadata.periodDays).toBe(30);
  });
});

// =============================================================================
// Empty Data Handling Tests
// =============================================================================

describe('Empty Data Handling', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();

    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupTestContext(ctx);
  });

  it('should handle empty storage gracefully in export', async () => {
    const result = await ctx.exporter.exportForDashboard({});

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.summary.totalInvocations).toBe(0);
    expect(result.data?.summary.toolsUsed).toBe(0);
    expect(result.data?.summary.insightsCount).toBe(0);
  });

  it('should return sensible defaults for empty export summary', async () => {
    const result = await ctx.exporter.exportForDashboard({});

    expect(result.success).toBe(true);
    const summary = result.data?.summary;
    expect(summary?.totalInvocations).toBe(0);
    expect(summary?.uniqueSessions).toBe(0);
    expect(summary?.successRate).toBe(100);
    expect(summary?.errorRate).toBe(0);
    expect(summary?.mostPopularTool).toBeNull();
    expect(summary?.highestErrorRateTool).toBeNull();
    expect(summary?.healthStatus).toBe('healthy');
  });

  it('should include empty arrays for metrics when no data', async () => {
    const result = await ctx.exporter.exportForDashboard({
      includeStats: true,
      includeTrends: true,
      includeErrors: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.toolMetrics).toEqual([]);
    expect(result.data?.trends).toEqual([]);
    expect(result.data?.dailyCounts).toEqual([]);
  });

  it('should handle minimal export with no data', async () => {
    const result = await ctx.exporter.exportMinimal();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.summary.totalInvocations).toBe(0);
  });
});

// =============================================================================
// JSON Export Format Tests
// =============================================================================

describe('JSON Export Format', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();

    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupTestContext(ctx);
  });

  describe('Export Metadata', () => {
    it('should include correct version', async () => {
      const result = await ctx.exporter.exportForDashboard({});

      expect(result.success).toBe(true);
      expect(result.data?.metadata.version).toBe(EXPORT_FORMAT_VERSION);
    });

    it('should include generation timestamp', async () => {
      const before = new Date().toISOString();
      const result = await ctx.exporter.exportForDashboard({});
      const after = new Date().toISOString();

      expect(result.success).toBe(true);
      const generatedAt = result.data?.metadata.generatedAt;
      expect(generatedAt).toBeDefined();
      expect(generatedAt! >= before).toBe(true);
      expect(generatedAt! <= after).toBe(true);
    });

    it('should include period information', async () => {
      const result = await ctx.exporter.exportForDashboard({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.success).toBe(true);
      expect(result.data?.metadata.periodStart).toBe('2024-01-01');
      expect(result.data?.metadata.periodEnd).toBe('2024-01-31');
      expect(result.data?.metadata.periodDays).toBe(30);
    });

    it('should include privacy version', async () => {
      const result = await ctx.exporter.exportForDashboard({});

      expect(result.success).toBe(true);
      expect(result.data?.metadata.privacyVersion).toBeDefined();
      expect(result.data?.metadata.privacyVersion).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should include export options used', async () => {
      const result = await ctx.exporter.exportForDashboard({
        includeRawEvents: true,
        includeStats: true,
        includeInsights: false,
        includeErrors: true,
        includeTrends: false,
      });

      expect(result.success).toBe(true);
      const options = result.data?.metadata.options;
      expect(options?.includeRawEvents).toBe(true);
      expect(options?.includeStats).toBe(true);
      expect(options?.includeInsights).toBe(false);
      expect(options?.includeErrors).toBe(true);
      expect(options?.includeTrends).toBe(false);
    });
  });

  describe('Export Summary', () => {
    it('should include all summary fields', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const result = await ctx.exporter.exportForDashboard({ includeStats: true });

      expect(result.success).toBe(true);
      const summary = result.data?.summary;

      expect(summary?.totalInvocations).toBe(3);
      expect(summary?.uniqueSessions).toBe(1);
      expect(summary?.successRate).toBeCloseTo(66.67, 0);
      expect(summary?.errorRate).toBeCloseTo(33.33, 0);
      expect(summary?.mostPopularTool).toBe(TOOL_NAMES.TRACE);
      expect(summary?.highestErrorRateTool).toBe(TOOL_NAMES.MODEL);
      expect(summary?.toolsUsed).toBe(2);
    });

    it('should determine health status based on insights', async () => {
      const result = await ctx.exporter.exportForDashboard({});

      expect(result.success).toBe(true);
      expect(['healthy', 'needs-attention', 'critical']).toContain(
        result.data?.summary.healthStatus
      );
    });
  });

  describe('Export Options', () => {
    it('should include raw events when requested', async () => {
      const today = new Date();
      await ctx.storageAdapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);

      const result = await ctx.exporter.exportForDashboard({
        includeRawEvents: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rawEvents).toBeDefined();
      expect(result.data?.rawEvents?.length).toBe(1);
    });

    it('should exclude raw events by default', async () => {
      const today = new Date();
      await ctx.storageAdapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);

      const result = await ctx.exporter.exportForDashboard({
        includeRawEvents: false,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rawEvents).toBeUndefined();
    });

    it('should include stats when requested', async () => {
      const result = await ctx.exporter.exportForDashboard({
        includeStats: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.usageStats).toBeDefined();
      expect(result.data?.toolMetrics).toBeDefined();
    });

    it('should include trends when requested', async () => {
      const result = await ctx.exporter.exportForDashboard({
        includeTrends: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.dailyCounts).toBeDefined();
      expect(result.data?.weeklyCounts).toBeDefined();
      expect(result.data?.monthlyCounts).toBeDefined();
    });

    it('should include errors when requested', async () => {
      const result = await ctx.exporter.exportForDashboard({
        includeErrors: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.errorStats).toBeDefined();
      expect(result.data?.problematicTools).toBeDefined();
    });

    it('should include insights when requested', async () => {
      const result = await ctx.exporter.exportForDashboard({
        includeInsights: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.insightsReport).toBeDefined();
      expect(result.data?.insightsSummary).toBeDefined();
    });
  });

  describe('JSON Output', () => {
    it('should produce valid JSON string', async () => {
      const result = await ctx.exporter.exportForDashboard({});

      expect(result.success).toBe(true);
      expect(result.json).toBeDefined();

      // Should be parseable
      const parsed = JSON.parse(result.json!);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.summary).toBeDefined();
    });

    it('should pretty-print JSON by default', async () => {
      const result = await ctx.exporter.exportForDashboard({ prettyPrint: true });

      expect(result.success).toBe(true);
      expect(result.json).toContain('\n');
      expect(result.json).toContain('  ');
    });

    it('should compact JSON when prettyPrint is false', async () => {
      const result = await ctx.exporter.exportForDashboard({ prettyPrint: false });

      expect(result.success).toBe(true);
      // Compact JSON should not have newlines in the middle
      // (may have newlines at end but not indentation)
      const lines = result.json!.split('\n').filter(l => l.trim().length > 0);
      expect(lines.length).toBe(1);
    });
  });

  describe('File Export', () => {
    it('should export to file successfully', async () => {
      const filePath = path.join(ctx.exportTempDir, 'test-export.json');

      const result = await ctx.exporter.exportToFile(filePath);

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(fs.existsSync(filePath)).toBe(true);

      // Verify file content
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed.metadata).toBeDefined();
    });

    it('should create directory if it does not exist', async () => {
      const filePath = path.join(ctx.exportTempDir, 'subdir', 'nested', 'export.json');

      const result = await ctx.exporter.exportToFile(filePath);

      expect(result.success).toBe(true);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should include data and json in file export result', async () => {
      const filePath = path.join(ctx.exportTempDir, 'full-export.json');

      const result = await ctx.exporter.exportToFile(filePath);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.filePath).toBe(filePath);
    });
  });

  describe('Export Convenience Functions', () => {
    it('exportMinimal should exclude trends, errors, and insights', async () => {
      const result = await ctx.exporter.exportMinimal();

      expect(result.success).toBe(true);
      expect(result.data?.usageStats).toBeDefined();
      expect(result.data?.insightsReport).toBeUndefined();
      expect(result.data?.errorStats).toBeUndefined();
      expect(result.data?.dailyCounts).toBeUndefined();
    });

    it('exportFull should include all data', async () => {
      const today = new Date();
      await ctx.storageAdapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);

      const result = await ctx.exporter.exportFull();

      expect(result.success).toBe(true);
      expect(result.data?.usageStats).toBeDefined();
      expect(result.data?.insightsReport).toBeDefined();
      expect(result.data?.errorStats).toBeDefined();
      expect(result.data?.dailyCounts).toBeDefined();
      expect(result.data?.rawEvents).toBeDefined();
    });
  });
});

// =============================================================================
// Singleton Pattern Tests
// =============================================================================

describe('Export Singleton Pattern', () => {
  beforeEach(() => {
    resetExporter();
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
  });

  afterEach(() => {
    resetExporter();
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
  });

  it('should return same instance from getExporter', () => {
    const exp1 = getExporter();
    const exp2 = getExporter();
    expect(exp1).toBe(exp2);
  });

  it('should reset singleton on resetExporter', () => {
    const exp1 = getExporter();
    resetExporter();
    const exp2 = getExporter();
    expect(exp1).not.toBe(exp2);
  });

  it('should create independent instances with createExporter', () => {
    const exp1 = createExporter();
    const exp2 = createExporter();
    expect(exp1).not.toBe(exp2);
  });
});

// =============================================================================
// Convenience Function Tests
// =============================================================================

describe('Export Convenience Functions', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();

    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupTestContext(ctx);
  });

  describe('getExportJson', () => {
    it('should return JSON string', async () => {
      const json = await getExportJson();
      expect(json).not.toBeNull();
      expect(typeof json).toBe('string');

      // Should be parseable
      const parsed = JSON.parse(json!);
      expect(parsed.metadata).toBeDefined();
    });
  });

  describe('getExportData', () => {
    it('should return export data object', async () => {
      const data = await getExportData();
      expect(data).not.toBeNull();
      expect(data?.metadata).toBeDefined();
      expect(data?.summary).toBeDefined();
    });
  });

  describe('exportDashboardData', () => {
    it('should return export result using default exporter', async () => {
      const result = await exportDashboardData();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.json).toBeDefined();
    });
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe('Export Error Handling', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();

    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupTestContext(ctx);
  });

  it('should handle file write errors gracefully', async () => {
    // Try to write to an invalid path
    const invalidPath = '/nonexistent/readonly/path/export.json';

    const result = await ctx.exporter.exportToFile(invalidPath);

    // Should return error but not throw
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Dashboard Export Integration', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();

    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    resetConsentManager();
    resetExporter();
    cleanupTestContext(ctx);
  });

  it('should export complete dashboard data with realistic events', async () => {
    const today = new Date();
    const events: AnalyticsEvent[] = [];

    // Simulate realistic usage over 7 days
    for (let d = 6; d >= 0; d--) {
      const date = daysAgo(d);

      // trace - most popular
      for (let i = 0; i < 10 - d; i++) {
        events.push(
          createMockEvent({
            toolName: TOOL_NAMES.TRACE,
            timestamp: date.toISOString(),
            success: Math.random() > 0.1, // 90% success
            durationMs: 50 + Math.random() * 100,
            sessionId: `session-${d}-${i % 3}`,
            ...(Math.random() > 0.9 && { errorCategory: 'validation' as const }),
          })
        );
      }

      // model - moderate usage
      for (let i = 0; i < 5; i++) {
        events.push(
          createMockEvent({
            toolName: TOOL_NAMES.MODEL,
            timestamp: date.toISOString(),
            success: Math.random() > 0.2, // 80% success
            durationMs: 100 + Math.random() * 200,
            sessionId: `session-${d}-${i % 3}`,
            ...(Math.random() > 0.8 && { errorCategory: 'runtime' as const }),
          })
        );
      }
    }

    await ctx.storageAdapter.appendEvents(events);

    // Full export
    const result = await ctx.exporter.exportFull();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    // Verify metadata
    expect(result.data?.metadata.version).toBe(EXPORT_FORMAT_VERSION);

    // Verify summary
    expect(result.data?.summary.totalInvocations).toBeGreaterThan(50);
    expect(result.data?.summary.uniqueSessions).toBeGreaterThan(0);
    expect(result.data?.summary.toolsUsed).toBe(2);

    // Verify tool metrics
    expect(result.data?.toolMetrics?.length).toBe(2);
    const traceMetrics = result.data?.toolMetrics?.find(
      (m) => m.toolName === TOOL_NAMES.TRACE
    );
    expect(traceMetrics).toBeDefined();
    expect(traceMetrics?.invocationCount).toBeGreaterThan(0);

    // Verify trends exist
    expect(result.data?.dailyCounts?.length).toBeGreaterThan(0);

    // Verify raw events included
    expect(result.data?.rawEvents?.length).toBeGreaterThan(0);
  });
});
