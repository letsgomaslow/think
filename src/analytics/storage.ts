/**
 * Analytics Storage Adapter
 *
 * Persists analytics data locally using JSON files with:
 * - Date-based file rotation (daily files)
 * - Data retention cleanup based on configured retention period
 * - Thread-safe write operations using atomic file writes
 * - Graceful error handling for file system issues
 *
 * Storage format: ~/.think-mcp/analytics/analytics-YYYY-MM-DD.json
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AnalyticsEvent,
  DailyAnalyticsFile,
  ANALYTICS_SCHEMA_VERSION,
} from './types.js';
import { getConfigManager, expandPath } from './config.js';

// =============================================================================
// Constants
// =============================================================================

/**
 * File name prefix for analytics data files.
 */
const FILE_PREFIX = 'analytics-';

/**
 * File extension for analytics data files.
 */
const FILE_EXTENSION = '.json';

/**
 * Regex pattern to match analytics file names.
 * Matches: analytics-YYYY-MM-DD.json
 */
const FILE_NAME_PATTERN = /^analytics-(\d{4}-\d{2}-\d{2})\.json$/;

/**
 * Lock file suffix for thread-safe operations.
 */
const LOCK_SUFFIX = '.lock';

/**
 * Maximum time to wait for lock acquisition (milliseconds).
 */
const LOCK_TIMEOUT_MS = 5000;

/**
 * Delay between lock acquisition retries (milliseconds).
 */
const LOCK_RETRY_DELAY_MS = 50;

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Formats a date as YYYY-MM-DD.
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date string in YYYY-MM-DD format.
 * @returns Today's date string
 */
function getTodayDateString(): string {
  return formatDateString(new Date());
}

/**
 * Parses a YYYY-MM-DD date string into a Date object.
 * @param dateString - Date string to parse
 * @returns Parsed Date object, or null if invalid
 */
function parseDateString(dateString: string): Date | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  // Validate the date is real (e.g., not Feb 30)
  if (
    date.getFullYear() !== parseInt(year, 10) ||
    date.getMonth() !== parseInt(month, 10) - 1 ||
    date.getDate() !== parseInt(day, 10)
  ) {
    return null;
  }
  return date;
}

/**
 * Calculates the date that is N days ago from today.
 * @param days - Number of days ago
 * @returns Date object representing N days ago
 */
function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// =============================================================================
// File Path Utilities
// =============================================================================

/**
 * Gets the file path for a specific date's analytics file.
 * @param storagePath - Base storage directory path
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Full path to the analytics file
 */
function getFilePath(storagePath: string, dateString: string): string {
  const fileName = `${FILE_PREFIX}${dateString}${FILE_EXTENSION}`;
  return path.join(storagePath, fileName);
}

/**
 * Gets the lock file path for a specific analytics file.
 * @param filePath - Path to the analytics file
 * @returns Path to the lock file
 */
function getLockPath(filePath: string): string {
  return filePath + LOCK_SUFFIX;
}

/**
 * Extracts the date string from an analytics file name.
 * @param fileName - File name to parse
 * @returns Date string (YYYY-MM-DD), or null if not a valid analytics file
 */
function extractDateFromFileName(fileName: string): string | null {
  const match = fileName.match(FILE_NAME_PATTERN);
  return match ? match[1] : null;
}

// =============================================================================
// File Lock Implementation
// =============================================================================

/**
 * Result of a lock acquisition attempt.
 */
interface LockResult {
  /**
   * Whether the lock was successfully acquired.
   */
  acquired: boolean;

  /**
   * Release function to call when done with the lock.
   */
  release: () => void;
}

/**
 * Attempts to acquire a file lock for thread-safe operations.
 * Uses a lock file strategy with timeout.
 *
 * @param lockPath - Path to the lock file
 * @param timeoutMs - Maximum time to wait for lock
 * @returns Lock result with release function
 */
async function acquireLock(lockPath: string, timeoutMs: number = LOCK_TIMEOUT_MS): Promise<LockResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Try to create lock file exclusively (fails if exists)
      fs.writeFileSync(lockPath, String(process.pid), { flag: 'wx' });

      // Lock acquired
      return {
        acquired: true,
        release: () => {
          try {
            fs.unlinkSync(lockPath);
          } catch {
            // Lock file may have been cleaned up already
          }
        },
      };
    } catch (error) {
      // Check if lock file exists and is stale (old PID or very old)
      try {
        const stat = fs.statSync(lockPath);
        const lockAge = Date.now() - stat.mtimeMs;
        // If lock is older than timeout, assume it's stale and remove it
        if (lockAge > LOCK_TIMEOUT_MS) {
          fs.unlinkSync(lockPath);
          continue;
        }
      } catch {
        // Lock file doesn't exist, try again
        continue;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_DELAY_MS));
    }
  }

  // Timeout - return without lock
  return {
    acquired: false,
    release: () => {},
  };
}

// =============================================================================
// Storage Operations
// =============================================================================

/**
 * Ensures the storage directory exists.
 * @param storagePath - Path to the storage directory
 * @throws Error if directory creation fails
 */
function ensureStorageDirectory(storagePath: string): void {
  const expandedPath = expandPath(storagePath);
  if (!fs.existsSync(expandedPath)) {
    fs.mkdirSync(expandedPath, { recursive: true });
  }
}

/**
 * Creates an empty daily analytics file structure.
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Empty DailyAnalyticsFile object
 */
function createEmptyDailyFile(dateString: string): DailyAnalyticsFile {
  return {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    date: dateString,
    events: [],
    lastModified: new Date().toISOString(),
  };
}

/**
 * Reads a daily analytics file.
 * @param filePath - Path to the file
 * @returns The file contents, or null if file doesn't exist or is invalid
 */
function readDailyFile(filePath: string): DailyAnalyticsFile | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);

    // Basic validation
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.schemaVersion !== 'string' ||
      typeof parsed.date !== 'string' ||
      !Array.isArray(parsed.events)
    ) {
      return null;
    }

    return parsed as DailyAnalyticsFile;
  } catch {
    // File doesn't exist, is unreadable, or contains invalid JSON
    return null;
  }
}

/**
 * Writes a daily analytics file atomically.
 * Uses a temp file and rename strategy for atomicity.
 * @param filePath - Path to write to
 * @param data - Data to write
 */
function writeDailyFile(filePath: string, data: DailyAnalyticsFile): void {
  const tempPath = `${filePath}.tmp.${process.pid}`;
  const content = JSON.stringify(data, null, 2);

  try {
    // Write to temp file
    fs.writeFileSync(tempPath, content, 'utf-8');
    // Atomic rename
    fs.renameSync(tempPath, filePath);
  } finally {
    // Clean up temp file if it still exists
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

// =============================================================================
// Storage Adapter Interface
// =============================================================================

/**
 * Result of a write operation.
 */
export interface WriteResult {
  /**
   * Whether the write was successful.
   */
  success: boolean;

  /**
   * Number of events written.
   */
  eventsWritten: number;

  /**
   * Error message if write failed.
   */
  error?: string;
}

/**
 * Result of a read operation.
 */
export interface ReadResult {
  /**
   * Whether the read was successful.
   */
  success: boolean;

  /**
   * Events read from storage.
   */
  events: AnalyticsEvent[];

  /**
   * Date range of events read.
   */
  dateRange: {
    start: string;
    end: string;
  };

  /**
   * Error message if read failed.
   */
  error?: string;
}

/**
 * Result of a cleanup operation.
 */
export interface CleanupResult {
  /**
   * Whether the cleanup was successful.
   */
  success: boolean;

  /**
   * Number of files deleted.
   */
  filesDeleted: number;

  /**
   * Number of events deleted.
   */
  eventsDeleted: number;

  /**
   * Error message if cleanup failed.
   */
  error?: string;
}

/**
 * Information about stored analytics files.
 */
export interface StorageInfo {
  /**
   * Total number of files.
   */
  totalFiles: number;

  /**
   * Total number of events across all files.
   */
  totalEvents: number;

  /**
   * Total size in bytes.
   */
  totalBytes: number;

  /**
   * Oldest file date (YYYY-MM-DD).
   */
  oldestDate: string | null;

  /**
   * Newest file date (YYYY-MM-DD).
   */
  newestDate: string | null;
}

// =============================================================================
// Analytics Storage Adapter Class
// =============================================================================

/**
 * Analytics Storage Adapter
 *
 * Manages persistence of analytics events to local JSON files with:
 * - Date-based file rotation (one file per day)
 * - Thread-safe writes using file locking
 * - Automatic cleanup based on retention policy
 * - Graceful error handling
 */
export class AnalyticsStorageAdapter {
  private storagePath: string;
  private retentionDays: number;

  /**
   * Creates a new storage adapter.
   * @param storagePath - Path to the storage directory (defaults to config value)
   * @param retentionDays - Days to retain data (defaults to config value)
   */
  constructor(storagePath?: string, retentionDays?: number) {
    const config = getConfigManager().getConfig();
    this.storagePath = expandPath(storagePath ?? config.storagePath);
    this.retentionDays = retentionDays ?? config.retentionDays;
  }

  /**
   * Initializes the storage adapter.
   * Creates the storage directory if needed.
   */
  async initialize(): Promise<void> {
    ensureStorageDirectory(this.storagePath);
  }

  /**
   * Appends events to storage.
   * Events are grouped by date and written to appropriate daily files.
   *
   * @param events - Events to append
   * @returns Write result
   */
  async appendEvents(events: AnalyticsEvent[]): Promise<WriteResult> {
    if (events.length === 0) {
      return { success: true, eventsWritten: 0 };
    }

    try {
      ensureStorageDirectory(this.storagePath);

      // Group events by date
      const eventsByDate = new Map<string, AnalyticsEvent[]>();
      for (const event of events) {
        const dateString = event.timestamp.slice(0, 10); // Extract YYYY-MM-DD
        const dateEvents = eventsByDate.get(dateString) || [];
        dateEvents.push(event);
        eventsByDate.set(dateString, dateEvents);
      }

      let totalWritten = 0;

      // Write each date's events
      for (const [dateString, dateEvents] of eventsByDate) {
        const result = await this.appendEventsToDate(dateString, dateEvents);
        if (!result.success) {
          return {
            success: false,
            eventsWritten: totalWritten,
            error: result.error,
          };
        }
        totalWritten += result.eventsWritten;
      }

      return { success: true, eventsWritten: totalWritten };
    } catch (error) {
      return {
        success: false,
        eventsWritten: 0,
        error: error instanceof Error ? error.message : 'Unknown error during write',
      };
    }
  }

  /**
   * Appends events to a specific date's file.
   * Uses file locking for thread safety.
   *
   * @param dateString - Date in YYYY-MM-DD format
   * @param events - Events to append
   * @returns Write result
   */
  private async appendEventsToDate(
    dateString: string,
    events: AnalyticsEvent[]
  ): Promise<WriteResult> {
    const filePath = getFilePath(this.storagePath, dateString);
    const lockPath = getLockPath(filePath);

    const lock = await acquireLock(lockPath);
    if (!lock.acquired) {
      return {
        success: false,
        eventsWritten: 0,
        error: `Failed to acquire lock for ${dateString}`,
      };
    }

    try {
      // Read existing file or create new
      let dailyFile = readDailyFile(filePath);
      if (!dailyFile) {
        dailyFile = createEmptyDailyFile(dateString);
      }

      // Append events
      dailyFile.events.push(...events);
      dailyFile.lastModified = new Date().toISOString();

      // Write file
      writeDailyFile(filePath, dailyFile);

      return { success: true, eventsWritten: events.length };
    } finally {
      lock.release();
    }
  }

  /**
   * Reads events within a date range.
   *
   * @param startDate - Start date (YYYY-MM-DD), defaults to retention period start
   * @param endDate - End date (YYYY-MM-DD), defaults to today
   * @returns Read result with events
   */
  async readEvents(startDate?: string, endDate?: string): Promise<ReadResult> {
    try {
      const end = endDate ?? getTodayDateString();
      const start = startDate ?? formatDateString(getDaysAgo(this.retentionDays));

      const allEvents: AnalyticsEvent[] = [];

      // Get all analytics files
      const files = this.listAnalyticsFiles();

      // Filter files by date range and read
      for (const file of files) {
        const fileDate = extractDateFromFileName(file);
        if (fileDate && fileDate >= start && fileDate <= end) {
          const filePath = path.join(this.storagePath, file);
          const dailyFile = readDailyFile(filePath);
          if (dailyFile) {
            allEvents.push(...dailyFile.events);
          }
        }
      }

      // Sort by timestamp
      allEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      return {
        success: true,
        events: allEvents,
        dateRange: { start, end },
      };
    } catch (error) {
      return {
        success: false,
        events: [],
        dateRange: { start: '', end: '' },
        error: error instanceof Error ? error.message : 'Unknown error during read',
      };
    }
  }

  /**
   * Reads events for a specific date.
   *
   * @param dateString - Date in YYYY-MM-DD format
   * @returns Read result with events for that date
   */
  async readEventsForDate(dateString: string): Promise<ReadResult> {
    return this.readEvents(dateString, dateString);
  }

  /**
   * Runs cleanup to remove files older than retention period.
   *
   * @param dryRun - If true, only reports what would be deleted
   * @returns Cleanup result
   */
  async runCleanup(dryRun: boolean = false): Promise<CleanupResult> {
    try {
      const cutoffDate = getDaysAgo(this.retentionDays);
      const cutoffString = formatDateString(cutoffDate);

      const files = this.listAnalyticsFiles();
      let filesDeleted = 0;
      let eventsDeleted = 0;

      for (const file of files) {
        const fileDate = extractDateFromFileName(file);
        if (fileDate && fileDate < cutoffString) {
          const filePath = path.join(this.storagePath, file);

          // Count events before deletion
          const dailyFile = readDailyFile(filePath);
          const eventCount = dailyFile?.events.length ?? 0;

          if (!dryRun) {
            fs.unlinkSync(filePath);
          }

          filesDeleted++;
          eventsDeleted += eventCount;
        }
      }

      return {
        success: true,
        filesDeleted,
        eventsDeleted,
      };
    } catch (error) {
      return {
        success: false,
        filesDeleted: 0,
        eventsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error during cleanup',
      };
    }
  }

  /**
   * Deletes all analytics data.
   *
   * @returns Cleanup result
   */
  async deleteAllData(): Promise<CleanupResult> {
    try {
      const files = this.listAnalyticsFiles();
      let filesDeleted = 0;
      let eventsDeleted = 0;

      for (const file of files) {
        const filePath = path.join(this.storagePath, file);

        // Count events before deletion
        const dailyFile = readDailyFile(filePath);
        const eventCount = dailyFile?.events.length ?? 0;

        fs.unlinkSync(filePath);
        filesDeleted++;
        eventsDeleted += eventCount;
      }

      return {
        success: true,
        filesDeleted,
        eventsDeleted,
      };
    } catch (error) {
      return {
        success: false,
        filesDeleted: 0,
        eventsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error during deletion',
      };
    }
  }

  /**
   * Gets information about stored analytics data.
   *
   * @returns Storage information
   */
  getStorageInfo(): StorageInfo {
    const files = this.listAnalyticsFiles();
    let totalEvents = 0;
    let totalBytes = 0;
    let oldestDate: string | null = null;
    let newestDate: string | null = null;

    for (const file of files) {
      const filePath = path.join(this.storagePath, file);
      const fileDate = extractDateFromFileName(file);

      try {
        const stat = fs.statSync(filePath);
        totalBytes += stat.size;

        const dailyFile = readDailyFile(filePath);
        if (dailyFile) {
          totalEvents += dailyFile.events.length;
        }

        if (fileDate) {
          if (!oldestDate || fileDate < oldestDate) {
            oldestDate = fileDate;
          }
          if (!newestDate || fileDate > newestDate) {
            newestDate = fileDate;
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return {
      totalFiles: files.length,
      totalEvents,
      totalBytes,
      oldestDate,
      newestDate,
    };
  }

  /**
   * Lists all analytics files in the storage directory.
   *
   * @returns Array of file names
   */
  private listAnalyticsFiles(): string[] {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return [];
      }

      const files = fs.readdirSync(this.storagePath);
      return files.filter(file => FILE_NAME_PATTERN.test(file)).sort();
    } catch {
      return [];
    }
  }

  /**
   * Gets the storage path.
   *
   * @returns The storage directory path
   */
  getStoragePath(): string {
    return this.storagePath;
  }

  /**
   * Gets the retention days setting.
   *
   * @returns Number of days to retain data
   */
  getRetentionDays(): number {
    return this.retentionDays;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default singleton instance of the storage adapter.
 */
let defaultAdapter: AnalyticsStorageAdapter | null = null;

/**
 * Gets the default storage adapter instance.
 * Creates one if it doesn't exist.
 *
 * @returns The default storage adapter
 */
export function getStorageAdapter(): AnalyticsStorageAdapter {
  if (defaultAdapter === null) {
    defaultAdapter = new AnalyticsStorageAdapter();
  }
  return defaultAdapter;
}

/**
 * Resets the default storage adapter.
 * Useful for testing.
 */
export function resetStorageAdapter(): void {
  defaultAdapter = null;
}

/**
 * Creates a new storage adapter with custom settings.
 * Does not affect the default singleton.
 *
 * @param storagePath - Path to the storage directory
 * @param retentionDays - Days to retain data
 * @returns New storage adapter instance
 */
export function createStorageAdapter(
  storagePath: string,
  retentionDays?: number
): AnalyticsStorageAdapter {
  return new AnalyticsStorageAdapter(storagePath, retentionDays);
}
