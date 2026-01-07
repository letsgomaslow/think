import { describe, it, expect, beforeEach } from 'vitest';
import { TraceServer } from './traceServer.js';

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

    expect(result.status).toBe('success');
    expect(result.data?.thoughtNumber).toBe(1);
    expect(result.data?.totalThoughts).toBe(3);
    expect(result.data?.nextThoughtNeeded).toBe(true);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processThought({
      thought: 'test',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid thoughtNumber type', () => {
    const result = server.processThought({
      thought: 'test',
      thoughtNumber: 'one',
      totalThoughts: 3,
      nextThoughtNeeded: true,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
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

    expect(revision.status).toBe('success');
    expect(revision.data?.isRevision).toBe(true);
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

    expect(branch.status).toBe('success');
    expect(branch.data?.branchId).toBe('alternative-a');
    expect(branch.data?.isBranch).toBe(true);
  });

  it('should handle needsMoreThoughts flag', () => {
    const result = server.processThought({
      thought: 'This needs more exploration',
      thoughtNumber: 3,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      needsMoreThoughts: true,
    });

    expect(result.status).toBe('success');
    expect(result.data?.nextThoughtNeeded).toBe(true);
  });

  it('should process final thought correctly', () => {
    const result = server.processThought({
      thought: 'Final conclusion reached',
      thoughtNumber: 5,
      totalThoughts: 5,
      nextThoughtNeeded: false,
    });

    expect(result.status).toBe('success');
    expect(result.data?.nextThoughtNeeded).toBe(false);
  });
});
