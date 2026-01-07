/**
 * Performance Tests for Analytics Module
 *
 * These tests verify that the analytics module meets performance requirements:
 * - Analytics adds <1ms overhead to tool invocations
 * - No blocking I/O in hot path
 * - Memory usage is bounded
 * - Batching works efficiently
 *
 * Performance Characteristics:
 * - When disabled: Near-zero overhead (<0.01ms per call)
 * - When enabled: <1ms overhead per call (typically <0.1ms)
 * - No synchronous I/O in tracking hot path
 * - Memory bounded by batch size (default 100 events)
 * - Flush timer uses .unref() to not block Node.js exit
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { ToolName, TOOL_NAMES } from '../toolNames.js';
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
  createTracker,
  resetTracker,
} from './tracker.js';

import {
  withAnalytics,
  withAnalyticsSync,
} from './middleware.js';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Creates a temporary directory for test storage.
 */
function createTempDir(): string {
  const tempDir = path.join(os.tmpdir(), `think-mcp-perf-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
 * Test context with configured analytics components.
 */
interface TestContext {
  tempDir: string;
  configManager: AnalyticsConfigManager;
  storageAdapter: AnalyticsStorageAdapter;
  collector: AnalyticsCollector;
  tracker: ToolInvocationTracker;
}

/**
 * Creates a test context with enabled analytics.
 */
async function createEnabledContext(): Promise<TestContext> {
  const tempDir = createTempDir();

  const configManager = new AnalyticsConfigManager({
    enabled: true,
    storagePath: tempDir,
    batchSize: 100, // Default batch size
    flushIntervalMs: 30000, // 30 seconds - won't trigger during tests
  });

  const storageAdapter = createStorageAdapter(tempDir, 90);
  await storageAdapter.initialize();

  const collector = createCollector(configManager, storageAdapter);
  const tracker = createTracker({ collector });

  return { tempDir, configManager, storageAdapter, collector, tracker };
}

/**
 * Creates a test context with disabled analytics.
 */
async function createDisabledContext(): Promise<TestContext> {
  const tempDir = createTempDir();

  const configManager = new AnalyticsConfigManager({
    enabled: false,
    storagePath: tempDir,
    batchSize: 100,
    flushIntervalMs: 30000,
  });

  const storageAdapter = createStorageAdapter(tempDir, 90);
  await storageAdapter.initialize();

  const collector = createCollector(configManager, storageAdapter);
  const tracker = createTracker({ collector });

  return { tempDir, configManager, storageAdapter, collector, tracker };
}

/**
 * Cleanup test context.
 */
async function cleanupContext(ctx: TestContext): Promise<void> {
  await ctx.collector.shutdown();
  removeTempDir(ctx.tempDir);
}

/**
 * Measures the average execution time of a function over multiple iterations.
 */
async function measureAverageTime(
  fn: () => void | Promise<void>,
  iterations: number
): Promise<{ totalMs: number; avgMs: number; minMs: number; maxMs: number }> {
  let totalMs = 0;
  let minMs = Infinity;
  let maxMs = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const elapsed = performance.now() - start;
    totalMs += elapsed;
    minMs = Math.min(minMs, elapsed);
    maxMs = Math.max(maxMs, elapsed);
  }

  return {
    totalMs,
    avgMs: totalMs / iterations,
    minMs,
    maxMs,
  };
}

/**
 * A simple synchronous workload to simulate tool execution.
 */
function simulateWork(iterations: number = 100): number {
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i);
  }
  return sum;
}

// =============================================================================
// Performance Tests: Overhead Measurement
// =============================================================================

describe('Performance: Analytics Overhead', () => {
  let enabledCtx: TestContext;
  let disabledCtx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    enabledCtx = await createEnabledContext();
    disabledCtx = await createDisabledContext();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    await cleanupContext(enabledCtx);
    await cleanupContext(disabledCtx);
  });

  describe('Acceptance Criteria: <1ms overhead per tool invocation', () => {
    it('should add less than 1ms overhead per invocation when enabled', async () => {
      const iterations = 1000;

      // Measure baseline: just the simulated work
      const baseline = await measureAverageTime(() => {
        simulateWork();
      }, iterations);

      // Measure with tracking enabled
      const tracked = await measureAverageTime(() => {
        const invocation = enabledCtx.tracker.startInvocation(TOOL_NAMES.TRACE);
        simulateWork();
        invocation.complete(true);
      }, iterations);

      const overhead = tracked.avgMs - baseline.avgMs;

      // Overhead should be less than 1ms
      expect(overhead).toBeLessThan(1);

      // Log performance metrics for visibility
      console.log(`Performance: ${iterations} iterations`);
      console.log(`  Baseline avg: ${baseline.avgMs.toFixed(4)}ms`);
      console.log(`  Tracked avg: ${tracked.avgMs.toFixed(4)}ms`);
      console.log(`  Overhead: ${overhead.toFixed(4)}ms per call`);
    });

    it('should have near-zero overhead when disabled', async () => {
      const iterations = 1000;

      // Measure baseline
      const baseline = await measureAverageTime(() => {
        simulateWork();
      }, iterations);

      // Measure with tracking disabled
      const tracked = await measureAverageTime(() => {
        const invocation = disabledCtx.tracker.startInvocation(TOOL_NAMES.TRACE);
        simulateWork();
        invocation.complete(true);
      }, iterations);

      const overhead = tracked.avgMs - baseline.avgMs;

      // When disabled, overhead should be near-zero (<0.01ms)
      expect(overhead).toBeLessThan(0.01);

      console.log(`Disabled Performance: ${iterations} iterations`);
      console.log(`  Baseline avg: ${baseline.avgMs.toFixed(4)}ms`);
      console.log(`  Tracked avg: ${tracked.avgMs.toFixed(4)}ms`);
      console.log(`  Overhead: ${overhead.toFixed(4)}ms per call`);
    });

    it('should maintain low overhead with withAnalyticsSync middleware', async () => {
      const iterations = 1000;

      // Measure baseline
      const baseline = await measureAverageTime(() => {
        simulateWork();
      }, iterations);

      // Measure with middleware
      const tracked = await measureAverageTime(() => {
        withAnalyticsSync(TOOL_NAMES.MODEL, () => {
          return simulateWork();
        }, { tracker: enabledCtx.tracker });
      }, iterations);

      const overhead = tracked.avgMs - baseline.avgMs;

      // Overhead should be less than 1ms
      expect(overhead).toBeLessThan(1);
    });

    it('should maintain low overhead with async withAnalytics middleware', async () => {
      const iterations = 100; // Fewer iterations for async

      // Measure baseline async
      const baseline = await measureAverageTime(async () => {
        await Promise.resolve(simulateWork());
      }, iterations);

      // Measure with async middleware
      const tracked = await measureAverageTime(async () => {
        await withAnalytics(TOOL_NAMES.PATTERN, async () => {
          return simulateWork();
        }, { tracker: enabledCtx.tracker });
      }, iterations);

      const overhead = tracked.avgMs - baseline.avgMs;

      // Overhead should be less than 1ms
      expect(overhead).toBeLessThan(1);
    });
  });

  describe('Micro-benchmark: Individual Operations', () => {
    it('should complete startInvocation quickly', async () => {
      const iterations = 10000;

      const result = await measureAverageTime(() => {
        enabledCtx.tracker.startInvocation(TOOL_NAMES.TRACE);
      }, iterations);

      // startInvocation should be very fast (<0.1ms)
      expect(result.avgMs).toBeLessThan(0.1);

      console.log(`startInvocation: ${result.avgMs.toFixed(4)}ms avg`);
    });

    it('should complete invocation.complete() quickly', async () => {
      const iterations = 10000;
      const invocations: ReturnType<typeof enabledCtx.tracker.startInvocation>[] = [];

      // Pre-create invocations
      for (let i = 0; i < iterations; i++) {
        invocations.push(enabledCtx.tracker.startInvocation(TOOL_NAMES.MODEL));
      }

      let idx = 0;
      const result = await measureAverageTime(() => {
        invocations[idx++].complete(true);
      }, iterations);

      // complete should be very fast (<0.1ms)
      expect(result.avgMs).toBeLessThan(0.1);

      console.log(`complete(): ${result.avgMs.toFixed(4)}ms avg`);
    });

    it('should complete isEnabled check quickly', async () => {
      const iterations = 100000;

      const result = await measureAverageTime(() => {
        enabledCtx.tracker.isEnabled();
      }, iterations);

      // isEnabled should be extremely fast (<0.01ms)
      expect(result.avgMs).toBeLessThan(0.01);

      console.log(`isEnabled(): ${result.avgMs.toFixed(6)}ms avg`);
    });
  });
});

// =============================================================================
// Performance Tests: No Blocking I/O
// =============================================================================

describe('Performance: No Blocking I/O in Hot Path', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    ctx = await createEnabledContext();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    await cleanupContext(ctx);
  });

  describe('Acceptance Criteria: No blocking I/O in hot path', () => {
    it('should not perform file I/O during tracking', async () => {
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      const appendFileSpy = vi.spyOn(fs, 'appendFileSync');
      const iterations = 100;

      // Track multiple events without flushing
      for (let i = 0; i < iterations; i++) {
        const invocation = ctx.tracker.startInvocation(TOOL_NAMES.TRACE);
        invocation.complete(true);
      }

      // No synchronous file writes should have occurred during tracking
      // (all writes happen during flush, which is async)
      expect(writeFileSpy).not.toHaveBeenCalled();
      expect(appendFileSpy).not.toHaveBeenCalled();

      writeFileSpy.mockRestore();
      appendFileSpy.mockRestore();
    });

    it('should use fire-and-forget for trackSync', async () => {
      const start = performance.now();

      // trackSync should return immediately
      ctx.collector.trackSync({
        toolName: TOOL_NAMES.TRACE,
        success: true,
        durationMs: 100,
      });

      const elapsed = performance.now() - start;

      // Should complete in well under 1ms
      expect(elapsed).toBeLessThan(1);
    });

    it('should queue events in memory without waiting for I/O', async () => {
      const iterations = 1000;

      const start = performance.now();

      // Track many events rapidly
      for (let i = 0; i < iterations; i++) {
        ctx.collector.trackSync({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: i,
        });
      }

      const elapsed = performance.now() - start;

      // 1000 events should queue very quickly (<50ms total, <0.05ms each)
      expect(elapsed).toBeLessThan(50);
      expect(elapsed / iterations).toBeLessThan(0.05);

      console.log(`Queued ${iterations} events in ${elapsed.toFixed(2)}ms (${(elapsed / iterations).toFixed(4)}ms each)`);
    });

    it('should not block when batch is not full', async () => {
      const batchSize = ctx.configManager.getConfig().batchSize;

      // Track fewer events than batch size
      const eventCount = batchSize - 10;

      const start = performance.now();

      for (let i = 0; i < eventCount; i++) {
        await ctx.collector.track({
          toolName: TOOL_NAMES.MODEL,
          success: true,
          durationMs: 10,
        });
      }

      const elapsed = performance.now() - start;

      // Should be fast - no flush triggered
      expect(elapsed / eventCount).toBeLessThan(0.1);
    });
  });
});

// =============================================================================
// Performance Tests: Memory Usage
// =============================================================================

describe('Performance: Memory Usage Bounds', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    ctx = await createEnabledContext();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    await cleanupContext(ctx);
  });

  describe('Acceptance Criteria: Memory usage is bounded', () => {
    it('should limit pending events to batch size', async () => {
      const batchSize = ctx.configManager.getConfig().batchSize;

      // Track exactly batch size events
      for (let i = 0; i < batchSize; i++) {
        await ctx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 10,
        });
      }

      // After batch size is reached, batch should be flushed
      const stats = ctx.collector.getStats();

      // Pending should be 0 or near 0 after flush
      expect(stats.pendingEvents).toBeLessThanOrEqual(batchSize);
    });

    it('should flush when batch size is reached', async () => {
      const batchSize = ctx.configManager.getConfig().batchSize;

      // Track batch size + 1 events (should trigger flush)
      for (let i = 0; i <= batchSize; i++) {
        await ctx.collector.track({
          toolName: TOOL_NAMES.MODEL,
          success: true,
          durationMs: 10,
        });
      }

      const stats = ctx.collector.getStats();

      // Events should have been flushed
      expect(stats.totalEventsFlushed).toBeGreaterThan(0);
    });

    it('should not accumulate infinite events when analytics enabled', async () => {
      const eventCount = 500; // More than batch size
      const batchSize = ctx.configManager.getConfig().batchSize;

      for (let i = 0; i < eventCount; i++) {
        await ctx.collector.track({
          toolName: TOOL_NAMES.PATTERN,
          success: i % 10 !== 0, // 10% errors
          durationMs: Math.random() * 100,
        });
      }

      const stats = ctx.collector.getStats();

      // Pending events should never exceed batch size
      expect(stats.pendingEvents).toBeLessThanOrEqual(batchSize);

      // Most events should have been flushed
      expect(stats.totalEventsFlushed).toBeGreaterThan(0);
    });

    it('should have bounded active invocations tracking', () => {
      const invocations: ReturnType<typeof ctx.tracker.startInvocation>[] = [];

      // Start many invocations
      for (let i = 0; i < 100; i++) {
        invocations.push(ctx.tracker.startInvocation(TOOL_NAMES.DEBUG));
      }

      const stats = ctx.tracker.getStats();
      expect(stats.activeInvocations).toBe(100);

      // Complete all invocations
      for (const inv of invocations) {
        inv.complete(true);
      }

      const afterStats = ctx.tracker.getStats();
      expect(afterStats.activeInvocations).toBe(0);
    });

    it('should clear batch on shutdown', async () => {
      // Track some events
      for (let i = 0; i < 50; i++) {
        ctx.collector.trackSync({
          toolName: TOOL_NAMES.COUNCIL,
          success: true,
          durationMs: 10,
        });
      }

      // Shutdown should flush
      await ctx.collector.shutdown();

      const stats = ctx.collector.getStats();
      expect(stats.pendingEvents).toBe(0);
    });
  });

  describe('Memory efficiency with disabled analytics', () => {
    let disabledCtx: TestContext;

    beforeEach(async () => {
      disabledCtx = await createDisabledContext();
    });

    afterEach(async () => {
      await cleanupContext(disabledCtx);
    });

    it('should not store events when disabled', async () => {
      // Track many events with disabled analytics
      for (let i = 0; i < 1000; i++) {
        await disabledCtx.collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 10,
        });
      }

      const stats = disabledCtx.collector.getStats();

      // No events should be tracked or pending
      expect(stats.totalEventsTracked).toBe(0);
      expect(stats.pendingEvents).toBe(0);
    });

    it('should not maintain invocation stats when disabled', () => {
      // Start invocations when disabled
      for (let i = 0; i < 100; i++) {
        disabledCtx.tracker.startInvocation(TOOL_NAMES.MODEL).complete(true);
      }

      const stats = disabledCtx.tracker.getStats();

      // No invocations should be tracked
      expect(stats.totalInvocationsStarted).toBe(0);
      expect(stats.activeInvocations).toBe(0);
    });
  });
});

// =============================================================================
// Performance Tests: Batching Efficiency
// =============================================================================

describe('Performance: Batching Efficiency', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    if (ctx) {
      await cleanupContext(ctx);
    }
  });

  describe('Acceptance Criteria: Batching works efficiently', () => {
    it('should batch events to reduce I/O operations', async () => {
      const tempDir = createTempDir();
      const configManager = new AnalyticsConfigManager({
        enabled: true,
        storagePath: tempDir,
        batchSize: 10, // Small batch size for testing
        flushIntervalMs: 300000, // Long interval - won't trigger
      });

      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      const collector = createCollector(configManager, storageAdapter);

      ctx = {
        tempDir,
        configManager,
        storageAdapter,
        collector,
        tracker: createTracker({ collector }),
      };

      // Track 25 events (should trigger 2 flushes)
      for (let i = 0; i < 25; i++) {
        await collector.track({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 10,
        });
      }

      const stats = collector.getStats();

      // Should have flushed at least 20 events (2 batches of 10)
      expect(stats.totalEventsFlushed).toBeGreaterThanOrEqual(20);

      // Remaining events should be in batch
      expect(stats.pendingEvents).toBe(25 - stats.totalEventsFlushed);
    });

    it('should efficiently batch events from multiple tools', async () => {
      const tempDir = createTempDir();
      const configManager = new AnalyticsConfigManager({
        enabled: true,
        storagePath: tempDir,
        batchSize: 50,
        flushIntervalMs: 300000,
      });

      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      const collector = createCollector(configManager, storageAdapter);
      const tracker = createTracker({ collector });

      ctx = {
        tempDir,
        configManager,
        storageAdapter,
        collector,
        tracker,
      };

      // Track events from different tools
      const tools = Object.values(TOOL_NAMES);
      for (let i = 0; i < 100; i++) {
        const toolName = tools[i % tools.length];
        tracker.startInvocation(toolName).complete(i % 10 !== 0);
      }

      await collector.flush();

      // All events should be persisted
      const result = await storageAdapter.readEvents();
      expect(result.events).toHaveLength(100);

      // Verify different tools are represented
      const toolSet = new Set(result.events.map(e => e.toolName));
      expect(toolSet.size).toBe(tools.length);
    });

    it('should handle rapid-fire events efficiently', async () => {
      ctx = await createEnabledContext();

      const iterations = 1000;
      const start = performance.now();

      // Fire events as fast as possible
      for (let i = 0; i < iterations; i++) {
        ctx.collector.trackSync({
          toolName: TOOL_NAMES.TRACE,
          success: true,
          durationMs: 1,
        });
      }

      const queueTime = performance.now() - start;

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Flush remaining
      await ctx.collector.flush();

      const stats = ctx.collector.getStats();

      // All events should be processed
      expect(stats.totalEventsTracked).toBe(iterations);

      // Queue time should be fast
      expect(queueTime / iterations).toBeLessThan(0.1);

      console.log(`Rapid-fire: ${iterations} events queued in ${queueTime.toFixed(2)}ms`);
    });

    it('should not block caller during batch flush', async () => {
      const tempDir = createTempDir();
      const configManager = new AnalyticsConfigManager({
        enabled: true,
        storagePath: tempDir,
        batchSize: 5, // Small batch to trigger frequent flushes
        flushIntervalMs: 300000,
      });

      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      const collector = createCollector(configManager, storageAdapter);

      ctx = {
        tempDir,
        configManager,
        storageAdapter,
        collector,
        tracker: createTracker({ collector }),
      };

      const timings: number[] = [];

      // Track events that will trigger multiple flushes
      for (let i = 0; i < 50; i++) {
        const start = performance.now();

        await collector.track({
          toolName: TOOL_NAMES.MODEL,
          success: true,
          durationMs: 10,
        });

        timings.push(performance.now() - start);
      }

      // Average time should be low even with flushes happening
      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxTime = Math.max(...timings);

      // Most operations should be fast (< 1ms)
      const fastCount = timings.filter(t => t < 1).length;
      expect(fastCount / timings.length).toBeGreaterThan(0.8); // 80% should be under 1ms

      console.log(`Batch flush test: avg=${avgTime.toFixed(4)}ms, max=${maxTime.toFixed(4)}ms`);
    });
  });
});

// =============================================================================
// Performance Tests: End-to-End Benchmarks
// =============================================================================

describe('Performance: End-to-End Benchmarks', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    ctx = await createEnabledContext();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
    await cleanupContext(ctx);
  });

  describe('Real-world usage scenarios', () => {
    it('should handle typical MCP session workload', async () => {
      // Simulate a typical session: 50-100 tool calls over a few minutes
      const toolCalls = 75;

      const start = performance.now();

      for (let i = 0; i < toolCalls; i++) {
        const toolName = Object.values(TOOL_NAMES)[i % Object.values(TOOL_NAMES).length];

        await withAnalytics(toolName, async () => {
          // Simulate actual tool work (1-10ms)
          await new Promise(r => setTimeout(r, Math.random() * 9 + 1));
          return { result: 'success' };
        }, { tracker: ctx.tracker });
      }

      await ctx.collector.shutdown();

      const totalTime = performance.now() - start;
      const avgTimePerCall = totalTime / toolCalls;

      // Average time should be dominated by simulated work, not tracking
      // Simulated work is 1-10ms (avg ~5ms), so total should be close to that
      expect(avgTimePerCall).toBeLessThan(15); // Allow some margin

      // Verify all events recorded
      const result = await ctx.storageAdapter.readEvents();
      expect(result.events).toHaveLength(toolCalls);

      console.log(`Session benchmark: ${toolCalls} calls in ${totalTime.toFixed(0)}ms (${avgTimePerCall.toFixed(2)}ms/call)`);
    });

    it('should handle burst traffic patterns', async () => {
      // Simulate burst: 20 rapid calls, pause, repeat
      const bursts = 5;
      const callsPerBurst = 20;

      const start = performance.now();

      for (let burst = 0; burst < bursts; burst++) {
        // Rapid calls
        for (let i = 0; i < callsPerBurst; i++) {
          ctx.tracker.startInvocation(TOOL_NAMES.TRACE).complete(true);
        }

        // Pause between bursts
        await new Promise(r => setTimeout(r, 50));
      }

      await ctx.collector.shutdown();

      const totalTime = performance.now() - start;
      const totalCalls = bursts * callsPerBurst;

      // All events should be recorded
      const result = await ctx.storageAdapter.readEvents();
      expect(result.events).toHaveLength(totalCalls);

      console.log(`Burst benchmark: ${totalCalls} calls in ${totalTime.toFixed(0)}ms`);
    });

    it('should maintain performance under sustained load', async () => {
      const duration = 1000; // 1 second of sustained load
      const start = performance.now();
      let callCount = 0;

      while (performance.now() - start < duration) {
        ctx.tracker.startInvocation(TOOL_NAMES.MODEL).complete(true);
        callCount++;
      }

      await ctx.collector.shutdown();

      const elapsed = performance.now() - start;
      const callsPerSecond = (callCount / elapsed) * 1000;

      // Should handle at least 10,000 calls per second
      expect(callsPerSecond).toBeGreaterThan(10000);

      console.log(`Sustained load: ${callCount} calls in ${elapsed.toFixed(0)}ms (${callsPerSecond.toFixed(0)} calls/sec)`);
    });
  });
});

// =============================================================================
// Performance Tests: Edge Cases
// =============================================================================

describe('Performance: Edge Cases', () => {
  beforeEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
  });

  afterEach(async () => {
    resetConfigManager();
    resetStorageAdapter();
    resetCollector();
    resetTracker();
  });

  it('should handle rapid enable/disable toggles gracefully', async () => {
    const tempDir = createTempDir();

    try {
      const configManager = new AnalyticsConfigManager({
        enabled: true,
        storagePath: tempDir,
        batchSize: 100,
        flushIntervalMs: 30000,
      });

      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      const collector = createCollector(configManager, storageAdapter);
      const tracker = createTracker({ collector });

      // Alternate between enabled and disabled
      for (let i = 0; i < 100; i++) {
        configManager.setOverride('enabled', i % 2 === 0);
        tracker.startInvocation(TOOL_NAMES.TRACE).complete(true);
      }

      await collector.shutdown();

      // Should not crash or hang
      const stats = tracker.getStats();
      expect(typeof stats.totalInvocationsStarted).toBe('number');
    } finally {
      removeTempDir(tempDir);
    }
  });

  it('should handle concurrent tracking from multiple trackers', async () => {
    const tempDir = createTempDir();

    try {
      const configManager = new AnalyticsConfigManager({
        enabled: true,
        storagePath: tempDir,
        batchSize: 100,
        flushIntervalMs: 30000,
      });

      const storageAdapter = createStorageAdapter(tempDir, 90);
      await storageAdapter.initialize();
      const collector = createCollector(configManager, storageAdapter);

      // Create multiple trackers sharing same collector
      const trackers = [
        createTracker({ collector }),
        createTracker({ collector }),
        createTracker({ collector }),
      ];

      // Track concurrently
      const promises = trackers.flatMap(tracker =>
        Array(100).fill(null).map(() =>
          Promise.resolve(tracker.startInvocation(TOOL_NAMES.DEBUG).complete(true))
        )
      );

      await Promise.all(promises);
      await collector.shutdown();

      // All events should be captured
      const result = await storageAdapter.readEvents();
      expect(result.events).toHaveLength(300);
    } finally {
      removeTempDir(tempDir);
    }
  });
});
