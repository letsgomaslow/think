/**
 * Consent Management System
 *
 * Handles user consent for analytics collection with:
 * - First-run opt-in handling
 * - Persistent consent status storage
 * - Consent timestamp recording
 * - Consent withdrawal support
 * - No data collection until explicit opt-in
 *
 * Privacy-first design: analytics are disabled by default and require
 * explicit user consent before any data is collected.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConsentRecord } from './types.js';
import {
  getConfigManager,
  AnalyticsConfigManager,
  CONFIG_DIR,
} from './config.js';

// =============================================================================
// Constants
// =============================================================================

/**
 * Current version of the privacy policy.
 * Increment when the privacy policy changes significantly.
 */
export const CURRENT_POLICY_VERSION = '1.0.0';

/**
 * File name for storing consent record.
 */
const CONSENT_FILE_NAME = 'consent.json';

/**
 * Full path to the consent file.
 */
export const CONSENT_FILE_PATH = path.join(CONFIG_DIR, CONSENT_FILE_NAME);

/**
 * Default consent record for users who haven't consented yet.
 */
export const DEFAULT_CONSENT_RECORD: Readonly<ConsentRecord> = {
  hasConsented: false,
  policyVersion: CURRENT_POLICY_VERSION,
};

// =============================================================================
// Types
// =============================================================================

/**
 * Result of consent operations.
 */
export interface ConsentResult {
  /**
   * Whether the operation was successful.
   */
  success: boolean;

  /**
   * Error message if operation failed.
   */
  error?: string;
}

/**
 * Consent status information.
 */
export interface ConsentStatus {
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
   * Version of policy consented to.
   */
  policyVersion: string;

  /**
   * Whether consent needs to be re-requested due to policy changes.
   */
  needsReConsent: boolean;

  /**
   * Whether this is a first-run scenario (never prompted before).
   */
  isFirstRun: boolean;
}

/**
 * Options for granting consent.
 */
export interface GrantConsentOptions {
  /**
   * Whether to also enable analytics in the config.
   * @default true
   */
  enableAnalytics?: boolean;
}

/**
 * Options for withdrawing consent.
 */
export interface WithdrawConsentOptions {
  /**
   * Whether to also disable analytics in the config.
   * @default true
   */
  disableAnalytics?: boolean;

  /**
   * Whether to delete all collected analytics data.
   * @default false
   */
  deleteData?: boolean;
}

// =============================================================================
// File Operations
// =============================================================================

/**
 * Ensures the config directory exists.
 */
function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Reads the consent record from file.
 * @returns The consent record, or null if file doesn't exist or is invalid
 */
export function readConsentFile(): ConsentRecord | null {
  try {
    if (!fs.existsSync(CONSENT_FILE_PATH)) {
      return null;
    }

    const content = fs.readFileSync(CONSENT_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);

    // Basic validation
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.hasConsented !== 'boolean' ||
      typeof parsed.policyVersion !== 'string'
    ) {
      return null;
    }

    return parsed as ConsentRecord;
  } catch {
    // File doesn't exist, is unreadable, or contains invalid JSON
    return null;
  }
}

/**
 * Writes the consent record to file.
 * @param record - The consent record to write
 * @throws Error if write fails
 */
export function writeConsentFile(record: ConsentRecord): void {
  ensureConfigDir();
  const content = JSON.stringify(record, null, 2);
  fs.writeFileSync(CONSENT_FILE_PATH, content, 'utf-8');
}

/**
 * Deletes the consent file if it exists.
 * @returns true if file was deleted, false if it didn't exist
 */
export function deleteConsentFile(): boolean {
  try {
    if (fs.existsSync(CONSENT_FILE_PATH)) {
      fs.unlinkSync(CONSENT_FILE_PATH);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// =============================================================================
// Consent Manager Class
// =============================================================================

/**
 * Consent Manager
 *
 * Manages user consent for analytics collection with persistent storage
 * and integration with the analytics configuration system.
 *
 * Usage:
 * ```typescript
 * const manager = getConsentManager();
 *
 * // Check if consent is needed
 * if (!manager.isConsentGiven()) {
 *   // Show consent prompt...
 *   if (userAccepted) {
 *     await manager.grantConsent();
 *   }
 * }
 *
 * // Later: user wants to opt out
 * await manager.withdrawConsent({ deleteData: true });
 * ```
 */
export class ConsentManager {
  private cachedRecord: ConsentRecord | null = null;
  private configManager: AnalyticsConfigManager;

  /**
   * Creates a new consent manager.
   * @param configManager - Config manager to use (defaults to singleton)
   */
  constructor(configManager?: AnalyticsConfigManager) {
    this.configManager = configManager ?? getConfigManager();
  }

  // ===========================================================================
  // Status Methods
  // ===========================================================================

  /**
   * Checks if consent has been given for analytics collection.
   *
   * This is the primary method for checking if analytics can be collected.
   * Returns false until the user has explicitly opted in.
   *
   * @returns true if consent has been given and not withdrawn
   */
  isConsentGiven(): boolean {
    const record = this.getConsentRecord();
    return record.hasConsented;
  }

  /**
   * Gets the current consent status with full details.
   *
   * @returns Detailed consent status information
   */
  getConsentStatus(): ConsentStatus {
    const record = this.getConsentRecord();
    const fileExists = fs.existsSync(CONSENT_FILE_PATH);

    return {
      hasConsented: record.hasConsented,
      consentedAt: record.consentedAt,
      withdrawnAt: record.withdrawnAt,
      policyVersion: record.policyVersion,
      needsReConsent: this.needsReConsent(),
      isFirstRun: !fileExists,
    };
  }

  /**
   * Checks if consent needs to be re-requested due to policy version changes.
   *
   * @returns true if the policy version has changed since consent was given
   */
  needsReConsent(): boolean {
    const record = this.getConsentRecord();

    // No re-consent needed if never consented
    if (!record.hasConsented) {
      return false;
    }

    // Re-consent needed if policy version differs
    return record.policyVersion !== CURRENT_POLICY_VERSION;
  }

  /**
   * Checks if this is the first run (consent has never been prompted).
   *
   * @returns true if no consent file exists
   */
  isFirstRun(): boolean {
    return !fs.existsSync(CONSENT_FILE_PATH);
  }

  // ===========================================================================
  // Consent Operations
  // ===========================================================================

  /**
   * Grants consent for analytics collection.
   *
   * Records the consent with timestamp and policy version.
   * Optionally enables analytics in the configuration.
   *
   * @param options - Grant options
   * @returns Result of the operation
   */
  async grantConsent(options: GrantConsentOptions = {}): Promise<ConsentResult> {
    const { enableAnalytics = true } = options;

    try {
      const now = new Date().toISOString();
      const previousRecord = this.getConsentRecord();

      const newRecord: ConsentRecord = {
        hasConsented: true,
        consentedAt: now,
        // Preserve withdrawnAt for history, but it's no longer active
        withdrawnAt: previousRecord.withdrawnAt,
        policyVersion: CURRENT_POLICY_VERSION,
      };

      writeConsentFile(newRecord);
      this.cachedRecord = newRecord;

      // Enable analytics if requested
      if (enableAnalytics) {
        this.configManager.setOverride('enabled', true);
        this.configManager.save();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to grant consent',
      };
    }
  }

  /**
   * Sets consent status (convenience alias for grantConsent/withdrawConsent).
   *
   * @param consented - Whether to grant (true) or withdraw (false) consent
   * @returns Result of the operation
   */
  async setConsent(consented: boolean): Promise<ConsentResult> {
    if (consented) {
      return this.grantConsent();
    } else {
      return this.withdrawConsent();
    }
  }

  /**
   * Withdraws consent for analytics collection.
   *
   * Records the withdrawal with timestamp.
   * Optionally disables analytics and deletes collected data.
   *
   * @param options - Withdrawal options
   * @returns Result of the operation
   */
  async withdrawConsent(options: WithdrawConsentOptions = {}): Promise<ConsentResult> {
    const { disableAnalytics = true, deleteData = false } = options;

    try {
      const now = new Date().toISOString();
      const previousRecord = this.getConsentRecord();

      const newRecord: ConsentRecord = {
        hasConsented: false,
        // Preserve consentedAt for history
        consentedAt: previousRecord.consentedAt,
        withdrawnAt: now,
        policyVersion: previousRecord.policyVersion,
      };

      writeConsentFile(newRecord);
      this.cachedRecord = newRecord;

      // Disable analytics if requested
      if (disableAnalytics) {
        this.configManager.setOverride('enabled', false);
        this.configManager.save();
      }

      // Delete data if requested
      if (deleteData) {
        // Import dynamically to avoid circular dependency
        const { getStorageAdapter } = await import('./storage.js');
        const storage = getStorageAdapter();
        await storage.deleteAllData();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to withdraw consent',
      };
    }
  }

  /**
   * Updates consent for a new policy version.
   *
   * Use this when the privacy policy has changed and the user
   * confirms they accept the new version.
   *
   * @returns Result of the operation
   */
  async updateConsentForNewPolicy(): Promise<ConsentResult> {
    try {
      const previousRecord = this.getConsentRecord();

      if (!previousRecord.hasConsented) {
        return {
          success: false,
          error: 'Cannot update consent for new policy when not previously consented',
        };
      }

      const now = new Date().toISOString();

      const newRecord: ConsentRecord = {
        hasConsented: true,
        consentedAt: now, // New consent timestamp for new policy
        withdrawnAt: previousRecord.withdrawnAt,
        policyVersion: CURRENT_POLICY_VERSION,
      };

      writeConsentFile(newRecord);
      this.cachedRecord = newRecord;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update consent',
      };
    }
  }

  // ===========================================================================
  // Internal Methods
  // ===========================================================================

  /**
   * Gets the current consent record.
   * Uses cached value if available, otherwise reads from file.
   *
   * @returns The consent record (defaults if no file exists)
   */
  getConsentRecord(): ConsentRecord {
    if (this.cachedRecord !== null) {
      return this.cachedRecord;
    }

    const fileRecord = readConsentFile();
    if (fileRecord) {
      this.cachedRecord = fileRecord;
      return fileRecord;
    }

    // Return default (no consent given)
    return { ...DEFAULT_CONSENT_RECORD };
  }

  /**
   * Clears the cached consent record.
   * Forces a re-read from file on next access.
   */
  clearCache(): void {
    this.cachedRecord = null;
  }

  /**
   * Resets the consent manager state.
   * Useful for testing.
   */
  reset(): void {
    this.cachedRecord = null;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the consent manager.
 */
let defaultManager: ConsentManager | null = null;

/**
 * Gets the default consent manager instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default consent manager
 */
export function getConsentManager(): ConsentManager {
  if (defaultManager === null) {
    defaultManager = new ConsentManager();
  }
  return defaultManager;
}

/**
 * Resets the default consent manager.
 * Useful for testing.
 */
export function resetConsentManager(): void {
  if (defaultManager) {
    defaultManager.reset();
  }
  defaultManager = null;
}

/**
 * Creates a new consent manager with custom dependencies.
 * Does not affect the default singleton.
 *
 * @param configManager - Custom configuration manager
 * @returns New consent manager instance
 */
export function createConsentManager(
  configManager?: AnalyticsConfigManager
): ConsentManager {
  return new ConsentManager(configManager);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Checks if analytics consent has been given.
 * Convenience wrapper for getConsentManager().isConsentGiven().
 *
 * @returns true if consent has been given
 */
export function isConsentGiven(): boolean {
  return getConsentManager().isConsentGiven();
}

/**
 * Gets the current consent status.
 * Convenience wrapper for getConsentManager().getConsentStatus().
 *
 * @returns Consent status information
 */
export function getConsentStatus(): ConsentStatus {
  return getConsentManager().getConsentStatus();
}

/**
 * Grants consent for analytics.
 * Convenience wrapper for getConsentManager().grantConsent().
 *
 * @param options - Grant options
 * @returns Result of the operation
 */
export async function grantConsent(
  options?: GrantConsentOptions
): Promise<ConsentResult> {
  return getConsentManager().grantConsent(options);
}

/**
 * Withdraws consent for analytics.
 * Convenience wrapper for getConsentManager().withdrawConsent().
 *
 * @param options - Withdrawal options
 * @returns Result of the operation
 */
export async function withdrawConsent(
  options?: WithdrawConsentOptions
): Promise<ConsentResult> {
  return getConsentManager().withdrawConsent(options);
}

/**
 * Checks if this is the first run.
 * Convenience wrapper for getConsentManager().isFirstRun().
 *
 * @returns true if no consent has ever been recorded
 */
export function isFirstRun(): boolean {
  return getConsentManager().isFirstRun();
}

/**
 * Checks if re-consent is needed due to policy changes.
 * Convenience wrapper for getConsentManager().needsReConsent().
 *
 * @returns true if consent needs to be re-requested
 */
export function needsReConsent(): boolean {
  return getConsentManager().needsReConsent();
}
