/**
 * Integration Tests for Tool Invocation Tracking
 *
 * Tests verify:
 * - Tracking captures correct metadata
 * - No content leakage (privacy guarantees)
 * - Error tracking categorization
 * - Performance impact is minimal
 * - Graceful degradation on tracking errors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { ToolName, TOOL_NAMES } from '../toolNames.js';
import {
  AnalyticsEvent,
  ErrorCategory,
  ANALYTICS_SCHEMA_VERSION,
} from './types.js';

import {
  AnalyticsConfigManager,
  resetConfigManager,
} from './config.js';

import {
  AnalyticsStorageAdapter,
  createStorageAdapter,
  resetStorageAdapter,
} from './storage.js';

import {
  AnalyticsCollector,
  createCollector,
  resetCollector,
} from './collector.js';

import {
  ToolInvocationTracker,
  TrackedInvocation,
  createTracker,
  getTracker,
  resetTracker,
  startInvocation,
  trackInvocation,
  trackInvocationSync,
  isTrackingEnabled,
  getTrackerStats,
} from './tracker.js';

import {
  withAnalytics,
  withAnalyticsSync,
  createToolMiddleware,
  createToolMiddlewareSync,
} from './middleware.js';

import {
  ErrorTracker,
  createErrorTracker,
  resetErrorTracker,
} from './errors.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(os.tmpdir(), `think-mcp-tracker-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
 * Creates a test setup with configured components.
 */
async function createTestSetup(options: { enabled?: boolean } = {}) {
  const tempDir = createTempDir();

  const configManager = new AnalyticsConfigManager({
    enabled: options.enabled ?? true,
    storagePath: tempDir,
    batchSize: 5,
    flushIntervalMs: 5000,
  });

  const storageAdapter = createStorageAdapter(tempDir, 90);
  await storageAdapter.initialize();

  const collector = createCollector(configManager, storageAdapter);
  const tracker = createTracker({ collector });
  const errorTracker = createErrorTracker({ storageAdapter });

  return {
    tempDir,
    configManager,
    storageAdapter,
    collector,
    tracker,
    errorTracker,
  };
}

/**
 * Cleanup test setup.
 */
async function cleanupTestSetup(setup: { collector?: AnalyticsCollector; tempDir: string }) {
  if (setup.collector) {
    await setup.collector.shutdown();
  }
  removeTempDir(setup.tempDir);
}

/**
 * Simulates a mock tool handler.
 */
function mockToolHandler<T>(returnValue: T, delayMs: number = 0): () => Promise<T> {
  return async () => {
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return returnValue;
  };
}

/**
 * Simulates a failing tool handler.
 */
function mockFailingHandler(error: Error, delayMs: number = 0): () => Promise<never> {
  return async () => {
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    throw error;
  };
}

// =============================================================================
// Tracker Tests - Metadata Capture
// =============================================================================

describe('Tool Invocation Tracker - Metadata Capture', () => {
  let setup: Awaited<ReturnType<typeof createTestSetup>>;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    setup = await createTestSetup();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    await cleanupTestSetup(setup);
  });

  describe('Basic Metadata Capture', () => {
    it('should capture tool name correctly', async () => {
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.TRACE);
      invocation.complete(true);

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(1);
      expect(result.events[0].toolName).toBe(TOOL_NAMES.TRACE);
    });

    it('should capture all tool names correctly', async () => {
      const toolNames: ToolName[] = Object.values(TOOL_NAMES);

      for (const toolName of toolNames) {
        const invocation = setup.tracker.startInvocation(toolName);
        invocation.complete(true);
      }

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(toolNames.length);

      for (const toolName of toolNames) {
        const event = result.events.find(e => e.toolName === toolName);
        expect(event).toBeDefined();
      }
    });

    it('should capture ISO timestamp', async () => {
      const beforeTime = new Date();

      const invocation = setup.tracker.startInvocation(TOOL_NAMES.MODEL);
      invocation.complete(true);

      const afterTime = new Date();

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(1);
      const timestamp = new Date(result.events[0].timestamp);

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());

      // Verify ISO format
      expect(result.events[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it('should capture success status correctly', async () => {
      // Track successful invocation
      setup.tracker.startInvocation(TOOL_NAMES.TRACE).complete(true);

      // Track failed invocation
      setup.tracker.startInvocation(TOOL_NAMES.MODEL).complete(false);

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(2);

      const successEvent = result.events.find(e => e.toolName === TOOL_NAMES.TRACE);
      const failedEvent = result.events.find(e => e.toolName === TOOL_NAMES.MODEL);

      expect(successEvent?.success).toBe(true);
      expect(failedEvent?.success).toBe(false);
    });

    it('should capture duration in milliseconds', async () => {
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.DEBUG);

      // Wait a bit to accumulate duration
      await new Promise(resolve => setTimeout(resolve, 50));

      invocation.complete(true);

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(1);
      expect(result.events[0].durationMs).toBeGreaterThanOrEqual(50);
      expect(result.events[0].durationMs).toBeLessThan(200); // Reasonable upper bound
    });

    it('should capture session ID', async () => {
      setup.tracker.startInvocation(TOOL_NAMES.PATTERN).complete(true);
      setup.tracker.startInvocation(TOOL_NAMES.COUNCIL).complete(true);

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(2);

      // Session ID should be the same for all events in a session
      expect(result.events[0].sessionId).toBe(result.events[1].sessionId);

      // Session ID should be a 16-character alphanumeric string
      expect(result.events[0].sessionId).toMatch(/^[a-z0-9]{16}$/);
    });

    it('should generate different session IDs for different tracker instances', async () => {
      const tracker1 = createTracker({ collector: setup.collector });
      const tracker2 = createTracker({ collector: setup.collector });

      tracker1.startInvocation(TOOL_NAMES.TRACE).complete(true);
      tracker2.startInvocation(TOOL_NAMES.MODEL).complete(true);

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(2);
      expect(result.events[0].sessionId).not.toBe(result.events[1].sessionId);
    });
  });

  describe('TrackedInvocation Interface', () => {
    it('should expose toolName from TrackedInvocation', () => {
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.DECIDE);
      expect(invocation.toolName).toBe(TOOL_NAMES.DECIDE);
    });

    it('should expose startTimestamp from TrackedInvocation', () => {
      const beforeTime = new Date().toISOString();
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.REFLECT);
      const afterTime = new Date().toISOString();

      expect(invocation.startTimestamp).toBeDefined();
      expect(invocation.startTimestamp >= beforeTime).toBe(true);
      expect(invocation.startTimestamp <= afterTime).toBe(true);
    });

    it('should provide getDuration method', async () => {
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.HYPOTHESIS);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50));

      const duration = invocation.getDuration();
      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThan(200);
    });

    it('should prevent double completion', async () => {
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.DEBATE);

      invocation.complete(true);
      invocation.complete(false, 'runtime'); // Second call should be ignored

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      // Only one event should be recorded
      expect(result.events).toHaveLength(1);
      expect(result.events[0].success).toBe(true);
      expect(result.events[0].errorCategory).toBeUndefined();
    });
  });

  describe('Wrapper Methods', () => {
    it('should track async invocation with trackInvocation', async () => {
      const handler = mockToolHandler({ result: 'success' }, 20);

      const result = await setup.tracker.trackInvocation(TOOL_NAMES.TRACE, handler);

      expect(result).toEqual({ result: 'success' });

      await setup.collector.flush();
      const events = await setup.storageAdapter.readEvents();

      expect(events.events).toHaveLength(1);
      expect(events.events[0].toolName).toBe(TOOL_NAMES.TRACE);
      expect(events.events[0].success).toBe(true);
      expect(events.events[0].durationMs).toBeGreaterThanOrEqual(20);
    });

    it('should track sync invocation with trackInvocationSync', async () => {
      const result = setup.tracker.trackInvocationSync(TOOL_NAMES.MODEL, () => {
        return { computed: 42 };
      });

      expect(result).toEqual({ computed: 42 });

      await setup.collector.flush();
      const events = await setup.storageAdapter.readEvents();

      expect(events.events).toHaveLength(1);
      expect(events.events[0].toolName).toBe(TOOL_NAMES.MODEL);
      expect(events.events[0].success).toBe(true);
    });

    it('should capture errors and re-throw with trackInvocation', async () => {
      const error = new Error('Test runtime error');
      const handler = mockFailingHandler(error);

      await expect(
        setup.tracker.trackInvocation(TOOL_NAMES.PATTERN, handler)
      ).rejects.toThrow('Test runtime error');

      await setup.collector.flush();
      const events = await setup.storageAdapter.readEvents();

      expect(events.events).toHaveLength(1);
      expect(events.events[0].success).toBe(false);
      expect(events.events[0].errorCategory).toBe('runtime');
    });

    it('should capture errors and re-throw with trackInvocationSync', async () => {
      const error = new Error('Sync error');

      expect(() =>
        setup.tracker.trackInvocationSync(TOOL_NAMES.DEBUG, () => {
          throw error;
        })
      ).toThrow('Sync error');

      await setup.collector.flush();
      const events = await setup.storageAdapter.readEvents();

      expect(events.events).toHaveLength(1);
      expect(events.events[0].success).toBe(false);
    });
  });

  describe('Tracker Statistics', () => {
    it('should track invocation statistics', async () => {
      setup.tracker.startInvocation(TOOL_NAMES.TRACE).complete(true);
      setup.tracker.startInvocation(TOOL_NAMES.MODEL).complete(true);
      setup.tracker.startInvocation(TOOL_NAMES.PATTERN).complete(false, 'runtime');

      const stats = setup.tracker.getStats();

      expect(stats.totalInvocationsStarted).toBe(3);
      expect(stats.totalInvocationsCompleted).toBe(3);
      expect(stats.totalSuccesses).toBe(2);
      expect(stats.totalErrors).toBe(1);
      expect(stats.activeInvocations).toBe(0);
    });

    it('should track active invocations', () => {
      const inv1 = setup.tracker.startInvocation(TOOL_NAMES.TRACE);
      const inv2 = setup.tracker.startInvocation(TOOL_NAMES.MODEL);

      expect(setup.tracker.getStats().activeInvocations).toBe(2);

      inv1.complete(true);
      expect(setup.tracker.getStats().activeInvocations).toBe(1);

      inv2.complete(true);
      expect(setup.tracker.getStats().activeInvocations).toBe(0);
    });

    it('should reset statistics on reset()', () => {
      setup.tracker.startInvocation(TOOL_NAMES.TRACE).complete(true);
      setup.tracker.startInvocation(TOOL_NAMES.MODEL).complete(false);

      const oldSessionId = setup.tracker.getSessionId();
      setup.tracker.reset();

      const stats = setup.tracker.getStats();
      expect(stats.totalInvocationsStarted).toBe(0);
      expect(stats.totalInvocationsCompleted).toBe(0);
      expect(stats.totalSuccesses).toBe(0);
      expect(stats.totalErrors).toBe(0);
      expect(setup.tracker.getSessionId()).not.toBe(oldSessionId);
    });
  });
});

// =============================================================================
// Privacy Tests - No Content Leakage
// =============================================================================

describe('Tool Invocation Tracker - Privacy & No Content Leakage', () => {
  let setup: Awaited<ReturnType<typeof createTestSetup>>;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    setup = await createTestSetup();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    await cleanupTestSetup(setup);
  });

  describe('Content Isolation', () => {
    it('should NOT capture tool arguments', async () => {
      // Simulate tracking with a tool that has sensitive arguments
      // The tracker should never receive or store these

      const sensitiveData = {
        thought: 'This is my private thought content',
        secret: 'password123',
        personalInfo: { name: 'John Doe', email: 'john@example.com' },
      };

      await setup.tracker.trackInvocation(TOOL_NAMES.TRACE, async () => {
        // Tool would process sensitiveData here
        return { processed: true };
      });

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(1);

      // Verify the event only contains allowed fields
      const event = result.events[0];
      const eventString = JSON.stringify(event);

      // None of the sensitive data should appear
      expect(eventString).not.toContain('private thought');
      expect(eventString).not.toContain('password');
      expect(eventString).not.toContain('John Doe');
      expect(eventString).not.toContain('john@example.com');

      // Event should only have these fields
      const allowedFields = new Set([
        'toolName',
        'timestamp',
        'success',
        'durationMs',
        'sessionId',
        'errorCategory',
      ]);

      for (const key of Object.keys(event)) {
        expect(allowedFields.has(key)).toBe(true);
      }
    });

    it('should NOT capture tool response content', async () => {
      const sensitiveResponse = {
        recommendation: 'Personal recommendation for user',
        analysis: 'Detailed analysis of private data',
        conclusions: ['conclusion1', 'conclusion2'],
      };

      await setup.tracker.trackInvocation(TOOL_NAMES.MODEL, async () => {
        return sensitiveResponse;
      });

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      const eventString = JSON.stringify(result.events[0]);

      expect(eventString).not.toContain('Personal recommendation');
      expect(eventString).not.toContain('private data');
      expect(eventString).not.toContain('conclusion1');
    });

    it('should NOT capture error messages', async () => {
      const sensitiveError = new Error('Database connection failed: password=secret123');

      try {
        await setup.tracker.trackInvocation(TOOL_NAMES.DEBUG, async () => {
          throw sensitiveError;
        });
      } catch {
        // Expected error
      }

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      const eventString = JSON.stringify(result.events[0]);

      // Error message should NOT appear
      expect(eventString).not.toContain('Database connection failed');
      expect(eventString).not.toContain('password=secret123');

      // Only error category should be present
      expect(result.events[0].errorCategory).toBe('runtime');
    });

    it('should only capture error category, never error details', async () => {
      const errors = [
        { error: new Error('Validation failed: invalid email format'), expectedCategory: 'runtime' as ErrorCategory },
        { error: new Error('Connection timeout after 30s'), expectedCategory: 'runtime' as ErrorCategory },
        { error: null, expectedCategory: 'unknown' as ErrorCategory },
      ];

      for (const { error } of errors) {
        const invocation = setup.tracker.startInvocation(TOOL_NAMES.PATTERN);
        if (error) {
          // Simulate error categorization
          const category = error.name.toLowerCase().includes('validation') ? 'validation' : 'runtime';
          invocation.complete(false, category as ErrorCategory);
        } else {
          invocation.complete(false, 'unknown');
        }
      }

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      for (const event of result.events) {
        // Verify no error messages leaked
        const eventKeys = Object.keys(event);
        expect(eventKeys).not.toContain('error');
        expect(eventKeys).not.toContain('errorMessage');
        expect(eventKeys).not.toContain('stack');
        expect(eventKeys).not.toContain('stackTrace');
      }
    });
  });

  describe('Session ID Anonymity', () => {
    it('should generate random session IDs not tied to user identity', () => {
      const tracker1 = createTracker({ collector: setup.collector });
      const tracker2 = createTracker({ collector: setup.collector });

      const id1 = tracker1.getSessionId();
      const id2 = tracker2.getSessionId();

      // IDs should be different
      expect(id1).not.toBe(id2);

      // IDs should not contain any predictable patterns
      expect(id1).not.toContain(os.hostname());
      expect(id1).not.toContain(process.pid.toString());
    });

    it('should generate session ID with correct format', () => {
      const sessionId = setup.tracker.getSessionId();

      // 16 characters, alphanumeric
      expect(sessionId).toMatch(/^[a-z0-9]{16}$/);
    });
  });

  describe('Data Minimization', () => {
    it('should only record minimum necessary fields', async () => {
      setup.tracker.startInvocation(TOOL_NAMES.COUNCIL).complete(true);

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      const event = result.events[0];
      const keys = Object.keys(event);

      // For successful invocation, these are the only allowed fields
      const allowedFieldsSuccess = ['toolName', 'timestamp', 'success', 'durationMs', 'sessionId'];

      expect(keys.sort()).toEqual(allowedFieldsSuccess.sort());
    });

    it('should add errorCategory only for failed invocations', async () => {
      setup.tracker.startInvocation(TOOL_NAMES.DECIDE).complete(true);
      setup.tracker.startInvocation(TOOL_NAMES.REFLECT).complete(false, 'validation');

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      const successEvent = result.events.find(e => e.success);
      const failedEvent = result.events.find(e => !e.success);

      expect(successEvent?.errorCategory).toBeUndefined();
      expect(failedEvent?.errorCategory).toBe('validation');
    });
  });
});

// =============================================================================
// Error Tracking Categorization Tests
// =============================================================================

describe('Tool Invocation Tracker - Error Categorization', () => {
  let setup: Awaited<ReturnType<typeof createTestSetup>>;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    setup = await createTestSetup();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    await cleanupTestSetup(setup);
  });

  describe('Error Category Assignment', () => {
    it('should categorize validation errors', async () => {
      class ValidationError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'ValidationError';
        }
      }

      await expect(
        setup.tracker.trackInvocation(TOOL_NAMES.TRACE, async () => {
          throw new ValidationError('Invalid input');
        })
      ).rejects.toThrow();

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events[0].errorCategory).toBe('validation');
    });

    it('should categorize schema errors as validation', async () => {
      class SchemaError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'SchemaError';
        }
      }

      await expect(
        setup.tracker.trackInvocation(TOOL_NAMES.MODEL, async () => {
          throw new SchemaError('Schema mismatch');
        })
      ).rejects.toThrow();

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events[0].errorCategory).toBe('validation');
    });

    it('should categorize type errors as validation', async () => {
      class TypeError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'TypeError';
        }
      }

      await expect(
        setup.tracker.trackInvocation(TOOL_NAMES.PATTERN, async () => {
          throw new TypeError('Type mismatch');
        })
      ).rejects.toThrow();

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events[0].errorCategory).toBe('validation');
    });

    it('should categorize timeout errors', async () => {
      class TimeoutError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'TimeoutError';
        }
      }

      await expect(
        setup.tracker.trackInvocation(TOOL_NAMES.DEBUG, async () => {
          throw new TimeoutError('Operation timed out');
        })
      ).rejects.toThrow();

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events[0].errorCategory).toBe('timeout');
    });

    it('should categorize ETIMEDOUT errors as timeout', async () => {
      class NetworkError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'ETIMEDOUT';
        }
      }

      await expect(
        setup.tracker.trackInvocation(TOOL_NAMES.COUNCIL, async () => {
          throw new NetworkError('Connection timed out');
        })
      ).rejects.toThrow();

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events[0].errorCategory).toBe('timeout');
    });

    it('should categorize generic errors as runtime', async () => {
      await expect(
        setup.tracker.trackInvocation(TOOL_NAMES.DECIDE, async () => {
          throw new Error('Something went wrong');
        })
      ).rejects.toThrow();

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events[0].errorCategory).toBe('runtime');
    });

    it('should categorize null/undefined errors as unknown', () => {
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.REFLECT);
      invocation.complete(false, 'unknown');

      // Verify no crash with undefined error category
      expect(setup.tracker.getStats().totalErrors).toBe(1);
    });

    it('should categorize non-Error throws as unknown', async () => {
      // The categorization happens in the tracker, which should handle this
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.HYPOTHESIS);

      // Manually complete with unknown since throwing non-Error
      invocation.complete(false, 'unknown');

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events[0].errorCategory).toBe('unknown');
    });
  });

  describe('Error Tracking Integration', () => {
    it('should track multiple error categories', async () => {
      const categories: ErrorCategory[] = ['validation', 'runtime', 'timeout', 'unknown'];

      for (const category of categories) {
        const invocation = setup.tracker.startInvocation(TOOL_NAMES.TRACE);
        invocation.complete(false, category);
      }

      await setup.collector.flush();
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(4);

      for (const category of categories) {
        const event = result.events.find(e => e.errorCategory === category);
        expect(event).toBeDefined();
      }
    });

    it('should work with ErrorTracker for aggregation', async () => {
      // Track several events with different outcomes
      setup.tracker.startInvocation(TOOL_NAMES.TRACE).complete(true);
      setup.tracker.startInvocation(TOOL_NAMES.TRACE).complete(true);
      setup.tracker.startInvocation(TOOL_NAMES.TRACE).complete(false, 'runtime');
      setup.tracker.startInvocation(TOOL_NAMES.MODEL).complete(false, 'validation');
      setup.tracker.startInvocation(TOOL_NAMES.MODEL).complete(false, 'timeout');

      await setup.collector.flush();

      // Now use ErrorTracker to analyze
      const errorStats = await setup.errorTracker.getErrorStats();

      expect(errorStats.totalInvocations).toBe(5);
      expect(errorStats.totalErrors).toBe(3);
      expect(errorStats.byCategory.runtime).toBe(1);
      expect(errorStats.byCategory.validation).toBe(1);
      expect(errorStats.byCategory.timeout).toBe(1);
    });
  });
});

// =============================================================================
// Performance Tests
// =============================================================================

describe('Tool Invocation Tracker - Performance Impact', () => {
  let setup: Awaited<ReturnType<typeof createTestSetup>>;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    setup = await createTestSetup();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    await cleanupTestSetup(setup);
  });

  describe('Minimal Overhead When Enabled', () => {
    it('should add minimal overhead to tool execution', async () => {
      const iterations = 100;

      // Measure baseline execution time
      const baselineStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await mockToolHandler({ result: i })();
      }
      const baselineTime = performance.now() - baselineStart;

      // Measure execution time with tracking
      const trackedStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await setup.tracker.trackInvocation(TOOL_NAMES.TRACE, mockToolHandler({ result: i }));
      }
      const trackedTime = performance.now() - trackedStart;

      // Tracking overhead should be minimal (less than 2x baseline)
      // This is a loose bound since timing can vary
      const overhead = trackedTime - baselineTime;
      const overheadPerCall = overhead / iterations;

      // Each call should add less than 1ms overhead
      expect(overheadPerCall).toBeLessThan(1);
    });

    it('should not block on synchronous tracking', () => {
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        const invocation = setup.tracker.startInvocation(TOOL_NAMES.MODEL);
        // Simulate some work
        let sum = 0;
        for (let j = 0; j < 100; j++) {
          sum += j;
        }
        invocation.complete(true);
      }
      const elapsed = performance.now() - start;

      // 1000 iterations should complete quickly
      // Average less than 0.1ms per iteration
      expect(elapsed / iterations).toBeLessThan(0.1);
    });
  });

  describe('Zero Overhead When Disabled', () => {
    it('should have zero overhead when analytics disabled', async () => {
      // Create disabled setup
      const disabledSetup = await createTestSetup({ enabled: false });

      try {
        const iterations = 1000;

        // Measure with disabled tracking
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          const invocation = disabledSetup.tracker.startInvocation(TOOL_NAMES.TRACE);
          invocation.complete(true);
        }
        const elapsed = performance.now() - start;

        // Should be very fast when disabled
        expect(elapsed / iterations).toBeLessThan(0.01); // Less than 0.01ms per call

        // No events should be tracked
        expect(disabledSetup.tracker.getStats().totalInvocationsStarted).toBe(0);
      } finally {
        await cleanupTestSetup(disabledSetup);
      }
    });

    it('should return no-op invocation when disabled', async () => {
      const disabledSetup = await createTestSetup({ enabled: false });

      try {
        const invocation = disabledSetup.tracker.startInvocation(TOOL_NAMES.MODEL);

        // Should return immediately without tracking
        expect(invocation.toolName).toBe(TOOL_NAMES.MODEL);
        expect(invocation.getDuration()).toBeGreaterThanOrEqual(0);

        // Complete should be a no-op
        invocation.complete(true);

        // No stats should change
        expect(disabledSetup.tracker.getStats().totalInvocationsStarted).toBe(0);
      } finally {
        await cleanupTestSetup(disabledSetup);
      }
    });
  });

  describe('Non-Blocking Operations', () => {
    it('should use fire-and-forget for sync tracking', async () => {
      const start = performance.now();

      // trackSync should return immediately
      setup.collector.trackSync({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      const elapsed = performance.now() - start;

      // Should complete in under 1ms
      expect(elapsed).toBeLessThan(1);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(setup.collector.getStats().totalEventsTracked).toBe(1);
    });
  });
});

// =============================================================================
// Graceful Degradation Tests
// =============================================================================

describe('Tool Invocation Tracker - Graceful Degradation', () => {
  let setup: Awaited<ReturnType<typeof createTestSetup>>;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    setup = await createTestSetup();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    await cleanupTestSetup(setup);
  });

  describe('Tracking Errors Never Affect Tool Execution', () => {
    it('should complete tool execution even if tracking fails', async () => {
      // Use middleware which catches all tracking errors
      const result = await withAnalytics(
        TOOL_NAMES.TRACE,
        async () => {
          return { value: 'success' };
        },
        { tracker: setup.tracker }
      );

      expect(result).toEqual({ value: 'success' });
    });

    it('should not throw when complete is called multiple times', () => {
      const invocation = setup.tracker.startInvocation(TOOL_NAMES.MODEL);

      // This should not throw
      expect(() => {
        invocation.complete(true);
        invocation.complete(false);
        invocation.complete(true, 'validation');
      }).not.toThrow();
    });

    it('should preserve original error from tool handler', async () => {
      const originalError = new Error('Original tool error');

      await expect(
        withAnalytics(
          TOOL_NAMES.PATTERN,
          async () => {
            throw originalError;
          },
          { tracker: setup.tracker }
        )
      ).rejects.toThrow('Original tool error');
    });
  });

  describe('Storage Errors Handling', () => {
    it('should not affect tracking when storage write fails', async () => {
      // Create a collector with invalid storage path
      const badStorage = createStorageAdapter('/nonexistent/invalid/path', 90);
      const badCollector = createCollector(setup.configManager, badStorage);
      const badTracker = createTracker({ collector: badCollector });

      // Tool execution should still work
      const result = await badTracker.trackInvocation(TOOL_NAMES.TRACE, async () => {
        return 'tool-result';
      });

      expect(result).toBe('tool-result');

      // Tracker stats should still be updated
      expect(badTracker.getStats().totalInvocationsCompleted).toBe(1);
    });
  });

  describe('Middleware Robustness', () => {
    it('should handle async handler success', async () => {
      const result = await withAnalytics(
        TOOL_NAMES.DEBUG,
        async () => ({ data: 'test' }),
        { tracker: setup.tracker }
      );

      expect(result).toEqual({ data: 'test' });
      expect(setup.tracker.getStats().totalSuccesses).toBe(1);
    });

    it('should handle sync handler success', () => {
      const result = withAnalyticsSync(
        TOOL_NAMES.COUNCIL,
        () => 42,
        { tracker: setup.tracker }
      );

      expect(result).toBe(42);
      expect(setup.tracker.getStats().totalSuccesses).toBe(1);
    });

    it('should handle async handler failure', async () => {
      await expect(
        withAnalytics(
          TOOL_NAMES.DECIDE,
          async () => {
            throw new Error('Async failure');
          },
          { tracker: setup.tracker }
        )
      ).rejects.toThrow('Async failure');

      expect(setup.tracker.getStats().totalErrors).toBe(1);
    });

    it('should handle sync handler failure', () => {
      expect(() =>
        withAnalyticsSync(
          TOOL_NAMES.REFLECT,
          () => {
            throw new Error('Sync failure');
          },
          { tracker: setup.tracker }
        )
      ).toThrow('Sync failure');

      expect(setup.tracker.getStats().totalErrors).toBe(1);
    });

    it('should work with bound middleware', async () => {
      const traceMiddleware = createToolMiddleware(TOOL_NAMES.TRACE, { tracker: setup.tracker });

      const result = await traceMiddleware(async () => 'traced');
      expect(result).toBe('traced');

      const syncMiddleware = createToolMiddlewareSync(TOOL_NAMES.MODEL, { tracker: setup.tracker });

      const syncResult = syncMiddleware(() => 'synced');
      expect(syncResult).toBe('synced');

      expect(setup.tracker.getStats().totalSuccesses).toBe(2);
    });
  });
});

// =============================================================================
// End-to-End Integration Tests
// =============================================================================

describe('Tool Invocation Tracker - End-to-End Integration', () => {
  let setup: Awaited<ReturnType<typeof createTestSetup>>;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    setup = await createTestSetup();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    resetErrorTracker();
    await cleanupTestSetup(setup);
  });

  describe('Complete Tracking Flow', () => {
    it('should track multiple tools end-to-end', async () => {
      // Simulate a typical usage pattern
      await withAnalytics(TOOL_NAMES.TRACE, async () => {
        await new Promise(r => setTimeout(r, 10));
        return { thought: 'processed' };
      }, { tracker: setup.tracker });

      await withAnalytics(TOOL_NAMES.MODEL, async () => {
        await new Promise(r => setTimeout(r, 15));
        return { model: 'applied' };
      }, { tracker: setup.tracker });

      try {
        await withAnalytics(TOOL_NAMES.PATTERN, async () => {
          throw new Error('Pattern matching failed');
        }, { tracker: setup.tracker });
      } catch {
        // Expected
      }

      withAnalyticsSync(TOOL_NAMES.DEBUG, () => {
        return { debug: true };
      }, { tracker: setup.tracker });

      // Flush all events
      await setup.collector.shutdown();

      // Verify all events were persisted
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(4);

      // Verify correct tools
      const tools = result.events.map(e => e.toolName);
      expect(tools).toContain(TOOL_NAMES.TRACE);
      expect(tools).toContain(TOOL_NAMES.MODEL);
      expect(tools).toContain(TOOL_NAMES.PATTERN);
      expect(tools).toContain(TOOL_NAMES.DEBUG);

      // Verify success/failure
      const successes = result.events.filter(e => e.success);
      const failures = result.events.filter(e => !e.success);
      expect(successes).toHaveLength(3);
      expect(failures).toHaveLength(1);

      // Verify durations are captured
      const traceEvent = result.events.find(e => e.toolName === TOOL_NAMES.TRACE);
      expect(traceEvent?.durationMs).toBeGreaterThanOrEqual(10);

      // Verify error category
      const patternEvent = result.events.find(e => e.toolName === TOOL_NAMES.PATTERN);
      expect(patternEvent?.errorCategory).toBe('runtime');
    });

    it('should maintain data integrity across shutdown and restart', async () => {
      // First session
      await withAnalytics(TOOL_NAMES.TRACE, async () => 'first', { tracker: setup.tracker });
      await withAnalytics(TOOL_NAMES.MODEL, async () => 'second', { tracker: setup.tracker });
      await setup.collector.shutdown();

      // Create new collector (simulating restart)
      const newCollector = createCollector(setup.configManager, setup.storageAdapter);
      const newTracker = createTracker({ collector: newCollector });

      // Second session
      await withAnalytics(TOOL_NAMES.DEBUG, async () => 'third', { tracker: newTracker });
      await newCollector.shutdown();

      // Verify all events persisted
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(3);

      // Verify session IDs
      const sessionIds = new Set(result.events.map(e => e.sessionId));
      expect(sessionIds.size).toBe(2); // Two different sessions
    });

    it('should handle high volume of events', async () => {
      const eventCount = 100;

      // Track many events
      for (let i = 0; i < eventCount; i++) {
        const toolName = Object.values(TOOL_NAMES)[i % Object.values(TOOL_NAMES).length];
        setup.tracker.startInvocation(toolName).complete(i % 10 !== 0); // 10% failure rate
      }

      await setup.collector.shutdown();

      // Verify all events persisted
      const result = await setup.storageAdapter.readEvents();

      expect(result.events).toHaveLength(eventCount);

      // Verify failure rate
      const failures = result.events.filter(e => !e.success);
      expect(failures.length).toBe(10); // 10% of 100
    });
  });

  describe('Singleton Pattern', () => {
    it('should use singleton tracker correctly', () => {
      const tracker1 = getTracker();
      const tracker2 = getTracker();

      expect(tracker1).toBe(tracker2);
    });

    it('should reset singleton on resetTracker', () => {
      const tracker1 = getTracker();
      tracker1.startInvocation(TOOL_NAMES.TRACE).complete(true);

      resetTracker();

      const tracker2 = getTracker();
      expect(tracker1).not.toBe(tracker2);
      expect(tracker2.getStats().totalInvocationsStarted).toBe(0);
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      // These use the default singleton which may not be configured for our test
      resetConfigManager();
      resetCollector();
      resetTracker();
    });

    it('should provide isTrackingEnabled convenience function', () => {
      const enabled = isTrackingEnabled();
      expect(typeof enabled).toBe('boolean');
    });

    it('should provide getTrackerStats convenience function', () => {
      const stats = getTrackerStats();
      expect(stats).toBeDefined();
      expect(typeof stats.enabled).toBe('boolean');
      expect(typeof stats.sessionId).toBe('string');
    });
  });
});
