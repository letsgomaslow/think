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
}

/**
 * Default configuration values for TraceServer
 */
export const DEFAULT_TRACE_SERVER_CONFIG: Readonly<TraceServerConfig> = {
  maxThoughtHistory: 1000,
  maxBranches: 50,
  maxThoughtsPerBranch: 200,
  enableAutoCleanup: true,
  cleanupOnComplete: true
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

export class TraceServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};
  private branchMetadata: Record<string, BranchMetadata> = {};
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
    } else {
      // Otherwise store in main thought history
      this.thoughtHistory.push(thought);

      // Enforce memory bounds
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
