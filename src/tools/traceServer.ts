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

export class TraceServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};
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

  private storeThought(thought: ThoughtData): void {
    // If this is a branch, store in the appropriate branch collection
    if (thought.branchId) {
      if (!this.branches[thought.branchId]) {
        this.branches[thought.branchId] = [];
      }
      this.branches[thought.branchId].push(thought);
    } else {
      // Otherwise store in main thought history
      this.thoughtHistory.push(thought);
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
