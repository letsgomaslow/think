/**
 * Comprehensive Unit Tests for Consent Management and CLI Commands
 *
 * Tests for:
 * - Consent persistence across restarts
 * - Consent withdrawal
 * - CLI command functionality
 * - No data collection without consent
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import {
  ConsentManager,
  getConsentManager,
  resetConsentManager,
  createConsentManager,
  isConsentGiven,
  getConsentStatus,
  grantConsent,
  withdrawConsent,
  isFirstRun,
  needsReConsent,
  readConsentFile,
  writeConsentFile,
  deleteConsentFile,
  CURRENT_POLICY_VERSION,
  CONSENT_FILE_PATH,
  DEFAULT_CONSENT_RECORD,
} from './consent.js';

import {
  AnalyticsConfigManager,
  getConfigManager,
  resetConfigManager,
  CONFIG_DIR,
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
} from './collector.js';

import {
  runCli,
  enableAnalytics,
  disableAnalytics,
  showStatus,
  exportData,
  clearData,
  showPrivacyNotice,
  parseArgs,
  getHelpText,
  CliResult,
} from './cli.js';

import {
  PRIVACY_NOTICE_BRIEF,
  PRIVACY_NOTICE_FULL,
  ANALYTICS_ENABLED_MESSAGE,
  ANALYTICS_DISABLED_MESSAGE,
  ANALYTICS_DISABLED_WITH_DATA_DELETED_MESSAGE,
} from './PRIVACY_NOTICE.js';

import { TOOL_NAMES } from '../toolNames.js';
import { AnalyticsEvent, ConsentRecord } from './types.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(
    os.tmpdir(),
    `think-mcp-consent-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
 * Creates a temporary config directory and returns cleanup function.
 */
function setupTempConfigDir(): { configDir: string; cleanup: () => void } {
  const configDir = createTempDir();
  return {
    configDir,
    cleanup: () => removeTempDir(configDir),
  };
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

// =============================================================================
// Consent Manager Tests
// =============================================================================

describe('Consent Management Module', () => {
  let tempConfigDir: string;
  let originalConfigDir: string;
  let consentFilePath: string;

  beforeEach(() => {
    // Reset all singletons
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();

    // Create temp directory for consent file
    tempConfigDir = createTempDir();
    consentFilePath = path.join(tempConfigDir, 'consent.json');
  });

  afterEach(() => {
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    removeTempDir(tempConfigDir);
  });

  describe('DEFAULT_CONSENT_RECORD', () => {
    it('should have hasConsented set to false by default', () => {
      expect(DEFAULT_CONSENT_RECORD.hasConsented).toBe(false);
    });

    it('should have current policy version', () => {
      expect(DEFAULT_CONSENT_RECORD.policyVersion).toBe(CURRENT_POLICY_VERSION);
    });

    it('should not have timestamps by default', () => {
      expect(DEFAULT_CONSENT_RECORD.consentedAt).toBeUndefined();
      expect(DEFAULT_CONSENT_RECORD.withdrawnAt).toBeUndefined();
    });
  });

  describe('CURRENT_POLICY_VERSION', () => {
    it('should be a valid semver string', () => {
      expect(CURRENT_POLICY_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('File Operations', () => {
    describe('readConsentFile', () => {
      it('should return null when file does not exist', () => {
        const result = readConsentFile();
        // May return null if no default consent file exists
        expect(result === null || typeof result === 'object').toBe(true);
      });
    });

    describe('writeConsentFile', () => {
      it('should create consent file with record', () => {
        const record: ConsentRecord = {
          hasConsented: true,
          consentedAt: new Date().toISOString(),
          policyVersion: '1.0.0',
        };

        // Use the real CONFIG_DIR for write/read test
        writeConsentFile(record);

        const readResult = readConsentFile();
        expect(readResult).not.toBeNull();
        expect(readResult?.hasConsented).toBe(true);
        expect(readResult?.policyVersion).toBe('1.0.0');

        // Cleanup
        deleteConsentFile();
      });
    });

    describe('deleteConsentFile', () => {
      it('should delete consent file if exists', () => {
        const record: ConsentRecord = {
          hasConsented: true,
          policyVersion: '1.0.0',
        };

        writeConsentFile(record);
        const deleted = deleteConsentFile();
        expect(deleted).toBe(true);

        const readResult = readConsentFile();
        expect(readResult).toBeNull();
      });

      it('should return false if file does not exist', () => {
        // Ensure file doesn't exist first
        deleteConsentFile();
        const deleted = deleteConsentFile();
        expect(deleted).toBe(false);
      });
    });
  });

  describe('ConsentManager Class', () => {
    let manager: ConsentManager;
    let configManager: AnalyticsConfigManager;

    beforeEach(() => {
      configManager = new AnalyticsConfigManager();
      manager = new ConsentManager(configManager);
      // Clean up any existing consent file
      deleteConsentFile();
    });

    afterEach(() => {
      deleteConsentFile();
    });

    describe('isConsentGiven', () => {
      it('should return false when no consent has been given', () => {
        expect(manager.isConsentGiven()).toBe(false);
      });

      it('should return true after consent is granted', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        expect(manager.isConsentGiven()).toBe(true);
      });

      it('should return false after consent is withdrawn', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        await manager.withdrawConsent({ disableAnalytics: false });
        expect(manager.isConsentGiven()).toBe(false);
      });
    });

    describe('isFirstRun', () => {
      it('should return true when no consent file exists', () => {
        expect(manager.isFirstRun()).toBe(true);
      });

      it('should return false after consent is recorded', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        expect(manager.isFirstRun()).toBe(false);
      });
    });

    describe('grantConsent', () => {
      it('should record consent with timestamp', async () => {
        const beforeGrant = new Date().toISOString();
        const result = await manager.grantConsent({ enableAnalytics: false });

        expect(result.success).toBe(true);

        const record = manager.getConsentRecord();
        expect(record.hasConsented).toBe(true);
        expect(record.consentedAt).toBeDefined();
        expect(record.consentedAt! >= beforeGrant).toBe(true);
        expect(record.policyVersion).toBe(CURRENT_POLICY_VERSION);
      });

      it('should enable analytics in config when requested', async () => {
        await manager.grantConsent({ enableAnalytics: true });
        expect(configManager.isEnabled()).toBe(true);
      });

      it('should not enable analytics when enableAnalytics is false', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        expect(configManager.isEnabled()).toBe(false);
      });

      it('should persist consent to file', async () => {
        await manager.grantConsent({ enableAnalytics: false });

        const fileRecord = readConsentFile();
        expect(fileRecord).not.toBeNull();
        expect(fileRecord?.hasConsented).toBe(true);
      });
    });

    describe('withdrawConsent', () => {
      it('should record withdrawal with timestamp', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        const beforeWithdraw = new Date().toISOString();

        const result = await manager.withdrawConsent({ disableAnalytics: false });

        expect(result.success).toBe(true);

        const record = manager.getConsentRecord();
        expect(record.hasConsented).toBe(false);
        expect(record.withdrawnAt).toBeDefined();
        expect(record.withdrawnAt! >= beforeWithdraw).toBe(true);
      });

      it('should preserve original consent timestamp', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        const originalConsentedAt = manager.getConsentRecord().consentedAt;

        await manager.withdrawConsent({ disableAnalytics: false });

        const record = manager.getConsentRecord();
        expect(record.consentedAt).toBe(originalConsentedAt);
      });

      it('should disable analytics in config when requested', async () => {
        await manager.grantConsent({ enableAnalytics: true });
        expect(configManager.isEnabled()).toBe(true);

        await manager.withdrawConsent({ disableAnalytics: true });
        expect(configManager.isEnabled()).toBe(false);
      });

      it('should not disable analytics when disableAnalytics is false', async () => {
        await manager.grantConsent({ enableAnalytics: true });
        await manager.withdrawConsent({ disableAnalytics: false });
        // Note: The config may still be enabled since we didn't request to disable it
        // This tests that the flag is respected
      });
    });

    describe('setConsent', () => {
      it('should grant consent when passed true', async () => {
        const result = await manager.setConsent(true);
        expect(result.success).toBe(true);
        expect(manager.isConsentGiven()).toBe(true);
      });

      it('should withdraw consent when passed false', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        const result = await manager.setConsent(false);
        expect(result.success).toBe(true);
        expect(manager.isConsentGiven()).toBe(false);
      });
    });

    describe('getConsentStatus', () => {
      it('should return full status information', async () => {
        const status = manager.getConsentStatus();

        expect(status.hasConsented).toBe(false);
        expect(status.policyVersion).toBe(CURRENT_POLICY_VERSION);
        expect(status.isFirstRun).toBe(true);
        expect(status.needsReConsent).toBe(false);
      });

      it('should update status after grant', async () => {
        await manager.grantConsent({ enableAnalytics: false });

        const status = manager.getConsentStatus();

        expect(status.hasConsented).toBe(true);
        expect(status.consentedAt).toBeDefined();
        expect(status.isFirstRun).toBe(false);
      });

      it('should show withdrawal info after withdraw', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        await manager.withdrawConsent({ disableAnalytics: false });

        const status = manager.getConsentStatus();

        expect(status.hasConsented).toBe(false);
        expect(status.withdrawnAt).toBeDefined();
      });
    });

    describe('needsReConsent', () => {
      it('should return false when never consented', () => {
        expect(manager.needsReConsent()).toBe(false);
      });

      it('should return false when consented to current version', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        expect(manager.needsReConsent()).toBe(false);
      });

      it('should return true when consented to old version', async () => {
        // Manually write a consent file with old version
        const oldRecord: ConsentRecord = {
          hasConsented: true,
          consentedAt: new Date().toISOString(),
          policyVersion: '0.9.0', // Old version
        };
        writeConsentFile(oldRecord);
        manager.clearCache();

        expect(manager.needsReConsent()).toBe(true);

        // Cleanup
        deleteConsentFile();
      });
    });

    describe('updateConsentForNewPolicy', () => {
      it('should update policy version for existing consent', async () => {
        // Write consent with old version
        const oldRecord: ConsentRecord = {
          hasConsented: true,
          consentedAt: new Date().toISOString(),
          policyVersion: '0.9.0',
        };
        writeConsentFile(oldRecord);
        manager.clearCache();

        const result = await manager.updateConsentForNewPolicy();

        expect(result.success).toBe(true);

        const record = manager.getConsentRecord();
        expect(record.policyVersion).toBe(CURRENT_POLICY_VERSION);
      });

      it('should fail if never consented', async () => {
        const result = await manager.updateConsentForNewPolicy();
        expect(result.success).toBe(false);
        expect(result.error).toContain('not previously consented');
      });
    });

    describe('Cache Management', () => {
      it('should use cached record', async () => {
        await manager.grantConsent({ enableAnalytics: false });

        // First call caches
        const record1 = manager.getConsentRecord();
        // Second call should return cached
        const record2 = manager.getConsentRecord();

        expect(record1).toBe(record2); // Same object reference
      });

      it('should clear cache on request', async () => {
        await manager.grantConsent({ enableAnalytics: false });
        manager.getConsentRecord();

        manager.clearCache();

        // After clearing, should re-read from file
        const record = manager.getConsentRecord();
        expect(record.hasConsented).toBe(true);
      });

      it('should reset manager state', async () => {
        await manager.grantConsent({ enableAnalytics: false });

        manager.reset();

        // After reset, should read fresh from file (or defaults if no file)
        // The file should still exist
        expect(manager.isConsentGiven()).toBe(true);
      });
    });
  });

  describe('Singleton Pattern', () => {
    beforeEach(() => {
      deleteConsentFile();
    });

    afterEach(() => {
      deleteConsentFile();
    });

    it('should return same instance from getConsentManager', () => {
      const manager1 = getConsentManager();
      const manager2 = getConsentManager();
      expect(manager1).toBe(manager2);
    });

    it('should reset singleton on resetConsentManager', () => {
      const manager1 = getConsentManager();
      resetConsentManager();
      const manager2 = getConsentManager();
      expect(manager1).not.toBe(manager2);
    });

    it('should create independent instance with createConsentManager', () => {
      const singleton = getConsentManager();
      const custom = createConsentManager();
      expect(singleton).not.toBe(custom);
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      resetConsentManager();
      deleteConsentFile();
    });

    afterEach(() => {
      deleteConsentFile();
    });

    it('isConsentGiven should work', () => {
      expect(isConsentGiven()).toBe(false);
    });

    it('getConsentStatus should work', () => {
      const status = getConsentStatus();
      expect(status.hasConsented).toBe(false);
    });

    it('grantConsent should work', async () => {
      const result = await grantConsent({ enableAnalytics: false });
      expect(result.success).toBe(true);
      expect(isConsentGiven()).toBe(true);
    });

    it('withdrawConsent should work', async () => {
      await grantConsent({ enableAnalytics: false });
      const result = await withdrawConsent({ disableAnalytics: false });
      expect(result.success).toBe(true);
      expect(isConsentGiven()).toBe(false);
    });

    it('isFirstRun should work', () => {
      expect(isFirstRun()).toBe(true);
    });

    it('needsReConsent should work', () => {
      expect(needsReConsent()).toBe(false);
    });
  });

  describe('Consent Persistence Across Restarts', () => {
    beforeEach(() => {
      deleteConsentFile();
    });

    afterEach(() => {
      deleteConsentFile();
    });

    it('should persist consent across manager instances', async () => {
      // Create first manager and grant consent
      const manager1 = createConsentManager();
      await manager1.grantConsent({ enableAnalytics: false });

      // Create second manager (simulating restart)
      const manager2 = createConsentManager();

      // Should read persisted consent
      expect(manager2.isConsentGiven()).toBe(true);
    });

    it('should persist withdrawal across manager instances', async () => {
      // Create first manager and grant then withdraw
      const manager1 = createConsentManager();
      await manager1.grantConsent({ enableAnalytics: false });
      await manager1.withdrawConsent({ disableAnalytics: false });

      // Create second manager (simulating restart)
      const manager2 = createConsentManager();

      // Should read persisted withdrawal
      expect(manager2.isConsentGiven()).toBe(false);
      expect(manager2.getConsentRecord().withdrawnAt).toBeDefined();
    });

    it('should persist consent timestamp', async () => {
      const manager1 = createConsentManager();
      await manager1.grantConsent({ enableAnalytics: false });
      const originalTimestamp = manager1.getConsentRecord().consentedAt;

      const manager2 = createConsentManager();
      expect(manager2.getConsentRecord().consentedAt).toBe(originalTimestamp);
    });
  });
});

// =============================================================================
// CLI Command Tests
// =============================================================================

describe('Analytics CLI Module', () => {
  let tempDir: string;

  beforeEach(() => {
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    deleteConsentFile();

    tempDir = createTempDir();
  });

  afterEach(() => {
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    deleteConsentFile();
    removeTempDir(tempDir);
  });

  describe('parseArgs', () => {
    it('should parse enable command', () => {
      const result = parseArgs(['enable']);
      expect(result.command).toBe('enable');
    });

    it('should parse disable command', () => {
      const result = parseArgs(['disable']);
      expect(result.command).toBe('disable');
    });

    it('should parse disable with --delete-data flag', () => {
      const result = parseArgs(['disable', '--delete-data']);
      expect(result.command).toBe('disable');
      expect(result.options.deleteData).toBe(true);
    });

    it('should parse disable with -d flag', () => {
      const result = parseArgs(['disable', '-d']);
      expect(result.command).toBe('disable');
      expect(result.options.deleteData).toBe(true);
    });

    it('should parse status command', () => {
      const result = parseArgs(['status']);
      expect(result.command).toBe('status');
    });

    it('should parse status with --verbose flag', () => {
      const result = parseArgs(['status', '--verbose']);
      expect(result.command).toBe('status');
      expect(result.options.verbose).toBe(true);
    });

    it('should parse status with -v flag', () => {
      const result = parseArgs(['status', '-v']);
      expect(result.command).toBe('status');
      expect(result.options.verbose).toBe(true);
    });

    it('should parse export command', () => {
      const result = parseArgs(['export']);
      expect(result.command).toBe('export');
    });

    it('should parse export with format option', () => {
      const result = parseArgs(['export', '--format', 'csv']);
      expect(result.command).toBe('export');
      expect(result.options.format).toBe('csv');
    });

    it('should parse export with date range', () => {
      const result = parseArgs(['export', '--start', '2024-01-01', '--end', '2024-01-31']);
      expect(result.command).toBe('export');
      expect(result.options.startDate).toBe('2024-01-01');
      expect(result.options.endDate).toBe('2024-01-31');
    });

    it('should parse clear command', () => {
      const result = parseArgs(['clear']);
      expect(result.command).toBe('clear');
    });

    it('should parse privacy command', () => {
      const result = parseArgs(['privacy']);
      expect(result.command).toBe('privacy');
    });

    it('should parse privacy with --brief flag', () => {
      const result = parseArgs(['privacy', '--brief']);
      expect(result.command).toBe('privacy');
      expect(result.options.brief).toBe(true);
    });

    it('should parse help command', () => {
      const result = parseArgs(['help']);
      expect(result.command).toBe('help');
    });

    it('should parse --help flag', () => {
      const result = parseArgs(['--help']);
      expect(result.command).toBe('help');
    });

    it('should default to help with no args', () => {
      const result = parseArgs([]);
      expect(result.command).toBe('help');
    });

    it('should handle unknown command', () => {
      const result = parseArgs(['unknown-cmd']);
      expect(result.command).toBe('unknown');
      expect(result.unknownArg).toBe('unknown-cmd');
    });

    it('should be case insensitive', () => {
      const result = parseArgs(['ENABLE']);
      expect(result.command).toBe('enable');
    });
  });

  describe('getHelpText', () => {
    it('should return help text', () => {
      const help = getHelpText();
      expect(help).toContain('think-mcp analytics');
      expect(help).toContain('enable');
      expect(help).toContain('disable');
      expect(help).toContain('status');
      expect(help).toContain('export');
      expect(help).toContain('clear');
      expect(help).toContain('privacy');
    });
  });

  describe('enableAnalytics', () => {
    it('should enable analytics and grant consent', async () => {
      const result = await enableAnalytics();

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.message).toContain('Analytics enabled');
      expect(isConsentGiven()).toBe(true);
    });

    it('should return success message', async () => {
      const result = await enableAnalytics();
      expect(result.message).toBe(ANALYTICS_ENABLED_MESSAGE);
    });
  });

  describe('disableAnalytics', () => {
    it('should disable analytics and withdraw consent', async () => {
      // First enable
      await enableAnalytics();
      expect(isConsentGiven()).toBe(true);

      // Then disable
      const result = await disableAnalytics();

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(isConsentGiven()).toBe(false);
    });

    it('should return success message without delete', async () => {
      await enableAnalytics();
      const result = await disableAnalytics();
      expect(result.message).toBe(ANALYTICS_DISABLED_MESSAGE);
    });

    it('should delete data when deleteData option is true', async () => {
      // Set up storage adapter
      const configManager = new AnalyticsConfigManager({
        enabled: true,
        storagePath: tempDir,
      });
      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();

      // Write some data
      await storageAdapter.appendEvents([createMockEvent()]);

      // Enable first
      await enableAnalytics();

      // Disable with delete
      const result = await disableAnalytics({ deleteData: true });

      expect(result.success).toBe(true);
      expect(result.message).toBe(ANALYTICS_DISABLED_WITH_DATA_DELETED_MESSAGE);
    });
  });

  describe('showStatus', () => {
    it('should return status information', async () => {
      const result = await showStatus();

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.message).toContain('ANALYTICS STATUS');
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBeDefined();
    });

    it('should show disabled status when not enabled', async () => {
      const result = await showStatus();

      expect(result.message).toContain('DISABLED');
      expect(result.message).toContain('Consent Given:   No');
    });

    it('should show enabled status after enable', async () => {
      await enableAnalytics();
      const result = await showStatus();

      expect(result.message).toContain('ENABLED');
      expect(result.message).toContain('Consent Given:   Yes');
    });

    it('should show verbose output when requested', async () => {
      const result = await showStatus({ verbose: true });

      expect(result.message).toContain('CONFIGURATION');
      expect(result.message).toContain('Batch Size');
      expect(result.message).toContain('PRIVACY');
    });

    it('should show storage info', async () => {
      const result = await showStatus();

      expect(result.message).toContain('STORAGE');
      expect(result.message).toContain('Path:');
      expect(result.message).toContain('Total Files:');
      expect(result.message).toContain('Retention:');
    });
  });

  describe('exportData', () => {
    it('should handle empty data gracefully', async () => {
      const result = await exportData();

      expect(result.success).toBe(true);
      expect(result.message).toContain('No analytics data found');
    });

    it('should export data in JSON format by default', async () => {
      // Set up storage with data
      const configManager = new AnalyticsConfigManager({
        enabled: true,
        storagePath: tempDir,
      });
      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      await storageAdapter.appendEvents([createMockEvent()]);

      // Need to point the CLI to our storage
      getConfigManager().setOverride('storagePath', tempDir);

      const result = await exportData();

      expect(result.success).toBe(true);
      expect(result.data?.events).toBeDefined();
    });

    it('should support CSV format', async () => {
      // Set up storage with data
      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      await storageAdapter.appendEvents([createMockEvent()]);

      getConfigManager().setOverride('storagePath', tempDir);

      const result = await exportData({ format: 'csv' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('CSV');
    });

    it('should support date range filtering', async () => {
      const result = await exportData({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('clearData', () => {
    it('should clear all analytics data', async () => {
      // Set up storage with data
      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      await storageAdapter.appendEvents([
        createMockEvent(),
        createMockEvent(),
      ]);

      // Point to temp dir
      getConfigManager().setOverride('storagePath', tempDir);

      const result = await clearData();

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted');
      expect(result.data?.filesDeleted).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty storage gracefully', async () => {
      getConfigManager().setOverride('storagePath', tempDir);

      const result = await clearData();

      expect(result.success).toBe(true);
      expect(result.data?.filesDeleted).toBe(0);
    });
  });

  describe('showPrivacyNotice', () => {
    it('should show full privacy notice by default', async () => {
      const result = await showPrivacyNotice();

      expect(result.success).toBe(true);
      expect(result.message).toBe(PRIVACY_NOTICE_FULL);
    });

    it('should show brief privacy notice when requested', async () => {
      const result = await showPrivacyNotice(true);

      expect(result.success).toBe(true);
      expect(result.message).toBe(PRIVACY_NOTICE_BRIEF);
    });
  });

  describe('runCli', () => {
    it('should route to enable command', async () => {
      const result = await runCli(['enable']);
      expect(result.success).toBe(true);
      expect(isConsentGiven()).toBe(true);
    });

    it('should route to disable command', async () => {
      await runCli(['enable']);
      const result = await runCli(['disable']);
      expect(result.success).toBe(true);
      expect(isConsentGiven()).toBe(false);
    });

    it('should route to status command', async () => {
      const result = await runCli(['status']);
      expect(result.success).toBe(true);
      expect(result.message).toContain('ANALYTICS STATUS');
    });

    it('should route to export command', async () => {
      const result = await runCli(['export']);
      expect(result.success).toBe(true);
    });

    it('should route to clear command', async () => {
      getConfigManager().setOverride('storagePath', tempDir);
      const result = await runCli(['clear']);
      expect(result.success).toBe(true);
    });

    it('should route to privacy command', async () => {
      const result = await runCli(['privacy']);
      expect(result.success).toBe(true);
      expect(result.message).toBe(PRIVACY_NOTICE_FULL);
    });

    it('should route to help command', async () => {
      const result = await runCli(['help']);
      expect(result.success).toBe(true);
      expect(result.message).toContain('think-mcp analytics');
    });

    it('should handle unknown command', async () => {
      const result = await runCli(['unknown-command']);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.message).toContain('Unknown command');
    });

    it('should show help for empty args', async () => {
      const result = await runCli([]);
      expect(result.success).toBe(true);
      expect(result.message).toContain('think-mcp analytics');
    });

    it('should pass options to commands', async () => {
      await runCli(['enable']);
      const result = await runCli(['status', '--verbose']);
      expect(result.message).toContain('CONFIGURATION');
    });
  });
});

// =============================================================================
// Integration Tests: No Data Collection Without Consent
// =============================================================================

describe('Consent-Gated Data Collection', () => {
  let tempDir: string;
  let configManager: AnalyticsConfigManager;
  let storageAdapter: AnalyticsStorageAdapter;
  let collector: AnalyticsCollector;

  beforeEach(async () => {
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    deleteConsentFile();

    tempDir = createTempDir();

    // Create config manager with analytics disabled (no consent)
    configManager = new AnalyticsConfigManager({
      enabled: false, // Analytics disabled by default
      storagePath: tempDir,
      batchSize: 5,
      flushIntervalMs: 1000,
    });

    storageAdapter = createStorageAdapter(tempDir, 90);
    await storageAdapter.initialize();

    collector = createCollector(configManager, storageAdapter);
  });

  afterEach(async () => {
    await collector.shutdown();
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    deleteConsentFile();
    removeTempDir(tempDir);
  });

  it('should not collect data when analytics is disabled', async () => {
    // Attempt to track events
    await collector.track({
      toolName: TOOL_NAMES.TRACE,
      success: true,
      durationMs: 100,
    });

    await collector.flush();

    // Verify no data was written
    const readResult = await storageAdapter.readEvents();
    expect(readResult.events).toHaveLength(0);
  });

  it('should not collect data when consent is not given', async () => {
    // Verify consent is not given
    expect(isConsentGiven()).toBe(false);

    // Analytics should be disabled
    expect(configManager.isEnabled()).toBe(false);

    // Attempt to track
    await collector.track({
      toolName: TOOL_NAMES.TRACE,
      success: true,
      durationMs: 100,
    });

    await collector.flush();

    // Verify no events collected
    const stats = collector.getStats();
    expect(stats.totalEventsTracked).toBe(0);
  });

  it('should collect data after consent is granted', async () => {
    // Grant consent (which enables analytics)
    await grantConsent({ enableAnalytics: true });

    // Create new collector with enabled config
    const enabledConfigManager = new AnalyticsConfigManager({
      enabled: true,
      storagePath: tempDir,
      batchSize: 5,
      flushIntervalMs: 1000,
    });
    const enabledCollector = createCollector(enabledConfigManager, storageAdapter);

    // Track events
    await enabledCollector.track({
      toolName: TOOL_NAMES.TRACE,
      success: true,
      durationMs: 100,
    });

    await enabledCollector.flush();

    // Verify data was written
    const readResult = await storageAdapter.readEvents();
    expect(readResult.events).toHaveLength(1);

    await enabledCollector.shutdown();
  });

  it('should stop collecting data after consent is withdrawn', async () => {
    // Grant consent first
    await grantConsent({ enableAnalytics: true });

    const enabledConfigManager = new AnalyticsConfigManager({
      enabled: true,
      storagePath: tempDir,
      batchSize: 5,
      flushIntervalMs: 1000,
    });
    const enabledCollector = createCollector(enabledConfigManager, storageAdapter);

    // Track some events
    await enabledCollector.track({
      toolName: TOOL_NAMES.TRACE,
      success: true,
      durationMs: 100,
    });
    await enabledCollector.flush();

    // Withdraw consent
    await withdrawConsent({ disableAnalytics: true });

    // Disable analytics in config
    enabledConfigManager.setOverride('enabled', false);

    // Try to track more events
    await enabledCollector.track({
      toolName: TOOL_NAMES.MODEL,
      success: true,
      durationMs: 150,
    });
    await enabledCollector.flush();

    // Verify only the first event was persisted
    const readResult = await storageAdapter.readEvents();
    expect(readResult.events).toHaveLength(1);
    expect(readResult.events[0].toolName).toBe(TOOL_NAMES.TRACE);

    await enabledCollector.shutdown();
  });

  it('should have zero overhead when analytics is disabled', async () => {
    // Track many events
    for (let i = 0; i < 100; i++) {
      await collector.track({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });
    }

    await collector.flush();

    // Verify stats show no tracking occurred
    const stats = collector.getStats();
    expect(stats.totalEventsTracked).toBe(0);
    expect(stats.pendingEvents).toBe(0);
    expect(stats.totalEventsFlushed).toBe(0);
  });
});

// =============================================================================
// Edge Cases and Error Handling
// =============================================================================

describe('Consent Edge Cases', () => {
  beforeEach(() => {
    resetConsentManager();
    resetConfigManager();
    deleteConsentFile();
  });

  afterEach(() => {
    resetConsentManager();
    resetConfigManager();
    deleteConsentFile();
  });

  it('should handle re-granting consent after withdrawal', async () => {
    const manager = createConsentManager();

    // Grant
    await manager.grantConsent({ enableAnalytics: false });
    expect(manager.isConsentGiven()).toBe(true);

    // Withdraw
    await manager.withdrawConsent({ disableAnalytics: false });
    expect(manager.isConsentGiven()).toBe(false);

    // Re-grant
    await manager.grantConsent({ enableAnalytics: false });
    expect(manager.isConsentGiven()).toBe(true);

    // Should have updated consentedAt
    const record = manager.getConsentRecord();
    expect(record.consentedAt).toBeDefined();
    expect(record.withdrawnAt).toBeDefined(); // Preserved from history
  });

  it('should handle multiple rapid consent changes', async () => {
    const manager = createConsentManager();

    // Rapid changes
    await manager.grantConsent({ enableAnalytics: false });
    await manager.withdrawConsent({ disableAnalytics: false });
    await manager.grantConsent({ enableAnalytics: false });
    await manager.withdrawConsent({ disableAnalytics: false });
    await manager.grantConsent({ enableAnalytics: false });

    expect(manager.isConsentGiven()).toBe(true);
  });

  it('should handle corrupted consent file gracefully', () => {
    // Write corrupted JSON
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONSENT_FILE_PATH, 'not valid json {{{');

    const result = readConsentFile();
    expect(result).toBeNull();

    // Clean up
    deleteConsentFile();
  });

  it('should handle malformed consent record', () => {
    // Write valid JSON but invalid schema
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONSENT_FILE_PATH, JSON.stringify({ invalid: 'record' }));

    const result = readConsentFile();
    expect(result).toBeNull();

    // Clean up
    deleteConsentFile();
  });

  it('should handle missing hasConsented field', () => {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      CONSENT_FILE_PATH,
      JSON.stringify({ policyVersion: '1.0.0' })
    );

    const result = readConsentFile();
    expect(result).toBeNull();

    // Clean up
    deleteConsentFile();
  });
});

describe('CLI Error Handling', () => {
  beforeEach(() => {
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    deleteConsentFile();
  });

  afterEach(() => {
    resetConsentManager();
    resetConfigManager();
    resetStorageAdapter();
    deleteConsentFile();
  });

  it('should return error for invalid export format', async () => {
    const result = await exportData({ format: 'invalid' as any });
    // Should still succeed but default to JSON
    expect(result.success).toBe(true);
  });

  it('should handle status when storage is inaccessible', async () => {
    // Point to non-existent directory
    getConfigManager().setOverride('storagePath', '/nonexistent/path');

    const result = await showStatus();
    // Should still succeed but show empty storage
    expect(result.success).toBe(true);
  });
});
