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

  describe('State Persistence', () => {
    describe('Diagram Operation Storage', () => {
      it('should store multiple operations for the same diagram', () => {
        const diagramId = 'persistent-diagram-1';

        // First operation: create initial elements
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
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
          ],
        });

        // Second operation: update existing element
        server.processVisualReasoning({
          operation: 'update' as const,
          diagramId,
          diagramType: 'flowchart' as const,
          iteration: 1,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'node-1',
              type: 'node' as const,
              label: 'Start Process',
              properties: { color: 'blue' },
            },
          ],
        });

        // Third operation: create additional element
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'flowchart' as const,
          iteration: 2,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'node-2',
              type: 'node' as const,
              label: 'End',
              properties: { color: 'red' },
            },
          ],
        });

        const history = server.getDiagramHistory(diagramId);
        expect(history).toHaveLength(3);
        expect(history[0].iteration).toBe(0);
        expect(history[0].operation).toBe('create');
        expect(history[1].iteration).toBe(1);
        expect(history[1].operation).toBe('update');
        expect(history[2].iteration).toBe(2);
        expect(history[2].operation).toBe('create');
      });

      it('should maintain separate state for different diagrams', () => {
        const diagram1 = 'diagram-alpha';
        const diagram2 = 'diagram-beta';

        // Add operations to diagram 1
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId: diagram1,
          diagramType: 'flowchart' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'node-a1',
              type: 'node' as const,
              label: 'Node A1',
              properties: {},
            },
          ],
        });
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId: diagram1,
          diagramType: 'flowchart' as const,
          iteration: 1,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'node-a2',
              type: 'node' as const,
              label: 'Node A2',
              properties: {},
            },
          ],
        });

        // Add operations to diagram 2
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId: diagram2,
          diagramType: 'graph' as const,
          iteration: 0,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'node-b1',
              type: 'node' as const,
              label: 'Node B1',
              properties: {},
            },
          ],
        });

        const history1 = server.getDiagramHistory(diagram1);
        const history2 = server.getDiagramHistory(diagram2);

        expect(history1).toHaveLength(2);
        expect(history2).toHaveLength(1);
        expect(history1[0].diagramId).toBe(diagram1);
        expect(history1[0].diagramType).toBe('flowchart');
        expect(history2[0].diagramId).toBe(diagram2);
        expect(history2[0].diagramType).toBe('graph');
      });

      it('should return empty array for non-existent diagram', () => {
        const history = server.getDiagramHistory('non-existent-diagram');
        expect(history).toEqual([]);
      });
    });

    describe('Element State Aggregation', () => {
      it('should aggregate element state across create operations', () => {
        const diagramId = 'element-aggregation-test';

        // Create first element
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'graph' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'elem-1',
              type: 'node' as const,
              label: 'First Node',
              properties: { x: 0, y: 0 },
            },
          ],
        });

        // Create second element
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'graph' as const,
          iteration: 1,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'elem-2',
              type: 'node' as const,
              label: 'Second Node',
              properties: { x: 100, y: 100 },
            },
          ],
        });

        const state = server.getCurrentDiagramState(diagramId);

        expect(state.totalOperations).toBe(2);
        expect(Object.keys(state.elements)).toHaveLength(2);
        expect(state.elements['elem-1']).toBeDefined();
        expect(state.elements['elem-1'].label).toBe('First Node');
        expect(state.elements['elem-2']).toBeDefined();
        expect(state.elements['elem-2'].label).toBe('Second Node');
      });

      it('should update element properties correctly', () => {
        const diagramId = 'update-test';

        // Create element
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'flowchart' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'updatable',
              type: 'node' as const,
              label: 'Original Label',
              properties: { color: 'red', size: 10 },
            },
          ],
        });

        // Update element
        server.processVisualReasoning({
          operation: 'update' as const,
          diagramId,
          diagramType: 'flowchart' as const,
          iteration: 1,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'updatable',
              type: 'node' as const,
              label: 'Updated Label',
              properties: { color: 'blue', opacity: 0.8 },
            },
          ],
        });

        const state = server.getCurrentDiagramState(diagramId);

        expect(state.elements['updatable']).toBeDefined();
        expect(state.elements['updatable'].label).toBe('Updated Label');
        // Update should merge properties
        expect(state.elements['updatable'].properties.color).toBe('blue');
        expect(state.elements['updatable'].properties.size).toBe(10); // Original property retained
        expect(state.elements['updatable'].properties.opacity).toBe(0.8); // New property added
      });

      it('should delete elements correctly', () => {
        const diagramId = 'delete-test';

        // Create two elements
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'conceptMap' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'keep-me',
              type: 'node' as const,
              label: 'Keep',
              properties: {},
            },
            {
              id: 'delete-me',
              type: 'node' as const,
              label: 'Delete',
              properties: {},
            },
          ],
        });

        // Delete one element
        server.processVisualReasoning({
          operation: 'delete' as const,
          diagramId,
          diagramType: 'conceptMap' as const,
          iteration: 1,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'delete-me',
              type: 'node' as const,
              properties: {},
            },
          ],
        });

        const state = server.getCurrentDiagramState(diagramId);

        expect(Object.keys(state.elements)).toHaveLength(1);
        expect(state.elements['keep-me']).toBeDefined();
        expect(state.elements['delete-me']).toBeUndefined();
      });

      it('should handle transform operations', () => {
        const diagramId = 'transform-test';

        // Create element
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'treeDiagram' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'transformable',
              type: 'node' as const,
              label: 'Transform Me',
              properties: { angle: 0, scale: 1 },
            },
          ],
        });

        // Transform element
        server.processVisualReasoning({
          operation: 'transform' as const,
          diagramId,
          diagramType: 'treeDiagram' as const,
          iteration: 1,
          nextOperationNeeded: false,
          transformationType: 'rotate' as const,
          elements: [
            {
              id: 'transformable',
              type: 'node' as const,
              properties: { angle: 45 },
            },
          ],
        });

        const state = server.getCurrentDiagramState(diagramId);

        expect(state.elements['transformable']).toBeDefined();
        expect(state.elements['transformable'].properties.angle).toBe(45);
        expect(state.elements['transformable'].properties.scale).toBe(1); // Original property retained
      });

      it('should not change state on observe operations', () => {
        const diagramId = 'observe-test';

        // Create element
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'stateDiagram' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'observed',
              type: 'node' as const,
              label: 'Observe Me',
              properties: { value: 42 },
            },
          ],
        });

        // Observe (shouldn't change state)
        server.processVisualReasoning({
          operation: 'observe' as const,
          diagramId,
          diagramType: 'stateDiagram' as const,
          iteration: 1,
          nextOperationNeeded: false,
          observation: 'Element looks good',
          insight: 'No changes needed',
        });

        const state = server.getCurrentDiagramState(diagramId);

        expect(state.totalOperations).toBe(2);
        expect(Object.keys(state.elements)).toHaveLength(1);
        expect(state.elements['observed'].label).toBe('Observe Me');
        expect(state.elements['observed'].properties.value).toBe(42);
      });

      it('should handle complex operation sequences', () => {
        const diagramId = 'complex-sequence-test';

        // Create three elements
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
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
              label: 'Process',
              properties: { color: 'blue' },
            },
            {
              id: 'node-3',
              type: 'node' as const,
              label: 'End',
              properties: { color: 'red' },
            },
          ],
        });

        // Update node-2
        server.processVisualReasoning({
          operation: 'update' as const,
          diagramId,
          diagramType: 'flowchart' as const,
          iteration: 1,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'node-2',
              type: 'node' as const,
              label: 'Complex Process',
              properties: { color: 'purple', complexity: 'high' },
            },
          ],
        });

        // Delete node-3
        server.processVisualReasoning({
          operation: 'delete' as const,
          diagramId,
          diagramType: 'flowchart' as const,
          iteration: 2,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'node-3',
              type: 'node' as const,
              properties: {},
            },
          ],
        });

        // Create new node-4 and edge
        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'flowchart' as const,
          iteration: 3,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'node-4',
              type: 'node' as const,
              label: 'New End',
              properties: { color: 'orange' },
            },
            {
              id: 'edge-1',
              type: 'edge' as const,
              source: 'node-2',
              target: 'node-4',
              properties: {},
            },
          ],
        });

        const state = server.getCurrentDiagramState(diagramId);

        expect(state.totalOperations).toBe(4);
        expect(state.lastOperation).toBe('create');
        expect(state.lastIteration).toBe(3);
        expect(Object.keys(state.elements)).toHaveLength(4); // node-1, node-2, node-4, edge-1

        // Verify node-1 unchanged
        expect(state.elements['node-1'].label).toBe('Start');
        expect(state.elements['node-1'].properties.color).toBe('green');

        // Verify node-2 updated
        expect(state.elements['node-2'].label).toBe('Complex Process');
        expect(state.elements['node-2'].properties.color).toBe('purple');
        expect(state.elements['node-2'].properties.complexity).toBe('high');

        // Verify node-3 deleted
        expect(state.elements['node-3']).toBeUndefined();

        // Verify node-4 and edge-1 created
        expect(state.elements['node-4'].label).toBe('New End');
        expect(state.elements['edge-1'].source).toBe('node-2');
        expect(state.elements['edge-1'].target).toBe('node-4');
      });
    });

    describe('getCurrentDiagramState', () => {
      it('should return correct metadata for diagram', () => {
        const diagramId = 'metadata-test';

        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'conceptMap' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'concept-1',
              type: 'node' as const,
              label: 'Main Concept',
              properties: {},
            },
          ],
        });

        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'conceptMap' as const,
          iteration: 1,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'concept-2',
              type: 'node' as const,
              label: 'Related Concept',
              properties: {},
            },
          ],
        });

        const state = server.getCurrentDiagramState(diagramId);

        expect(state.diagramId).toBe(diagramId);
        expect(state.diagramType).toBe('conceptMap');
        expect(state.totalOperations).toBe(2);
        expect(state.lastOperation).toBe('create');
        expect(state.lastIteration).toBe(1);
      });

      it('should return empty state for non-existent diagram', () => {
        const state = server.getCurrentDiagramState('non-existent');

        expect(state.diagramId).toBe('non-existent');
        expect(state.diagramType).toBeNull();
        expect(state.totalOperations).toBe(0);
        expect(state.elements).toEqual({});
        expect(state.lastOperation).toBeNull();
        expect(state.lastIteration).toBeNull();
      });
    });

    describe('Data Preservation', () => {
      it('should preserve all operation data in history', () => {
        const diagramId = 'full-data-preservation';

        const fullOperation = {
          operation: 'create' as const,
          diagramId,
          diagramType: 'custom' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'container-1',
              type: 'container' as const,
              label: 'Main Container',
              properties: { backgroundColor: 'lightgray', padding: 10 },
              contains: ['node-1', 'node-2'],
            },
            {
              id: 'node-1',
              type: 'node' as const,
              label: 'Child Node 1',
              properties: { color: 'red', size: 5 },
            },
            {
              id: 'edge-1',
              type: 'edge' as const,
              source: 'node-1',
              target: 'node-2',
              properties: { lineStyle: 'dashed', weight: 2 },
            },
            {
              id: 'annotation-1',
              type: 'annotation' as const,
              label: 'Important note',
              properties: { fontSize: 12, fontStyle: 'italic' },
            },
          ],
          observation: 'Initial diagram structure created',
          insight: 'Container grouping improves organization',
          hypothesis: 'Hierarchical layout will enhance readability',
        };

        server.processVisualReasoning(fullOperation);

        const history = server.getDiagramHistory(diagramId);
        expect(history).toHaveLength(1);

        const stored = history[0];
        expect(stored.operation).toBe('create');
        expect(stored.diagramId).toBe(diagramId);
        expect(stored.diagramType).toBe('custom');
        expect(stored.iteration).toBe(0);
        expect(stored.nextOperationNeeded).toBe(true);
        expect(stored.observation).toBe('Initial diagram structure created');
        expect(stored.insight).toBe('Container grouping improves organization');
        expect(stored.hypothesis).toBe('Hierarchical layout will enhance readability');

        // Verify all elements preserved
        expect(stored.elements).toHaveLength(4);

        const container = stored.elements!.find(e => e.id === 'container-1');
        expect(container).toBeDefined();
        expect(container!.type).toBe('container');
        expect(container!.label).toBe('Main Container');
        expect(container!.properties.backgroundColor).toBe('lightgray');
        expect(container!.contains).toEqual(['node-1', 'node-2']);

        const node = stored.elements!.find(e => e.id === 'node-1');
        expect(node).toBeDefined();
        expect(node!.type).toBe('node');
        expect(node!.properties.color).toBe('red');

        const edge = stored.elements!.find(e => e.id === 'edge-1');
        expect(edge).toBeDefined();
        expect(edge!.type).toBe('edge');
        expect(edge!.source).toBe('node-1');
        expect(edge!.target).toBe('node-2');
        expect(edge!.properties.lineStyle).toBe('dashed');

        const annotation = stored.elements!.find(e => e.id === 'annotation-1');
        expect(annotation).toBeDefined();
        expect(annotation!.type).toBe('annotation');
        expect(annotation!.label).toBe('Important note');
      });

      it('should preserve transform operations with transformation type', () => {
        const diagramId = 'transform-preservation';

        server.processVisualReasoning({
          operation: 'create' as const,
          diagramId,
          diagramType: 'graph' as const,
          iteration: 0,
          nextOperationNeeded: true,
          elements: [
            {
              id: 'node-t',
              type: 'node' as const,
              label: 'Transform Test',
              properties: { angle: 0 },
            },
          ],
        });

        server.processVisualReasoning({
          operation: 'transform' as const,
          diagramId,
          diagramType: 'graph' as const,
          iteration: 1,
          nextOperationNeeded: false,
          transformationType: 'rotate' as const,
          elements: [
            {
              id: 'node-t',
              type: 'node' as const,
              properties: { angle: 90 },
            },
          ],
        });

        const history = server.getDiagramHistory(diagramId);
        expect(history).toHaveLength(2);

        const transformOp = history[1];
        expect(transformOp.operation).toBe('transform');
        expect(transformOp.transformationType).toBe('rotate');
        expect(transformOp.elements![0].properties.angle).toBe(90);
      });
    });
  });
});
