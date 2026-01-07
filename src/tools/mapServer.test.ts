import { describe, it, expect, beforeEach } from 'vitest';
import { MapServer } from './mapServer.js';

describe('MapServer', () => {
  let server: MapServer;

  beforeEach(() => {
    server = new MapServer();
  });

  const validInput = {
    operation: 'create' as const,
    diagramId: 'diagram-1',
    diagramType: 'flowchart' as const,
    iteration: 0,
    nextOperationNeeded: true,
    elements: [
      {
        id: 'node-1',
        type: 'node' as const,
        label: 'Start',
        properties: { color: 'green' },
      },
      {
        id: 'node-2',
        type: 'node' as const,
        label: 'End',
        properties: { color: 'red' },
      },
      {
        id: 'edge-1',
        type: 'edge' as const,
        properties: {},
        source: 'node-1',
        target: 'node-2',
      },
    ],
  };

  it('should process valid visual reasoning data', () => {
    const result = server.processVisualReasoning(validInput);

    expect(result.status).toBe('success');
    expect(result.data?.operation).toBe('create');
    expect(result.data?.diagramId).toBe('diagram-1');
    expect(result.data?.diagramType).toBe('flowchart');
    expect(result.data?.elementCount).toBe(3);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processVisualReasoning({
      operation: 'create',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      iteration: -1,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid nextOperationNeeded type', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      nextOperationNeeded: 'yes',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should handle all operation types', () => {
    const operations = [
      'create',
      'update',
      'delete',
      'transform',
      'observe',
    ] as const;

    operations.forEach(operation => {
      const result = server.processVisualReasoning({
        ...validInput,
        operation,
      });
      expect(result.status).toBe('success');
      expect(result.data?.operation).toBe(operation);
    });
  });

  it('should handle all diagram types', () => {
    const diagramTypes = [
      'graph',
      'flowchart',
      'stateDiagram',
      'conceptMap',
      'treeDiagram',
      'custom',
    ] as const;

    diagramTypes.forEach(diagramType => {
      const result = server.processVisualReasoning({
        ...validInput,
        diagramType,
      });
      expect(result.status).toBe('success');
      expect(result.data?.diagramType).toBe(diagramType);
    });
  });

  it('should handle transform operations', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      operation: 'transform',
      transformationType: 'rotate',
    });

    expect(result.status).toBe('success');
    expect(result.data?.operation).toBe('transform');
  });

  it('should handle observations and insights', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      operation: 'observe',
      observation: 'The flow has a bottleneck',
      insight: 'Add parallel processing',
      hypothesis: 'Parallelization will improve throughput',
    });

    expect(result.status).toBe('success');
  });
});
