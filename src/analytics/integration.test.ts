/**
 * End-to-End Integration Tests for Analytics
 *
 * Tests the complete analytics flow from opt-in to dashboard viewing:
 * - Complete opt-in flow
 * - Tool tracking end-to-end
 * - Dashboard data accuracy
 * - Privacy guarantees
 * - Retention enforcement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Core types
import { AnalyticsEvent, ANALYTICS_SCHEMA_VERSION } from './types.js';

// Configuration
import {
  AnalyticsConfigManager,
  resetConfigManager,
} from './config.js';

// Storage
import {
  AnalyticsStorageAdapter,
  createStorageAdapter,
  resetStorageAdapter,
} from './storage.js';

// Collection
import {
  AnalyticsCollector,
  createCollector,
  resetCollector,
} from './collector.js';

// Consent
import {
  ConsentManager,
  createConsentManager,
  resetConsentManager,
  deleteConsentFile,
  CURRENT_POLICY_VERSION,
} from './consent.js';

// Tracking
import {
  ToolInvocationTracker,
  createTracker,
  resetTracker,
} from './tracker.js';

// Middleware
import { withAnalytics, withAnalyticsSync } from './middleware.js';

// Aggregation
import {
  AnalyticsAggregator,
  resetAggregator,
} from './aggregator.js';

// Insights
import {
  InsightsGenerator,
  resetInsightsGenerator,
} from './insights.js';

// Errors
import {
  ErrorTracker,
  resetErrorTracker,
} from './errors.js';

// Export
import {
  AnalyticsExporter,
  resetExporter,
} from './export.js';

// Retention
import {
  RetentionPolicyEnforcer,
  resetRetentionEnforcer,
} from './retention.js';

// Deletion
import {
  DataDeletionManager,
  resetDeletionManager,
} from './deletion.js';

// CLI
import {
  runCli,
  enableAnalytics,
  disableAnalytics,
  showStatus,
  exportData,
  clearData,
} from './cli.js';

// Dashboard
import {
  showDashboard,
} from './dashboard-cli.js';

// Tool names
import { TOOL_NAMES, ToolName } from '../toolNames.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(
    os.tmpdir(),
    `think-mcp-e2e-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
 * Creates a complete test context with all components.
 */
interface TestContext {
  tempDir: string;
  configManager: AnalyticsConfigManager;
  storageAdapter: AnalyticsStorageAdapter;
  collector: AnalyticsCollector;
  tracker: ToolInvocationTracker;
  consentManager: ConsentManager;
  aggregator: AnalyticsAggregator;
  insightsGenerator: InsightsGenerator;
  errorTracker: ErrorTracker;
  exporter: AnalyticsExporter;
  retentionEnforcer: RetentionPolicyEnforcer;
  deletionManager: DataDeletionManager;
  cleanup: () => void;
}

/**
 * Creates a complete test context with all analytics components.
 */
async function createTestContext(enabled: boolean = false): Promise<TestContext> {
  const tempDir = createTempDir();

  // Create config manager
  const configManager = new AnalyticsConfigManager({
    enabled,
    storagePath: tempDir,
    batchSize: 5,
    flushIntervalMs: 1000,
    retentionDays: 30,
  });

  // Create storage adapter
  const storageAdapter = createStorageAdapter(tempDir, 30);
  await storageAdapter.initialize();

  // Create collector
  const collector = createCollector(configManager, storageAdapter);

  // Create tracker
  const tracker = createTracker({ collector });

  // Create consent manager
  const consentManager = createConsentManager(configManager);

  // Create aggregator
  const aggregator = new AnalyticsAggregator({ storageAdapter });

  // Create error tracker
  const errorTracker = new ErrorTracker({ storageAdapter });

  // Create insights generator
  const insightsGenerator = new InsightsGenerator({
    aggregator,
    errorTracker,
  });

  // Create exporter
  const exporter = new AnalyticsExporter({
    aggregator,
    insightsGenerator,
    errorTracker,
    storageAdapter,
  });

  // Create retention enforcer
  const retentionEnforcer = new RetentionPolicyEnforcer({
    configManager,
    storageAdapter,
    autoCleanupOnInit: false,
  });

  // Create deletion manager
  const deletionManager = new DataDeletionManager(
    configManager,
    storageAdapter
  );

  const cleanup = () => {
    removeTempDir(tempDir);
  };

  return {
    tempDir,
    configManager,
    storageAdapter,
    collector,
    tracker,
    consentManager,
    aggregator,
    insightsGenerator,
    errorTracker,
    exporter,
    retentionEnforcer,
    deletionManager,
    cleanup,
  };
}

/**
 * Reset all singleton instances.
 */
function resetAllSingletons(): void {
  resetConfigManager();
  resetStorageAdapter();
  resetCollector();
  resetTracker();
  resetConsentManager();
  resetAggregator();
  resetInsightsGenerator();
  resetErrorTracker();
  resetExporter();
  resetRetentionEnforcer();
  resetDeletionManager();
}

// =============================================================================
// End-to-End Integration Tests
// =============================================================================

describe('End-to-End Analytics Flow', () => {
  beforeEach(() => {
    resetAllSingletons();
    deleteConsentFile();
  });

  afterEach(() => {
    resetAllSingletons();
    deleteConsentFile();
  });

  // ===========================================================================
  // Complete Opt-In Flow Tests
  // ===========================================================================

  describe('Complete Opt-In Flow', () => {
    it('should complete full opt-in flow and enable data collection', async () => {
      const ctx = await createTestContext(false);

      try {
        // Step 1: Verify analytics is disabled initially
        expect(ctx.configManager.isEnabled()).toBe(false);
        expect(ctx.consentManager.isConsentGiven()).toBe(false);
        expect(ctx.consentManager.isFirstRun()).toBe(true);

        // Step 2: Attempt tracking while disabled (should be no-op)
        await ctx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100,
        });
        await ctx.collector.flush();

        // Verify no data was written
        let readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(0);

        // Step 3: Grant consent and enable analytics
        const consentResult = await ctx.consentManager.grantConsent({
          enableAnalytics: true,
        });
        expect(consentResult.success).toBe(true);

        // Step 4: Verify consent was recorded
        expect(ctx.consentManager.isConsentGiven()).toBe(true);
        expect(ctx.consentManager.isFirstRun()).toBe(false);
        expect(ctx.configManager.isEnabled()).toBe(true);

        const consentRecord = ctx.consentManager.getConsentRecord();
        expect(consentRecord.hasConsented).toBe(true);
        expect(consentRecord.consentedAt).toBeDefined();
        expect(consentRecord.policyVersion).toBe(CURRENT_POLICY_VERSION);

        // Step 5: Track events after opt-in
        await ctx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 150,
        });
        await ctx.collector.flush();

        // Step 6: Verify data was written
        readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(1);
        expect(readResult.events[0].toolName).toBe(TOOL_NAMES.TRACE);
        expect(readResult.events[0].success).toBe(true);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should handle consent withdrawal and stop data collection', async () => {
      const ctx = await createTestContext(true);

      try {
        // Step 1: Grant consent first
        await ctx.consentManager.grantConsent({ enableAnalytics: true });
        expect(ctx.consentManager.isConsentGiven()).toBe(true);

        // Step 2: Track some events
        await ctx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100,
        });
        await ctx.collector.flush();

        let readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(1);

        // Step 3: Withdraw consent
        const withdrawResult = await ctx.consentManager.withdrawConsent({
          disableAnalytics: true,
        });
        expect(withdrawResult.success).toBe(true);
        expect(ctx.consentManager.isConsentGiven()).toBe(false);

        // Step 4: Verify analytics is disabled
        ctx.configManager.reload();
        expect(ctx.configManager.isEnabled()).toBe(false);

        // Step 5: Try to track more events (should be no-op)
        await ctx.collector.track({
          toolName: TOOL_NAMES.MODEL,
          success: true,
          durationMs: 200,
        });
        await ctx.collector.flush();

        // Step 6: Verify no new events were added
        readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(1);
        expect(readResult.events[0].toolName).toBe(TOOL_NAMES.TRACE);

        // Step 7: Verify withdrawal was recorded
        const consentRecord = ctx.consentManager.getConsentRecord();
        expect(consentRecord.hasConsented).toBe(false);
        expect(consentRecord.withdrawnAt).toBeDefined();
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should handle re-consent after withdrawal', async () => {
      const ctx = await createTestContext(false);

      try {
        // Grant -> Withdraw -> Re-grant
        await ctx.consentManager.grantConsent({ enableAnalytics: true });
        await ctx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100,
        });
        await ctx.collector.flush();

        await ctx.consentManager.withdrawConsent({ disableAnalytics: true });

        // Re-grant
        const reGrantResult = await ctx.consentManager.grantConsent({
          enableAnalytics: true,
        });
        expect(reGrantResult.success).toBe(true);

        // Track more events
        await ctx.collector.track({
          toolName: TOOL_NAMES.MODEL,
          success: true,
          durationMs: 200,
        });
        await ctx.collector.flush();

        // Verify both events exist
        const readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(2);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });
  });

  // ===========================================================================
  // Tool Tracking End-to-End Tests
  // ===========================================================================

  describe('Tool Tracking End-to-End', () => {
    it('should track tool invocations with correct metadata', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track various tools
        const toolsToTrack: Array<{ toolName: ToolName; success: boolean; durationMs: number }> = [
          { toolName: TOOL_NAMES.TRACE, success: true, durationMs: 100 },
          { toolName: TOOL_NAMES.MODEL, success: true, durationMs: 150 },
          { toolName: TOOL_NAMES.DEBUG, success: false, durationMs: 50 },
          { toolName: TOOL_NAMES.DECIDE, success: true, durationMs: 200 },
          { toolName: TOOL_NAMES.PATTERN, success: false, durationMs: 75 },
        ];

        for (const tool of toolsToTrack) {
          await ctx.collector.track({
            toolName: tool.toolName,
            success: tool.success,
            durationMs: tool.durationMs,
            errorCategory: tool.success ? undefined : 'runtime',
          });
        }

        await ctx.collector.flush();

        // Read and verify all events
        const readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(5);

        // Verify each event has correct metadata
        for (let i = 0; i < toolsToTrack.length; i++) {
          const event = readResult.events[i];
          const expected = toolsToTrack[i];

          expect(event.toolName).toBe(expected.toolName);
          expect(event.success).toBe(expected.success);
          expect(event.durationMs).toBe(expected.durationMs);
          expect(event.timestamp).toBeDefined();
          expect(event.sessionId).toBeDefined();

          // Verify error category for failures
          if (!expected.success) {
            expect(event.errorCategory).toBe('runtime');
          } else {
            expect(event.errorCategory).toBeUndefined();
          }
        }
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should track invocations through middleware wrapper', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Use middleware wrapper
        const result = await withAnalytics(
          TOOL_NAMES.TRACE,
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { success: true, result: 'test' };
          },
          { tracker: ctx.tracker }
        );

        expect(result.success).toBe(true);

        // Flush and verify
        await ctx.collector.flush();

        const readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(1);
        expect(readResult.events[0].toolName).toBe(TOOL_NAMES.TRACE);
        expect(readResult.events[0].success).toBe(true);
        expect(readResult.events[0].durationMs).toBeGreaterThanOrEqual(10);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should track errors through middleware wrapper', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Use middleware wrapper with error
        let errorThrown = false;
        try {
          await withAnalytics(
            TOOL_NAMES.DEBUG,
            async () => {
              throw new Error('Test error');
            },
            { tracker: ctx.tracker }
          );
        } catch (error) {
          errorThrown = true;
          expect(error).toBeInstanceOf(Error);
        }

        expect(errorThrown).toBe(true);

        // Flush and verify
        await ctx.collector.flush();

        const readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(1);
        expect(readResult.events[0].toolName).toBe(TOOL_NAMES.DEBUG);
        expect(readResult.events[0].success).toBe(false);
        expect(readResult.events[0].errorCategory).toBe('runtime');
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should track synchronous invocations correctly', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Use sync middleware wrapper
        const result = withAnalyticsSync(
          TOOL_NAMES.MODEL,
          () => {
            return { value: 42 };
          },
          { tracker: ctx.tracker }
        );

        expect(result.value).toBe(42);

        // Flush and verify
        await ctx.collector.flush();

        const readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(1);
        expect(readResult.events[0].toolName).toBe(TOOL_NAMES.MODEL);
        expect(readResult.events[0].success).toBe(true);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should handle batching correctly', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track events less than batch size (5)
        for (let i = 0; i < 3; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.TRACE,
            success: true,
            durationMs: 100 + i,
          });
        }

        // Should not be written yet (pending in batch)
        let storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalEvents).toBe(0);

        // Track more to trigger auto-flush (batch size = 5)
        for (let i = 0; i < 3; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.TRACE,
            success: true,
            durationMs: 200 + i,
          });
        }

        // Wait for auto-flush
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should have flushed first batch
        storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalEvents).toBeGreaterThanOrEqual(5);

        // Manual flush remaining
        await ctx.collector.flush();

        storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalEvents).toBe(6);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });
  });

  // ===========================================================================
  // Dashboard Data Accuracy Tests
  // ===========================================================================

  describe('Dashboard Data Accuracy', () => {
    it('should aggregate tool usage correctly', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track specific pattern of tool usage
        const usagePattern = [
          { toolName: TOOL_NAMES.TRACE, count: 5 },
          { toolName: TOOL_NAMES.MODEL, count: 3 },
          { toolName: TOOL_NAMES.DEBUG, count: 2 },
        ];

        for (const pattern of usagePattern) {
          for (let i = 0; i < pattern.count; i++) {
            await ctx.collector.track({
              toolName: pattern.toolName,
              success: true,
              durationMs: 100,
            });
          }
        }

        await ctx.collector.flush();

        // Get usage stats
        const stats = await ctx.aggregator.getUsageStats();

        // Verify totals
        expect(stats.totalInvocations).toBe(10);
        expect(stats.totalSuccesses).toBe(10);
        expect(stats.totalErrors).toBe(0);

        // Verify per-tool counts
        const traceMetrics = stats.toolMetrics.find((m) => m.toolName === TOOL_NAMES.TRACE);
        const modelMetrics = stats.toolMetrics.find((m) => m.toolName === TOOL_NAMES.MODEL);
        const debugMetrics = stats.toolMetrics.find((m) => m.toolName === TOOL_NAMES.DEBUG);

        expect(traceMetrics?.invocationCount).toBe(5);
        expect(modelMetrics?.invocationCount).toBe(3);
        expect(debugMetrics?.invocationCount).toBe(2);

        // Verify popularity ranking
        expect(stats.popularityRanking[0]).toBe(TOOL_NAMES.TRACE);
        expect(stats.popularityRanking[1]).toBe(TOOL_NAMES.MODEL);
        expect(stats.popularityRanking[2]).toBe(TOOL_NAMES.DEBUG);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should calculate error rates correctly', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track mix of successes and failures
        // TRACE: 8 success, 2 errors = 20% error rate
        for (let i = 0; i < 8; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.TRACE,
            success: true,
            durationMs: 100,
          });
        }
        for (let i = 0; i < 2; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.TRACE,
            success: false,
            durationMs: 50,
            errorCategory: 'runtime',
          });
        }

        // MODEL: 5 success, 5 errors = 50% error rate
        for (let i = 0; i < 5; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.MODEL,
            success: true,
            durationMs: 100,
          });
        }
        for (let i = 0; i < 5; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.MODEL,
            success: false,
            durationMs: 50,
            errorCategory: 'validation',
          });
        }

        await ctx.collector.flush();

        // Get error stats
        const errorStats = await ctx.errorTracker.getErrorStats();

        // Verify overall error rate
        // Total: 20 events, 7 errors = 35% error rate
        expect(errorStats.totalInvocations).toBe(20);
        expect(errorStats.totalErrors).toBe(7);
        expect(errorStats.overallErrorRate).toBeCloseTo(0.35, 2);

        // Verify per-tool error rates
        const traceErrors = errorStats.errorsByTool[TOOL_NAMES.TRACE];
        const modelErrors = errorStats.errorsByTool[TOOL_NAMES.MODEL];

        expect(traceErrors.errorCount).toBe(2);
        expect(traceErrors.errorRate).toBeCloseTo(0.2, 2);

        expect(modelErrors.errorCount).toBe(5);
        expect(modelErrors.errorRate).toBeCloseTo(0.5, 2);

        // Check problematic tools
        const problematicTools = await ctx.errorTracker.getProblematicTools(0.25);
        expect(problematicTools).toHaveLength(1);
        expect(problematicTools[0].toolName).toBe(TOOL_NAMES.MODEL);
        expect(problematicTools[0].severity).toBe('critical'); // 50% error rate
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should generate accurate insights', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Create usage patterns that should trigger insights
        // High usage tool (popularity insight)
        for (let i = 0; i < 50; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.TRACE,
            success: true,
            durationMs: 100,
          });
        }

        // Problem tool (reliability insight)
        for (let i = 0; i < 10; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.DEBUG,
            success: false,
            durationMs: 50,
            errorCategory: 'runtime',
          });
        }

        await ctx.collector.flush();

        // Get insights
        const report = await ctx.insightsGenerator.generateReport();
        const summary = await ctx.insightsGenerator.getSummary();

        // Should have insights
        expect(report.insights.length).toBeGreaterThan(0);

        // Check for popularity insight
        const popularityInsights = report.insights.filter(
          (i) => i.category === 'popularity'
        );
        expect(popularityInsights.length).toBeGreaterThan(0);

        // Check for reliability insight (high error rate)
        const reliabilityInsights = report.insights.filter(
          (i) => i.category === 'reliability'
        );
        expect(reliabilityInsights.length).toBeGreaterThan(0);

        // Verify summary
        expect(summary.healthStatus).toBe('critical'); // Due to 100% error rate on DEBUG
        expect(summary.criticalCount).toBeGreaterThan(0);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should export accurate dashboard data', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track events
        const toolsToTrack = [TOOL_NAMES.TRACE, TOOL_NAMES.MODEL, TOOL_NAMES.DEBUG];
        for (const toolName of toolsToTrack) {
          for (let i = 0; i < 5; i++) {
            await ctx.collector.track({
              toolName,
              success: i < 4, // 1 failure each
              durationMs: 100 + i * 10,
              errorCategory: i >= 4 ? 'runtime' : undefined,
            });
          }
        }

        await ctx.collector.flush();

        // Export dashboard data
        const exportResult = await ctx.exporter.exportForDashboard({
          includeRawEvents: true,
          includeStats: true,
          includeInsights: true,
          includeErrors: true,
          includeTrends: true,
        });

        expect(exportResult.success).toBe(true);
        expect(exportResult.data).toBeDefined();

        const data = exportResult.data!;

        // Verify metadata
        expect(data.metadata.version).toBe('1.0.0');
        expect(data.metadata.privacyVersion).toBeDefined();

        // Verify summary
        expect(data.summary.totalInvocations).toBe(15);
        expect(data.summary.errorRate).toBeCloseTo(20, 0); // 3 errors out of 15
        expect(data.summary.toolsUsed).toBe(3);

        // Verify raw events
        expect(data.rawEvents).toHaveLength(15);

        // Verify tool metrics
        expect(data.toolMetrics).toHaveLength(3);

        // Verify storage info
        expect(data.storageInfo).toBeDefined();
        expect(data.storageInfo!.totalEvents).toBe(15);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });
  });

  // ===========================================================================
  // Privacy Guarantees Tests
  // ===========================================================================

  describe('Privacy Guarantees', () => {
    it('should never capture tool arguments or content', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track event (simulating tool with arguments)
        const invocation = ctx.tracker.startInvocation(TOOL_NAMES.TRACE);
        invocation.complete(true);

        await ctx.collector.flush();

        // Read events and verify no content fields
        const readResult = await ctx.storageAdapter.readEvents();
        const event = readResult.events[0];

        // Verify only allowed fields are present
        const allowedFields = [
          'toolName',
          'timestamp',
          'success',
          'durationMs',
          'sessionId',
          'errorCategory',
        ];

        const eventKeys = Object.keys(event);
        for (const key of eventKeys) {
          expect(allowedFields).toContain(key);
        }

        // Verify no content-related fields
        expect((event as any).arguments).toBeUndefined();
        expect((event as any).content).toBeUndefined();
        expect((event as any).input).toBeUndefined();
        expect((event as any).output).toBeUndefined();
        expect((event as any).result).toBeUndefined();
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should never capture error messages', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track error event
        const sensitiveErrorMessage = 'User john@example.com failed authentication with password xyz123';
        try {
          await withAnalytics(
            TOOL_NAMES.DEBUG,
            async () => {
              throw new Error(sensitiveErrorMessage);
            },
            { tracker: ctx.tracker }
          );
        } catch {
          // Expected
        }

        await ctx.collector.flush();

        // Read events and verify no error message
        const readResult = await ctx.storageAdapter.readEvents();
        const event = readResult.events[0];

        // Verify error message is NOT captured
        expect((event as any).errorMessage).toBeUndefined();
        expect((event as any).message).toBeUndefined();
        expect((event as any).error).toBeUndefined();
        expect((event as any).stack).toBeUndefined();

        // Verify only category is captured
        expect(event.errorCategory).toBe('runtime');
        expect(event.success).toBe(false);

        // Verify JSON doesn't contain sensitive data
        const jsonString = JSON.stringify(event);
        expect(jsonString).not.toContain('john@example.com');
        expect(jsonString).not.toContain('xyz123');
        expect(jsonString).not.toContain(sensitiveErrorMessage);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should generate anonymous session IDs', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track events
        await ctx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100,
        });
        await ctx.collector.flush();

        // Read events
        const readResult = await ctx.storageAdapter.readEvents();
        const sessionId = readResult.events[0].sessionId;

        // Verify session ID format (16 char alphanumeric)
        expect(sessionId).toMatch(/^[a-z0-9]{16}$/);

        // Verify session ID doesn't contain identifiable info
        expect(sessionId).not.toContain(os.hostname());
        expect(sessionId).not.toContain(os.userInfo().username);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should categorize errors without capturing details', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Track various error types
        const errorTypes: Array<{ error: Error; expectedCategory: string }> = [
          { error: new TypeError('Invalid type'), expectedCategory: 'validation' },
          { error: new Error('General error'), expectedCategory: 'runtime' },
        ];

        // Create a custom timeout error
        class TimeoutError extends Error {
          constructor() {
            super('Operation timed out');
            this.name = 'TimeoutError';
          }
        }
        errorTypes.push({ error: new TimeoutError(), expectedCategory: 'timeout' });

        for (const { error, expectedCategory } of errorTypes) {
          try {
            await withAnalytics(
              TOOL_NAMES.TRACE,
              async () => {
                throw error;
              },
              { tracker: ctx.tracker }
            );
          } catch {
            // Expected
          }
        }

        await ctx.collector.flush();

        // Read and verify
        const readResult = await ctx.storageAdapter.readEvents();

        for (let i = 0; i < errorTypes.length; i++) {
          const event = readResult.events[i];
          expect(event.errorCategory).toBe(errorTypes[i].expectedCategory);
          expect(event.success).toBe(false);
        }
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should not collect any data when analytics is disabled', async () => {
      const ctx = await createTestContext(false); // Disabled

      try {
        // Don't grant consent, keep disabled

        // Track many events
        for (let i = 0; i < 100; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.TRACE,
            success: true,
            durationMs: 100,
          });
        }

        await ctx.collector.flush();

        // Verify no data was written
        const readResult = await ctx.storageAdapter.readEvents();
        expect(readResult.events).toHaveLength(0);

        const storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalEvents).toBe(0);
        expect(storageInfo.totalFiles).toBe(0);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });
  });

  // ===========================================================================
  // Retention Enforcement Tests
  // ===========================================================================

  describe('Retention Enforcement', () => {
    it('should clean up files older than retention period', async () => {
      const ctx = await createTestContext(true);

      try {
        // Create old files manually
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 60); // 60 days ago (beyond 30 day retention)
        const oldDateStr = formatDateString(oldDate);
        const oldFileName = `analytics-${oldDateStr}.json`;
        const oldFilePath = path.join(ctx.tempDir, oldFileName);

        fs.writeFileSync(
          oldFilePath,
          JSON.stringify({
            schemaVersion: ANALYTICS_SCHEMA_VERSION,
            date: oldDateStr,
            events: [
              {
                toolName: TOOL_NAMES.TRACE,
                timestamp: oldDate.toISOString(),
                success: true,
                durationMs: 100,
                sessionId: 'old-session',
              },
            ],
            lastModified: oldDate.toISOString(),
          })
        );

        // Create recent file
        await ctx.storageAdapter.appendEvents([
          {
            toolName: TOOL_NAMES.TRACE,
            timestamp: new Date().toISOString(),
            success: true,
            durationMs: 100,
            sessionId: 'recent-session',
          },
        ]);

        // Verify both files exist
        expect(fs.existsSync(oldFilePath)).toBe(true);
        let storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalFiles).toBe(2);

        // Run retention cleanup
        const result = await ctx.retentionEnforcer.runCleanup();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(1);

        // Verify old file was deleted
        expect(fs.existsSync(oldFilePath)).toBe(false);

        storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalFiles).toBe(1);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should preserve files within retention period', async () => {
      const ctx = await createTestContext(true);

      try {
        // Create files at various ages within retention
        const dates = [0, 7, 14, 21, 28]; // Days ago

        for (const daysAgo of dates) {
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);

          await ctx.storageAdapter.appendEvents([
            {
              toolName: TOOL_NAMES.TRACE,
              timestamp: date.toISOString(),
              success: true,
              durationMs: 100,
              sessionId: `session-${daysAgo}`,
            },
          ]);
        }

        // Run retention cleanup
        const result = await ctx.retentionEnforcer.runCleanup();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(0);

        // Verify all files preserved
        const storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalFiles).toBe(dates.length);
        expect(storageInfo.totalEvents).toBe(dates.length);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should support dry run mode', async () => {
      const ctx = await createTestContext(true);

      try {
        // Create old file
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 60);
        const oldDateStr = formatDateString(oldDate);
        const oldFileName = `analytics-${oldDateStr}.json`;
        const oldFilePath = path.join(ctx.tempDir, oldFileName);

        fs.writeFileSync(
          oldFilePath,
          JSON.stringify({
            schemaVersion: ANALYTICS_SCHEMA_VERSION,
            date: oldDateStr,
            events: [
              {
                toolName: TOOL_NAMES.TRACE,
                timestamp: oldDate.toISOString(),
                success: true,
                durationMs: 100,
                sessionId: 'old-session',
              },
            ],
            lastModified: oldDate.toISOString(),
          })
        );

        // Run dry run cleanup
        const result = await ctx.retentionEnforcer.runCleanup(true);

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(1); // Would delete

        // Verify file still exists (dry run)
        expect(fs.existsSync(oldFilePath)).toBe(true);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });

    it('should completely delete all data on user request', async () => {
      const ctx = await createTestContext(true);

      try {
        await ctx.consentManager.grantConsent({ enableAnalytics: true });

        // Create some data
        for (let i = 0; i < 10; i++) {
          await ctx.collector.track({
            toolName: TOOL_NAMES.TRACE,
            success: true,
            durationMs: 100,
          });
        }
        await ctx.collector.flush();

        // Verify data exists
        let storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalEvents).toBe(10);

        // Delete all data
        const result = await ctx.deletionManager.deleteAllData();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBeGreaterThan(0);

        // Verify all data deleted
        storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalEvents).toBe(0);
        expect(storageInfo.totalFiles).toBe(0);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });
  });

  // ===========================================================================
  // Complete User Journey Test
  // ===========================================================================

  describe('Complete User Journey', () => {
    it('should handle complete analytics lifecycle', async () => {
      const ctx = await createTestContext(false);

      try {
        // ===== Stage 1: First run - analytics disabled =====
        expect(ctx.consentManager.isFirstRun()).toBe(true);
        expect(ctx.configManager.isEnabled()).toBe(false);

        // ===== Stage 2: User opts in =====
        await ctx.consentManager.grantConsent({ enableAnalytics: true });
        expect(ctx.configManager.isEnabled()).toBe(true);

        // ===== Stage 3: User uses tools for a while =====
        const tools = [TOOL_NAMES.TRACE, TOOL_NAMES.MODEL, TOOL_NAMES.DEBUG, TOOL_NAMES.DECIDE];

        // Simulate realistic usage over time
        for (let day = 0; day < 5; day++) {
          const date = new Date();
          date.setDate(date.getDate() - day);

          for (const toolName of tools) {
            const invocations = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < invocations; i++) {
              await ctx.collector.track({
                toolName,
                success: Math.random() > 0.1, // 90% success rate
                durationMs: Math.floor(Math.random() * 200) + 50,
                timestamp: date.toISOString(),
                errorCategory: Math.random() > 0.1 ? undefined : 'runtime',
              });
            }
          }
        }
        await ctx.collector.flush();

        // ===== Stage 4: User views dashboard =====
        const stats = await ctx.aggregator.getUsageStats();
        expect(stats.totalInvocations).toBeGreaterThan(0);
        expect(stats.toolMetrics.length).toBeGreaterThan(0);

        const insights = await ctx.insightsGenerator.generateReport();
        expect(insights.insights).toBeDefined();

        const exportResult = await ctx.exporter.exportForDashboard();
        expect(exportResult.success).toBe(true);
        expect(exportResult.data?.summary.totalInvocations).toBeGreaterThan(0);

        // ===== Stage 5: User requests data export =====
        const fullExport = await ctx.exporter.exportFull();
        expect(fullExport.success).toBe(true);
        expect(fullExport.data?.rawEvents?.length).toBeGreaterThan(0);

        // ===== Stage 6: User opts out =====
        await ctx.consentManager.withdrawConsent({ disableAnalytics: true });
        ctx.configManager.reload();
        expect(ctx.configManager.isEnabled()).toBe(false);

        // ===== Stage 7: Verify no more data collected =====
        await ctx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100,
        });
        await ctx.collector.flush();

        // Event count should not increase
        const newStats = await ctx.aggregator.getUsageStats();
        expect(newStats.totalInvocations).toBe(stats.totalInvocations);

        // ===== Stage 8: User requests data deletion =====
        const deletionResult = await ctx.deletionManager.deleteAllData();
        expect(deletionResult.success).toBe(true);

        // ===== Stage 9: Verify all data deleted =====
        const storageInfo = ctx.storageAdapter.getStorageInfo();
        expect(storageInfo.totalEvents).toBe(0);
        expect(storageInfo.totalFiles).toBe(0);
      } finally {
        await ctx.collector.shutdown();
        ctx.cleanup();
      }
    });
  });
});

// =============================================================================
// CLI Integration Tests
// =============================================================================

describe('CLI Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    resetAllSingletons();
    deleteConsentFile();
    tempDir = createTempDir();
  });

  afterEach(() => {
    resetAllSingletons();
    deleteConsentFile();
    removeTempDir(tempDir);
  });

  it('should enable analytics via CLI', async () => {
    const result = await enableAnalytics();
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should show status via CLI', async () => {
    const result = await showStatus();
    expect(result.success).toBe(true);
    expect(result.message).toContain('ANALYTICS STATUS');
  });

  it('should disable analytics via CLI', async () => {
    await enableAnalytics();
    const result = await disableAnalytics();
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  it('should run full CLI workflow', async () => {
    // Enable
    let result = await runCli(['enable']);
    expect(result.success).toBe(true);

    // Status
    result = await runCli(['status']);
    expect(result.success).toBe(true);
    expect(result.message).toContain('ENABLED');

    // Disable
    result = await runCli(['disable']);
    expect(result.success).toBe(true);

    // Status after disable
    result = await runCli(['status']);
    expect(result.success).toBe(true);
    expect(result.message).toContain('DISABLED');
  });
});
