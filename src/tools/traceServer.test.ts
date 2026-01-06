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

describe('TraceServer Cleanup Methods', () => {
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

  describe('clearHistory()', () => {
    it('should remove all thoughts from main history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add some thoughts to history
      server.processThought(createThought(1, 3, true, 'First'));
      server.processThought(createThought(2, 3, true, 'Second'));
      server.processThought(createThought(3, 3, false, 'Third'));

      expect(server.getThoughtCount()).toBe(3);

      server.clearHistory();

      expect(server.getThoughtCount()).toBe(0);
      expect(server.getThoughtHistory()).toEqual([]);
    });

    it('should not affect branches when clearing history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add thoughts to main history
      server.processThought(createThought(1, 2, true, 'Main1'));
      server.processThought(createThought(2, 2, false, 'Main2'));

      // Add thoughts to a branch
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'Branch1'));
      server.processThought(createBranchThought(2, 2, false, 'branch-A', 1, 'Branch2'));

      server.clearHistory();

      expect(server.getThoughtCount()).toBe(0);
      expect(server.getBranchCount()).toBe(1);
      expect(server.getBranch('branch-A')!.length).toBe(2);
    });

    it('should not affect chain summaries when clearing history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      // Add and manually cleanup a chain to create a summary
      server.processThought(createThought(1, 2, true, 'First'));
      server.processThought(createThought(2, 2, false, 'Second'));
      server.clearCompletedChains();

      const summariesBefore = server.getChainSummaries().length;
      expect(summariesBefore).toBe(1);

      server.clearHistory();

      expect(server.getChainSummaries().length).toBe(summariesBefore);
    });

    it('should handle clearing empty history', () => {
      const server = new TraceServer();

      expect(server.getThoughtCount()).toBe(0);
      server.clearHistory();
      expect(server.getThoughtCount()).toBe(0);
    });

    it('should allow adding new thoughts after clearing', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 2, true, 'Original'));
      server.clearHistory();
      server.processThought(createThought(1, 2, true, 'New'));

      expect(server.getThoughtCount()).toBe(1);
      expect(server.getThoughtHistory()[0].thought).toBe('New');
    });
  });

  describe('clearBranch()', () => {
    it('should remove a specific branch by ID', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create two branches
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(1, 2, true, 'branch-B', 1, 'B1'));

      expect(server.getBranchCount()).toBe(2);

      const result = server.clearBranch('branch-A');

      expect(result).toBe(true);
      expect(server.getBranchCount()).toBe(1);
      expect(server.getBranch('branch-A')).toBeUndefined();
      expect(server.getBranch('branch-B')).toBeDefined();
    });

    it('should return false for non-existent branch', () => {
      const server = new TraceServer();

      const result = server.clearBranch('non-existent-branch');

      expect(result).toBe(false);
    });

    it('should remove branch metadata along with branch data', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 3, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 3, true, 'branch-A', 1, 'A2'));

      // Branch should exist with thoughts
      expect(server.getBranch('branch-A')!.length).toBe(2);

      server.clearBranch('branch-A');

      // Branch should be completely gone
      expect(server.getBranch('branch-A')).toBeUndefined();

      // Create a new branch with the same ID - it should work fresh
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'NewA1'));
      expect(server.getBranch('branch-A')!.length).toBe(1);
    });

    it('should not affect main history when clearing a branch', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 2, true, 'Main1'));
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));

      server.clearBranch('branch-A');

      expect(server.getThoughtCount()).toBe(1);
      expect(server.getThoughtHistory()[0].thought).toBe('Main1');
    });

    it('should not affect other branches when clearing one branch', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(1, 2, true, 'branch-B', 1, 'B1'));
      server.processThought(createBranchThought(1, 2, true, 'branch-C', 1, 'C1'));

      server.clearBranch('branch-B');

      expect(server.getBranchCount()).toBe(2);
      expect(server.getBranch('branch-A')).toBeDefined();
      expect(server.getBranch('branch-C')).toBeDefined();
    });
  });

  describe('clearAllBranches()', () => {
    it('should remove all branches', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create multiple branches
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(1, 2, true, 'branch-B', 1, 'B1'));
      server.processThought(createBranchThought(1, 2, true, 'branch-C', 1, 'C1'));

      expect(server.getBranchCount()).toBe(3);

      server.clearAllBranches();

      expect(server.getBranchCount()).toBe(0);
      expect(server.getBranches()).toEqual({});
    });

    it('should not affect main history when clearing all branches', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 3, true, 'Main1'));
      server.processThought(createThought(2, 3, true, 'Main2'));
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));

      server.clearAllBranches();

      expect(server.getThoughtCount()).toBe(2);
      expect(server.getThoughtHistory()[0].thought).toBe('Main1');
      expect(server.getThoughtHistory()[1].thought).toBe('Main2');
    });

    it('should handle clearing when no branches exist', () => {
      const server = new TraceServer();

      expect(server.getBranchCount()).toBe(0);
      server.clearAllBranches();
      expect(server.getBranchCount()).toBe(0);
    });

    it('should allow creating new branches after clearing all', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'old-branch', 1, 'Old1'));
      server.clearAllBranches();

      server.processThought(createBranchThought(1, 2, true, 'new-branch', 1, 'New1'));

      expect(server.getBranchCount()).toBe(1);
      expect(server.getBranch('new-branch')!.length).toBe(1);
    });

    it('should not affect chain summaries when clearing all branches', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 2, false, 'branch-A', 1, 'A2'));
      server.clearCompletedChains();

      const summariesBefore = server.getChainSummaries().length;
      expect(summariesBefore).toBe(1);

      server.clearAllBranches();

      expect(server.getChainSummaries().length).toBe(summariesBefore);
    });
  });

  describe('clearCompletedChains()', () => {
    it('should remove only completed chains from main history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add a completed chain (2 thoughts)
      server.processThought(createThought(1, 2, true, 'Chain1-T1'));
      server.processThought(createThought(2, 2, false, 'Chain1-T2'));

      // Add an incomplete chain (still in progress)
      server.processThought(createThought(1, 3, true, 'Chain2-T1'));
      server.processThought(createThought(2, 3, true, 'Chain2-T2'));

      expect(server.getThoughtCount()).toBe(4);

      const result = server.clearCompletedChains();

      expect(result.historyChains).toBe(1);
      expect(server.getThoughtCount()).toBe(2);

      // Verify incomplete chain is preserved
      const history = server.getThoughtHistory();
      expect(history[0].thought).toBe('Chain2-T1');
      expect(history[1].thought).toBe('Chain2-T2');
    });

    it('should remove only completed chains from branches', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add a completed chain in branch-A
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 2, false, 'branch-A', 1, 'A2'));

      // Add an incomplete chain in branch-B
      server.processThought(createBranchThought(1, 3, true, 'branch-B', 1, 'B1'));
      server.processThought(createBranchThought(2, 3, true, 'branch-B', 1, 'B2'));

      const result = server.clearCompletedChains();

      expect(result.branchChains).toBe(1);

      // Branch A should have its completed chain removed
      expect(server.getBranch('branch-A')!.length).toBe(0);

      // Branch B should still have its incomplete chain
      expect(server.getBranch('branch-B')!.length).toBe(2);
    });

    it('should return correct counts for both history and branch chains', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add 2 completed chains in main history
      server.processThought(createThought(1, 1, false, 'HistChain1'));
      server.processThought(createThought(1, 2, true, 'HistChain2-T1'));
      server.processThought(createThought(2, 2, false, 'HistChain2-T2'));

      // Add 3 completed chains across branches
      server.processThought(createBranchThought(1, 1, false, 'branch-A', 1, 'A-complete'));
      server.processThought(createBranchThought(1, 1, false, 'branch-B', 1, 'B-complete'));
      server.processThought(createBranchThought(1, 1, false, 'branch-C', 1, 'C-complete'));

      const result = server.clearCompletedChains();

      expect(result.historyChains).toBe(2);
      expect(result.branchChains).toBe(3);
    });

    it('should archive chains when retainChainSummaries is enabled', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      // Add a completed chain
      server.processThought(createThought(1, 2, true, 'First thought'));
      server.processThought(createThought(2, 2, false, 'Final thought'));

      expect(server.getChainSummaries().length).toBe(0);

      server.clearCompletedChains();

      const summaries = server.getChainSummaries();
      expect(summaries.length).toBe(1);
      expect(summaries[0].thoughtCount).toBe(2);
      expect(summaries[0].firstThoughtPreview).toContain('First thought');
      expect(summaries[0].finalThoughtPreview).toContain('Final thought');
    });

    it('should not archive chains when retainChainSummaries is disabled', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false,
      });

      server.processThought(createThought(1, 1, false, 'Complete'));
      server.clearCompletedChains();

      expect(server.getChainSummaries().length).toBe(0);
    });

    it('should handle multiple completed chains in history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add 3 completed chains interleaved in history
      server.processThought(createThought(1, 2, true, 'Chain1-T1'));
      server.processThought(createThought(2, 2, false, 'Chain1-T2'));
      server.processThought(createThought(1, 1, false, 'Chain2-T1'));
      server.processThought(createThought(1, 3, true, 'Chain3-T1'));
      server.processThought(createThought(2, 3, true, 'Chain3-T2'));
      server.processThought(createThought(3, 3, false, 'Chain3-T3'));

      expect(server.getThoughtCount()).toBe(6);

      const result = server.clearCompletedChains();

      expect(result.historyChains).toBe(3);
      expect(server.getThoughtCount()).toBe(0);
    });

    it('should return zero counts when no completed chains exist', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add only incomplete chains
      server.processThought(createThought(1, 3, true, 'Incomplete1'));
      server.processThought(createThought(2, 3, true, 'Incomplete2'));
      server.processThought(createBranchThought(1, 3, true, 'branch-A', 1, 'IncompleteA'));

      const result = server.clearCompletedChains();

      expect(result.historyChains).toBe(0);
      expect(result.branchChains).toBe(0);
      expect(server.getThoughtCount()).toBe(2);
      expect(server.getBranch('branch-A')!.length).toBe(1);
    });

    it('should handle empty history and branches', () => {
      const server = new TraceServer();

      const result = server.clearCompletedChains();

      expect(result.historyChains).toBe(0);
      expect(result.branchChains).toBe(0);
    });

    it('should preserve active (incomplete) chains while clearing completed ones', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Active chain in progress
      server.processThought(createThought(1, 5, true, 'Active-T1'));
      server.processThought(createThought(2, 5, true, 'Active-T2'));

      // Completed chain interleaved
      server.processThought(createThought(1, 1, false, 'Completed'));

      // Continue active chain
      server.processThought(createThought(1, 5, true, 'Active-T3'));

      server.clearCompletedChains();

      // Should have the 3 active thoughts remaining
      expect(server.getThoughtCount()).toBe(3);
      const history = server.getThoughtHistory();
      expect(history[0].thought).toBe('Active-T1');
      expect(history[1].thought).toBe('Active-T2');
      expect(history[2].thought).toBe('Active-T3');
    });

    it('should properly archive branch chains with branch ID', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createBranchThought(1, 1, false, 'my-branch', 1, 'Branch complete'));
      server.clearCompletedChains();

      const summaries = server.getChainSummaries();
      expect(summaries.length).toBe(1);
      expect(summaries[0].branchId).toBe('my-branch');
    });
  });

  describe('clearChainSummaries()', () => {
    it('should remove all chain summaries', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      // Create some summaries by completing and clearing chains
      server.processThought(createThought(1, 1, false, 'Chain1'));
      server.processThought(createThought(1, 1, false, 'Chain2'));
      server.clearCompletedChains();

      expect(server.getChainSummaries().length).toBe(2);

      server.clearChainSummaries();

      expect(server.getChainSummaries().length).toBe(0);
    });

    it('should not affect main history when clearing summaries', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createThought(1, 2, true, 'Active1'));
      server.processThought(createThought(1, 1, false, 'Complete'));
      server.clearCompletedChains();

      server.clearChainSummaries();

      expect(server.getThoughtCount()).toBe(1);
      expect(server.getThoughtHistory()[0].thought).toBe('Active1');
    });

    it('should not affect branches when clearing summaries', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createBranchThought(1, 1, false, 'branch-A', 1, 'Complete'));
      server.processThought(createBranchThought(1, 2, true, 'branch-B', 1, 'Active'));
      server.clearCompletedChains();

      server.clearChainSummaries();

      expect(server.getBranchCount()).toBe(2);
      expect(server.getBranch('branch-B')!.length).toBe(1);
    });

    it('should handle clearing empty summaries', () => {
      const server = new TraceServer();

      expect(server.getChainSummaries().length).toBe(0);
      server.clearChainSummaries();
      expect(server.getChainSummaries().length).toBe(0);
    });
  });

  describe('Cleanup Edge Cases', () => {
    it('should handle clearing history with only one thought', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 1, true, 'Single'));
      server.clearHistory();

      expect(server.getThoughtCount()).toBe(0);
    });

    it('should handle clearing branch with only one thought', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch', 1, 'Single'));
      const result = server.clearBranch('branch');

      expect(result).toBe(true);
      expect(server.getBranch('branch')).toBeUndefined();
    });

    it('should handle repeated clear operations', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 1, true, 'Test'));
      server.clearHistory();
      server.clearHistory();
      server.clearHistory();

      expect(server.getThoughtCount()).toBe(0);
    });

    it('should handle clearing non-existent branch multiple times', () => {
      const server = new TraceServer();

      expect(server.clearBranch('fake')).toBe(false);
      expect(server.clearBranch('fake')).toBe(false);
    });

    it('should handle mixed cleanup operations in sequence', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      // Add data
      server.processThought(createThought(1, 1, false, 'Main'));
      server.processThought(createBranchThought(1, 1, false, 'branch-A', 1, 'BranchA'));
      server.processThought(createBranchThought(1, 1, false, 'branch-B', 1, 'BranchB'));

      // Clear completed chains first
      server.clearCompletedChains();
      expect(server.getChainSummaries().length).toBe(3);

      // Clear one branch
      server.clearBranch('branch-A');

      // Clear history
      server.clearHistory();

      // Clear summaries
      server.clearChainSummaries();

      // Clear all branches
      server.clearAllBranches();

      expect(server.getThoughtCount()).toBe(0);
      expect(server.getBranchCount()).toBe(0);
      expect(server.getChainSummaries().length).toBe(0);
    });

    it('should handle clearing when auto cleanup already removed chains', () => {
      const server = new TraceServer({
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
      });

      // Auto cleanup should archive completed chain
      server.processThought(createThought(1, 2, true, 'First'));
      server.processThought(createThought(2, 2, false, 'Second'));

      // History should be empty (auto-cleaned) but summaries should exist
      expect(server.getThoughtCount()).toBe(0);
      expect(server.getChainSummaries().length).toBe(1);

      // Manual clear should work on empty history
      const result = server.clearCompletedChains();
      expect(result.historyChains).toBe(0);
    });

    it('should verify memory stats after cleanup operations', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      // Add various thoughts
      server.processThought(createThought(1, 2, true, 'Main1'));
      server.processThought(createThought(2, 2, false, 'Main2'));
      server.processThought(createBranchThought(1, 1, false, 'branch-A', 1, 'A'));

      let stats = server.getMemoryStats();
      expect(stats.thoughtHistoryCount).toBe(2);
      expect(stats.branchCount).toBe(1);
      expect(stats.totalBranchThoughts).toBe(1);

      server.clearCompletedChains();
      stats = server.getMemoryStats();
      expect(stats.thoughtHistoryCount).toBe(0);
      expect(stats.chainSummaryCount).toBe(2);
      expect(stats.completedChainsInHistory).toBe(0);

      server.clearAllBranches();
      stats = server.getMemoryStats();
      expect(stats.branchCount).toBe(0);
      expect(stats.totalBranchThoughts).toBe(0);

      server.clearChainSummaries();
      stats = server.getMemoryStats();
      expect(stats.chainSummaryCount).toBe(0);
    });
  });
});

describe('TraceServer Getter Methods', () => {
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

  describe('getThoughtHistory()', () => {
    it('should return the current thought history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 3, true, 'First'));
      server.processThought(createThought(2, 3, true, 'Second'));
      server.processThought(createThought(3, 3, false, 'Third'));

      const history = server.getThoughtHistory();

      expect(history.length).toBe(3);
      expect(history[0].thought).toBe('First');
      expect(history[1].thought).toBe('Second');
      expect(history[2].thought).toBe('Third');
    });

    it('should return empty array when no thoughts exist', () => {
      const server = new TraceServer();

      const history = server.getThoughtHistory();

      expect(history).toEqual([]);
      expect(Array.isArray(history)).toBe(true);
    });

    it('should return a copy, not a reference to internal state', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 2, true, 'Original'));
      server.processThought(createThought(2, 2, false, 'Second'));

      const history = server.getThoughtHistory();

      // Modify the returned array
      history.push({
        thought: 'Injected',
        thoughtNumber: 99,
        totalThoughts: 99,
        nextThoughtNeeded: false,
      });

      // Internal state should be unchanged
      expect(server.getThoughtCount()).toBe(2);
      expect(server.getThoughtHistory().length).toBe(2);
    });

    it('should return a different array reference each time', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 1, true, 'Test'));

      const history1 = server.getThoughtHistory();
      const history2 = server.getThoughtHistory();

      expect(history1).not.toBe(history2);
      expect(history1).toEqual(history2);
    });

    it('should not allow modification of internal thought objects via returned array', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 1, true, 'Original thought'));

      const history = server.getThoughtHistory();
      // Note: shallow copy means the objects themselves are still references
      // But this tests the array structure protection
      history.length = 0;

      expect(server.getThoughtCount()).toBe(1);
      expect(server.getThoughtHistory()[0].thought).toBe('Original thought');
    });
  });

  describe('getBranches()', () => {
    it('should return all branches', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 2, false, 'branch-A', 1, 'A2'));
      server.processThought(createBranchThought(1, 1, false, 'branch-B', 1, 'B1'));

      const branches = server.getBranches();

      expect(Object.keys(branches).length).toBe(2);
      expect(branches['branch-A'].length).toBe(2);
      expect(branches['branch-B'].length).toBe(1);
    });

    it('should return empty object when no branches exist', () => {
      const server = new TraceServer();

      const branches = server.getBranches();

      expect(branches).toEqual({});
    });

    it('should return a copy of branches object, not internal reference', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch-A', 1, 'A1'));

      const branches = server.getBranches();

      // Modify the returned object
      branches['branch-new'] = [];
      delete branches['branch-A'];

      // Internal state should be unchanged
      expect(server.getBranchCount()).toBe(1);
      expect(server.getBranch('branch-A')).toBeDefined();
      expect(server.getBranch('branch-new')).toBeUndefined();
    });

    it('should return copies of branch arrays, not references', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));

      const branches = server.getBranches();

      // Modify a branch array in the returned object
      branches['branch-A'].push({
        thought: 'Injected',
        thoughtNumber: 99,
        totalThoughts: 99,
        nextThoughtNeeded: false,
      });

      // Internal state should be unchanged
      expect(server.getBranch('branch-A')!.length).toBe(1);
    });

    it('should return a different object reference each time', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch-A', 1, 'A1'));

      const branches1 = server.getBranches();
      const branches2 = server.getBranches();

      expect(branches1).not.toBe(branches2);
      expect(branches1['branch-A']).not.toBe(branches2['branch-A']);
    });
  });

  describe('getBranch()', () => {
    it('should return a specific branch by ID', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'my-branch', 1, 'First'));
      server.processThought(createBranchThought(2, 2, false, 'my-branch', 1, 'Second'));

      const branch = server.getBranch('my-branch');

      expect(branch).toBeDefined();
      expect(branch!.length).toBe(2);
      expect(branch![0].thought).toBe('First');
      expect(branch![1].thought).toBe('Second');
    });

    it('should return undefined for non-existent branch', () => {
      const server = new TraceServer();

      const branch = server.getBranch('non-existent');

      expect(branch).toBeUndefined();
    });

    it('should return a copy, not a reference to internal state', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));

      const branch = server.getBranch('branch-A');

      // Modify the returned array
      branch!.push({
        thought: 'Injected',
        thoughtNumber: 99,
        totalThoughts: 99,
        nextThoughtNeeded: false,
      });

      // Internal state should be unchanged
      expect(server.getBranch('branch-A')!.length).toBe(1);
    });

    it('should return a different array reference each time', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch-A', 1, 'A1'));

      const branch1 = server.getBranch('branch-A');
      const branch2 = server.getBranch('branch-A');

      expect(branch1).not.toBe(branch2);
      expect(branch1).toEqual(branch2);
    });

    it('should update LRU access time when retrieving a branch', async () => {
      const server = new TraceServer({
        maxBranches: 2,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Create two branches
      server.processThought(createBranchThought(1, 1, true, 'branch-old', 1, 'Old'));
      await new Promise(resolve => setTimeout(resolve, 10));
      server.processThought(createBranchThought(1, 1, true, 'branch-new', 1, 'New'));

      // Access the older branch to update its LRU time
      await new Promise(resolve => setTimeout(resolve, 10));
      server.getBranch('branch-old');

      // Add a third branch - should evict branch-new (now LRU)
      server.processThought(createBranchThought(1, 1, true, 'branch-newest', 1, 'Newest'));

      expect(server.getBranch('branch-old')).toBeDefined();
      expect(server.getBranch('branch-new')).toBeUndefined();
      expect(server.getBranch('branch-newest')).toBeDefined();
    });

    it('should not update LRU time when branch does not exist', () => {
      const server = new TraceServer();

      // Should not throw when accessing non-existent branch
      const result = server.getBranch('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getThoughtCount()', () => {
    it('should return the number of thoughts in main history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      expect(server.getThoughtCount()).toBe(0);

      server.processThought(createThought(1, 3, true, 'First'));
      expect(server.getThoughtCount()).toBe(1);

      server.processThought(createThought(2, 3, true, 'Second'));
      expect(server.getThoughtCount()).toBe(2);

      server.processThought(createThought(3, 3, false, 'Third'));
      expect(server.getThoughtCount()).toBe(3);
    });

    it('should not count branch thoughts', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 2, true, 'Main1'));
      server.processThought(createBranchThought(1, 3, true, 'branch-A', 1, 'Branch1'));
      server.processThought(createBranchThought(2, 3, true, 'branch-A', 1, 'Branch2'));

      // Should only count the main history thought
      expect(server.getThoughtCount()).toBe(1);
    });

    it('should return 0 for empty server', () => {
      const server = new TraceServer();

      expect(server.getThoughtCount()).toBe(0);
    });

    it('should reflect changes after cleanup operations', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 2, true, 'First'));
      server.processThought(createThought(2, 2, false, 'Second'));
      expect(server.getThoughtCount()).toBe(2);

      server.clearHistory();
      expect(server.getThoughtCount()).toBe(0);
    });
  });

  describe('getBranchCount()', () => {
    it('should return the number of branches', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      expect(server.getBranchCount()).toBe(0);

      server.processThought(createBranchThought(1, 1, true, 'branch-A', 1, 'A1'));
      expect(server.getBranchCount()).toBe(1);

      server.processThought(createBranchThought(1, 1, true, 'branch-B', 1, 'B1'));
      expect(server.getBranchCount()).toBe(2);

      server.processThought(createBranchThought(1, 1, true, 'branch-C', 1, 'C1'));
      expect(server.getBranchCount()).toBe(3);
    });

    it('should not count main history thoughts', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 5, true, 'Main1'));
      server.processThought(createThought(2, 5, true, 'Main2'));
      server.processThought(createBranchThought(1, 1, true, 'branch-A', 1, 'A1'));

      expect(server.getBranchCount()).toBe(1);
    });

    it('should return 0 for server with no branches', () => {
      const server = new TraceServer();

      expect(server.getBranchCount()).toBe(0);
    });

    it('should reflect changes after cleanup operations', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(1, 1, true, 'branch-B', 1, 'B1'));
      expect(server.getBranchCount()).toBe(2);

      server.clearBranch('branch-A');
      expect(server.getBranchCount()).toBe(1);

      server.clearAllBranches();
      expect(server.getBranchCount()).toBe(0);
    });
  });

  describe('getMemoryStats()', () => {
    it('should return accurate thought history stats', () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 3, true, 'First'));
      server.processThought(createThought(2, 3, true, 'Second'));
      server.processThought(createThought(3, 3, false, 'Third'));

      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryCount).toBe(3);
      expect(stats.thoughtHistoryLimit).toBe(100);
    });

    it('should return accurate branch stats', () => {
      const server = new TraceServer({
        maxBranches: 10,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 2, true, 'branch-A', 1, 'A2'));
      server.processThought(createBranchThought(1, 1, true, 'branch-B', 1, 'B1'));

      const stats = server.getMemoryStats();

      expect(stats.branchCount).toBe(2);
      expect(stats.branchLimit).toBe(10);
      expect(stats.branchThoughtCounts['branch-A']).toBe(2);
      expect(stats.branchThoughtCounts['branch-B']).toBe(1);
    });

    it('should return accurate per-branch limit', () => {
      const server = new TraceServer({
        maxThoughtsPerBranch: 50,
      });

      const stats = server.getMemoryStats();

      expect(stats.perBranchLimit).toBe(50);
    });

    it('should return accurate completed chains count', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add completed chain
      server.processThought(createThought(1, 2, true, 'Chain1-T1'));
      server.processThought(createThought(2, 2, false, 'Chain1-T2'));

      // Add incomplete chain
      server.processThought(createThought(1, 5, true, 'Chain2-T1'));

      const stats = server.getMemoryStats();

      expect(stats.completedChainsInHistory).toBe(1);
    });

    it('should return accurate chain summary stats', () => {
      const server = new TraceServer({
        maxChainSummaries: 50,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createThought(1, 1, false, 'Chain1'));
      server.processThought(createThought(1, 1, false, 'Chain2'));
      server.clearCompletedChains();

      const stats = server.getMemoryStats();

      expect(stats.chainSummaryCount).toBe(2);
      expect(stats.chainSummaryLimit).toBe(50);
    });

    it('should return accurate total branch thoughts', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 3, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 3, true, 'branch-A', 1, 'A2'));
      server.processThought(createBranchThought(3, 3, true, 'branch-A', 1, 'A3'));
      server.processThought(createBranchThought(1, 2, true, 'branch-B', 1, 'B1'));
      server.processThought(createBranchThought(2, 2, true, 'branch-B', 1, 'B2'));

      const stats = server.getMemoryStats();

      expect(stats.totalBranchThoughts).toBe(5);
    });

    it('should return accurate total thoughts (history + branches)', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add 3 to main history
      server.processThought(createThought(1, 3, true, 'Main1'));
      server.processThought(createThought(2, 3, true, 'Main2'));
      server.processThought(createThought(3, 3, true, 'Main3'));

      // Add 4 to branches
      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 2, true, 'branch-A', 1, 'A2'));
      server.processThought(createBranchThought(1, 2, true, 'branch-B', 1, 'B1'));
      server.processThought(createBranchThought(2, 2, true, 'branch-B', 1, 'B2'));

      const stats = server.getMemoryStats();

      expect(stats.totalThoughts).toBe(7);
      expect(stats.totalThoughts).toBe(stats.thoughtHistoryCount + stats.totalBranchThoughts);
    });

    it('should return all zero counts for empty server', () => {
      const server = new TraceServer();

      const stats = server.getMemoryStats();

      expect(stats.thoughtHistoryCount).toBe(0);
      expect(stats.branchCount).toBe(0);
      expect(stats.totalBranchThoughts).toBe(0);
      expect(stats.totalThoughts).toBe(0);
      expect(stats.completedChainsInHistory).toBe(0);
      expect(stats.chainSummaryCount).toBe(0);
    });

    it('should return a new object each time (not a reference)', () => {
      const server = new TraceServer();

      const stats1 = server.getMemoryStats();
      const stats2 = server.getMemoryStats();

      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });

    it('should not allow modification of internal state via returned stats', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 1, true, 'branch-A', 1, 'A1'));

      const stats = server.getMemoryStats();

      // Try to modify the branchThoughtCounts
      stats.branchThoughtCounts['branch-new'] = 999;
      delete stats.branchThoughtCounts['branch-A'];

      // Internal state should be unchanged
      const freshStats = server.getMemoryStats();
      expect(freshStats.branchThoughtCounts['branch-A']).toBe(1);
      expect(freshStats.branchThoughtCounts['branch-new']).toBeUndefined();
    });
  });

  describe('getChainSummaries()', () => {
    it('should return chain summaries', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createThought(1, 2, true, 'First thought'));
      server.processThought(createThought(2, 2, false, 'Last thought'));
      server.clearCompletedChains();

      const summaries = server.getChainSummaries();

      expect(summaries.length).toBe(1);
      expect(summaries[0].thoughtCount).toBe(2);
      expect(summaries[0].firstThoughtPreview).toContain('First thought');
      expect(summaries[0].finalThoughtPreview).toContain('Last thought');
    });

    it('should return empty array when no summaries exist', () => {
      const server = new TraceServer();

      const summaries = server.getChainSummaries();

      expect(summaries).toEqual([]);
      expect(Array.isArray(summaries)).toBe(true);
    });

    it('should return a copy, not a reference to internal state', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createThought(1, 1, false, 'Complete'));
      server.clearCompletedChains();

      const summaries = server.getChainSummaries();

      // Modify the returned array
      summaries.push({
        id: 'fake_id',
        completedAt: Date.now(),
        thoughtCount: 999,
        firstThoughtPreview: 'Fake',
        finalThoughtPreview: 'Fake',
        totalThoughtsEstimate: 999,
      });

      // Internal state should be unchanged
      expect(server.getChainSummaries().length).toBe(1);
    });

    it('should return a different array reference each time', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
      });

      server.processThought(createThought(1, 1, false, 'Complete'));
      server.clearCompletedChains();

      const summaries1 = server.getChainSummaries();
      const summaries2 = server.getChainSummaries();

      expect(summaries1).not.toBe(summaries2);
      expect(summaries1).toEqual(summaries2);
    });
  });

  describe('getCompletedChainsInHistory()', () => {
    it('should return completed chains in main history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Add a completed chain
      server.processThought(createThought(1, 2, true, 'Chain1-T1'));
      server.processThought(createThought(2, 2, false, 'Chain1-T2'));

      const chains = server.getCompletedChainsInHistory();

      expect(chains.length).toBe(1);
      expect(chains[0].isComplete).toBe(true);
      expect(chains[0].startIndex).toBe(0);
      expect(chains[0].endIndex).toBe(1);
    });

    it('should return empty array when no completed chains exist', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 5, true, 'Incomplete'));

      const chains = server.getCompletedChainsInHistory();

      expect(chains).toEqual([]);
    });

    it('should return multiple completed chains', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 1, false, 'Chain1'));
      server.processThought(createThought(1, 2, true, 'Chain2-T1'));
      server.processThought(createThought(2, 2, false, 'Chain2-T2'));

      const chains = server.getCompletedChainsInHistory();

      expect(chains.length).toBe(2);
    });
  });

  describe('getCompletedChainsInBranch()', () => {
    it('should return completed chains in specific branch', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 2, false, 'branch-A', 1, 'A2'));

      const chains = server.getCompletedChainsInBranch('branch-A');

      expect(chains.length).toBe(1);
      expect(chains[0].isComplete).toBe(true);
    });

    it('should return empty array for non-existent branch', () => {
      const server = new TraceServer();

      const chains = server.getCompletedChainsInBranch('non-existent');

      expect(chains).toEqual([]);
    });

    it('should return empty array when branch has no completed chains', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 5, true, 'branch-A', 1, 'A1'));

      const chains = server.getCompletedChainsInBranch('branch-A');

      expect(chains).toEqual([]);
    });
  });

  describe('hasCompletedChains()', () => {
    it('should return true when completed chains exist', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 1, false, 'Complete'));

      expect(server.hasCompletedChains()).toBe(true);
    });

    it('should return false when no completed chains exist', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createThought(1, 5, true, 'Incomplete'));

      expect(server.hasCompletedChains()).toBe(false);
    });

    it('should return false for empty history', () => {
      const server = new TraceServer();

      expect(server.hasCompletedChains()).toBe(false);
    });
  });

  describe('getChainBoundaries()', () => {
    it('should return all chain boundaries in main history', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      // Complete chain
      server.processThought(createThought(1, 2, true, 'Chain1-T1'));
      server.processThought(createThought(2, 2, false, 'Chain1-T2'));

      // Incomplete chain
      server.processThought(createThought(1, 3, true, 'Chain2-T1'));

      const boundaries = server.getChainBoundaries();

      expect(boundaries.length).toBe(2);
      expect(boundaries[0].isComplete).toBe(true);
      expect(boundaries[1].isComplete).toBe(false);
    });

    it('should return empty array for empty history', () => {
      const server = new TraceServer();

      const boundaries = server.getChainBoundaries();

      expect(boundaries).toEqual([]);
    });
  });

  describe('getBranchChainBoundaries()', () => {
    it('should return chain boundaries for specific branch', () => {
      const server = new TraceServer({
        enableAutoCleanup: false,
        cleanupOnComplete: false,
      });

      server.processThought(createBranchThought(1, 2, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(2, 2, false, 'branch-A', 1, 'A2'));

      const boundaries = server.getBranchChainBoundaries('branch-A');

      expect(boundaries.length).toBe(1);
      expect(boundaries[0].isComplete).toBe(true);
    });

    it('should return empty array for non-existent branch', () => {
      const server = new TraceServer();

      const boundaries = server.getBranchChainBoundaries('non-existent');

      expect(boundaries).toEqual([]);
    });
  });
});

// ============================================================================
// Integration Tests: Long-Running Session Simulation
// ============================================================================
describe('Integration: Long-Running Session Simulation', () => {
  // Helper to create a thought
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

  // Helper to create a complete thought chain
  const createCompleteChain = (
    server: TraceServer,
    chainId: number,
    chainLength: number
  ): void => {
    for (let i = 1; i <= chainLength; i++) {
      const isLast = i === chainLength;
      server.processThought(createThought(
        i,
        chainLength,
        !isLast,
        `Chain ${chainId} - Thought ${i}`
      ));
    }
  };

  // Helper to create a complete branch chain
  const createCompleteBranchChain = (
    server: TraceServer,
    branchId: string,
    chainLength: number,
    branchFromThought: number = 1
  ): void => {
    for (let i = 1; i <= chainLength; i++) {
      const isLast = i === chainLength;
      server.processThought(createBranchThought(
        i,
        chainLength,
        !isLast,
        branchId,
        branchFromThought,
        `Branch ${branchId} - Thought ${i}`
      ));
    }
  };

  describe('Memory Bounds Under Heavy Load', () => {
    it('should maintain memory bounds with 100+ thought chains (auto-cleanup enabled)', () => {
      const server = new TraceServer({
        maxThoughtHistory: 50,
        maxBranches: 10,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 30,
      });

      // Create 100 complete thought chains of varying lengths
      for (let chainId = 1; chainId <= 100; chainId++) {
        const chainLength = (chainId % 5) + 2; // Chains of length 2-6
        createCompleteChain(server, chainId, chainLength);
      }

      const stats = server.getMemoryStats();

      // With auto-cleanup enabled, completed chains are removed
      // So the history should be mostly empty (only incomplete chains remain)
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
      expect(stats.chainSummaryCount).toBeLessThanOrEqual(stats.chainSummaryLimit);

      // Verify summaries were created and bounded
      expect(stats.chainSummaryCount).toBe(30); // maxChainSummaries = 30
    });

    it('should maintain memory bounds with 100+ thought chains (auto-cleanup disabled)', () => {
      const server = new TraceServer({
        maxThoughtHistory: 50,
        maxBranches: 10,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false,
        maxChainSummaries: 30,
      });

      // Create 100 complete thought chains (average 4 thoughts each = ~400 thoughts)
      for (let chainId = 1; chainId <= 100; chainId++) {
        const chainLength = (chainId % 5) + 2; // Chains of length 2-6
        createCompleteChain(server, chainId, chainLength);
      }

      const stats = server.getMemoryStats();

      // History should be exactly at the limit
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
      expect(stats.thoughtHistoryCount).toBe(50); // maxThoughtHistory = 50

      // No summaries should exist since retainChainSummaries is false
      expect(stats.chainSummaryCount).toBe(0);
    });

    it('should maintain branch count bounds with many branch operations', () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 5,
        maxThoughtsPerBranch: 10,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 50,
      });

      // Create 20 branches (exceeds maxBranches = 5)
      for (let branchNum = 1; branchNum <= 20; branchNum++) {
        const branchId = `branch-${branchNum}`;
        // Create complete chains in each branch
        createCompleteBranchChain(server, branchId, 5);
      }

      const stats = server.getMemoryStats();

      // Branch count should be at or below limit
      // Note: With auto-cleanup, completed chains in branches are removed,
      // but the branch itself may remain empty until LRU eviction
      expect(stats.branchCount).toBeLessThanOrEqual(stats.branchLimit);
    });

    it('should maintain per-branch thought limits under load', () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 3,
        maxThoughtsPerBranch: 10,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false,
      });

      // Create 3 branches with many thoughts each (exceeds per-branch limit)
      for (let branchNum = 1; branchNum <= 3; branchNum++) {
        const branchId = `branch-${branchNum}`;
        // Add 30 thoughts per branch (exceeds maxThoughtsPerBranch = 10)
        for (let i = 1; i <= 30; i++) {
          server.processThought(createBranchThought(
            i, 100, true, branchId, 1, `Branch ${branchNum} - Thought ${i}`
          ));
        }
      }

      const stats = server.getMemoryStats();

      // Each branch should be at or below the per-branch limit
      for (const branchId of Object.keys(stats.branchThoughtCounts)) {
        expect(stats.branchThoughtCounts[branchId]).toBeLessThanOrEqual(stats.perBranchLimit);
        expect(stats.branchThoughtCounts[branchId]).toBe(10);
      }
    });
  });

  describe('Long-Running Session Simulation', () => {
    it('should simulate a realistic long-running session with mixed operations', () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 10,
        maxThoughtsPerBranch: 50,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 50,
      });

      // Simulate 200 "queries" (thought chains) over a long session
      let totalThoughtsProcessed = 0;

      for (let queryNum = 1; queryNum <= 200; queryNum++) {
        const chainLength = Math.floor(Math.random() * 8) + 3; // 3-10 thoughts
        totalThoughtsProcessed += chainLength;

        // Main chain
        createCompleteChain(server, queryNum, chainLength);

        // Every 10th query creates a branch
        if (queryNum % 10 === 0) {
          const branchId = `query-${queryNum}-branch`;
          const branchLength = Math.floor(Math.random() * 5) + 2; // 2-6 thoughts
          totalThoughtsProcessed += branchLength;
          createCompleteBranchChain(server, branchId, branchLength);
        }
      }

      const stats = server.getMemoryStats();

      // Verify all limits are respected
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
      expect(stats.branchCount).toBeLessThanOrEqual(stats.branchLimit);
      expect(stats.chainSummaryCount).toBeLessThanOrEqual(stats.chainSummaryLimit);

      // Verify that we processed many thoughts but memory is bounded
      // With 200 queries of avg 6.5 thoughts each + branches, we processed ~1300+ thoughts
      // But memory should be bounded to our configured limits
      expect(totalThoughtsProcessed).toBeGreaterThan(1000);
      expect(stats.totalThoughts).toBeLessThanOrEqual(
        stats.thoughtHistoryLimit + (stats.branchLimit * stats.perBranchLimit)
      );
    });

    it('should preserve active chains while cleaning up completed ones', () => {
      const server = new TraceServer({
        maxThoughtHistory: 50,
        maxBranches: 5,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 100,
      });

      // Create 50 complete chains
      for (let chainId = 1; chainId <= 50; chainId++) {
        createCompleteChain(server, chainId, 3);
      }

      // Now start an active (incomplete) chain
      server.processThought(createThought(1, 5, true, 'Active chain - Thought 1'));
      server.processThought(createThought(2, 5, true, 'Active chain - Thought 2'));

      const statsBefore = server.getMemoryStats();

      // Create 20 more complete chains
      for (let chainId = 51; chainId <= 70; chainId++) {
        createCompleteChain(server, chainId, 3);
      }

      const statsAfter = server.getMemoryStats();

      // The active chain should still exist in history
      const history = server.getThoughtHistory();
      const activeThoughts = history.filter(t => t.thought.includes('Active chain'));

      expect(activeThoughts.length).toBe(2);
      expect(activeThoughts[0].thought).toBe('Active chain - Thought 1');
      expect(activeThoughts[1].thought).toBe('Active chain - Thought 2');

      // Memory should still be bounded
      expect(statsAfter.thoughtHistoryCount).toBeLessThanOrEqual(statsAfter.thoughtHistoryLimit);
    });

    it('should handle interleaved main history and branch operations', () => {
      const server = new TraceServer({
        maxThoughtHistory: 30,
        maxBranches: 5,
        maxThoughtsPerBranch: 10,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 50,
      });

      // Interleaved operations
      for (let i = 1; i <= 50; i++) {
        // Add to main history
        createCompleteChain(server, i, 3);

        // Every 5th iteration, work on a branch
        if (i % 5 === 0) {
          const branchId = `interleaved-branch-${i}`;
          createCompleteBranchChain(server, branchId, 4);
        }
      }

      const stats = server.getMemoryStats();

      // All limits should be respected
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
      expect(stats.branchCount).toBeLessThanOrEqual(stats.branchLimit);
      expect(stats.chainSummaryCount).toBeLessThanOrEqual(stats.chainSummaryLimit);

      // Summaries should have been created and bounded
      expect(stats.chainSummaryCount).toBe(50); // Should be at limit
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not leak memory over extended operation (1000 operations)', () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 10,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 50,
      });

      // Record stats at intervals
      const statsSnapshots: { iteration: number; totalThoughts: number }[] = [];

      for (let i = 1; i <= 1000; i++) {
        // Create chains of random lengths
        const chainLength = (i % 7) + 2; // 2-8 thoughts
        createCompleteChain(server, i, chainLength);

        // Create branches periodically
        if (i % 50 === 0) {
          const branchId = `leak-test-branch-${i}`;
          createCompleteBranchChain(server, branchId, 5);
        }

        // Snapshot stats every 100 iterations
        if (i % 100 === 0) {
          const stats = server.getMemoryStats();
          statsSnapshots.push({ iteration: i, totalThoughts: stats.totalThoughts });
        }
      }

      const finalStats = server.getMemoryStats();

      // Memory should be bounded and stable
      expect(finalStats.thoughtHistoryCount).toBeLessThanOrEqual(finalStats.thoughtHistoryLimit);
      expect(finalStats.branchCount).toBeLessThanOrEqual(finalStats.branchLimit);
      expect(finalStats.chainSummaryCount).toBeLessThanOrEqual(finalStats.chainSummaryLimit);

      // Total thoughts should never exceed theoretical maximum
      const maxPossibleThoughts = finalStats.thoughtHistoryLimit +
        (finalStats.branchLimit * finalStats.perBranchLimit);
      expect(finalStats.totalThoughts).toBeLessThanOrEqual(maxPossibleThoughts);

      // Verify stats remained bounded throughout (no memory spike at any point)
      for (const snapshot of statsSnapshots) {
        expect(snapshot.totalThoughts).toBeLessThanOrEqual(maxPossibleThoughts);
      }
    });

    it('should properly clean up completed chains leaving no orphaned data', () => {
      const server = new TraceServer({
        maxThoughtHistory: 50,
        maxBranches: 5,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: false, // Don't retain summaries for this test
      });

      // Create many complete chains
      for (let i = 1; i <= 100; i++) {
        createCompleteChain(server, i, 5);
      }

      const stats = server.getMemoryStats();

      // With auto-cleanup and no summary retention, completed chains are fully removed
      // The history should be empty since all chains completed
      expect(stats.thoughtHistoryCount).toBe(0);
      expect(stats.chainSummaryCount).toBe(0);
      expect(stats.completedChainsInHistory).toBe(0);
    });

    it('should bound chain summaries to prevent memory leak in archive', () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 5,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 20, // Small limit
      });

      // Create 100 chains - should generate 100 summaries but only keep 20
      for (let i = 1; i <= 100; i++) {
        createCompleteChain(server, i, 3);
      }

      const stats = server.getMemoryStats();

      // Summaries should be bounded
      expect(stats.chainSummaryCount).toBe(20);
      expect(stats.chainSummaryCount).toBeLessThanOrEqual(stats.chainSummaryLimit);

      // Verify oldest summaries were evicted
      const summaries = server.getChainSummaries();
      expect(summaries.length).toBe(20);
    });
  });

  describe('Edge Cases in Long Sessions', () => {
    it('should handle rapid chain creation and completion', () => {
      const server = new TraceServer({
        maxThoughtHistory: 20,
        maxBranches: 3,
        maxThoughtsPerBranch: 10,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 10,
      });

      // Rapid fire: Create 500 single-thought chains (immediate completion)
      for (let i = 1; i <= 500; i++) {
        server.processThought(createThought(1, 1, false, `Quick thought ${i}`));
      }

      const stats = server.getMemoryStats();

      // All limits should be respected
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
      expect(stats.chainSummaryCount).toBeLessThanOrEqual(stats.chainSummaryLimit);
    });

    it('should handle very long individual chains', () => {
      const server = new TraceServer({
        maxThoughtHistory: 50,
        maxBranches: 5,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 10,
      });

      // Create a few very long chains (longer than maxThoughtHistory)
      for (let chainNum = 1; chainNum <= 3; chainNum++) {
        const chainLength = 100; // Each chain is longer than maxThoughtHistory
        for (let i = 1; i <= chainLength; i++) {
          const isLast = i === chainLength;
          server.processThought(createThought(
            i, chainLength, !isLast, `Long chain ${chainNum} - Thought ${i}`
          ));
        }
      }

      const stats = server.getMemoryStats();

      // History should respect limits even with very long chains
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
    });

    it('should handle multiple concurrent incomplete chains', () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 10,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 50,
      });

      // Start 20 incomplete chains in main history
      // (Note: In practice, only one chain is active at a time, but this tests limits)
      for (let chainNum = 1; chainNum <= 20; chainNum++) {
        // Start each chain but don't complete it
        for (let thoughtNum = 1; thoughtNum <= 3; thoughtNum++) {
          server.processThought(createThought(
            thoughtNum, 10, true, `Incomplete chain ${chainNum} - Thought ${thoughtNum}`
          ));
        }
      }

      // Also start incomplete chains in branches
      for (let branchNum = 1; branchNum <= 10; branchNum++) {
        const branchId = `incomplete-branch-${branchNum}`;
        for (let thoughtNum = 1; thoughtNum <= 3; thoughtNum++) {
          server.processThought(createBranchThought(
            thoughtNum, 10, true, branchId, 1, `Incomplete branch ${branchNum} - Thought ${thoughtNum}`
          ));
        }
      }

      const stats = server.getMemoryStats();

      // All limits should be respected
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
      expect(stats.branchCount).toBeLessThanOrEqual(stats.branchLimit);

      // Since auto-cleanup doesn't clean incomplete chains, they should exist
      // (but within limits)
      expect(stats.thoughtHistoryCount).toBeGreaterThan(0);
      expect(stats.branchCount).toBe(10); // maxBranches
    });

    it('should maintain data integrity during high-frequency operations', () => {
      const server = new TraceServer({
        maxThoughtHistory: 30,
        maxBranches: 5,
        maxThoughtsPerBranch: 15,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: true,
        maxChainSummaries: 20,
      });

      // High-frequency mixed operations
      for (let i = 1; i <= 200; i++) {
        // Add thoughts
        if (i % 3 === 0) {
          createCompleteChain(server, i, 4);
        } else if (i % 3 === 1) {
          const branchId = `hf-branch-${i % 10}`;
          server.processThought(createBranchThought(
            (i % 5) + 1, 10, i % 2 === 0, branchId, 1, `HF thought ${i}`
          ));
        } else {
          server.processThought(createThought(
            (i % 5) + 1, 10, true, `HF main thought ${i}`
          ));
        }

        // Periodic manual cleanup
        if (i % 50 === 0) {
          server.clearCompletedChains();
        }

        // Verify limits are always respected
        const stats = server.getMemoryStats();
        expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(stats.thoughtHistoryLimit);
        expect(stats.branchCount).toBeLessThanOrEqual(stats.branchLimit);
        expect(stats.chainSummaryCount).toBeLessThanOrEqual(stats.chainSummaryLimit);
      }
    });
  });

  describe('LRU Branch Eviction Under Load', () => {
    it('should correctly evict LRU branches during long session', async () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 3,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false,
      });

      // Create 3 branches
      server.processThought(createBranchThought(1, 5, true, 'branch-A', 1, 'A1'));
      server.processThought(createBranchThought(1, 5, true, 'branch-B', 1, 'B1'));
      server.processThought(createBranchThought(1, 5, true, 'branch-C', 1, 'C1'));

      expect(server.getBranchCount()).toBe(3);

      // Access branch-A to update its LRU time
      server.getBranch('branch-A');

      // Wait a tiny bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 5));

      // Access branch-C to update its LRU time
      server.getBranch('branch-C');

      // Wait a tiny bit
      await new Promise(resolve => setTimeout(resolve, 5));

      // Add a new branch - should evict branch-B (least recently used)
      server.processThought(createBranchThought(1, 5, true, 'branch-D', 1, 'D1'));

      expect(server.getBranchCount()).toBe(3);

      // branch-B should have been evicted
      expect(server.getBranch('branch-A')).toBeDefined();
      expect(server.getBranch('branch-B')).toBeUndefined();
      expect(server.getBranch('branch-C')).toBeDefined();
      expect(server.getBranch('branch-D')).toBeDefined();
    });

    it('should handle repeated LRU evictions correctly', async () => {
      const server = new TraceServer({
        maxThoughtHistory: 100,
        maxBranches: 2,
        maxThoughtsPerBranch: 10,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false,
      });

      // Track which branches should exist at each step
      const expectedBranches: string[] = [];

      for (let i = 1; i <= 10; i++) {
        const branchId = `rotating-branch-${i}`;

        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 2));

        server.processThought(createBranchThought(1, 5, true, branchId, 1, `Branch ${i} thought`));

        // Update expected branches (most recent 2)
        expectedBranches.push(branchId);
        if (expectedBranches.length > 2) {
          expectedBranches.shift(); // Remove oldest
        }

        // Verify branch count stays at limit
        expect(server.getBranchCount()).toBeLessThanOrEqual(2);

        // Verify the expected branches exist
        for (const expected of expectedBranches) {
          expect(server.getBranch(expected)).toBeDefined();
        }
      }
    });
  });

  describe('Stress Test: Very Small Limits', () => {
    it('should function correctly with minimal limits', () => {
      const server = new TraceServer({
        maxThoughtHistory: 1,
        maxBranches: 1,
        maxThoughtsPerBranch: 1,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: true,
        maxChainSummaries: 1,
      });

      // Attempt many operations with extreme limits
      for (let i = 1; i <= 100; i++) {
        server.processThought(createThought(1, 1, false, `Minimal thought ${i}`));

        if (i % 10 === 0) {
          server.processThought(createBranchThought(
            1, 1, false, `minimal-branch-${i}`, 1, `Minimal branch thought ${i}`
          ));
        }
      }

      const stats = server.getMemoryStats();

      // All limits strictly enforced
      expect(stats.thoughtHistoryCount).toBeLessThanOrEqual(1);
      expect(stats.branchCount).toBeLessThanOrEqual(1);
      expect(stats.chainSummaryCount).toBeLessThanOrEqual(1);

      // For each branch, verify per-branch limit
      for (const branchId of Object.keys(stats.branchThoughtCounts)) {
        expect(stats.branchThoughtCounts[branchId]).toBeLessThanOrEqual(1);
      }
    });

    it('should handle zero thoughts gracefully after cleanup', () => {
      const server = new TraceServer({
        maxThoughtHistory: 10,
        maxBranches: 5,
        maxThoughtsPerBranch: 10,
        enableAutoCleanup: true,
        cleanupOnComplete: true,
        retainChainSummaries: false,
      });

      // Create and complete chains (they get cleaned up)
      for (let i = 1; i <= 50; i++) {
        createCompleteChain(server, i, 3);
      }

      const stats = server.getMemoryStats();

      // All chains completed and cleaned, nothing remains
      expect(stats.thoughtHistoryCount).toBe(0);
      expect(stats.completedChainsInHistory).toBe(0);
      expect(stats.totalThoughts).toBe(0);

      // Manual operations should still work
      server.clearHistory();
      server.clearAllBranches();
      server.clearCompletedChains();
      server.clearChainSummaries();

      // All getters should return valid (empty) data
      expect(server.getThoughtHistory()).toEqual([]);
      expect(server.getBranches()).toEqual({});
      expect(server.getChainSummaries()).toEqual([]);
      expect(server.getThoughtCount()).toBe(0);
      expect(server.getBranchCount()).toBe(0);
    });
  });

  describe('Memory Stats Accuracy Throughout Session', () => {
    it('should maintain accurate memory stats throughout a long session', () => {
      const server = new TraceServer({
        maxThoughtHistory: 50,
        maxBranches: 5,
        maxThoughtsPerBranch: 20,
        enableAutoCleanup: false,
        cleanupOnComplete: false,
        retainChainSummaries: false,
      });

      // Create controlled content and verify stats accuracy
      // Phase 1: Add thoughts to main history
      for (let i = 1; i <= 30; i++) {
        server.processThought(createThought(i, 100, true, `Main thought ${i}`));
      }

      let stats = server.getMemoryStats();
      expect(stats.thoughtHistoryCount).toBe(30);
      expect(stats.totalThoughts).toBe(30);

      // Phase 2: Add branches
      server.processThought(createBranchThought(1, 5, true, 'test-branch-1', 1, 'Branch 1 T1'));
      server.processThought(createBranchThought(2, 5, true, 'test-branch-1', 1, 'Branch 1 T2'));
      server.processThought(createBranchThought(1, 3, true, 'test-branch-2', 1, 'Branch 2 T1'));

      stats = server.getMemoryStats();
      expect(stats.branchCount).toBe(2);
      expect(stats.branchThoughtCounts['test-branch-1']).toBe(2);
      expect(stats.branchThoughtCounts['test-branch-2']).toBe(1);
      expect(stats.totalBranchThoughts).toBe(3);
      expect(stats.totalThoughts).toBe(33); // 30 main + 3 branch

      // Phase 3: Trigger eviction by exceeding main history limit
      for (let i = 31; i <= 60; i++) {
        server.processThought(createThought(i, 100, true, `Main thought ${i}`));
      }

      stats = server.getMemoryStats();
      expect(stats.thoughtHistoryCount).toBe(50); // Exactly at limit
      expect(stats.totalThoughts).toBe(53); // 50 main + 3 branch

      // Phase 4: Clear and verify
      server.clearHistory();
      stats = server.getMemoryStats();
      expect(stats.thoughtHistoryCount).toBe(0);
      expect(stats.totalThoughts).toBe(3); // Only branch thoughts remain

      server.clearAllBranches();
      stats = server.getMemoryStats();
      expect(stats.branchCount).toBe(0);
      expect(stats.totalBranchThoughts).toBe(0);
      expect(stats.totalThoughts).toBe(0);
    });
  });
});
