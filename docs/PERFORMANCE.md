# Analytics Performance Characteristics

This document describes the performance characteristics of the think-mcp analytics module.

## Design Goals

The analytics module is designed with the following performance goals:

1. **Zero overhead when disabled** - No performance impact when analytics are turned off
2. **<1ms overhead when enabled** - Minimal impact on tool invocation latency
3. **No blocking I/O in hot path** - Tracking operations never block tool execution
4. **Bounded memory usage** - Memory consumption is limited and predictable
5. **Efficient batching** - I/O operations are batched to reduce overhead

## Performance Metrics

### When Analytics Are Disabled

- **Overhead per call**: <0.01ms (near-zero)
- **Memory usage**: 0 bytes for events
- **I/O operations**: None

When analytics are disabled, the tracking code takes an immediate "fast path" that:
- Returns a no-op invocation object with no closures over tracker state
- Does not create or store any event data
- Does not maintain any statistics

### When Analytics Are Enabled

- **Overhead per call**: <1ms (typically <0.1ms)
- **Memory usage**: ~200 bytes per pending event (bounded by batch size)
- **I/O operations**: Async writes on batch flush only

The overhead breakdown:
- `startInvocation()`: <0.05ms (creates invocation object, captures timestamp)
- `complete()`: <0.05ms (calculates duration, queues event)
- Event creation: <0.01ms (minimal object allocation)

## How Performance Is Achieved

### 1. Zero-Overhead Fast Path When Disabled

```typescript
// In tracker.ts - startInvocation()
if (!this.isEnabled()) {
  return this.createNoOpInvocation(toolName, startTimestamp, startTime);
}
```

When disabled, the tracker immediately returns a lightweight no-op object that has no closures over tracker state and performs no work when `complete()` is called.

### 2. Fire-and-Forget Tracking

```typescript
// In collector.ts - trackSync()
trackSync(options: TrackOptions): void {
  this.track(options).catch(() => {
    // Silently ignore errors - tracking should never affect main app
  });
}
```

The synchronous tracking method queues the event without waiting for any I/O, ensuring tool execution is never blocked.

### 3. In-Memory Batching

Events are collected in an in-memory array and only flushed to disk when:
- The batch size is reached (default: 100 events)
- The flush interval expires (default: 30 seconds)
- The collector is shut down

This reduces the number of I/O operations by orders of magnitude.

### 4. Async File Operations

All file I/O is performed asynchronously:
- Events are written using atomic file operations (write to temp, rename)
- File locks use non-blocking retry with timeout
- The flush timer uses `.unref()` to not block Node.js exit

### 5. Efficient Data Structures

- Events use minimal fields (no content/arguments captured)
- Session IDs are short (16 characters)
- Timestamps use ISO format for easy parsing

## Configuration Tuning

Performance can be tuned via configuration:

| Setting | Default | Description |
|---------|---------|-------------|
| `batchSize` | 100 | Events per batch before flush |
| `flushIntervalMs` | 30000 | Max time between flushes |

### High-Volume Scenarios

For applications with very high tool invocation rates:

```json
{
  "batchSize": 500,
  "flushIntervalMs": 60000
}
```

### Low-Latency Scenarios

For applications where data loss on crash is unacceptable:

```json
{
  "batchSize": 10,
  "flushIntervalMs": 5000
}
```

## Benchmarks

Typical benchmark results (may vary by hardware):

| Scenario | Calls/Second | Overhead/Call |
|----------|--------------|---------------|
| Disabled analytics | >1,000,000 | <0.001ms |
| Enabled, sync tracking | >50,000 | <0.02ms |
| Enabled, async tracking | >10,000 | <0.1ms |
| Burst traffic (1000 events) | - | <50ms total |

## Memory Bounds

Memory usage is bounded by:

- **Pending events**: `batchSize * ~200 bytes`
- **Active invocations**: `concurrent_calls * ~100 bytes`
- **Configuration cache**: ~1KB

With default settings, maximum memory for analytics is approximately:
- Pending events: 100 * 200 = 20KB
- Active invocations: typically <10 = 1KB
- **Total**: <25KB

## Best Practices

1. **Use `withAnalyticsSync` for sync handlers** - Avoids promise overhead
2. **Don't await `trackSync()`** - It's designed to be fire-and-forget
3. **Keep analytics enabled in production** - The overhead is negligible
4. **Monitor flush errors** - Check `collector.getStats().totalFlushErrors`

## Testing Performance

The analytics module includes comprehensive performance tests in `src/analytics/performance.test.ts` that verify:

- Overhead is <1ms per call when enabled
- Overhead is <0.01ms per call when disabled
- No synchronous file I/O during tracking
- Memory usage is bounded by batch size
- Batching reduces I/O operations effectively
- Sustained load handling (>10,000 calls/second)

To run performance tests:

```bash
npm test -- src/analytics/performance.test.ts
```

## Troubleshooting

### High Memory Usage

If memory usage seems high:
1. Check `collector.getStats().pendingEvents` - should be <= batchSize
2. Verify flush is working - check `totalEventsFlushed` is increasing
3. Reduce `batchSize` if needed

### Slow Tool Execution

If tools are running slowly with analytics enabled:
1. Verify you're using `withAnalyticsSync` for sync handlers
2. Check for flush errors that might cause retries
3. Ensure storage path is on fast storage (not network mount)

### Events Not Being Recorded

If events are missing:
1. Ensure analytics are enabled: `isAnalyticsEnabled()`
2. Call `shutdownCollector()` before process exit
3. Check for flush errors in stats
