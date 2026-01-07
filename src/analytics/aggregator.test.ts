/**
 * Unit Tests for Analytics Aggregation and Insights Generation
 *
 * Tests for:
 * - Count calculations (daily/weekly/monthly)
 * - Trend detection (increasing/decreasing/stable)
 * - Error rate calculations
 * - Insights generation (popularity, reliability, performance, trends)
 * - Edge cases (empty data, single event, minimal data)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { AnalyticsEvent, ANALYTICS_SCHEMA_VERSION } from './types.js';
import { TOOL_NAMES, ToolName } from '../toolNames.js';

import {
  AnalyticsAggregator,
  createAggregator,
  getAggregator,
  resetAggregator,
  getUsageStats,
  getUsageTrends,
  getDailyCounts,
  getWeeklyCounts,
  getMonthlyCounts,
  getAggregationSummary,
  getToolMetrics,
  getPopularityRanking,
  getErrorRates,
  getResponseTimes,
  AggregationPeriod,
} from './aggregator.js';

import {
  InsightsGenerator,
  createInsightsGenerator,
  getInsightsGenerator,
  resetInsightsGenerator,
  generateInsightsReport,
  getPopularityInsights,
  getReliabilityInsights,
  getPerformanceInsights,
  getTrendInsights,
  getInsightsSummary,
  generateTextReport,
} from './insights.js';

import {
  createStorageAdapter,
  AnalyticsStorageAdapter,
  resetStorageAdapter,
} from './storage.js';

import {
  ErrorTracker,
  createErrorTracker,
  resetErrorTracker,
} from './errors.js';

import { resetConfigManager } from './config.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(
    os.tmpdir(),
    `think-mcp-aggregator-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
  storageAdapter: AnalyticsStorageAdapter;
  aggregator: AnalyticsAggregator;
  errorTracker: ErrorTracker;
  insightsGenerator: InsightsGenerator;
}

/**
 * Creates a test context with isolated instances.
 */
async function createTestContext(): Promise<TestContext> {
  const tempDir = createTempDir();
  const storageAdapter = createStorageAdapter(tempDir, 90);
  await storageAdapter.initialize();

  const aggregator = createAggregator({ storageAdapter });
  const errorTracker = createErrorTracker({ storageAdapter });
  const insightsGenerator = createInsightsGenerator({
    aggregator,
    errorTracker,
    minInvocationsForInsight: 1, // Lower threshold for tests
  });

  return {
    tempDir,
    storageAdapter,
    aggregator,
    errorTracker,
    insightsGenerator,
  };
}

/**
 * Cleans up a test context.
 */
function cleanupTestContext(ctx: TestContext): void {
  removeTempDir(ctx.tempDir);
}

// =============================================================================
// Aggregator Tests
// =============================================================================

describe('Analytics Aggregator', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    cleanupTestContext(ctx);
  });

  describe('Count Calculations', () => {
    it('should calculate total invocation counts correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.totalInvocations).toBe(3);
    });

    it('should calculate success and error counts correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'runtime', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.totalSuccesses).toBe(2);
      expect(stats.totalErrors).toBe(2);
    });

    it('should count unique sessions', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ sessionId: 'session-1', timestamp: today.toISOString() }),
        createMockEvent({ sessionId: 'session-1', timestamp: today.toISOString() }),
        createMockEvent({ sessionId: 'session-2', timestamp: today.toISOString() }),
        createMockEvent({ sessionId: 'session-3', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.uniqueSessions).toBe(3);
      expect(stats.avgInvocationsPerSession).toBeCloseTo(4 / 3, 2);
    });

    it('should calculate per-tool invocation counts', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.DEBUG, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      const traceMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.TRACE);
      const modelMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.MODEL);
      const debugMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.DEBUG);

      expect(traceMetrics?.invocationCount).toBe(3);
      expect(modelMetrics?.invocationCount).toBe(2);
      expect(debugMetrics?.invocationCount).toBe(1);
    });
  });

  describe('Daily/Weekly/Monthly Counts', () => {
    it('should calculate daily counts correctly', async () => {
      const today = new Date();
      const yesterday = daysAgo(1);

      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: yesterday.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const dailyCounts = await ctx.aggregator.getDailyCounts(TOOL_NAMES.TRACE);
      expect(dailyCounts.length).toBe(1); // One tool

      const traceCounts = dailyCounts[0];
      expect(traceCounts.toolName).toBe(TOOL_NAMES.TRACE);
      expect(traceCounts.periods.length).toBe(2); // Two days

      const todayPeriod = traceCounts.periods.find(p => p.period === formatDateString(today));
      const yesterdayPeriod = traceCounts.periods.find(p => p.period === formatDateString(yesterday));

      expect(todayPeriod?.totalCount).toBe(2);
      expect(yesterdayPeriod?.totalCount).toBe(1);
    });

    it('should calculate weekly counts correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const weeklyCounts = await ctx.aggregator.getWeeklyCounts(TOOL_NAMES.TRACE);
      expect(weeklyCounts.length).toBe(1);
      expect(weeklyCounts[0].periodType).toBe('weekly');
      expect(weeklyCounts[0].periods.length).toBeGreaterThan(0);
    });

    it('should calculate monthly counts correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const monthlyCounts = await ctx.aggregator.getMonthlyCounts(TOOL_NAMES.TRACE);
      expect(monthlyCounts.length).toBe(1);
      expect(monthlyCounts[0].periodType).toBe('monthly');

      const expectedMonth = formatDateString(today).slice(0, 7); // YYYY-MM
      expect(monthlyCounts[0].periods[0].period).toBe(expectedMonth);
    });

    it('should filter counts by tool name', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const traceCounts = await ctx.aggregator.getDailyCounts(TOOL_NAMES.TRACE);
      expect(traceCounts.length).toBe(1);
      expect(traceCounts[0].toolName).toBe(TOOL_NAMES.TRACE);
    });

    it('should return all tools when no filter specified', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.DEBUG, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const allCounts = await ctx.aggregator.getDailyCounts();
      expect(allCounts.length).toBe(3);
    });
  });

  describe('Trend Detection', () => {
    it('should detect increasing trend', async () => {
      // Create events with increasing frequency over time
      const events: AnalyticsEvent[] = [];

      // 2 events 6 days ago
      const sixDaysAgo = daysAgo(6);
      events.push(
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: sixDaysAgo.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: sixDaysAgo.toISOString() }),
      );

      // 5 events 3 days ago
      const threeDaysAgo = daysAgo(3);
      for (let i = 0; i < 5; i++) {
        events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: threeDaysAgo.toISOString() }));
      }

      // 10 events today
      const today = new Date();
      for (let i = 0; i < 10; i++) {
        events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }));
      }

      await ctx.storageAdapter.appendEvents(events);

      const trends = await ctx.aggregator.getUsageTrends();
      const traceTrend = trends.find(t => t.toolName === TOOL_NAMES.TRACE);

      expect(traceTrend).toBeDefined();
      expect(traceTrend?.trend).toBe('increasing');
      expect(traceTrend?.changePercentage).toBeGreaterThan(0);
    });

    it('should detect decreasing trend', async () => {
      // Create events with decreasing frequency over time
      const events: AnalyticsEvent[] = [];

      // 10 events 6 days ago
      const sixDaysAgo = daysAgo(6);
      for (let i = 0; i < 10; i++) {
        events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: sixDaysAgo.toISOString() }));
      }

      // 2 events today
      const today = new Date();
      events.push(
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
      );

      await ctx.storageAdapter.appendEvents(events);

      const trends = await ctx.aggregator.getUsageTrends();
      const traceTrend = trends.find(t => t.toolName === TOOL_NAMES.TRACE);

      expect(traceTrend).toBeDefined();
      expect(traceTrend?.trend).toBe('decreasing');
      expect(traceTrend?.changePercentage).toBeLessThan(0);
    });

    it('should detect stable trend', async () => {
      // Create events with similar frequency
      const events: AnalyticsEvent[] = [];

      // 5 events 4 days ago
      const fourDaysAgo = daysAgo(4);
      for (let i = 0; i < 5; i++) {
        events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: fourDaysAgo.toISOString() }));
      }

      // 5 events today
      const today = new Date();
      for (let i = 0; i < 5; i++) {
        events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }));
      }

      await ctx.storageAdapter.appendEvents(events);

      const trends = await ctx.aggregator.getUsageTrends();
      const traceTrend = trends.find(t => t.toolName === TOOL_NAMES.TRACE);

      expect(traceTrend).toBeDefined();
      expect(traceTrend?.trend).toBe('stable');
    });

    it('should include trend in period counts', async () => {
      const events: AnalyticsEvent[] = [];

      // Create events for multiple days
      for (let d = 6; d >= 0; d--) {
        const date = daysAgo(d);
        for (let i = 0; i < d + 1; i++) {
          events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: date.toISOString() }));
        }
      }

      await ctx.storageAdapter.appendEvents(events);

      const dailyCounts = await ctx.aggregator.getDailyCounts(TOOL_NAMES.TRACE);
      expect(dailyCounts[0].trend).toBeDefined();
      expect(['increasing', 'decreasing', 'stable']).toContain(dailyCounts[0].trend);
    });
  });

  describe('Error Rate Calculations', () => {
    it('should calculate overall error rate correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.overallErrorRate).toBe(25); // 1/4 * 100 = 25%
    });

    it('should calculate per-tool error rates correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // trace: 2 success, 2 errors = 50% error rate
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'runtime', timestamp: today.toISOString() }),
        // model: 4 success, 0 errors = 0% error rate
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: true, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      const traceMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.TRACE);
      const modelMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.MODEL);

      expect(traceMetrics?.errorRate).toBe(50);
      expect(modelMetrics?.errorRate).toBe(0);
    });

    it('should track errors by category', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'runtime', timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'timeout', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      const traceMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.TRACE);

      expect(traceMetrics?.errorsByCategory.validation).toBe(2);
      expect(traceMetrics?.errorsByCategory.runtime).toBe(1);
      expect(traceMetrics?.errorsByCategory.timeout).toBe(1);
    });

    it('should identify tools needing attention', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // trace: 50% error rate
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        // model: 0% error rate
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: true, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.toolsNeedingAttention).toContain(TOOL_NAMES.TRACE);
      expect(stats.toolsNeedingAttention).not.toContain(TOOL_NAMES.MODEL);
    });

    it('should return error rates via convenience function', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const errorRates = await ctx.aggregator.getErrorRates();
      expect(errorRates.length).toBeGreaterThan(0);
      expect(errorRates[0].errorRate).toBe(50);
    });
  });

  describe('Response Time Calculations', () => {
    it('should calculate average duration correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ durationMs: 100, timestamp: today.toISOString() }),
        createMockEvent({ durationMs: 200, timestamp: today.toISOString() }),
        createMockEvent({ durationMs: 300, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      const traceMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.TRACE);

      expect(traceMetrics?.avgDurationMs).toBe(200);
    });

    it('should calculate min and max duration correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ durationMs: 50, timestamp: today.toISOString() }),
        createMockEvent({ durationMs: 100, timestamp: today.toISOString() }),
        createMockEvent({ durationMs: 500, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      const traceMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.TRACE);

      expect(traceMetrics?.minDurationMs).toBe(50);
      expect(traceMetrics?.maxDurationMs).toBe(500);
    });

    it('should calculate P95 duration correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [];

      // Create 20 events with durations 100-2000ms
      for (let i = 1; i <= 20; i++) {
        events.push(createMockEvent({ durationMs: i * 100, timestamp: today.toISOString() }));
      }

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      const traceMetrics = stats.toolMetrics.find(m => m.toolName === TOOL_NAMES.TRACE);

      // P95 should be around the 19th value (1900ms)
      expect(traceMetrics?.p95DurationMs).toBeGreaterThanOrEqual(1900);
    });

    it('should return response times via convenience function', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ durationMs: 100, timestamp: today.toISOString() }),
        createMockEvent({ durationMs: 200, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const responseTimes = await ctx.aggregator.getResponseTimes();
      expect(responseTimes.length).toBeGreaterThan(0);
      expect(responseTimes[0].avgDurationMs).toBe(150);
    });
  });

  describe('Popularity Ranking', () => {
    it('should rank tools by popularity correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // trace: 5 invocations
        ...Array(5).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() })
        ),
        // model: 3 invocations
        ...Array(3).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() })
        ),
        // debug: 1 invocation
        createMockEvent({ toolName: TOOL_NAMES.DEBUG, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.popularityRanking[0]).toBe(TOOL_NAMES.TRACE);
      expect(stats.popularityRanking[1]).toBe(TOOL_NAMES.MODEL);
      expect(stats.popularityRanking[2]).toBe(TOOL_NAMES.DEBUG);
    });

    it('should include percentage in popularity ranking', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const ranking = await ctx.aggregator.getPopularityRanking();
      expect(ranking[0].percentage).toBe(50);
    });

    it('should limit popularity ranking results', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.DEBUG, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.DECIDE, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const ranking = await ctx.aggregator.getPopularityRanking(undefined, undefined, 2);
      expect(ranking.length).toBe(2);
    });
  });

  describe('Aggregation Summary', () => {
    it('should generate correct summary', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, durationMs: 100, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, durationMs: 200, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: false, durationMs: 500, errorCategory: 'validation', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const summary = await ctx.aggregator.getSummary();
      expect(summary.totalInvocations).toBe(3);
      expect(summary.totalSuccesses).toBe(2);
      expect(summary.totalErrors).toBe(1);
      expect(summary.mostPopularTool).toBe(TOOL_NAMES.TRACE);
      expect(summary.highestErrorRateTool).toBe(TOOL_NAMES.MODEL);
      expect(summary.slowestTool).toBe(TOOL_NAMES.MODEL);
    });

    it('should handle no data gracefully', async () => {
      const summary = await ctx.aggregator.getSummary();
      expect(summary.totalInvocations).toBe(0);
      expect(summary.mostPopularTool).toBeNull();
      expect(summary.highestErrorRateTool).toBeNull();
      expect(summary.slowestTool).toBeNull();
    });
  });

  describe('Tool Metrics', () => {
    it('should return metrics for specific tool', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const metrics = await ctx.aggregator.getToolMetrics(TOOL_NAMES.TRACE);
      expect(metrics).not.toBeNull();
      expect(metrics?.invocationCount).toBe(2);
    });

    it('should return null for unused tool', async () => {
      const metrics = await ctx.aggregator.getToolMetrics(TOOL_NAMES.TRACE);
      expect(metrics).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', async () => {
      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.totalInvocations).toBe(0);
      expect(stats.toolMetrics).toHaveLength(0);
      expect(stats.trends).toHaveLength(0);
    });

    it('should handle single event', async () => {
      const today = new Date();
      await ctx.storageAdapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.totalInvocations).toBe(1);
      expect(stats.toolMetrics.length).toBe(1);
    });

    it('should handle date range filtering', async () => {
      const today = new Date();
      const tenDaysAgo = daysAgo(10);
      const fiveDaysAgo = daysAgo(5);

      const events: AnalyticsEvent[] = [
        createMockEvent({ timestamp: tenDaysAgo.toISOString() }),
        createMockEvent({ timestamp: fiveDaysAgo.toISOString() }),
        createMockEvent({ timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      // Filter to last 7 days
      const stats = await ctx.aggregator.getUsageStats(
        formatDateString(daysAgo(7)),
        formatDateString(today)
      );

      expect(stats.totalInvocations).toBe(2); // Excludes 10 days ago
    });

    it('should handle all errors (100% error rate)', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'runtime', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.overallErrorRate).toBe(100);
    });

    it('should handle all successes (0% error rate)', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: true, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const stats = await ctx.aggregator.getUsageStats();
      expect(stats.overallErrorRate).toBe(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getAggregator', () => {
      const agg1 = getAggregator();
      const agg2 = getAggregator();
      expect(agg1).toBe(agg2);
    });

    it('should reset singleton on resetAggregator', () => {
      const agg1 = getAggregator();
      resetAggregator();
      const agg2 = getAggregator();
      expect(agg1).not.toBe(agg2);
    });
  });
});

// =============================================================================
// Insights Generator Tests
// =============================================================================

describe('Analytics Insights Generator', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    ctx = await createTestContext();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetAggregator();
    resetErrorTracker();
    resetInsightsGenerator();
    cleanupTestContext(ctx);
  });

  describe('Popularity Insights', () => {
    it('should identify most popular tool', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        ...Array(10).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() })
        ),
        ...Array(2).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() })
        ),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const insights = await ctx.insightsGenerator.getPopularityInsights();
      const mostPopularInsight = insights.find(i => i.title === 'Most Popular Tool');

      expect(mostPopularInsight).toBeDefined();
      expect(mostPopularInsight?.affectedTools).toContain(TOOL_NAMES.TRACE);
    });

    it('should identify underutilized tools', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // trace: 95% of usage
        ...Array(95).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() })
        ),
        // model: 5% of usage
        ...Array(5).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() })
        ),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const insights = await ctx.insightsGenerator.getPopularityInsights();
      const underutilizedInsight = insights.find(i => i.title === 'Underutilized Tool');

      expect(underutilizedInsight).toBeDefined();
      expect(underutilizedInsight?.affectedTools).toContain(TOOL_NAMES.MODEL);
    });

    it('should identify unexplored tools', async () => {
      const today = new Date();
      await ctx.storageAdapter.appendEvents([
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
      ]);

      const insights = await ctx.insightsGenerator.getPopularityInsights();
      const unexploredInsight = insights.find(i => i.title === 'Unexplored Tools');

      expect(unexploredInsight).toBeDefined();
      expect(unexploredInsight?.affectedTools.length).toBeGreaterThan(0);
    });

    it('should detect concentrated usage pattern', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // trace: 50% of usage
        ...Array(50).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() })
        ),
        // model: 40% of usage
        ...Array(40).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.MODEL, timestamp: today.toISOString() })
        ),
        // debug: 10% of usage (spread among 3+ tools to trigger concentration check)
        ...Array(5).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.DEBUG, timestamp: today.toISOString() })
        ),
        ...Array(5).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.DECIDE, timestamp: today.toISOString() })
        ),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const insights = await ctx.insightsGenerator.getPopularityInsights();
      const concentratedInsight = insights.find(i => i.title === 'Concentrated Usage Pattern');

      expect(concentratedInsight).toBeDefined();
    });
  });

  describe('Reliability Insights', () => {
    it('should identify tools with high error rates', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // 30% error rate (above critical threshold)
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const insights = await ctx.insightsGenerator.getReliabilityInsights();
      const errorInsight = insights.find(i =>
        i.category === 'reliability' &&
        (i.title === 'Critical Error Rate' || i.title === 'Elevated Error Rate')
      );

      expect(errorInsight).toBeDefined();
      expect(errorInsight?.severity).toMatch(/critical|warning/);
    });

    it('should report healthy error rates when all tools are good', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // 2% error rate (below threshold)
        ...Array(49).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() })
        ),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const insights = await ctx.insightsGenerator.getReliabilityInsights();
      const healthyInsight = insights.find(i => i.title === 'Healthy Error Rates');

      expect(healthyInsight).toBeDefined();
      expect(healthyInsight?.severity).toBe('info');
    });

    it('should include most common error category in insights', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }),
        createMockEvent({ success: false, errorCategory: 'runtime', timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const insights = await ctx.insightsGenerator.getReliabilityInsights();
      const errorInsight = insights.find(i => i.category === 'reliability' && i.severity !== 'info');

      if (errorInsight) {
        expect(errorInsight.description).toContain('validation');
      }
    });
  });

  describe('Performance Insights', () => {
    it('should identify slow tools', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, durationMs: 2000, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, durationMs: 2500, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, durationMs: 3000, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      // Create insights generator with lower threshold for test
      const testInsightsGenerator = createInsightsGenerator({
        aggregator: ctx.aggregator,
        errorTracker: ctx.errorTracker,
        slowResponseThreshold: 1000,
        minInvocationsForInsight: 1,
      });

      const insights = await testInsightsGenerator.getPerformanceInsights();
      const slowInsight = insights.find(i =>
        i.category === 'performance' &&
        (i.title === 'Slow Response Time' || i.title === 'Response Time Notice')
      );

      expect(slowInsight).toBeDefined();
    });

    it('should identify fastest tool', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, durationMs: 10, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, durationMs: 20, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, durationMs: 30, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const insights = await ctx.insightsGenerator.getPerformanceInsights();
      const fastestInsight = insights.find(i => i.title === 'Fastest Tool');

      expect(fastestInsight).toBeDefined();
      expect(fastestInsight?.affectedTools).toContain(TOOL_NAMES.TRACE);
    });
  });

  describe('Trend Insights', () => {
    it('should detect growing tool usage', async () => {
      const events: AnalyticsEvent[] = [];

      // Create events with growing trend
      // 2 events 10 days ago
      const tenDaysAgo = daysAgo(10);
      events.push(
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: tenDaysAgo.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: tenDaysAgo.toISOString() }),
      );

      // 10 events today
      const today = new Date();
      for (let i = 0; i < 10; i++) {
        events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }));
      }

      await ctx.storageAdapter.appendEvents(events);

      const testInsightsGenerator = createInsightsGenerator({
        aggregator: ctx.aggregator,
        errorTracker: ctx.errorTracker,
        trendChangeThreshold: 20,
        minInvocationsForInsight: 1,
      });

      const insights = await testInsightsGenerator.getTrendInsights();
      const growingInsight = insights.find(i => i.title === 'Growing Tool Usage');

      expect(growingInsight).toBeDefined();
      expect(growingInsight?.affectedTools).toContain(TOOL_NAMES.TRACE);
    });

    it('should detect declining tool usage', async () => {
      const events: AnalyticsEvent[] = [];

      // 10 events 10 days ago
      const tenDaysAgo = daysAgo(10);
      for (let i = 0; i < 10; i++) {
        events.push(createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: tenDaysAgo.toISOString() }));
      }

      // 2 events today
      const today = new Date();
      events.push(
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, timestamp: today.toISOString() }),
      );

      await ctx.storageAdapter.appendEvents(events);

      const testInsightsGenerator = createInsightsGenerator({
        aggregator: ctx.aggregator,
        errorTracker: ctx.errorTracker,
        trendChangeThreshold: 20,
        minInvocationsForInsight: 1,
      });

      const insights = await testInsightsGenerator.getTrendInsights();
      const decliningInsight = insights.find(i => i.title === 'Declining Tool Usage');

      expect(decliningInsight).toBeDefined();
    });

    it('should detect increasing error trend', async () => {
      const events: AnalyticsEvent[] = [];

      // 10 days ago: 10% error rate
      const tenDaysAgo = daysAgo(10);
      for (let i = 0; i < 9; i++) {
        events.push(createMockEvent({ success: true, timestamp: tenDaysAgo.toISOString() }));
      }
      events.push(createMockEvent({ success: false, errorCategory: 'validation', timestamp: tenDaysAgo.toISOString() }));

      // Today: 50% error rate
      const today = new Date();
      for (let i = 0; i < 5; i++) {
        events.push(createMockEvent({ success: true, timestamp: today.toISOString() }));
      }
      for (let i = 0; i < 5; i++) {
        events.push(createMockEvent({ success: false, errorCategory: 'validation', timestamp: today.toISOString() }));
      }

      await ctx.storageAdapter.appendEvents(events);

      const testInsightsGenerator = createInsightsGenerator({
        aggregator: ctx.aggregator,
        errorTracker: ctx.errorTracker,
        trendChangeThreshold: 20,
        minInvocationsForInsight: 1,
      });

      const insights = await testInsightsGenerator.getTrendInsights();
      const errorTrendInsight = insights.find(i => i.title === 'Increasing Error Trend');

      expect(errorTrendInsight).toBeDefined();
      expect(errorTrendInsight?.severity).toBe('warning');
    });
  });

  describe('Report Generation', () => {
    it('should generate complete report', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, durationMs: 100, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, durationMs: 200, timestamp: today.toISOString() }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL, success: false, errorCategory: 'validation', durationMs: 500, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const report = await ctx.insightsGenerator.generateReport();

      expect(report.insights).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalInsights).toBeGreaterThanOrEqual(0);
      expect(report.periodStart).toBeDefined();
      expect(report.periodEnd).toBeDefined();
      expect(report.generatedAt).toBeDefined();
    });

    it('should sort insights by severity', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        // Create conditions for multiple insight types
        ...Array(10).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() })
        ),
        ...Array(5).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.MODEL, success: false, errorCategory: 'validation', timestamp: today.toISOString() })
        ),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const report = await ctx.insightsGenerator.generateReport();

      if (report.insights.length > 1) {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        for (let i = 1; i < report.insights.length; i++) {
          expect(severityOrder[report.insights[i].severity])
            .toBeGreaterThanOrEqual(severityOrder[report.insights[i - 1].severity]);
        }
      }
    });

    it('should count insights by severity', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const report = await ctx.insightsGenerator.generateReport();

      expect(report.summary.totalInsights).toBe(
        report.summary.criticalCount +
        report.summary.warningCount +
        report.summary.infoCount
      );
    });
  });

  describe('Summary Generation', () => {
    it('should generate correct summary', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        ...Array(10).fill(null).map(() =>
          createMockEvent({ toolName: TOOL_NAMES.TRACE, success: true, timestamp: today.toISOString() })
        ),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const summary = await ctx.insightsGenerator.getSummary();

      expect(summary.totalInsights).toBeGreaterThanOrEqual(0);
      expect(summary.mostPopularTool).toBe(TOOL_NAMES.TRACE);
      expect(summary.healthStatus).toBeDefined();
      expect(summary.oneLiner).toBeDefined();
    });

    it('should determine correct health status', async () => {
      const today = new Date();
      // Create healthy data
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const summary = await ctx.insightsGenerator.getSummary();
      expect(['healthy', 'needs-attention', 'critical']).toContain(summary.healthStatus);
    });

    it('should handle no data', async () => {
      const summary = await ctx.insightsGenerator.getSummary();
      expect(summary.totalInsights).toBe(0);
      expect(summary.mostPopularTool).toBeNull();
      expect(summary.oneLiner).toContain('No analytics data');
    });
  });

  describe('Text Report Generation', () => {
    it('should generate formatted text report', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
        createMockEvent({ success: true, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const textReport = await ctx.insightsGenerator.generateTextReport();

      expect(textReport).toContain('ANALYTICS INSIGHTS REPORT');
      expect(textReport).toContain('SUMMARY');
      expect(textReport).toContain('Total Insights:');
    });
  });

  describe('Insight Formatting', () => {
    it('should format insights correctly', async () => {
      const today = new Date();
      const events: AnalyticsEvent[] = [
        createMockEvent({ success: true, timestamp: today.toISOString() }),
      ];

      await ctx.storageAdapter.appendEvents(events);

      const report = await ctx.insightsGenerator.generateReport();
      const formatted = ctx.insightsGenerator.formatInsights(report.insights);

      for (const insight of formatted) {
        expect(insight.icon).toBeDefined();
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.severity).toBeDefined();
        expect(insight.category).toBeDefined();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', async () => {
      const report = await ctx.insightsGenerator.generateReport();
      expect(report.insights).toHaveLength(0);
    });

    it('should handle single event', async () => {
      const today = new Date();
      await ctx.storageAdapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);

      const report = await ctx.insightsGenerator.generateReport();
      expect(report.insights.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle insufficient data for trends', async () => {
      const today = new Date();
      // Single day of data - not enough for meaningful trends
      await ctx.storageAdapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);

      const trendInsights = await ctx.insightsGenerator.getTrendInsights();
      // Should not have growing/declining insights with only one data point
      const growingOrDeclining = trendInsights.filter(i =>
        i.title === 'Growing Tool Usage' || i.title === 'Declining Tool Usage'
      );
      expect(growingOrDeclining.length).toBe(0);
    });

    it('should respect minimum invocations threshold', async () => {
      const today = new Date();
      // Create generator with high threshold
      const highThresholdGenerator = createInsightsGenerator({
        aggregator: ctx.aggregator,
        errorTracker: ctx.errorTracker,
        minInvocationsForInsight: 100,
      });

      await ctx.storageAdapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);

      const insights = await highThresholdGenerator.getPopularityInsights();
      // Should only have "Collecting Usage Data" insight
      const collectingInsight = insights.find(i => i.title === 'Collecting Usage Data');
      expect(collectingInsight).toBeDefined();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getInsightsGenerator', () => {
      const gen1 = getInsightsGenerator();
      const gen2 = getInsightsGenerator();
      expect(gen1).toBe(gen2);
    });

    it('should reset singleton on resetInsightsGenerator', () => {
      const gen1 = getInsightsGenerator();
      resetInsightsGenerator();
      const gen2 = getInsightsGenerator();
      expect(gen1).not.toBe(gen2);
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      resetInsightsGenerator();
      resetAggregator();
      resetStorageAdapter();
      resetErrorTracker();
    });

    it('should work with default singleton', async () => {
      // These should not throw
      const report = await generateInsightsReport();
      expect(report).toBeDefined();
    });
  });
});
