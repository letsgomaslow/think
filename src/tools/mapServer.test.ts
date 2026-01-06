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

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid visual reasoning data', () => {
    const result = server.processVisualReasoning(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.operation).toBe('create');
    expect(parsed.diagramId).toBe('diagram-1');
    expect(parsed.diagramType).toBe('flowchart');
    expect(parsed.elementCount).toBe(3);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processVisualReasoning({
      operation: 'create',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      iteration: -1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid nextOperationNeeded type', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      nextOperationNeeded: 'yes',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
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
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.operation).toBe(operation);
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
      'sequenceDiagram',
      'stateMachine',
      'erDiagram',
      'mindMap',
      'contextDiagram',
    ] as const;

    diagramTypes.forEach(diagramType => {
      const result = server.processVisualReasoning({
        ...validInput,
        diagramType,
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.diagramType).toBe(diagramType);
    });
  });

  it('should include mermaidOutput when elements are provided', () => {
    const result = server.processVisualReasoning(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.mermaidOutput).toBeDefined();
    expect(typeof parsed.mermaidOutput).toBe('string');
    expect(parsed.mermaidOutput.length).toBeGreaterThan(0);
  });

  it('should include mermaidOutput for sequenceDiagram', () => {
    const input = {
      operation: 'create' as const,
      diagramId: 'seq-1',
      diagramType: 'sequenceDiagram' as const,
      iteration: 0,
      nextOperationNeeded: true,
      elements: [
        {
          id: 'participant-1',
          type: 'node' as const,
          label: 'Client',
          properties: {},
        },
        {
          id: 'participant-2',
          type: 'node' as const,
          label: 'Server',
          properties: {},
        },
        {
          id: 'msg-1',
          type: 'edge' as const,
          source: 'participant-1',
          target: 'participant-2',
          label: 'Request',
          properties: { arrowType: '->>' },
        },
      ],
    };

    const result = server.processVisualReasoning(input);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.mermaidOutput).toBeDefined();
    expect(parsed.mermaidOutput).toContain('sequenceDiagram');
    expect(parsed.mermaidOutput).toContain('participant');
  });

  it('should include mermaidOutput for stateMachine', () => {
    const input = {
      operation: 'create' as const,
      diagramId: 'state-1',
      diagramType: 'stateMachine' as const,
      iteration: 0,
      nextOperationNeeded: true,
      elements: [
        {
          id: 'state-1',
          type: 'node' as const,
          label: 'Idle',
          properties: { isStart: true },
        },
        {
          id: 'state-2',
          type: 'node' as const,
          label: 'Processing',
          properties: {},
        },
        {
          id: 'trans-1',
          type: 'edge' as const,
          source: 'state-1',
          target: 'state-2',
          label: 'start',
          properties: {},
        },
      ],
    };

    const result = server.processVisualReasoning(input);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.mermaidOutput).toBeDefined();
    expect(parsed.mermaidOutput).toContain('stateDiagram-v2');
    expect(parsed.mermaidOutput).toContain('[*]');
  });

  it('should include mermaidOutput for erDiagram', () => {
    const input = {
      operation: 'create' as const,
      diagramId: 'er-1',
      diagramType: 'erDiagram' as const,
      iteration: 0,
      nextOperationNeeded: true,
      elements: [
        {
          id: 'user',
          type: 'node' as const,
          label: 'User',
          properties: {
            attributes: ['id', 'name', 'email'],
          },
        },
        {
          id: 'order',
          type: 'node' as const,
          label: 'Order',
          properties: {
            attributes: ['id', 'total'],
          },
        },
        {
          id: 'rel-1',
          type: 'edge' as const,
          source: 'user',
          target: 'order',
          label: 'places',
          properties: { cardinality: '||--o{' },
        },
      ],
    };

    const result = server.processVisualReasoning(input);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.mermaidOutput).toBeDefined();
    expect(parsed.mermaidOutput).toContain('erDiagram');
    expect(parsed.mermaidOutput).toContain('User');
    expect(parsed.mermaidOutput).toContain('Order');
  });

  it('should include mermaidOutput for mindMap', () => {
    const input = {
      operation: 'create' as const,
      diagramId: 'mind-1',
      diagramType: 'mindMap' as const,
      iteration: 0,
      nextOperationNeeded: true,
      elements: [
        {
          id: 'root',
          type: 'node' as const,
          label: 'Main Idea',
          properties: {},
          contains: ['child-1', 'child-2'],
        },
        {
          id: 'child-1',
          type: 'node' as const,
          label: 'Subtopic 1',
          properties: {},
        },
        {
          id: 'child-2',
          type: 'node' as const,
          label: 'Subtopic 2',
          properties: {},
        },
      ],
    };

    const result = server.processVisualReasoning(input);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.mermaidOutput).toBeDefined();
    expect(parsed.mermaidOutput).toContain('mindmap');
    expect(parsed.mermaidOutput).toContain('Main Idea');
  });

  it('should include mermaidOutput for contextDiagram', () => {
    const input = {
      operation: 'create' as const,
      diagramId: 'context-1',
      diagramType: 'contextDiagram' as const,
      iteration: 0,
      nextOperationNeeded: true,
      elements: [
        {
          id: 'user',
          type: 'node' as const,
          label: 'User',
          properties: { nodeType: 'Person' },
        },
        {
          id: 'system',
          type: 'node' as const,
          label: 'My System',
          properties: { nodeType: 'System' },
        },
        {
          id: 'rel-1',
          type: 'edge' as const,
          source: 'user',
          target: 'system',
          label: 'Uses',
          properties: {},
        },
      ],
    };

    const result = server.processVisualReasoning(input);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.mermaidOutput).toBeDefined();
    expect(parsed.mermaidOutput).toContain('C4Context');
    expect(parsed.mermaidOutput).toContain('Person');
  });

  it('should handle transform operations', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      operation: 'transform',
      transformationType: 'rotate',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.operation).toBe('transform');
  });

  it('should handle observations and insights', () => {
    const result = server.processVisualReasoning({
      ...validInput,
      operation: 'observe',
      observation: 'The flow has a bottleneck',
      insight: 'Add parallel processing',
      hypothesis: 'Parallelization will improve throughput',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
  });
});
