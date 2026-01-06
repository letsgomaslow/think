import { describe, it, expect, beforeEach } from 'vitest';
import { TOOL_NAMES } from './toolNames.js';

// Import all servers to verify they load correctly
import { TraceServer } from './tools/traceServer.js';
import { ModelServer } from './tools/modelServer.js';
import { PatternServer } from './tools/patternServer.js';
import { ParadigmServer } from './tools/paradigmServer.js';
import { DebugServer } from './tools/debugServer.js';
import { CouncilServer } from './tools/councilServer.js';
import { DecideServer } from './tools/decideServer.js';
import { ReflectServer } from './tools/reflectServer.js';
import { HypothesisServer } from './tools/hypothesisServer.js';
import { DebateServer } from './tools/debateServer.js';
import { MapServer } from './tools/mapServer.js';

describe('think-mcp Integration', () => {
  describe('Tool Names', () => {
    it('should have exactly 11 tool names', () => {
      const toolNames = Object.values(TOOL_NAMES);
      expect(toolNames).toHaveLength(11);
    });

    it('should have all expected tool names', () => {
      expect(TOOL_NAMES.TRACE).toBe('trace');
      expect(TOOL_NAMES.MODEL).toBe('model');
      expect(TOOL_NAMES.PATTERN).toBe('pattern');
      expect(TOOL_NAMES.PARADIGM).toBe('paradigm');
      expect(TOOL_NAMES.DEBUG).toBe('debug');
      expect(TOOL_NAMES.COUNCIL).toBe('council');
      expect(TOOL_NAMES.DECIDE).toBe('decide');
      expect(TOOL_NAMES.REFLECT).toBe('reflect');
      expect(TOOL_NAMES.HYPOTHESIS).toBe('hypothesis');
      expect(TOOL_NAMES.DEBATE).toBe('debate');
      expect(TOOL_NAMES.MAP).toBe('map');
    });

    it('should have short tool names (max 10 chars)', () => {
      Object.values(TOOL_NAMES).forEach(name => {
        expect(name.length).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Server Instantiation', () => {
    it('should instantiate TraceServer', () => {
      const server = new TraceServer();
      expect(server).toBeDefined();
      expect(typeof server.processThought).toBe('function');
    });

    it('should instantiate ModelServer', () => {
      const server = new ModelServer();
      expect(server).toBeDefined();
      expect(typeof server.processModel).toBe('function');
    });

    it('should instantiate PatternServer', () => {
      const server = new PatternServer();
      expect(server).toBeDefined();
      expect(typeof server.processPattern).toBe('function');
    });

    it('should instantiate ParadigmServer', () => {
      const server = new ParadigmServer();
      expect(server).toBeDefined();
      expect(typeof server.processParadigm).toBe('function');
    });

    it('should instantiate DebugServer', () => {
      const server = new DebugServer();
      expect(server).toBeDefined();
      expect(typeof server.processApproach).toBe('function');
    });

    it('should instantiate CouncilServer', () => {
      const server = new CouncilServer();
      expect(server).toBeDefined();
      expect(typeof server.processCollaborativeReasoning).toBe('function');
    });

    it('should instantiate DecideServer', () => {
      const server = new DecideServer();
      expect(server).toBeDefined();
      expect(typeof server.processDecisionFramework).toBe('function');
    });

    it('should instantiate ReflectServer', () => {
      const server = new ReflectServer();
      expect(server).toBeDefined();
      expect(typeof server.processMetacognitiveMonitoring).toBe('function');
    });

    it('should instantiate HypothesisServer', () => {
      const server = new HypothesisServer();
      expect(server).toBeDefined();
      expect(typeof server.processScientificMethod).toBe('function');
    });

    it('should instantiate DebateServer', () => {
      const server = new DebateServer();
      expect(server).toBeDefined();
      expect(typeof server.processStructuredArgumentation).toBe('function');
    });

    it('should instantiate MapServer', () => {
      const server = new MapServer();
      expect(server).toBeDefined();
      expect(typeof server.processVisualReasoning).toBe('function');
    });
  });

  describe('Error Handling', () => {
    // Servers that throw on invalid input
    it('should throw on invalid input for TraceServer', () => {
      const server = new TraceServer();
      expect(() => server.processThought({})).toThrow();
    });

    it('should throw on invalid input for CouncilServer', () => {
      const server = new CouncilServer();
      expect(() => server.processCollaborativeReasoning({})).toThrow();
    });

    it('should throw on invalid input for DecideServer', () => {
      const server = new DecideServer();
      expect(() => server.processDecisionFramework({})).toThrow();
    });

    // Servers that return error objects instead of throwing
    it('should return error for invalid ModelServer input', () => {
      const server = new ModelServer();
      const result = server.processModel({});
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should return error for invalid PatternServer input', () => {
      const server = new PatternServer();
      const result = server.processPattern({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid ParadigmServer input', () => {
      const server = new ParadigmServer();
      const result = server.processParadigm({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid DebugServer input', () => {
      const server = new DebugServer();
      const result = server.processApproach({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid ReflectServer input', () => {
      const server = new ReflectServer();
      const result = server.processMetacognitiveMonitoring({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid HypothesisServer input', () => {
      const server = new HypothesisServer();
      const result = server.processScientificMethod({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid DebateServer input', () => {
      const server = new DebateServer();
      const result = server.processStructuredArgumentation({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });

    it('should return error for invalid MapServer input', () => {
      const server = new MapServer();
      const result = server.processVisualReasoning({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('failed');
      expect(result.isError).toBe(true);
    });
  });

  describe('MapServer - New Diagram Types Integration', () => {
    let mapServer: MapServer;

    beforeEach(() => {
      mapServer = new MapServer();
    });

    describe('Sequence Diagram', () => {
      it('should process sequenceDiagram with participants and messages', () => {
        const input = {
          operation: 'create',
          diagramId: 'api-flow-001',
          diagramType: 'sequenceDiagram',
          iteration: 0,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'client',
              type: 'node',
              label: 'Client App',
              properties: {}
            },
            {
              id: 'api',
              type: 'node',
              label: 'API Gateway',
              properties: {}
            },
            {
              id: 'auth',
              type: 'node',
              label: 'Auth Service',
              properties: {}
            },
            {
              id: 'msg-1',
              type: 'edge',
              label: 'POST /login',
              source: 'client',
              target: 'api',
              properties: { arrowType: '->>' }
            },
            {
              id: 'msg-2',
              type: 'edge',
              label: 'Validate credentials',
              source: 'api',
              target: 'auth',
              properties: { arrowType: '->>' }
            },
            {
              id: 'msg-3',
              type: 'edge',
              label: 'JWT token',
              source: 'auth',
              target: 'api',
              properties: { arrowType: '-->>' }
            }
          ]
        };

        const result = mapServer.processVisualReasoning(input);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(result.content[0]).toBeDefined();
        expect(result.content[0].type).toBe('text');

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.status).toBe('success');
        expect(parsed.diagramType).toBe('sequenceDiagram');
        expect(parsed.elementCount).toBe(6);
        expect(parsed.mermaidOutput).toBeDefined();
        expect(parsed.mermaidOutput).toContain('sequenceDiagram');
        expect(parsed.mermaidOutput).toContain('participant client as Client App');
        expect(parsed.mermaidOutput).toContain('participant api as API Gateway');
        expect(parsed.mermaidOutput).toContain('client->>api: POST /login');
        expect(parsed.mermaidOutput).toContain('api->>auth: Validate credentials');
        expect(parsed.mermaidOutput).toContain('auth-->>api: JWT token');
      });
    });

    describe('State Machine Diagram', () => {
      it('should process stateMachine with states and transitions', () => {
        const input = {
          operation: 'create',
          diagramId: 'order-lifecycle-001',
          diagramType: 'stateMachine',
          iteration: 0,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'pending',
              type: 'node',
              label: 'Pending Payment',
              properties: { isStart: true }
            },
            {
              id: 'paid',
              type: 'node',
              label: 'Payment Confirmed',
              properties: {}
            },
            {
              id: 'delivered',
              type: 'node',
              label: 'Delivered',
              properties: { isEnd: true }
            },
            {
              id: 'trans-1',
              type: 'edge',
              label: 'payment received',
              source: 'pending',
              target: 'paid',
              properties: {}
            },
            {
              id: 'trans-2',
              type: 'edge',
              label: 'order fulfilled',
              source: 'paid',
              target: 'delivered',
              properties: {}
            }
          ]
        };

        const result = mapServer.processVisualReasoning(input);
        expect(result).toBeDefined();

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.status).toBe('success');
        expect(parsed.diagramType).toBe('stateMachine');
        expect(parsed.elementCount).toBe(5);
        expect(parsed.mermaidOutput).toBeDefined();
        expect(parsed.mermaidOutput).toContain('stateDiagram-v2');
        expect(parsed.mermaidOutput).toContain('[*] --> pending');
        expect(parsed.mermaidOutput).toContain('pending --> paid: payment received');
        expect(parsed.mermaidOutput).toContain('paid --> delivered: order fulfilled');
        expect(parsed.mermaidOutput).toContain('delivered --> [*]');
      });
    });

    describe('Entity-Relationship Diagram', () => {
      it('should process erDiagram with entities and relationships', () => {
        const input = {
          operation: 'create',
          diagramId: 'user-schema-001',
          diagramType: 'erDiagram',
          iteration: 0,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'User',
              type: 'node',
              label: 'User',
              properties: {
                attributes: [
                  { name: 'id', type: 'int', key: true },
                  { name: 'email', type: 'string' },
                  { name: 'name', type: 'string' }
                ]
              }
            },
            {
              id: 'Order',
              type: 'node',
              label: 'Order',
              properties: {
                attributes: [
                  { name: 'id', type: 'int', key: true },
                  { name: 'user_id', type: 'int' },
                  { name: 'total', type: 'decimal' }
                ]
              }
            },
            {
              id: 'rel-1',
              type: 'edge',
              label: 'places',
              source: 'User',
              target: 'Order',
              properties: { cardinality: '||--o{' }
            }
          ]
        };

        const result = mapServer.processVisualReasoning(input);
        expect(result).toBeDefined();

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.status).toBe('success');
        expect(parsed.diagramType).toBe('erDiagram');
        expect(parsed.elementCount).toBe(3);
        expect(parsed.mermaidOutput).toBeDefined();
        expect(parsed.mermaidOutput).toContain('erDiagram');
        expect(parsed.mermaidOutput).toContain('User {');
        expect(parsed.mermaidOutput).toContain('int id PK');
        expect(parsed.mermaidOutput).toContain('string email');
        expect(parsed.mermaidOutput).toContain('Order {');
        expect(parsed.mermaidOutput).toContain('int user_id');
        expect(parsed.mermaidOutput).toContain('decimal total');
        expect(parsed.mermaidOutput).toContain('User ||--o{ Order : places');
      });
    });

    describe('Mind Map Diagram', () => {
      it('should process mindMap with hierarchical structure', () => {
        const input = {
          operation: 'create',
          diagramId: 'feature-brainstorm-001',
          diagramType: 'mindMap',
          iteration: 0,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'mobile-app',
              type: 'node',
              label: 'Mobile App v2.0',
              properties: { isRoot: true, shape: 'circle' },
              contains: ['auth', 'social']
            },
            {
              id: 'auth',
              type: 'node',
              label: 'Authentication',
              properties: { shape: 'square' },
              contains: ['biometric', 'sso']
            },
            {
              id: 'biometric',
              type: 'node',
              label: 'Biometric Login',
              properties: {}
            },
            {
              id: 'sso',
              type: 'node',
              label: 'SSO Integration',
              properties: {}
            },
            {
              id: 'social',
              type: 'node',
              label: 'Social Features',
              properties: { shape: 'square' },
              contains: ['sharing']
            },
            {
              id: 'sharing',
              type: 'node',
              label: 'Content Sharing',
              properties: {}
            }
          ]
        };

        const result = mapServer.processVisualReasoning(input);
        expect(result).toBeDefined();

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.status).toBe('success');
        expect(parsed.diagramType).toBe('mindMap');
        expect(parsed.elementCount).toBe(6);
        expect(parsed.mermaidOutput).toBeDefined();
        expect(parsed.mermaidOutput).toContain('mindmap');
        expect(parsed.mermaidOutput).toContain('((Mobile App v2.0))');
        expect(parsed.mermaidOutput).toContain('[Authentication]');
        expect(parsed.mermaidOutput).toContain('Biometric Login');
        expect(parsed.mermaidOutput).toContain('SSO Integration');
        expect(parsed.mermaidOutput).toContain('[Social Features]');
        expect(parsed.mermaidOutput).toContain('Content Sharing');
      });
    });

    describe('Context Diagram (C4)', () => {
      it('should process contextDiagram with C4 syntax', () => {
        const input = {
          operation: 'create',
          diagramId: 'system-context-001',
          diagramType: 'contextDiagram',
          iteration: 0,
          nextOperationNeeded: false,
          elements: [
            {
              id: 'customer',
              type: 'node',
              label: 'Customer',
              properties: {
                nodeType: 'Person',
                description: 'End user of the e-commerce platform'
              }
            },
            {
              id: 'ecommerce',
              type: 'node',
              label: 'E-Commerce Platform',
              properties: {
                nodeType: 'System',
                description: 'Main application handling orders'
              }
            },
            {
              id: 'payment',
              type: 'node',
              label: 'Payment Gateway',
              properties: {
                nodeType: 'System_Ext',
                description: 'External payment processing'
              }
            },
            {
              id: 'rel-1',
              type: 'edge',
              label: 'Browse & purchase products',
              source: 'customer',
              target: 'ecommerce',
              properties: { technology: 'HTTPS/REST' }
            },
            {
              id: 'rel-2',
              type: 'edge',
              label: 'Process payments',
              source: 'ecommerce',
              target: 'payment',
              properties: { technology: 'API' }
            }
          ]
        };

        const result = mapServer.processVisualReasoning(input);
        expect(result).toBeDefined();

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.status).toBe('success');
        expect(parsed.diagramType).toBe('contextDiagram');
        expect(parsed.elementCount).toBe(5);
        expect(parsed.mermaidOutput).toBeDefined();
        expect(parsed.mermaidOutput).toContain('C4Context');
        expect(parsed.mermaidOutput).toContain('Person(customer, "Customer", "End user of the e-commerce platform")');
        expect(parsed.mermaidOutput).toContain('System(ecommerce, "E-Commerce Platform", "Main application handling orders")');
        expect(parsed.mermaidOutput).toContain('System_Ext(payment, "Payment Gateway", "External payment processing")');
        expect(parsed.mermaidOutput).toContain('Rel(customer, ecommerce, "Browse & purchase products", "HTTPS/REST")');
        expect(parsed.mermaidOutput).toContain('Rel(ecommerce, payment, "Process payments", "API")');
      });
    });

    describe('Mermaid Output Validation', () => {
      it('should generate valid Mermaid syntax for all new diagram types', () => {
        const diagramTypes = [
          'sequenceDiagram',
          'stateMachine',
          'erDiagram',
          'mindMap',
          'contextDiagram'
        ];

        diagramTypes.forEach(diagramType => {
          const input = {
            operation: 'create',
            diagramId: `test-${diagramType}-001`,
            diagramType: diagramType,
            iteration: 0,
            nextOperationNeeded: false,
            elements: [
              {
                id: 'node1',
                type: 'node',
                label: 'Test Node',
                properties: {}
              }
            ]
          };

          const result = mapServer.processVisualReasoning(input);
          const parsed = JSON.parse(result.content[0].text);

          expect(parsed.status).toBe('success');
          expect(parsed.diagramType).toBe(diagramType);
          expect(parsed.mermaidOutput).toBeDefined();
          expect(parsed.mermaidOutput.length).toBeGreaterThan(0);

          // Verify Mermaid output starts with expected diagram type declaration
          const mermaidKeywords = {
            sequenceDiagram: 'sequenceDiagram',
            stateMachine: 'stateDiagram-v2',
            erDiagram: 'erDiagram',
            mindMap: 'mindmap',
            contextDiagram: 'C4Context'
          };

          expect(parsed.mermaidOutput).toContain(mermaidKeywords[diagramType as keyof typeof mermaidKeywords]);
        });
      });
    });
  });
});
