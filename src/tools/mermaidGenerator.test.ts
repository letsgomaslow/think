import { describe, it, expect, beforeEach } from 'vitest';
import { MermaidGenerator } from './mermaidGenerator.js';
import { VisualElement } from '../models/interfaces.js';

describe('MermaidGenerator', () => {
  let generator: MermaidGenerator;

  beforeEach(() => {
    generator = new MermaidGenerator();
  });

  describe('generate', () => {
    it('should return empty string for empty elements array', () => {
      const result = generator.generate('flowchart', []);
      expect(result).toBe('');
    });

    it('should return empty string for undefined elements', () => {
      const result = generator.generate('flowchart', undefined as any);
      expect(result).toBe('');
    });

    it('should delegate to correct diagram type method', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: 'Test',
          properties: {},
        },
      ];

      const flowchartResult = generator.generate('flowchart', elements);
      expect(flowchartResult).toContain('flowchart LR');

      const graphResult = generator.generate('graph', elements);
      expect(graphResult).toContain('graph TD');
    });
  });

  describe('generateSequenceDiagram', () => {
    it('should generate valid Mermaid sequenceDiagram syntax', () => {
      const elements: VisualElement[] = [
        {
          id: 'client',
          type: 'node',
          label: 'Client',
          properties: {},
        },
        {
          id: 'server',
          type: 'node',
          label: 'Server',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'client',
          target: 'server',
          label: 'Request',
          properties: {},
        },
        {
          id: 'edge2',
          type: 'edge',
          source: 'server',
          target: 'client',
          label: 'Response',
          properties: { arrowType: '-->>' },
        },
      ];

      const result = generator.generate('sequenceDiagram', elements);

      expect(result).toContain('sequenceDiagram');
      expect(result).toContain('participant client as Client');
      expect(result).toContain('participant server as Server');
      expect(result).toContain('client->>server: Request');
      expect(result).toContain('server-->>client: Response');
    });

    it('should sanitize node IDs with special characters', () => {
      const elements: VisualElement[] = [
        {
          id: 'my-client',
          type: 'node',
          label: 'My Client',
          properties: {},
        },
        {
          id: 'api server',
          type: 'node',
          label: 'API Server',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'my-client',
          target: 'api server',
          label: 'Call API',
          properties: {},
        },
      ];

      const result = generator.generate('sequenceDiagram', elements);

      expect(result).toContain('participant my_client as My Client');
      expect(result).toContain('participant api_server as API Server');
      expect(result).toContain('my_client->>api_server: Call API');
    });

    it('should handle edges without labels', () => {
      const elements: VisualElement[] = [
        {
          id: 'a',
          type: 'node',
          label: 'A',
          properties: {},
        },
        {
          id: 'b',
          type: 'node',
          label: 'B',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'a',
          target: 'b',
          properties: {},
        },
      ];

      const result = generator.generate('sequenceDiagram', elements);

      expect(result).toContain('a->>b: ');
    });
  });

  describe('generateStateMachine', () => {
    it('should generate valid Mermaid stateDiagram-v2 syntax', () => {
      const elements: VisualElement[] = [
        {
          id: 'idle',
          type: 'node',
          label: 'Idle State',
          properties: { isStart: true },
        },
        {
          id: 'processing',
          type: 'node',
          label: 'Processing',
          properties: {},
        },
        {
          id: 'done',
          type: 'node',
          label: 'Done',
          properties: { isEnd: true },
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'idle',
          target: 'processing',
          label: 'start',
          properties: {},
        },
        {
          id: 'edge2',
          type: 'edge',
          source: 'processing',
          target: 'done',
          label: 'complete',
          properties: {},
        },
      ];

      const result = generator.generate('stateMachine', elements);

      expect(result).toContain('stateDiagram-v2');
      expect(result).toContain('[*] --> idle');
      expect(result).toContain('idle: Idle State');
      expect(result).toContain('done --> [*]');
      expect(result).toContain('idle --> processing: start');
      expect(result).toContain('processing --> done: complete');
    });

    it('should handle states without labels', () => {
      const elements: VisualElement[] = [
        {
          id: 'state1',
          type: 'node',
          properties: {},
        },
        {
          id: 'state2',
          type: 'node',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'state1',
          target: 'state2',
          properties: {},
        },
      ];

      const result = generator.generate('stateMachine', elements);

      expect(result).not.toContain('state1: ');
      expect(result).toContain('state1 --> state2');
    });

    it('should handle transitions without labels', () => {
      const elements: VisualElement[] = [
        {
          id: 'a',
          type: 'node',
          label: 'State A',
          properties: {},
        },
        {
          id: 'b',
          type: 'node',
          label: 'State B',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'a',
          target: 'b',
          properties: {},
        },
      ];

      const result = generator.generate('stateMachine', elements);

      expect(result).toContain('a --> b');
      expect(result).not.toContain('a --> b:');
    });
  });

  describe('generateERDiagram', () => {
    it('should generate valid Mermaid erDiagram syntax', () => {
      const elements: VisualElement[] = [
        {
          id: 'User',
          type: 'node',
          label: 'User',
          properties: {
            attributes: [
              { name: 'id', type: 'int', key: true },
              { name: 'name', type: 'string' },
              { name: 'email', type: 'string' },
            ],
          },
        },
        {
          id: 'Order',
          type: 'node',
          label: 'Order',
          properties: {
            attributes: [
              { name: 'id', type: 'int', key: true },
              { name: 'userId', type: 'int' },
              { name: 'total', type: 'decimal' },
            ],
          },
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'User',
          target: 'Order',
          label: 'places',
          properties: { cardinality: '||--o{' },
        },
      ];

      const result = generator.generate('erDiagram', elements);

      expect(result).toContain('erDiagram');
      expect(result).toContain('User {');
      expect(result).toContain('int id PK');
      expect(result).toContain('string name');
      expect(result).toContain('string email');
      expect(result).toContain('Order {');
      expect(result).toContain('int id PK');
      expect(result).toContain('int userId');
      expect(result).toContain('decimal total');
      expect(result).toContain('User ||--o{ Order : "places"');
    });

    it('should handle entities without attributes', () => {
      const elements: VisualElement[] = [
        {
          id: 'Entity1',
          type: 'node',
          label: 'Entity1',
          properties: {},
        },
      ];

      const result = generator.generate('erDiagram', elements);

      expect(result).toContain('Entity1 {');
      expect(result).toContain('}');
    });

    it('should handle simple attribute arrays', () => {
      const elements: VisualElement[] = [
        {
          id: 'Simple',
          type: 'node',
          label: 'Simple',
          properties: {
            attributes: ['field1', 'field2'],
          },
        },
      ];

      const result = generator.generate('erDiagram', elements);

      expect(result).toContain('string field1');
      expect(result).toContain('string field2');
    });

    it('should use default cardinality when not specified', () => {
      const elements: VisualElement[] = [
        {
          id: 'A',
          type: 'node',
          properties: {},
        },
        {
          id: 'B',
          type: 'node',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'A',
          target: 'B',
          label: 'relates',
          properties: {},
        },
      ];

      const result = generator.generate('erDiagram', elements);

      expect(result).toContain('A ||--o{ B : "relates"');
    });

    it('should handle relationships without labels', () => {
      const elements: VisualElement[] = [
        {
          id: 'A',
          type: 'node',
          properties: {},
        },
        {
          id: 'B',
          type: 'node',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'A',
          target: 'B',
          properties: {},
        },
      ];

      const result = generator.generate('erDiagram', elements);

      expect(result).toContain('A ||--o{ B');
      expect(result).not.toContain(': ""');
    });
  });

  describe('generateMindMap', () => {
    it('should generate valid Mermaid mindmap syntax', () => {
      const elements: VisualElement[] = [
        {
          id: 'root',
          type: 'node',
          label: 'Central Idea',
          properties: { isRoot: true, shape: 'circle' },
          contains: ['child1', 'child2'],
        },
        {
          id: 'child1',
          type: 'node',
          label: 'Branch 1',
          properties: { shape: 'square' },
          contains: ['grandchild1'],
        },
        {
          id: 'child2',
          type: 'node',
          label: 'Branch 2',
          properties: { shape: 'cloud' },
        },
        {
          id: 'grandchild1',
          type: 'node',
          label: 'Sub-branch',
          properties: {},
        },
      ];

      const result = generator.generate('mindMap', elements);

      expect(result).toContain('mindmap');
      expect(result).toContain('((Central Idea))');
      expect(result).toContain('[Branch 1]');
      expect(result).toContain(')Branch 2(');
      expect(result).toContain('Sub-branch');
    });

    it('should use first node as root when no root is marked', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: 'First Node',
          properties: {},
        },
        {
          id: 'node2',
          type: 'node',
          label: 'Second Node',
          properties: {},
        },
      ];

      const result = generator.generate('mindMap', elements);

      expect(result).toContain('mindmap');
      expect(result).toContain('First Node');
    });

    it('should handle empty elements with default root', () => {
      const result = generator.generate('mindMap', []);

      expect(result).toBe('');
    });

    it('should prevent circular references', () => {
      const elements: VisualElement[] = [
        {
          id: 'root',
          type: 'node',
          label: 'Root',
          properties: { isRoot: true },
          contains: ['root'],
        },
      ];

      const result = generator.generate('mindMap', elements);

      expect(result).toContain('mindmap');
      expect(result).toContain('Root');
    });

    it('should handle default shape for nodes', () => {
      const elements: VisualElement[] = [
        {
          id: 'root',
          type: 'node',
          label: 'Plain Text',
          properties: { isRoot: true },
        },
      ];

      const result = generator.generate('mindMap', elements);

      expect(result).toContain('Plain Text');
      expect(result).not.toContain('((Plain Text))');
      expect(result).not.toContain('[Plain Text]');
    });
  });

  describe('generateContextDiagram', () => {
    it('should generate valid Mermaid C4Context syntax', () => {
      const elements: VisualElement[] = [
        {
          id: 'user',
          type: 'node',
          label: 'User',
          properties: {
            nodeType: 'Person',
            description: 'End user of the system',
          },
        },
        {
          id: 'system',
          type: 'node',
          label: 'Main System',
          properties: {
            nodeType: 'System',
            description: 'Core application',
          },
        },
        {
          id: 'database',
          type: 'node',
          label: 'Database',
          properties: {
            nodeType: 'SystemDb',
            description: 'Data store',
          },
        },
        {
          id: 'external',
          type: 'node',
          label: 'External API',
          properties: {
            nodeType: 'System_Ext',
            description: 'Third-party service',
          },
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'user',
          target: 'system',
          label: 'uses',
          properties: { technology: 'HTTPS' },
        },
        {
          id: 'edge2',
          type: 'edge',
          source: 'system',
          target: 'database',
          label: 'reads/writes',
          properties: { technology: 'SQL' },
        },
        {
          id: 'edge3',
          type: 'edge',
          source: 'system',
          target: 'external',
          label: 'calls',
          properties: {},
        },
      ];

      const result = generator.generate('contextDiagram', elements);

      expect(result).toContain('C4Context');
      expect(result).toContain('title System Context Diagram');
      expect(result).toContain('Person(user, "User", "End user of the system")');
      expect(result).toContain('System(system, "Main System", "Core application")');
      expect(result).toContain('SystemDb(database, "Database", "Data store")');
      expect(result).toContain('System_Ext(external, "External API", "Third-party service")');
      expect(result).toContain('Rel(user, system, "uses", "HTTPS")');
      expect(result).toContain('Rel(system, database, "reads/writes", "SQL")');
      expect(result).toContain('Rel(system, external, "calls", "")');
    });

    it('should default to System when nodeType not specified', () => {
      const elements: VisualElement[] = [
        {
          id: 'unknown',
          type: 'node',
          label: 'Unknown Type',
          properties: {},
        },
      ];

      const result = generator.generate('contextDiagram', elements);

      expect(result).toContain('System(unknown, "Unknown Type", "")');
    });

    it('should use default label when edge has no label', () => {
      const elements: VisualElement[] = [
        {
          id: 'a',
          type: 'node',
          properties: {},
        },
        {
          id: 'b',
          type: 'node',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'a',
          target: 'b',
          properties: {},
        },
      ];

      const result = generator.generate('contextDiagram', elements);

      expect(result).toContain('Rel(a, b, "uses", "")');
    });
  });

  describe('generateGraph', () => {
    it('should generate valid Mermaid graph TD syntax', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: 'First Node',
          properties: { shape: 'circle' },
        },
        {
          id: 'node2',
          type: 'node',
          label: 'Second Node',
          properties: { shape: 'diamond' },
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'node1',
          target: 'node2',
          label: 'connects',
          properties: { arrowType: '-->' },
        },
      ];

      const result = generator.generate('graph', elements);

      expect(result).toContain('graph TD');
      expect(result).toContain('node1((First Node))');
      expect(result).toContain('node2{Second Node}');
      expect(result).toContain('node1 --> |connects| node2');
    });

    it('should handle all supported node shapes', () => {
      const shapes = [
        { shape: 'circle', expected: '((' },
        { shape: 'round', expected: '(' },
        { shape: 'stadium', expected: '([' },
        { shape: 'subroutine', expected: '[[' },
        { shape: 'cylindrical', expected: '[(' },
        { shape: 'diamond', expected: '{' },
        { shape: 'hexagon', expected: '{{' },
        { shape: 'parallelogram', expected: '[/' },
        { shape: 'trapezoid', expected: '[\\' },
      ];

      shapes.forEach(({ shape, expected }) => {
        const elements: VisualElement[] = [
          {
            id: 'node1',
            type: 'node',
            label: 'Test',
            properties: { shape },
          },
        ];

        const result = generator.generate('graph', elements);
        expect(result).toContain(expected);
      });
    });

    it('should use default square brackets when shape not specified', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: 'Default',
          properties: {},
        },
      ];

      const result = generator.generate('graph', elements);

      expect(result).toContain('node1[Default]');
    });

    it('should handle edges without labels', () => {
      const elements: VisualElement[] = [
        {
          id: 'a',
          type: 'node',
          properties: {},
        },
        {
          id: 'b',
          type: 'node',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'a',
          target: 'b',
          properties: {},
        },
      ];

      const result = generator.generate('graph', elements);

      expect(result).toContain('a -->  b');
    });
  });

  describe('generateFlowchart', () => {
    it('should generate valid Mermaid flowchart LR syntax', () => {
      const elements: VisualElement[] = [
        {
          id: 'start',
          type: 'node',
          label: 'Start',
          properties: { shape: 'stadium' },
        },
        {
          id: 'process',
          type: 'node',
          label: 'Process',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'start',
          target: 'process',
          label: 'begin',
          properties: {},
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain('flowchart LR');
      expect(result).toContain('start([Start])');
      expect(result).toContain('process[Process]');
      expect(result).toContain('start --> |begin| process');
    });

    it('should handle custom arrow types', () => {
      const elements: VisualElement[] = [
        {
          id: 'a',
          type: 'node',
          properties: {},
        },
        {
          id: 'b',
          type: 'node',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'a',
          target: 'b',
          properties: { arrowType: '==>' },
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain('a ==>  b');
    });
  });

  describe('generateStateDiagram', () => {
    it('should delegate to generateStateMachine', () => {
      const elements: VisualElement[] = [
        {
          id: 'state1',
          type: 'node',
          label: 'State 1',
          properties: { isStart: true },
        },
      ];

      const result = generator.generate('stateDiagram', elements);

      expect(result).toContain('stateDiagram-v2');
      expect(result).toContain('[*] --> state1');
    });
  });

  describe('generateConceptMap', () => {
    it('should generate graph LR for concept maps', () => {
      const elements: VisualElement[] = [
        {
          id: 'concept1',
          type: 'node',
          label: 'Concept 1',
          properties: {},
        },
        {
          id: 'concept2',
          type: 'node',
          label: 'Concept 2',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'concept1',
          target: 'concept2',
          label: 'relates to',
          properties: {},
        },
      ];

      const result = generator.generate('conceptMap', elements);

      expect(result).toContain('graph LR');
      expect(result).toContain('concept1[Concept 1]');
      expect(result).toContain('concept2[Concept 2]');
      expect(result).toContain('concept1 --> |relates to| concept2');
    });
  });

  describe('generateTreeDiagram', () => {
    it('should generate graph TD for tree diagrams', () => {
      const elements: VisualElement[] = [
        {
          id: 'root',
          type: 'node',
          label: 'Root',
          properties: {},
        },
        {
          id: 'child',
          type: 'node',
          label: 'Child',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'root',
          target: 'child',
          properties: {},
        },
      ];

      const result = generator.generate('treeDiagram', elements);

      expect(result).toContain('graph TD');
      expect(result).toContain('root[Root]');
      expect(result).toContain('child[Child]');
      expect(result).toContain('root --> ');
    });
  });

  describe('generateCustom', () => {
    it('should generate graph LR for custom diagrams', () => {
      const elements: VisualElement[] = [
        {
          id: 'custom1',
          type: 'node',
          label: 'Custom Node',
          properties: { shape: 'hexagon' },
        },
      ];

      const result = generator.generate('custom', elements);

      expect(result).toContain('graph LR');
      expect(result).toContain('custom1{{Custom Node}}');
    });
  });

  describe('edge cases and validation', () => {
    it('should handle nodes without IDs gracefully', () => {
      const elements: VisualElement[] = [
        {
          id: '',
          type: 'node',
          label: 'Empty ID',
          properties: {},
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain('flowchart LR');
    });

    it('should handle edges without source or target', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: 'Node 1',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          properties: {},
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain('flowchart LR');
      expect(result).toContain('node1[Node 1]');
    });

    it('should sanitize IDs with various special characters', () => {
      const elements: VisualElement[] = [
        {
          id: 'node-with-dashes',
          type: 'node',
          label: 'Test',
          properties: {},
        },
        {
          id: 'node with spaces',
          type: 'node',
          label: 'Test2',
          properties: {},
        },
        {
          id: 'node.with.dots',
          type: 'node',
          label: 'Test3',
          properties: {},
        },
        {
          id: 'node@special#chars!',
          type: 'node',
          label: 'Test4',
          properties: {},
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain('node_with_dashes[Test]');
      expect(result).toContain('node_with_spaces[Test2]');
      expect(result).toContain('node_with_dots[Test3]');
      expect(result).toContain('node_special_chars_[Test4]');
    });

    it('should handle mixed element types', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: 'Node',
          properties: {},
        },
        {
          id: 'container1',
          type: 'container',
          label: 'Container',
          properties: {},
        },
        {
          id: 'annotation1',
          type: 'annotation',
          label: 'Note',
          properties: {},
        },
        {
          id: 'edge1',
          type: 'edge',
          source: 'node1',
          target: 'container1',
          properties: {},
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain('flowchart LR');
      expect(result).toContain('node1[Node]');
    });

    it('should return empty string for unknown diagram type', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          properties: {},
        },
      ];

      const result = generator.generate('unknownType' as any, elements);

      expect(result).toBe('');
    });

    it('should handle nodes with label same as ID', () => {
      const elements: VisualElement[] = [
        {
          id: 'SameLabel',
          type: 'node',
          label: 'SameLabel',
          properties: {},
        },
      ];

      const result = generator.generate('stateMachine', elements);

      expect(result).toContain('stateDiagram-v2');
      expect(result).not.toContain('SameLabel: SameLabel');
    });

    it('should handle very long labels', () => {
      const longLabel = 'This is a very long label that contains many words and should still be processed correctly by the Mermaid generator';
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: longLabel,
          properties: {},
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain(longLabel);
    });

    it('should handle labels with special characters', () => {
      const elements: VisualElement[] = [
        {
          id: 'node1',
          type: 'node',
          label: 'Label with "quotes" and \'apostrophes\'',
          properties: {},
        },
      ];

      const result = generator.generate('flowchart', elements);

      expect(result).toContain('Label with "quotes" and \'apostrophes\'');
    });
  });

  describe('complex diagrams', () => {
    it('should handle sequence diagram with multiple participants and messages', () => {
      const elements: VisualElement[] = [
        { id: 'client', type: 'node', label: 'Client', properties: {} },
        { id: 'api', type: 'node', label: 'API Gateway', properties: {} },
        { id: 'service', type: 'node', label: 'Service', properties: {} },
        { id: 'db', type: 'node', label: 'Database', properties: {} },
        { id: 'e1', type: 'edge', source: 'client', target: 'api', label: 'Request', properties: {} },
        { id: 'e2', type: 'edge', source: 'api', target: 'service', label: 'Validate', properties: { arrowType: '->>' } },
        { id: 'e3', type: 'edge', source: 'service', target: 'db', label: 'Query', properties: {} },
        { id: 'e4', type: 'edge', source: 'db', target: 'service', label: 'Data', properties: { arrowType: '-->>' } },
        { id: 'e5', type: 'edge', source: 'service', target: 'api', label: 'Result', properties: { arrowType: '-->>' } },
        { id: 'e6', type: 'edge', source: 'api', target: 'client', label: 'Response', properties: { arrowType: '-->>' } },
      ];

      const result = generator.generate('sequenceDiagram', elements);

      expect(result).toContain('sequenceDiagram');
      expect(result).toContain('participant client as Client');
      expect(result).toContain('participant api as API Gateway');
      expect(result).toContain('participant service as Service');
      expect(result).toContain('participant db as Database');
      expect(result).toContain('client->>api: Request');
      expect(result).toContain('api->>service: Validate');
      expect(result).toContain('service->>db: Query');
      expect(result).toContain('db-->>service: Data');
      expect(result).toContain('service-->>api: Result');
      expect(result).toContain('api-->>client: Response');
    });

    it('should handle ER diagram with multiple entities and relationships', () => {
      const elements: VisualElement[] = [
        {
          id: 'Customer',
          type: 'node',
          properties: {
            attributes: [
              { name: 'customerId', type: 'int', key: true },
              { name: 'name', type: 'string' },
              { name: 'email', type: 'string' },
            ],
          },
        },
        {
          id: 'Order',
          type: 'node',
          properties: {
            attributes: [
              { name: 'orderId', type: 'int', key: true },
              { name: 'customerId', type: 'int' },
              { name: 'orderDate', type: 'date' },
            ],
          },
        },
        {
          id: 'Product',
          type: 'node',
          properties: {
            attributes: [
              { name: 'productId', type: 'int', key: true },
              { name: 'name', type: 'string' },
              { name: 'price', type: 'decimal' },
            ],
          },
        },
        { id: 'e1', type: 'edge', source: 'Customer', target: 'Order', label: 'places', properties: { cardinality: '||--o{' } },
        { id: 'e2', type: 'edge', source: 'Order', target: 'Product', label: 'contains', properties: { cardinality: '}o--o{' } },
      ];

      const result = generator.generate('erDiagram', elements);

      expect(result).toContain('erDiagram');
      expect(result).toContain('Customer {');
      expect(result).toContain('int customerId PK');
      expect(result).toContain('Order {');
      expect(result).toContain('int orderId PK');
      expect(result).toContain('Product {');
      expect(result).toContain('int productId PK');
      expect(result).toContain('Customer ||--o{ Order : "places"');
      expect(result).toContain('Order }o--o{ Product : "contains"');
    });

    it('should handle complex mind map with deep hierarchy', () => {
      const elements: VisualElement[] = [
        {
          id: 'root',
          type: 'node',
          label: 'Project Planning',
          properties: { isRoot: true, shape: 'circle' },
          contains: ['requirements', 'design', 'implementation'],
        },
        {
          id: 'requirements',
          type: 'node',
          label: 'Requirements',
          properties: { shape: 'square' },
          contains: ['functional', 'nonfunctional'],
        },
        {
          id: 'functional',
          type: 'node',
          label: 'Functional',
          properties: {},
        },
        {
          id: 'nonfunctional',
          type: 'node',
          label: 'Non-Functional',
          properties: {},
        },
        {
          id: 'design',
          type: 'node',
          label: 'Design',
          properties: { shape: 'square' },
          contains: ['architecture', 'ui'],
        },
        {
          id: 'architecture',
          type: 'node',
          label: 'Architecture',
          properties: {},
        },
        {
          id: 'ui',
          type: 'node',
          label: 'UI/UX',
          properties: {},
        },
        {
          id: 'implementation',
          type: 'node',
          label: 'Implementation',
          properties: { shape: 'square' },
        },
      ];

      const result = generator.generate('mindMap', elements);

      expect(result).toContain('mindmap');
      expect(result).toContain('((Project Planning))');
      expect(result).toContain('[Requirements]');
      expect(result).toContain('[Design]');
      expect(result).toContain('[Implementation]');
      expect(result).toContain('Functional');
      expect(result).toContain('Non-Functional');
      expect(result).toContain('Architecture');
      expect(result).toContain('UI/UX');
    });

    it('should handle context diagram with all node types', () => {
      const elements: VisualElement[] = [
        { id: 'user', type: 'node', label: 'User', properties: { nodeType: 'Person', description: 'End user' } },
        { id: 'admin', type: 'node', label: 'Admin', properties: { nodeType: 'Person', description: 'Administrator' } },
        { id: 'app', type: 'node', label: 'Application', properties: { nodeType: 'System', description: 'Main app' } },
        { id: 'db', type: 'node', label: 'Database', properties: { nodeType: 'SystemDb', description: 'Data storage' } },
        { id: 'api', type: 'node', label: 'External API', properties: { nodeType: 'System_Ext', description: 'Third party' } },
        { id: 'e1', type: 'edge', source: 'user', target: 'app', label: 'uses', properties: { technology: 'HTTPS' } },
        { id: 'e2', type: 'edge', source: 'admin', target: 'app', label: 'manages', properties: { technology: 'HTTPS' } },
        { id: 'e3', type: 'edge', source: 'app', target: 'db', label: 'persists', properties: { technology: 'PostgreSQL' } },
        { id: 'e4', type: 'edge', source: 'app', target: 'api', label: 'calls', properties: { technology: 'REST' } },
      ];

      const result = generator.generate('contextDiagram', elements);

      expect(result).toContain('C4Context');
      expect(result).toContain('Person(user, "User", "End user")');
      expect(result).toContain('Person(admin, "Admin", "Administrator")');
      expect(result).toContain('System(app, "Application", "Main app")');
      expect(result).toContain('SystemDb(db, "Database", "Data storage")');
      expect(result).toContain('System_Ext(api, "External API", "Third party")');
      expect(result).toContain('Rel(user, app, "uses", "HTTPS")');
      expect(result).toContain('Rel(admin, app, "manages", "HTTPS")');
      expect(result).toContain('Rel(app, db, "persists", "PostgreSQL")');
      expect(result).toContain('Rel(app, api, "calls", "REST")');
    });
  });
});
