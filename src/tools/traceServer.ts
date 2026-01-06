import { ThoughtData } from '../models/interfaces.js';
import chalk from 'chalk';

/**
 * Configuration options for TraceServer memory management
 * Controls memory bounds and cleanup behavior for thought history and branches
 */
export interface TraceServerConfig {
  /**
   * Maximum number of thoughts to retain in the main thought history
   * When exceeded, oldest thoughts are evicted using FIFO strategy
   * @default 1000
   */
  maxThoughtHistory: number;

  /**
   * Maximum number of branches to maintain
   * When exceeded, oldest/least recently used branches are evicted
   * @default 50
   */
  maxBranches: number;

  /**
   * Maximum number of thoughts to retain per individual branch
   * When exceeded, oldest thoughts within the branch are evicted
   * @default 200
   */
  maxThoughtsPerBranch: number;

  /**
   * Whether to automatically clean up completed thought chains
   * When enabled, cleanup occurs during memory bound enforcement
   * @default true
   */
  enableAutoCleanup: boolean;

  /**
   * Whether to clean up a thought chain when it completes (nextThoughtNeeded: false)
   * Only applies when enableAutoCleanup is true
   * @default true
   */
  cleanupOnComplete: boolean;

  /**
   * Whether to retain summary/metadata when a chain is cleaned up
   * Stores basic info about cleaned chains for later reference
   * @default true
   */
  retainChainSummaries: boolean;

  /**
   * Maximum number of chain summaries to retain
   * When exceeded, oldest summaries are evicted
   * @default 100
   */
  maxChainSummaries: number;
}

/**
 * Default configuration values for TraceServer
 */
export const DEFAULT_TRACE_SERVER_CONFIG: Readonly<TraceServerConfig> = {
  maxThoughtHistory: 1000,
  maxBranches: 50,
  maxThoughtsPerBranch: 200,
  enableAutoCleanup: true,
  cleanupOnComplete: true,
  retainChainSummaries: true,
  maxChainSummaries: 100
};

/**
 * Metadata for tracking branch usage for LRU eviction
 */
interface BranchMetadata {
  /** Timestamp when the branch was created */
  createdAt: number;
  /** Timestamp when the branch was last accessed (read or write) */
  lastAccessedAt: number;
}

/**
 * Summary of a cleaned up thought chain
 * Retains basic metadata when a chain is removed from history
 */
export interface ChainSummary {
  /** Unique identifier for this chain summary */
  id: string;
  /** Timestamp when the chain was completed and archived */
  completedAt: number;
  /** Number of thoughts in the chain */
  thoughtCount: number;
  /** Summary of the first thought (truncated to first 100 chars) */
  firstThoughtPreview: string;
  /** Summary of the final thought (truncated to first 100 chars) */
  finalThoughtPreview: string;
  /** Branch ID if this chain was in a branch, undefined for main history */
  branchId?: string;
  /** Total thoughts estimate from the chain */
  totalThoughtsEstimate: number;
}

/**
 * Represents the boundaries of a thought chain within an array
 */
export interface ChainBoundary {
  /** Index of the first thought in the chain */
  startIndex: number;
  /** Index of the last thought in the chain */
  endIndex: number;
  /** Whether this chain is complete (last thought has nextThoughtNeeded: false) */
  isComplete: boolean;
}

/**
 * Memory usage statistics for the TraceServer
 * Provides current memory consumption and configured limits
 */
export interface MemoryStats {
  /** Current number of thoughts in main history */
  thoughtHistoryCount: number;
  /** Maximum allowed thoughts in main history */
  thoughtHistoryLimit: number;
  /** Current number of branches */
  branchCount: number;
  /** Maximum allowed branches */
  branchLimit: number;
  /** Object with branch IDs as keys and thought counts as values */
  branchThoughtCounts: Record<string, number>;
  /** Maximum thoughts allowed per branch */
  perBranchLimit: number;
  /** Number of completed chains currently in main history */
  completedChainsInHistory: number;
  /** Number of archived chain summaries */
  chainSummaryCount: number;
  /** Maximum allowed chain summaries */
  chainSummaryLimit: number;
  /** Total thoughts across all branches */
  totalBranchThoughts: number;
  /** Total thoughts (main history + all branches) */
  totalThoughts: number;
}

export class TraceServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};
  private branchMetadata: Record<string, BranchMetadata> = {};
  private chainSummaries: ChainSummary[] = [];
  private readonly config: Readonly<TraceServerConfig>;

  /**
   * Creates a new TraceServer instance
   * @param config - Optional partial configuration to override defaults
   */
  constructor(config?: Partial<TraceServerConfig>) {
    this.config = {
      ...DEFAULT_TRACE_SERVER_CONFIG,
      ...config
    };
  }

  /**
   * Checks if a sequence of thoughts forms a complete thought chain
   * A chain is complete when the last thought has nextThoughtNeeded: false
   * @param thoughts - Array of thoughts to check
   * @returns true if the chain is complete, false otherwise
   */
  private isThoughtChainComplete(thoughts: ThoughtData[]): boolean {
    if (thoughts.length === 0) {
      return false;
    }
    const lastThought = thoughts[thoughts.length - 1];
    return lastThought.nextThoughtNeeded === false;
  }

  /**
   * Identifies chain boundaries within an array of thoughts
   * Uses thoughtNumber to detect chain starts (thoughtNumber === 1 or reset)
   * and nextThoughtNeeded: false to detect chain ends
   *
   * @param thoughts - Array of thoughts to analyze
   * @returns Array of ChainBoundary objects representing each chain
   */
  private findChainBoundaries(thoughts: ThoughtData[]): ChainBoundary[] {
    if (thoughts.length === 0) {
      return [];
    }

    const boundaries: ChainBoundary[] = [];
    let chainStartIndex = 0;

    for (let i = 0; i < thoughts.length; i++) {
      const thought = thoughts[i];
      const isChainStart = i === 0 ||
        thought.thoughtNumber === 1 ||
        thought.thoughtNumber < thoughts[i - 1].thoughtNumber;

      // If this is a new chain start (and not the first thought),
      // close the previous chain
      if (isChainStart && i > 0) {
        const previousThought = thoughts[i - 1];
        boundaries.push({
          startIndex: chainStartIndex,
          endIndex: i - 1,
          isComplete: previousThought.nextThoughtNeeded === false
        });
        chainStartIndex = i;
      }

      // If this thought ends a chain, record it
      if (thought.nextThoughtNeeded === false) {
        boundaries.push({
          startIndex: chainStartIndex,
          endIndex: i,
          isComplete: true
        });
        // Next thought (if any) will start a new chain
        chainStartIndex = i + 1;
      }
    }

    // Handle the last chain if it wasn't completed
    if (chainStartIndex < thoughts.length) {
      const lastThought = thoughts[thoughts.length - 1];
      boundaries.push({
        startIndex: chainStartIndex,
        endIndex: thoughts.length - 1,
        isComplete: lastThought.nextThoughtNeeded === false
      });
    }

    return boundaries;
  }

  /**
   * Finds all completed thought chains in an array of thoughts
   * @param thoughts - Array of thoughts to analyze
   * @returns Array of ChainBoundary objects for completed chains only
   */
  private findCompletedChains(thoughts: ThoughtData[]): ChainBoundary[] {
    return this.findChainBoundaries(thoughts).filter(chain => chain.isComplete);
  }

  /**
   * Finds completed chains in the main thought history
   * @returns Array of ChainBoundary objects for completed chains in main history
   */
  public getCompletedChainsInHistory(): ChainBoundary[] {
    return this.findCompletedChains(this.thoughtHistory);
  }

  /**
   * Finds completed chains in a specific branch
   * @param branchId - The ID of the branch to analyze
   * @returns Array of ChainBoundary objects for completed chains, or empty array if branch doesn't exist
   */
  public getCompletedChainsInBranch(branchId: string): ChainBoundary[] {
    const branch = this.branches[branchId];
    if (!branch) {
      return [];
    }
    return this.findCompletedChains(branch);
  }

  /**
   * Checks if there are any completed chains in the main thought history
   * @returns true if at least one completed chain exists
   */
  public hasCompletedChains(): boolean {
    return this.getCompletedChainsInHistory().length > 0;
  }

  /**
   * Gets all chain boundaries (complete and incomplete) in the main thought history
   * @returns Array of ChainBoundary objects representing all chains
   */
  public getChainBoundaries(): ChainBoundary[] {
    return this.findChainBoundaries(this.thoughtHistory);
  }

  /**
   * Gets all chain boundaries for a specific branch
   * @param branchId - The ID of the branch to analyze
   * @returns Array of ChainBoundary objects, or empty array if branch doesn't exist
   */
  public getBranchChainBoundaries(branchId: string): ChainBoundary[] {
    const branch = this.branches[branchId];
    if (!branch) {
      return [];
    }
    return this.findChainBoundaries(branch);
  }

  /**
   * Gets all retained chain summaries
   * @returns Copy of the chain summaries array
   */
  public getChainSummaries(): ChainSummary[] {
    return [...this.chainSummaries];
  }

  // ============================================================================
  // State Inspection Methods
  // ============================================================================

  /**
   * Gets a copy of the main thought history
   * Returns a shallow copy to prevent external modification of internal state
   * @returns Copy of the thought history array
   */
  public getThoughtHistory(): ThoughtData[] {
    return [...this.thoughtHistory];
  }

  /**
   * Gets a copy of all branches
   * Returns a deep copy of the branches object with shallow copies of each branch array
   * @returns Copy of the branches object with branch IDs as keys and thought arrays as values
   */
  public getBranches(): Record<string, ThoughtData[]> {
    const branchesCopy: Record<string, ThoughtData[]> = {};
    for (const branchId of Object.keys(this.branches)) {
      branchesCopy[branchId] = [...this.branches[branchId]];
    }
    return branchesCopy;
  }

  /**
   * Gets a copy of a specific branch by its ID
   * Returns a shallow copy to prevent external modification of internal state
   * @param branchId - The ID of the branch to retrieve
   * @returns Copy of the branch array, or undefined if the branch doesn't exist
   */
  public getBranch(branchId: string): ThoughtData[] | undefined {
    const branch = this.branches[branchId];
    if (!branch) {
      return undefined;
    }
    // Update last accessed time for LRU tracking
    if (this.branchMetadata[branchId]) {
      this.branchMetadata[branchId].lastAccessedAt = Date.now();
    }
    return [...branch];
  }

  /**
   * Gets the total number of thoughts in the main history
   * @returns Number of thoughts in the main thought history
   */
  public getThoughtCount(): number {
    return this.thoughtHistory.length;
  }

  /**
   * Gets the number of branches currently maintained
   * @returns Number of branches
   */
  public getBranchCount(): number {
    return Object.keys(this.branches).length;
  }

  // ============================================================================
  // End of State Inspection Methods
  // ============================================================================

  // ============================================================================
  // Manual Cleanup Methods
  // ============================================================================

  /**
   * Clears all thoughts from the main thought history
   * Does not affect branches or chain summaries
   */
  public clearHistory(): void {
    this.thoughtHistory = [];
  }

  /**
   * Clears a specific branch by its ID
   * Removes both the branch data and its metadata
   * @param branchId - The ID of the branch to clear
   * @returns true if the branch was found and cleared, false if branch didn't exist
   */
  public clearBranch(branchId: string): boolean {
    if (!(branchId in this.branches)) {
      return false;
    }
    delete this.branches[branchId];
    delete this.branchMetadata[branchId];
    return true;
  }

  /**
   * Clears all branches and their metadata
   * Does not affect the main thought history or chain summaries
   */
  public clearAllBranches(): void {
    this.branches = {};
    this.branchMetadata = {};
  }

  /**
   * Clears only completed thought chains from main history and all branches
   * Active (incomplete) chains are preserved
   * Optionally archives completed chains before removal if retainChainSummaries is enabled
   * @returns Object containing counts of cleared chains from history and branches
   */
  public clearCompletedChains(): { historyChains: number; branchChains: number } {
    let historyChains = 0;
    let branchChains = 0;

    // Clear completed chains from main history
    const completedInHistory = this.findCompletedChains(this.thoughtHistory);
    // Process in reverse order to maintain correct indices
    for (let i = completedInHistory.length - 1; i >= 0; i--) {
      const chain = completedInHistory[i];
      const chainThoughts = this.thoughtHistory.slice(chain.startIndex, chain.endIndex + 1);

      // Archive if configured
      this.archiveChain(chainThoughts);

      // Remove the chain
      this.thoughtHistory.splice(chain.startIndex, chain.endIndex - chain.startIndex + 1);
      historyChains++;
    }

    // Clear completed chains from all branches
    for (const branchId of Object.keys(this.branches)) {
      const branch = this.branches[branchId];
      const completedInBranch = this.findCompletedChains(branch);

      // Process in reverse order to maintain correct indices
      for (let i = completedInBranch.length - 1; i >= 0; i--) {
        const chain = completedInBranch[i];
        const chainThoughts = branch.slice(chain.startIndex, chain.endIndex + 1);

        // Archive if configured
        this.archiveChain(chainThoughts, branchId);

        // Remove the chain
        branch.splice(chain.startIndex, chain.endIndex - chain.startIndex + 1);
        branchChains++;
      }
    }

    return { historyChains, branchChains };
  }

  /**
   * Returns current memory usage statistics
   * Provides insight into memory consumption and how close to limits
   * @returns MemoryStats object with detailed memory information
   */
  public getMemoryStats(): MemoryStats {
    // Calculate branch thought counts
    const branchThoughtCounts: Record<string, number> = {};
    let totalBranchThoughts = 0;

    for (const branchId of Object.keys(this.branches)) {
      const count = this.branches[branchId].length;
      branchThoughtCounts[branchId] = count;
      totalBranchThoughts += count;
    }

    return {
      thoughtHistoryCount: this.thoughtHistory.length,
      thoughtHistoryLimit: this.config.maxThoughtHistory,
      branchCount: Object.keys(this.branches).length,
      branchLimit: this.config.maxBranches,
      branchThoughtCounts,
      perBranchLimit: this.config.maxThoughtsPerBranch,
      completedChainsInHistory: this.findCompletedChains(this.thoughtHistory).length,
      chainSummaryCount: this.chainSummaries.length,
      chainSummaryLimit: this.config.maxChainSummaries,
      totalBranchThoughts,
      totalThoughts: this.thoughtHistory.length + totalBranchThoughts
    };
  }

  /**
   * Clears all chain summaries
   * Useful when you want to free memory used by archived chain metadata
   */
  public clearChainSummaries(): void {
    this.chainSummaries = [];
  }

  // ============================================================================
  // End of Manual Cleanup Methods
  // ============================================================================

  /**
   * Truncates a string to a maximum length, adding ellipsis if truncated
   * @param text - The text to truncate
   * @param maxLength - Maximum length (default: 100)
   * @returns Truncated string
   */
  private truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength - 3) + '...';
  }

  /**
   * Generates a unique ID for a chain summary
   * @returns Unique ID string
   */
  private generateChainId(): string {
    return `chain_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Creates a chain summary from an array of thoughts
   * @param thoughts - The thoughts that form the chain
   * @param branchId - Optional branch ID if the chain is from a branch
   * @returns ChainSummary object
   */
  private createChainSummary(thoughts: ThoughtData[], branchId?: string): ChainSummary {
    const firstThought = thoughts[0];
    const lastThought = thoughts[thoughts.length - 1];

    return {
      id: this.generateChainId(),
      completedAt: Date.now(),
      thoughtCount: thoughts.length,
      firstThoughtPreview: this.truncateText(firstThought.thought),
      finalThoughtPreview: this.truncateText(lastThought.thought),
      branchId,
      totalThoughtsEstimate: lastThought.totalThoughts
    };
  }

  /**
   * Enforces the maxChainSummaries limit using FIFO eviction
   */
  private enforceChainSummaryLimit(): void {
    while (this.chainSummaries.length > this.config.maxChainSummaries) {
      this.chainSummaries.shift();
    }
  }

  /**
   * Archives a chain by creating a summary and optionally storing it
   * @param thoughts - The thoughts that form the chain
   * @param branchId - Optional branch ID if the chain is from a branch
   */
  private archiveChain(thoughts: ThoughtData[], branchId?: string): void {
    if (!this.config.retainChainSummaries || thoughts.length === 0) {
      return;
    }

    const summary = this.createChainSummary(thoughts, branchId);
    this.chainSummaries.push(summary);
    this.enforceChainSummaryLimit();
  }

  /**
   * Performs automatic cleanup when a chain completes in the main history
   * Called after a thought with nextThoughtNeeded: false is stored
   * @param endIndex - Index of the final thought in the chain
   */
  private cleanupCompletedChainInHistory(endIndex: number): void {
    if (!this.config.enableAutoCleanup || !this.config.cleanupOnComplete) {
      return;
    }

    // Find all thoughts in the completed chain
    const chainIndices = this.findCompletedChainIndices(endIndex);
    if (chainIndices.length === 0) {
      return;
    }

    // Extract the chain thoughts before removing
    const chainThoughts = chainIndices.map(i => this.thoughtHistory[i]);

    // Archive the chain (create summary if configured)
    this.archiveChain(chainThoughts);

    // Remove the chain from history (from end to start to preserve indices)
    for (let i = chainIndices.length - 1; i >= 0; i--) {
      this.thoughtHistory.splice(chainIndices[i], 1);
    }
  }

  /**
   * Performs automatic cleanup when a chain completes in a branch
   * Called after a thought with nextThoughtNeeded: false is stored in a branch
   * @param branchId - The branch ID where the chain completed
   */
  private cleanupCompletedChainInBranch(branchId: string): void {
    if (!this.config.enableAutoCleanup || !this.config.cleanupOnComplete) {
      return;
    }

    const branch = this.branches[branchId];
    if (!branch || branch.length === 0) {
      return;
    }

    // Check if the last thought ends a chain
    const lastThought = branch[branch.length - 1];
    if (lastThought.nextThoughtNeeded !== false) {
      return;
    }

    // Find the start of the completed chain (walk backwards)
    let chainStartIndex = branch.length - 1;
    for (let i = branch.length - 2; i >= 0; i--) {
      const thought = branch[i];
      if (thought.nextThoughtNeeded === false) {
        // Previous chain ended here, our chain starts at i + 1
        chainStartIndex = i + 1;
        break;
      }
      chainStartIndex = i;
    }

    // Extract the chain thoughts
    const chainThoughts = branch.slice(chainStartIndex);

    // Archive the chain (create summary if configured)
    this.archiveChain(chainThoughts, branchId);

    // Remove the chain from the branch
    branch.splice(chainStartIndex);

    // If the branch is now empty, we can optionally remove it
    // For now, keep empty branches - they'll be cleaned up by LRU eviction
  }

  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>;

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }

    // Optional fields
    const isRevision = data.isRevision !== undefined ? !!data.isRevision : undefined;
    const revisesThought = data.revisesThought !== undefined && typeof data.revisesThought === 'number' 
      ? data.revisesThought as number 
      : undefined;
    const branchFromThought = data.branchFromThought !== undefined && typeof data.branchFromThought === 'number' 
      ? data.branchFromThought as number 
      : undefined;
    const branchId = data.branchId !== undefined && typeof data.branchId === 'string' 
      ? data.branchId as string 
      : undefined;
    const needsMoreThoughts = data.needsMoreThoughts !== undefined ? !!data.needsMoreThoughts : undefined;

    return {
      thought: data.thought as string,
      thoughtNumber: data.thoughtNumber as number,
      totalThoughts: data.totalThoughts as number,
      nextThoughtNeeded: data.nextThoughtNeeded as boolean,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId,
      needsMoreThoughts
    };
  }

  private formatThoughtOutput(data: ThoughtData): string {
    const { 
      thought, 
      thoughtNumber, 
      totalThoughts, 
      nextThoughtNeeded,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId,
      needsMoreThoughts
    } = data;
    
    let output = '';
    
    // Add header based on thought type
    if (isRevision && revisesThought) {
      output += `\n${chalk.bold.yellow(`Thought ${thoughtNumber}/${totalThoughts} (Revising Thought ${revisesThought}):`)} `;
    } else if (branchFromThought && branchId) {
      output += `\n${chalk.bold.magenta(`Thought ${thoughtNumber}/${totalThoughts} (Branch "${branchId}" from Thought ${branchFromThought}):`)} `;
    } else {
      output += `\n${chalk.bold.blue(`Thought ${thoughtNumber}/${totalThoughts}:`)} `;
    }
    
    // Add the thought content
    output += `${thought}\n`;
    
    // Add footer with status
    if (nextThoughtNeeded) {
      output += chalk.green(`\nContinuing to next thought...\n`);
      if (needsMoreThoughts) {
        output += chalk.yellow(`More thoughts needed than initially estimated.\n`);
      }
    } else {
      output += chalk.cyan(`\nThinking process complete.\n`);
    }
    
    return output;
  }

  /**
   * Finds the indices of a completed thought chain ending at the given position
   * A completed chain is a sequence of thoughts where the last one has nextThoughtNeeded: false
   * @param endIndex - The index of the last thought in the chain (must have nextThoughtNeeded: false)
   * @returns Array of indices that form the complete chain
   */
  private findCompletedChainIndices(endIndex: number): number[] {
    const endThought = this.thoughtHistory[endIndex];
    if (!endThought || endThought.nextThoughtNeeded !== false) {
      return [];
    }

    const chainIndices: number[] = [endIndex];

    // Walk backwards to find the start of the chain
    // A chain starts after the previous completed thought or at the beginning
    for (let i = endIndex - 1; i >= 0; i--) {
      const thought = this.thoughtHistory[i];

      // If we hit a thought that ended a previous chain, stop
      if (thought.nextThoughtNeeded === false) {
        break;
      }

      // This thought is part of our chain
      chainIndices.unshift(i);
    }

    return chainIndices;
  }

  /**
   * Enforces the maxThoughtHistory limit by evicting thoughts
   * Prioritizes evicting completed thought chains (oldest first)
   * Falls back to pure FIFO if no completed chains available
   */
  private enforceThoughtHistoryLimit(): void {
    while (this.thoughtHistory.length > this.config.maxThoughtHistory) {
      // First, try to find completed chains to evict (oldest first)
      let evictedCompletedChain = false;

      for (let i = 0; i < this.thoughtHistory.length; i++) {
        const thought = this.thoughtHistory[i];

        // Found a completed chain ending at index i
        if (thought.nextThoughtNeeded === false) {
          const chainIndices = this.findCompletedChainIndices(i);

          if (chainIndices.length > 0) {
            // Remove the chain (from end to start to preserve indices)
            for (let j = chainIndices.length - 1; j >= 0; j--) {
              this.thoughtHistory.splice(chainIndices[j], 1);
            }
            evictedCompletedChain = true;
            break; // Re-check the loop condition
          }
        }
      }

      // If no completed chain found/evicted, use pure FIFO (remove oldest thought)
      if (!evictedCompletedChain) {
        this.thoughtHistory.shift();
      }
    }
  }

  /**
   * Finds the least recently used branch ID
   * @returns The branch ID with the oldest lastAccessedAt timestamp, or undefined if no branches exist
   */
  private findLruBranchId(): string | undefined {
    let lruBranchId: string | undefined;
    let oldestAccessTime = Infinity;

    for (const branchId of Object.keys(this.branchMetadata)) {
      const metadata = this.branchMetadata[branchId];
      if (metadata.lastAccessedAt < oldestAccessTime) {
        oldestAccessTime = metadata.lastAccessedAt;
        lruBranchId = branchId;
      }
    }

    return lruBranchId;
  }

  /**
   * Enforces the maxBranches limit by evicting least recently used branches
   * Should be called before creating a new branch to ensure space is available
   */
  private enforceBranchLimit(): void {
    while (Object.keys(this.branches).length >= this.config.maxBranches) {
      const lruBranchId = this.findLruBranchId();

      if (lruBranchId) {
        // Remove the branch data and its metadata
        delete this.branches[lruBranchId];
        delete this.branchMetadata[lruBranchId];
      } else {
        // Fallback: remove the first branch if no metadata exists
        const branchIds = Object.keys(this.branches);
        if (branchIds.length > 0) {
          const firstBranchId = branchIds[0];
          delete this.branches[firstBranchId];
          delete this.branchMetadata[firstBranchId];
        } else {
          // No branches to evict
          break;
        }
      }
    }
  }

  /**
   * Enforces the maxThoughtsPerBranch limit on a specific branch
   * Uses FIFO eviction to remove oldest thoughts when limit is exceeded
   * @param branchId - The ID of the branch to enforce limits on
   */
  private enforceBranchThoughtLimit(branchId: string): void {
    const branch = this.branches[branchId];
    if (!branch) {
      return;
    }

    // Use simple FIFO eviction for per-branch limits
    while (branch.length > this.config.maxThoughtsPerBranch) {
      branch.shift();
    }
  }

  private storeThought(thought: ThoughtData): void {
    // If this is a branch, store in the appropriate branch collection
    if (thought.branchId) {
      const branchId = thought.branchId;
      const now = Date.now();

      if (!this.branches[branchId]) {
        // Creating a new branch - enforce limit first
        this.enforceBranchLimit();

        // Initialize branch data and metadata
        this.branches[branchId] = [];
        this.branchMetadata[branchId] = {
          createdAt: now,
          lastAccessedAt: now
        };
      } else {
        // Update last access time for existing branch
        this.branchMetadata[branchId].lastAccessedAt = now;
      }

      this.branches[branchId].push(thought);

      // Enforce per-branch memory bounds
      this.enforceBranchThoughtLimit(branchId);

      // Trigger cleanup if this thought completes a chain
      if (thought.nextThoughtNeeded === false) {
        this.cleanupCompletedChainInBranch(branchId);
      }
    } else {
      // Otherwise store in main thought history
      this.thoughtHistory.push(thought);

      // Trigger cleanup if this thought completes a chain
      // This must happen before enforcing limits to maintain correct indices
      if (thought.nextThoughtNeeded === false) {
        // The chain ends at the last index (just added)
        this.cleanupCompletedChainInHistory(this.thoughtHistory.length - 1);
      }

      // Enforce memory bounds (after cleanup to avoid double-eviction)
      this.enforceThoughtHistoryLimit();
    }
  }

  public processThought(input: unknown): ThoughtData {
    const validatedInput = this.validateThoughtData(input);
    
    // Store the thought for future reference
    this.storeThought(validatedInput);
    
    // Log formatted output to console
    const formattedOutput = this.formatThoughtOutput(validatedInput);
    console.error(formattedOutput);
    
    return validatedInput;
  }
}
