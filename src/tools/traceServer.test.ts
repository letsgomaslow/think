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
