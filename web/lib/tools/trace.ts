import { z } from 'zod';

export const traceSchema = {
  thought: z.string()
    .min(1, 'Thought cannot be empty')
    .describe('The current thinking step or reasoning content'),
  thoughtNumber: z.number()
    .int('Thought number must be an integer')
    .min(1, 'Thought number must be at least 1')
    .describe('Current thought number in the sequence (1-indexed)'),
  totalThoughts: z.number()
    .int('Total thoughts must be an integer')
    .min(1, 'Total thoughts must be at least 1')
    .describe('Estimated total number of thoughts needed (can be adjusted)'),
  nextThoughtNeeded: z.boolean()
    .describe('Whether another thought is needed to continue reasoning'),
  isRevision: z.boolean()
    .optional()
    .describe('Whether this thought revises a previous thought'),
  revisesThought: z.number()
    .int('Revises thought must be an integer')
    .min(1, 'Revises thought must be at least 1')
    .optional()
    .describe('The thought number being revised (required if isRevision is true)'),
  branchFromThought: z.number()
    .int('Branch from thought must be an integer')
    .min(1, 'Branch from thought must be at least 1')
    .optional()
    .describe('The thought number to branch from for alternative reasoning paths'),
  branchId: z.string()
    .min(1, 'Branch ID cannot be empty')
    .optional()
    .describe('Unique identifier for this reasoning branch'),
  needsMoreThoughts: z.boolean()
    .optional()
    .describe('Indicates if more thoughts are needed beyond the initial estimate'),
};

interface TraceInput {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
}

// In-memory thought history (per-session for serverless)
const thoughtHistory: TraceInput[] = [];
const branches: Record<string, TraceInput[]> = {};

export async function handleTrace(args: TraceInput) {
  const {
    thought,
    thoughtNumber,
    totalThoughts,
    nextThoughtNeeded,
    isRevision,
    revisesThought,
    branchFromThought,
    branchId,
    needsMoreThoughts,
  } = args;

  // Store the thought
  if (branchId) {
    if (!branches[branchId]) {
      branches[branchId] = [];
    }
    branches[branchId].push(args);
  } else {
    thoughtHistory.push(args);
  }

  // Build status string for human readability
  let status = 'main-thread';
  if (isRevision && revisesThought) {
    status = `Revising Thought ${revisesThought}`;
  } else if (branchFromThought && branchId) {
    status = `Branch "${branchId}" from Thought ${branchFromThought}`;
  }

  // Return all fields including optional ones for UI consumption
  return {
    thought,
    thoughtNumber,
    totalThoughts,
    nextThoughtNeeded,
    // Echo back optional fields for structured UI rendering
    ...(isRevision !== undefined && { isRevision }),
    ...(revisesThought !== undefined && { revisesThought }),
    ...(branchFromThought !== undefined && { branchFromThought }),
    ...(branchId !== undefined && { branchId }),
    // Computed fields
    status,
    needsMoreThoughts: needsMoreThoughts || false,
    complete: !nextThoughtNeeded,
  };
}
