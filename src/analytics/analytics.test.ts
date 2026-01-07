/**
 * Comprehensive Unit Tests for Analytics Core Infrastructure
 *
 * Tests for:
 * - Configuration loading with various scenarios
 * - Storage write/read/rotation operations
 * - Collector batching behavior
 * - Disabled analytics (no-op mode)
 * - Data retention cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import {
  AnalyticsConfig,
  DEFAULT_ANALYTICS_CONFIG,
  ANALYTICS_SCHEMA_VERSION,
  AnalyticsEvent,
} from './types.js';

import {
  validateConfig,
  expandPath,
  readEnvConfig,
  loadConfig,
  getConfig,
  AnalyticsConfigManager,
  getConfigManager,
  resetConfigManager,
  ENV_VARS,
  CONFIG_FILE_PATH,
  CONFIG_DIR,
  DEFAULT_STORAGE_PATH,
  writeConfigFile,
} from './config.js';

import {
  AnalyticsStorageAdapter,
  createStorageAdapter,
  getStorageAdapter,
  resetStorageAdapter,
} from './storage.js';

import {
  AnalyticsCollector,
  createCollector,
  getCollector,
  resetCollector,
  trackEvent,
  trackEventSync,
  flushEvents,
  isAnalyticsEnabled,
  TrackOptions,
} from './collector.js';

import { TOOL_NAMES } from '../toolNames.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(os.tmpdir(), `think-mcp-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
 * Formats a date as YYYY-MM-DD.
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// =============================================================================
// Config Module Tests
// =============================================================================

describe('Analytics Config Module', () => {
  // Reset config manager before each test
  beforeEach(() => {
    resetConfigManager();
    // Clean up any env vars
    delete process.env[ENV_VARS.ENABLED];
    delete process.env[ENV_VARS.RETENTION_DAYS];
    delete process.env[ENV_VARS.STORAGE_PATH];
    delete process.env[ENV_VARS.BATCH_SIZE];
    delete process.env[ENV_VARS.FLUSH_INTERVAL_MS];
  });

  afterEach(() => {
    resetConfigManager();
    // Clean up env vars
    delete process.env[ENV_VARS.ENABLED];
    delete process.env[ENV_VARS.RETENTION_DAYS];
    delete process.env[ENV_VARS.STORAGE_PATH];
    delete process.env[ENV_VARS.BATCH_SIZE];
    delete process.env[ENV_VARS.FLUSH_INTERVAL_MS];
  });

  describe('DEFAULT_ANALYTICS_CONFIG', () => {
    it('should have analytics disabled by default', () => {
      expect(DEFAULT_ANALYTICS_CONFIG.enabled).toBe(false);
    });

    it('should have sensible default values', () => {
      expect(DEFAULT_ANALYTICS_CONFIG.retentionDays).toBe(90);
      expect(DEFAULT_ANALYTICS_CONFIG.batchSize).toBe(50);
      expect(DEFAULT_ANALYTICS_CONFIG.flushIntervalMs).toBe(30000);
      expect(DEFAULT_ANALYTICS_CONFIG.storagePath).toBe('~/.think-mcp/analytics');
    });
  });

  describe('expandPath', () => {
    it('should expand tilde to home directory', () => {
      const expanded = expandPath('~/.think-mcp/analytics');
      expect(expanded).toBe(path.join(os.homedir(), '.think-mcp/analytics'));
    });

    it('should not modify paths without tilde', () => {
      const testPath = '/absolute/path/to/analytics';
      expect(expandPath(testPath)).toBe(testPath);
    });

    it('should handle tilde-only path', () => {
      const expanded = expandPath('~');
      expect(expanded).toBe(os.homedir());
    });

    it('should handle empty string', () => {
      expect(expandPath('')).toBe('');
    });
  });

  describe('validateConfig', () => {
    it('should validate a complete valid config', () => {
      const config: AnalyticsConfig = {
        enabled: true,
        retentionDays: 30,
        storagePath: '/tmp/analytics',
        batchSize: 100,
        flushIntervalMs: 5000,
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-boolean enabled value', () => {
      const result = validateConfig({ enabled: 'true' as unknown as boolean });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringMatching(/enabled/));
    });

    it('should reject non-integer retentionDays', () => {
      const result = validateConfig({ retentionDays: 30.5 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringMatching(/retentionDays/));
    });

    it('should reject retentionDays less than 1', () => {
      const result = validateConfig({ retentionDays: 0 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringMatching(/at least 1/));
    });

    it('should warn for retentionDays greater than 365', () => {
      const result = validateConfig({ retentionDays: 400 });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringMatching(/365/));
    });

    it('should reject empty storagePath', () => {
      const result = validateConfig({ storagePath: '   ' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringMatching(/storagePath/));
    });

    it('should reject batchSize less than 1', () => {
      const result = validateConfig({ batchSize: 0 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringMatching(/batchSize/));
    });

    it('should warn for very large batchSize', () => {
      const result = validateConfig({ batchSize: 2000 });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringMatching(/batchSize/));
    });

    it('should reject flushIntervalMs less than 1000', () => {
      const result = validateConfig({ flushIntervalMs: 500 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringMatching(/flushIntervalMs/));
    });

    it('should warn for very long flushIntervalMs', () => {
      const result = validateConfig({ flushIntervalMs: 400000 });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringMatching(/flushIntervalMs/));
    });
  });

  describe('readEnvConfig', () => {
    it('should return empty object when no env vars set', () => {
      const config = readEnvConfig();
      expect(Object.keys(config)).toHaveLength(0);
    });

    it('should parse THINK_MCP_ANALYTICS_ENABLED=true', () => {
      process.env[ENV_VARS.ENABLED] = 'true';
      const config = readEnvConfig();
      expect(config.enabled).toBe(true);
    });

    it('should parse THINK_MCP_ANALYTICS_ENABLED=1', () => {
      process.env[ENV_VARS.ENABLED] = '1';
      const config = readEnvConfig();
      expect(config.enabled).toBe(true);
    });

    it('should parse THINK_MCP_ANALYTICS_ENABLED=yes', () => {
      process.env[ENV_VARS.ENABLED] = 'yes';
      const config = readEnvConfig();
      expect(config.enabled).toBe(true);
    });

    it('should parse THINK_MCP_ANALYTICS_ENABLED=false', () => {
      process.env[ENV_VARS.ENABLED] = 'false';
      const config = readEnvConfig();
      expect(config.enabled).toBe(false);
    });

    it('should parse THINK_MCP_ANALYTICS_ENABLED=0', () => {
      process.env[ENV_VARS.ENABLED] = '0';
      const config = readEnvConfig();
      expect(config.enabled).toBe(false);
    });

    it('should parse THINK_MCP_ANALYTICS_ENABLED=no', () => {
      process.env[ENV_VARS.ENABLED] = 'no';
      const config = readEnvConfig();
      expect(config.enabled).toBe(false);
    });

    it('should ignore invalid THINK_MCP_ANALYTICS_ENABLED value', () => {
      process.env[ENV_VARS.ENABLED] = 'invalid';
      const config = readEnvConfig();
      expect(config.enabled).toBeUndefined();
    });

    it('should parse THINK_MCP_ANALYTICS_RETENTION_DAYS', () => {
      process.env[ENV_VARS.RETENTION_DAYS] = '60';
      const config = readEnvConfig();
      expect(config.retentionDays).toBe(60);
    });

    it('should ignore invalid THINK_MCP_ANALYTICS_RETENTION_DAYS', () => {
      process.env[ENV_VARS.RETENTION_DAYS] = 'invalid';
      const config = readEnvConfig();
      expect(config.retentionDays).toBeUndefined();
    });

    it('should ignore negative THINK_MCP_ANALYTICS_RETENTION_DAYS', () => {
      process.env[ENV_VARS.RETENTION_DAYS] = '-10';
      const config = readEnvConfig();
      expect(config.retentionDays).toBeUndefined();
    });

    it('should parse THINK_MCP_ANALYTICS_STORAGE_PATH', () => {
      process.env[ENV_VARS.STORAGE_PATH] = '/custom/path';
      const config = readEnvConfig();
      expect(config.storagePath).toBe('/custom/path');
    });

    it('should ignore empty THINK_MCP_ANALYTICS_STORAGE_PATH', () => {
      process.env[ENV_VARS.STORAGE_PATH] = '   ';
      const config = readEnvConfig();
      expect(config.storagePath).toBeUndefined();
    });

    it('should parse THINK_MCP_ANALYTICS_BATCH_SIZE', () => {
      process.env[ENV_VARS.BATCH_SIZE] = '100';
      const config = readEnvConfig();
      expect(config.batchSize).toBe(100);
    });

    it('should parse THINK_MCP_ANALYTICS_FLUSH_INTERVAL_MS', () => {
      process.env[ENV_VARS.FLUSH_INTERVAL_MS] = '10000';
      const config = readEnvConfig();
      expect(config.flushIntervalMs).toBe(10000);
    });

    it('should parse multiple env vars', () => {
      process.env[ENV_VARS.ENABLED] = 'true';
      process.env[ENV_VARS.RETENTION_DAYS] = '45';
      process.env[ENV_VARS.BATCH_SIZE] = '25';
      const config = readEnvConfig();
      expect(config.enabled).toBe(true);
      expect(config.retentionDays).toBe(45);
      expect(config.batchSize).toBe(25);
    });
  });

  describe('loadConfig', () => {
    it('should return defaults when no config sources available', () => {
      const { config, sources } = loadConfig();
      expect(config.enabled).toBe(false);
      expect(sources.enabled).toBe('default');
      expect(config.retentionDays).toBe(DEFAULT_ANALYTICS_CONFIG.retentionDays);
      expect(sources.retentionDays).toBe('default');
    });

    it('should apply env vars over defaults', () => {
      process.env[ENV_VARS.ENABLED] = 'true';
      const { config, sources } = loadConfig();
      expect(config.enabled).toBe(true);
      expect(sources.enabled).toBe('env');
    });

    it('should apply overrides over env vars', () => {
      process.env[ENV_VARS.ENABLED] = 'true';
      const { config, sources } = loadConfig({ enabled: false });
      expect(config.enabled).toBe(false);
      expect(sources.enabled).toBe('override');
    });

    it('should expand storage path', () => {
      const { config } = loadConfig({ storagePath: '~/custom' });
      expect(config.storagePath).toBe(path.join(os.homedir(), 'custom'));
    });
  });

  describe('getConfig', () => {
    it('should return a valid config', () => {
      const config = getConfig();
      expect(config.enabled).toBe(false);
      expect(typeof config.retentionDays).toBe('number');
      expect(typeof config.storagePath).toBe('string');
    });

    it('should apply overrides', () => {
      const config = getConfig({ enabled: true });
      expect(config.enabled).toBe(true);
    });

    it('should throw on invalid config', () => {
      expect(() => getConfig({ flushIntervalMs: 100 })).toThrow(/Invalid analytics configuration/);
    });
  });

  describe('AnalyticsConfigManager', () => {
    let manager: AnalyticsConfigManager;

    beforeEach(() => {
      manager = new AnalyticsConfigManager();
    });

    it('should return default config when no overrides', () => {
      const config = manager.getConfig();
      expect(config.enabled).toBe(false);
    });

    it('should cache config', () => {
      const config1 = manager.getConfig();
      const config2 = manager.getConfig();
      expect(config1).toBe(config2); // Same object reference
    });

    it('should clear cache on setOverride', () => {
      const config1 = manager.getConfig();
      manager.setOverride('enabled', true);
      const config2 = manager.getConfig();
      expect(config1).not.toBe(config2);
      expect(config2.enabled).toBe(true);
    });

    it('should clear all overrides', () => {
      manager.setOverride('enabled', true);
      manager.setOverride('retentionDays', 30);
      manager.clearOverrides();
      const config = manager.getConfig();
      expect(config.enabled).toBe(false);
      expect(config.retentionDays).toBe(90);
    });

    it('should reload config', () => {
      const config1 = manager.getConfig();
      manager.reload();
      const config2 = manager.getConfig();
      expect(config1).not.toBe(config2);
    });

    it('should report enabled status correctly', () => {
      expect(manager.isEnabled()).toBe(false);
      manager.setOverride('enabled', true);
      expect(manager.isEnabled()).toBe(true);
    });

    it('should return storage path', () => {
      const storagePath = manager.getStoragePath();
      expect(storagePath).toBe(DEFAULT_STORAGE_PATH);
    });

    it('should validate config', () => {
      const result = manager.validate();
      expect(result.valid).toBe(true);
    });

    it('should get resolved config with sources', () => {
      const resolved = manager.getResolvedConfig();
      expect(resolved.config).toBeDefined();
      expect(resolved.sources).toBeDefined();
      expect(resolved.sources.enabled).toBe('default');
    });

    it('should create manager with initial overrides', () => {
      const manager = new AnalyticsConfigManager({ enabled: true });
      expect(manager.isEnabled()).toBe(true);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getConfigManager', () => {
      const manager1 = getConfigManager();
      const manager2 = getConfigManager();
      expect(manager1).toBe(manager2);
    });

    it('should reset singleton on resetConfigManager', () => {
      const manager1 = getConfigManager();
      resetConfigManager();
      const manager2 = getConfigManager();
      expect(manager1).not.toBe(manager2);
    });
  });
});

// =============================================================================
// Storage Module Tests
// =============================================================================

describe('Analytics Storage Module', () => {
  let tempDir: string;
  let adapter: AnalyticsStorageAdapter;

  beforeEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    tempDir = createTempDir();
    adapter = createStorageAdapter(tempDir, 90);
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    removeTempDir(tempDir);
  });

  describe('Storage Initialization', () => {
    it('should create storage directory on initialize', async () => {
      const testDir = path.join(tempDir, 'new-dir');
      const testAdapter = createStorageAdapter(testDir, 90);
      await testAdapter.initialize();
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('should handle existing directory', async () => {
      await adapter.initialize();
      await adapter.initialize(); // Second call should not error
      expect(fs.existsSync(tempDir)).toBe(true);
    });
  });

  describe('Event Writing', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should write events to storage', async () => {
      const event = createMockEvent();
      const result = await adapter.appendEvents([event]);
      expect(result.success).toBe(true);
      expect(result.eventsWritten).toBe(1);
    });

    it('should write multiple events', async () => {
      const events = [
        createMockEvent({ toolName: TOOL_NAMES.TRACE }),
        createMockEvent({ toolName: TOOL_NAMES.MODEL }),
        createMockEvent({ toolName: TOOL_NAMES.DEBUG }),
      ];
      const result = await adapter.appendEvents(events);
      expect(result.success).toBe(true);
      expect(result.eventsWritten).toBe(3);
    });

    it('should handle empty event array', async () => {
      const result = await adapter.appendEvents([]);
      expect(result.success).toBe(true);
      expect(result.eventsWritten).toBe(0);
    });

    it('should create daily files based on event timestamp', async () => {
      const today = new Date();
      const todayStr = formatDateString(today);
      const event = createMockEvent({ timestamp: today.toISOString() });

      await adapter.appendEvents([event]);

      const fileName = `analytics-${todayStr}.json`;
      const filePath = path.join(tempDir, fileName);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should append to existing file', async () => {
      const event1 = createMockEvent({ toolName: TOOL_NAMES.TRACE });
      const event2 = createMockEvent({ toolName: TOOL_NAMES.MODEL });

      await adapter.appendEvents([event1]);
      await adapter.appendEvents([event2]);

      const readResult = await adapter.readEvents();
      expect(readResult.events).toHaveLength(2);
    });

    it('should group events by date', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const events = [
        createMockEvent({ timestamp: today.toISOString() }),
        createMockEvent({ timestamp: yesterday.toISOString() }),
      ];

      await adapter.appendEvents(events);

      const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
      expect(files).toHaveLength(2);
    });
  });

  describe('Event Reading', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should read events from storage', async () => {
      const event = createMockEvent();
      await adapter.appendEvents([event]);

      const result = await adapter.readEvents();
      expect(result.success).toBe(true);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].toolName).toBe(event.toolName);
    });

    it('should read events within date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const events = [
        createMockEvent({ timestamp: today.toISOString(), toolName: TOOL_NAMES.TRACE }),
        createMockEvent({ timestamp: yesterday.toISOString(), toolName: TOOL_NAMES.MODEL }),
        createMockEvent({ timestamp: twoDaysAgo.toISOString(), toolName: TOOL_NAMES.DEBUG }),
      ];

      await adapter.appendEvents(events);

      // Read only yesterday
      const result = await adapter.readEvents(
        formatDateString(yesterday),
        formatDateString(yesterday)
      );
      expect(result.success).toBe(true);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].toolName).toBe(TOOL_NAMES.MODEL);
    });

    it('should read events for specific date', async () => {
      const today = new Date();
      const event = createMockEvent({ timestamp: today.toISOString() });
      await adapter.appendEvents([event]);

      const result = await adapter.readEventsForDate(formatDateString(today));
      expect(result.success).toBe(true);
      expect(result.events).toHaveLength(1);
    });

    it('should return empty array for non-existent date range', async () => {
      const result = await adapter.readEvents('2020-01-01', '2020-01-02');
      expect(result.success).toBe(true);
      expect(result.events).toHaveLength(0);
    });

    it('should sort events by timestamp', async () => {
      const today = new Date();
      const earlier = new Date(today.getTime() - 1000);

      const events = [
        createMockEvent({ timestamp: today.toISOString(), toolName: TOOL_NAMES.MODEL }),
        createMockEvent({ timestamp: earlier.toISOString(), toolName: TOOL_NAMES.TRACE }),
      ];

      await adapter.appendEvents(events);

      const result = await adapter.readEvents();
      expect(result.events[0].toolName).toBe(TOOL_NAMES.TRACE);
      expect(result.events[1].toolName).toBe(TOOL_NAMES.MODEL);
    });
  });

  describe('Data Retention Cleanup', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should delete files older than retention period', async () => {
      // Create adapter with 7-day retention
      const shortRetentionAdapter = createStorageAdapter(tempDir, 7);

      // Create an old file (10 days ago)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      const oldDateStr = formatDateString(oldDate);
      const oldFileName = `analytics-${oldDateStr}.json`;
      const oldFilePath = path.join(tempDir, oldFileName);

      fs.writeFileSync(oldFilePath, JSON.stringify({
        schemaVersion: ANALYTICS_SCHEMA_VERSION,
        date: oldDateStr,
        events: [createMockEvent()],
        lastModified: new Date().toISOString(),
      }));

      // Create a recent file
      const recentEvent = createMockEvent();
      await shortRetentionAdapter.appendEvents([recentEvent]);

      // Run cleanup
      const result = await shortRetentionAdapter.runCleanup();
      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(1);
      expect(fs.existsSync(oldFilePath)).toBe(false);
    });

    it('should preserve files within retention period', async () => {
      const event = createMockEvent();
      await adapter.appendEvents([event]);

      const result = await adapter.runCleanup();
      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(0);

      // Verify file still exists
      const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
      expect(files).toHaveLength(1);
    });

    it('should support dry run mode', async () => {
      // Create adapter with 1-day retention
      const shortRetentionAdapter = createStorageAdapter(tempDir, 1);

      // Create an old file
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5);
      const oldDateStr = formatDateString(oldDate);
      const oldFileName = `analytics-${oldDateStr}.json`;
      const oldFilePath = path.join(tempDir, oldFileName);

      fs.writeFileSync(oldFilePath, JSON.stringify({
        schemaVersion: ANALYTICS_SCHEMA_VERSION,
        date: oldDateStr,
        events: [createMockEvent()],
        lastModified: new Date().toISOString(),
      }));

      // Run cleanup in dry run mode
      const result = await shortRetentionAdapter.runCleanup(true);
      expect(result.filesDeleted).toBe(1);

      // Verify file still exists (dry run)
      expect(fs.existsSync(oldFilePath)).toBe(true);
    });

    it('should report event count in cleanup result', async () => {
      // Create adapter with 1-day retention
      const shortRetentionAdapter = createStorageAdapter(tempDir, 1);

      // Create an old file with multiple events
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5);
      const oldDateStr = formatDateString(oldDate);
      const oldFileName = `analytics-${oldDateStr}.json`;
      const oldFilePath = path.join(tempDir, oldFileName);

      fs.writeFileSync(oldFilePath, JSON.stringify({
        schemaVersion: ANALYTICS_SCHEMA_VERSION,
        date: oldDateStr,
        events: [createMockEvent(), createMockEvent(), createMockEvent()],
        lastModified: new Date().toISOString(),
      }));

      const result = await shortRetentionAdapter.runCleanup();
      expect(result.eventsDeleted).toBe(3);
    });
  });

  describe('Delete All Data', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should delete all analytics files', async () => {
      // Create multiple files
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await adapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
      ]);
      await adapter.appendEvents([
        createMockEvent({ timestamp: yesterday.toISOString() }),
      ]);

      // Verify files exist
      let files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
      expect(files.length).toBeGreaterThan(0);

      // Delete all
      const result = await adapter.deleteAllData();
      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(2);

      // Verify files deleted
      files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
      expect(files).toHaveLength(0);
    });

    it('should handle empty storage', async () => {
      const result = await adapter.deleteAllData();
      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(0);
    });
  });

  describe('Storage Info', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should return storage information', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await adapter.appendEvents([
        createMockEvent({ timestamp: today.toISOString() }),
        createMockEvent({ timestamp: today.toISOString() }),
      ]);
      await adapter.appendEvents([
        createMockEvent({ timestamp: yesterday.toISOString() }),
      ]);

      const info = adapter.getStorageInfo();
      expect(info.totalFiles).toBe(2);
      expect(info.totalEvents).toBe(3);
      expect(info.totalBytes).toBeGreaterThan(0);
      expect(info.oldestDate).toBe(formatDateString(yesterday));
      expect(info.newestDate).toBe(formatDateString(today));
    });

    it('should return nulls for empty storage', async () => {
      const info = adapter.getStorageInfo();
      expect(info.totalFiles).toBe(0);
      expect(info.totalEvents).toBe(0);
      expect(info.oldestDate).toBeNull();
      expect(info.newestDate).toBeNull();
    });
  });

  describe('Accessors', () => {
    it('should return storage path', () => {
      expect(adapter.getStoragePath()).toBe(tempDir);
    });

    it('should return retention days', () => {
      expect(adapter.getRetentionDays()).toBe(90);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getStorageAdapter', () => {
      const adapter1 = getStorageAdapter();
      const adapter2 = getStorageAdapter();
      expect(adapter1).toBe(adapter2);
    });

    it('should reset singleton on resetStorageAdapter', () => {
      const adapter1 = getStorageAdapter();
      resetStorageAdapter();
      const adapter2 = getStorageAdapter();
      expect(adapter1).not.toBe(adapter2);
    });
  });
});

// =============================================================================
// Collector Module Tests
// =============================================================================

describe('Analytics Collector Module', () => {
  let tempDir: string;
  let configManager: AnalyticsConfigManager;
  let storageAdapter: AnalyticsStorageAdapter;
  let collector: AnalyticsCollector;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();

    tempDir = createTempDir();

    // Create enabled config manager
    configManager = new AnalyticsConfigManager({
      enabled: true,
      storagePath: tempDir,
      batchSize: 5, // Small batch for testing
      flushIntervalMs: 1000,
    });

    storageAdapter = createStorageAdapter(tempDir, 90);
    await storageAdapter.initialize();

    collector = createCollector(configManager, storageAdapter);
  });

  afterEach(async () => {
    await collector.shutdown();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    removeTempDir(tempDir);
  });

  describe('Basic Tracking', () => {
    it('should track events when enabled', async () => {
      const options: TrackOptions = {
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      };

      await collector.track(options);

      const stats = collector.getStats();
      expect(stats.totalEventsTracked).toBe(1);
      expect(stats.pendingEvents).toBe(1);
    });

    it('should auto-populate timestamp and sessionId', async () => {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      await collector.flush();

      const result = await storageAdapter.readEvents();
      expect(result.events[0].timestamp).toBeDefined();
      expect(result.events[0].sessionId).toBeDefined();
    });

    it('should use provided timestamp and sessionId', async () => {
      const customTimestamp = '2024-01-01T12:00:00.000Z';
      const customSessionId = 'custom-session';

      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
        timestamp: customTimestamp,
        sessionId: customSessionId,
      });

      await collector.flush();

      const result = await storageAdapter.readEvents();
      expect(result.events[0].timestamp).toBe(customTimestamp);
      expect(result.events[0].sessionId).toBe(customSessionId);
    });

    it('should track error category for failed invocations', async () => {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: false,
        durationMs: 50,
        errorCategory: 'validation',
      });

      await collector.flush();

      const result = await storageAdapter.readEvents();
      expect(result.events[0].success).toBe(false);
      expect(result.events[0].errorCategory).toBe('validation');
    });

    it('should not include errorCategory for successful invocations', async () => {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
        errorCategory: 'validation', // Should be ignored
      });

      await collector.flush();

      const result = await storageAdapter.readEvents();
      expect(result.events[0].errorCategory).toBeUndefined();
    });
  });

  describe('Disabled Analytics (No-op Mode)', () => {
    it('should be no-op when disabled', async () => {
      const disabledConfigManager = new AnalyticsConfigManager({
        enabled: false,
        storagePath: tempDir,
      });
      const disabledCollector = createCollector(disabledConfigManager, storageAdapter);

      await disabledCollector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      const stats = disabledCollector.getStats();
      expect(stats.enabled).toBe(false);
      expect(stats.pendingEvents).toBe(0);
      expect(stats.totalEventsTracked).toBe(0);
    });

    it('should clear pending events on flush when disabled', async () => {
      // Track event when enabled
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      // Disable analytics
      configManager.setOverride('enabled', false);

      // Flush should clear without persisting
      const result = await collector.flush();
      expect(result.success).toBe(true);
      expect(result.eventsFlushed).toBe(1);

      // Verify nothing was written
      const readResult = await storageAdapter.readEvents();
      expect(readResult.events).toHaveLength(0);
    });

    it('should report enabled status correctly', () => {
      expect(collector.isEnabled()).toBe(true);

      configManager.setOverride('enabled', false);
      expect(collector.isEnabled()).toBe(false);
    });
  });

  describe('Batching Behavior', () => {
    it('should batch events up to batchSize', async () => {
      // Track 3 events (less than batch size of 5)
      for (let i = 0; i < 3; i++) {
        await collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100,
        });
      }

      const stats = collector.getStats();
      expect(stats.pendingEvents).toBe(3);
      expect(stats.totalEventsFlushed).toBe(0);
    });

    it('should auto-flush when batch is full', async () => {
      // Track exactly batchSize events (5)
      for (let i = 0; i < 5; i++) {
        await collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100,
        });
      }

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      const stats = collector.getStats();
      expect(stats.totalEventsFlushed).toBe(5);
      expect(stats.pendingEvents).toBe(0);
    });

    it('should flush on explicit flush call', async () => {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      expect(collector.getStats().pendingEvents).toBe(1);

      const result = await collector.flush();
      expect(result.success).toBe(true);
      expect(result.eventsFlushed).toBe(1);
      expect(collector.getStats().pendingEvents).toBe(0);
    });

    it('should handle flush with no pending events', async () => {
      const result = await collector.flush();
      expect(result.success).toBe(true);
      expect(result.eventsFlushed).toBe(0);
    });
  });

  describe('Synchronous Tracking', () => {
    it('should track events synchronously', async () => {
      collector.trackSync({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      const stats = collector.getStats();
      expect(stats.totalEventsTracked).toBe(1);
    });
  });

  describe('Shutdown', () => {
    it('should flush pending events on shutdown', async () => {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });
      await collector.track({
        toolName: TOOL_NAMES.MODEL,
        success: true,
        durationMs: 200,
      });

      const result = await collector.shutdown();
      expect(result.success).toBe(true);
      expect(result.eventsFlushed).toBe(2);

      // Verify events were persisted
      const readResult = await storageAdapter.readEvents();
      expect(readResult.events).toHaveLength(2);
    });

    it('should not accept new events after shutdown', async () => {
      await collector.shutdown();

      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      const stats = collector.getStats();
      expect(stats.totalEventsTracked).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track statistics correctly', async () => {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      await collector.flush();

      const stats = collector.getStats();
      expect(stats.enabled).toBe(true);
      expect(stats.totalEventsTracked).toBe(1);
      expect(stats.totalEventsFlushed).toBe(1);
      expect(stats.totalFlushErrors).toBe(0);
      expect(stats.batchSize).toBe(5);
      expect(stats.flushIntervalMs).toBe(1000);
      expect(stats.sessionId).toBeDefined();
    });

    it('should return session ID', () => {
      const sessionId = collector.getSessionId();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBe(16);
    });
  });

  describe('Reset', () => {
    it('should reset collector state', async () => {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      const oldSessionId = collector.getSessionId();

      collector.reset();

      const stats = collector.getStats();
      expect(stats.pendingEvents).toBe(0);
      expect(stats.totalEventsTracked).toBe(0);
      expect(stats.totalEventsFlushed).toBe(0);
      expect(collector.getSessionId()).not.toBe(oldSessionId);
    });
  });

  describe('Error Handling', () => {
    it('should put events back in batch on flush failure', async () => {
      // Create a collector with an invalid storage path
      const badStorageAdapter = createStorageAdapter('/nonexistent/path/that/should/fail', 90);
      const badCollector = createCollector(configManager, badStorageAdapter);

      await badCollector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      const result = await badCollector.flush();
      expect(result.success).toBe(false);

      const stats = badCollector.getStats();
      expect(stats.totalFlushErrors).toBe(1);
      expect(stats.pendingEvents).toBe(1); // Event back in batch
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getCollector', () => {
      const collector1 = getCollector();
      const collector2 = getCollector();
      expect(collector1).toBe(collector2);
    });

    it('should reset singleton on resetCollector', () => {
      const collector1 = getCollector();
      resetCollector();
      const collector2 = getCollector();
      expect(collector1).not.toBe(collector2);
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      // Set up the singleton with our test config
      resetConfigManager();
      resetCollector();
    });

    it('should check analytics enabled status', () => {
      const enabled = isAnalyticsEnabled();
      expect(typeof enabled).toBe('boolean');
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Analytics Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    tempDir = createTempDir();
  });

  afterEach(() => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    removeTempDir(tempDir);
  });

  it('should perform complete analytics flow', async () => {
    // Setup
    const configManager = new AnalyticsConfigManager({
      enabled: true,
      storagePath: tempDir,
      batchSize: 10,
      flushIntervalMs: 5000,
    });

    const storageAdapter = createStorageAdapter(tempDir, 90);
    await storageAdapter.initialize();

    const collector = createCollector(configManager, storageAdapter);

    // Track various events
    const tools = [TOOL_NAMES.TRACE, TOOL_NAMES.MODEL, TOOL_NAMES.DEBUG, TOOL_NAMES.DECIDE];
    for (const toolName of tools) {
      await collector.track({
        toolName,
        success: true,
        durationMs: Math.floor(Math.random() * 200) + 50,
      });
    }

    // Track a failed event
    await collector.track({
      toolName: TOOL_NAMES.PATTERN,
      success: false,
      durationMs: 25,
      errorCategory: 'validation',
    });

    // Shutdown and flush
    await collector.shutdown();

    // Verify data persisted
    const readResult = await storageAdapter.readEvents();
    expect(readResult.success).toBe(true);
    expect(readResult.events).toHaveLength(5);

    // Verify data integrity
    const successfulEvents = readResult.events.filter(e => e.success);
    const failedEvents = readResult.events.filter(e => !e.success);
    expect(successfulEvents).toHaveLength(4);
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0].errorCategory).toBe('validation');

    // Verify storage info
    const info = storageAdapter.getStorageInfo();
    expect(info.totalEvents).toBe(5);
  });

  it('should handle concurrent writes correctly', async () => {
    const configManager = new AnalyticsConfigManager({
      enabled: true,
      storagePath: tempDir,
      batchSize: 100,
      flushIntervalMs: 100000,
    });

    const storageAdapter = createStorageAdapter(tempDir, 90);
    await storageAdapter.initialize();

    // Create multiple collectors
    const collectors = [
      createCollector(configManager, storageAdapter),
      createCollector(configManager, storageAdapter),
      createCollector(configManager, storageAdapter),
    ];

    // Track events concurrently
    const trackPromises = collectors.map(async (collector, i) => {
      for (let j = 0; j < 5; j++) {
        await collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 100 + i * 10 + j,
        });
      }
      return collector.flush();
    });

    await Promise.all(trackPromises);

    // Verify all events were written
    const result = await storageAdapter.readEvents();
    expect(result.events).toHaveLength(15); // 3 collectors * 5 events
  });
});
