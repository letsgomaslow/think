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
