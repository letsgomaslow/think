/**
 * Analytics Configuration Manager
 *
 * Handles reading/writing analytics preferences with support for:
 * - Config file: ~/.think-mcp/analytics.json
 * - Environment variables: THINK_MCP_ANALYTICS_*
 * - CLI overrides
 *
 * Analytics are disabled by default (opt-in required).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AnalyticsConfig, DEFAULT_ANALYTICS_CONFIG } from './types.js';

// =============================================================================
// Constants
// =============================================================================

/**
 * Environment variable names for analytics configuration.
 */
export const ENV_VARS = {
  /**
   * Master switch to enable/disable analytics.
   * Values: 'true', '1', 'yes' to enable; 'false', '0', 'no' to disable
   */
  ENABLED: 'THINK_MCP_ANALYTICS_ENABLED',

  /**
   * Number of days to retain analytics data.
   * Must be a positive integer.
   */
  RETENTION_DAYS: 'THINK_MCP_ANALYTICS_RETENTION_DAYS',

  /**
   * Path to analytics storage directory.
   * Overrides the default ~/.think-mcp/analytics
   */
  STORAGE_PATH: 'THINK_MCP_ANALYTICS_STORAGE_PATH',

  /**
   * Number of events to batch before writing.
   * Must be a positive integer.
   */
  BATCH_SIZE: 'THINK_MCP_ANALYTICS_BATCH_SIZE',

  /**
   * Flush interval in milliseconds.
   * Must be a positive integer.
   */
  FLUSH_INTERVAL_MS: 'THINK_MCP_ANALYTICS_FLUSH_INTERVAL_MS',
} as const;

/**
 * Default directory for think-mcp configuration.
 */
export const CONFIG_DIR = path.join(os.homedir(), '.think-mcp');

/**
 * Path to the analytics configuration file.
 */
export const CONFIG_FILE_PATH = path.join(CONFIG_DIR, 'analytics.json');

/**
 * Default analytics storage directory.
 */
export const DEFAULT_STORAGE_PATH = path.join(CONFIG_DIR, 'analytics');

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Result of configuration validation.
 */
export interface ConfigValidationResult {
  /**
   * Whether the configuration is valid.
   */
  valid: boolean;

  /**
   * Validation error messages, if any.
   */
  errors: string[];

  /**
   * Warning messages for non-critical issues.
   */
  warnings: string[];
}

/**
 * Configuration source for debugging.
 */
export type ConfigSource = 'default' | 'file' | 'env' | 'override';

/**
 * Resolved configuration with source tracking.
 */
export interface ResolvedConfig {
  /**
   * The resolved analytics configuration.
   */
  config: AnalyticsConfig;

  /**
   * Source of each configuration value.
   */
  sources: Record<keyof AnalyticsConfig, ConfigSource>;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates a boolean-like string from environment variables.
 * @param value - The string value to parse
 * @returns true, false, or undefined if invalid
 */
function parseBooleanEnv(value: string | undefined): boolean | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const lower = value.toLowerCase().trim();
  if (['true', '1', 'yes', 'on'].includes(lower)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(lower)) {
    return false;
  }
  return undefined;
}

/**
 * Validates a positive integer from environment variables.
 * @param value - The string value to parse
 * @returns The parsed number, or undefined if invalid
 */
function parsePositiveIntEnv(value: string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0) {
    return undefined;
  }
  return num;
}

/**
 * Validates the analytics configuration.
 * @param config - The configuration to validate
 * @returns Validation result with errors and warnings
 */
export function validateConfig(config: Partial<AnalyticsConfig>): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate enabled (must be boolean)
  if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
    errors.push(`Invalid 'enabled' value: expected boolean, got ${typeof config.enabled}`);
  }

  // Validate retentionDays (must be positive integer, max 365)
  if (config.retentionDays !== undefined) {
    if (typeof config.retentionDays !== 'number' || !Number.isInteger(config.retentionDays)) {
      errors.push(`Invalid 'retentionDays' value: expected integer, got ${typeof config.retentionDays}`);
    } else if (config.retentionDays < 1) {
      errors.push(`Invalid 'retentionDays' value: must be at least 1, got ${config.retentionDays}`);
    } else if (config.retentionDays > 365) {
      warnings.push(`'retentionDays' is set to ${config.retentionDays}. Consider using a value <= 365 for data minimization.`);
    }
  }

  // Validate storagePath (must be non-empty string)
  if (config.storagePath !== undefined) {
    if (typeof config.storagePath !== 'string') {
      errors.push(`Invalid 'storagePath' value: expected string, got ${typeof config.storagePath}`);
    } else if (config.storagePath.trim() === '') {
      errors.push(`Invalid 'storagePath' value: cannot be empty`);
    }
  }

  // Validate batchSize (must be positive integer, reasonable range)
  if (config.batchSize !== undefined) {
    if (typeof config.batchSize !== 'number' || !Number.isInteger(config.batchSize)) {
      errors.push(`Invalid 'batchSize' value: expected integer, got ${typeof config.batchSize}`);
    } else if (config.batchSize < 1) {
      errors.push(`Invalid 'batchSize' value: must be at least 1, got ${config.batchSize}`);
    } else if (config.batchSize > 1000) {
      warnings.push(`'batchSize' is set to ${config.batchSize}. Large batch sizes may increase memory usage.`);
    }
  }

  // Validate flushIntervalMs (must be positive integer, reasonable range)
  if (config.flushIntervalMs !== undefined) {
    if (typeof config.flushIntervalMs !== 'number' || !Number.isInteger(config.flushIntervalMs)) {
      errors.push(`Invalid 'flushIntervalMs' value: expected integer, got ${typeof config.flushIntervalMs}`);
    } else if (config.flushIntervalMs < 1000) {
      errors.push(`Invalid 'flushIntervalMs' value: must be at least 1000ms, got ${config.flushIntervalMs}`);
    } else if (config.flushIntervalMs > 300000) {
      warnings.push(`'flushIntervalMs' is set to ${config.flushIntervalMs}ms (${config.flushIntervalMs / 1000}s). Long intervals may result in data loss on crash.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// File Operations
// =============================================================================

/**
 * Expands the ~ in a path to the user's home directory.
 * @param filePath - Path that may contain ~
 * @returns Expanded path
 */
export function expandPath(filePath: string): string {
  if (filePath.startsWith('~')) {
    return path.join(os.homedir(), filePath.slice(1));
  }
  return filePath;
}

/**
 * Reads the analytics configuration from the config file.
 * @returns The configuration from file, or null if file doesn't exist or is invalid
 */
export function readConfigFile(): Partial<AnalyticsConfig> | null {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      return null;
    }

    const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);

    // Basic type check - must be an object
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    return parsed as Partial<AnalyticsConfig>;
  } catch {
    // File doesn't exist, is unreadable, or contains invalid JSON
    return null;
  }
}

/**
 * Writes the analytics configuration to the config file.
 * Creates the config directory if it doesn't exist.
 * @param config - The configuration to write
 * @throws Error if write fails
 */
export function writeConfigFile(config: Partial<AnalyticsConfig>): void {
  // Ensure config directory exists
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const content = JSON.stringify(config, null, 2);
  fs.writeFileSync(CONFIG_FILE_PATH, content, 'utf-8');
}

/**
 * Ensures the analytics storage directory exists.
 * @param storagePath - The storage path to create
 * @throws Error if directory creation fails
 */
export function ensureStorageDirectory(storagePath: string): void {
  const expandedPath = expandPath(storagePath);
  if (!fs.existsSync(expandedPath)) {
    fs.mkdirSync(expandedPath, { recursive: true });
  }
}

// =============================================================================
// Configuration Loading
// =============================================================================

/**
 * Reads analytics configuration from environment variables.
 * @returns Configuration values from environment, or empty object if none set
 */
export function readEnvConfig(): Partial<AnalyticsConfig> {
  const config: Partial<AnalyticsConfig> = {};

  // THINK_MCP_ANALYTICS_ENABLED
  const enabled = parseBooleanEnv(process.env[ENV_VARS.ENABLED]);
  if (enabled !== undefined) {
    config.enabled = enabled;
  }

  // THINK_MCP_ANALYTICS_RETENTION_DAYS
  const retentionDays = parsePositiveIntEnv(process.env[ENV_VARS.RETENTION_DAYS]);
  if (retentionDays !== undefined) {
    config.retentionDays = retentionDays;
  }

  // THINK_MCP_ANALYTICS_STORAGE_PATH
  const storagePath = process.env[ENV_VARS.STORAGE_PATH];
  if (storagePath && storagePath.trim() !== '') {
    config.storagePath = storagePath;
  }

  // THINK_MCP_ANALYTICS_BATCH_SIZE
  const batchSize = parsePositiveIntEnv(process.env[ENV_VARS.BATCH_SIZE]);
  if (batchSize !== undefined) {
    config.batchSize = batchSize;
  }

  // THINK_MCP_ANALYTICS_FLUSH_INTERVAL_MS
  const flushIntervalMs = parsePositiveIntEnv(process.env[ENV_VARS.FLUSH_INTERVAL_MS]);
  if (flushIntervalMs !== undefined) {
    config.flushIntervalMs = flushIntervalMs;
  }

  return config;
}

/**
 * Loads the analytics configuration with full resolution.
 * Priority (highest to lowest):
 * 1. CLI overrides (passed as parameter)
 * 2. Environment variables
 * 3. Config file
 * 4. Defaults
 *
 * @param overrides - Optional CLI overrides
 * @returns Resolved configuration with source tracking
 */
export function loadConfig(overrides?: Partial<AnalyticsConfig>): ResolvedConfig {
  // Start with defaults
  const config: AnalyticsConfig = { ...DEFAULT_ANALYTICS_CONFIG };
  const sources: Record<keyof AnalyticsConfig, ConfigSource> = {
    enabled: 'default',
    retentionDays: 'default',
    storagePath: 'default',
    batchSize: 'default',
    flushIntervalMs: 'default',
  };

  // Expand the default storage path
  config.storagePath = DEFAULT_STORAGE_PATH;

  // Layer 1: Apply file config
  const fileConfig = readConfigFile();
  if (fileConfig) {
    if (fileConfig.enabled !== undefined) {
      config.enabled = fileConfig.enabled;
      sources.enabled = 'file';
    }
    if (fileConfig.retentionDays !== undefined) {
      config.retentionDays = fileConfig.retentionDays;
      sources.retentionDays = 'file';
    }
    if (fileConfig.storagePath !== undefined) {
      config.storagePath = expandPath(fileConfig.storagePath);
      sources.storagePath = 'file';
    }
    if (fileConfig.batchSize !== undefined) {
      config.batchSize = fileConfig.batchSize;
      sources.batchSize = 'file';
    }
    if (fileConfig.flushIntervalMs !== undefined) {
      config.flushIntervalMs = fileConfig.flushIntervalMs;
      sources.flushIntervalMs = 'file';
    }
  }

  // Layer 2: Apply environment variables
  const envConfig = readEnvConfig();
  if (envConfig.enabled !== undefined) {
    config.enabled = envConfig.enabled;
    sources.enabled = 'env';
  }
  if (envConfig.retentionDays !== undefined) {
    config.retentionDays = envConfig.retentionDays;
    sources.retentionDays = 'env';
  }
  if (envConfig.storagePath !== undefined) {
    config.storagePath = expandPath(envConfig.storagePath);
    sources.storagePath = 'env';
  }
  if (envConfig.batchSize !== undefined) {
    config.batchSize = envConfig.batchSize;
    sources.batchSize = 'env';
  }
  if (envConfig.flushIntervalMs !== undefined) {
    config.flushIntervalMs = envConfig.flushIntervalMs;
    sources.flushIntervalMs = 'env';
  }

  // Layer 3: Apply CLI overrides
  if (overrides) {
    if (overrides.enabled !== undefined) {
      config.enabled = overrides.enabled;
      sources.enabled = 'override';
    }
    if (overrides.retentionDays !== undefined) {
      config.retentionDays = overrides.retentionDays;
      sources.retentionDays = 'override';
    }
    if (overrides.storagePath !== undefined) {
      config.storagePath = expandPath(overrides.storagePath);
      sources.storagePath = 'override';
    }
    if (overrides.batchSize !== undefined) {
      config.batchSize = overrides.batchSize;
      sources.batchSize = 'override';
    }
    if (overrides.flushIntervalMs !== undefined) {
      config.flushIntervalMs = overrides.flushIntervalMs;
      sources.flushIntervalMs = 'override';
    }
  }

  return { config, sources };
}

/**
 * Gets the analytics configuration with validation.
 * Returns a valid, resolved configuration.
 *
 * @param overrides - Optional CLI overrides
 * @returns The resolved analytics configuration
 * @throws Error if configuration is invalid
 */
export function getConfig(overrides?: Partial<AnalyticsConfig>): AnalyticsConfig {
  const { config } = loadConfig(overrides);

  const validation = validateConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid analytics configuration:\n${validation.errors.join('\n')}`);
  }

  return config;
}

// =============================================================================
// Configuration Manager Class
// =============================================================================

/**
 * Analytics Configuration Manager
 *
 * Provides a high-level interface for managing analytics configuration
 * with caching, validation, and persistence.
 */
export class AnalyticsConfigManager {
  private cachedConfig: AnalyticsConfig | null = null;
  private overrides: Partial<AnalyticsConfig> = {};

  /**
   * Creates a new configuration manager.
   * @param initialOverrides - Optional initial CLI overrides
   */
  constructor(initialOverrides?: Partial<AnalyticsConfig>) {
    if (initialOverrides) {
      this.overrides = { ...initialOverrides };
    }
  }

  /**
   * Gets the current analytics configuration.
   * Uses cached value if available.
   * @returns The current configuration
   */
  getConfig(): AnalyticsConfig {
    if (this.cachedConfig === null) {
      this.cachedConfig = getConfig(this.overrides);
    }
    return this.cachedConfig;
  }

  /**
   * Gets the full resolved configuration with source information.
   * @returns Configuration with source tracking
   */
  getResolvedConfig(): ResolvedConfig {
    return loadConfig(this.overrides);
  }

  /**
   * Checks if analytics are enabled.
   * @returns true if analytics are enabled
   */
  isEnabled(): boolean {
    return this.getConfig().enabled;
  }

  /**
   * Sets a runtime override for a configuration value.
   * Clears the cached configuration.
   * @param key - Configuration key to override
   * @param value - New value
   */
  setOverride<K extends keyof AnalyticsConfig>(key: K, value: AnalyticsConfig[K]): void {
    this.overrides[key] = value;
    this.cachedConfig = null;
  }

  /**
   * Clears all runtime overrides.
   * Clears the cached configuration.
   */
  clearOverrides(): void {
    this.overrides = {};
    this.cachedConfig = null;
  }

  /**
   * Reloads the configuration from file and environment.
   * Clears the cached configuration.
   */
  reload(): void {
    this.cachedConfig = null;
  }

  /**
   * Saves the current configuration to the config file.
   * Only saves values that differ from defaults.
   * @throws Error if save fails
   */
  save(): void {
    const config = this.getConfig();
    const toSave: Partial<AnalyticsConfig> = {};

    // Only save values that differ from defaults
    if (config.enabled !== DEFAULT_ANALYTICS_CONFIG.enabled) {
      toSave.enabled = config.enabled;
    }
    if (config.retentionDays !== DEFAULT_ANALYTICS_CONFIG.retentionDays) {
      toSave.retentionDays = config.retentionDays;
    }
    if (config.storagePath !== DEFAULT_STORAGE_PATH) {
      toSave.storagePath = config.storagePath;
    }
    if (config.batchSize !== DEFAULT_ANALYTICS_CONFIG.batchSize) {
      toSave.batchSize = config.batchSize;
    }
    if (config.flushIntervalMs !== DEFAULT_ANALYTICS_CONFIG.flushIntervalMs) {
      toSave.flushIntervalMs = config.flushIntervalMs;
    }

    writeConfigFile(toSave);
  }

  /**
   * Enables analytics and saves the configuration.
   * @throws Error if save fails
   */
  enable(): void {
    this.setOverride('enabled', true);
    this.save();
    this.cachedConfig = null;
  }

  /**
   * Disables analytics and saves the configuration.
   * @throws Error if save fails
   */
  disable(): void {
    this.setOverride('enabled', false);
    this.save();
    this.cachedConfig = null;
  }

  /**
   * Validates the current configuration.
   * @returns Validation result
   */
  validate(): ConfigValidationResult {
    try {
      const config = this.getConfig();
      return validateConfig(config);
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error'],
        warnings: [],
      };
    }
  }

  /**
   * Gets the storage path, expanded and ready for use.
   * @returns The expanded storage path
   */
  getStoragePath(): string {
    return this.getConfig().storagePath;
  }

  /**
   * Ensures the storage directory exists.
   * @throws Error if directory creation fails
   */
  ensureStorageExists(): void {
    ensureStorageDirectory(this.getStoragePath());
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the configuration manager.
 * Use this for simple access to analytics configuration.
 */
let defaultManager: AnalyticsConfigManager | null = null;

/**
 * Gets the default configuration manager instance.
 * Creates one if it doesn't exist.
 * @returns The default configuration manager
 */
export function getConfigManager(): AnalyticsConfigManager {
  if (defaultManager === null) {
    defaultManager = new AnalyticsConfigManager();
  }
  return defaultManager;
}

/**
 * Resets the default configuration manager.
 * Useful for testing.
 */
export function resetConfigManager(): void {
  defaultManager = null;
}
