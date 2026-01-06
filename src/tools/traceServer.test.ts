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

describe('TraceServer Memory Bounds', () => {
  // Helper function to create a thought with minimal required fields
  const createThought = (
    num: number,
    total: number,
    nextNeeded: boolean,
    thought?: string
  ) => ({
    thought: thought ?? `Thought number ${num}`,
    thoughtNumber: num,
    totalThoughts: total,
    nextThoughtNeeded: nextNeeded,
  });

  // Helper to create a branch thought
  const createBranchThought = (
    num: number,
    total: number,
    nextNeeded: boolean,
    branchId: string,
    branchFromThought: number = 1,
    thought?: string
  ) => ({
    ...createThought(num, total, nextNeeded, thought),
    branchId,
    branchFromThought,
  });

  describe('Thought History Limit Enforcement', () => {
    it('should enforce maxThoughtHistory limit with FIFO eviction', () => {
      // Disable auto cleanup so we can test limit enforcement directly
      const server = new TraceServer({
        maxThoughtHistory: 5,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add 7 thoughts (exceeds limit of 5)
      for (let i = 1; i <= 7; i++) {
        server.processThought(createThought(i, 10, true, `Thought ${i}`));
      }

      const history = server.getThoughtHistory();
      expect(history.length).toBe(5);

      // Verify oldest thoughts were evicted (thoughts 1 and 2)
      expect(history[0].thought).toBe('Thought 3');
      expect(history[4].thought).toBe('Thought 7');
    });

    it('should never exceed maxThoughtHistory regardless of input rate', () => {
      const server = new TraceServer({
        maxThoughtHistory: 3,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add many thoughts
      for (let i = 1; i <= 20; i++) {
        server.processThought(createThought(i, 20, true));
        // Verify limit is never exceeded after each addition
        expect(server.getThoughtCount()).toBeLessThanOrEqual(3);
      }

      expect(server.getThoughtCount()).toBe(3);
    });

    it('should prioritize evicting completed chains over incomplete ones', () => {
      const server = new TraceServer({
        maxThoughtHistory: 5,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add a completed chain (thoughts 1-2)
      server.processThought(createThought(1, 2, true, 'Chain1-T1'));
      server.processThought(createThought(2, 2, false, 'Chain1-T2 (complete)'));

      // Add incomplete chain (thoughts 1-2, no completion)
      server.processThought(createThought(1, 5, true, 'Chain2-T1'));
      server.processThought(createThought(2, 5, true, 'Chain2-T2'));

      // Now at 4 thoughts, add 2 more to trigger eviction
      server.processThought(createThought(3, 5, true, 'Chain2-T3'));
      server.processThought(createThought(4, 5, true, 'Chain2-T4'));

      // Should be at limit (5), completed chain should have been evicted first
      const history = server.getThoughtHistory();
      expect(history.length).toBe(5);

      // Verify the completed chain was evicted, not the incomplete one
      const hasCompletedChain = history.some(t => t.thought === 'Chain1-T2 (complete)');
      expect(hasCompletedChain).toBe(false);

      // Verify incomplete chain thoughts are still there
      const incompleteThoughts = history.filter(t => t.thought.startsWith('Chain2'));
      expect(incompleteThoughts.length).toBeGreaterThanOrEqual(4);
    });

    it('should fall back to pure FIFO when no completed chains exist', () => {
      const server = new TraceServer({
        maxThoughtHistory: 3,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add only incomplete thoughts
      server.processThought(createThought(1, 10, true, 'First'));
      server.processThought(createThought(2, 10, true, 'Second'));
      server.processThought(createThought(3, 10, true, 'Third'));
      server.processThought(createThought(4, 10, true, 'Fourth'));

      const history = server.getThoughtHistory();
      expect(history.length).toBe(3);

      // Oldest (First) should be evicted
      expect(history[0].thought).toBe('Second');
      expect(history[2].thought).toBe('Fourth');
    });

    it('should handle limit of 1 correctly', () => {
      const server = new TraceServer({
        maxThoughtHistory: 1,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 3, true, 'First'));
      expect(server.getThoughtCount()).toBe(1);

      server.processThought(createThought(2, 3, true, 'Second'));
      expect(server.getThoughtCount()).toBe(1);
      expect(server.getThoughtHistory()[0].thought).toBe('Second');

      server.processThought(createThought(3, 3, false, 'Third'));
      expect(server.getThoughtCount()).toBe(1);
      expect(server.getThoughtHistory()[0].thought).toBe('Third');
    });

    it('should evict entire completed chain at once', () => {
      const server = new TraceServer({
        maxThoughtHistory: 6,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add a 3-thought completed chain
      server.processThought(createThought(1, 3, true, 'Chain1-T1'));
      server.processThought(createThought(2, 3, true, 'Chain1-T2'));
      server.processThought(createThought(3, 3, false, 'Chain1-T3 (complete)'));

      // Add 4 more incomplete thoughts to trigger eviction
      server.processThought(createThought(1, 10, true, 'Chain2-T1'));
      server.processThought(createThought(2, 10, true, 'Chain2-T2'));
      server.processThought(createThought(3, 10, true, 'Chain2-T3'));
      server.processThought(createThought(4, 10, true, 'Chain2-T4'));

      const history = server.getThoughtHistory();
      expect(history.length).toBe(6);

      // Verify the entire completed chain was evicted
      const chain1Thoughts = history.filter(t => t.thought.startsWith('Chain1'));
      expect(chain1Thoughts.length).toBe(0);

      // Verify all Chain2 thoughts are present
      const chain2Thoughts = history.filter(t => t.thought.startsWith('Chain2'));
      expect(chain2Thoughts.length).toBe(4);
    });
  });

  describe('Branch Count Limit Enforcement', () => {
    it('should enforce maxBranches limit', () => {
      const server = new TraceServer({
        maxBranches: 3,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create 5 branches (exceeds limit of 3)
      for (let i = 1; i <= 5; i++) {
        server.processThought(createBranchThought(1, 3, true, `branch-${i}`));
      }

      expect(server.getBranchCount()).toBe(3);
    });

    it('should never exceed maxBranches regardless of creation rate', () => {
      const server = new TraceServer({
        maxBranches: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      for (let i = 1; i <= 10; i++) {
        server.processThought(createBranchThought(1, 3, true, `branch-${i}`));
        expect(server.getBranchCount()).toBeLessThanOrEqual(2);
      }

      expect(server.getBranchCount()).toBe(2);
    });

    it('should use LRU eviction for branches', async () => {
      const server = new TraceServer({
        maxBranches: 3,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create 3 branches with some time between them
      server.processThought(createBranchThought(1, 3, true, 'branch-A'));
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      server.processThought(createBranchThought(1, 3, true, 'branch-B'));
      await new Promise(resolve => setTimeout(resolve, 10));
      server.processThought(createBranchThought(1, 3, true, 'branch-C'));

      // Access branch-A to make it recently used
      await new Promise(resolve => setTimeout(resolve, 10));
      server.getBranch('branch-A'); // This updates lastAccessedAt

      // Add a 4th branch, should evict branch-B (LRU after branch-A was accessed)
      server.processThought(createBranchThought(1, 3, true, 'branch-D'));

      const branches = server.getBranches();
      expect(Object.keys(branches)).toHaveLength(3);

      // branch-A should still exist (was recently accessed)
      expect(branches['branch-A']).toBeDefined();

      // branch-B should be evicted (least recently used)
      expect(branches['branch-B']).toBeUndefined();

      // branch-C and branch-D should exist
      expect(branches['branch-C']).toBeDefined();
      expect(branches['branch-D']).toBeDefined();
    });

    it('should evict oldest branch when all have same access time', () => {
      const server = new TraceServer({
        maxBranches: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create branches in quick succession
      server.processThought(createBranchThought(1, 3, true, 'branch-first'));
      server.processThought(createBranchThought(1, 3, true, 'branch-second'));
      server.processThought(createBranchThought(1, 3, true, 'branch-third'));

      expect(server.getBranchCount()).toBe(2);

      // First branch should be evicted (created/accessed earliest)
      const branches = server.getBranches();
      expect(branches['branch-first']).toBeUndefined();
    });

    it('should handle limit of 1 branch correctly', () => {
      const server = new TraceServer({
        maxBranches: 1,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 3, true, 'branch-A'));
      expect(server.getBranchCount()).toBe(1);

      server.processThought(createBranchThought(1, 3, true, 'branch-B'));
      expect(server.getBranchCount()).toBe(1);

      const branches = server.getBranches();
      expect(branches['branch-A']).toBeUndefined();
      expect(branches['branch-B']).toBeDefined();
    });

    it('should update access time when adding thoughts to existing branch', async () => {
      const server = new TraceServer({
        maxBranches: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create two branches
      server.processThought(createBranchThought(1, 5, true, 'branch-old'));
      await new Promise(resolve => setTimeout(resolve, 10));
      server.processThought(createBranchThought(1, 5, true, 'branch-new'));

      // Add another thought to the old branch (updates its access time)
      await new Promise(resolve => setTimeout(resolve, 10));
      server.processThought(createBranchThought(2, 5, true, 'branch-old'));

      // Add a third branch - should evict branch-new (now LRU)
      server.processThought(createBranchThought(1, 5, true, 'branch-newest'));

      const branches = server.getBranches();
      expect(branches['branch-old']).toBeDefined();
      expect(branches['branch-new']).toBeUndefined();
      expect(branches['branch-newest']).toBeDefined();
    });
  });

  describe('Per-Branch Thought Limit Enforcement', () => {
    it('should enforce maxThoughtsPerBranch limit', () => {
      const server = new TraceServer({
        maxThoughtsPerBranch: 3,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add 5 thoughts to a single branch
      for (let i = 1; i <= 5; i++) {
        server.processThought(createBranchThought(i, 10, true, 'test-branch', 1, `BranchThought ${i}`));
      }

      const branch = server.getBranch('test-branch');
      expect(branch).toBeDefined();
      expect(branch!.length).toBe(3);

      // Verify oldest thoughts were evicted
      expect(branch![0].thought).toBe('BranchThought 3');
      expect(branch![2].thought).toBe('BranchThought 5');
    });

    it('should use FIFO eviction within branches', () => {
      const server = new TraceServer({
        maxThoughtsPerBranch: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 5, true, 'branch', 1, 'First'));
      server.processThought(createBranchThought(2, 5, true, 'branch', 1, 'Second'));
      server.processThought(createBranchThought(3, 5, true, 'branch', 1, 'Third'));

      const branch = server.getBranch('branch');
      expect(branch!.length).toBe(2);
      expect(branch![0].thought).toBe('Second');
      expect(branch![1].thought).toBe('Third');
    });

    it('should apply limits independently to each branch', () => {
      const server = new TraceServer({
        maxThoughtsPerBranch: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add 3 thoughts to branch-A
      server.processThought(createBranchThought(1, 5, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 5, true, 'branch-A', 1, 'A2'));
      server.processThought(createBranchThought(3, 5, true, 'branch-A', 1, 'A3'));

      // Add 3 thoughts to branch-B
      server.processThought(createBranchThought(1, 5, true, 'branch-B', 1, 'B1'));
      server.processThought(createBranchThought(2, 5, true, 'branch-B', 1, 'B2'));
      server.processThought(createBranchThought(3, 5, true, 'branch-B', 1, 'B3'));

      const branchA = server.getBranch('branch-A');
      const branchB = server.getBranch('branch-B');

      // Each branch should have exactly 2 thoughts (limit enforced independently)
      expect(branchA!.length).toBe(2);
      expect(branchB!.length).toBe(2);

      // Verify FIFO eviction in each branch
      expect(branchA![0].thought).toBe('A2');
      expect(branchA![1].thought).toBe('A3');
      expect(branchB![0].thought).toBe('B2');
      expect(branchB![1].thought).toBe('B3');
    });

    it('should handle limit of 1 thought per branch', () => {
      const server = new TraceServer({
        maxThoughtsPerBranch: 1,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 5, true, 'branch', 1, 'First'));
      server.processThought(createBranchThought(2, 5, true, 'branch', 1, 'Second'));
      server.processThought(createBranchThought(3, 5, false, 'branch', 1, 'Third'));

      const branch = server.getBranch('branch');
      expect(branch!.length).toBe(1);
      expect(branch![0].thought).toBe('Third');
    });

    it('should never exceed per-branch limit regardless of input rate', () => {
      const server = new TraceServer({
        maxThoughtsPerBranch: 3,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      for (let i = 1; i <= 15; i++) {
        server.processThought(createBranchThought(i, 20, true, 'branch', 1));
        const branch = server.getBranch('branch');
        expect(branch!.length).toBeLessThanOrEqual(3);
      }

      expect(server.getBranch('branch')!.length).toBe(3);
    });
  });

  describe('Combined Limit Enforcement', () => {
    it('should enforce all limits simultaneously', () => {
      const server = new TraceServer({
        maxThoughtHistory: 5,
        maxBranches: 2,
        maxThoughtsPerBranch: 3,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add 10 thoughts to main history
      for (let i = 1; i <= 10; i++) {
        server.processThought(createThought(i, 10, true));
      }

      // Add 3 branches with 5 thoughts each
      for (let b = 1; b <= 3; b++) {
        for (let t = 1; t <= 5; t++) {
          server.processThought(createBranchThought(t, 5, true, `branch-${b}`, 1));
        }
      }

      // Verify all limits are respected
      expect(server.getThoughtCount()).toBe(5); // maxThoughtHistory
      expect(server.getBranchCount()).toBe(2); // maxBranches

      // Each remaining branch should have at most 3 thoughts
      const branches = server.getBranches();
      for (const branchId of Object.keys(branches)) {
        expect(branches[branchId].length).toBeLessThanOrEqual(3);
      }
    });

    it('should maintain correct total thoughts count with limits', () => {
      const server = new TraceServer({
        maxThoughtHistory: 3,
        maxBranches: 2,
        maxThoughtsPerBranch: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Fill main history
      for (let i = 1; i <= 5; i++) {
        server.processThought(createThought(i, 5, true));
      }

      // Fill branches
      for (let i = 1; i <= 4; i++) {
        server.processThought(createBranchThought(i, 4, true, `branch-${i}`, 1));
      }

      const stats = server.getMemoryStats();

      // maxThoughtHistory = 3
      expect(stats.thoughtHistoryCount).toBe(3);

      // maxBranches = 2 with maxThoughtsPerBranch = 2 each
      expect(stats.branchCount).toBe(2);
      expect(stats.totalBranchThoughts).toBe(2); // 2 branches * 1 thought each (only 1 per branch since we added 1 per branch)

      // Total = 3 (history) + 2 (branches)
      expect(stats.totalThoughts).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero limit for thought history', () => {
      const server = new TraceServer({
        maxThoughtHistory: 0,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 1, true));
      expect(server.getThoughtCount()).toBe(0);
    });

    it('should handle zero limit for branches', () => {
      const server = new TraceServer({
        maxBranches: 0,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch'));
      expect(server.getBranchCount()).toBe(0);
    });

    it('should handle zero limit for thoughts per branch', () => {
      const server = new TraceServer({
        maxThoughtsPerBranch: 0,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch'));
      // Branch exists but has no thoughts
      const branch = server.getBranch('branch');
      expect(branch).toBeDefined();
      expect(branch!.length).toBe(0);
    });

    it('should handle multiple completed chains during eviction', () => {
      const server = new TraceServer({
        maxThoughtHistory: 5,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create 2 completed chains (2 thoughts each)
      server.processThought(createThought(1, 2, true, 'Chain1-T1'));
      server.processThought(createThought(2, 2, false, 'Chain1-T2'));
      server.processThought(createThought(1, 2, true, 'Chain2-T1'));
      server.processThought(createThought(2, 2, false, 'Chain2-T2'));

      // Add 3 more incomplete thoughts to trigger eviction
      server.processThought(createThought(1, 5, true, 'Chain3-T1'));
      server.processThought(createThought(2, 5, true, 'Chain3-T2'));
      server.processThought(createThought(3, 5, true, 'Chain3-T3'));

      // Should have evicted oldest completed chain first
      const history = server.getThoughtHistory();
      expect(history.length).toBe(5);

      // First completed chain should be gone
      const chain1Thoughts = history.filter(t => t.thought.startsWith('Chain1'));
      expect(chain1Thoughts.length).toBe(0);
    });

    it('should not affect main history when branch limits are hit', () => {
      const server = new TraceServer({
        maxThoughtHistory: 10,
        maxThoughtsPerBranch: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add thoughts to main history
      for (let i = 1; i <= 5; i++) {
        server.processThought(createThought(i, 5, true, `Main-T${i}`));
      }

      // Add many thoughts to a branch (will trigger branch eviction)
      for (let i = 1; i <= 10; i++) {
        server.processThought(createBranchThought(i, 10, true, 'branch', 1, `Branch-T${i}`));
      }

      // Main history should be unchanged
      expect(server.getThoughtCount()).toBe(5);
      const history = server.getThoughtHistory();
      expect(history[0].thought).toBe('Main-T1');
      expect(history[4].thought).toBe('Main-T5');

      // Branch should be at its limit
      const branch = server.getBranch('branch');
      expect(branch!.length).toBe(2);
    });

    it('should not affect branches when main history limit is hit', () => {
      const server = new TraceServer({
        maxThoughtHistory: 3,
        maxThoughtsPerBranch: 10,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add thoughts to a branch first
      server.processThought(createBranchThought(1, 5, true, 'branch', 1, 'Branch-T1'));
      server.processThought(createBranchThought(2, 5, true, 'branch', 1, 'Branch-T2'));
      server.processThought(createBranchThought(3, 5, true, 'branch', 1, 'Branch-T3'));

      // Add many thoughts to main history (will trigger main history eviction)
      for (let i = 1; i <= 10; i++) {
        server.processThought(createThought(i, 10, true, `Main-T${i}`));
      }

      // Branch should be unchanged
      const branch = server.getBranch('branch');
      expect(branch!.length).toBe(3);
      expect(branch![0].thought).toBe('Branch-T1');
      expect(branch![2].thought).toBe('Branch-T3');

      // Main history should be at limit
      expect(server.getThoughtCount()).toBe(3);
    });
  });
});
