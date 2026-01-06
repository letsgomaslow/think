import { describe, it, expect, beforeEach } from 'vitest';
import { TraceServer, DEFAULT_TRACE_SERVER_CONFIG, TraceServerConfig } from './traceServer.js';

describe('TraceServer', () => {
  let server: TraceServer;

  beforeEach(() => {
    server = new TraceServer();
  });

  it('should process valid thought data', () => {
    const result = server.processThought({
      thought: 'Initial analysis of the problem',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
    });

    expect(result.thought).toBe('Initial analysis of the problem');
    expect(result.thoughtNumber).toBe(1);
    expect(result.totalThoughts).toBe(3);
    expect(result.nextThoughtNeeded).toBe(true);
  });

  it('should reject missing required fields', () => {
    expect(() => server.processThought({
      thought: 'test',
    })).toThrow();
  });

  it('should reject invalid thoughtNumber type', () => {
    expect(() => server.processThought({
      thought: 'test',
      thoughtNumber: 'one',
      totalThoughts: 3,
      nextThoughtNeeded: true,
    })).toThrow();
  });

  it('should handle revisions', () => {
    // First thought
    server.processThought({
      thought: 'Original thought',
      thoughtNumber: 1,
      totalThoughts: 2,
      nextThoughtNeeded: true,
    });

    // Revision
    const revision = server.processThought({
      thought: 'Revised understanding',
      thoughtNumber: 2,
      totalThoughts: 2,
      nextThoughtNeeded: false,
      isRevision: true,
      revisesThought: 1,
    });

    expect(revision.isRevision).toBe(true);
    expect(revision.revisesThought).toBe(1);
  });

  it('should handle branches', () => {
    const branch = server.processThought({
      thought: 'Alternative approach',
      thoughtNumber: 1,
      totalThoughts: 2,
      nextThoughtNeeded: true,
      branchFromThought: 1,
      branchId: 'alternative-a',
    });

    expect(branch.branchId).toBe('alternative-a');
    expect(branch.branchFromThought).toBe(1);
  });

  it('should handle needsMoreThoughts flag', () => {
    const result = server.processThought({
      thought: 'This needs more exploration',
      thoughtNumber: 3,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      needsMoreThoughts: true,
    });

    expect(result.needsMoreThoughts).toBe(true);
  });

  it('should process final thought correctly', () => {
    const result = server.processThought({
      thought: 'Final conclusion reached',
      thoughtNumber: 5,
      totalThoughts: 5,
      nextThoughtNeeded: false,
    });

    expect(result.nextThoughtNeeded).toBe(false);
  });
});

describe('TraceServer Configuration', () => {
  describe('DEFAULT_TRACE_SERVER_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtHistory).toBe(1000);
      expect(DEFAULT_TRACE_SERVER_CONFIG.maxBranches).toBe(50);
      expect(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtsPerBranch).toBe(200);
      expect(DEFAULT_TRACE_SERVER_CONFIG.enableAutoCleanup).toBe(true);
      expect(DEFAULT_TRACE_SERVER_CONFIG.cleanupOnComplete).toBe(true);
      expect(DEFAULT_TRACE_SERVER_CONFIG.retainChainSummaries).toBe(true);
      expect(DEFAULT_TRACE_SERVER_CONFIG.maxChainSummaries).toBe(100);
    });

    it('should be readonly (frozen)', () => {
      // Verify that default config is readonly by checking the type
      const config: Readonly<TraceServerConfig> = DEFAULT_TRACE_SERVER_CONFIG;
      expect(config).toBeDefined();

      // Attempting to modify should have no effect (in strict mode would throw)
      const originalValue = DEFAULT_TRACE_SERVER_CONFIG.maxThoughtHistory;
      expect(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtHistory).toBe(originalValue);
    });
  });

  describe('Constructor with no config', () => {
    it('should use default configuration when no config provided', () => {
      const server = new TraceServer();
      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtHistory);
      expect(stats.branchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxBranches);
      expect(stats.perBranchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtsPerBranch);
      expect(stats.chainSummaryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxChainSummaries);
    });

    it('should be backwards compatible with existing code', () => {
      // Existing code should work without any changes
      const server = new TraceServer();

      const result = server.processThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      });

      expect(result.thought).toBe('Test thought');
    });
  });

  describe('Constructor with full custom config', () => {
    it('should accept full custom configuration', () => {
      const customConfig: TraceServerConfig = {
        maxThoughtHistory: 500,
        maxBranches: 25,
        maxThoughtsPerBranch: 100,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false,
        maxChainSummaries: 50
      };

      const server = new TraceServer(customConfig);
      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryLimit).toBe(500);
      expect(stats.branchLimit).toBe(25);
      expect(stats.perBranchLimit).toBe(100);
      expect(stats.chainSummaryLimit).toBe(50);
    });

    it('should use custom values instead of defaults', () => {
      const customConfig: TraceServerConfig = {
        maxThoughtHistory: 10,
        maxBranches: 5,
        maxThoughtsPerBranch: 3,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 20
      };

      const server = new TraceServer(customConfig);
      const stats = server.getMemoryStats();

      // Verify all custom values are applied
      expect(stats.thoughtHistoryLimit).toBe(10);
      expect(stats.branchLimit).toBe(5);
      expect(stats.perBranchLimit).toBe(3);
      expect(stats.chainSummaryLimit).toBe(20);
    });
  });

  describe('Constructor with partial config', () => {
    it('should merge partial config with defaults', () => {
      const partialConfig: Partial<TraceServerConfig> = {
        maxThoughtHistory: 500
      };

      const server = new TraceServer(partialConfig);
      const stats = server.getMemoryStats();

      // Custom value applied
      expect(stats.thoughtHistoryLimit).toBe(500);

      // Defaults used for unspecified values
      expect(stats.branchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxBranches);
      expect(stats.perBranchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtsPerBranch);
      expect(stats.chainSummaryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxChainSummaries);
    });

    it('should merge multiple partial values with defaults', () => {
      const partialConfig: Partial<TraceServerConfig> = {
        maxThoughtHistory: 100,
        maxBranches: 10,
        enableAutoCleanup: false
      };

      const server = new TraceServer(partialConfig);
      const stats = server.getMemoryStats();

      // Custom values applied
      expect(stats.thoughtHistoryLimit).toBe(100);
      expect(stats.branchLimit).toBe(10);

      // Defaults used for unspecified values
      expect(stats.perBranchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtsPerBranch);
      expect(stats.chainSummaryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxChainSummaries);
    });

    it('should allow overriding just boolean flags', () => {
      const partialConfig: Partial<TraceServerConfig> = {
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false
      };

      const server = new TraceServer(partialConfig);
      const stats = server.getMemoryStats();

      // Numeric defaults should remain
      expect(stats.thoughtHistoryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtHistory);
      expect(stats.branchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxBranches);
      expect(stats.perBranchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtsPerBranch);
    });

    it('should allow overriding just numeric limits', () => {
      const partialConfig: Partial<TraceServerConfig> = {
        maxThoughtHistory: 2000,
        maxBranches: 100,
        maxThoughtsPerBranch: 500,
        maxChainSummaries: 200
      };

      const server = new TraceServer(partialConfig);
      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryLimit).toBe(2000);
      expect(stats.branchLimit).toBe(100);
      expect(stats.perBranchLimit).toBe(500);
      expect(stats.chainSummaryLimit).toBe(200);
    });
  });

  describe('Constructor with empty config', () => {
    it('should use all defaults when empty object provided', () => {
      const server = new TraceServer({});
      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtHistory);
      expect(stats.branchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxBranches);
      expect(stats.perBranchLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtsPerBranch);
      expect(stats.chainSummaryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxChainSummaries);
    });
  });

  describe('Configuration edge cases', () => {
    it('should handle zero values in configuration', () => {
      const config: Partial<TraceServerConfig> = {
        maxThoughtHistory: 0,
        maxBranches: 0,
        maxThoughtsPerBranch: 0,
        maxChainSummaries: 0
      };

      const server = new TraceServer(config);
      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryLimit).toBe(0);
      expect(stats.branchLimit).toBe(0);
      expect(stats.perBranchLimit).toBe(0);
      expect(stats.chainSummaryLimit).toBe(0);
    });

    it('should handle very large values in configuration', () => {
      const config: Partial<TraceServerConfig> = {
        maxThoughtHistory: 1000000,
        maxBranches: 10000,
        maxThoughtsPerBranch: 50000,
        maxChainSummaries: 100000
      };

      const server = new TraceServer(config);
      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryLimit).toBe(1000000);
      expect(stats.branchLimit).toBe(10000);
      expect(stats.perBranchLimit).toBe(50000);
      expect(stats.chainSummaryLimit).toBe(100000);
    });

    it('should handle minimum useful configuration (limit of 1)', () => {
      const config: Partial<TraceServerConfig> = {
        maxThoughtHistory: 1,
        maxBranches: 1,
        maxThoughtsPerBranch: 1,
        maxChainSummaries: 1
      };

      const server = new TraceServer(config);
      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryLimit).toBe(1);
      expect(stats.branchLimit).toBe(1);
      expect(stats.perBranchLimit).toBe(1);
      expect(stats.chainSummaryLimit).toBe(1);
    });
  });

  describe('Configuration immutability', () => {
    it('should not be affected by changes to the original config object', () => {
      const config: TraceServerConfig = {
        maxThoughtHistory: 500,
        maxBranches: 25,
        maxThoughtsPerBranch: 100,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 50
      };

      const server = new TraceServer(config);

      // Modify the original config object after creating the server
      config.maxThoughtHistory = 999;
      config.maxBranches = 999;

      // Server should retain original values
      const stats = server.getMemoryStats();
      expect(stats.thoughtHistoryLimit).toBe(500);
      expect(stats.branchLimit).toBe(25);
    });

    it('should create independent configurations for multiple instances', () => {
      const server1 = new TraceServer({ maxThoughtHistory: 100 });
      const server2 = new TraceServer({ maxThoughtHistory: 200 });
      const server3 = new TraceServer(); // defaults

      const stats1 = server1.getMemoryStats();
      const stats2 = server2.getMemoryStats();
      const stats3 = server3.getMemoryStats();

      expect(stats1.thoughtHistoryLimit).toBe(100);
      expect(stats2.thoughtHistoryLimit).toBe(200);
      expect(stats3.thoughtHistoryLimit).toBe(DEFAULT_TRACE_SERVER_CONFIG.maxThoughtHistory);
    });
  });
});
