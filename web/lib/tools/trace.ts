import { z } from 'zod';

export const traceSchema = {
  thought: z.string(),
  thoughtNumber: z.number().min(1),
  totalThoughts: z.number().min(1),
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.number().min(1).optional(),
  branchFromThought: z.number().min(1).optional(),
  branchId: z.string().optional(),
  needsMoreThoughts: z.boolean().optional(),
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

  // Build response
  let status = '';
  if (isRevision && revisesThought) {
    status = `Revising Thought ${revisesThought}`;
  } else if (branchFromThought && branchId) {
    status = `Branch "${branchId}" from Thought ${branchFromThought}`;
  }

  return {
    thought,
    thoughtNumber,
    totalThoughts,
    nextThoughtNeeded,
    status: status || 'main-thread',
    needsMoreThoughts: needsMoreThoughts || false,
    complete: !nextThoughtNeeded,
  };
}
