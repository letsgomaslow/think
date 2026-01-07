/**
 * Comprehensive Unit Tests for Retention Policy Enforcement and Data Deletion
 *
 * Tests for:
 * - Cleanup removes old files correctly
 * - Retention period configuration
 * - Complete data deletion
 * - Edge cases (empty storage, errors, etc.)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import {
  RetentionPolicyEnforcer,
  getRetentionEnforcer,
  resetRetentionEnforcer,
  createRetentionEnforcer,
  initializeRetention,
  runRetentionCleanup,
  startScheduledRetentionCleanup,
  stopScheduledRetentionCleanup,
  getRetentionStats,
  getRetentionDays,
  getCleanupLogs,
  CleanupLogEntry,
  ExtendedCleanupResult,
  RetentionStats,
} from './retention.js';

import {
  DataDeletionManager,
  getDeletionManager,
  resetDeletionManager,
  createDeletionManager,
  deleteAllAnalyticsData,
  getConfirmationPrompt,
  getBriefConfirmation,
  getSuccessMessage,
  getDeletionStats,
  getDeletionLogs,
  formatDeletionResult,
  DELETION_CONFIRMATION_PROMPT,
  DELETION_CONFIRMATION_BRIEF,
  DELETION_SUCCESS_MESSAGE,
  DELETION_SUCCESS_WITH_CONSENT_MESSAGE,
  DeletionResult,
  DeletionLogEntry,
  DeletionStats,
} from './deletion.js';

import {
  AnalyticsConfigManager,
  getConfigManager,
  resetConfigManager,
} from './config.js';

import {
  AnalyticsStorageAdapter,
  createStorageAdapter,
  getStorageAdapter,
  resetStorageAdapter,
} from './storage.js';

import {
  createCollector,
  getCollector,
  resetCollector,
} from './collector.js';

import {
  resetConsentManager,
  writeConsentFile,
  readConsentFile,
  deleteConsentFile,
} from './consent.js';

import { ANALYTICS_SCHEMA_VERSION, AnalyticsEvent } from './types.js';
import { TOOL_NAMES } from '../toolNames.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(
    os.tmpdir(),
    `think-mcp-retention-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
 * Creates an analytics file for a specific date.
 */
function createAnalyticsFile(
  storagePath: string,
  dateString: string,
  events: AnalyticsEvent[] = [createMockEvent()]
): string {
  const fileName = `analytics-${dateString}.json`;
  const filePath = path.join(storagePath, fileName);

  const fileContent = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    date: dateString,
    events,
    lastModified: new Date().toISOString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
  return filePath;
}

/**
 * Gets a date string for N days ago.
 */
function getDaysAgoString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateString(date);
}

/**
 * Test context type for organized test setup.
 */
interface TestContext {
  tempDir: string;
  configManager: AnalyticsConfigManager;
  storageAdapter: AnalyticsStorageAdapter;
  enforcer: RetentionPolicyEnforcer;
  deletionManager: DataDeletionManager;
}

/**
 * Creates a test context with all necessary dependencies.
 */
async function createTestContext(retentionDays: number = 7): Promise<TestContext> {
  const tempDir = createTempDir();

  const configManager = new AnalyticsConfigManager({
    enabled: true,
    storagePath: tempDir,
    retentionDays,
    batchSize: 10,
    flushIntervalMs: 5000,
  });

  const storageAdapter = createStorageAdapter(tempDir, retentionDays);
  await storageAdapter.initialize();

  const enforcer = createRetentionEnforcer({
    configManager,
    storageAdapter,
    autoCleanupOnInit: false, // Manual control in tests
  });

  const deletionManager = createDeletionManager(configManager, storageAdapter);

  return {
    tempDir,
    configManager,
    storageAdapter,
    enforcer,
    deletionManager,
  };
}

/**
 * Cleans up a test context.
 */
function cleanupTestContext(ctx: TestContext): void {
  ctx.enforcer.reset();
  ctx.deletionManager.reset();
  removeTempDir(ctx.tempDir);
}

// =============================================================================
// Retention Policy Enforcer Tests
// =============================================================================

describe('Retention Policy Enforcer Module', () => {
  beforeEach(() => {
    resetRetentionEnforcer();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
  });

  afterEach(() => {
    resetRetentionEnforcer();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
  });

  describe('RetentionPolicyEnforcer Class', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7); // 7-day retention
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    describe('Cleanup Removes Old Files', () => {
      it('should delete files older than retention period', async () => {
        // Create an old file (10 days ago)
        const oldDateStr = getDaysAgoString(10);
        const oldFilePath = createAnalyticsFile(ctx.tempDir, oldDateStr);

        // Create a recent file (2 days ago)
        const recentDateStr = getDaysAgoString(2);
        const recentFilePath = createAnalyticsFile(ctx.tempDir, recentDateStr);

        // Verify both files exist
        expect(fs.existsSync(oldFilePath)).toBe(true);
        expect(fs.existsSync(recentFilePath)).toBe(true);

        // Run cleanup
        const result = await ctx.enforcer.runCleanup();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(1);

        // Old file should be deleted, recent file preserved
        expect(fs.existsSync(oldFilePath)).toBe(false);
        expect(fs.existsSync(recentFilePath)).toBe(true);
      });

      it('should delete multiple old files', async () => {
        // Create several old files
        const oldDates = [15, 20, 30, 45];
        const oldFilePaths = oldDates.map(days =>
          createAnalyticsFile(ctx.tempDir, getDaysAgoString(days))
        );

        // Create a recent file
        const recentFilePath = createAnalyticsFile(ctx.tempDir, getDaysAgoString(1));

        // Run cleanup
        const result = await ctx.enforcer.runCleanup();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(4);

        // All old files should be deleted
        for (const filePath of oldFilePaths) {
          expect(fs.existsSync(filePath)).toBe(false);
        }

        // Recent file should be preserved
        expect(fs.existsSync(recentFilePath)).toBe(true);
      });

      it('should preserve files within retention period', async () => {
        // Create files within retention period
        const recentDates = [0, 1, 3, 5];
        const filePaths = recentDates.map(days =>
          createAnalyticsFile(ctx.tempDir, getDaysAgoString(days))
        );

        // Run cleanup
        const result = await ctx.enforcer.runCleanup();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(0);

        // All files should still exist
        for (const filePath of filePaths) {
          expect(fs.existsSync(filePath)).toBe(true);
        }
      });

      it('should report correct event count in cleanup result', async () => {
        // Create old file with multiple events
        const oldDateStr = getDaysAgoString(10);
        const events = [
          createMockEvent({ toolName: TOOL_NAMES.TRACE }),
          createMockEvent({ toolName: TOOL_NAMES.MODEL }),
          createMockEvent({ toolName: TOOL_NAMES.DEBUG }),
        ];
        createAnalyticsFile(ctx.tempDir, oldDateStr, events);

        // Run cleanup
        const result = await ctx.enforcer.runCleanup();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(1);
        expect(result.eventsDeleted).toBe(3);
      });

      it('should support dry run mode', async () => {
        // Create old file
        const oldDateStr = getDaysAgoString(10);
        const oldFilePath = createAnalyticsFile(ctx.tempDir, oldDateStr);

        // Run cleanup in dry run mode
        const result = await ctx.enforcer.runCleanup(true);

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(1);
        expect(result.dryRun).toBe(true);

        // File should still exist (dry run)
        expect(fs.existsSync(oldFilePath)).toBe(true);
      });

      it('should include metadata in cleanup result', async () => {
        const oldFilePath = createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        const result = await ctx.enforcer.runCleanup();

        expect(result.retentionDays).toBe(7);
        expect(result.cutoffDate).toBeDefined();
        expect(result.durationMs).toBeGreaterThanOrEqual(0);
        expect(result.dryRun).toBe(false);
      });
    });

    describe('Retention Period Configuration', () => {
      it('should use retention days from config', () => {
        expect(ctx.enforcer.getRetentionDays()).toBe(7);
      });

      it('should respect different retention periods', async () => {
        // Create context with 30-day retention
        const ctx30 = await createTestContext(30);

        // Create file 20 days old (should be preserved with 30-day retention)
        const dateStr = getDaysAgoString(20);
        const filePath = createAnalyticsFile(ctx30.tempDir, dateStr);

        // Run cleanup
        const result = await ctx30.enforcer.runCleanup();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(0);
        expect(fs.existsSync(filePath)).toBe(true);

        cleanupTestContext(ctx30);
      });

      it('should delete file at exact retention boundary', async () => {
        // Create file exactly at retention period (7 days ago)
        const dateStr = getDaysAgoString(7);
        const filePath = createAnalyticsFile(ctx.tempDir, dateStr);

        // Run cleanup
        const result = await ctx.enforcer.runCleanup();

        // File at exactly retention period should be deleted
        expect(result.filesDeleted).toBe(1);
        expect(fs.existsSync(filePath)).toBe(false);
      });

      it('should preserve file just inside retention period', async () => {
        // Create file 6 days ago (inside 7-day retention)
        const dateStr = getDaysAgoString(6);
        const filePath = createAnalyticsFile(ctx.tempDir, dateStr);

        // Run cleanup
        const result = await ctx.enforcer.runCleanup();

        expect(result.filesDeleted).toBe(0);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    describe('Initialization', () => {
      it('should run cleanup on initialization when autoCleanupOnInit is true', async () => {
        // Create a new enforcer with auto-cleanup enabled
        const autoEnforcer = createRetentionEnforcer({
          configManager: ctx.configManager,
          storageAdapter: ctx.storageAdapter,
          autoCleanupOnInit: true,
        });

        // Create old file before initialization
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        // Initialize - should run cleanup
        const result = await autoEnforcer.initialize();

        expect(result).not.toBeNull();
        expect(result?.filesDeleted).toBe(1);
      });

      it('should not run cleanup on initialization when autoCleanupOnInit is false', async () => {
        // Create old file
        const oldFilePath = createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        // Initialize (auto cleanup already false in test context)
        const result = await ctx.enforcer.initialize();

        expect(result).toBeNull();
        expect(fs.existsSync(oldFilePath)).toBe(true);
      });

      it('should only initialize once', async () => {
        const result1 = await ctx.enforcer.initialize();
        const result2 = await ctx.enforcer.initialize();

        expect(result1).toBeNull(); // First init, but no auto-cleanup
        expect(result2).toBeNull(); // Second init should be no-op
      });
    });

    describe('Logging', () => {
      it('should log cleanup actions', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        await ctx.enforcer.runCleanup();

        const logs = ctx.enforcer.getCleanupLogs();
        expect(logs.length).toBeGreaterThan(0);

        // Should have start and completion logs
        const actions = logs.map(l => l.action);
        expect(actions).toContain('cleanup_started');
        expect(actions).toContain('cleanup_completed');
      });

      it('should log dry run actions', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        await ctx.enforcer.runCleanup(true);

        const logs = ctx.enforcer.getCleanupLogs();
        const dryRunLog = logs.find(l => l.action === 'dry_run');
        expect(dryRunLog).toBeDefined();
        expect(dryRunLog?.details.dryRun).toBe(true);
      });

      it('should use custom logger when provided', async () => {
        const loggedEntries: CleanupLogEntry[] = [];
        const customLogger = (entry: CleanupLogEntry) => {
          loggedEntries.push(entry);
        };

        ctx.enforcer.setLogger(customLogger);
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        await ctx.enforcer.runCleanup();

        expect(loggedEntries.length).toBeGreaterThan(0);
      });

      it('should clear cleanup logs', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));
        await ctx.enforcer.runCleanup();

        expect(ctx.enforcer.getCleanupLogs().length).toBeGreaterThan(0);

        ctx.enforcer.clearCleanupLogs();

        expect(ctx.enforcer.getCleanupLogs()).toHaveLength(0);
      });

      it('should limit log entries to MAX_LOG_ENTRIES', async () => {
        // Run many cleanups to generate many log entries
        for (let i = 0; i < 60; i++) {
          await ctx.enforcer.runCleanup();
        }

        // 60 cleanups * 2 log entries each = 120, but should be limited to 100
        const logs = ctx.enforcer.getCleanupLogs();
        expect(logs.length).toBeLessThanOrEqual(100);
      });
    });

    describe('Statistics', () => {
      it('should track cleanup statistics', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10), [
          createMockEvent(),
          createMockEvent(),
        ]);
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(15), [
          createMockEvent(),
        ]);

        await ctx.enforcer.runCleanup();

        const stats = ctx.enforcer.getStats();

        expect(stats.totalCleanups).toBe(1);
        expect(stats.totalFilesDeleted).toBe(2);
        expect(stats.totalEventsDeleted).toBe(3);
        expect(stats.lastCleanupAt).toBeDefined();
        expect(stats.lastCleanupResult).not.toBeNull();
      });

      it('should not update statistics for dry run', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        await ctx.enforcer.runCleanup(true);

        const stats = ctx.enforcer.getStats();

        expect(stats.totalCleanups).toBe(0);
        expect(stats.totalFilesDeleted).toBe(0);
        expect(stats.lastCleanupAt).toBeNull();
      });

      it('should accumulate statistics across multiple cleanups', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));
        await ctx.enforcer.runCleanup();

        createAnalyticsFile(ctx.tempDir, getDaysAgoString(12));
        await ctx.enforcer.runCleanup();

        const stats = ctx.enforcer.getStats();

        expect(stats.totalCleanups).toBe(2);
        expect(stats.totalFilesDeleted).toBe(2);
      });
    });

    describe('Scheduled Cleanup', () => {
      it('should start and stop scheduled cleanup', () => {
        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(false);

        ctx.enforcer.startScheduledCleanup(100000);
        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(true);

        ctx.enforcer.stopScheduledCleanup();
        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(false);
      });

      it('should stop existing scheduled cleanup when starting new one', () => {
        ctx.enforcer.startScheduledCleanup(100000);
        ctx.enforcer.startScheduledCleanup(200000);

        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(true);

        ctx.enforcer.stopScheduledCleanup();
        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(false);
      });
    });

    describe('Shutdown', () => {
      it('should run final cleanup on shutdown', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        const result = await ctx.enforcer.shutdown();

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(1);
      });

      it('should stop scheduled cleanup on shutdown', async () => {
        ctx.enforcer.startScheduledCleanup(100000);
        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(true);

        await ctx.enforcer.shutdown();

        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(false);
      });
    });

    describe('Reset', () => {
      it('should reset all state', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));
        await ctx.enforcer.initialize();
        await ctx.enforcer.runCleanup();
        ctx.enforcer.startScheduledCleanup(100000);

        ctx.enforcer.reset();

        const stats = ctx.enforcer.getStats();
        expect(stats.initialized).toBe(false);
        expect(stats.totalCleanups).toBe(0);
        expect(stats.totalFilesDeleted).toBe(0);
        expect(stats.lastCleanupAt).toBeNull();
        expect(ctx.enforcer.isScheduledCleanupActive()).toBe(false);
        expect(ctx.enforcer.getCleanupLogs()).toHaveLength(0);
      });
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getRetentionEnforcer', () => {
      const enforcer1 = getRetentionEnforcer();
      const enforcer2 = getRetentionEnforcer();
      expect(enforcer1).toBe(enforcer2);
    });

    it('should create new instance after resetRetentionEnforcer', () => {
      const enforcer1 = getRetentionEnforcer();
      resetRetentionEnforcer();
      const enforcer2 = getRetentionEnforcer();
      expect(enforcer1).not.toBe(enforcer2);
    });
  });

  describe('Convenience Functions', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      removeTempDir(tempDir);
    });

    it('should run retention cleanup via convenience function', async () => {
      const result = await runRetentionCleanup(true);
      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
    });

    it('should get retention days via convenience function', () => {
      const days = getRetentionDays();
      expect(typeof days).toBe('number');
      expect(days).toBeGreaterThan(0);
    });

    it('should get retention stats via convenience function', () => {
      const stats = getRetentionStats();
      expect(stats).toHaveProperty('initialized');
      expect(stats).toHaveProperty('totalCleanups');
      expect(stats).toHaveProperty('currentRetentionDays');
    });

    it('should get cleanup logs via convenience function', () => {
      const logs = getCleanupLogs();
      expect(Array.isArray(logs)).toBe(true);
    });
  });
});

// =============================================================================
// Data Deletion Manager Tests
// =============================================================================

describe('Data Deletion Module', () => {
  beforeEach(() => {
    resetDeletionManager();
    resetRetentionEnforcer();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
    // Clean up any existing consent file
    deleteConsentFile();
  });

  afterEach(() => {
    resetDeletionManager();
    resetRetentionEnforcer();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
    deleteConsentFile();
  });

  describe('DataDeletionManager Class', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(30);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    describe('Complete Data Deletion', () => {
      it('should delete all analytics files', async () => {
        // Create multiple files
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(5));
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

        // Verify files exist
        let files = fs.readdirSync(ctx.tempDir).filter(f => f.endsWith('.json'));
        expect(files.length).toBe(3);

        // Delete all data
        const result = await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        expect(result.success).toBe(true);
        expect(result.filesDeleted).toBe(3);

        // Verify all files deleted
        files = fs.readdirSync(ctx.tempDir).filter(f => f.endsWith('.json'));
        expect(files).toHaveLength(0);
      });

      it('should reset singletons when requested', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));

        const result = await ctx.deletionManager.deleteAllData({ resetSingletons: true });

        expect(result.success).toBe(true);
        expect(result.singletonsReset).toBe(true);
      });

      it('should not reset singletons when not requested', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));

        const result = await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        expect(result.success).toBe(true);
        expect(result.singletonsReset).toBe(false);
      });

      it('should delete consent when requested', async () => {
        // Write consent file
        writeConsentFile({
          hasConsented: true,
          policyVersion: '1.0.0',
          consentedAt: new Date().toISOString(),
        });

        expect(readConsentFile()).not.toBeNull();

        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));

        const result = await ctx.deletionManager.deleteAllData({ deleteConsent: true });

        expect(result.success).toBe(true);
        expect(result.consentDeleted).toBe(true);

        // Consent file should be deleted
        expect(readConsentFile()).toBeNull();
      });

      it('should not delete consent by default', async () => {
        // Write consent file
        writeConsentFile({
          hasConsented: true,
          policyVersion: '1.0.0',
          consentedAt: new Date().toISOString(),
        });

        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));

        const result = await ctx.deletionManager.deleteAllData();

        expect(result.success).toBe(true);
        expect(result.consentDeleted).toBe(false);

        // Consent file should still exist
        expect(readConsentFile()).not.toBeNull();
      });

      it('should count events from pending batch plus stored events', async () => {
        // Create storage with 2 events
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0), [
          createMockEvent(),
          createMockEvent(),
        ]);

        const result = await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        expect(result.success).toBe(true);
        expect(result.eventsDeleted).toBeGreaterThanOrEqual(2);
      });

      it('should include duration in result', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));

        const result = await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        expect(result.durationMs).toBeGreaterThanOrEqual(0);
        expect(result.completedAt).toBeDefined();
      });
    });

    describe('Audit Logging', () => {
      it('should log deletion request', async () => {
        await ctx.deletionManager.deleteAllData({
          resetSingletons: false,
          reason: 'User requested',
        });

        const logs = ctx.deletionManager.getDeletionLogs();
        const requestLog = logs.find(l => l.action === 'deletion_requested');

        expect(requestLog).toBeDefined();
        expect(requestLog?.details.reason).toBe('User requested');
      });

      it('should log deletion started and completed', async () => {
        await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        const logs = ctx.deletionManager.getDeletionLogs();
        const actions = logs.map(l => l.action);

        expect(actions).toContain('deletion_started');
        expect(actions).toContain('deletion_completed');
      });

      it('should log singletons reset', async () => {
        await ctx.deletionManager.deleteAllData({ resetSingletons: true });

        const logs = ctx.deletionManager.getDeletionLogs();
        const resetLog = logs.find(l => l.action === 'singletons_reset');

        expect(resetLog).toBeDefined();
        expect(resetLog?.details.singletonsReset).toBe(true);
      });

      it('should use custom logger when provided', async () => {
        const loggedEntries: DeletionLogEntry[] = [];
        const customLogger = (entry: DeletionLogEntry) => {
          loggedEntries.push(entry);
        };

        await ctx.deletionManager.deleteAllData({
          resetSingletons: false,
          logger: customLogger,
        });

        expect(loggedEntries.length).toBeGreaterThan(0);
      });

      it('should clear deletion logs', async () => {
        await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        expect(ctx.deletionManager.getDeletionLogs().length).toBeGreaterThan(0);

        ctx.deletionManager.clearDeletionLogs();

        expect(ctx.deletionManager.getDeletionLogs()).toHaveLength(0);
      });
    });

    describe('Statistics', () => {
      it('should track deletion statistics', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0), [
          createMockEvent(),
          createMockEvent(),
        ]);

        await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        const stats = ctx.deletionManager.getStats();

        expect(stats.totalDeletions).toBe(1);
        expect(stats.totalFilesDeleted).toBe(1);
        expect(stats.totalEventsDeleted).toBeGreaterThanOrEqual(2);
        expect(stats.lastDeletionAt).toBeDefined();
        expect(stats.lastDeletionResult).not.toBeNull();
      });

      it('should accumulate statistics across deletions', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));
        await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));
        await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        const stats = ctx.deletionManager.getStats();

        expect(stats.totalDeletions).toBe(2);
        expect(stats.totalFilesDeleted).toBe(2);
      });
    });

    describe('Confirmation Prompts', () => {
      it('should return standard confirmation prompt', () => {
        const prompt = ctx.deletionManager.getConfirmationPrompt();

        expect(prompt.title).toBeDefined();
        expect(prompt.message).toBeDefined();
        expect(prompt.warning).toBeDefined();
        expect(prompt.confirmText).toBeDefined();
        expect(prompt.cancelText).toBeDefined();
      });

      it('should modify prompt when including consent deletion', () => {
        const standardPrompt = ctx.deletionManager.getConfirmationPrompt(false);
        const consentPrompt = ctx.deletionManager.getConfirmationPrompt(true);

        expect(consentPrompt.message).toContain('consent');
        expect(consentPrompt.message).not.toBe(standardPrompt.message);
      });

      it('should return brief confirmation', () => {
        const brief = ctx.deletionManager.getBriefConfirmation();

        expect(typeof brief).toBe('string');
        expect(brief.length).toBeGreaterThan(0);
      });

      it('should return appropriate success message', () => {
        const message = ctx.deletionManager.getSuccessMessage(false);
        const messageWithConsent = ctx.deletionManager.getSuccessMessage(true);

        expect(message).not.toContain('consent');
        expect(messageWithConsent).toContain('consent');
      });
    });

    describe('Reset', () => {
      it('should reset all state', async () => {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));
        await ctx.deletionManager.deleteAllData({ resetSingletons: false });

        ctx.deletionManager.reset();

        const stats = ctx.deletionManager.getStats();
        expect(stats.totalDeletions).toBe(0);
        expect(stats.totalFilesDeleted).toBe(0);
        expect(stats.lastDeletionAt).toBeNull();
        expect(ctx.deletionManager.getDeletionLogs()).toHaveLength(0);
      });
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getDeletionManager', () => {
      const manager1 = getDeletionManager();
      const manager2 = getDeletionManager();
      expect(manager1).toBe(manager2);
    });

    it('should create new instance after resetDeletionManager', () => {
      const manager1 = getDeletionManager();
      resetDeletionManager();
      const manager2 = getDeletionManager();
      expect(manager1).not.toBe(manager2);
    });
  });

  describe('Convenience Functions', () => {
    it('should delete all data via convenience function', async () => {
      const result = await deleteAllAnalyticsData({ resetSingletons: false });
      expect(result.success).toBe(true);
    });

    it('should get confirmation prompt via convenience function', () => {
      const prompt = getConfirmationPrompt();
      expect(prompt.title).toBeDefined();
    });

    it('should get brief confirmation via convenience function', () => {
      const brief = getBriefConfirmation();
      expect(typeof brief).toBe('string');
    });

    it('should get success message via convenience function', () => {
      const message = getSuccessMessage();
      expect(typeof message).toBe('string');
    });

    it('should get deletion stats via convenience function', () => {
      const stats = getDeletionStats();
      expect(stats).toHaveProperty('totalDeletions');
      expect(stats).toHaveProperty('totalFilesDeleted');
    });

    it('should get deletion logs via convenience function', () => {
      const logs = getDeletionLogs();
      expect(Array.isArray(logs)).toBe(true);
    });

    it('should format deletion result', async () => {
      const result = await deleteAllAnalyticsData({ resetSingletons: false });
      const formatted = formatDeletionResult(result);

      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('Files deleted');
    });
  });

  describe('Constants', () => {
    it('should export confirmation prompt constant', () => {
      expect(DELETION_CONFIRMATION_PROMPT.title).toBeDefined();
      expect(DELETION_CONFIRMATION_PROMPT.message).toBeDefined();
    });

    it('should export brief confirmation constant', () => {
      expect(typeof DELETION_CONFIRMATION_BRIEF).toBe('string');
    });

    it('should export success message constants', () => {
      expect(typeof DELETION_SUCCESS_MESSAGE).toBe('string');
      expect(typeof DELETION_SUCCESS_WITH_CONSENT_MESSAGE).toBe('string');
    });
  });

  describe('Format Deletion Result', () => {
    it('should format successful result', () => {
      const result: DeletionResult = {
        success: true,
        filesDeleted: 3,
        eventsDeleted: 25,
        singletonsReset: true,
        consentDeleted: false,
        durationMs: 150,
        completedAt: new Date().toISOString(),
      };

      const formatted = formatDeletionResult(result);

      expect(formatted).toContain('successfully');
      expect(formatted).toContain('3');
      expect(formatted).toContain('25');
      expect(formatted).toContain('Yes'); // singletonsReset
      expect(formatted).toContain('No'); // consentDeleted
      expect(formatted).toContain('150ms');
    });

    it('should format failed result', () => {
      const result: DeletionResult = {
        success: false,
        filesDeleted: 0,
        eventsDeleted: 0,
        error: 'Permission denied',
        singletonsReset: false,
        consentDeleted: false,
        durationMs: 50,
        completedAt: new Date().toISOString(),
      };

      const formatted = formatDeletionResult(result);

      expect(formatted).toContain('failed');
      expect(formatted).toContain('Permission denied');
    });
  });
});

// =============================================================================
// Edge Cases Tests
// =============================================================================

describe('Edge Cases', () => {
  beforeEach(() => {
    resetRetentionEnforcer();
    resetDeletionManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
  });

  afterEach(() => {
    resetRetentionEnforcer();
    resetDeletionManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
  });

  describe('Empty Storage', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    it('should handle cleanup with no files', async () => {
      const result = await ctx.enforcer.runCleanup();

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(0);
      expect(result.eventsDeleted).toBe(0);
    });

    it('should handle deletion with no files', async () => {
      const result = await ctx.deletionManager.deleteAllData({ resetSingletons: false });

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(0);
    });
  });

  describe('Non-Analytics Files', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    it('should not delete non-analytics files during cleanup', async () => {
      // Create a non-analytics file
      const otherFilePath = path.join(ctx.tempDir, 'other-file.json');
      fs.writeFileSync(otherFilePath, JSON.stringify({ data: 'test' }));

      // Create an old analytics file
      createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

      const result = await ctx.enforcer.runCleanup();

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(1);

      // Non-analytics file should still exist
      expect(fs.existsSync(otherFilePath)).toBe(true);
    });

    it('should not delete non-analytics files during full deletion', async () => {
      // Create a non-analytics file
      const otherFilePath = path.join(ctx.tempDir, 'other-file.txt');
      fs.writeFileSync(otherFilePath, 'test data');

      createAnalyticsFile(ctx.tempDir, getDaysAgoString(0));

      const result = await ctx.deletionManager.deleteAllData({ resetSingletons: false });

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(1);

      // Non-analytics file should still exist
      expect(fs.existsSync(otherFilePath)).toBe(true);
    });
  });

  describe('Invalid Date Files', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    it('should skip files with invalid date format during cleanup', async () => {
      // Create file with invalid date format
      const invalidFilePath = path.join(ctx.tempDir, 'analytics-invalid.json');
      fs.writeFileSync(invalidFilePath, JSON.stringify({
        schemaVersion: ANALYTICS_SCHEMA_VERSION,
        date: 'invalid',
        events: [],
        lastModified: new Date().toISOString(),
      }));

      // Create valid old file
      createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));

      const result = await ctx.enforcer.runCleanup();

      // Should only delete the valid old file
      expect(result.filesDeleted).toBe(1);
      expect(fs.existsSync(invalidFilePath)).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    it('should handle concurrent cleanup operations', async () => {
      // Create old files
      createAnalyticsFile(ctx.tempDir, getDaysAgoString(10));
      createAnalyticsFile(ctx.tempDir, getDaysAgoString(15));

      // Run multiple cleanups concurrently
      const results = await Promise.all([
        ctx.enforcer.runCleanup(),
        ctx.enforcer.runCleanup(),
        ctx.enforcer.runCleanup(),
      ]);

      // All should succeed
      for (const result of results) {
        expect(result.success).toBe(true);
      }

      // Total files deleted across all operations should be correct
      const totalDeleted = results.reduce((sum, r) => sum + r.filesDeleted, 0);
      expect(totalDeleted).toBe(2); // Only 2 files existed
    });
  });

  describe('Very Old Files', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    it('should delete very old files', async () => {
      // Create file from a year ago
      createAnalyticsFile(ctx.tempDir, getDaysAgoString(365));

      const result = await ctx.enforcer.runCleanup();

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(1);
    });
  });

  describe('Large Number of Files', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    it('should handle cleanup of many files', async () => {
      // Create many old files
      for (let i = 10; i < 40; i++) {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(i));
      }

      // Create some recent files
      for (let i = 0; i < 5; i++) {
        createAnalyticsFile(ctx.tempDir, getDaysAgoString(i));
      }

      const result = await ctx.enforcer.runCleanup();

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(30); // Days 10-39
    });
  });

  describe('Files with Many Events', () => {
    let ctx: TestContext;

    beforeEach(async () => {
      ctx = await createTestContext(7);
    });

    afterEach(() => {
      cleanupTestContext(ctx);
    });

    it('should count events correctly in large files', async () => {
      // Create file with many events
      const events: AnalyticsEvent[] = [];
      for (let i = 0; i < 100; i++) {
        events.push(createMockEvent());
      }
      createAnalyticsFile(ctx.tempDir, getDaysAgoString(10), events);

      const result = await ctx.enforcer.runCleanup();

      expect(result.success).toBe(true);
      expect(result.eventsDeleted).toBe(100);
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Retention and Deletion Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    resetRetentionEnforcer();
    resetDeletionManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
    tempDir = createTempDir();
    deleteConsentFile();
  });

  afterEach(() => {
    resetRetentionEnforcer();
    resetDeletionManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetConsentManager();
    removeTempDir(tempDir);
    deleteConsentFile();
  });

  it('should work together: retention cleanup then full deletion', async () => {
    const configManager = new AnalyticsConfigManager({
      enabled: true,
      storagePath: tempDir,
      retentionDays: 7,
    });
    const storageAdapter = createStorageAdapter(tempDir, 7);
    await storageAdapter.initialize();

    // Create files: some old, some new
    createAnalyticsFile(tempDir, getDaysAgoString(0));
    createAnalyticsFile(tempDir, getDaysAgoString(5));
    createAnalyticsFile(tempDir, getDaysAgoString(10));
    createAnalyticsFile(tempDir, getDaysAgoString(20));

    // Run retention cleanup
    const enforcer = createRetentionEnforcer({
      configManager,
      storageAdapter,
      autoCleanupOnInit: false,
    });
    const retentionResult = await enforcer.runCleanup();

    expect(retentionResult.filesDeleted).toBe(2); // Days 10 and 20

    // Verify 2 files remain
    let files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
    expect(files).toHaveLength(2);

    // Now delete remaining data
    const deletionManager = createDeletionManager(configManager, storageAdapter);
    const deletionResult = await deletionManager.deleteAllData({ resetSingletons: false });

    expect(deletionResult.filesDeleted).toBe(2);

    // Verify all files deleted
    files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
    expect(files).toHaveLength(0);
  });

  it('should properly clean up after user opts out', async () => {
    const configManager = new AnalyticsConfigManager({
      enabled: true,
      storagePath: tempDir,
      retentionDays: 30,
    });
    const storageAdapter = createStorageAdapter(tempDir, 30);
    await storageAdapter.initialize();

    // Simulate user analytics data
    createAnalyticsFile(tempDir, getDaysAgoString(0));
    createAnalyticsFile(tempDir, getDaysAgoString(10));

    // Write consent
    writeConsentFile({
      hasConsented: true,
      policyVersion: '1.0.0',
      consentedAt: new Date().toISOString(),
    });

    // User opts out and requests data deletion
    const deletionManager = createDeletionManager(configManager, storageAdapter);
    const result = await deletionManager.deleteAllData({
      resetSingletons: true,
      deleteConsent: true,
    });

    expect(result.success).toBe(true);
    expect(result.filesDeleted).toBe(2);
    expect(result.consentDeleted).toBe(true);
    expect(result.singletonsReset).toBe(true);

    // Verify everything is cleaned up
    const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
    expect(files).toHaveLength(0);
    expect(readConsentFile()).toBeNull();
  });
});
